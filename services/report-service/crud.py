"""
Report Service — CRUD Operations
Business logic layer: semua operasi database untuk laporan.
Disesuaikan dari backend/crud.py — TANPA auth CRUD (sudah di Auth Service).
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func as sa_func

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


def get_report_stats(db: Session, user_id: int) -> dict:
    """
    Ambil statistik laporan milik user yang sedang login.

    Menghitung:
    - Total laporan user
    - Jumlah laporan per status (menunggu, diproses, selesai)
    - Jumlah laporan per kategori (Kehilangan, Fasilitas, Perundungan)
    - Jumlah laporan per prioritas (tinggi, sedang, rendah)
    - Tanggal laporan terbaru yang dibuat user
    - Rata-rata rating feedback dari laporan-laporan user

    Endpoint: GET /reports/stats
    Branch: feature/item-stats-service (Lead Backend — Modul 12)
    """
    # Total laporan milik user
    total = db.query(Report).filter(Report.user_id == user_id).count()

    # Per status — query sekali, olah di Python
    per_status = {
        "menunggu": db.query(Report).filter(
            Report.user_id == user_id, Report.status == "menunggu"
        ).count(),
        "diproses": db.query(Report).filter(
            Report.user_id == user_id, Report.status == "diproses"
        ).count(),
        "selesai": db.query(Report).filter(
            Report.user_id == user_id, Report.status == "selesai"
        ).count(),
    }

    # Per kategori — join dengan tabel categories untuk nama
    per_kategori: dict = {}
    rows_kategori = (
        db.query(Category.nama_kategori, sa_func.count(Report.id))
        .join(Report, Report.kategori_id == Category.id)
        .filter(Report.user_id == user_id)
        .group_by(Category.nama_kategori)
        .all()
    )
    for nama, count in rows_kategori:
        per_kategori[nama] = count

    # Per prioritas
    per_prioritas = {
        "tinggi": db.query(Report).filter(
            Report.user_id == user_id, Report.prioritas == "tinggi"
        ).count(),
        "sedang": db.query(Report).filter(
            Report.user_id == user_id, Report.prioritas == "sedang"
        ).count(),
        "rendah": db.query(Report).filter(
            Report.user_id == user_id, Report.prioritas == "rendah"
        ).count(),
    }

    # Laporan terbaru
    newest = (
        db.query(Report.created_at)
        .filter(Report.user_id == user_id)
        .order_by(Report.created_at.desc())
        .first()
    )
    laporan_terbaru = newest[0] if newest else None

    # Rata-rata rating feedback dari laporan-laporan milik user ini
    avg_result = (
        db.query(sa_func.avg(Feedback.rating))
        .join(Report, Report.id == Feedback.report_id)
        .filter(Report.user_id == user_id)
        .scalar()
    )
    rata_rata_rating = round(float(avg_result), 2) if avg_result is not None else None

    return {
        "total_laporan": total,
        "per_status": per_status,
        "per_kategori": per_kategori,
        "per_prioritas": per_prioritas,
        "laporan_terbaru": laporan_terbaru,
        "rata_rata_rating": rata_rata_rating,
    }


def get_global_stats(db: Session) -> dict:
    """
    Ambil statistik agregat SEMUA laporan tanpa filter user.

    Digunakan oleh GET /reports/stats dalam degraded mode:
    saat Auth Service down (circuit breaker OPEN), endpoint tetap bisa
    memberikan response berupa statistik global (bukan per-user).

    Endpoint: GET /reports/stats (degraded mode)
    Branch: feature/graceful-degradation (Lead Backend — Modul 13)
    """
    total = db.query(Report).count()

    per_status = {
        "menunggu": db.query(Report).filter(Report.status == "menunggu").count(),
        "diproses":  db.query(Report).filter(Report.status == "diproses").count(),
        "selesai":   db.query(Report).filter(Report.status == "selesai").count(),
    }

    per_kategori: dict = {}
    rows = (
        db.query(Category.nama_kategori, sa_func.count(Report.id))
        .join(Report, Report.kategori_id == Category.id)
        .group_by(Category.nama_kategori)
        .all()
    )
    for nama, count in rows:
        per_kategori[nama] = count

    per_prioritas = {
        "tinggi": db.query(Report).filter(Report.prioritas == "tinggi").count(),
        "sedang": db.query(Report).filter(Report.prioritas == "sedang").count(),
        "rendah": db.query(Report).filter(Report.prioritas == "rendah").count(),
    }

    newest = (
        db.query(Report.created_at)
        .order_by(Report.created_at.desc())
        .first()
    )
    laporan_terbaru = newest[0] if newest else None

    avg_result = db.query(sa_func.avg(Feedback.rating)).scalar()
    rata_rata_rating = round(float(avg_result), 2) if avg_result is not None else None

    return {
        "total_laporan": total,
        "per_status": per_status,
        "per_kategori": per_kategori,
        "per_prioritas": per_prioritas,
        "laporan_terbaru": laporan_terbaru,
        "rata_rata_rating": rata_rata_rating,
    }


def get_public_reports(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: str | None = None,
    kategori_id: int | None = None,
) -> dict:
    """
    Ambil daftar laporan publik TANPA autentikasi.

    Aturan privasi:
    - Laporan yang anonim=True atau is_sensitive=True -> user_id disembunyikan (None)
    - Hanya field publik yang dikembalikan (tanpa data pribadi)
    - Khusus laporan Perundungan (is_sensitive) -> judul dan lokasi disembunyikan

    Endpoint: GET /reports/public (no auth required)
    Branch: feature/graceful-degradation (Lead Backend — Modul 13)
    """
    query = db.query(Report).options(
        joinedload(Report.category),
    )

    if status:
        query = query.filter(Report.status == status)
    if kategori_id:
        query = query.filter(Report.kategori_id == kategori_id)

    total = query.count()
    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()

    public_reports = []
    for r in reports:
        # Sembunyikan data sensitif untuk laporan Perundungan
        if r.is_sensitive:
            public_reports.append({
                "id":            r.id,
                "judul":         "[Laporan Sensitif]",
                "lokasi":        "[Disembunyikan]",
                "status":        r.status,
                "prioritas":     r.prioritas,
                "kategori_nama": r.category.nama_kategori if r.category else "Lainnya",
                "user_id":       None,
                "anonim":        True,
                "created_at":    r.created_at,
            })
        else:
            public_reports.append({
                "id":            r.id,
                "judul":         r.judul,
                "lokasi":        r.lokasi,
                "status":        r.status,
                "prioritas":     r.prioritas,
                "kategori_nama": r.category.nama_kategori if r.category else "Lainnya",
                "user_id":       None if r.anonim else r.user_id,
                "anonim":        r.anonim,
                "created_at":    r.created_at,
            })

    return {"total": total, "reports": public_reports}


def get_lost_reports(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
) -> dict:
    """
    Ambil semua laporan kategori Kehilangan dari semua user.
    Laporan kehilangan bersifat publik dan dapat dilihat oleh seluruh user yang terautentikasi.
    Mendukung pagination dan pencarian berdasarkan judul/deskripsi/lokasi.
    """
    query = db.query(Report).options(
        joinedload(Report.category),
        joinedload(Report.locations),
        joinedload(Report.attachments),
    ).join(Report.category).filter(
        Category.nama_kategori.ilike("kehilangan")
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
