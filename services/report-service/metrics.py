"""
Simple In-Memory Metrics Collector — LaporIn ITK.
Mengumpulkan metrics dasar: request count, error count, latency.

Dilengkapi dengan:
- Sliding window error rate (1 menit terakhir) untuk error alerting
- check_and_alert(): log CRITICAL + alert=true jika error rate > 10% dalam 1 menit

Digunakan oleh: auth-service, report-service
"""
import time
import logging
import threading
from collections import defaultdict, deque


# =====================
# ALERT CONFIG
# =====================
ALERT_ERROR_RATE_THRESHOLD = 10.0   # Alert jika error rate > 10% dalam window
ALERT_WINDOW_SECONDS       = 60     # Window waktu: 1 menit terakhir
ALERT_COOLDOWN_SECONDS     = 30     # Jeda minimum antar alert (hindari spam)
ALERT_MIN_REQUESTS         = 5      # Butuh minimal 5 request dalam window sebelum alert


class MetricsCollector:
    """Thread-safe metrics collector dengan sliding window error alerting."""

    def __init__(self):
        self._lock = threading.Lock()
        self.start_time = time.time()

        # ── Counters total (keseluruhan uptime) ──
        self.request_count = 0
        self.error_count   = 0           # 4xx + 5xx
        self.status_counts = defaultdict(int)

        # ── Latency tracking (last 1000 requests) ──
        self.latencies = []
        self.max_latency_samples = 1000

        # ── Per-endpoint stats ──
        self.endpoint_stats = defaultdict(lambda: {
            "count": 0,
            "errors": 0,
            "total_latency_ms": 0,
        })

        # ── Sliding window untuk error alerting ──
        # Setiap entry: (timestamp_float, is_error: bool)
        self._window: deque = deque()

        # ── Alert state ──
        self._last_alert_time: float = 0.0

    # ------------------------------------------------------------------
    # RECORD
    # ------------------------------------------------------------------

    def record_request(self, method: str, path: str, status_code: int, duration_ms: float):
        """Catat satu request ke semua counters + sliding window."""
        is_error = status_code >= 400
        now = time.time()

        with self._lock:
            # Total counters
            self.request_count += 1
            self.status_counts[status_code] += 1
            if is_error:
                self.error_count += 1

            # Latency
            self.latencies.append(duration_ms)
            if len(self.latencies) > self.max_latency_samples:
                self.latencies.pop(0)

            # Per-endpoint
            key = f"{method} {path}"
            self.endpoint_stats[key]["count"] += 1
            self.endpoint_stats[key]["total_latency_ms"] += duration_ms
            if is_error:
                self.endpoint_stats[key]["errors"] += 1

            # Sliding window — simpan entry baru, hapus yang sudah expired
            self._window.append((now, is_error))
            cutoff = now - ALERT_WINDOW_SECONDS
            while self._window and self._window[0][0] < cutoff:
                self._window.popleft()

    # ------------------------------------------------------------------
    # ALERT CHECK
    # ------------------------------------------------------------------

    def get_recent_error_rate(self) -> dict:
        """
        Hitung error rate dalam ALERT_WINDOW_SECONDS terakhir.
        Returns dict: {total, errors, error_rate_percent}
        """
        now = time.time()
        cutoff = now - ALERT_WINDOW_SECONDS

        with self._lock:
            # Bersihkan entry expired
            while self._window and self._window[0][0] < cutoff:
                self._window.popleft()

            window_list = list(self._window)

        total  = len(window_list)
        errors = sum(1 for _, is_err in window_list if is_err)
        rate   = round(errors / total * 100, 2) if total > 0 else 0.0

        return {
            "window_seconds": ALERT_WINDOW_SECONDS,
            "total_requests": total,
            "error_count": errors,
            "error_rate_percent": rate,
        }

    def check_and_alert(self, logger: logging.Logger) -> bool:
        """
        Cek apakah error rate 1 menit terakhir melebihi threshold (10%).
        Jika ya: log CRITICAL dengan field alert=True.
        Gunakan cooldown agar tidak spam.

        Returns True jika alert difire, False jika tidak.
        """
        now = time.time()

        # Cooldown — jangan alert terlalu sering
        with self._lock:
            last_alert = self._last_alert_time

        if now - last_alert < ALERT_COOLDOWN_SECONDS:
            return False

        recent = self.get_recent_error_rate()

        # Butuh minimal N request agar tidak alert saat traffic sangat rendah
        if recent["total_requests"] < ALERT_MIN_REQUESTS:
            return False

        if recent["error_rate_percent"] > ALERT_ERROR_RATE_THRESHOLD:
            with self._lock:
                self._last_alert_time = now

            logger.critical(
                f"[ALERT] Error rate tinggi: {recent['error_rate_percent']}% "
                f"({recent['error_count']}/{recent['total_requests']} request "
                f"dalam {ALERT_WINDOW_SECONDS}s terakhir) — melebihi threshold {ALERT_ERROR_RATE_THRESHOLD}%",
                extra={
                    "alert": True,
                    "alert_type": "high_error_rate",
                    "error_rate_percent": recent["error_rate_percent"],
                    "error_count": recent["error_count"],
                    "total_requests_in_window": recent["total_requests"],
                    "window_seconds": ALERT_WINDOW_SECONDS,
                    "threshold_percent": ALERT_ERROR_RATE_THRESHOLD,
                },
            )
            return True

        return False

    # ------------------------------------------------------------------
    # GET METRICS
    # ------------------------------------------------------------------

    def get_metrics(self) -> dict:
        """Return snapshot metrics lengkap termasuk recent error rate."""
        with self._lock:
            uptime     = round(time.time() - self.start_time, 1)
            error_rate = (
                round(self.error_count / self.request_count * 100, 2)
                if self.request_count > 0 else 0
            )

            # Latency percentiles
            latency_stats = {}
            if self.latencies:
                sorted_lat = sorted(self.latencies)
                n = len(sorted_lat)
                latency_stats = {
                    "p50_ms": round(sorted_lat[int(n * 0.50)], 2),
                    "p95_ms": round(sorted_lat[int(n * 0.95)], 2),
                    "p99_ms": round(sorted_lat[min(int(n * 0.99), n - 1)], 2),
                    "avg_ms": round(sum(sorted_lat) / n, 2),
                }

            # Per-endpoint stats
            endpoints = {}
            for key, stats in self.endpoint_stats.items():
                avg_lat = (
                    round(stats["total_latency_ms"] / stats["count"], 2)
                    if stats["count"] > 0 else 0
                )
                endpoints[key] = {
                    "count": stats["count"],
                    "errors": stats["errors"],
                    "avg_latency_ms": avg_lat,
                }

        # Recent error rate (1 menit) — panggil di luar lock utama
        recent = self.get_recent_error_rate()

        return {
            "uptime_seconds": uptime,
            "total_requests": self.request_count,
            "total_errors": self.error_count,
            "error_rate_percent": error_rate,
            "status_codes": dict(self.status_counts),
            "latency": latency_stats,
            "endpoints": endpoints,
            # Field baru: error rate 1 menit terakhir
            "recent_1min": {
                "total_requests": recent["total_requests"],
                "error_count": recent["error_count"],
                "error_rate_percent": recent["error_rate_percent"],
                "alert_threshold_percent": ALERT_ERROR_RATE_THRESHOLD,
                "alert_triggered": recent["error_rate_percent"] > ALERT_ERROR_RATE_THRESHOLD
                                   and recent["total_requests"] >= ALERT_MIN_REQUESTS,
            },
        }

    def reset(self):
        """Reset semua metrics dan window."""
        with self._lock:
            self.request_count = 0
            self.error_count   = 0
            self.status_counts.clear()
            self.latencies.clear()
            self.endpoint_stats.clear()
            self._window.clear()
            self._last_alert_time = 0.0


# Singleton instance — satu per process/service
metrics = MetricsCollector()
