# ============================================================
# Report Service — Dockerfile
# LaporIn ITK Microservices
# ============================================================

FROM python:3.12-slim

WORKDIR /app

# Copy requirements dulu (cache optimization)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy seluruh kode aplikasi
COPY . .

# Non-root user (keamanan)
RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8002/health')" || exit 1

EXPOSE 8002

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
