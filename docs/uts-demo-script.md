# Demo Script UTS — LAPORin ITK

Durasi total: ±15 menit

---

## 1. System Demo (±10 menit)

### 0–1 menit — Menjalankan Aplikasi (DevOps)
- Pastikan berada di root project
- Jalankan:
  - `docker compose up -d`
- Verifikasi:
  - `docker compose ps`
- Tunjukkan:
  - Terdapat 3 service: database, backend, frontend
  - Semua dalam kondisi running
  - Database berstatus healthy

Tujuan: menunjukkan aplikasi dapat dijalankan dengan cepat menggunakan Docker

---

### 1–3 menit — User Access Flow (Frontend)
- Buka:
  - http://localhost:3000
- Lakukan registrasi user baru
  - Tampilkan validasi input
- Login menggunakan akun tersebut
- User berhasil masuk ke halaman utama

Penekanan:
- Sistem memiliki autentikasi (tidak bisa akses tanpa login)

---

### 3–6 menit — Interaksi Data (Frontend + Backend)
- Tambahkan beberapa data
- Tampilkan data dalam list
- Gunakan fitur pencarian
- Edit salah satu data
- Hapus data dengan konfirmasi

Penekanan:
- Seluruh operasi CRUD berjalan:
  - Create
  - Read
  - Update
  - Delete

---

### 6–7 menit — API Layer (Backend)
- Buka:
  - http://localhost:8000/docs
- Tunjukkan:
  - Daftar endpoint
  - Endpoint `/health`

Penjelasan:
- Backend menggunakan FastAPI
- Dokumentasi API otomatis tersedia (Swagger)

---

### 7–8 menit — Data Persistence (DevOps)
- Jalankan:
  - `docker compose down`
  - `docker compose up -d`
- Login kembali
- Tunjukkan data masih tersimpan

Penekanan:
- Data tidak hilang karena menggunakan volume database

---

### 8–10 menit — Arsitektur Docker (DevOps)
- Buka file `docker-compose.yml`
- Jelaskan:
  - Struktur services
  - Koneksi antar container
  - Healthcheck dan dependency

Penekanan:
- Semua komponen terintegrasi dalam satu environment

---

## 2. Code Walkthrough (±5 menit)

### 0–2 menit — Konfigurasi Container
- File: `docker-compose.yml`
- Jelaskan:
  - Definisi masing-masing service
  - Penggunaan volume
  - Network antar container

---

### 2–3 menit — Backend
- File: `backend/Dockerfile`
- Jelaskan:
  - Base image
  - Instalasi dependency
  - Optimasi build (layer caching)
- Tambahan:
  - Autentikasi menggunakan JWT

---

### 3–4 menit — Frontend
- File: `frontend/Dockerfile`
- Jelaskan:
  - Proses build React
  - Deployment menggunakan Nginx

---

### 4–5 menit — Dokumentasi
- Tunjukkan `README.md`
- Jelaskan:
  - Cara menjalankan project
  - Struktur folder

Penekanan:
- Dokumentasi memudahkan penggunaan dan pengembangan

---

## 3. Individual Q&A
Setiap anggota menjelaskan:
- Peran masing-masing
- Bagian yang dikerjakan
- Pemahaman konsep:
  - Docker
  - REST API
  - React
  - JWT Authentication