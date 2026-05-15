"""
LaporIn ITK — Application Configuration
Membaca semua konfigurasi dari environment variables dengan fallback default values.
App tidak akan crash jika env var missing — semua punya safe defaults.
"""

import os
import logging
from dotenv import load_dotenv

# Load .env file sebagai fallback (tidak override env vars dari Docker/OS/CI)
load_dotenv(override=False)


class Settings:
    """
    Application settings — dibaca dari environment variables.

    Urutan prioritas (tertinggi ke terendah):
    1. Environment variable dari OS / Docker --env-file
    2. File .env (via python-dotenv)
    3. Default value di bawah ini (selalu ada → app tidak crash)
    """

    # ──────────────────────────────────────────────
    # ENVIRONMENT
    # ──────────────────────────────────────────────
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # True jika development, False jika production/staging
    DEBUG: bool = ENVIRONMENT == "development"

    # ──────────────────────────────────────────────
    # DATABASE
    # Default: SQLite lokal untuk development tanpa PostgreSQL
    # Production: postgresql://user:pass@host:5432/dbname
    # ──────────────────────────────────────────────
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./laporin_dev.db",   # fallback dev — tidak crash tanpa PostgreSQL
    )

    # ──────────────────────────────────────────────
    # JWT AUTHENTICATION
    # ──────────────────────────────────────────────
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-laporin-itk-GANTI-DI-PRODUCTION",  # fallback dev
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")  # 60 menit default
    )

    # ──────────────────────────────────────────────
    # CORS — pisahkan beberapa origin dengan koma
    # Dev:  http://localhost:5173,http://localhost:3000
    # Prod: https://laporin.itk.ac.id
    # ──────────────────────────────────────────────
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000",
        ).split(",")
        if origin.strip()
    ]

    # ──────────────────────────────────────────────
    # LOGGING
    # Dev: DEBUG (tampilkan semua log)
    # Prod: WARNING (hanya error & warning)
    # ──────────────────────────────────────────────
    LOG_LEVEL: str = os.getenv(
        "LOG_LEVEL",
        "DEBUG" if ENVIRONMENT == "development" else "WARNING",
    )

    # ──────────────────────────────────────────────
    # APP INFO
    # ──────────────────────────────────────────────
    APP_TITLE: str = "LaporIn ITK API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = (
        "**Sistem Pelaporan Institut Teknologi Kalimantan**\n\n"
        "API untuk mengelola laporan kehilangan, kerusakan fasilitas, "
        "dan perundungan di lingkungan ITK."
    )

    # ──────────────────────────────────────────────
    # DOCS — sembunyikan Swagger di production
    # ──────────────────────────────────────────────
    @property
    def docs_url(self) -> str | None:
        """Swagger UI hanya aktif di development."""
        return "/docs" if self.DEBUG else None

    @property
    def redoc_url(self) -> str | None:
        """ReDoc hanya aktif di development."""
        return "/redoc" if self.DEBUG else None

    def summary(self) -> dict:
        """Log summary konfigurasi saat startup (tanpa secrets)."""
        return {
            "environment": self.ENVIRONMENT,
            "debug": self.DEBUG,
            "log_level": self.LOG_LEVEL,
            "cors_origins": self.CORS_ORIGINS,
            "token_expire_minutes": self.ACCESS_TOKEN_EXPIRE_MINUTES,
            "docs_enabled": self.DEBUG,
            "database": self.DATABASE_URL.split("@")[-1]  # sembunyikan credentials
            if "@" in self.DATABASE_URL
            else self.DATABASE_URL.split("///")[-1],
        }


# Singleton — import dari mana saja, selalu instance yang sama
settings = Settings()

# Setup logging berdasarkan config
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger("laporin")
