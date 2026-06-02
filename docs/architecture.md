# Microservices Architecture Documentation

## 1. Architecture Diagram

```mermaid
flowchart TD
    USER["User / Browser"] --> GW["API Gateway / Nginx :80"]

    GW --> FE["Frontend :3000"]
    GW --> AUTH["Auth Service :8001"]
    GW --> REPORT["Report Service :8002"]

    AUTH --> AUTHDB[("auth-db :5434")]
    REPORT --> REPORTDB[("report-db :5433")]

    REPORT -. Verify Token .-> AUTH
```

---

## 2. Services & Ports

| Service | Port | Description |
|----------|------|-------------|
| gateway | 80 | API Gateway / Reverse Proxy |
| frontend | 3000 | Frontend LAPORin ITK |
| auth-service | 8001 | Authentication Service |
| report-service | 8002 | Report Management Service |
| auth-db | 5434 | Database pengguna |
| report-db | 5433 | Database laporan |

---

## 3. API Contract

Base URL:

```text
http://localhost
```

### 3.1 Auth Service

#### POST /auth/register

Digunakan untuk registrasi pengguna baru.

**Request**

```json
{
  "name": "Andi Pratama",
  "email": "andi@student.itk.ac.id",
  "password": "Cloud@123",
  "phone": "081234567890"
}
```

**Response**

```json
{
  "id": 1,
  "name": "Andi Pratama",
  "email": "andi@student.itk.ac.id"
}
```

---

#### POST /auth/login

Digunakan untuk login dan mendapatkan JWT Token.

**Request**

```json
{
  "email": "andi@student.itk.ac.id",
  "password": "Cloud@123"
}
```

**Response**

```json
{
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

---

#### GET /auth/verify

Digunakan untuk memvalidasi JWT Token.

**Header**

```text
Authorization: Bearer TOKEN
```

**Response**

```json
{
  "user_id": 1,
  "email": "andi@student.itk.ac.id",
  "name": "Andi Pratama"
}
```

---

### 3.2 Report Service

#### POST /reports

Digunakan untuk membuat laporan kehilangan.

**Header**

```text
Authorization: Bearer TOKEN
```

**Request**

```json
{
  "category": "Kehilangan",
  "title": "Laptop Tertinggal di Perpustakaan",
  "description": "Laptop ASUS warna hitam tertinggal di ruang baca lantai 2 perpustakaan.",
  "location": "Perpustakaan ITK",
  "incident_date": "2026-05-18",
  "is_anonymous": false
}
```

**Response**

```json
{
  "id": 1,
  "user_id": 1,
  "category": "Kehilangan",
  "title": "Laptop Tertinggal di Perpustakaan",
  "status": "menunggu"
}
```

---

#### GET /reports

Digunakan untuk menampilkan daftar laporan pengguna.

**Header**

```text
Authorization: Bearer TOKEN
```

**Response**

```json
[
  {
    "id": 1,
    "title": "Laptop Tertinggal di Perpustakaan",
    "category": "Kehilangan",
    "status": "menunggu"
  }
]
```

---

#### GET /reports/{id}

Digunakan untuk menampilkan detail laporan berdasarkan ID.

**Header**

```text
Authorization: Bearer TOKEN
```

**Response**

```json
{
  "id": 1,
  "user_id": 1,
  "category": "Kehilangan",
  "title": "Laptop Tertinggal di Perpustakaan",
  "description": "Laptop ASUS warna hitam tertinggal di ruang baca lantai 2 perpustakaan.",
  "location": "Perpustakaan ITK",
  "incident_date": "2026-05-18",
  "status": "menunggu",
  "is_anonymous": false,
  "created_at": "2026-05-18T09:15:00Z"
}
```

---

#### PUT /reports/{id}

Digunakan untuk memperbarui laporan.

**Request**

```json
{
  "title": "Laptop Hilang di Perpustakaan",
  "description": "Laptop belum ditemukan hingga saat ini."
}
```

**Response**

```json
{
  "message": "Laporan berhasil diperbarui"
}
```

---

#### DELETE /reports/{id}

Digunakan untuk menghapus laporan.

**Response**

```json
{
  "message": "Laporan berhasil dihapus"
}
```

---

## 4. Running Locally

Menjalankan seluruh service:

```bash
docker compose up --build -d
```

Melihat container yang berjalan:

```bash
docker compose ps
```

Melihat log seluruh service:

```bash
docker compose logs -f
```

Menghentikan seluruh service:

```bash
docker compose down
```

---

## 5. Testing Antar Service

### 1. Register User

```bash
curl -X POST http://localhost/auth/register \
-H "Content-Type: application/json" \
-d '{
"name":"Andi Pratama",
"email":"andi@student.itk.ac.id",
"password":"Cloud@123",
"phone":"081234567890"
}'
```

### 2. Login User

```bash
curl -X POST http://localhost/auth/login \
-H "Content-Type: application/json" \
-d '{
"email":"andi@student.itk.ac.id",
"password":"Cloud@123"
}'
```

**Response**

```json
{
  "access_token": "TOKEN"
}
```

### 3. Membuat Laporan

```bash
curl -X POST http://localhost/reports \
-H "Authorization: Bearer TOKEN" \
-H "Content-Type: application/json" \
-d '{
"category":"Kehilangan",
"title":"Laptop Tertinggal di Perpustakaan",
"description":"Laptop ASUS warna hitam tertinggal di ruang baca lantai 2 perpustakaan.",
"location":"Perpustakaan ITK",
"incident_date":"2026-05-18",
"is_anonymous":false
}'
```

### 4. Menampilkan Daftar Laporan

```bash
curl http://localhost/reports \
-H "Authorization: Bearer TOKEN"
```

### 5. Menampilkan Detail Laporan

```bash
curl http://localhost/reports/1 \
-H "Authorization: Bearer TOKEN"
```

### 6. Verifikasi Komunikasi Antar Service

Alur pengujian:

1. User login melalui Auth Service.
2. Auth Service menghasilkan JWT Token.
3. JWT Token dikirim ke Report Service.
4. Report Service meminta validasi token ke Auth Service.
5. Auth Service mengembalikan data pengguna.
6. Report Service memproses laporan.
7. Data laporan disimpan ke report-db.

---

## 6. Debugging

Melihat log Auth Service:

```bash
docker compose logs auth-service
```

Melihat log Report Service:

```bash
docker compose logs report-service
```

Melihat log Gateway:

```bash
docker compose logs gateway
```

Melihat seluruh container:

```bash
docker compose ps
```

---

## 7. Hasil Testing

Testing berhasil dilakukan dengan hasil:

- Registrasi pengguna berhasil.
- Login berhasil.
- JWT Token berhasil dibuat.
- JWT berhasil diverifikasi oleh Auth Service.
- Laporan kehilangan berhasil dibuat.
- Daftar laporan berhasil ditampilkan.
- Detail laporan berhasil ditampilkan.
- Laporan berhasil diperbarui.
- Laporan berhasil dihapus.
- API Gateway berhasil meneruskan request ke service yang sesuai.
- Semua container berjalan normal.

Contoh status container:

```text
NAME                STATUS
auth-db             healthy
report-db           healthy
auth-service        running
report-service      running
frontend            running
gateway             running
```

---

## 8. Conclusion

Arsitektur microservices pada aplikasi LAPORin ITK berhasil diimplementasikan dengan memisahkan Authentication Service dan Report Service ke dalam layanan yang independen. API Gateway berfungsi sebagai pintu masuk utama aplikasi, sedangkan setiap service memiliki database masing-masing sehingga komunikasi antar layanan menjadi lebih terstruktur. Pengujian menunjukkan bahwa proses registrasi, login, verifikasi token, pembuatan laporan, pengelolaan laporan, dan komunikasi antar service berjalan dengan baik.

