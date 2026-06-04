"""
Data Migration Script — LaporIn ITK
Migrasi data dari database monolith ke arsitektur microservices (2 database terpisah).

Skema:
  Monolith DB  →  auth_db   : tabel users
  Monolith DB  →  report_db : tabel reports, categories, units, comments, dll.

Usage:
    python scripts/migrate_data.py

Environment Variables (opsional, ada default):
    MONOLITH_DB_URL  - URL database monolith sumber
    AUTH_DB_URL      - URL database auth-service
    REPORT_DB_URL    - URL database report-service

Prerequisite:
    - Monolith database accessible
    - auth_db dan report_db sudah running (via Docker Compose)
    - pip install sqlalchemy psycopg2-binary
"""
import os
import sys
from sqlalchemy import create_engine, text

# =====================
# DATABASE URLS
# =====================
MONOLITH_DB_URL = os.getenv(
    "MONOLITH_DB_URL",
    "postgresql://postgres:postgres@localhost:5432/laporin_monolith"
)
AUTH_DB_URL = os.getenv(
    "AUTH_DB_URL",
    "postgresql://postgres:aditya221004@localhost:5433/auth_db"
)
REPORT_DB_URL = os.getenv(
    "REPORT_DB_URL",
    "postgresql://postgres:aditya221004@localhost:5434/report_db"
)


def print_section(title: str):
    print(f"\n{'=' * 55}")
    print(f"  {title}")
    print(f"{'=' * 55}")


def migrate():
    print_section("DATA MIGRATION: Monolith → Microservices (LaporIn ITK)")
    print(f"  Sumber  : {MONOLITH_DB_URL}")
    print(f"  auth_db : {AUTH_DB_URL}")
    print(f"  report_db: {REPORT_DB_URL}")

    monolith = create_engine(MONOLITH_DB_URL)
    auth_db  = create_engine(AUTH_DB_URL)
    report_db = create_engine(REPORT_DB_URL)

    # ──────────────────────────────────────────────────
    # STEP 1: Migrasi users → auth_db
    # ──────────────────────────────────────────────────
    print("\n[1/3] Migrating users → auth_db...")
    with monolith.connect() as src:
        users = src.execute(text("SELECT * FROM users")).fetchall()
        print(f"      Ditemukan {len(users)} user di monolith")

    with auth_db.connect() as dst:
        migrated = 0
        for user in users:
            result = dst.execute(
                text("""
                    INSERT INTO users (id, email, nama, hashed_password, no_hp, role, is_active, created_at)
                    VALUES (:id, :email, :nama, :hashed_password, :no_hp, :role, :is_active, :created_at)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    "id":              user.id,
                    "email":           user.email,
                    "nama":            user.nama,
                    "hashed_password": user.hashed_password,
                    "no_hp":           getattr(user, "no_hp", None),
                    "role":            getattr(user, "role", "user"),
                    "is_active":       getattr(user, "is_active", True),
                    "created_at":      user.created_at,
                }
            )
            migrated += result.rowcount
        dst.commit()
    print(f"      ✅ Migrated {migrated} users (skip duplikat)")

    # ──────────────────────────────────────────────────
    # STEP 2: Migrasi categories → report_db
    # ──────────────────────────────────────────────────
    print("\n[2/3] Migrating categories → report_db...")
    with monolith.connect() as src:
        try:
            categories = src.execute(text("SELECT * FROM categories")).fetchall()
            print(f"      Ditemukan {len(categories)} kategori di monolith")
        except Exception:
            categories = []
            print("      ⚠️  Tabel categories tidak ditemukan di monolith — skip")

    if categories:
        with report_db.connect() as dst:
            migrated = 0
            for cat in categories:
                result = dst.execute(
                    text("""
                        INSERT INTO categories (id, nama, deskripsi, icon)
                        VALUES (:id, :nama, :deskripsi, :icon)
                        ON CONFLICT (id) DO NOTHING
                    """),
                    {
                        "id":        cat.id,
                        "nama":      cat.nama,
                        "deskripsi": getattr(cat, "deskripsi", None),
                        "icon":      getattr(cat, "icon", None),
                    }
                )
                migrated += result.rowcount
            dst.commit()
        print(f"      ✅ Migrated {migrated} categories")

    # ──────────────────────────────────────────────────
    # STEP 3: Migrasi reports → report_db
    # ──────────────────────────────────────────────────
    print("\n[3/3] Migrating reports → report_db...")
    with monolith.connect() as src:
        try:
            reports = src.execute(text("SELECT * FROM reports")).fetchall()
            print(f"      Ditemukan {len(reports)} laporan di monolith")
        except Exception:
            reports = []
            print("      ⚠️  Tabel reports tidak ditemukan di monolith — skip")

    if reports:
        with report_db.connect() as dst:
            migrated = 0
            for report in reports:
                result = dst.execute(
                    text("""
                        INSERT INTO reports (
                            id, judul, deskripsi, lokasi, latitude, longitude,
                            status, prioritas, kategori_id, user_id, created_at, updated_at
                        )
                        VALUES (
                            :id, :judul, :deskripsi, :lokasi, :latitude, :longitude,
                            :status, :prioritas, :kategori_id, :user_id, :created_at, :updated_at
                        )
                        ON CONFLICT (id) DO NOTHING
                    """),
                    {
                        "id":          report.id,
                        "judul":       report.judul,
                        "deskripsi":   report.deskripsi,
                        "lokasi":      getattr(report, "lokasi", None),
                        "latitude":    getattr(report, "latitude", None),
                        "longitude":   getattr(report, "longitude", None),
                        "status":      getattr(report, "status", "menunggu"),
                        "prioritas":   getattr(report, "prioritas", "sedang"),
                        "kategori_id": report.kategori_id,
                        "user_id":     report.user_id,
                        "created_at":  report.created_at,
                        "updated_at":  getattr(report, "updated_at", None),
                    }
                )
                migrated += result.rowcount
            dst.commit()
        print(f"      ✅ Migrated {migrated} laporan")

    print_section("MIGRATION COMPLETE!")
    print("  Langkah selanjutnya:")
    print("  1. Verifikasi data di auth_db: SELECT COUNT(*) FROM users;")
    print("  2. Verifikasi data di report_db: SELECT COUNT(*) FROM reports;")
    print("  3. Nonaktifkan/hapus monolith database setelah verifikasi selesai")


if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration gagal: {e}")
        print("Pastikan semua database accessible dan tabel sudah dibuat (jalankan docker compose up -d terlebih dahulu).")
        sys.exit(1)
