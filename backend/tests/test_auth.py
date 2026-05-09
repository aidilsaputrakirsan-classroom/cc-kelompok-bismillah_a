"""Test authentication endpoints."""


def test_register_success(client):
    """Test register user baru berhasil."""
    response = client.post("/auth/register", json={
        "email": "newuser@student.itk.ac.id",
        "password": "Secure@123",
        "nama": "New User"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@student.itk.ac.id"
    assert data["nama"] == "New User"
    assert data["role"] == "user"
    assert "id" in data
    # Password TIDAK boleh ada di response
    assert "password" not in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client):
    """Test register dengan email yang sudah ada → 400."""
    # Register pertama
    client.post("/auth/register", json={
        "email": "duplicate@student.itk.ac.id",
        "password": "Pass@1234",
        "nama": "User 1"
    })
    # Register kedua dengan email sama
    response = client.post("/auth/register", json={
        "email": "duplicate@student.itk.ac.id",
        "password": "Pass@5678",
        "nama": "User 2"
    })
    assert response.status_code == 400


def test_login_success(client):
    """Test login dengan kredensial benar → return token."""
    # Register dulu
    client.post("/auth/register", json={
        "email": "login@student.itk.ac.id",
        "password": "MyPass@123",
        "nama": "Login User"
    })
    # Login
    response = client.post("/auth/login", json={
        "email": "login@student.itk.ac.id",
        "password": "MyPass@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@student.itk.ac.id"


def test_login_wrong_password(client):
    """Test login dengan password salah → 401."""
    # Register
    client.post("/auth/register", json={
        "email": "wrongpass@student.itk.ac.id",
        "password": "Correct@123",
        "nama": "User"
    })
    # Login dengan password salah
    response = client.post("/auth/login", json={
        "email": "wrongpass@student.itk.ac.id",
        "password": "Wrong@999"
    })
    assert response.status_code == 401