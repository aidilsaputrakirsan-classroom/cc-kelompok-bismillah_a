"""Test advanced report features — pagination, stats, edge cases, invalid input."""


# ==================== PAGINATION ====================

def test_pagination_skip_limit(client, auth_headers):
    """Test pagination dengan ?skip=0&limit=2 → hanya 2 laporan dikembalikan."""
    # Buat 3 laporan
    for i in range(3):
        client.post("/reports", json={
            "judul": f"Laporan Pagination {i+1}",
            "deskripsi": f"Deskripsi laporan untuk test pagination nomor {i+1}.",
            "kategori_id": 1,
            "lokasi": f"Lokasi {i+1}"
        }, headers=auth_headers)

    response = client.get("/reports?skip=0&limit=2", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3         # total tetap 3
    assert len(data["reports"]) == 2  # tapi hanya 2 yang dikembalikan


def test_pagination_skip_offset(client, auth_headers):
    """Test pagination skip=2 mengembalikan sisa laporan."""
    # Buat 3 laporan
    for i in range(3):
        client.post("/reports", json={
            "judul": f"Laporan Offset {i+1}",
            "deskripsi": f"Deskripsi laporan untuk test offset nomor {i+1}.",
            "kategori_id": 1,
            "lokasi": f"Lokasi {i+1}"
        }, headers=auth_headers)

    response = client.get("/reports?skip=2&limit=10", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["reports"]) == 1  # hanya 1 sisa


# ==================== ADMIN STATS ====================

def test_admin_stats(client, auth_headers, admin_headers):
    """Test endpoint /admin/stats → 200 dengan statistik dashboard."""
    # Buat beberapa laporan dulu (menggunakan user biasa)
    client.post("/reports", json={
        "judul": "Laporan Stats 1",
        "deskripsi": "Deskripsi laporan pertama untuk statistik.",
        "kategori_id": 1,
        "lokasi": "Gedung A"
    }, headers=auth_headers)
    client.post("/reports", json={
        "judul": "Laporan Stats 2",
        "deskripsi": "Deskripsi laporan kedua untuk statistik.",
        "kategori_id": 2,
        "lokasi": "Gedung B"
    }, headers=auth_headers)

    # Akses stats sebagai admin
    response = client.get("/admin/stats", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_laporan"] >= 2
    assert "menunggu" in data
    assert "diproses" in data
    assert "selesai" in data
    assert "kategori_stats" in data
    assert "prioritas_stats" in data


def test_admin_stats_unauthorized(client, auth_headers):
    """Test akses /admin/stats sebagai user biasa → 403."""
    response = client.get("/admin/stats", headers=auth_headers)
    assert response.status_code == 403


def test_admin_stats_no_auth(client):
    """Test akses /admin/stats tanpa login → 401."""
    response = client.get("/admin/stats")
    assert response.status_code == 401


# ==================== EDGE CASES: INVALID INPUT ====================

def test_create_report_invalid_category(client, auth_headers):
    """Test buat laporan dengan kategori yang tidak ada → 404."""
    response = client.post("/reports", json={
        "judul": "Laporan Kategori Invalid",
        "deskripsi": "Deskripsi untuk kategori yang tidak ada.",
        "kategori_id": 999,
        "lokasi": "Lokasi"
    }, headers=auth_headers)
    assert response.status_code == 404


def test_create_report_empty_judul(client, auth_headers):
    """Test buat laporan dengan judul terlalu pendek → 422."""
    response = client.post("/reports", json={
        "judul": "Ab",
        "deskripsi": "Deskripsi yang cukup panjang untuk test.",
        "kategori_id": 1,
        "lokasi": "Lokasi"
    }, headers=auth_headers)
    assert response.status_code == 422


def test_create_report_empty_deskripsi(client, auth_headers):
    """Test buat laporan dengan deskripsi terlalu pendek → 422."""
    response = client.post("/reports", json={
        "judul": "Judul Laporan Valid",
        "deskripsi": "Pendek",
        "kategori_id": 1,
        "lokasi": "Lokasi"
    }, headers=auth_headers)
    assert response.status_code == 422


def test_create_report_missing_required_fields(client, auth_headers):
    """Test buat laporan tanpa field wajib → 422."""
    response = client.post("/reports", json={
        "lokasi": "Lokasi saja"
    }, headers=auth_headers)
    assert response.status_code == 422


# ==================== CATEGORIES & TEAM ====================

def test_get_categories(client):
    """Test endpoint /categories → 200 dan ada 3 kategori seeded."""
    response = client.get("/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    names = [cat["nama_kategori"] for cat in data]
    assert "Kehilangan" in names
    assert "Fasilitas" in names
    assert "Perundungan" in names


def test_team_info(client):
    """Test endpoint /team → 200 dan informasi tim lengkap."""
    response = client.get("/team")
    assert response.status_code == 200
    data = response.json()
    assert data["team"] == "Bismillah_A"
    assert data["project"] == "LaporIn ITK"
    assert len(data["members"]) == 4
