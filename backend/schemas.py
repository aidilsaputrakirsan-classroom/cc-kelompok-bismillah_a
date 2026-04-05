"""
LaporIn ITK — Pydantic Schemas
Validasi data request & format response API
"""

import re
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


# ============================================================
# UTILITY
# ============================================================

EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$")


def normalize_and_validate_email(email: str) -> str:
    """Normalisasi dan validasi format email menggunakan regex."""
    normalized = email.strip().lower()
    if not EMAIL_PATTERN.fullmatch(normalized):
        raise ValueError("Format email tidak valid. Contoh: user@student.itk.ac.id")
    return normalized


# ============================================================
# AUTH SCHEMAS
# ============================================================

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


# ============================================================
# CATEGORY SCHEMAS
# ============================================================

class CategoryResponse(BaseModel):
    """Schema untuk kategori laporan."""
    id: int
    nama_kategori: str

    class Config:
        from_attributes = True


# ============================================================
# UNIT SCHEMAS
# ============================================================

class UnitResponse(BaseModel):
    """Schema untuk unit penanganan laporan."""
    id: int
    nama_unit: str

    class Config:
        from_attributes = True


# ============================================================
# REPORT SCHEMAS
# ============================================================

class ReportCreate(BaseModel):
    """Schema untuk membuat laporan baru."""
    judul: str = Field(..., min_length=5, max_length=255, examples=["Kehilangan Laptop di Perpustakaan"])
    deskripsi: str = Field(..., min_length=10, examples=["Laptop Asus warna hitam hilang pada hari Senin pukul 10.00"])
    kategori_id: int = Field(..., examples=[1])
    lokasi: Optional[str] = Field(None, examples=["Perpustakaan ITK Lantai 2"])
    latitude: Optional[float] = Field(None, examples=[-1.2654])
    longitude: Optional[float] = Field(None, examples=[116.8318])
    tanggal_kejadian: Optional[date] = Field(None, examples=["2026-04-01"])
    anonim: bool = Field(False, examples=[False])


class ReportUpdate(BaseModel):
    """Schema untuk update laporan (sebagian field, khusus admin)."""
    status: Optional[str] = Field(None, examples=["diproses"])
    prioritas: Optional[str] = Field(None, examples=["tinggi"])
    judul: Optional[str] = Field(None, min_length=5, max_length=255)
    deskripsi: Optional[str] = Field(None, min_length=10)
    lokasi: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ReportLocationResponse(BaseModel):
    """Schema untuk titik tracking lokasi."""
    id: int
    report_id: int
    latitude: float
    longitude: float
    keterangan: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReportAttachmentResponse(BaseModel):
    """Schema untuk lampiran laporan."""
    id: int
    report_id: int
    file_path: str
    file_type: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    """Schema untuk response laporan lengkap."""
    id: int
    user_id: int
    judul: str
    deskripsi: str
    kategori_id: int
    lokasi: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    tanggal_kejadian: Optional[date] = None
    status: str
    prioritas: str
    anonim: bool
    is_sensitive: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Nested
    category: Optional[CategoryResponse] = None
    locations: List[ReportLocationResponse] = []
    attachments: List[ReportAttachmentResponse] = []

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    """Schema untuk response list laporan dengan metadata."""
    total: int
    reports: List[ReportResponse]


# ============================================================
# REPORT LOCATION (TRACKING) SCHEMAS
# ============================================================

class ReportLocationCreate(BaseModel):
    """Schema untuk tambah titik tracking lokasi."""
    latitude: float = Field(..., examples=[-1.2700])
    longitude: float = Field(..., examples=[116.8400])
    keterangan: Optional[str] = Field(None, examples=["Barang terlihat di dekat kantin"])


# ============================================================
# COMMENT SCHEMAS
# ============================================================

class CommentCreate(BaseModel):
    """Schema untuk membuat komentar baru dalam laporan."""
    pesan: str = Field(..., min_length=1, max_length=1000, examples=["Laporan sedang diproses oleh tim keamanan."])


class CommentResponse(BaseModel):
    """Schema untuk response komentar."""
    id: int
    report_id: int
    user_id: int
    pesan: str
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ============================================================
# NOTIFICATION SCHEMAS
# ============================================================

class NotificationResponse(BaseModel):
    """Schema untuk response notifikasi."""
    id: int
    user_id: int
    pesan: str
    status_baca: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# FEEDBACK SCHEMAS
# ============================================================

class FeedbackCreate(BaseModel):
    """Schema untuk submit feedback setelah laporan selesai."""
    report_id: int = Field(..., examples=[1])
    rating: int = Field(..., ge=1, le=5, examples=[5])
    komentar: Optional[str] = Field(None, max_length=500, examples=["Terima kasih, laporan ditangani dengan cepat!"])


class FeedbackResponse(BaseModel):
    """Schema untuk response feedback."""
    id: int
    report_id: int
    rating: int
    komentar: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# ASSIGNMENT SCHEMAS
# ============================================================

class AssignmentCreate(BaseModel):
    """Schema untuk menugaskan laporan ke unit."""
    unit_id: int = Field(..., examples=[1])


class AssignmentResponse(BaseModel):
    """Schema untuk response penugasan."""
    id: int
    report_id: int
    unit_id: int
    assigned_at: datetime
    unit: Optional[UnitResponse] = None

    class Config:
        from_attributes = True


# ============================================================
# ADMIN DASHBOARD SCHEMAS
# ============================================================

class DashboardStats(BaseModel):
    """Schema untuk statistik dashboard admin."""
    total_laporan: int
    menunggu: int
    diproses: int
    selesai: int
    kategori_stats: dict
    prioritas_stats: dict


# ============================================================
# STATUS LOG SCHEMAS
# ============================================================

class StatusLogResponse(BaseModel):
    """Schema untuk response log perubahan status."""
    id: int
    report_id: int
    status: str
    changed_by: Optional[int] = None
    changed_at: datetime
    catatan: Optional[str] = None

    class Config:
        from_attributes = True