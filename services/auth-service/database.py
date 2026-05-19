"""
Database connection for Auth Service.
Microservice terpisah — menggunakan auth_db sendiri (database per service pattern).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5433/auth_db"
)

# Support SQLite untuk testing lokal
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency injection: buka session saat request masuk, tutup saat selesai."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
