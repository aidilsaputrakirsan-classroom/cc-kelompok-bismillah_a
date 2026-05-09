"""Test CRUD report endpoints."""


def test_create_report(client, auth_headers):
    """Test membuat laporan baru → 201."""
    response = client.post("/reports", json={
        "judul": "Kehilangan Laptop",
        "deskripsi": "Laptop Asus warna hitam hilang di perpustakaan.",
        "kategori_id": 1,
        "lokasi": "Perpustakaan ITK"
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["judul"] == "Kehilangan Laptop"
    assert data["kategori_id"] == 1
    assert data["status"] == "menunggu"
    assert "id" in data


def test_create_report_unauthorized(client):
    """Test membuat laporan tanpa login → 401."""
    response = client.post("/reports", json={
        "judul": "Kehilangan Laptop",
        "deskripsi": "Laptop Asus warna hitam hilang di perpustakaan.",
        "kategori_id": 1,
        "lokasi": "Perpustakaan ITK"
    })
    assert response.status_code == 401


def test_get_reports(client, auth_headers):
    """Test mengambil daftar laporan → 200."""
    client.post("/reports", json={
        "judul": "Kehilangan Dompet",
        "deskripsi": "Dompet coklat hilang di kantin utama.",
        "kategori_id": 1,
        "lokasi": "Kantin"
    }, headers=auth_headers)
    client.post("/reports", json={
        "judul": "Kerusakan Proyektor",
        "deskripsi": "Proyektor di ruang kelas tidak menyala.",
        "kategori_id": 2,
        "lokasi": "Ruang 301"
    }, headers=auth_headers)

    response = client.get("/reports", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2


def test_get_report_not_found(client, auth_headers):
    """Test mengambil laporan yang tidak ada → 404."""
    response = client.get("/reports/9999", headers=auth_headers)
    assert response.status_code == 404


def test_update_report(client, auth_headers):
    """Test update laporan → data berubah."""
    create_resp = client.post("/reports", json={
        "judul": "Kehilangan Kunci",
        "deskripsi": "Kunci motor hilang di parkiran belakang.",
        "kategori_id": 1,
        "lokasi": "Parkiran"
    }, headers=auth_headers)
    report_id = create_resp.json()["id"]

    response = client.put(f"/reports/{report_id}", json={
        "judul": "Kehilangan Kunci Motor"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["judul"] == "Kehilangan Kunci Motor"


def test_delete_report(client, auth_headers):
    """Test hapus laporan → 204, lalu GET → 404."""
    create_resp = client.post("/reports", json={
        "judul": "Laporan Sementara",
        "deskripsi": "Laporan ini akan dihapus.",
        "kategori_id": 1,
        "lokasi": "Gedung A"
    }, headers=auth_headers)
    report_id = create_resp.json()["id"]

    response = client.delete(f"/reports/{report_id}", headers=auth_headers)
    assert response.status_code == 204

    get_resp = client.get(f"/reports/{report_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_search_reports(client, auth_headers):
    """Test search laporan berdasarkan judul/deskripsi/lokasi."""
    client.post("/reports", json={
        "judul": "Laptop Gaming Hilang",
        "deskripsi": "Laptop MSI hilang di perpustakaan.",
        "kategori_id": 1,
        "lokasi": "Perpustakaan"
    }, headers=auth_headers)
    client.post("/reports", json={
        "judul": "Kunci Motor",
        "deskripsi": "Kunci motor hilang di parkiran.",
        "kategori_id": 1,
        "lokasi": "Parkiran"
    }, headers=auth_headers)

    response = client.get("/reports?search=laptop", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("laptop" in report["judul"].lower() for report in data["reports"])