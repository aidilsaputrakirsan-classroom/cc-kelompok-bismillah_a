# 📋 LaporIn ITK

> Sistem Pelaporan Digital Institut Teknologi Kalimantan

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-✓-blue)](https://docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-✓-336791)](https://www.postgresql.org/)

---

## 🎯 Deskripsi

**LaporIn ITK** adalah platform pelaporan digital yang dirancang khusus untuk civitas akademika Institut Teknologi Kalimantan (ITK). Platform ini hadir sebagai jembatan antara pengguna kampus dan pihak yang berwenang — memungkinkan proses pelaporan yang selama ini dilakukan secara manual, lisan, atau tidak terstruktur, kini dapat dilakukan secara digital, terdokumentasi, dan dapat ditindaklanjuti dengan lebih efisien.

LaporIn ITK mencakup tiga kategori pelaporan utama:

- 🔍 **Kehilangan Barang** — Pengguna dapat membuat laporan kehilangan lengkap dengan titik lokasi kejadian yang ditandai langsung di peta interaktif berbasis Leaflet. Laporan yang masuk dapat dilihat oleh seluruh civitas akademika, sehingga informasi menyebar lebih luas dan peluang barang ditemukan kembali menjadi jauh lebih besar dibandingkan sekadar pengumuman lisan atau poster fisik.

- 🏗️ **Kerusakan Fasilitas** — Pengguna dapat melaporkan kerusakan infrastruktur kampus seperti atap bocor, peralatan laboratorium yang rusak, lampu mati, atau fasilitas umum yang tidak berfungsi. Setiap laporan dilengkapi dengan deskripsi kerusakan dan titik lokasi spesifik, sehingga pihak yang berwenang dapat mengidentifikasi masalah dan mengambil tindakan perbaikan dengan lebih cepat dan terarah.

- 🛡️ **Perundungan** — Pengguna dapat menyampaikan laporan terkait tindakan perundungan, intimidasi, atau perilaku tidak menyenangkan di lingkungan kampus secara anonim. Identitas pelapor dijaga penuh kerahasiaannya oleh sistem, sehingga korban maupun saksi dapat melapor tanpa rasa takut akan konsekuensi sosial. Fitur ini hadir sebagai wujud komitmen ITK terhadap lingkungan kampus yang aman dan kondusif bagi semua.

---

## 📅 Roadmap

| Minggu | Target                 | Status |
| ------ | ---------------------- | ------ |
| 1      | Setup & Hello World    | ✅     |
| 2      | REST API + Database    | ✅     |
| 3      | React Frontend         | ✅     |
| 4      | Full-Stack Integration | ✅     |
| 5-7    | Docker & Compose       | ✅     |
| 8      | UTS Demo               | ⬜     |
| 9-11   | CI/CD Pipeline         | ⬜     |
| 12-14  | Microservices          | ⬜     |
| 15-16  | Final & UAS            | ⬜     |

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

| Teknologi       | Layer      | Fungsi                  | Keterangan                                                                                                                                     |
| --------------- | ---------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Python 3.12     | Backend    | Bahasa pemrograman      | Bahasa utama yang digunakan untuk membangun logika backend, dipilih karena ekosistemnya yang luas dan kompatibel dengan FastAPI                 |
| FastAPI         | Backend    | REST API Framework      | Membangun layanan backend berbasis REST API yang menangani logika aplikasi, pengolahan data, dan komunikasi dengan database                     |
| SQLAlchemy ORM  | Backend    | Object-Relational Mapper | Mengelola interaksi antara kode Python dan database secara lebih terstruktur tanpa perlu menulis query SQL secara langsung                     |
| PostgreSQL      | Database   | Penyimpanan data        | Menyimpan seluruh data aplikasi secara terstruktur dan relasional                                                                              |
| React 19        | Frontend   | UI Framework            | Membangun antarmuka pengguna berbasis Single Page Application yang interaktif dan responsif                                                    |
| Vite            | Frontend   | Build Tool              | Mengelola proses development dan build aplikasi React dengan kecepatan tinggi berkat arsitektur berbasis ES Module                             |
| React Router    | Frontend   | Client-side Routing     | Mengatur navigasi antar halaman di sisi client tanpa perlu melakukan reload halaman penuh                                                      |
| Leaflet         | Frontend   | Peta Interaktif         | Menampilkan peta interaktif di antarmuka pengguna, mendukung fitur seperti marker, layer, dan navigasi berbasis lokasi                         |
| JWT             | Auth       | Autentikasi             | Mengamankan akses ke endpoint dengan sistem token — setiap request dari pengguna yang sudah login wajib menyertakan token yang valid           |
| Docker          | Container  | Containerization        | Mengemas aplikasi dan seluruh dependensinya ke dalam container sehingga aplikasi dapat berjalan secara konsisten di berbagai environment        |

---

## 🏗️ Architecture

```
[Client / Civitas ITK]
         |
      (HTTPS)
         |
         v
 [React Frontend (Vite)] <---REST API---> [FastAPI Backend]
                                            /           \
                                       (SQL/ORM)     (API/SDK)
                                          /               \
                                         v                 v
                                [PostgreSQL]         [Cloud Storage]
                              (Data Laporan,       (Penyimpanan File
                               Akun & Status)       Bukti Insiden)
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

## 🚀 Cara Menjalankan

### Prasyarat

#### 1. Python 3.10+

Python digunakan untuk menjalankan backend yang dibangun menggunakan FastAPI. Versi minimal 3.10+ diperlukan karena kompatibel dengan seluruh dependensi modern yang digunakan proyek ini.

Digunakan untuk:
- Menjalankan server API dengan `uvicorn`
- Mengelola dependensi menggunakan `pip`
- Menjalankan seluruh logika backend aplikasi

Tanpa Python, backend tidak dapat dijalankan.

#### 2. Node.js 18+

Node.js digunakan untuk menjalankan frontend berbasis React yang dibangun dengan Vite. Versi minimal 18+ diperlukan karena mendukung fitur JavaScript modern dan kompatibel penuh dengan ekosistem Vite.

Digunakan untuk:
- Menginstall dependencies frontend dengan `npm install`
- Menjalankan development server dengan `npm run dev`
- Mengelola seluruh package yang dibutuhkan frontend

Tanpa Node.js, frontend tidak dapat dijalankan.

#### 3. PostgreSQL 14+

PostgreSQL digunakan sebagai database utama untuk menyimpan seluruh data aplikasi secara terstruktur dan relasional. Versi minimal 14+ direkomendasikan karena lebih stabil dan mendukung fitur JSON yang digunakan oleh beberapa bagian aplikasi.

Digunakan untuk:
- Menyimpan data laporan, pengguna, dan seluruh entitas aplikasi
- Menjaga integritas data melalui relasi antar tabel
- Mendukung query kompleks dari backend via SQLAlchemy ORM

Tanpa PostgreSQL yang berjalan, backend tidak dapat terhubung ke database dan aplikasi tidak akan berfungsi.

#### 4. Docker *(opsional)*

Docker digunakan untuk mengemas backend beserta seluruh dependensinya ke dalam container yang terisolasi. Penggunaan Docker bersifat opsional — aplikasi tetap dapat dijalankan secara manual tanpa Docker.

Digunakan untuk:
- Menjalankan backend tanpa perlu menginstall Python dan dependensi secara manual
- Memastikan aplikasi berjalan konsisten di berbagai environment
- Mempermudah proses deployment ke server

---

## 📖 Quick Start

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Install dependencies Python
pip install -r requirements.txt

# 3. Salin file konfigurasi dan sesuaikan isinya
cp .env.example .env
# Buka .env, lalu sesuaikan nilai DATABASE_URL dengan koneksi PostgreSQL kamu

# 4. Buat database di PostgreSQL
# Jalankan perintah ini di dalam psql:
# CREATE DATABASE laporin_itk;

# 5. Jalankan backend (tabel dibuat otomatis saat pertama kali dijalankan)
uvicorn main:app --reload --port 8000

# 6. Buka terminal baru, lalu masuk ke folder frontend
cd frontend

# 7. Install dependencies Node.js
npm install

# 8. Jalankan frontend development server
npm run dev
```

Setelah kedua server berjalan:
- **Frontend** dapat diakses di: `http://localhost:5173`
- **Backend API** dapat diakses di: `http://localhost:8000`
- **Dokumentasi API (Swagger UI)** dapat diakses di: `http://localhost:8000/docs`

Panduan langkah-langkah yang lengkap untuk menjalankan proyek ini dapat dilihat di [Setup Guide](docs/setup-guide.md).

---

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

Backend berjalan di: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

---

### 2. Setup Frontend

```bash
# Masuk ke folder frontend
cd frontend

# Install node modules
npm install

# Jalankan development server
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

### 3. Jalankan dengan Docker *(opsional)*

Jika tidak ingin menginstall Python secara manual, backend dapat dijalankan menggunakan Docker. Pastikan PostgreSQL sudah berjalan di host sebelum menjalankan container.

```bash
# Masuk ke folder backend
cd backend

# Build Docker image
docker build -t laporin-backend:v1 .

# Jalankan container (menggunakan konfigurasi dari file .env)
docker run -d -p 8000:8000 --env-file .env --name laporin-backend laporin-backend:v1

# Cek apakah container berjalan dengan benar
docker logs laporin-backend

# Verifikasi backend merespons
curl http://localhost:8000/health
```

> **Catatan:** Opsi `--env-file .env` memastikan container membaca konfigurasi database dari file `.env` yang sudah disiapkan sebelumnya. Pastikan nilai `DATABASE_URL` di dalam `.env` mengarah ke host PostgreSQL yang aktif.

---

## 🔧 Backend

Backend LaporIn ITK dibangun menggunakan **FastAPI**, framework Python modern yang dirancang khusus untuk membangun REST API yang cepat, ringan, dan mudah didokumentasikan. FastAPI juga menghasilkan dokumentasi interaktif secara otomatis yang dapat diakses melalui Swagger UI di `http://localhost:8000/docs`.

### Sistem Autentikasi

LaporIn ITK menggunakan sistem autentikasi berbasis token untuk menjaga keamanan akses ke seluruh endpoint yang dilindungi:

- **JWT (JSON Web Token)** — setiap pengguna yang berhasil login akan mendapatkan token unik. Token ini wajib disertakan di setiap request ke endpoint yang membutuhkan autentikasi. Tanpa token yang valid, request akan ditolak oleh server.
- **bcrypt** — digunakan untuk mengenkripsi password sebelum disimpan ke database, sehingga password asli tidak pernah tersimpan dalam bentuk teks biasa meskipun database berhasil diakses oleh pihak yang tidak berwenang.

### Struktur Data

Data utama yang dikelola oleh backend meliputi:

- **Users** — menyimpan data akun pengguna yang terdaftar di sistem
- **Reports** — menyimpan seluruh laporan yang dibuat pengguna, mencakup kategori laporan (kehilangan barang, kerusakan fasilitas, atau perundungan), deskripsi, titik lokasi, status penanganan, dan waktu pelaporan

### Alur Kerja Backend

```
Request dari Frontend
        ↓
Validasi Token JWT
        ↓
Validasi Data Input (Pydantic)
        ↓
Proses Logika Bisnis
        ↓
Query ke PostgreSQL via SQLAlchemy ORM
        ↓
Response JSON dikembalikan ke Frontend
```

---

## 🎨 Frontend

Frontend LaporIn ITK dibangun menggunakan **React 19** dengan **Vite** sebagai build tool, menghadirkan antarmuka yang cepat, responsif, dan mudah digunakan oleh seluruh civitas akademika ITK. Navigasi antar halaman dikelola menggunakan **React Router** tanpa perlu reload halaman penuh.

### Manajemen State

- **React Context API** — digunakan untuk mengelola state autentikasi secara global, sehingga status login pengguna dapat diakses dari seluruh bagian aplikasi tanpa perlu melewatkan data secara manual antar komponen
- **LocalStorage** — digunakan untuk menyimpan JWT di sisi client, sehingga pengguna tidak perlu login ulang setiap kali membuka atau merefresh aplikasi
- **Protected Route** — halaman tertentu hanya dapat diakses oleh pengguna yang sudah login. Pengguna yang belum terautentikasi akan diarahkan ke halaman login secara otomatis

### Alur Integrasi Frontend ke Backend

```
Aksi Pengguna (isi form, klik tombol, dll.)
        ↓
Axios / Fetch API mengirim HTTP Request ke Backend
        ↓
FastAPI memproses request dan query ke database
        ↓
Backend mengembalikan Response JSON
        ↓
State React diperbarui
        ↓
Tampilan UI diperbarui secara otomatis
```

---

## 📦 Modul Aplikasi

### 1. Modul Autentikasi

#### Endpoint API
| No | Fitur | Endpoint | Method | Keterangan |
| --- | --- | --- | --- | --- |
| 1 | Registrasi Akun | `/auth/register` | POST | Mendaftarkan akun pengguna baru dengan validasi nama, email, password, dan nomor HP |
| 2 | Login | `/auth/login` | POST | Autentikasi pengguna dan mengembalikan JWT token |
| 3 | Get Current User | `/auth/me` | GET | Mengambil data pengguna yang sedang login berdasarkan token |
| 4 | Logout | `/auth/logout` | POST | Mengakhiri sesi pengguna dan menghapus token dari sisi client |

#### Halaman & Fitur UI
| No | Halaman | Deskripsi |
| --- | --- | --- |
| 1 | Landing Page | Halaman awal dengan tombol navigasi ke Register dan Login |
| 2 | Register | Form pendaftaran dengan validasi nama, email, format password, dan nomor HP |
| 3 | Login | Form login dengan validasi input dan penyimpanan JWT ke LocalStorage |
| 4 | Logout | Menghapus token dari LocalStorage dan mengarahkan pengguna kembali ke halaman login |

---

### 2. Modul Laporan

#### Endpoint API
| No | Fitur | Endpoint | Method | Keterangan |
| --- | --- | --- | --- | --- |
| 1 | Buat Laporan | `/reports` | POST | Membuat laporan baru dengan kategori, judul, deskripsi, tanggal, dan koordinat lokasi opsional |
| 2 | Lihat Laporan Saya | `/reports/me` | GET | Menampilkan seluruh laporan milik pengguna yang sedang login |
| 3 | Detail Laporan | `/reports/{id}` | GET | Menampilkan detail laporan berdasarkan ID |
| 4 | Edit Laporan | `/reports/{id}` | PUT | Memperbarui data laporan yang sudah dibuat oleh pengguna |
| 5 | Hapus Laporan | `/reports/{id}` | DELETE | Menghapus laporan milik pengguna |
| 6 | Filter Laporan | `/reports?status={}&type={}` | GET | Menyaring laporan berdasarkan status dan/atau kategori |

#### Halaman & Fitur UI
| No | Halaman | Deskripsi |
| --- | --- | --- |
| 1 | Buat Laporan | Form input dengan pemilihan kategori, judul, deskripsi, tanggal, opsi anonim, dan penanda lokasi di peta interaktif |
| 2 | Laporan Saya | Daftar laporan milik pengguna dengan filter status dan kategori, termasuk empty state saat belum ada laporan |
| 3 | Detail Laporan | Informasi lengkap laporan beserta titik lokasi di peta |
| 4 | Edit Laporan | Form untuk memperbarui data laporan yang sudah dibuat sebelumnya |
| 5 | Hapus Laporan | Konfirmasi penghapusan laporan sebelum data benar-benar dihapus |

---

### 3. Modul Peta Interaktif

#### Endpoint API
| No | Fitur | Endpoint | Method | Keterangan |
| --- | --- | --- | --- | --- |
| 1 | Simpan Koordinat | `/reports` | POST | Menyimpan koordinat lokasi yang dipilih pengguna saat membuat laporan (bersifat opsional) |
| 2 | Ambil Koordinat Laporan | `/maps/reports` | GET | Mengambil seluruh titik koordinat laporan untuk ditampilkan di peta |

#### Halaman & Fitur UI
| No | Fitur | Deskripsi |
| --- | --- | --- |
| 1 | Penanda Lokasi | Pengguna dapat mengklik peta untuk menentukan titik lokasi kejadian, menampilkan marker, dan menghapusnya jika diperlukan |
| 2 | Peta Detail Laporan | Menampilkan titik lokasi laporan di atas peta berbasis Leaflet |
| 3 | Zoom & Navigasi | Pengguna dapat memperbesar dan memperkecil tampilan peta secara interaktif |

---

### 4. Modul Admin — Kelola Laporan

#### Endpoint API
| No | Fitur | Endpoint | Method | Keterangan |
| --- | --- | --- | --- | --- |
| 1 | Lihat Semua Laporan | `/admin/reports` | GET | Menampilkan seluruh laporan dari semua pengguna |
| 2 | Detail Laporan | `/admin/reports/{id}` | GET | Menampilkan detail laporan berdasarkan ID |
| 3 | Update Status Laporan | `/admin/reports/{id}/status` | PATCH | Mengubah status laporan menjadi sedang ditangani atau selesai |
| 4 | Assign Unit | `/admin/reports/{id}/assign` | PATCH | Menugaskan laporan ke unit yang bertanggung jawab |
| 5 | Filter Laporan | `/admin/reports?status={}&type={}` | GET | Menyaring laporan berdasarkan status dan/atau kategori |

#### Halaman & Fitur UI
| No | Fitur | Deskripsi |
| --- | --- | --- |
| 1 | Dashboard Laporan | Seluruh laporan masuk ditampilkan dengan filter status, kategori, dan kombinasi keduanya |
| 2 | Detail Laporan | Modal yang menampilkan informasi lengkap laporan saat diklik |
| 3 | Ubah Status | Dropdown untuk mengubah status laporan secara langsung dari dashboard |
| 4 | Assign Unit | Modal untuk menugaskan laporan ke unit yang bertanggung jawab |

---

### 5. Modul Admin — Statistik

#### Endpoint API
| No | Fitur | Endpoint | Method | Keterangan |
| --- | --- | --- | --- | --- |
| 1 | Data Statistik | `/admin/statistics` | GET | Mengambil data agregat laporan untuk ditampilkan dalam bentuk grafik |

#### Halaman & Fitur UI
| No | Fitur | Deskripsi |
| --- | --- | --- |
| 1 | Donut Chart | Visualisasi proporsi laporan berdasarkan kategori, dilengkapi tooltip saat di-hover |
| 2 | Bar Chart | Visualisasi jumlah laporan berdasarkan status atau periode waktu, dilengkapi tooltip saat di-hover |
| 3 | Navigasi Antar Dashboard | Tombol untuk berpindah kembali ke halaman dashboard laporan |

---

## 🗄️ Database Schema

Berikut adalah detail arsitektur database PostgreSQL yang digunakan oleh aplikasi **LaporIn ITK** berdasarkan model SQLAlchemy yang digunakan pada backend.

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

### Tabel: users

| Atribut         | Tipe | Keterangan                     |
| --------------- | ---- | ------------------------------ |
| id              | PK   | Primary key                    |
| email           | -    | Email pengguna                 |
| name            | -    | Nama lengkap pengguna          |
| hashed_password | -    | Password yang sudah dienkripsi |
| phone           | -    | Nomor HP pengguna              |
| is_active       | -    | Status aktif akun              |
| is_admin        | -    | Penanda apakah pengguna admin  |
| created_at      | -    | Waktu akun dibuat              |
| updated_at      | -    | Waktu data terakhir diperbarui |

---

### Tabel: categories

| Atribut     | Tipe | Keterangan                                                      |
| ----------- | ---- | --------------------------------------------------------------- |
| id          | PK   | Primary key                                                     |
| name        | -    | Nama kategori laporan (kehilangan, kerusakan, atau perundungan) |
| description | -    | Deskripsi singkat kategori                                      |
| is_active   | -    | Status aktif kategori                                           |
| created_at  | -    | Waktu dibuat                                                    |

---

### Tabel: reports

| Atribut       | Tipe | Keterangan                                            |
| ------------- | ---- | ----------------------------------------------------- |
| id            | PK   | Primary key                                           |
| user_id       | FK   | Relasi ke `users.id` — pemilik laporan                |
| category_id   | FK   | Relasi ke `categories.id` — kategori laporan          |
| title         | -    | Judul laporan                                         |
| description   | -    | Deskripsi detail laporan                              |
| status        | -    | Status laporan: baru, diproses, selesai, atau ditutup |
| is_anonymous  | -    | Penanda apakah laporan dikirim secara anonim          |
| incident_date | -    | Tanggal kejadian yang dilaporkan                      |
| created_at    | -    | Waktu laporan dibuat                                  |
| updated_at    | -    | Waktu laporan terakhir diperbarui                     |

---

### Tabel: report_locations

| Atribut    | Tipe | Keterangan                                      |
| ---------- | ---- | ----------------------------------------------- |
| id         | PK   | Primary key                                     |
| report_id  | FK   | Relasi ke `reports.id`                          |
| latitude   | -    | Koordinat lintang lokasi kejadian               |
| longitude  | -    | Koordinat bujur lokasi kejadian                 |
| address    | -    | Alamat atau keterangan lokasi dalam bentuk teks |
| created_at | -    | Waktu data lokasi disimpan                      |

---

### Tabel: report_attachments

| Atribut    | Tipe | Keterangan                                              |
| ---------- | ---- | ------------------------------------------------------- |
| id         | PK   | Primary key                                             |
| report_id  | FK   | Relasi ke `reports.id`                                  |
| file_url   | -    | URL file lampiran (foto atau dokumen pendukung laporan) |
| file_type  | -    | Jenis file yang dilampirkan                             |
| created_at | -    | Waktu lampiran diunggah                                 |

---

### Tabel: report_status_logs

| Atribut    | Tipe | Keterangan                                        |
| ---------- | ---- | ------------------------------------------------- |
| id         | PK   | Primary key                                       |
| report_id  | FK   | Relasi ke `reports.id`                            |
| changed_by | FK   | Relasi ke `users.id` — admin yang mengubah status |
| old_status | -    | Status laporan sebelum diubah                     |
| new_status | -    | Status laporan setelah diubah                     |
| notes      | -    | Catatan atau alasan perubahan status              |
| created_at | -    | Waktu perubahan status dicatat                    |

---

### Tabel: comments

| Atribut    | Tipe | Keterangan                                               |
| ---------- | ---- | -------------------------------------------------------- |
| id         | PK   | Primary key                                              |
| report_id  | FK   | Relasi ke `reports.id`                                   |
| user_id    | FK   | Relasi ke `users.id` — pengguna yang memberikan komentar |
| content    | -    | Isi komentar                                             |
| created_at | -    | Waktu komentar dibuat                                    |
| updated_at | -    | Waktu komentar terakhir diperbarui                       |

---

### Tabel: units

| Atribut     | Tipe | Keterangan                                         |
| ----------- | ---- | -------------------------------------------------- |
| id          | PK   | Primary key                                        |
| name        | -    | Nama unit yang bertanggung jawab menangani laporan |
| description | -    | Deskripsi tugas dan tanggung jawab unit            |
| contact     | -    | Informasi kontak unit                              |
| is_active   | -    | Status aktif unit                                  |
| created_at  | -    | Waktu data unit dibuat                             |

---

### Tabel: report_assignments

| Atribut     | Tipe | Keterangan                                            |
| ----------- | ---- | ----------------------------------------------------- |
| id          | PK   | Primary key                                           |
| report_id   | FK   | Relasi ke `reports.id`                                |
| unit_id     | FK   | Relasi ke `units.id` — unit yang ditugaskan           |
| assigned_by | FK   | Relasi ke `users.id` — admin yang melakukan penugasan |
| notes       | -    | Catatan penugasan                                     |
| created_at  | -    | Waktu penugasan dilakukan                             |

---

### Tabel: feedback

| Atribut    | Tipe | Keterangan                                               |
| ---------- | ---- | -------------------------------------------------------- |
| id         | PK   | Primary key                                              |
| report_id  | FK   | Relasi ke `reports.id`                                   |
| user_id    | FK   | Relasi ke `users.id` — pengguna yang memberikan feedback |
| rating     | -    | Penilaian pengguna terhadap penanganan laporan           |
| content    | -    | Komentar atau masukan terkait proses penanganan          |
| created_at | -    | Waktu feedback diberikan                                 |

---

### Tabel: notifications

| Atribut    | Tipe | Keterangan                                              |
| ---------- | ---- | ------------------------------------------------------- |
| id         | PK   | Primary key                                             |
| user_id    | FK   | Relasi ke `users.id` — penerima notifikasi              |
| report_id  | FK   | Relasi ke `reports.id` — laporan yang memicu notifikasi |
| message    | -    | Isi pesan notifikasi                                    |
| is_read    | -    | Penanda apakah notifikasi sudah dibaca                  |
| created_at | -    | Waktu notifikasi dibuat                                 |

---

### Ringkasan Relasi Utama

| Relasi                           | Kardinalitas | Penjelasan                                                                         |
| -------------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| users → reports                  | 1 : N        | Satu pengguna dapat membuat banyak laporan                                         |
| categories → reports             | 1 : N        | Satu kategori dapat mencakup banyak laporan                                        |
| reports → report_locations       | 1 : 1        | Satu laporan memiliki satu data lokasi                                             |
| reports → report_attachments     | 1 : N        | Satu laporan dapat memiliki banyak lampiran foto atau dokumen                      |
| reports → report_status_logs     | 1 : N        | Satu laporan memiliki banyak riwayat perubahan status                              |
| reports → comments               | 1 : N        | Satu laporan dapat memiliki banyak komentar dari pengguna maupun admin             |
| users → comments                 | 1 : N        | Satu pengguna dapat memberikan banyak komentar pada berbagai laporan               |
| reports → report_assignments     | 1 : N        | Satu laporan dapat ditugaskan ke satu atau lebih unit penanganan                   |
| units → report_assignments       | 1 : N        | Satu unit dapat menerima penugasan dari banyak laporan                             |
| reports → feedback               | 1 : 1        | Satu laporan hanya menerima satu feedback dari pengguna setelah penanganan selesai |
| users → notifications            | 1 : N        | Satu pengguna dapat menerima banyak notifikasi terkait perkembangan laporannya     |

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

## 🧪 Hasil Testing UI

Lihat laporan lengkap di: [`docs/ui-test-result.md`](docs/ui-test-result.md)

| Kategori | Total Test Case | Pass | Fail | Pass Rate |
|----------|-----------------|------|------|-----------|
| UI Pengguna | 46 | 46 | 0 | 100% |
| UI Admin | 13 | 13 | 0 | 100% |
| **TOTAL** | **59** | **59** | **0** | **100%** |

---

## 🐳 Docker Cheatsheet

Lihat: [`docs/docker-cheatsheet.md`](docs/docker-cheatsheet.md)

---



