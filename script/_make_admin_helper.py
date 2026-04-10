import os, sys
from passlib.context import CryptContext
from sqlalchemy import create_engine, text

nama     = sys.argv[1]
email    = sys.argv[2]
password = sys.argv[3]

pwd = CryptContext(schemes=["bcrypt"])
hashed = pwd.hash(password)

engine = create_engine(os.environ["DATABASE_URL"])
with engine.connect() as conn:
    existing = conn.execute(text("SELECT id FROM users WHERE email = :e"), {"e": email}).first()
    if existing:
        print(f"[!] Email '{email}' sudah terdaftar.")
        sys.exit(1)
    conn.execute(text(
        "INSERT INTO users (nama, email, hashed_password, role, is_active, created_at) "
        "VALUES (:nama, :email, :hashed, 'admin', true, NOW())"
    ), {"nama": nama, "email": email, "hashed": hashed})
    conn.commit()
    result = conn.execute(text("SELECT id, nama, email, role FROM users WHERE email = :e"), {"e": email}).first()
    print(f"[+] Akun admin berhasil dibuat!")
    print(f"    Nama  : {result[1]}")
    print(f"    Email : {result[2]}")
    print(f"    Role  : {result[3]}")
    print(f"    ID    : {result[0]}")
