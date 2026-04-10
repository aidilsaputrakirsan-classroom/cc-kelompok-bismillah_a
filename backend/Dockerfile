# ============================================================
# LaporIn ITK — Dockerfile (Backend) - MULTI-STAGE BUILD
# Lead DevOps: Muhammad Novri Aziztra
# Modul 5: Docker Fundamentals
# ============================================================

# 1. Base image — Python 3.12 slim (debian minimal, ~50MB)
FROM python:3.12-slim

# 2. Set working directory di dalam container
WORKDIR /app

# 3. Copy HANYA requirements.txt dulu (cache optimization)
#    Layer ini hanya rebuild jika requirements.txt berubah
COPY requirements.txt .

# 4. Install Python dependencies
#    --no-cache-dir: jangan simpan pip cache (hemat space)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy seluruh kode aplikasi
#    Layer ini rebuild setiap kali kode berubah
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

# 9. Command untuk menjalankan aplikasi
#    --host 0.0.0.0: agar bisa diakses dari luar container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]