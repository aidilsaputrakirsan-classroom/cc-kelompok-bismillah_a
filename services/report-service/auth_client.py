"""
Auth Client — HTTP client untuk berkomunikasi dengan Auth Service.
Report Service TIDAK memiliki akses ke auth_db — ia memanggil
Auth Service via HTTP untuk memverifikasi token (inter-service communication).

Dilengkapi dengan:
- Retry logic dengan exponential backoff (3 percobaan, delay 0.5s/1s/2s)
- Circuit breaker untuk mencegah cascading failure saat Auth Service down
"""
import os
import time
import asyncio
import logging
import httpx
from fastapi import HTTPException, Header

from circuit_breaker import CircuitBreaker

logger = logging.getLogger(__name__)

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")

# =====================
# RETRY CONFIG
# =====================
MAX_RETRIES = 3
BASE_DELAY = 0.5           # 0.5 detik delay awal → 0.5s, 1s, 2s
TIMEOUT_SECONDS = 5.0      # Timeout per request ke Auth Service

# Error yang layak di-retry (transient / sementara)
RETRYABLE_STATUS_CODES = {500, 502, 503, 504}

# =====================
# CIRCUIT BREAKER
# =====================
# Instance global — shared di seluruh app (satu per process)
auth_circuit = CircuitBreaker(
    name="auth-service",
    failure_threshold=5,    # 5 kegagalan berturut → OPEN
    cooldown_seconds=30,    # 30 detik cooldown sebelum HALF_OPEN
)


async def _call_auth_service(authorization: str) -> dict:
    """
    Internal: Panggil Auth Service dengan Circuit Breaker + Retry Exponential Backoff.

    Flow:
    1. Cek circuit breaker — jika OPEN, langsung tolak (fail fast)
    2. Retry hingga MAX_RETRIES kali dengan exponential backoff
    3. Catat success/failure ke circuit breaker
    """
    # --- Circuit Breaker Check ---
    if not auth_circuit.can_execute():
        logger.warning("[auth_client] Circuit breaker OPEN — request ditolak langsung (fail fast)")
        raise HTTPException(
            status_code=503,
            detail="Auth Service circuit breaker OPEN. Silakan coba beberapa saat lagi.",
        )

    last_exception = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{AUTH_SERVICE_URL}/verify",
                    headers={"Authorization": authorization},
                    timeout=TIMEOUT_SECONDS,
                )

            # ✅ Sukses
            if response.status_code == 200:
                auth_circuit.record_success()
                logger.info(f"[auth_client] Auth verified (attempt {attempt}/{MAX_RETRIES})")
                return response.json()

            # ❌ Non-retryable: token salah — catat service responsif, langsung gagal
            if response.status_code == 401:
                auth_circuit.record_success()  # Service merespons, berarti sehat
                raise HTTPException(status_code=401, detail="Token tidak valid atau sudah expired")

            if response.status_code == 400:
                auth_circuit.record_success()
                raise HTTPException(status_code=400, detail="Bad auth request")

            # ⚠️ Retryable: server error sementara
            if response.status_code in RETRYABLE_STATUS_CODES:
                logger.warning(
                    f"[auth_client] Auth Service returned {response.status_code} "
                    f"(attempt {attempt}/{MAX_RETRIES})"
                )
                last_exception = HTTPException(
                    status_code=response.status_code,
                    detail=f"Auth service error: {response.status_code}",
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Unexpected auth response: {response.status_code}",
                )

        except httpx.ConnectError as e:
            logger.warning(
                f"[auth_client] Tidak bisa terhubung ke Auth Service "
                f"(attempt {attempt}/{MAX_RETRIES}): {e}"
            )
            last_exception = e

        except httpx.TimeoutException as e:
            logger.warning(
                f"[auth_client] Auth Service timeout "
                f"(attempt {attempt}/{MAX_RETRIES}): {e}"
            )
            last_exception = e

        # Exponential backoff sebelum retry berikutnya
        if attempt < MAX_RETRIES:
            delay = BASE_DELAY * (2 ** (attempt - 1))  # 0.5s → 1.0s → 2.0s
            logger.info(f"[auth_client] Retrying in {delay}s... (attempt {attempt}/{MAX_RETRIES})")
            await asyncio.sleep(delay)

    # Semua retry habis → record failure di circuit breaker
    auth_circuit.record_failure()
    logger.error(f"[auth_client] Auth Service tidak bisa dijangkau setelah {MAX_RETRIES} percobaan")
    raise HTTPException(
        status_code=503,
        detail="Auth Service tidak tersedia. Silakan coba beberapa saat lagi.",
    )


async def verify_token_with_auth_service(
    authorization: str = Header(...),
) -> dict:
    """
    FastAPI Dependency: Verifikasi token via Auth Service.
    Dengan retry logic, circuit breaker, dan proper error handling.

    Returns: dict dengan keys: user_id, email, nama, role
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    return await _call_auth_service(authorization)


async def require_admin_from_auth_service(
    authorization: str = Header(...),
) -> dict:
    """
    FastAPI Dependency: Verifikasi token DAN pastikan user adalah admin.
    Dengan retry logic dan circuit breaker.
    """
    user = await verify_token_with_auth_service(authorization)
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Akses ditolak: hanya admin yang diizinkan.",
        )
    return user
