"""
Request Logging Middleware — LaporIn ITK.
Log setiap HTTP request dengan timing, status, dan correlation ID.
Sekaligus merekam metrics ke MetricsCollector.

Digunakan oleh: auth-service, report-service
"""
import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from metrics import metrics

logger = logging.getLogger(__name__)

# Path yang tidak perlu di-log (terlalu noisy)
SKIP_LOG_PATHS = {"/health", "/metrics"}


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware yang log setiap request/response dengan correlation ID dan metrics."""

    async def dispatch(self, request: Request, call_next):
        # Ambil atau generate correlation ID
        correlation_id = request.headers.get(
            "X-Correlation-ID",
            str(uuid.uuid4())[:12]
        )

        # Simpan di request state (bisa diakses di endpoint handler)
        request.state.correlation_id = correlation_id

        # Catat waktu mulai
        start_time = time.time()

        # Proses request
        try:
            response = await call_next(request)
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)

            # Rekam ke metrics sebagai error 500
            metrics.record_request(request.method, request.url.path, 500, duration_ms)

            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms,
                    "status_code": 500,
                },
            )
            raise

        # Hitung durasi
        duration_ms = round((time.time() - start_time) * 1000, 2)

        # Rekam metrics untuk semua request (termasuk health/metrics)
        metrics.record_request(
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )

        # ── Error alerting (Modul 14 — Lead Backend) ──
        # Fire CRITICAL log jika error rate 1 menit terakhir melebihi threshold 10%
        metrics.check_and_alert(logger)

        # Log request — skip health & metrics agar tidak terlalu noisy
        if request.url.path not in SKIP_LOG_PATHS:
            log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
            logger.log(
                log_level,
                f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)",
                extra={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                },
            )

        # Teruskan correlation ID di response header
        response.headers["X-Correlation-ID"] = correlation_id
        return response

