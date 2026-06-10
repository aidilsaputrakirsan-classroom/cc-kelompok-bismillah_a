"""
Auth Service — Admin Seeder
============================
Script untuk membuat akun admin awal di auth_db.

Cara menjalankan (dari root proyek):
    docker exec laporin-auth-service python seed_admin.py
"""

import sys
import os

# Tambahkan /app ke sys.path agar bisa import module auth-service
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# ============================================================
# DATA SEED — Admin default
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
    print("\n🌱 Memulai seeder akun di auth_db...\n")
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
