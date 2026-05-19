"""
User model for Auth Service.
Disesuaikan dari backend/models.py — hanya model User yang relevan untuk auth.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """Model untuk tabel 'users' di auth_db."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(Text, nullable=False)
    role = Column(String(20), default="user")       # user / admin
    no_hp = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
