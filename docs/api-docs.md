# 📡 API Documentation — LaporIn ITK
> Lead QA & Docs: Salsabila Putri Zahrani | Backend: Aditya Laksamana P Butar Butar

Base URL: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

---

## Autentikasi

API menggunakan **JWT Bearer Token**. Ambil token via `/auth/login`, lalu sertakan di header:
```
Authorization: Bearer <token>
```

---

## System

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/health` | ❌ | Cek status API |
| GET | `/team` | ❌ | Info tim pengembang |

---

## Auth

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/auth/register` | ❌ | Daftar user baru |
| POST | `/auth/login` | ❌ | Login, dapatkan token |
| POST | `/auth/token` | ❌ | OAuth2 (Swagger) |
| GET | `/auth/me` | ✅ | Profil user login |

**POST /auth/register** (body):
```json
{
  "email": "user@student.itk.ac.id",
  "nama": "Nama Lengkap",
  "passwo/rd": "Cloud@123",
  "no_hp": "08123456789"
}
```

**POST /auth/login** (body):
```json
{
  "email": "user@student.itk.ac.id",
  "password": "Cloud@123"
}
```

---

## Referensi

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/categories` | ❌ | Daftar kategori laporan |
| GET | `/units` | ✅ | Daftar unit penanganan |

---

## Laporan (User)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/reports` | ✅ | Buat laporan baru |
| GET | `/reports` | ✅ | Daftar laporan milik user |
| GET | `/reports/{id}` | ✅ | Detail satu laporan |
| POST | `/reports/{id}/locations` | ✅ | Tambah titik tracking |

**POST /reports** (body):
```json
{
  "judul": "Kehilangan Laptop di Perpustakaan",
  "deskripsi": "Laptop Asus warna hitam hilang pada hari Senin pukul 10.00",
  "kategori_id": 1,
  "lokasi": "Perpustakaan ITK Lantai 2",
  "latitude": -1.2655,
  "longitude": 116.8308,
  "tanggal_kejadian": "2026-04-05",
  "anonim": false
}
```

**Query params GET /reports:**
- `skip=0` — offset pagination
- `limit=20` — jumlah per halaman
- `status=menunggu|diproses|selesai`
- `kategori_id=1`
- `search=kata kunci`

---

## Komentar

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/reports/{id}/comments` | ✅ | Tambah komentar |
| GET | `/reports/{id}/comments` | ✅ | Daftar komentar |

---

## Notifikasi

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/notifications` | ✅ | Daftar notifikasi |
| PATCH | `/notifications/{id}/read` | ✅ | Tandai sudah dibaca |

---

## Feedback

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/feedback` | ✅ | Submit rating & komentar |

---

## Admin (role: admin)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/admin/stats` | ✅ Admin | Statistik dashboard |
| GET | `/admin/reports` | ✅ Admin | Semua laporan (semua user) |
| PUT | `/admin/reports/{id}` | ✅ Admin | Update status/prioritas |
| POST | `/admin/reports/{id}/assign` | ✅ Admin | Tugaskan ke unit |

**PUT /admin/reports/{id}** (body):
```json
{
  "status": "diproses",
  "prioritas": "tinggi"
}
```

**POST /admin/reports/{id}/assign** (body):
```json
{
  "unit_id": 2
}
```

---

## Status Code

| Code | Arti |
|------|------|
| 200 | OK — Request berhasil |
| 201 | Created — Data berhasil dibuat |
| 204 | No Content — Berhasil (tidak ada data kembali) |
| 400 | Bad Request — Data tidak valid |
| 401 | Unauthorized — Token tidak ada/expired |
| 403 | Forbidden — Tidak punya akses |
| 404 | Not Found — Data tidak ditemukan |
| 422 | Unprocessable Entity — Validasi gagal |
| 500 | Internal Server Error |

---

## Kategori

| ID | Nama | Keterangan |
|----|------|------------|
| 1 | Kehilangan | Lokasi detail di map, bisa tracking |
| 2 | Fasilitas | Kerusakan/kekurangan fasilitas |
| 3 | Perundungan | Otomatis anonim, is_sensitive=true |

## Unit

| ID | Nama |
|----|------|
| 1 | Sarpras (Sarana & Prasarana) |
| 2 | Keamanan Kampus |
| 3 | Bimbingan Konseling (BK) |
| 4 | Kemahasiswaan |
| 5 | Teknologi Informasi (TI) |