# ============================================================
# LaporIn ITK — Dockerfile (Backend) - MULTI-STAGE BUILD
# Lead DevOps: Muhammad Novri Aziztra
# Modul 6: Optimasi & Dokumentasi Multi-Container
# Target: image < 150 MB
# ============================================================

# ────────────────────────────────────────────────
# STAGE 1: builder — install semua dependencies di venv
# ────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Buat virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements dulu (cache optimization)
COPY requirements.txt .

# Install dependencies ke dalam venv
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ────────────────────────────────────────────────
# STAGE 2: runtime — image final (ringan)
# Hanya berisi: Python runtime + venv + kode
# TIDAK ada: pip cache, build tools
# ────────────────────────────────────────────────
FROM python:3.12-slim

# Ambil venv dari stage builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy seluruh kode aplikasi
COPY . .

# Pastikan startup script bisa dieksekusi
RUN chmod +x scripts/wait-for-db.sh

# Non-root user (keamanan)
RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Gunakan wait-for-db.sh agar backend tunggu DB dulu
CMD ["sh", "scripts/wait-for-db.sh"]