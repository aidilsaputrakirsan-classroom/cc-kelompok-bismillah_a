"""Test authentication edge cases — input invalid, empty fields, format salah."""


def test_register_invalid_email_format(client):
    """Test register dengan format email tidak valid → 422."""
    response = client.post("/auth/register", json={
        "email": "bukan-email",
        "password": "Secure@123",
        "nama": "Test User"
    })
    assert response.status_code == 422


def test_register_empty_nama(client):
    """Test register dengan nama kosong/spasi → 422."""
    response = client.post("/auth/register", json={
        "email": "emptyname@student.itk.ac.id",
        "password": "Secure@123",
        "nama": " "
    })
    assert response.status_code == 422


def test_register_weak_password(client):
    """Test register dengan password lemah (tanpa simbol/uppercase) → 422."""
    response = client.post("/auth/register", json={
        "email": "weakpass@student.itk.ac.id",
        "password": "password",
        "nama": "Test User"
    })
    assert response.status_code == 422


def test_register_short_password(client):
    """Test register dengan password terlalu pendek → 422."""
    response = client.post("/auth/register", json={
        "email": "shortpass@student.itk.ac.id",
        "password": "Ab@1",
        "nama": "Test User"
    })
    assert response.status_code == 422


def test_login_nonexistent_email(client):
    """Test login dengan email yang belum terdaftar → 401."""
    response = client.post("/auth/login", json={
        "email": "notexist@student.itk.ac.id",
        "password": "Some@Pass123"
    })
    assert response.status_code == 401


def test_register_missing_required_fields(client):
    """Test register tanpa field wajib (email) → 422."""
    response = client.post("/auth/register", json={
        "password": "Secure@123",
        "nama": "Test User"
    })
    assert response.status_code == 422


def test_get_me_unauthorized(client):
    """Test akses /auth/me tanpa token → 401."""
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_get_me_with_valid_token(client, auth_headers):
    """Test akses /auth/me dengan token valid → 200 dan data user benar."""
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@student.itk.ac.id"
    assert data["nama"] == "Test User"
    assert "hashed_password" not in data
