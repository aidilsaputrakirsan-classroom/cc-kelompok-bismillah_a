# ============================================================
# LaporIn ITK — Dockerfile (Backend) - MULTI-STAGE BUILD
# Lead DevOps: Muhammad Novri Aziztra
# Modul 6: Optimasi Image & Dokumentasi Docker
# Target: image size < 150 MB
# ============================================================

# ────────────────────────────────────────────────
# STAGE 1: builder — install semua dependencies
# ────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Buat virtual environment (venv)
# venv memisahkan dependencies agar mudah di-copy ke stage berikutnya
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy HANYA requirements.txt dulu → cache optimization
# Layer ini hanya rebuild jika requirements.txt berubah
COPY requirements.txt .

# Install seluruh dependencies ke dalam venv
# --no-cache-dir: tidak simpan cache pip (hemat space di builder)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ────────────────────────────────────────────────
# STAGE 2: runtime — image final (ringan)
# Hanya berisi: Python runtime + venv + kode aplikasi
# TIDAK ada: pip, setuptools, build tools, cache pip
# ────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Import virtual environment dari stage builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy seluruh kode aplikasi
COPY . .

# Pastikan startup script bisa dieksekusi
RUN chmod +x scripts/wait-for-db.sh

# Buat non-root user untuk keamanan (Best Practice)
RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

# Dokumentasikan port yang digunakan
EXPOSE 8000

# Health check — cek apakah API berjalan setiap 30 detik
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Gunakan wait-for-db.sh — ping PostgreSQL sebelum start uvicorn
CMD ["sh", "scripts/wait-for-db.sh"]