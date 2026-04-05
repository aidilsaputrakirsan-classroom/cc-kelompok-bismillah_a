"""
LaporIn ITK — Main Application
Sistem Pelaporan Institut Teknologi Kalimantan
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, User, Unit
from schemas import (
    # Auth
    UserCreate, UserResponse, LoginRequest, TokenResponse, normalize_and_validate_email,
    # Reports
    ReportCreate, ReportUpdate, ReportResponse, ReportListResponse,
    ReportLocationCreate, ReportLocationResponse,
    # Categories & Units
    CategoryResponse, UnitResponse,
    # Comments
    CommentCreate, CommentResponse,
    # Notifications
    NotificationResponse,
    # Feedback
    FeedbackCreate, FeedbackResponse,
    # Assignment
    AssignmentCreate, AssignmentResponse,
    # Admin
    DashboardStats, StatusLogResponse,
)
from auth import create_access_token, get_current_user, require_admin
import crud

load_dotenv()

# Auto-create semua tabel (jika belum ada)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LaporIn ITK API",
    description=(
        "**Sistem Pelaporan Institut Teknologi Kalimantan**\n\n"
        "API untuk mengelola laporan kehilangan, kerusakan fasilitas, dan perundungan di lingkungan ITK.\n\n"
        "## Autentikasi\n"
        "Gunakan endpoint `/auth/login` untuk mendapatkan token JWT, "
        "lalu klik **Authorize** dan masukkan token di field `Bearer`.\n\n"
        "## Role\n"
        "- `user` — pelapor: bisa buat dan lihat laporan sendiri\n"
        "- `admin` — pengelola: bisa lihat semua laporan, ubah status, assign unit\n"
    ),
    version="1.0.0",
    contact={
        "name": "Tim Bismillah_A",
        "url": "https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-bismillah_a",
    },
)

# ==================== CORS ====================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins_list = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== STARTUP: SEED DATA ====================

@app.on_event("startup")
def startup_event():
    """Seed data awal saat aplikasi pertama kali dijalankan."""
    db = next(get_db())
    try:
        crud.seed_categories(db)
        crud.seed_units(db)
    finally:
        db.close()


# ==================== HEALTH CHECK ====================

@app.get("/health", tags=["System"])
def health_check():
    """Cek status API."""
    return {"status": "healthy", "version": "1.0.0", "app": "LaporIn ITK"}


# ==================== TEAM INFO ====================

@app.get("/team", tags=["System"])
def team_info():
    """Informasi tim pengembang."""
    return {
        "team": "Bismillah_A",
        "project": "LaporIn ITK",
        "description": "Sistem Pelaporan Institut Teknologi Kalimantan",
        "members": [
            {"name": "Aditya Laksamana P Butar Butar", "nim": "10231006", "role": "Lead Backend"},
            {"name": "Firni Fauziah Ramadhini", "nim": "10231038", "role": "Lead Frontend"},
            {"name": "Muhammad Novri Aziztra", "nim": "10231066", "role": "Lead DevOps"},
            {"name": "Salsabila Putri Zahrani", "nim": "10231086", "role": "Lead QA & Docs"},
        ],
    }


# ==================== AUTH ENDPOINTS ====================

@app.post("/auth/register", response_model=UserResponse, status_code=201, tags=["Auth"])
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrasi user / pelapor baru.

    - **email**: Email unik (format: user@domain.com)
    - **nama**: Nama lengkap (min 2 karakter)
    - **password**: Min 8 karakter, mengandung huruf besar, kecil, angka, simbol
    - **no_hp**: Nomor HP opsional
    """
    user = crud.create_user(db=db, user_data=user_data)
    if not user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    return user


@app.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login dan dapatkan JWT token.

    Token berlaku selama 60 menit. Gunakan di header: `Authorization: Bearer <token>`
    """
    user = crud.authenticate_user(db=db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email atau password salah")

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/auth/token", tags=["Auth"])
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 password flow untuk Swagger Authorize. Isikan email di field `username`."""
    try:
        email = normalize_and_validate_email(form_data.username)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    user = crud.authenticate_user(db=db, email=email, password=form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email atau password salah")

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserResponse, tags=["Auth"])
def get_me(current_user: User = Depends(get_current_user)):
    """Ambil profil user yang sedang login."""
    return current_user


# ==================== CATEGORIES ====================

@app.get("/categories", response_model=list[CategoryResponse], tags=["Referensi"])
def list_categories(db: Session = Depends(get_db)):
    """Ambil daftar kategori laporan (Kehilangan, Fasilitas, Perundungan)."""
    return crud.get_categories(db)


@app.get("/units", response_model=list[UnitResponse], tags=["Referensi"])
def list_units(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar unit penanganan. **Membutuhkan autentikasi.**"""
    return crud.get_units(db)


# ==================== REPORTS (USER) ====================

@app.post("/reports", response_model=ReportResponse, status_code=201, tags=["Laporan"])
def buat_laporan(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Buat laporan baru. **Membutuhkan autentikasi.**

    - **judul**: Judul singkat laporan
    - **deskripsi**: Deskripsi detail kejadian
    - **kategori_id**: 1=Kehilangan, 2=Fasilitas, 3=Perundungan
    - **lokasi**: Nama lokasi (teks)
    - **latitude/longitude**: Koordinat peta (opsional)
    - **anonim**: Sembunyikan identitas pelapor (otomatis True untuk perundungan)
    """
    # Validasi kategori
    category = crud.get_category(db, report_data.kategori_id)
    if not category:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")

    return crud.create_report(db=db, report_data=report_data, user_id=current_user.id)


@app.get("/reports", response_model=ReportListResponse, tags=["Laporan"])
def daftar_laporan(
    skip: int = Query(0, ge=0, description="Offset pagination"),
    limit: int = Query(20, ge=1, le=100, description="Jumlah per halaman"),
    status: str | None = Query(None, description="Filter: menunggu / diproses / selesai"),
    kategori_id: int | None = Query(None, description="Filter kategori"),
    search: str | None = Query(None, description="Cari berdasarkan judul/deskripsi/lokasi"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ambil daftar laporan milik user yang login. **Membutuhkan autentikasi.**

    - User biasa hanya bisa lihat laporan sendiri
    - Admin bisa lihat semua (gunakan `/admin/reports`)
    """
    return crud.get_reports(
        db=db,
        skip=skip,
        limit=limit,
        user_id=current_user.id,
        status=status,
        kategori_id=kategori_id,
        search=search,
        is_admin=False,
    )


@app.get("/reports/{report_id}", response_model=ReportResponse, tags=["Laporan"])
def detail_laporan(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil detail satu laporan. **Membutuhkan autentikasi.**"""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Laporan {report_id} tidak ditemukan")

    # User biasa hanya bisa lihat laporan sendiri
    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")

    return report


# ==================== REPORT TRACKING (LOKASI) ====================

@app.post("/reports/{report_id}/locations", response_model=ReportLocationResponse, status_code=201, tags=["Tracking"])
def tambah_lokasi_tracking(
    report_id: int,
    location_data: ReportLocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Tambah titik tracking lokasi ke laporan (khusus Kehilangan). **Membutuhkan autentikasi.**
    """
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")

    return crud.add_report_location(db=db, report_id=report_id, location_data=location_data)


# ==================== COMMENTS ====================

@app.post("/reports/{report_id}/comments", response_model=CommentResponse, status_code=201, tags=["Komentar"])
def tambah_komentar(
    report_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Tambah komentar/balasan dalam laporan. **Membutuhkan autentikasi.**
    """
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")

    return crud.create_comment(db=db, report_id=report_id, user_id=current_user.id, comment_data=comment_data)


@app.get("/reports/{report_id}/comments", response_model=list[CommentResponse], tags=["Komentar"])
def daftar_komentar(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil semua komentar dalam satu laporan. **Membutuhkan autentikasi.**"""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")

    return crud.get_comments(db=db, report_id=report_id)


# ==================== NOTIFICATIONS ====================

@app.get("/notifications", response_model=list[NotificationResponse], tags=["Notifikasi"])
def daftar_notifikasi(
    unread_only: bool = Query(False, description="Hanya tampilkan yang belum dibaca"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil notifikasi user yang login. **Membutuhkan autentikasi.**"""
    return crud.get_notifications(db=db, user_id=current_user.id, unread_only=unread_only)


@app.patch("/notifications/{notification_id}/read", response_model=NotificationResponse, tags=["Notifikasi"])
def tandai_notifikasi_dibaca(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tandai notifikasi sebagai sudah dibaca. **Membutuhkan autentikasi.**"""
    notif = crud.mark_notification_read(db=db, notification_id=notification_id, user_id=current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")
    return notif


# ==================== FEEDBACK ====================

@app.post("/feedback", response_model=FeedbackResponse, status_code=201, tags=["Feedback"])
def submit_feedback(
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit rating & feedback setelah laporan selesai. **Membutuhkan autentikasi.**

    - **report_id**: ID laporan yang sudah selesai
    - **rating**: 1-5 bintang
    - **komentar**: Komentar opsional
    """
    report = crud.get_report(db=db, report_id=feedback_data.report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    if report.status != "selesai":
        raise HTTPException(status_code=400, detail="Feedback hanya bisa diberikan untuk laporan yang sudah selesai")
    return crud.create_feedback(db=db, feedback_data=feedback_data)


# ==================== ADMIN ENDPOINTS ====================

@app.get("/admin/stats", response_model=DashboardStats, tags=["Admin"])
def dashboard_statistik(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Statistik dashboard admin. **Hanya admin.**"""
    return crud.get_dashboard_stats(db)


@app.get("/admin/reports", response_model=ReportListResponse, tags=["Admin"])
def semua_laporan(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    kategori_id: int | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Ambil semua laporan (dari semua user). **Hanya admin.**"""
    return crud.get_reports(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        kategori_id=kategori_id,
        search=search,
        is_admin=True,
    )


@app.put("/admin/reports/{report_id}", response_model=ReportResponse, tags=["Admin"])
def update_laporan(
    report_id: int,
    report_data: ReportUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Update status, prioritas, atau detail laporan. **Hanya admin.**

    - **status**: menunggu / diproses / selesai
    - **prioritas**: tinggi / sedang / rendah
    """
    updated = crud.update_report(db=db, report_id=report_id, report_data=report_data, changed_by=admin.id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Laporan {report_id} tidak ditemukan")
    return updated


@app.post("/admin/reports/{report_id}/assign", response_model=AssignmentResponse, status_code=201, tags=["Admin"])
def assign_unit(
    report_id: int,
    assignment_data: AssignmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Tugaskan laporan ke unit penanganan. **Hanya admin.**

    - **unit_id**: ID unit yang ditugaskan
    """
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    unit = db.query(Unit).filter(Unit.id == assignment_data.unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit tidak ditemukan")

    return crud.assign_report(db=db, report_id=report_id, assignment_data=assignment_data, admin_id=admin.id)