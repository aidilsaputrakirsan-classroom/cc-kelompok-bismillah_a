"""
HTTP client untuk berkomunikasi dengan Auth Service.
Report Service TIDAK memiliki akses ke auth_db — ia memanggil
Auth Service via HTTP untuk memverifikasi token (inter-service communication).
"""
import os
import httpx
from fastapi import HTTPException, Header

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")


async def verify_token_with_auth_service(authorization: str = Header(...)) -> dict:
    """
    Dependency: Verifikasi token dengan memanggil Auth Service.
    Digunakan sebagai Depends() di endpoints yang butuh autentikasi.

    Returns: dict dengan keys: user_id, email, nama, role
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/verify",
                headers={"Authorization": authorization},
                timeout=5.0,
            )

        if response.status_code == 200:
            return response.json()  # {user_id, email, nama, role}
        elif response.status_code == 401:
            raise HTTPException(status_code=401, detail="Token tidak valid atau sudah expired")
        else:
            raise HTTPException(status_code=503, detail="Auth service tidak tersedia")

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Tidak bisa terhubung ke Auth Service. Apakah service sedang berjalan?"
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Auth Service timeout"
        )


async def require_admin_from_auth_service(authorization: str = Header(...)) -> dict:
    """
    Dependency: Verifikasi token DAN pastikan user adalah admin.
    """
    user = await verify_token_with_auth_service(authorization)
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Akses ditolak: hanya admin yang diizinkan."
        )
    return user
