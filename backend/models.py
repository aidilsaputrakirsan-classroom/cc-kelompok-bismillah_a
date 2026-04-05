"""
LaporIn ITK — SQLAlchemy Models
Sistem Pelaporan Institut Teknologi Kalimantan
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text,
    Boolean, Date, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


# =========================
# 1. USERS
# =========================
class User(Base):
    """Model untuk tabel 'users'. Menyimpan data pelapor dan admin."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(Text, nullable=False)
    role = Column(String(20), default="user")       # user / admin
    no_hp = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    reports = relationship("Report", back_populates="user", foreign_keys="Report.user_id")
    comments = relationship("Comment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


# =========================
# 2. CATEGORIES
# =========================
class Category(Base):
    """Model untuk tabel 'categories'. Jenis laporan: kehilangan, fasilitas, perundungan."""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama_kategori = Column(String(50), nullable=False, unique=True)

    # Relationships
    reports = relationship("Report", back_populates="category")


# =========================
# 3. REPORTS
# =========================
class Report(Base):
    """Model utama untuk laporan. Inti dari sistem LaporIn ITK."""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
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
    user = relationship("User", back_populates="reports", foreign_keys=[user_id])
    category = relationship("Category", back_populates="reports")
    locations = relationship("ReportLocation", back_populates="report", cascade="all, delete-orphan")
    attachments = relationship("ReportAttachment", back_populates="report", cascade="all, delete-orphan")
    status_logs = relationship("ReportStatusLog", back_populates="report", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="report", cascade="all, delete-orphan")
    assignments = relationship("ReportAssignment", back_populates="report", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="report", cascade="all, delete-orphan")


# =========================
# 4. REPORT LOCATIONS (TRACKING)
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

    # Relationships
    report = relationship("Report", back_populates="locations")


# =========================
# 5. ATTACHMENTS
# =========================
class ReportAttachment(Base):
    """Lampiran bukti laporan (foto/video). Menyimpan path file."""
    __tablename__ = "report_attachments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    file_path = Column(Text, nullable=False)
    file_type = Column(String(50), nullable=True)   # image / video
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    report = relationship("Report", back_populates="attachments")


# =========================
# 6. STATUS LOGS
# =========================
class ReportStatusLog(Base):
    """Log perubahan status laporan. Mencatat siapa yang ubah dan kapan."""
    __tablename__ = "report_status_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    status = Column(String(20), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    catatan = Column(Text, nullable=True)

    # Relationships
    report = relationship("Report", back_populates="status_logs")
    changed_by_user = relationship("User", foreign_keys=[changed_by])


# =========================
# 7. COMMENTS
# =========================
class Comment(Base):
    """Komentar / chat dalam laporan antara user dan admin."""
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pesan = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    report = relationship("Report", back_populates="comments")
    user = relationship("User", back_populates="comments")


# =========================
# 8. NOTIFICATIONS
# =========================
class Notification(Base):
    """Notifikasi untuk user: update status laporan, balasan admin."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pesan = Column(Text, nullable=False)
    status_baca = Column(String(10), default="unread")  # unread / read
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")


# =========================
# 9. FEEDBACK
# =========================
class Feedback(Base):
    """Rating dan komentar feedback setelah laporan selesai."""
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    rating = Column(Integer, nullable=False)    # 1-5
    komentar = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    report = relationship("Report", back_populates="feedbacks")


# =========================
# 10. UNITS
# =========================
class Unit(Base):
    """Unit yang menangani laporan: Sarpras, Keamanan, BK, dll."""
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama_unit = Column(String(100), nullable=False, unique=True)

    # Relationships
    assignments = relationship("ReportAssignment", back_populates="unit")


# =========================
# 11. ASSIGNMENTS
# =========================
class ReportAssignment(Base):
    """Penugasan laporan ke unit tertentu oleh admin."""
    __tablename__ = "report_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    report = relationship("Report", back_populates="assignments")
    unit = relationship("Unit", back_populates="assignments")