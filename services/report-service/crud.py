"""
Report Service — CRUD Operations
Business logic layer: semua operasi database untuk laporan.
Disesuaikan dari backend/crud.py — TANPA auth CRUD (sudah di Auth Service).
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from models import (
    Category, Report, ReportLocation, ReportAttachment,
    ReportStatusLog, Comment, Notification, Feedback, Unit,
    ReportAssignment
)
from schemas import (
    ReportCreate, ReportUpdate, ReportLocationCreate,
    CommentCreate, FeedbackCreate, AssignmentCreate
)


# ============================================================
# CATEGORY CRUD
# ============================================================

def get_categories(db: Session) -> list[Category]:
    """Ambil semua kategori laporan."""
    return db.query(Category).order_by(Category.id).all()


def get_category(db: Session, kategori_id: int) -> Category | None:
    return db.query(Category).filter(Category.id == kategori_id).first()


def seed_categories(db: Session):
    """Seed data kategori awal jika belum ada."""
    if db.query(Category).count() == 0:
        categories = [
            Category(nama_kategori="Kehilangan"),
            Category(nama_kategori="Fasilitas"),
            Category(nama_kategori="Perundungan"),
        ]
        db.add_all(categories)
        db.commit()


# ============================================================
# UNIT CRUD
# ============================================================

def get_units(db: Session) -> list[Unit]:
    """Ambil semua unit penanganan."""
    return db.query(Unit).order_by(Unit.id).all()


def seed_units(db: Session):
    """Seed data unit awal jika belum ada."""
    if db.query(Unit).count() == 0:
        units = [
            Unit(nama_unit="Sarpras (Sarana & Prasarana)"),
            Unit(nama_unit="Keamanan Kampus"),
            Unit(nama_unit="Bimbingan Konseling (BK)"),
            Unit(nama_unit="Kemahasiswaan"),
            Unit(nama_unit="Teknologi Informasi (TI)"),
        ]
        db.add_all(units)
        db.commit()


# ============================================================
# REPORT CRUD
# ============================================================

def create_report(db: Session, report_data: ReportCreate, user_id: int) -> Report:
    """
    Buat laporan baru.
    - Jika kategori Perundungan → otomatis is_sensitive=True dan anonim=True
    """
    category = get_category(db, report_data.kategori_id)
    is_sensitive = False
    anonim = report_data.anonim

    if category and category.nama_kategori.lower() == "perundungan":
        is_sensitive = True
        anonim = True

    report = Report(
        user_id=user_id,
        judul=report_data.judul,
        deskripsi=report_data.deskripsi,
        kategori_id=report_data.kategori_id,
        lokasi=report_data.lokasi,
        latitude=report_data.latitude,
        longitude=report_data.longitude,
        tanggal_kejadian=report_data.tanggal_kejadian,
        anonim=anonim,
        is_sensitive=is_sensitive,
        status="menunggu",
        prioritas="sedang",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Log pembuatan laporan
    log = ReportStatusLog(
        report_id=report.id,
        status="menunggu",
        changed_by=user_id,
        catatan="Laporan baru dibuat",
    )
    db.add(log)

    # Kirim notifikasi ke user
    notif = Notification(
        user_id=user_id,
        pesan=f"Laporan '{report_data.judul}' berhasil dibuat dan sedang menunggu proses.",
    )
    db.add(notif)
    db.commit()

    return db.query(Report).options(
        joinedload(Report.category),
        joinedload(Report.locations),
        joinedload(Report.attachments),
    ).filter(Report.id == report.id).first()


def get_reports(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    user_id: int | None = None,
    status: str | None = None,
    kategori_id: int | None = None,
    kategori_nama: str | None = None,
    search: str | None = None,
    is_admin: bool = False,
):
    """
    Ambil daftar laporan dengan filter dan pagination.
    - user biasa hanya bisa lihat laporannya sendiri
    - admin bisa lihat semua
    """
    query = db.query(Report).options(
        joinedload(Report.category),
        joinedload(Report.locations),
        joinedload(Report.attachments),
    )

    if not is_admin and user_id:
        query = query.filter(Report.user_id == user_id)

    if status:
        query = query.filter(Report.status == status)

    if kategori_id:
        query = query.filter(Report.kategori_id == kategori_id)

    if kategori_nama:
        query = query.join(Report.category).filter(
            Category.nama_kategori.ilike(kategori_nama)
        )

    if search:
        query = query.filter(
            or_(
                Report.judul.ilike(f"%{search}%"),
                Report.deskripsi.ilike(f"%{search}%"),
                Report.lokasi.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()

    return {"total": total, "reports": reports}


def get_report(db: Session, report_id: int) -> Report | None:
    """Ambil satu laporan berdasarkan ID dengan semua relasi."""
    return db.query(Report).options(
        joinedload(Report.category),
        joinedload(Report.locations),
        joinedload(Report.attachments),
    ).filter(Report.id == report_id).first()


def get_map_reports(
    db: Session,
    status: str | None = None,
    kategori_id: int | None = None,
) -> list[dict]:
    """
    Ambil semua laporan yang punya koordinat untuk peta sebaran.
    Return data ringan (tanpa info user demi privasi).
    """
    query = db.query(Report).options(
        joinedload(Report.category),
    ).filter(
        Report.latitude.isnot(None),
        Report.longitude.isnot(None),
    )

    if status:
        query = query.filter(Report.status == status)
    if kategori_id:
        query = query.filter(Report.kategori_id == kategori_id)

    reports = query.order_by(Report.created_at.desc()).all()

    return [
        {
            "id": r.id,
            "judul": r.judul,
            "lokasi": r.lokasi,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "kategori_id": r.kategori_id,
            "kategori_nama": r.category.nama_kategori if r.category else "Lainnya",
            "status": r.status,
            "prioritas": r.prioritas,
            "tanggal_kejadian": r.tanggal_kejadian,
            "created_at": r.created_at,
        }
        for r in reports
    ]


def update_report(
    db: Session,
    report_id: int,
    report_data: ReportUpdate,
    changed_by: int | None = None,
) -> Report | None:
    """
    Update status/prioritas/detail laporan.
    Jika status berubah → catat di status_log + kirim notifikasi.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return None

    old_status = report.status
    update_data = report_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(report, field, value)

    db.commit()
    db.refresh(report)

    new_status = update_data.get("status")
    if new_status and new_status != old_status:
        log = ReportStatusLog(
            report_id=report_id,
            status=new_status,
            changed_by=changed_by,
            catatan=f"Status diubah dari '{old_status}' menjadi '{new_status}'",
        )
        db.add(log)

        status_label = {
            "menunggu": "sedang menunggu",
            "diproses": "sedang diproses",
            "selesai": "telah selesai",
        }.get(new_status, new_status)
        notif = Notification(
            user_id=report.user_id,
            pesan=f"Status laporan '{report.judul}' {status_label}.",
        )
        db.add(notif)
        db.commit()

    return db.query(Report).options(
        joinedload(Report.category),
        joinedload(Report.locations),
        joinedload(Report.attachments),
    ).filter(Report.id == report_id).first()


def update_report_by_user(
    db: Session,
    report_id: int,
    user_id: int,
    report_data,
) -> tuple:
    """
    User dapat edit laporan miliknya sendiri.
    Hanya diizinkan jika status laporan masih 'menunggu'.
    """
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == user_id,
    ).first()

    if not report:
        return None, "not_found"
    if report.status != "menunggu":
        return None, "not_allowed"

    update_data = report_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(report, field, value)

    db.commit()
    db.refresh(report)

    return db.query(Report).options(
        joinedload(Report.category),
        joinedload(Report.locations),
        joinedload(Report.attachments),
    ).filter(Report.id == report_id).first(), None


def delete_report(db: Session, report_id: int, user_id: int) -> tuple:
    """
    User dapat hapus laporan miliknya sendiri.
    Hanya diizinkan jika status laporan masih 'menunggu'.
    """
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == user_id,
    ).first()

    if not report:
        return False, "not_found"
    if report.status != "menunggu":
        return False, "not_allowed"

    db.delete(report)
    db.commit()
    return True, None


# ============================================================
# REPORT LOCATION (TRACKING) CRUD
# ============================================================

def add_report_location(
    db: Session,
    report_id: int,
    location_data: ReportLocationCreate,
) -> ReportLocation:
    """Tambah titik tracking lokasi ke laporan."""
    loc = ReportLocation(
        report_id=report_id,
        latitude=location_data.latitude,
        longitude=location_data.longitude,
        keterangan=location_data.keterangan,
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


# ============================================================
# COMMENT CRUD
# ============================================================

def create_comment(
    db: Session,
    report_id: int,
    user_id: int,
    comment_data: CommentCreate,
) -> Comment:
    """Tambah komentar ke laporan."""
    comment = Comment(
        report_id=report_id,
        user_id=user_id,
        pesan=comment_data.pesan,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    report = db.query(Report).filter(Report.id == report_id).first()
    if report and report.user_id != user_id:
        notif = Notification(
            user_id=report.user_id,
            pesan=f"Ada balasan baru pada laporan '{report.judul}'.",
        )
        db.add(notif)
        db.commit()

    return comment


def get_comments(db: Session, report_id: int) -> list[Comment]:
    """Ambil semua komentar dalam satu laporan."""
    return (
        db.query(Comment)
        .filter(Comment.report_id == report_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


# ============================================================
# NOTIFICATION CRUD
# ============================================================

def get_notifications(db: Session, user_id: int, unread_only: bool = False) -> list[Notification]:
    """Ambil notifikasi user."""
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.status_baca == "unread")
    return query.order_by(Notification.created_at.desc()).limit(50).all()


def mark_notification_read(db: Session, notification_id: int, user_id: int) -> Notification | None:
    """Tandai notifikasi sebagai sudah dibaca."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id,
    ).first()
    if not notif:
        return None
    notif.status_baca = "read"
    db.commit()
    db.refresh(notif)
    return notif


# ============================================================
# FEEDBACK CRUD
# ============================================================

def create_feedback(db: Session, feedback_data: FeedbackCreate) -> Feedback:
    """Submit feedback setelah laporan selesai."""
    feedback = Feedback(
        report_id=feedback_data.report_id,
        rating=feedback_data.rating,
        komentar=feedback_data.komentar,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


# ============================================================
# ASSIGNMENT CRUD
# ============================================================

def assign_report(
    db: Session,
    report_id: int,
    assignment_data: AssignmentCreate,
    admin_id: int,
) -> ReportAssignment:
    """Tugaskan laporan ke unit tertentu."""
    assignment = ReportAssignment(
        report_id=report_id,
        unit_id=assignment_data.unit_id,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    report = db.query(Report).filter(Report.id == report_id).first()
    unit = db.query(Unit).filter(Unit.id == assignment_data.unit_id).first()
    if report and unit:
        notif = Notification(
            user_id=report.user_id,
            pesan=f"Laporan '{report.judul}' ditugaskan ke {unit.nama_unit}.",
        )
        db.add(notif)
        db.commit()

    return db.query(ReportAssignment).options(
        joinedload(ReportAssignment.unit)
    ).filter(ReportAssignment.id == assignment.id).first()


# ============================================================
# ADMIN DASHBOARD CRUD
# ============================================================

def get_dashboard_stats(db: Session) -> dict:
    """Ambil statistik dashboard untuk admin."""
    total = db.query(Report).count()
    menunggu = db.query(Report).filter(Report.status == "menunggu").count()
    diproses = db.query(Report).filter(Report.status == "diproses").count()
    selesai = db.query(Report).filter(Report.status == "selesai").count()

    kategori_stats = {}
    for cat in db.query(Category).all():
        count = db.query(Report).filter(Report.kategori_id == cat.id).count()
        kategori_stats[cat.nama_kategori] = count

    prioritas_stats = {
        "tinggi": db.query(Report).filter(Report.prioritas == "tinggi").count(),
        "sedang": db.query(Report).filter(Report.prioritas == "sedang").count(),
        "rendah": db.query(Report).filter(Report.prioritas == "rendah").count(),
    }

    return {
        "total_laporan": total,
        "menunggu": menunggu,
        "diproses": diproses,
        "selesai": selesai,
        "kategori_stats": kategori_stats,
        "prioritas_stats": prioritas_stats,
    }
