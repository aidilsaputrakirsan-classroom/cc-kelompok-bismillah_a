"""
Pydantic schemas for Auth Service.
Disesuaikan dari backend/schemas.py — hanya schema auth yang relevan.
"""
import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# Validasi pattern
EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$")


def normalize_and_validate_email(email: str) -> str:
    """Normalisasi dan validasi format email menggunakan regex."""
    normalized = email.strip().lower()
    if not EMAIL_PATTERN.fullmatch(normalized):
        raise ValueError("Format email tidak valid. Contoh: user@student.itk.ac.id")
    return normalized


class UserCreate(BaseModel):
    """Schema untuk registrasi user baru."""
    email: str = Field(..., min_length=6, max_length=255, examples=["user@student.itk.ac.id"])
    nama: str = Field(..., min_length=2, max_length=100, examples=["Aidil Saputra"])
    password: str = Field(..., min_length=8, max_length=64, examples=["Cloud@123"])
    no_hp: Optional[str] = Field(None, max_length=20, examples=["08123456789"])

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_and_validate_email(value)

    @field_validator("nama")
    @classmethod
    def validate_nama(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Nama minimal 2 karakter dan tidak boleh hanya spasi.")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not PASSWORD_PATTERN.fullmatch(value):
            raise ValueError(
                "Password harus 8-64 karakter dan mengandung huruf besar, huruf kecil, angka, serta simbol."
            )
        return value


class UserResponse(BaseModel):
    """Schema untuk response user (tanpa password)."""
    id: int
    email: str
    nama: str
    role: str
    no_hp: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schema untuk login request."""
    email: str = Field(..., min_length=6, max_length=255, examples=["user@student.itk.ac.id"])
    password: str = Field(..., examples=["Cloud@123"])

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_and_validate_email(value)


class TokenResponse(BaseModel):
    """Schema untuk response setelah login berhasil."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenVerifyResponse(BaseModel):
    """Schema untuk response verifikasi token — dipanggil oleh service lain."""
    user_id: int
    email: str
    nama: str
    role: str
