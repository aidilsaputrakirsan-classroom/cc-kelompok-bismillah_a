"""
Auth Service — Handles authentication and user management.
Microservice yang bertanggung jawab untuk:
- User registration
- User login (JWT token generation)
- Token verification (dipanggil oleh service lain)
- Get current user profile

Disesuaikan dari backend monolith (auth.py + main.py auth endpoints + crud.py auth CRUD).
"""
import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt

from database import engine, get_db, Base
from models import User
from schemas import (
    UserCreate, UserResponse, LoginRequest,
    TokenResponse, TokenVerifyResponse,
    AdminCreateUser, UserUpdate,
    normalize_and_validate_email,
)
from logging_config import setup_logging
from logging_middleware import RequestLoggingMiddleware
from metrics import metrics

# Setup structured JSON logging
setup_logging()
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Auth Service — LaporIn ITK",
    description="Authentication microservice — register, login, verify tokens",
    version="2.0.0",
)

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging middleware — log setiap request + correlation ID + metrics
app.add_middleware(RequestLoggingMiddleware)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT config
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-laporin-itk-GANTI-DI-PRODUCTION")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", "60"))

# OAuth2 scheme untuk Swagger
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# =====================
# HELPER FUNCTIONS
# =====================

def hash_password(password: str) -> str:
    """Hash password menggunakan bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifikasi password terhadap hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Buat JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode dan verifikasi JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency injection: ambil current user dari JWT token."""
    payload = decode_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token tidak valid")

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token tidak valid: format user tidak dikenali")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun tidak aktif")

    return user


# =====================
# ENDPOINTS
# =====================

@app.get("/health")
def health_check():
    """Health check endpoint untuk Auth Service."""
    return {
        "status": "healthy",
        "service": "auth-service",
        "version": "2.0.0",
    }


@app.get("/metrics")
def get_metrics():
    """Return application metrics: request count, error rate, latency percentiles."""
    return {
        "service": "auth-service",
        **metrics.get_metrics(),
    }


@app.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrasi user / pelapor baru.

    - **email**: Email unik (format: user@domain.com)
    - **nama**: Nama lengkap (min 2 karakter)
    - **password**: Min 8 karakter, mengandung huruf besar, kecil, angka, simbol
    - **no_hp**: Nomor HP opsional
    """
    # Check duplicate email
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    user = User(
        email=user_data.email,
        nama=user_data.nama,
        hashed_password=hash_password(user_data.password),
        no_hp=user_data.no_hp,
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login dan dapatkan JWT token.

    Token berlaku selama 60 menit. Gunakan di header: `Authorization: Bearer <token>`
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    token = create_access_token(data={"sub": str(user.id), "nama": user.nama, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/token")
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 password flow untuk Swagger Authorize. Isikan email di field `username`."""
    try:
        email = normalize_and_validate_email(form_data.username)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    token = create_access_token(data={"sub": str(user.id), "nama": user.nama, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Ambil profil user yang sedang login."""
    return current_user


@app.get("/verify", response_model=TokenVerifyResponse)
def verify_token(authorization: str = Header(...)):
    """
    Verifikasi JWT token — dipanggil oleh service lain (inter-service communication).
    Service lain mengirim header: Authorization: Bearer <token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split("Bearer ")[1]
    payload = decode_token(token)

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token tidak valid")

    return TokenVerifyResponse(
        user_id=int(user_id),
        email=payload.get("email", ""),
        nama=payload.get("nama", ""),
        role=payload.get("role", "user"),
    )


# ==================== ADMIN USER MANAGEMENT ====================

def require_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency: pastikan user yang request adalah admin."""
    payload = decode_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token tidak valid")
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token tidak valid")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun tidak aktif")
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak: hanya admin")
    return user


@app.get("/admin/users", response_model=list[UserResponse])
def list_all_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Ambil semua user. **Hanya admin.**"""
    query = db.query(User)
    if search:
        query = query.filter(
            (User.nama.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.id).offset(skip).limit(limit).all()


@app.patch("/admin/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Aktifkan / nonaktifkan user. **Hanya admin.**"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Admin tidak bisa menonaktifkan diri sendiri")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


@app.post("/admin/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Reset password user ke 'Reset@123'. User wajib ganti setelah login. **Hanya admin.**"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    DEFAULT_PASSWORD = "Reset@123"
    user.hashed_password = hash_password(DEFAULT_PASSWORD)
    db.commit()
    return {
        "message": f"Password user '{user.nama}' berhasil direset.",
        "default_password": DEFAULT_PASSWORD,
        "note": "Harap beritahukan password ini ke user dan minta ganti setelah login.",
    }


# ==================== ADMIN CRUD USER ====================

@app.post("/admin/users", response_model=UserResponse, status_code=201)
def admin_create_user(
    user_data: AdminCreateUser,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Buat user baru oleh admin (bisa set role). **Hanya admin.**"""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    user = User(
        email=user_data.email,
        nama=user_data.nama,
        hashed_password=hash_password(user_data.password),
        no_hp=user_data.no_hp,
        role=user_data.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.put("/admin/users/{user_id}", response_model=UserResponse)
def admin_update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update data user (nama, email, no_hp, role, is_active). **Hanya admin.**"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    # Cek duplikat email jika email diubah
    if user_data.email and user_data.email != user.email:
        dup = db.query(User).filter(User.email == user_data.email).first()
        if dup:
            raise HTTPException(status_code=400, detail="Email sudah digunakan user lain")

    # Cegah admin menonaktifkan atau mengubah role dirinya sendiri
    if user.id == admin.id:
        if user_data.is_active is False:
            raise HTTPException(status_code=400, detail="Admin tidak bisa menonaktifkan diri sendiri")
        if user_data.role and user_data.role != "admin":
            raise HTTPException(status_code=400, detail="Admin tidak bisa mengubah role dirinya sendiri")

    if user_data.nama is not None:
        user.nama = user_data.nama
    if user_data.email is not None:
        user.email = user_data.email
    if user_data.no_hp is not None:
        user.no_hp = user_data.no_hp
    if user_data.role is not None:
        user.role = user_data.role
    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)
    return user


@app.delete("/admin/users/{user_id}", status_code=204)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Hapus user secara permanen. **Hanya admin. Admin tidak bisa hapus diri sendiri.**"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Admin tidak bisa menghapus diri sendiri")
    db.delete(user)
    db.commit()
    return None
