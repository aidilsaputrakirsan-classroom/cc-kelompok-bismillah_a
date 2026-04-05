# 🐳 Docker Cheatsheet — LaporIn ITK
---

## Build & Image

```bash
# Build image dari Dockerfile (jalankan di folder backend/)
docker build -t laporin-backend:v1 .

# Build dengan versi tag baru
docker build -t laporin-backend:v2 .

# Lihat semua image
docker images

# Lihat ukuran image
docker images laporin-backend

# Lihat layer history
docker history laporin-backend:v1

# Hapus image
docker rmi laporin-backend:v1
```

---

## Run Container

```bash
# Jalankan container di foreground (dev/testing)
docker run -p 8000:8000 --env-file .env laporin-backend:v1

# Jalankan di background (detached mode)
docker run -d -p 8000:8000 --env-file .env --name laporin-backend laporin-backend:v1

# Jalankan dengan environment variable langsung
docker run -d -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:password@host.docker.internal:5432/laporin_itk \
  -e SECRET_KEY=your-secret-key \
  --name laporin-backend \
  laporin-backend:v1
```

---

## Manage Container

```bash
# Lihat container yang sedang berjalan
docker ps

# Lihat semua container (termasuk yang stopped)
docker ps -a

# Lihat log container
docker logs laporin-backend

# Ikuti log secara real-time
docker logs -f laporin-backend

# Masuk ke dalam container (seperti SSH)
docker exec -it laporin-backend bash

# Cek status healthcheck
docker inspect --format='{{.State.Health.Status}}' laporin-backend

# Stop container
docker stop laporin-backend

# Start container yang sudah stopped
docker start laporin-backend

# Restart container
docker restart laporin-backend

# Hapus container (harus di-stop dulu)
docker rm laporin-backend

# Stop dan hapus sekaligus
docker rm -f laporin-backend
```

---

## Docker Hub (Registry)

```bash
# Login ke Docker Hub
docker login

# Tag image untuk push
docker tag laporin-backend:v1 USERNAME/laporin-backend:v1

# Contoh:
docker tag laporin-backend:v1 novriaziztra/laporin-backend:v1

# Push ke Docker Hub
docker push USERNAME/laporin-backend:v1

# Pull dari Docker Hub
docker pull USERNAME/laporin-backend:v1

# Jalankan langsung dari Docker Hub
docker run -p 8000:8000 --env-file .env USERNAME/laporin-backend:v1
```

---

## Cleanup

```bash
# Hapus semua container yang stopped
docker container prune

# Hapus dangling images (image tanpa tag)
docker image prune

# Hapus semua yang tidak dipakai (images, containers, networks)
docker system prune

# Nuclear option — HATI-HATI! Menghapus semua
docker system prune -a
```

---

## Troubleshooting

| Problem | Penyebab | Solusi |
|---------|----------|--------|
| `Cannot connect to Docker daemon` | Docker Desktop belum jalan | Buka Docker Desktop, tunggu icon hijau |
| `Port already in use` | Port 8000 sudah dipakai | `docker rm -f laporin-backend` atau ganti port |
| `Database connection refused` | localhost tidak dikenali di container | Ganti URL ke `host.docker.internal` |
| `Permission denied` | Running as root | Tambah user ke docker group (Linux) |
| Image sangat besar | Banyak layer atau file tidak perlu | Periksa `.dockerignore`, gunakan slim image |

---

## Spesifik LaporIn ITK

```bash
# Build backend LaporIn ITK
cd backend
docker build -t laporin-backend:v1 .

# Jalankan backend (pastikan PostgreSQL sudah jalan di host)
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name laporin-backend \
  laporin-backend:v1

# Cek API berjalan
curl http://localhost:8000/health
# Response: {"status":"healthy","version":"1.0.0","app":"LaporIn ITK"}

# Akses Swagger UI
# Buka browser: http://localhost:8000/docs
```