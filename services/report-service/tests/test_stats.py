"""
Test untuk endpoint GET /reports/stats — Lead Backend Modul 12.

Test cases:
1. test_stats_unauthenticated   → 401/422 tanpa token
2. test_stats_with_invalid_token → 401 dengan token tidak valid
3. test_stats_empty             → 200, semua nilai 0, user baru tanpa laporan
4. test_stats_with_one_report   → 200, total_laporan=1, per_status & per_kategori sesuai
5. test_stats_multiple_reports  → 200, statistik akurat dengan banyak laporan
6. test_stats_with_feedback     → 200, rata_rata_rating dihitung dengan benar
7. test_stats_only_own_reports  → 200, stats user A tidak tercampur laporan user B
"""

import pytest
import os
import sys

# ============================================================
# KRITIS: Set DATABASE_URL ke SQLite SEBELUM import apapun dari service.
# main.py memanggil Base.metadata.create_all(bind=engine) pada level module,
# sehingga engine dibuat saat import. Env var harus sudah ada sebelum itu.
# ============================================================
os.environ["DATABASE_URL"] = "sqlite:///./test_stats_module12.db"

# Pastikan module service bisa diimport
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch, AsyncMock

from database import Base, get_db
from main import app
from models import Category, Report, Feedback

# ============================================================
# SETUP: SQLite database untuk testing
# ============================================================

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_stats_module12.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# ============================================================
# FIXTURES
# ============================================================

@pytest.fixture(autouse=True)
def setup_database():
    """Buat tabel baru dan seed kategori sebelum setiap test, hapus sesudahnya."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Seed kategori
        if db.query(Category).count() == 0:
            db.add_all([
                Category(nama_kategori="Kehilangan"),
                Category(nama_kategori="Fasilitas"),
                Category(nama_kategori="Perundungan"),
            ])
            db.commit()
    finally:
        db.close()

    yield  # jalankan test

    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """TestClient FastAPI."""
    return TestClient(app, raise_server_exceptions=True)


def make_mock_user(user_id: int = 1, role: str = "user") -> dict:
    """Helper: buat payload user palsu untuk mock auth."""
    return {"user_id": user_id, "email": f"user{user_id}@test.com", "name": f"User {user_id}", "role": role}


def create_report_in_db(
    user_id: int,
    judul: str = "Laporan Test",
    kategori_id: int = 1,
    status: str = "menunggu",
    prioritas: str = "sedang",
) -> Report:
    """Helper: langsung insert laporan ke DB untuk testing."""
    db = TestingSessionLocal()
    try:
        report = Report(
            user_id=user_id,
            judul=judul,
            deskripsi="Deskripsi laporan test yang cukup panjang untuk validasi.",
            kategori_id=kategori_id,
            status=status,
            prioritas=prioritas,
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report
    finally:
        db.close()


def create_feedback_in_db(report_id: int, rating: int) -> Feedback:
    """Helper: langsung insert feedback ke DB untuk testing."""
    db = TestingSessionLocal()
    try:
        feedback = Feedback(report_id=report_id, rating=rating)
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback
    finally:
        db.close()


# ============================================================
# TEST CASES
# ============================================================

class TestReportStats:

    def test_stats_unauthenticated(self, client):
        """
        TC-01: Tanpa Authorization header → 401 Unauthorized.
        Auth Service tidak dipanggil, FastAPI langsung reject.
        """
        response = client.get("/reports/stats")
        assert response.status_code == 422  # Header 'authorization' missing → 422 dari FastAPI
        # Atau 401 jika auth_client mengembalikannya — tergantung implementasi

    def test_stats_with_invalid_token(self, client):
        """
        TC-02: Token tidak valid → 401 dari Auth Service.
        Mock Auth Service mengembalikan 401.
        """
        from auth_client import verify_token_with_auth_service
        from fastapi import HTTPException

        async def mock_auth_fail(authorization: str = None):
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        app.dependency_overrides[verify_token_with_auth_service] = mock_auth_fail
        try:
            response = client.get(
                "/reports/stats",
                headers={"Authorization": "Bearer token_tidak_valid"}
            )
            assert response.status_code == 401
        finally:
            del app.dependency_overrides[verify_token_with_auth_service]

    def test_stats_empty(self, client):
        """
        TC-03: User yang belum punya laporan → semua nilai 0, laporan_terbaru=None.
        """
        from auth_client import verify_token_with_auth_service

        user_id = 99  # user baru, tidak ada laporannya

        async def mock_auth(authorization: str = None):
            return make_mock_user(user_id=user_id)

        app.dependency_overrides[verify_token_with_auth_service] = mock_auth
        try:
            response = client.get(
                "/reports/stats",
                headers={"Authorization": "Bearer valid_token"}
            )
            assert response.status_code == 200
            data = response.json()

            assert data["total_laporan"] == 0
            assert data["per_status"]["menunggu"] == 0
            assert data["per_status"]["diproses"] == 0
            assert data["per_status"]["selesai"] == 0
            assert data["per_kategori"] == {}
            assert data["per_prioritas"]["tinggi"] == 0
            assert data["per_prioritas"]["sedang"] == 0
            assert data["per_prioritas"]["rendah"] == 0
            assert data["laporan_terbaru"] is None
            assert data["rata_rata_rating"] is None
        finally:
            del app.dependency_overrides[verify_token_with_auth_service]

    def test_stats_with_one_report(self, client):
        """
        TC-04: User dengan 1 laporan → total=1, per_status & per_kategori sesuai.
        """
        from auth_client import verify_token_with_auth_service

        user_id = 10
        create_report_in_db(
            user_id=user_id,
            judul="Kehilangan Dompet di Kantin",
            kategori_id=1,   # Kehilangan
            status="menunggu",
            prioritas="sedang",
        )

        async def mock_auth(authorization: str = None):
            return make_mock_user(user_id=user_id)

        app.dependency_overrides[verify_token_with_auth_service] = mock_auth
        try:
            response = client.get(
                "/reports/stats",
                headers={"Authorization": "Bearer valid_token"}
            )
            assert response.status_code == 200
            data = response.json()

            assert data["total_laporan"] == 1
            assert data["per_status"]["menunggu"] == 1
            assert data["per_status"]["diproses"] == 0
            assert data["per_status"]["selesai"] == 0
            assert data["per_kategori"].get("Kehilangan") == 1
            assert data["per_prioritas"]["sedang"] == 1
            assert data["laporan_terbaru"] is not None
            assert data["rata_rata_rating"] is None  # belum ada feedback
        finally:
            del app.dependency_overrides[verify_token_with_auth_service]

    def test_stats_multiple_reports(self, client):
        """
        TC-05: User dengan beberapa laporan berbeda status & kategori.
        Verifikasi akurasi semua counter.
        """
        from auth_client import verify_token_with_auth_service

        user_id = 20
        # 2 laporan "menunggu" — kategori Kehilangan
        create_report_in_db(user_id=user_id, kategori_id=1, status="menunggu", prioritas="rendah")
        create_report_in_db(user_id=user_id, kategori_id=1, status="menunggu", prioritas="tinggi")
        # 1 laporan "diproses" — kategori Fasilitas
        create_report_in_db(user_id=user_id, kategori_id=2, status="diproses", prioritas="sedang")
        # 1 laporan "selesai" — kategori Perundungan
        create_report_in_db(user_id=user_id, kategori_id=3, status="selesai", prioritas="tinggi")

        async def mock_auth(authorization: str = None):
            return make_mock_user(user_id=user_id)

        app.dependency_overrides[verify_token_with_auth_service] = mock_auth
        try:
            response = client.get(
                "/reports/stats",
                headers={"Authorization": "Bearer valid_token"}
            )
            assert response.status_code == 200
            data = response.json()

            assert data["total_laporan"] == 4

            assert data["per_status"]["menunggu"] == 2
            assert data["per_status"]["diproses"] == 1
            assert data["per_status"]["selesai"] == 1

            assert data["per_kategori"]["Kehilangan"] == 2
            assert data["per_kategori"]["Fasilitas"] == 1
            assert data["per_kategori"]["Perundungan"] == 1

            assert data["per_prioritas"]["tinggi"] == 2
            assert data["per_prioritas"]["sedang"] == 1
            assert data["per_prioritas"]["rendah"] == 1

            assert data["laporan_terbaru"] is not None
        finally:
            del app.dependency_overrides[verify_token_with_auth_service]

    def test_stats_with_feedback(self, client):
        """
        TC-06: Laporan yang sudah selesai dan punya feedback → rata_rata_rating dihitung.
        """
        from auth_client import verify_token_with_auth_service

        user_id = 30
        r1 = create_report_in_db(user_id=user_id, kategori_id=1, status="selesai")
        r2 = create_report_in_db(user_id=user_id, kategori_id=2, status="selesai")

        # Rating 4 dan 2 → rata-rata 3.0
        create_feedback_in_db(report_id=r1.id, rating=4)
        create_feedback_in_db(report_id=r2.id, rating=2)

        async def mock_auth(authorization: str = None):
            return make_mock_user(user_id=user_id)

        app.dependency_overrides[verify_token_with_auth_service] = mock_auth
        try:
            response = client.get(
                "/reports/stats",
                headers={"Authorization": "Bearer valid_token"}
            )
            assert response.status_code == 200
            data = response.json()

            assert data["total_laporan"] == 2
            assert data["per_status"]["selesai"] == 2
            assert data["rata_rata_rating"] == pytest.approx(3.0, abs=0.01)
        finally:
            del app.dependency_overrides[verify_token_with_auth_service]

    def test_stats_only_own_reports(self, client):
        """
        TC-07: Pastikan stats user A tidak tercampur dengan laporan user B.
        Prinsip isolasi data per user.
        """
        from auth_client import verify_token_with_auth_service

        user_a = 40
        user_b = 41

        # User A: 2 laporan
        create_report_in_db(user_id=user_a, kategori_id=1, status="menunggu")
        create_report_in_db(user_id=user_a, kategori_id=2, status="diproses")
        # User B: 5 laporan
        for _ in range(5):
            create_report_in_db(user_id=user_b, kategori_id=1, status="selesai")

        async def mock_auth_as_user_a(authorization: str = None):
            return make_mock_user(user_id=user_a)

        app.dependency_overrides[verify_token_with_auth_service] = mock_auth_as_user_a
        try:
            response = client.get(
                "/reports/stats",
                headers={"Authorization": "Bearer token_user_a"}
            )
            assert response.status_code == 200
            data = response.json()

            # User A hanya punya 2 laporan, bukan 7
            assert data["total_laporan"] == 2
            assert data["per_status"]["menunggu"] == 1
            assert data["per_status"]["diproses"] == 1
            assert data["per_status"]["selesai"] == 0
        finally:
            del app.dependency_overrides[verify_token_with_auth_service]
