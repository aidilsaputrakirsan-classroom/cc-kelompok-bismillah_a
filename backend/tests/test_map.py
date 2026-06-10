"""
Test Peta Sebaran — endpoint GET /reports/map
"""


def _create_report_with_location(client, auth_headers, judul="Laptop Hilang", kategori_id=1,
                                  lat=-1.1497, lng=116.8626):
    """Helper: buat laporan dengan koordinat."""
    return client.post("/reports", json={
        "judul": judul,
        "deskripsi": "Deskripsi detail kejadian untuk testing peta sebaran",
        "kategori_id": kategori_id,
        "lokasi": "Gedung C ITK",
        "latitude": lat,
        "longitude": lng,
    }, headers=auth_headers)


def test_map_reports_empty(client, auth_headers):
    """Peta sebaran kosong jika belum ada laporan."""
    response = client.get("/reports/map", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_map_reports_returns_reports_with_coordinates(client, auth_headers):
    """Peta sebaran hanya menampilkan laporan yang punya koordinat."""
    # Buat laporan DENGAN koordinat
    _create_report_with_location(client, auth_headers, judul="Laptop Hilang di Gedung C")

    # Buat laporan TANPA koordinat
    client.post("/reports", json={
        "judul": "Dompet Hilang di Kantin",
        "deskripsi": "Dompet warna hitam hilang saat makan siang",
        "kategori_id": 1,
        "lokasi": "Kantin ITK",
    }, headers=auth_headers)

    response = client.get("/reports/map", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["judul"] == "Laptop Hilang di Gedung C"
    assert data[0]["latitude"] == -1.1497
    assert data[0]["longitude"] == 116.8626
    assert data[0]["kategori_nama"] == "Kehilangan"


def test_map_reports_has_correct_fields(client, auth_headers):
    """Response peta sebaran punya field yang benar dan tidak bocorkan data user."""
    _create_report_with_location(client, auth_headers)

    response = client.get("/reports/map", headers=auth_headers)
    data = response.json()
    assert len(data) == 1

    report = data[0]
    # Field yang harus ada
    required_fields = ["id", "judul", "lokasi", "latitude", "longitude",
                       "kategori_id", "kategori_nama", "status", "prioritas", "created_at"]
    for field in required_fields:
        assert field in report, f"Field '{field}' tidak ditemukan di response"

    # Field privasi yang TIDAK boleh ada
    assert "user_id" not in report
    assert "deskripsi" not in report


def test_map_reports_filter_by_status(client, auth_headers):
    """Filter peta berdasarkan status."""
    _create_report_with_location(client, auth_headers, judul="Laporan Menunggu")

    # Filter status menunggu
    response = client.get("/reports/map?status=menunggu", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

    # Filter status selesai (harusnya kosong)
    response = client.get("/reports/map?status=selesai", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_map_reports_filter_by_kategori(client, auth_headers, admin_headers):
    """Filter peta berdasarkan kategori — harus pakai admin karena user biasa hanya lihat Kehilangan."""
    # Kehilangan (kategori_id=1)
    _create_report_with_location(client, auth_headers, judul="Laptop Hilang", kategori_id=1)

    # Fasilitas (kategori_id=2)
    _create_report_with_location(client, auth_headers, judul="AC Rusak", kategori_id=2,
                                  lat=-1.1500, lng=116.8630)

    # Admin: filter hanya Kehilangan
    response = client.get("/reports/map?kategori_id=1", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["kategori_nama"] == "Kehilangan"

    # Admin: filter hanya Fasilitas
    response = client.get("/reports/map?kategori_id=2", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["kategori_nama"] == "Fasilitas"

    # Admin: semua kategori
    response = client.get("/reports/map", headers=admin_headers)
    assert len(response.json()) == 2


def test_map_reports_requires_auth(client):
    """Endpoint peta sebaran membutuhkan autentikasi."""
    response = client.get("/reports/map")
    assert response.status_code == 401
