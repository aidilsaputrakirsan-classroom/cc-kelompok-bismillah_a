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
import logging
import shutil
from fastapi import FastAPI, Depends, HTTPException, Query, Header, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text

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
    # Stats (Lead Backend — Modul 12)
    ReportStats,
    # Kehilangan public
    KehilanganPublicResponse, KehilanganPublicListResponse, FoundClaimResponse,
)
from auth_client import verify_token_with_auth_service, require_admin_from_auth_service, auth_circuit
from logging_config import setup_logging
from logging_middleware import RequestLoggingMiddleware
from metrics import metrics
import crud

# Upload dir untuk foto bukti penemuan
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Helper: build KehilanganPublicResponse dict dari Report model
async def _build_kehilangan_response(report, user: dict | None = None) -> dict:
    """
    Build dict yang sesuai dengan KehilanganPublicResponse.
    pelapor_nama diambil langsung dari field tersimpan di database (Report.pelapor_nama).
    Untuk laporan anonim, nama disembunyikan.
    """
    # Gunakan nama yang tersimpan di kolom pelapor_nama
    if report.anonim:
        pelapor_nama = "Anonim"
    else:
        pelapor_nama = report.pelapor_nama or f"Pengguna #{report.user_id}"

    claims_data = []
    for c in (report.found_claims or []):
        claims_data.append({
            "id": c.id,
            "report_id": c.report_id,
            "claimant_user_id": c.claimant_user_id,
            "user_nama": f"Pengguna #{c.claimant_user_id}",
            "deskripsi": c.deskripsi,
            "bukti_url": c.bukti_url,
            "status": c.status,
            "created_at": c.created_at,
        })

    return {
        "id": report.id,
        "judul": report.judul,
        "deskripsi": report.deskripsi,
        "lokasi": report.lokasi,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "tanggal_kejadian": report.tanggal_kejadian,
        "status": report.status,
        "prioritas": report.prioritas,
        "anonim": report.anonim,
        "pelapor_id": report.user_id,
        "pelapor_nama": pelapor_nama,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
        "category": {"id": report.category.id, "nama_kategori": report.category.nama_kategori} if report.category else None,
        "found_claims": claims_data,
    }


# Setup structured JSON logging
setup_logging()
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Report Service — LaporIn ITK",
    description="Report management microservice — CRUD laporan, komentar, notifikasi, feedback",
    version="2.2.0",
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

# Logging middleware — log setiap request + correlation ID + metrics
app.add_middleware(RequestLoggingMiddleware)

# Mount static folder untuk uploads bukti penemuan
from pathlib import Path
_upload_path = Path(UPLOAD_DIR)
_upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_upload_path)), name="uploads")


# ==================== STARTUP: SEED DATA ====================

@app.on_event("startup")
def startup_event():
    """Seed data awal saat startup + jalankan migrasi kolom baru."""
    db = next(get_db())
    try:
        crud.seed_categories(db)
        crud.seed_units(db)

        # ── Migrasi: tambah kolom baru yang mungkin belum ada di DB lama ──
        migrations = [
            "ALTER TABLE reports ADD COLUMN IF NOT EXISTS pelapor_nama VARCHAR(100)",
            "ALTER TABLE found_claims ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'",
        ]
        for sql in migrations:
            try:
                db.execute(text(sql))
                db.commit()
                logger.info(f"[startup] Migration OK: {sql[:60]}")
            except Exception as e:
                db.rollback()
                logger.warning(f"[startup] Migration skipped ({e}): {sql[:60]}")
    finally:
        db.close()


# ==================== HEALTH CHECK ====================

@app.get("/health")
async def health_check():
    """
    Health check aggregated — menampilkan status report-service beserta dependencies:
    - Auth Service (circuit breaker state)
    - Database (koneksi ke report-db)
    """
    # --- Cek circuit breaker Auth Service ---
    cb_status = auth_circuit.get_status()
    auth_available = cb_status["state"] == "CLOSED"

    # --- Cek koneksi database ---
    db_status = "connected"
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        logger.warning(f"[health_check] Database connection error: {e}")
        db_status = "disconnected"

    # --- Tentukan overall status ---
    overall = "healthy"
    if not auth_available:
        overall = "degraded"      # Auth down tapi service masih bisa jalan terbatas
    if db_status != "connected":
        overall = "unhealthy"     # Database down = service tidak bisa berfungsi

    return {
        "status": overall,
        "service": "report-service",
        "version": "2.1.0",
        "dependencies": {
            "auth-service": {
                "status": "available" if auth_available else "unavailable",
                "circuit_breaker": cb_status,
            },
            "database": {
                "status": db_status,
            },
        },
    }


@app.get("/metrics")
def get_metrics():
    """Return application metrics: request count, error rate, latency percentiles."""
    return {
        "service": "report-service",
        **metrics.get_metrics(),
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

    return crud.create_report(db=db, report_data=report_data, user_id=user["user_id"], pelapor_nama=user.get("nama", ""))


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


# ==================== REPORT STATS (Lead Backend — Modul 12 + 13 Graceful Degradation) ====================

@app.get("/reports/stats", response_model=ReportStats, tags=["Laporan"])
async def statistik_laporan(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """
    Statistik laporan.

    **Graceful Degradation (Modul 13):**
    - Jika Auth Service UP (circuit breaker CLOSED): return statistik laporan milik user yang login
    - Jika Auth Service DOWN (circuit breaker OPEN): return statistik agregat semua laporan (tanpa auth)

    Mode degraded ditandai dengan field `degraded: true` di response.
    """
    cb_state = auth_circuit.get_status()["state"]

    # --- DEGRADED MODE: Auth Service down atau circuit breaker OPEN ---
    if cb_state == "OPEN" or authorization is None:
        logger.warning(
            "[/reports/stats] Auth Service tidak tersedia (CB OPEN) "
            "atau tidak ada token — returning global stats (degraded mode)"
        )
        stats = crud.get_global_stats(db=db)
        stats["degraded"] = True
        stats["degraded_reason"] = "Auth Service tidak tersedia. Menampilkan statistik global."
        return stats

    # --- FULL MODE: Auth Service UP, verifikasi token ---
    try:
        user = await verify_token_with_auth_service(authorization)
        stats = crud.get_report_stats(db=db, user_id=user["user_id"])
        stats["degraded"] = False
        return stats
    except HTTPException as exc:
        # Jika 503 (auth down tapi CB belum OPEN penuh), fallback ke global stats
        if exc.status_code == 503:
            logger.warning(
                "[/reports/stats] Auth Service 503 saat verifikasi "
                "— fallback ke global stats (degraded mode)"
            )
            stats = crud.get_global_stats(db=db)
            stats["degraded"] = True
            stats["degraded_reason"] = "Auth Service sedang tidak tersedia. Menampilkan statistik global."
            return stats
        # Error lain (401, 403) diteruskan apa adanya
        raise


# ==================== PUBLIC ENDPOINT (Lead Backend — Modul 13 Tugas C) ====================

@app.get("/reports/public", tags=["Laporan"])
def daftar_laporan_publik(
    skip: int = Query(0, ge=0, description="Offset pagination"),
    limit: int = Query(20, ge=1, le=100, description="Jumlah per halaman"),
    status: str | None = Query(None, description="Filter: menunggu / diproses / selesai"),
    kategori_id: int | None = Query(None, description="Filter berdasarkan ID kategori"),
    db: Session = Depends(get_db),
):
    """
    Ambil daftar laporan publik. **Tidak membutuhkan autentikasi.**

    Endpoint ini selalu bisa diakses bahkan saat Auth Service down (graceful degradation).

    Aturan privasi yang diterapkan:
    - Laporan **anonim** → `user_id` disembunyikan (ditampilkan sebagai `null`)
    - Laporan **sensitif** (Perundungan) → judul dan lokasi diganti `[Disembunyikan]`
    - Data pribadi pelapor tidak pernah ditampilkan

    Berguna untuk: tampilan publik laporan di kampus, dashboard terbuka.
    """
    return crud.get_public_reports(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        kategori_id=kategori_id,
    )


# ==================== KEHILANGAN (PUBLIC, PERLU LOGIN) ====================

@app.get("/reports/kehilangan", response_model=KehilanganPublicListResponse, tags=["Kehilangan"])
async def daftar_kehilangan(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Daftar semua laporan Kehilangan dari seluruh user. **Membutuhkan autentikasi.**"""
    result = crud.get_kehilangan_reports(db=db, skip=skip, limit=limit, status=status, search=search)
    built = []
    for r in result["reports"]:
        built.append(await _build_kehilangan_response(r, user))
    return {"total": result["total"], "reports": built}


@app.get("/reports/kehilangan/{report_id}", response_model=KehilanganPublicResponse, tags=["Kehilangan"])
async def detail_kehilangan(
    report_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Detail satu laporan kehilangan. **Membutuhkan autentikasi.**"""
    report = crud.get_kehilangan_report_by_id(db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Laporan kehilangan tidak ditemukan")
    return await _build_kehilangan_response(report, user)


@app.patch("/reports/{report_id}/found", response_model=KehilanganPublicResponse, tags=["Kehilangan"])
async def tandai_ditemukan_sendiri(
    report_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Pemilik laporan menandai barangnya sudah ditemukan sendiri. **Membutuhkan autentikasi.**"""
    report, error = crud.mark_report_found_by_owner(db=db, report_id=report_id, user_id=user["user_id"])
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan atau bukan milik Anda")
    if error == "already_done":
        raise HTTPException(status_code=400, detail="Laporan sudah berstatus ditemukan atau selesai")
    return await _build_kehilangan_response(report, user)


@app.post("/reports/{report_id}/claim-found", tags=["Kehilangan"], status_code=201)
async def klaim_menemukan_barang(
    report_id: int,
    deskripsi: str = Form(..., min_length=5),
    bukti: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """User mengklaim menemukan barang. Kirim deskripsi + foto bukti. **Membutuhkan autentikasi.**"""
    # Simpan file ke disk
    import uuid
    ext = bukti.filename.rsplit(".", 1)[-1].lower() if "." in bukti.filename else "jpg"
    if ext not in ("jpg", "jpeg", "png", "webp"):
        raise HTTPException(status_code=400, detail="Format file harus jpg/jpeg/png/webp")
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    try:
        with open(file_path, "wb") as f:
            shutil.copyfileobj(bukti.file, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan file: {e}")

    bukti_url = f"/uploads/{filename}"

    claim, error = crud.create_found_claim(
        db=db,
        report_id=report_id,
        claimant_user_id=user["user_id"],
        deskripsi=deskripsi,
        bukti_url=bukti_url,
    )
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    if error == "own_report":
        raise HTTPException(status_code=400, detail="Anda tidak bisa mengklaim laporan milik sendiri")
    if error == "already_done":
        raise HTTPException(status_code=400, detail="Laporan sudah ditemukan/selesai")
    if error == "already_claimed":
        raise HTTPException(status_code=400, detail="Anda sudah memiliki klaim aktif untuk laporan ini")

    return {
        "id": claim.id,
        "report_id": claim.report_id,
        "claimant_user_id": claim.claimant_user_id,
        "user_nama": user.get("nama", ""),
        "deskripsi": claim.deskripsi,
        "bukti_url": claim.bukti_url,
        "status": claim.status,
        "created_at": claim.created_at,
    }


@app.patch("/reports/{report_id}/claims/{claim_id}/confirm", tags=["Kehilangan"])
async def konfirmasi_klaim(
    report_id: int,
    claim_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Pemilik laporan mengkonfirmasi klaim penemuan. **Membutuhkan autentikasi.**"""
    claim, error = crud.confirm_found_claim(
        db=db, report_id=report_id, claim_id=claim_id, owner_user_id=user["user_id"]
    )
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan atau bukan milik Anda")
    if error == "claim_not_found":
        raise HTTPException(status_code=404, detail="Klaim tidak ditemukan atau sudah diproses")
    return {"message": "Klaim dikonfirmasi. Status laporan berubah menjadi ditemukan.", "claim_id": claim.id}


@app.patch("/reports/{report_id}/claims/{claim_id}/reject", tags=["Kehilangan"])
async def tolak_klaim(
    report_id: int,
    claim_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(verify_token_with_auth_service),
):
    """Pemilik laporan menolak klaim penemuan. **Membutuhkan autentikasi.**"""
    claim, error = crud.reject_found_claim(
        db=db, report_id=report_id, claim_id=claim_id, owner_user_id=user["user_id"]
    )
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan atau bukan milik Anda")
    if error == "claim_not_found":
        raise HTTPException(status_code=404, detail="Klaim tidak ditemukan atau sudah diproses")
    return {"message": "Klaim ditolak.", "claim_id": claim.id}


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
