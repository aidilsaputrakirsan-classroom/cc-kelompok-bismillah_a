"""
Data Migration Script — LaporIn ITK
Migrasi data dari monolith (1 database) ke microservices (2 database).

Source : monolith database (laporin_db / cloudapp)
Target : auth_db   → tabel users
         report_db → tabel categories, reports, comments, notifications,
                     feedback, units, report_assignments, report_status_logs,
                     report_locations, report_attachments

Usage:
    python scripts/migrate_data.py

Prerequisite:
    - Monolith database accessible
    - auth_db dan report_db sudah running (via Docker Compose)
    - pip install sqlalchemy psycopg2-binary
"""
import os
import sys
from sqlalchemy import create_engine, text

# =====================
# DATABASE URLs
# =====================
MONOLITH_DB_URL = os.getenv(
    "MONOLITH_DB_URL",
    "postgresql://postgres:aditya221004@localhost:5432/laporin_db"
)
AUTH_DB_URL = os.getenv(
    "AUTH_DB_URL",
    "postgresql://postgres:aditya221004@localhost:5433/auth_db"
)
REPORT_DB_URL = os.getenv(
    "REPORT_DB_URL",
    "postgresql://postgres:aditya221004@localhost:5434/report_db"
)


def migrate_users(monolith, auth_db):
    """Migrasi tabel users dari monolith ke auth_db."""
    print("\n[1/4] Migrating users → auth_db...")
    with monolith.connect() as src:
        users = src.execute(text("SELECT * FROM users")).fetchall()
        columns = src.execute(text("SELECT * FROM users LIMIT 0")).keys()
        print(f"      Found {len(users)} users in monolith")

    migrated = 0
    with auth_db.connect() as dst:
        for user in users:
            user_dict = dict(zip(columns, user))
            dst.execute(
                text("""
                    INSERT INTO users (id, nama, email, hashed_password, role,
                                       no_hp, is_active, created_at)
                    VALUES (:id, :nama, :email, :hashed_password, :role,
                            :no_hp, :is_active, :created_at)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    "id": user_dict.get("id"),
                    "nama": user_dict.get("nama", ""),
                    "email": user_dict.get("email", ""),
                    "hashed_password": user_dict.get("hashed_password", ""),
                    "role": user_dict.get("role", "user"),
                    "no_hp": user_dict.get("no_hp"),
                    "is_active": user_dict.get("is_active", True),
                    "created_at": user_dict.get("created_at"),
                }
            )
            migrated += 1
        dst.commit()
    print(f"      ✅ Migrated {migrated} users")


def migrate_categories(monolith, report_db):
    """Migrasi tabel categories dari monolith ke report_db."""
    print("\n[2/4] Migrating categories → report_db...")
    with monolith.connect() as src:
        categories = src.execute(text("SELECT * FROM categories")).fetchall()
        columns = src.execute(text("SELECT * FROM categories LIMIT 0")).keys()
        print(f"      Found {len(categories)} categories in monolith")

    migrated = 0
    with report_db.connect() as dst:
        for cat in categories:
            cat_dict = dict(zip(columns, cat))
            dst.execute(
                text("""
                    INSERT INTO categories (id, nama_kategori)
                    VALUES (:id, :nama_kategori)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    "id": cat_dict.get("id"),
                    "nama_kategori": cat_dict.get("nama_kategori", ""),
                }
            )
            migrated += 1
        dst.commit()
    print(f"      ✅ Migrated {migrated} categories")


def migrate_reports(monolith, report_db):
    """Migrasi tabel reports dari monolith ke report_db."""
    print("\n[3/4] Migrating reports → report_db...")
    with monolith.connect() as src:
        reports = src.execute(text("SELECT * FROM reports")).fetchall()
        columns = src.execute(text("SELECT * FROM reports LIMIT 0")).keys()
        print(f"      Found {len(reports)} reports in monolith")

    migrated = 0
    with report_db.connect() as dst:
        for report in reports:
            r = dict(zip(columns, report))
            dst.execute(
                text("""
                    INSERT INTO reports (id, user_id, judul, deskripsi, kategori_id,
                                         lokasi, latitude, longitude, tanggal_kejadian,
                                         status, prioritas, anonim, is_sensitive,
                                         created_at, updated_at)
                    VALUES (:id, :user_id, :judul, :deskripsi, :kategori_id,
                            :lokasi, :latitude, :longitude, :tanggal_kejadian,
                            :status, :prioritas, :anonim, :is_sensitive,
                            :created_at, :updated_at)
                    ON CONFLICT (id) DO NOTHING
                """),
                {
                    "id": r.get("id"),
                    "user_id": r.get("user_id"),
                    "judul": r.get("judul", ""),
                    "deskripsi": r.get("deskripsi", ""),
                    "kategori_id": r.get("kategori_id"),
                    "lokasi": r.get("lokasi"),
                    "latitude": r.get("latitude"),
                    "longitude": r.get("longitude"),
                    "tanggal_kejadian": r.get("tanggal_kejadian"),
                    "status": r.get("status", "menunggu"),
                    "prioritas": r.get("prioritas", "sedang"),
                    "anonim": r.get("anonim", False),
                    "is_sensitive": r.get("is_sensitive", False),
                    "created_at": r.get("created_at"),
                    "updated_at": r.get("updated_at"),
                }
            )
            migrated += 1
        dst.commit()
    print(f"      ✅ Migrated {migrated} reports")


def migrate_supporting_tables(monolith, report_db):
    """Migrasi tabel pendukung: units, comments, notifications, feedback, dll."""
    print("\n[4/4] Migrating supporting tables → report_db...")

    tables = [
        {
            "name": "units",
            "insert": """
                INSERT INTO units (id, nama_unit)
                VALUES (:id, :nama_unit)
                ON CONFLICT (id) DO NOTHING
            """,
            "fields": ["id", "nama_unit"],
        },
        {
            "name": "comments",
            "insert": """
                INSERT INTO comments (id, report_id, user_id, pesan, created_at)
                VALUES (:id, :report_id, :user_id, :pesan, :created_at)
                ON CONFLICT (id) DO NOTHING
            """,
            "fields": ["id", "report_id", "user_id", "pesan", "created_at"],
        },
        {
            "name": "notifications",
            "insert": """
                INSERT INTO notifications (id, user_id, pesan, status_baca, created_at)
                VALUES (:id, :user_id, :pesan, :status_baca, :created_at)
                ON CONFLICT (id) DO NOTHING
            """,
            "fields": ["id", "user_id", "pesan", "status_baca", "created_at"],
        },
        {
            "name": "feedback",
            "insert": """
                INSERT INTO feedback (id, report_id, rating, komentar, created_at)
                VALUES (:id, :report_id, :rating, :komentar, :created_at)
                ON CONFLICT (id) DO NOTHING
            """,
            "fields": ["id", "report_id", "rating", "komentar", "created_at"],
        },
    ]

    with monolith.connect() as src:
        for table_info in tables:
            table_name = table_info["name"]
            try:
                rows = src.execute(text(f"SELECT * FROM {table_name}")).fetchall()
                columns = src.execute(
                    text(f"SELECT * FROM {table_name} LIMIT 0")
                ).keys()
                print(f"      Found {len(rows)} rows in {table_name}")

                with report_db.connect() as dst:
                    for row in rows:
                        row_dict = dict(zip(columns, row))
                        params = {
                            f: row_dict.get(f) for f in table_info["fields"]
                        }
                        dst.execute(text(table_info["insert"]), params)
                    dst.commit()
                print(f"      ✅ Migrated {len(rows)} {table_name}")

            except Exception as e:
                print(f"      ⚠️  Skipping {table_name}: {e}")


def migrate():
    """Main migration function."""
    print("=" * 60)
    print("  DATA MIGRATION: Monolith → Microservices (LaporIn ITK)")
    print("=" * 60)
    print(f"\n  Source  : {MONOLITH_DB_URL}")
    print(f"  Target1 : {AUTH_DB_URL} (users)")
    print(f"  Target2 : {REPORT_DB_URL} (reports, categories, ...)")

    monolith = create_engine(MONOLITH_DB_URL)
    auth_db = create_engine(AUTH_DB_URL)
    report_db = create_engine(REPORT_DB_URL)

    # Step 1: Migrate users
    migrate_users(monolith, auth_db)

    # Step 2: Migrate categories
    migrate_categories(monolith, report_db)

    # Step 3: Migrate reports
    migrate_reports(monolith, report_db)

    # Step 4: Migrate supporting tables
    migrate_supporting_tables(monolith, report_db)

    print("\n" + "=" * 60)
    print("  ✅ MIGRATION COMPLETE!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        print("Pastikan semua database accessible dan tabel sudah dibuat.")
        print("\nTips:")
        print("  1. Jalankan: docker compose up -d")
        print("  2. Pastikan monolith database masih ada dan bisa diakses")
        print("  3. Set environment variables jika URL berbeda:")
        print("     MONOLITH_DB_URL, AUTH_DB_URL, REPORT_DB_URL")
        sys.exit(1)
