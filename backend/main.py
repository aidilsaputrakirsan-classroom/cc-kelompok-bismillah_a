"""
LaporIn ITK — Main Application
Sistem Pelaporan Institut Teknologi Kalimantan
"""

import os
import uuid
from io import BytesIO
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text

from config import settings, logger
from database import engine, get_db
from models import Base, User, Unit, Report
from schemas import (
    # Auth
    UserCreate, UserResponse, LoginRequest, TokenResponse, normalize_and_validate_email,
    # Admin user management
    AdminCreateUser, UserUpdate,
    # Reports
    ReportCreate, ReportUpdate, ReportUserUpdate, ReportResponse, ReportListResponse,
    ReportLocationCreate, ReportLocationResponse,
    # Map
    MapReportResponse,
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
    # Kehilangan
    KehilanganListResponse, PublicReportDetailResponse,
    # Found Claims
    FoundClaimResponse,
    # Admin Users
    AdminUserListResponse, AdminUserResponse,
)
from auth import create_access_token, get_current_user, require_admin
import crud

load_dotenv()

# Auto-create semua tabel (jika belum ada)
Base.metadata.create_all(bind=engine)

# Buat folder uploads jika belum ada
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
try:
    os.chmod(UPLOAD_DIR, 0o777)  # pastikan writable oleh semua user (termasuk Uvicorn)
except OSError:
    pass  # abaikan jika tidak bisa chmod (e.g. sudah writable)

app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    contact={
        "name": "Tim Bismillah_A",
        "url": "https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-bismillah_a",
    },
)

# ==================== CORS ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files — serve uploaded images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ==================== STARTUP: SEED DATA ====================

@app.on_event("startup")
def startup_event():
    """Seed data awal dan log konfigurasi aktif saat startup."""
    logger.info(f"🚀 LaporIn ITK starting up — environment: {settings.ENVIRONMENT}")
    logger.info(f"⚙️  Config: {settings.summary()}")
    db = next(get_db())
    try:
        crud.seed_categories(db)
        crud.seed_units(db)
    finally:
        db.close()


# ==================== HEALTH CHECK ====================

@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint — cek status semua komponen."""
    health = {
        "status": "healthy",
        "service": "backend",
        "version": "1.0.0",
        "app": "LaporIn ITK",
    }
    try:
        db.execute(text("SELECT 1"))
        health["database"] = "connected"
    except Exception as e:
        health["status"] = "unhealthy"
        health["database"] = f"error: {str(e)}"

    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)


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
    """Registrasi user / pelapor baru."""
    user = crud.create_user(db=db, user_data=user_data)
    if not user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    return user


@app.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login dan dapatkan JWT token."""
    user = crud.authenticate_user(db=db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email atau password salah")
    # Sertakan nama & role di payload agar konsisten dengan auth-service
    token = create_access_token(data={"sub": str(user.id), "nama": user.nama, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/auth/token", tags=["Auth"])
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 password flow untuk Swagger Authorize."""
    try:
        email = normalize_and_validate_email(form_data.username)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    user = crud.authenticate_user(db=db, email=email, password=form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = create_access_token(data={"sub": str(user.id), "nama": user.nama, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserResponse, tags=["Auth"])
def get_me(current_user: User = Depends(get_current_user)):
    """Ambil profil user yang sedang login."""
    return current_user


# ==================== CATEGORIES ====================

@app.get("/categories", response_model=list[CategoryResponse], tags=["Referensi"])
def list_categories(db: Session = Depends(get_db)):
    """Ambil daftar kategori laporan."""
    return crud.get_categories(db)


@app.get("/units", response_model=list[UnitResponse], tags=["Referensi"])
def list_units(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar unit penanganan."""
    return crud.get_units(db)


# ==================== KEHILANGAN PUBLIC ENDPOINTS ====================

@app.get("/reports/kehilangan", response_model=KehilanganListResponse, tags=["Kehilangan"])
def daftar_kehilangan(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Cari berdasarkan judul/deskripsi/lokasi"),
    status: str | None = Query(None, description="Filter: menunggu / diproses / selesai / ditemukan"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar semua laporan kehilangan barang dari semua user. Termasuk nama pelapor."""
    return crud.get_kehilangan_reports(db=db, skip=skip, limit=limit, search=search, status=status)


@app.get("/reports/kehilangan/{report_id}", response_model=PublicReportDetailResponse, tags=["Kehilangan"])
def detail_kehilangan_publik(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil detail laporan kehilangan publik. Hanya untuk laporan kategori Kehilangan."""
    report = crud.get_public_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan kehilangan tidak ditemukan")
    return report


@app.patch("/reports/{report_id}/found", response_model=ReportResponse, tags=["Kehilangan"])
def tandai_ditemukan_sendiri(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pemilik laporan menandai barangnya sudah ditemukan sendiri."""
    report, error = crud.mark_report_found_by_owner(db=db, report_id=report_id, owner_id=current_user.id)
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan atau bukan milik Anda")
    if error == "already_found":
        raise HTTPException(status_code=400, detail="Barang sudah ditandai ditemukan")
    if error == "already_closed":
        raise HTTPException(status_code=400, detail="Laporan sudah ditutup/selesai")
    if error == "not_kehilangan":
        raise HTTPException(status_code=400, detail="Fitur ini hanya untuk laporan kehilangan")
    return report


@app.post("/reports/{report_id}/claim-found", tags=["Kehilangan"])
async def klaim_menemukan_barang(
    report_id: int,
    deskripsi: str = Form(..., min_length=5, description="Deskripsi bagaimana Anda menemukan barang"),
    bukti: UploadFile = File(..., description="Foto bukti menemukan barang"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """User lain mengklaim menemukan barang dengan bukti foto. Foto dikompresi otomatis."""
    # Validasi laporan
    report = crud.get_public_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan kehilangan tidak ditemukan")
    if report["status"] == "ditemukan":
        raise HTTPException(status_code=400, detail="Barang sudah ditemukan")
    if report["pelapor_id"] == current_user.id:
        raise HTTPException(status_code=400, detail="Tidak bisa mengklaim barang milik sendiri. Gunakan fitur 'Tandai Ditemukan'.")

    # Validasi file type
    if bukti.content_type not in ["image/jpeg", "image/png", "image/webp", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Hanya file gambar (JPEG/PNG/WebP) yang diizinkan")

    # Baca dan kompresi gambar
    try:
        from PIL import Image
        contents = await bukti.read()
        img = Image.open(BytesIO(contents))

        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        max_size = 1200
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
            img = img.resize(new_size, Image.LANCZOS)

        filename = f"claim_{report_id}_{current_user.id}_{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)
        img.save(filepath, "JPEG", quality=75, optimize=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses gambar: {str(e)}")

    claim = crud.create_found_claim(
        db=db, report_id=report_id, user_id=current_user.id,
        deskripsi=deskripsi, bukti_path=filename,
    )
    return {
        "id": claim.id, "report_id": claim.report_id, "user_id": claim.user_id,
        "deskripsi": claim.deskripsi, "bukti_url": f"/uploads/{filename}",
        "status": claim.status, "created_at": str(claim.created_at),
        "user_nama": current_user.nama,
        "message": "Klaim berhasil dikirim. Menunggu konfirmasi dari pemilik barang.",
    }


@app.patch("/reports/{report_id}/claims/{claim_id}/confirm", tags=["Kehilangan"])
def konfirmasi_klaim(
    report_id: int, claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pemilik laporan mengkonfirmasi klaim menemukan barang."""
    claim, error = crud.confirm_found_claim(db=db, claim_id=claim_id, report_id=report_id, owner_id=current_user.id)
    if error == "claim_not_found":
        raise HTTPException(status_code=404, detail="Klaim tidak ditemukan")
    if error == "not_owner":
        raise HTTPException(status_code=403, detail="Hanya pemilik laporan yang bisa mengkonfirmasi klaim")
    return {"message": "Klaim dikonfirmasi. Barang sudah ditemukan!", "claim_id": claim.id}


@app.patch("/reports/{report_id}/claims/{claim_id}/reject", tags=["Kehilangan"])
def tolak_klaim(
    report_id: int, claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pemilik laporan menolak klaim menemukan barang."""
    claim, error = crud.reject_found_claim(db=db, claim_id=claim_id, report_id=report_id, owner_id=current_user.id)
    if error == "claim_not_found":
        raise HTTPException(status_code=404, detail="Klaim tidak ditemukan")
    if error == "not_owner":
        raise HTTPException(status_code=403, detail="Hanya pemilik laporan yang bisa menolak klaim")
    return {"message": "Klaim ditolak.", "claim_id": claim.id}


# ==================== REPORTS (USER) ====================

@app.post("/reports", response_model=ReportResponse, status_code=201, tags=["Laporan"])
def buat_laporan(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Buat laporan baru."""
    category = crud.get_category(db, report_data.kategori_id)
    if not category:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    return crud.create_report(db=db, report_data=report_data, user_id=current_user.id)


@app.get("/reports/map", response_model=list[MapReportResponse], tags=["Peta Sebaran"])
def peta_sebaran(
    status: str | None = Query(None),
    kategori_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil laporan dengan koordinat untuk peta sebaran.
    - User biasa: hanya laporan Kehilangan (fasilitas & perundungan tersembunyi)
    - Admin: semua laporan
    """
    if current_user.role == "admin":
        # Admin melihat semua kategori
        return crud.get_map_reports(db=db, status=status, kategori_id=kategori_id)
    else:
        # User hanya melihat laporan Kehilangan di peta
        from models import Category
        kehilangan_cat = db.query(Category).filter(
            Category.nama_kategori == "Kehilangan"
        ).first()
        if kehilangan_cat:
            return crud.get_map_reports(
                db=db, status=status, kategori_id=kehilangan_cat.id
            )
        return []


@app.get("/reports", response_model=ReportListResponse, tags=["Laporan"])
def daftar_laporan(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    kategori_id: int | None = Query(None),
    category: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar laporan milik user yang login."""
    return crud.get_reports(
        db=db, skip=skip, limit=limit, user_id=current_user.id,
        status=status, kategori_id=kategori_id, kategori_nama=category,
        search=search, is_admin=False,
    )


@app.get("/reports/{report_id}", response_model=ReportResponse, tags=["Laporan"])
def detail_laporan(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil detail satu laporan."""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Laporan {report_id} tidak ditemukan")
    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")
    return report


@app.put("/reports/{report_id}", response_model=ReportResponse, tags=["Laporan"])
def edit_laporan(
    report_id: int,
    report_data: ReportUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Edit laporan milik sendiri. Hanya bisa jika status masih 'menunggu'."""
    report, error = crud.update_report_by_user(
        db=db, report_id=report_id, user_id=current_user.id, report_data=report_data
    )
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    if error == "not_allowed":
        raise HTTPException(status_code=403, detail="Laporan hanya bisa diedit jika statusnya masih 'menunggu'")
    return report


@app.delete("/reports/{report_id}", status_code=204, tags=["Laporan"])
def hapus_laporan(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hapus laporan milik sendiri. Hanya bisa jika status masih 'menunggu'."""
    success, error = crud.delete_report(db=db, report_id=report_id, user_id=current_user.id)
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    if error == "not_allowed":
        raise HTTPException(status_code=403, detail="Laporan hanya bisa dihapus jika statusnya masih 'menunggu'")


# ==================== REPORT TRACKING (LOKASI) ====================

@app.post("/reports/{report_id}/locations", response_model=ReportLocationResponse, status_code=201, tags=["Tracking"])
def tambah_lokasi_tracking(
    report_id: int,
    location_data: ReportLocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tambah titik tracking lokasi ke laporan."""
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
    """Tambah komentar/balasan dalam laporan."""
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
    """Ambil semua komentar dalam satu laporan."""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")
    return crud.get_comments(db=db, report_id=report_id)


# ==================== NOTIFICATIONS ====================

@app.get("/notifications", response_model=list[NotificationResponse], tags=["Notifikasi"])
def daftar_notifikasi(
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil notifikasi user yang login."""
    return crud.get_notifications(db=db, user_id=current_user.id, unread_only=unread_only)


@app.patch("/notifications/{notification_id}/read", response_model=NotificationResponse, tags=["Notifikasi"])
def tandai_notifikasi_dibaca(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tandai notifikasi sebagai sudah dibaca."""
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
    """Submit rating & feedback setelah laporan selesai."""
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
    """Statistik dashboard admin."""
    return crud.get_dashboard_stats(db)


@app.get("/admin/reports", response_model=ReportListResponse, tags=["Admin"])
def semua_laporan(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    kategori_id: int | None = Query(None),
    category: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Ambil semua laporan (dari semua user). Hanya admin."""
    return crud.get_reports(
        db=db, skip=skip, limit=limit, status=status,
        kategori_id=kategori_id, kategori_nama=category,
        search=search, is_admin=True,
    )


@app.put("/admin/reports/{report_id}", response_model=ReportResponse, tags=["Admin"])
def update_laporan(
    report_id: int,
    report_data: ReportUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update status, prioritas, atau detail laporan. Hanya admin."""
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
    """Tugaskan laporan ke unit penanganan. Hanya admin."""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    unit = db.query(Unit).filter(Unit.id == assignment_data.unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit tidak ditemukan")
    return crud.assign_report(db=db, report_id=report_id, assignment_data=assignment_data, admin_id=admin.id)


# ==================== ADMIN USER MANAGEMENT ====================

@app.get("/admin/users", response_model=AdminUserListResponse, tags=["Admin - Pengguna"])
def daftar_pengguna(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: str | None = Query(None),
    role: str | None = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Ambil daftar semua pengguna. Hanya admin."""
    return crud.get_all_users(db=db, skip=skip, limit=limit, search=search, role=role)


@app.patch("/admin/users/{user_id}/toggle-active", response_model=AdminUserResponse, tags=["Admin - Pengguna"])
def toggle_aktif_pengguna(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Toggle aktif/nonaktif pengguna. Hanya admin."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Tidak bisa menonaktifkan akun sendiri")
    user = crud.toggle_user_active(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    tr = db.query(Report).filter(Report.user_id == user_id).count()
    return {
        "id": user.id, "email": user.email, "nama": user.nama, "role": user.role,
        "no_hp": user.no_hp, "is_active": user.is_active, "created_at": user.created_at,
        "total_reports": tr,
    }


@app.post("/admin/users/{user_id}/reset-password", tags=["Admin - Pengguna"])
def reset_password_pengguna(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Reset password pengguna ke default: Reset@123. Hanya admin."""
    user = crud.reset_user_password(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return {"message": f"Password user '{user.nama}' berhasil di-reset ke default (Reset@123)."}


@app.post("/admin/users", response_model=UserResponse, status_code=201, tags=["Admin - Pengguna"])
def buat_pengguna_oleh_admin(
    user_data: AdminCreateUser,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin membuat user baru dengan role custom. Hanya admin."""
    user = crud.create_user_by_admin(db=db, user_data=user_data)
    if not user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    return user


@app.put("/admin/users/{user_id}", response_model=UserResponse, tags=["Admin - Pengguna"])
def edit_pengguna_oleh_admin(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin mengupdate data user (nama, email, no_hp, role, is_active). Hanya admin."""
    user, error = crud.update_user_by_admin(
        db=db, user_id=user_id, user_data=user_data, admin_id=admin.id
    )
    if error == "not_found":
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if error == "email_taken":
        raise HTTPException(status_code=400, detail="Email sudah digunakan user lain")
    if error == "cannot_deactivate_self":
        raise HTTPException(status_code=400, detail="Admin tidak bisa menonaktifkan akun sendiri")
    if error == "cannot_change_own_role":
        raise HTTPException(status_code=400, detail="Admin tidak bisa mengubah role dirinya sendiri")
    return user


@app.delete("/admin/users/{user_id}", status_code=204, tags=["Admin - Pengguna"])
def hapus_pengguna_oleh_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Hapus user secara permanen. Admin tidak bisa hapus diri sendiri. Hanya admin."""
    success, error = crud.delete_user(db=db, user_id=user_id, admin_id=admin.id)
    if error == "not_found":
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if error == "cannot_delete_self":
        raise HTTPException(status_code=400, detail="Admin tidak bisa menghapus akun sendiri")