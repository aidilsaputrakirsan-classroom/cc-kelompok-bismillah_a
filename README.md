# 📋 LaporIn ITK

> Sistem Pelaporan Digital Institut Teknologi Kalimantan

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-✓-blue)](https://docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-✓-336791)](https://www.postgresql.org/)

---

## 🎯 Deskripsi

**LaporIn ITK** adalah platform pelaporan digital untuk civitas akademika Institut Teknologi Kalimantan. Memungkinkan mahasiswa, dosen, dan staf untuk melaporkan:

- 🔍 **Kehilangan Barang** — dengan tracking lokasi real-time di peta
- 🏗️ **Kerusakan Fasilitas** — laporan kerusakan gedung, peralatan, dll.
- 🛡️ **Perundungan** — laporan anonim yang aman dan terlindungi

---

## 👥 Tim Pengembang — Kelompok Bismillah_A

| Nama | NIM | Role |
|------|-----|------|
| Aditya Laksamana P Butar Butar | 10231006 | Lead Backend |
| Firni Fauziah Ramadhini | 10231038 | Lead Frontend |
| Muhammad Novri Aziztra | 10231066 | Lead DevOps |
| Salsabila Putri Zahrani | 10231086 | Lead QA & Docs |

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy ORM |
| Database | PostgreSQL |
| Frontend | React 19, Vite, React Router, Leaflet |
| Auth | JWT (JSON Web Token) |
| Container | Docker |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Docker (opsional)

### 1. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy konfigurasi
cp .env.example .env
# Edit .env sesuaikan DATABASE_URL

# Buat database PostgreSQL
# Di PostgreSQL: CREATE DATABASE laporin_itk;

# Jalankan backend (tabel otomatis dibuat)
uvicorn main:app --reload --port 8000
```

Backend berjalan di: http://localhost:8000  
Swagger UI: http://localhost:8000/docs

### 2. Setup Frontend

```bash
# Masuk ke folder frontend
cd frontend

# Install node modules
npm install

# Jalankan development server
npm run dev
```

Frontend berjalan di: http://localhost:5173

### 3. Jalankan dengan Docker (Backend)

```bash
cd backend

# Build image
docker build -t laporin-backend:v1 .

# Jalankan (pastikan PostgreSQL berjalan di host)
docker run -d -p 8000:8000 --env-file .env --name laporin-backend laporin-backend:v1

# Cek status
docker logs laporin-backend
curl http://localhost:8000/health
```

---

## 📁 Struktur Project

```
cc-kelompok-bismillah_a/
├── backend/
│   ├── main.py          # FastAPI app & endpoints
│   ├── models.py        # SQLAlchemy models (11 tabel)
│   ├── schemas.py       # Pydantic schemas (validasi)
│   ├── crud.py          # CRUD & business logic
│   ├── auth.py          # JWT authentication
│   ├── database.py      # Database connection
│   ├── requirements.txt
│   ├── Dockerfile       # Docker config (non-root user + healthcheck)
│   ├── .env.example
│   └── .dockerignore
├── frontend/
│   └── src/
│       ├── App.jsx              # Router + route guards
│       ├── index.css            # Design system (CSS tokens)
│       ├── components/
│       │   └── Navbar.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── BuatLaporanPage.jsx
│       │   ├── DetailLaporanPage.jsx
│       │   └── AdminDashboardPage.jsx
│       └── services/
│           └── api.js           # Backend communication layer
├── docs/
│   ├── api-docs.md              # API documentation
│   └── docker-cheatsheet.md    # Docker commands reference
└── README.md
```

---

## 🗄️ Database Schema (11 Tabel)

```
users → reports ← categories
reports → report_locations (tracking)
reports → report_attachments (foto/bukti)
reports → report_status_logs (riwayat status)
reports → comments ← users
reports → report_assignments → units
reports → feedback
users → notifications
```

---

## 📊 API Endpoints

Lihat dokumentasi lengkap di: [`docs/api-docs.md`](docs/api-docs.md)

| Endpoint | Metode | Akses |
|----------|--------|-------|
| `/auth/register` | POST | Public |
| `/auth/login` | POST | Public |
| `/categories` | GET | Public |
| `/reports` | GET, POST | User |
| `/reports/{id}` | GET | User |
| `/reports/{id}/comments` | GET, POST | User |
| `/notifications` | GET | User |
| `/admin/stats` | GET | Admin |
| `/admin/reports` | GET | Admin |
| `/admin/reports/{id}` | PUT | Admin |

---

## 🐳 Docker Cheatsheet

Lihat: [`docs/docker-cheatsheet.md`](docs/docker-cheatsheet.md)

---

## 📝 Modul yang Sudah Diselesaikan

| Modul | Topik | Status |
|-------|-------|--------|
| Modul 1 | Setup Environment, FastAPI Hello World | ✅ |
| Modul 2 | REST API CRUD + PostgreSQL + SQLAlchemy | ✅ |
| Modul 3 | React Frontend | ✅ |
| Modul 4 | Autentikasi JWT | ✅ |
| Modul 5 | Docker + Dockerfile | ✅ |

---

*SI Komputasi Awan — Institut Teknologi Kalimantan 2026*