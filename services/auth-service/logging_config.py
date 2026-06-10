"""
Structured Logging Configuration — LaporIn ITK.
Menghasilkan JSON logs yang mudah di-parse oleh log aggregator.

Digunakan oleh: auth-service, report-service
"""
import json
import logging
import sys
import os
from datetime import datetime, timezone


SERVICE_NAME = os.getenv("SERVICE_NAME", "unknown-service")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


class JSONFormatter(logging.Formatter):
    """Format log sebagai JSON untuk structured logging."""

    def format(self, record):
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "service": SERVICE_NAME,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Tambah extra fields jika ada
        if hasattr(record, "correlation_id"):
            log_entry["correlation_id"] = record.correlation_id
        if hasattr(record, "method"):
            log_entry["method"] = record.method
        if hasattr(record, "path"):
            log_entry["path"] = record.path
        if hasattr(record, "status_code"):
            log_entry["status_code"] = record.status_code
        if hasattr(record, "duration_ms"):
            log_entry["duration_ms"] = record.duration_ms
        if hasattr(record, "user_id"):
            log_entry["user_id"] = record.user_id

        # ── Alert fields (Modul 14 — error alerting) ──
        if hasattr(record, "alert"):
            log_entry["alert"] = record.alert
        if hasattr(record, "alert_type"):
            log_entry["alert_type"] = record.alert_type
        if hasattr(record, "error_rate_percent"):
            log_entry["error_rate_percent"] = record.error_rate_percent
        if hasattr(record, "error_count"):
            log_entry["error_count"] = record.error_count
        if hasattr(record, "total_requests_in_window"):
            log_entry["total_requests_in_window"] = record.total_requests_in_window
        if hasattr(record, "window_seconds"):
            log_entry["window_seconds"] = record.window_seconds
        if hasattr(record, "threshold_percent"):
            log_entry["threshold_percent"] = record.threshold_percent

        # Tambah exception info jika ada
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def setup_logging():
    """Setup structured logging untuk service."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))

    # Hapus existing handlers
    root_logger.handlers.clear()

    # JSON handler ke stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root_logger.addHandler(handler)

    # Kurangi noise dari library
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    return root_logger
