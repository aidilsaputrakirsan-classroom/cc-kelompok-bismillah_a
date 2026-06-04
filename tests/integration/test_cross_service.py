"""
Integration Tests — Verifikasi komunikasi antar services LaporIn ITK.

Tests ini memverifikasi:
- Gateway bisa diakses
- Auth Service health via gateway
- Report Service health via gateway
- Flow register → login → get token (Auth Service)
- Cross-service: Report Service verifikasi token via Auth Service
- Full CRUD laporan melalui gateway (melibatkan semua services)
- Request tanpa token ditolak
- Token invalid ditolak

Syarat: docker compose up -d (semua services running)
Jalankan: pytest tests/integration/ -v
"""
import time
import httpx
import pytest


def test_gateway_health(gateway_url):
    """Test 1: Gateway (Nginx) bisa diakses dan mengembalikan status healthy."""
    response = httpx.get(f"{gateway_url}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_auth_service_health(gateway_url):
    """Test 2: Auth Service health check bisa diakses via gateway (/auth/health)."""
    response = httpx.get(f"{gateway_url}/auth/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "auth-service"
    assert data["status"] == "healthy"


def test_report_service_health(gateway_url):
    """Test 3: Report Service health check bisa diakses via gateway (/reports/health)."""
    response = httpx.get(f"{gateway_url}/reports/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "report-service"
    assert data["status"] in ["healthy", "degraded"]  # Bisa degraded jika auth CB OPEN
    assert "dependencies" in data


def test_register_login_flow(gateway_url):
    """Test 4: Full flow register → login → dapat token yang valid."""
    email = f"flow-test-{int(time.time())}@itk.ac.id"

    # Register user baru
    resp = httpx.post(f"{gateway_url}/auth/register", json={
        "email": email,
        "password": "FlowTest123!",
        "nama": "Flow Test User",
    })
    assert resp.status_code == 201, f"Register gagal: {resp.text}"
    assert resp.json()["email"] == email

    # Login dan dapat token
    resp = httpx.post(f"{gateway_url}/auth/login", json={
        "email": email,
        "password": "FlowTest123!",
    })
    assert resp.status_code == 200, f"Login gagal: {resp.text}"
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_cross_service_auth_verification(gateway_url, test_user):
    """
    Test 5: Report Service verifikasi token via Auth Service (cross-service call).
    Buat laporan baru → Report Service harus memanggil Auth Service /verify.
    """
    resp = httpx.post(
        f"{gateway_url}/reports",
        json={
            "judul": "Laporan Integration Test",
            "deskripsi": "Test cross-service auth verification antara report-service dan auth-service",
            "kategori_id": 1,
            "lokasi": "Gedung A ITK",
        },
        headers=test_user["headers"],
    )
    assert resp.status_code == 201, f"Create laporan gagal: {resp.text}"
    data = resp.json()
    assert data["judul"] == "Laporan Integration Test"
    assert "user_id" in data
    assert "id" in data


def test_crud_reports_via_gateway(gateway_url, test_user):
    """
    Test 6: Full CRUD laporan melalui gateway (melibatkan semua services).
    Create → Read → Update → Delete → Verify deleted.
    """
    headers = test_user["headers"]

    # CREATE
    resp = httpx.post(f"{gateway_url}/reports", json={
        "judul": "CRUD Test Laporan",
        "deskripsi": "Test CRUD lengkap via gateway integration test",
        "kategori_id": 1,
        "lokasi": "Lab Komputer ITK",
    }, headers=headers)
    assert resp.status_code == 201, f"Create gagal: {resp.text}"
    report_id = resp.json()["id"]

    # READ
    resp = httpx.get(f"{gateway_url}/reports/{report_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["judul"] == "CRUD Test Laporan"

    # UPDATE (edit laporan saat status masih 'menunggu')
    resp = httpx.put(f"{gateway_url}/reports/{report_id}", json={
        "judul": "CRUD Test Laporan — Updated",
        "deskripsi": "Deskripsi diupdate via integration test",
    }, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["judul"] == "CRUD Test Laporan — Updated"

    # DELETE
    resp = httpx.delete(f"{gateway_url}/reports/{report_id}", headers=headers)
    assert resp.status_code == 204

    # VERIFY deleted — harus 404
    resp = httpx.get(f"{gateway_url}/reports/{report_id}", headers=headers)
    assert resp.status_code == 404


def test_unauthorized_without_token(gateway_url):
    """
    Test 7: Request buat laporan tanpa token harus ditolak oleh Report Service.
    Tanpa Authorization header → 422 (field required) atau 401.
    """
    resp = httpx.post(f"{gateway_url}/reports", json={
        "judul": "Laporan Tanpa Token",
        "deskripsi": "Seharusnya ditolak",
        "kategori_id": 1,
        "lokasi": "Nowhere",
    })
    assert resp.status_code in [401, 422], (
        f"Expected 401 atau 422, got {resp.status_code}: {resp.text}"
    )


def test_invalid_token_rejected(gateway_url):
    """
    Test 8: Token invalid harus ditolak oleh Report Service (via Auth Service verification).
    Report Service memanggil Auth Service /verify → Auth Service return 401.
    """
    resp = httpx.get(
        f"{gateway_url}/reports",
        headers={"Authorization": "Bearer token-palsu-tidak-valid-123"},
    )
    assert resp.status_code == 401, (
        f"Expected 401, got {resp.status_code}: {resp.text}"
    )
