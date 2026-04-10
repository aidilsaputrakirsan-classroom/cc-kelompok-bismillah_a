#!/bin/sh
# ============================================================
# wait-for-db.sh — LaporIn ITK (Lead Backend)
# Ping PostgreSQL sebelum start uvicorn.
# Mencegah error "connection refused" saat DB belum siap.
# ============================================================

set -e

MAX_RETRIES=30
RETRY=0

echo "[wait-for-db] Memeriksa koneksi ke PostgreSQL..."

until python - <<EOF 2>/dev/null
import os, sys, urllib.parse, socket

url = os.environ.get("DATABASE_URL", "")
if not url:
    print("[wait-for-db] ERROR: DATABASE_URL tidak ditemukan!", file=sys.stderr)
    sys.exit(2)

parsed = urllib.parse.urlparse(url)
host   = parsed.hostname
port   = parsed.port or 5432

try:
    s = socket.create_connection((host, port), timeout=2)
    s.close()
except Exception as e:
    print(f"[wait-for-db] Belum bisa konek ke {host}:{port} — {e}", file=sys.stderr)
    sys.exit(1)
EOF
do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "[wait-for-db] GAGAL: PostgreSQL tidak tersedia setelah $MAX_RETRIES percobaan. Keluar."
    exit 1
  fi
  echo "[wait-for-db] PostgreSQL belum siap (percobaan $RETRY/$MAX_RETRIES). Menunggu 2 detik..."
  sleep 2
done

echo "[wait-for-db] PostgreSQL siap! Memulai uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
