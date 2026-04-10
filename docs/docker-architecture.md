# 🐳 Arsitektur Docker — LaporIn ITK

**Tugas 6: Optimasi & Dokumentasi Multi-Container**  
Lead QA & Docs: Salsabila Putri Zahrani

---

## Gambaran Umum

LaporIn ITK dijalankan menggunakan **3 container Docker** yang saling terhubung dalam satu jaringan internal bernama `laporin_net`. Setiap container memiliki tugas dan tanggung jawab yang berbeda.

---

## Diagram Arsitektur

```mermaid
graph TB
    subgraph Internet["🌐 User / Browser"]
        U[("👤 Pengguna")]
    end

    subgraph Host["💻 Host Machine (Laptop)"]
        P3000["Port 3000"]
        P8000["Port 8000"]
        P5433["Port 5433"]
    end

    subgraph Network["🔗 Docker Network: laporin_net"]
        direction TB

        subgraph FE["📦 Container: frontend"]
            N["nginx:alpine\n(Port 80)"]
            STATIC["Static Files\n(React Build)"]
        end

        subgraph BE["📦 Container: backend"]
            UV["uvicorn\n(Port 8000)"]
            API["FastAPI App\nmain.py"]
            WAIT["⏳ wait-for-db.sh"]
        end

        subgraph DB["📦 Container: laporin"]
            PG["postgres:16-alpine\n(Port 5432)"]
            DATA[("💾 Volume: pgdata")]
        end
    end

    U -->|"http://localhost:3000"| P3000
    P3000 -->|"Port mapping\n3000→80"| N
    N -->|"Static files\n(JS, CSS, HTML)"| STATIC
    N -->|"API Proxy\n/auth, /reports\n/categories, dll"| UV
    P8000 -->|"Port mapping\n8000→8000"| UV
    UV --> API
    API -->|"SQLAlchemy ORM\n(DATABASE_URL)"| PG
    WAIT -->|"Cek koneksi\nsebelum start"| PG
    PG --- DATA
    P5433 -->|"Port mapping\n5433→5432"| PG
```

---

## Detail Setiap Container

### 1. 📦 Container: `frontend`

| Properti | Nilai |
|----------|-------|
| **Image** | `laporin_itk-frontend:v1` |
| **Base Image** | `nginx:alpine` |
| **Port Host** | `3000` |
| **Port Container** | `80` |
| **Network** | `laporin_net` |
| **Volume** | Tidak ada (stateless) |

**Tugas:**
- Menyajikan file statis hasil build React (HTML, CSS, JS)
- Memproksikan semua request API (`/auth`, `/reports`, dll.) ke container backend
- Menjalankan konfigurasi nginx dengan gzip compression dan security headers

**Environment Variables:** Tidak ada (konfigurasi via `nginx.conf`)

---

### 2. 📦 Container: `backend`

| Properti | Nilai |
|----------|-------|
| **Image** | `laporin_itk-backend:v1` |
| **Base Image** | `python:3.12-slim` (multi-stage) |
| **Port Host** | `8000` |
| **Port Container** | `8000` |
| **Network** | `laporin_net` |
| **Volume** | Tidak ada (stateless) |
| **Startup Script** | `scripts/wait-for-db.sh` |

**Tugas:**
- Menjalankan REST API FastAPI via uvicorn
- Mengelola autentikasi JWT, laporan, komentar, notifikasi
- Menunggu PostgreSQL siap sebelum start (via `wait-for-db.sh`)

**Environment Variables (via `.env.docker`):**

| Variable | Contoh Nilai | Keterangan |
|----------|-------------|------------|
| `DATABASE_URL` | `postgresql://postgres:pass@laporin:5432/laporin_itk` | Koneksi ke container DB |
| `SECRET_KEY` | `09e5d865...` | Kunci JWT (min 32 karakter) |
| `ALGORITHM` | `HS256` | Algoritma JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Masa berlaku token |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS whitelist |

---

### 3. 📦 Container: `laporin` (Database)

| Properti | Nilai |
|----------|-------|
| **Image** | `postgres:16-alpine` |
| **Port Host** | `5433` |
| **Port Container** | `5432` |
| **Network** | `laporin_net` |
| **Volume** | `pgdata:/var/lib/postgresql/data` |

**Tugas:**
- Menyimpan seluruh data aplikasi (users, laporan, komentar, dll.)
- Menjalankan PostgreSQL versi 16

**Environment Variables:**

| Variable | Nilai |
|----------|-------|
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | `aditya221004` |
| `POSTGRES_DB` | `laporin_itk` |

---

## Docker Network

| Properti | Nilai |
|----------|-------|
| **Nama** | `laporin_net` |
| **Driver** | `bridge` (default) |
| **Komunikasi Internal** | Container berkomunikasi via nama container (hostname) |

**Contoh:** Backend connect ke DB menggunakan hostname `laporin` (bukan `localhost`):
```
DATABASE_URL=postgresql://postgres:pass@laporin:5432/laporin_itk
```

---

## Docker Volume

| Nama | Digunakan Oleh | Tujuan |
|------|----------------|--------|
| `pgdata` | Container `laporin` | Menyimpan data PostgreSQL secara persisten |

> **Penting:** Data tetap aman meskipun container dihapus dan dibuat ulang, selama volume `pgdata` tidak dihapus.

---

## Alur Startup

```mermaid
sequenceDiagram
    participant DevOps as 👨‍💻 DevOps
    participant DB as 🗄️ Container: laporin (DB)
    participant BE as ⚙️ Container: backend
    participant FE as 🌐 Container: frontend
    participant User as 👤 User Browser

    DevOps->>DB: docker run postgres:16-alpine
    Note over DB: PostgreSQL mulai inisialisasi...
    DevOps->>BE: docker run laporin_itk-backend:v1
    BE->>BE: Jalankan wait-for-db.sh
    BE-->>DB: Ping port 5432 (coba koneksi)
    DB-->>BE: ❌ Belum siap, retry...
    BE-->>DB: Ping ulang (setiap 2 detik)
    DB-->>BE: ✅ Siap!
    BE->>BE: Start uvicorn (FastAPI)
    BE->>DB: CREATE TABLE (auto migrate)
    BE->>DB: Seed categories & units
    DevOps->>FE: docker run laporin_itk-frontend:v1
    FE->>FE: Start nginx
    User->>FE: GET http://localhost:3000
    FE->>User: HTML + React App
    User->>FE: POST /auth/login
    FE->>BE: Proxy → POST /auth/login
    BE->>DB: SELECT user WHERE email=...
    DB-->>BE: User data
    BE-->>FE: JWT Token
    FE-->>User: Login berhasil
```

---

## Port Mapping Summary

```
Host (Laptop)          Container
─────────────────────────────────────
localhost:3000   →→→   frontend:80
localhost:8000   →→→   backend:8000
localhost:5433   →→→   laporin:5432
```

---

*Dokumentasi dibuat untuk Tugas 6 Cloud Computing — Tim Bismillah_A*
