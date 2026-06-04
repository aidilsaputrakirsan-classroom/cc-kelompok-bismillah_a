"""
Pydantic schemas for Report Service.
Disesuaikan dari backend/schemas.py — semua schema KECUALI auth schemas.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


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


class ReportUserUpdate(BaseModel):
    """Schema untuk user mengedit laporan sendiri (hanya jika status 'menunggu')."""
    judul: Optional[str] = Field(None, min_length=5, max_length=255)
    deskripsi: Optional[str] = Field(None, min_length=10)
    lokasi: Optional[str] = None
    kategori_id: Optional[int] = None
    tanggal_kejadian: Optional[date] = None
    anonim: Optional[bool] = None


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
# MAP REPORT SCHEMAS
# ============================================================

class MapReportResponse(BaseModel):
    """Schema ringan untuk peta sebaran."""
    id: int
    judul: str
    lokasi: Optional[str] = None
    latitude: float
    longitude: float
    kategori_id: int
    kategori_nama: str
    status: str
    prioritas: str
    tanggal_kejadian: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


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
# REPORT STATS SCHEMAS (Lead Backend — Modul 12)
# ============================================================

class ReportStats(BaseModel):
    """
    Schema untuk statistik laporan.

    Mendukung dua mode (Modul 13 — Graceful Degradation):
    - Full mode (Auth UP): statistik laporan milik user yang login
    - Degraded mode (Auth DOWN): statistik agregat semua laporan, field degraded=True
    """
    total_laporan: int
    per_status: dict       # {"menunggu": int, "diproses": int, "selesai": int}
    per_kategori: dict     # {"Kehilangan": int, "Fasilitas": int, "Perundungan": int}
    per_prioritas: dict    # {"tinggi": int, "sedang": int, "rendah": int}
    laporan_terbaru: Optional[datetime]
    rata_rata_rating: Optional[float]
    # Graceful degradation fields (Modul 13)
    degraded: Optional[bool] = False
    degraded_reason: Optional[str] = None



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
