# Setup Guide - LAPORin ITK

Panduan lengkap untuk setup dan menjalankan proyek **LAPORin ITK** dari awal sampai bisa akses aplikasi di browser.

---

## Daftar Isi

1. [Prasyarat (Prerequisites)](#-prasyarat-prerequisites)
2. [Langkah 1: Clone Repository](#-langkah-1-clone-repository)
3. [Langkah 2: Setup Backend](#-langkah-2-setup-backend)
4. [Langkah 3: Setup Database](#-langkah-3-setup-database)
5. [Langkah 4: Konfigurasi Environment (.env)](#-langkah-4-konfigurasi-environment-env)
6. [Langkah 5: Jalankan Backend](#-langkah-5-jalankan-backend)
7. [Langkah 6: Setup Frontend](#-langkah-6-setup-frontend)
8. [Langkah 7: Jalankan Frontend](#-langkah-7-jalankan-frontend)
9. [Langkah 8: Testing Aplikasi](#-langkah-8-testing-aplikasi)
10. [Troubleshooting](#-troubleshooting)

---

## Prasyarat (Prerequisites)

Sebelum memulai, pastikan Anda sudah menginstall:

### Backend Requirements:
- **Python 3.11.x** atau lebih tinggi
  - Download di: https://www.python.org/downloads/
  - Pastikan saat install, centang **"Add Python to PATH"**
  - Verifikasi: Buka Command Prompt/PowerShell, ketik `python --version`

- **PostgreSQL 15.x** atau lebih tinggi
  - Download di: https://www.postgresql.org/download/
  - Install dan catat username/password PostgreSQL (default: `postgres` / password yang Anda buat)
  - Pastikan PostgreSQL service berjalan di sistem Anda
  - Verifikasi: Buka pgAdmin atau gunakan `psql --version`

### Frontend Requirements:
- **Node.js 20.x (LTS)** atau lebih tinggi
  - Download di: https://nodejs.org/
  - Verifikasi: Buka Command Prompt/PowerShell, ketik `node --version` dan `npm --version`

### Version Checker Script (Opsional)
Jika perlu memverifikasi semua versi, jalankan di Command Prompt:

```bash
python --version
psql --version
node --version
npm --version
```

---

## Langkah 1: Clone Repository

### Membuka Terminal/Command Prompt

**Pada Windows:**
1. Tekan `Win + R`
2. Ketik `cmd` atau `powershell`
3. Tekan Enter

### Clone Proyek

```bash
# Navigasi ke folder yang diinginkan (contoh: Documents)
cd Documents

# Clone repository
git clone https://github.com/your-username/cc-kelompok-bismillah_a.git

# Masuk ke folder proyek
cd cc-kelompok-bismillah_a
```

Setelah clone selesai, struktur folder Anda akan terlihat seperti ini:

```
cc-kelompok-bismillah_a/
├── backend/          # FastAPI Backend
├── frontend/         # React Frontend
├── docs/             # Dokumentasi
└── README.md         # Penjelasan proyek
```

---

## Langkah 2: Setup Backend

### 2.1 Buka Terminal Backend

```bash
# Dari folder proyek utama
cd backend
pwd  # Pastikan Anda sudah di folder backend
```

Output seharusnya menunjukkan path ke folder `backend`.

### 2.2 Buat Virtual Environment

Virtual environment adalah folder terisolasi untuk dependencies Python. Ini untuk menghindari konflik versi library.

**Windows (PowerShell/CMD):**
```bash
# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
# Jika menggunakan CMD:
venv\Scripts\activate

# Jika menggunakan PowerShell:
.\venv\Scripts\Activate.ps1
```

**jika error di PowerShell**, jalankan terlebih dahulu:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

[SUCCESS] **Virtual environment aktif** jika Anda melihat `(venv)` di awal terminal Anda.

### 2.3 Install Dependencies

```bash
# Upgrade pip ke versi terbaru
pip install --upgrade pip

# Install semua dependencies dari requirements.txt
pip install -r requirements.txt
```

Tunggu proses instalasi selesai. Ini akan menginstall:
- `fastapi` - Framework untuk REST API
- `uvicorn` - Server untuk FastAPI
- `sqlalchemy` - ORM untuk database
- `psycopg2-binary` - Driver PostgreSQL
- `python-dotenv` - Untuk load env variables
- Dan dependencies lainnya

---

## Langkah 3: Setup Database

### 3.1 Membuat Database PostgreSQL

**Menggunakan pgAdmin (GUI):**

1. Buka pgAdmin (biasanya di http://localhost:5050)
2. Login dengan credentials yang Anda buat saat install PostgreSQL
3. Klik kanan pada **Databases** → **Create** → **Database**
4. Isi form:
   - **Database name:** `cloudapp`
   - **Owner:** `postgres` (atau user Anda)
5. Klik **Save**

**Atau menggunakan Command Line (alternatif):**

```bash
# Windows - buka Command Prompt sebagai Administrator
psql -U postgres

# Di psql console, ketik:
CREATE DATABASE cloudapp;

# Keluar dari psql
\q
```

[SUCCESS] Database `cloudapp` sudah dibuat.

### 3.2 Verifikasi Koneksi

Setelah database dibuat, FastAPI akan otomatis membuat tabel saat pertama kali dijalankan.

---

## Langkah 4: Konfigurasi Environment (.env)

### 4.1 Buka File `.env` Backend

Di folder `backend/`, buka file `.env` dengan text editor (VS Code, Notepad++, dll):

```bash
# Dari folder backend, jika menggunakan VS Code:
code .env
```

### 4.2 Sesuaikan Konfigurasi

Edit file `.env` sesuai dengan setup Anda:

```env
# Database (sesuaikan dengan username/password PostgreSQL Anda)
DATABASE_URL=postgresql://postgres:password@localhost:5432/cloudapp

# JWT Secret Key (gunakan string random minimal 32 karakter)
# Bisa generate di: https://randomkeygen.com/
SECRET_KEY=your-secret-key-minimum-32-characters-replace-this

# JWT Algorithm
ALGORITHM=HS256

# Token expiration time (dalam menit)
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Frontend URL (untuk CORS)
ALLOWED_ORIGINS=http://localhost:5173
```

**Penjelasan:**

| Variable | Fungsi | Default |
|----------|--------|---------|
| `DATABASE_URL` | Koneksi ke PostgreSQL | `postgresql://user:pass@host:port/dbname` |
| `SECRET_KEY` | Kunci untuk JWT token | String random (minimal 32 char) |
| `ALGORITHM` | Algoritma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Durasi token berlaku | `60` menit |
| `ALLOWED_ORIGINS` | URL frontend yang diizinkan | `http://localhost:5173` |

### 4.3 Verifikasi DATABASE_URL

Pastikan format DATABASE_URL benar:
```
postgresql://username:password@localhost:5432/cloudapp
```

**Contoh:**
- Jika PostgreSQL username = `postgres` dan password = `mypassword`
- DATABASE_URL = `postgresql://postgres:mypassword@localhost:5432/cloudapp`

[TIP] **Tips:** Test koneksi menggunakan pgAdmin atau command:
```bash
psql -U postgres -h localhost -d cloudapp
```

---

## Langkah 5: Jalankan Backend

### 5.1 Pastikan Virtual Environment Aktif

```bash
# Di folder backend, pastikan Anda melihat (venv) di terminal
# Jika belum aktif, jalankan:
venv\Scripts\activate  # Windows CMD
# atau
.\venv\Scripts\Activate.ps1  # Windows PowerShell
```

### 5.2 Jalankan FastAPI Server

```bash
# Dari folder backend dengan virtual environment aktif
uvicorn main:app --reload --port 8000
```

**Output yang benar:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

### 5.3 Verifikasi Backend Berjalan

Buka browser dan kunjungi:
- **Health Check:** http://localhost:8000/health
- **Interactive API Docs:** http://localhost:8000/docs
- **Alternative API Docs:** http://localhost:8000/redoc

[SUCCESS] Backend berhasil jika Anda melihat response JSON dan dokumentasi API.

---

## Langkah 6: Setup Frontend

### 6.1 Buka Terminal Baru untuk Frontend

**JANGAN tutup terminal backend!** Buka terminal baru:

```bash
# Dari folder proyek utama (cc-kelompok-bismillah_a)
cd frontend
```

### 6.2 Install Dependencies

```bash
# Install semua npm packages
npm install
```

Tunggu proses instalasi. Ini akan menginstall:
- `react` - UI framework
- `react-dom` - React DOM renderer
- `vite` - Build tool & development server
- Dan dev dependencies lainnya

**Output seharusnya:**
```
added X packages in X seconds
```

### 6.3 Verifikasi Instalasi

```bash
# Check apakah dependencies terinstall dengan benar
npm list --depth=0
```

---

## Langkah 7: Jalankan Frontend

```bash
# Dari folder frontend
npm run dev
```

**Output yang benar:**
```
  VITE v7.3.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

[SUCCESS] Frontend berhasil jika Anda melihat server running di port 5173.

---

## Langkah 8: Testing Aplikasi

### 8.1 Akses Aplikasi

Buka browser dan kunjungi: **http://localhost:5173/**

Anda seharusnya melihat aplikasi LAPORin ITK.

### 8.2 Test Fitur Utama

#### Register User Baru
1. Klik menu Register
2. Isi form:
   - Email: `test@example.com`
   - Nama: `Test User`
   - Password: `password123`
3. Klik Register
4. Jika berhasil, Anda akan diarahkan ke halaman login

#### Login
1. Gunakan email & password yang baru Anda daftar
2. Klik Login
3. Jika berhasil, Anda akan login dan bisa mengakses dashboard

#### Test API Langsung (di Postman/Swagger)
1. Buka http://localhost:8000/docs
2. Coba endpoint di Swagger UI, contoh:
   - **POST /auth/register** - Daftar user baru
   - **POST /auth/login** - Login
   - **GET /health** - Health check

---

## Troubleshooting

### [ERROR] "python: command not found"

**Masalah:** Python belum diinstall atau belum di PATH.

**Solusi:**
1. Download dan install Python dari https://www.python.org/
2. **PENTING:** Saat install, centang opsi "Add Python to PATH"
3. Restart Command Prompt/PowerShell
4. Cek: `python --version`

---

### [ERROR] "psql: command not found" atau PostgreSQL tidak bisa diakses

**Masalah:** PostgreSQL belum diinstall atau service tidak running.

**Solusi:**
1. Install PostgreSQL dari https://www.postgresql.org/download/
2. Pastikan PostgreSQL service running (cek di Windows Services)
3. Verifikasi: Buka pgAdmin atau jalankan `psql -U postgres`
4. **Windows:** Tools → PgAdmin untuk GUI management

---

### [ERROR] "DATABASE_URL tidak ditemukan di .env!"

**Masalah:** File `.env` tidak ada atau environment variable tidak terbaca.

**Solusi:**
1. Pastikan file `.env` ada di folder `backend/`
2. Pastikan isi `.env` sudah benar (lihat [Langkah 4](#-langkah-4-konfigurasi-environment-env))
3. Jika sudah ada, stop backend dan jalankan lagi:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

---

### [ERROR] "ModuleNotFoundError: No module named 'fastapi'"

**Masalah:** Dependencies belum terinstall.

**Solusi:**
1. Pastikan virtual environment aktif (lihat prefix `(venv)` di terminal)
2. Jalankan: `pip install -r requirements.txt`
3. Tunggu sampai selesai

---

### [ERROR] "Connection refused" atau "Cannot connect to database"

**Masalah:** PostgreSQL tidak running atau DATABASE_URL salah.

**Solusi:**
1. Pastikan PostgreSQL service running
   - **Windows:** Buka Services → cari "PostgreSQL" → pastikan "Running"
2. Verifikasi DATABASE_URL di `.env`:
   ```bash
   # Test koneksi manual
   psql -U postgres -h localhost -d cloudapp -c "SELECT 1;"
   ```
3. Jika output `1`, koneksi berhasil

---

### [ERROR] "error: failed to retrieve current user"

**Masalah:** Virtual environment belum aktif.

**Solusi:**
1. Aktifkan virtual environment:
   ```bash
   # Windows CMD
   venv\Scripts\activate
   
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   ```
2. Pastikan Anda melihat `(venv)` di awal prompt terminal

---

### [ERROR] "Port 8000 sudah digunakan"

**Masalah:** Sudah ada aplikasi lain yang menggunakan port 8000.

**Solusi:**
1. Gunakan port berbeda:
   ```bash
   uvicorn main:app --reload --port 8001
   ```
2. Atau stop aplikasi lain yang menggunakan port 8000

---

### [ERROR] "CORS Error" di browser (Frontend tidak bisa akses Backend)

**Masalah:** `ALLOWED_ORIGINS` di `.env` tidak sesuai dengan URL frontend.

**Solusi:**
1. Pastikan `.env` backend sudah benar:
   ```env
   ALLOWED_ORIGINS=http://localhost:5173
   ```
2. Untuk production, tambahkan URL deployment:
   ```env
   ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
   ```
3. Restart backend setelah perubahan `.env`

---

### [ERROR] "npm: command not found"

**Masalah:** Node.js/npm belum diinstall.

**Solusi:**
1. Download dan install Node.js dari https://nodejs.org/
2. Pilih LTS version (20.x)
3. Restart Command Prompt/PowerShell
4. Cek: `npm --version`

---

## Ringkasan Terminal Setup

Setelah semua setup selesai, Anda akan memiliki 2 terminal berjalan:

**Terminal 1 - Backend:**
```bash
# Folder: backend/
# Status: (venv) showing
# Running: uvicorn main:app --reload --port 8000
# URL: http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
# Folder: frontend/
# Running: npm run dev
# URL: http://localhost:5173
```

**Akses aplikasi:** http://localhost:5173/

---

## Next Steps

Setelah aplikasi berjalan:

1. **Baca README.md** untuk info lengkap proyek
2. **Explore API Documentation** di http://localhost:8000/docs
3. **Test Fitur** - Register, Login, Buat Laporan
4. **Check Database** - Buka pgAdmin untuk lihat data yg tersimpan
5. **Review Code** - Di folder `backend/` dan `frontend/src/`

---

## Support

Jika ada pertanyaan atau masalah:

1. Cek bagian **Troubleshooting** di atas
2. Baca dokumentasi di folder `/docs/`
3. Hubungi tim development

---

**Last Updated: 2026-03-22**
