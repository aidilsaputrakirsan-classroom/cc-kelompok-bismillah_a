"""
Models untuk Report Service — di report_db, BUKAN di auth_db.
Disesuaikan dari backend/models.py — semua model KECUALI User.

Catatan: owner_id / user_id bukan foreign key ke tabel users
(karena users ada di database berbeda — auth_db).
Ini hanya integer reference — konsistensi dijaga di level aplikasi.
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text,
    Boolean, Date, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


# =========================
# 1. CATEGORIES
# =========================
class Category(Base):
    """Jenis laporan: kehilangan, fasilitas, perundungan."""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama_kategori = Column(String(50), nullable=False, unique=True)

    # Relationships
    reports = relationship("Report", back_populates="category")


# =========================
# 2. REPORTS
# =========================
class Report(Base):
    """Model utama untuk laporan. Inti dari sistem LaporIn ITK."""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)  # Reference ke user di auth_db (BUKAN FK!)
    judul = Column(String(255), nullable=False)
    deskripsi = Column(Text, nullable=False)
    kategori_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    lokasi = Column(Text, nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    tanggal_kejadian = Column(Date, nullable=True)
    status = Column(String(20), default="menunggu")     # menunggu / diproses / selesai
    prioritas = Column(String(20), default="sedang")    # tinggi / sedang / rendah

    anonim = Column(Boolean, default=False)
    is_sensitive = Column(Boolean, default=False)        # khusus perundungan

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="reports")
    locations = relationship("ReportLocation", back_populates="report", cascade="all, delete-orphan")
    attachments = relationship("ReportAttachment", back_populates="report", cascade="all, delete-orphan")
    status_logs = relationship("ReportStatusLog", back_populates="report", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="report", cascade="all, delete-orphan")
    assignments = relationship("ReportAssignment", back_populates="report", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="report", cascade="all, delete-orphan")


# =========================
# 3. REPORT LOCATIONS (TRACKING)
# =========================
class ReportLocation(Base):
    """Tracking lokasi barang/kejadian. Khusus kategori Kehilangan."""
    __tablename__ = "report_locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    keterangan = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("Report", back_populates="locations")


# =========================
# 4. ATTACHMENTS
# =========================
class ReportAttachment(Base):
    """Lampiran bukti laporan (foto/video)."""
    __tablename__ = "report_attachments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    file_path = Column(Text, nullable=False)
    file_type = Column(String(50), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("Report", back_populates="attachments")


# =========================
# 5. STATUS LOGS
# =========================
class ReportStatusLog(Base):
    """Log perubahan status laporan."""
    __tablename__ = "report_status_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    status = Column(String(20), nullable=False)
    changed_by = Column(Integer, nullable=True)  # Reference ke user di auth_db (BUKAN FK!)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    catatan = Column(Text, nullable=True)

    report = relationship("Report", back_populates="status_logs")


# =========================
# 6. COMMENTS
# =========================
class Comment(Base):
    """Komentar / chat dalam laporan antara user dan admin."""
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    user_id = Column(Integer, nullable=False)  # Reference ke user di auth_db (BUKAN FK!)
    pesan = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("Report", back_populates="comments")


# =========================
# 7. NOTIFICATIONS
# =========================
class Notification(Base):
    """Notifikasi untuk user: update status laporan, balasan admin."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)  # Reference ke user di auth_db (BUKAN FK!)
    pesan = Column(Text, nullable=False)
    status_baca = Column(String(10), default="unread")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# =========================
# 8. FEEDBACK
# =========================
class Feedback(Base):
    """Rating dan komentar feedback setelah laporan selesai."""
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    komentar = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("Report", back_populates="feedbacks")


# =========================
# 9. UNITS
# =========================
class Unit(Base):
    """Unit yang menangani laporan: Sarpras, Keamanan, BK, dll."""
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama_unit = Column(String(100), nullable=False, unique=True)

    assignments = relationship("ReportAssignment", back_populates="unit")


# =========================
# 10. ASSIGNMENTS
# =========================
class ReportAssignment(Base):
    """Penugasan laporan ke unit tertentu oleh admin."""
    __tablename__ = "report_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("Report", back_populates="assignments")
    unit = relationship("Unit", back_populates="assignments")
