# ============================================================
# LaporIn ITK — Dockerfile (Backend)
# Lead DevOps: Muhammad Novri Aziztra
# Modul 6: Optimasi & Dokumentasi Multi-Container
# ============================================================

# Base image — Python 3.12 slim (debian minimal, ~50MB)
FROM python:3.12-slim

# Set working directory di dalam container
WORKDIR /app

# Copy HANYA requirements.txt dulu (cache optimization)
# Layer ini hanya rebuild jika requirements.txt berubah
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir: jangan simpan pip cache (hemat space)
RUN pip install --no-cache-dir -r requirements.txt

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

# Gunakan wait-for-db.sh sebagai startup script (Lead Backend)
# Script akan ping PostgreSQL terlebih dahulu sebelum jalankan uvicorn
CMD ["sh", "scripts/wait-for-db.sh"]
