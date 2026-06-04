"""
Integration Test Configuration — LaporIn ITK.
Tests ini membutuhkan semua services running via Docker Compose.

Jalankan dengan:
    docker compose up -d
    pip install httpx pytest
    pytest tests/integration/ -v
"""
import os
import time
import pytest
import httpx

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost")


@pytest.fixture(scope="session")
def gateway_url():
    """Base URL gateway (Nginx reverse proxy)."""
    return GATEWAY_URL


@pytest.fixture(scope="session")
def test_user():
    """
    Register test user dan return credentials + token.
    Fixture scope=session agar hanya register sekali untuk semua tests.
    """
    email = f"integration-test-{int(time.time())}@itk.ac.id"
    password = "IntegrationTest123!"
    nama = "Integration Test User"

    # Register user baru
    response = httpx.post(
        f"{GATEWAY_URL}/auth/register",
        json={"email": email, "password": password, "nama": nama},
    )
    assert response.status_code == 201, f"Register gagal: {response.text}"

    # Login untuk dapat token
    response = httpx.post(
        f"{GATEWAY_URL}/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200, f"Login gagal: {response.text}"
    token = response.json()["access_token"]

    return {
        "email": email,
        "password": password,
        "nama": nama,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }
