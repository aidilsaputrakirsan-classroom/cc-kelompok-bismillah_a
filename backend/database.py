"""
LaporIn ITK — Database Setup
Konfigurasi SQLAlchemy engine dan session menggunakan settings dari config.py.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import settings, logger

# ──────────────────────────────────────────────
# ENGINE
# Gunakan DATABASE_URL dari settings (sudah punya fallback SQLite)
# App tidak crash jika DATABASE_URL tidak dikonfigurasi
# ──────────────────────────────────────────────
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite butuh check_same_thread=False untuk FastAPI
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
)

logger.info(f"Database terhubung ke: {settings.summary()['database']}")

# ──────────────────────────────────────────────
# SESSION
# ──────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ──────────────────────────────────────────────
# BASE
# ──────────────────────────────────────────────
Base = declarative_base()


# ──────────────────────────────────────────────
# DEPENDENCY
# ──────────────────────────────────────────────
def get_db():
    """
    Dependency injection untuk FastAPI.
    Membuka session saat request masuk, menutup saat selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()