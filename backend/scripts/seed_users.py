"""
LaporIn ITK — User Seeder
=========================
Script untuk membuat akun admin dan user awal.

Cara menjalankan (di dalam container backend):
    docker exec -it laporin_itk-backend python scripts/seed_users.py

Atau dari luar container:
    docker exec laporin_itk-backend python scripts/seed_users.py
"""

import sys
import os

# Tambahkan root project ke sys.path agar bisa import module backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# ============================================================
# DATA SEED — Ubah sesuai kebutuhan
# ============================================================

SEED_USERS = [
    {
        "nama": "Admin LaporIn ITK",
        "email": "admin@laporitk.ac.id",
        "password": "Admin@123",
        "role": "admin",
        "no_hp": "081234567890",
    },
    {
        "nama": "Aditya Laksamana P Butar Butar",
        "email": "10231006@student.itk.ac.id",
        "password": "User@1234",
        "role": "user",
        "no_hp": "089876543210",
    },
        {
        "nama": "Firni Fauziah Ramadhini",
        "email": "10231038@student.itk.ac.id",
        "password": "User@1234",
        "role": "user",
        "no_hp": "089876543210",
    },
        {
        "nama": "Muhammad Novri Aziztra",
        "email": "10231066@student.itk.ac.id",
        "password": "User@1234",
        "role": "user",
        "no_hp": "089876543210",
    },
        {
        "nama": "Salsabila Putri Zahrani",
        "email": "10231086@student.itk.ac.id",
        "password": "User@1234",
        "role": "user",
        "no_hp": "089876543210",
    },
]

# ============================================================


def seed(db: Session):
    print("\n🌱 Memulai seeder akun...\n")
    created = 0
    skipped = 0

    for data in SEED_USERS:
        existing = db.query(User).filter(User.email == data["email"]).first()
        if existing:
            print(f"  ⏭️  Dilewati  : {data['email']} (sudah ada, role={existing.role})")
            skipped += 1
            continue

        user = User(
            nama=data["nama"],
            email=data["email"],
            hashed_password=hash_password(data["password"]),
            role=data["role"],
            no_hp=data.get("no_hp"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"  ✅ Dibuat   : {data['email']} | role={data['role']} | password={data['password']}")
        created += 1

    print(f"\n{'='*50}")
    print(f"  Total dibuat  : {created} akun")
    print(f"  Total dilewati: {skipped} akun")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    # Pastikan semua tabel sudah ada
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
