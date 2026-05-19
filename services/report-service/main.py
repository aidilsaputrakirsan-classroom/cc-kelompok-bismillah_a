"""
Report Service — Handles report management (LaporIn ITK).
Berkomunikasi dengan Auth Service untuk verifikasi token (inter-service communication).

Microservice ini bertanggung jawab untuk:
- CRUD laporan (reports)
- Categories & Units
- Comments, Notifications, Feedback
- Assignments (admin)
- Dashboard stats (admin)
- Peta sebaran (map)
"""
import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Unit
from schemas import (
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
    DashboardStats,
)
from auth_client import verify_token_with_auth_service, require_admin_from_auth_service
import crud

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Report Service — LaporIn ITK",
    description="Report management microservice — CRUD laporan, komentar, notifikasi, feedback",
    version="2.0.0",
)

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== STARTUP: SEED DATA ====================

@app.on_event("startup")
def startup_event():
    """Seed data awal saat startup."""
    db = next(get_db())
    try:
        crud.seed_categories(db)
        crud.seed_units(db)
    finally:
        db.close()


# ==================== HEALTH CHECK ====================

@app.get("/health")
def health_check():
    """Health check endpoint untuk Report Service."""
    return {
        "status": "healthy",
        "service": "report-service",
        "version": "2.0.0",
    }


# ==================== CATEGORIES ====================

@app.get("/categories", response_model=list[CategoryResponse], tags=["Referensi"])
def list_categories(db: Session = Depends(get_db)):
    """Ambil daftar kategori laporan (Kehilangan, Fasilitas, Perundungan)."""
    return crud.get_categories(db)


@app.get("/units", response_model=list[UnitResponse], tags=["Referensi"])
async def list_units(
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Ambil daftar unit penanganan. **Membutuhkan autentikasi.**"""
    return crud.get_units(db)


# ==================== REPORTS (USER) ====================

@app.post("/reports", response_model=ReportResponse, status_code=201, tags=["Laporan"])
async def buat_laporan(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """
    Buat laporan baru. **Membutuhkan autentikasi.**
    Token diverifikasi via Auth Service (inter-service communication).
    """
    category = crud.get_category(db, report_data.kategori_id)
    if not category:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")

    return crud.create_report(db=db, report_data=report_data, user_id=user["user_id"])


@app.get("/reports/map", response_model=list[MapReportResponse], tags=["Peta Sebaran"])
async def peta_sebaran(
    status: str | None = Query(None, description="Filter: menunggu / diproses / selesai"),
    kategori_id: int | None = Query(None, description="Filter berdasarkan ID kategori"),
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Ambil semua laporan yang memiliki koordinat untuk peta sebaran kampus ITK."""
    return crud.get_map_reports(db=db, status=status, kategori_id=kategori_id)


@app.get("/reports", response_model=ReportListResponse, tags=["Laporan"])
async def daftar_laporan(
    skip: int = Query(0, ge=0, description="Offset pagination"),
    limit: int = Query(20, ge=1, le=100, description="Jumlah per halaman"),
    status: str | None = Query(None, description="Filter: menunggu / diproses / selesai"),
    kategori_id: int | None = Query(None, description="Filter berdasarkan ID kategori"),
    category: str | None = Query(None, description="Filter berdasarkan nama kategori"),
    search: str | None = Query(None, description="Cari berdasarkan judul/deskripsi/lokasi"),
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Ambil daftar laporan milik user yang login. **Membutuhkan autentikasi.**"""
    return crud.get_reports(
        db=db,
        skip=skip,
        limit=limit,
        user_id=user["user_id"],
        status=status,
        kategori_id=kategori_id,
        kategori_nama=category,
        search=search,
        is_admin=False,
    )


@app.get("/reports/{report_id}", response_model=ReportResponse, tags=["Laporan"])
async def detail_laporan(
    report_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Ambil detail satu laporan. **Membutuhkan autentikasi.**"""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Laporan {report_id} tidak ditemukan")

    # User biasa hanya bisa lihat laporan sendiri
    if user.get("role") != "admin" and report.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")

    return report


@app.put("/reports/{report_id}", response_model=ReportResponse, tags=["Laporan"])
async def edit_laporan(
    report_id: int,
    report_data: ReportUserUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Edit laporan milik sendiri. **Hanya bisa jika status masih 'menunggu'.**"""
    report, error = crud.update_report_by_user(
        db=db, report_id=report_id, user_id=user["user_id"], report_data=report_data
    )
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    if error == "not_allowed":
        raise HTTPException(
            status_code=403,
            detail="Laporan hanya bisa diedit jika statusnya masih 'menunggu'",
        )
    return report


@app.delete("/reports/{report_id}", status_code=204, tags=["Laporan"])
async def hapus_laporan(
    report_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Hapus laporan milik sendiri. **Hanya bisa jika status masih 'menunggu'.**"""
    success, error = crud.delete_report(db=db, report_id=report_id, user_id=user["user_id"])
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    if error == "not_allowed":
        raise HTTPException(
            status_code=403,
            detail="Laporan hanya bisa dihapus jika statusnya masih 'menunggu'",
        )


# ==================== REPORT TRACKING (LOKASI) ====================

@app.post("/reports/{report_id}/locations", response_model=ReportLocationResponse, status_code=201, tags=["Tracking"])
async def tambah_lokasi_tracking(
    report_id: int,
    location_data: ReportLocationCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Tambah titik tracking lokasi ke laporan (khusus Kehilangan)."""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    if user.get("role") != "admin" and report.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")

    return crud.add_report_location(db=db, report_id=report_id, location_data=location_data)


# ==================== COMMENTS ====================

@app.post("/reports/{report_id}/comments", response_model=CommentResponse, status_code=201, tags=["Komentar"])
async def tambah_komentar(
    report_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Tambah komentar/balasan dalam laporan. **Membutuhkan autentikasi.**"""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    if user.get("role") != "admin" and report.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")

    return crud.create_comment(db=db, report_id=report_id, user_id=user["user_id"], comment_data=comment_data)


@app.get("/reports/{report_id}/comments", response_model=list[CommentResponse], tags=["Komentar"])
async def daftar_komentar(
    report_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Ambil semua komentar dalam satu laporan. **Membutuhkan autentikasi.**"""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    if user.get("role") != "admin" and report.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke laporan ini")

    return crud.get_comments(db=db, report_id=report_id)


# ==================== NOTIFICATIONS ====================

@app.get("/notifications", response_model=list[NotificationResponse], tags=["Notifikasi"])
async def daftar_notifikasi(
    unread_only: bool = Query(False, description="Hanya tampilkan yang belum dibaca"),
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Ambil notifikasi user yang login. **Membutuhkan autentikasi.**"""
    return crud.get_notifications(db=db, user_id=user["user_id"], unread_only=unread_only)


@app.patch("/notifications/{notification_id}/read", response_model=NotificationResponse, tags=["Notifikasi"])
async def tandai_notifikasi_dibaca(
    notification_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Tandai notifikasi sebagai sudah dibaca. **Membutuhkan autentikasi.**"""
    notif = crud.mark_notification_read(db=db, notification_id=notification_id, user_id=user["user_id"])
    if not notif:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")
    return notif


# ==================== FEEDBACK ====================

@app.post("/feedback", response_model=FeedbackResponse, status_code=201, tags=["Feedback"])
async def submit_feedback(
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Submit rating & feedback setelah laporan selesai. **Membutuhkan autentikasi.**"""
    report = crud.get_report(db=db, report_id=feedback_data.report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    if report.status != "selesai":
        raise HTTPException(status_code=400, detail="Feedback hanya bisa diberikan untuk laporan yang sudah selesai")
    return crud.create_feedback(db=db, feedback_data=feedback_data)


# ==================== ADMIN ENDPOINTS ====================

@app.get("/admin/stats", response_model=DashboardStats, tags=["Admin"])
async def dashboard_statistik(
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin_from_auth_service),
):
    """Statistik dashboard admin. **Hanya admin.**"""
    return crud.get_dashboard_stats(db)


@app.get("/admin/reports", response_model=ReportListResponse, tags=["Admin"])
async def semua_laporan(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    kategori_id: int | None = Query(None),
    category: str | None = Query(None, description="Filter berdasarkan nama kategori"),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin_from_auth_service),
):
    """Ambil semua laporan (dari semua user). **Hanya admin.**"""
    return crud.get_reports(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        kategori_id=kategori_id,
        kategori_nama=category,
        search=search,
        is_admin=True,
    )


@app.put("/admin/reports/{report_id}", response_model=ReportResponse, tags=["Admin"])
async def update_laporan(
    report_id: int,
    report_data: ReportUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin_from_auth_service),
):
    """Update status, prioritas, atau detail laporan. **Hanya admin.**"""
    updated = crud.update_report(db=db, report_id=report_id, report_data=report_data, changed_by=admin["user_id"])
    if not updated:
        raise HTTPException(status_code=404, detail=f"Laporan {report_id} tidak ditemukan")
    return updated


@app.post("/admin/reports/{report_id}/assign", response_model=AssignmentResponse, status_code=201, tags=["Admin"])
async def assign_unit(
    report_id: int,
    assignment_data: AssignmentCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin_from_auth_service),
):
    """Tugaskan laporan ke unit penanganan. **Hanya admin.**"""
    report = crud.get_report(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    unit = db.query(Unit).filter(Unit.id == assignment_data.unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit tidak ditemukan")

    return crud.assign_report(db=db, report_id=report_id, assignment_data=assignment_data, admin_id=admin["user_id"])
