# ☁️ Cloud App - LAPORin ITK

    LAPORin ITK atau singkatan dari Layanan Pelaporan *Online* Responsif Institut Teknologi Kalimantan adalah aplikasi berbasis *cloud* yang berfungsi sebagai saluran resmi untuk menerima, mengelola, dan melacak status pelaporan berbagai insiden di kampus, seperti kerusakan fasilitas, kehilangan barang, hingga kasus perundungan secara *real-time* dan terpusat dengan fitur opsi anonimitas. Aplikasi ini dirancang khusus untuk seluruh sivitas akademika Institut Teknologi Kalimantan (ITK), yang mencakup mahasiswa, dosen, dan tenaga kependidikan sebagai pelapor, serta pihak berwenang kampus sebagai admin pengelola laporan.

    Kehadiran aplikasi ini menyelesaikan masalah keengganan melapor yang sering terjadi akibat birokrasi yang rumit atau ketakutan pelapor akan identitasnya yang terbongkar. Selain itu, sistem *cloud* pada LAPORin ITK memecahkan masalah manajemen data pelaporan yang tercecer atau tidak transparan, dengan memastikan setiap keluhan tersimpan aman di database dan status penanganannya (Menunggu, Diproses, Selesai) dapat dipantau secara langsung, menciptakan lingkungan kampus yang lebih aman dan responsif.

---

## 👥 Tim

| Nama                           | NIM      | Peran          |
| ------------------------------ | -------- | -------------- |
| Aditya Laksamana P Butar Butar | 10231006 | Lead Backend   |
| Firni Fauziah Ramadhini        | 10231038 | Lead Frontend  |
| Muhammad Novri Aziztra         | 10231066 | Lead DevOps    |
| Salsabila Putri Zahrani        | 10231086 | Lead QA & Docs |

---

## 🛠️ Tech Stack

| Teknologi      | Fungsi           |
| -------------- | ---------------- |
| FastAPI        | Backend REST API |
| React          | Frontend SPA     |
| PostgreSQL     | Database         |
| Docker         | Containerization |
| GitHub Actions | CI/CD            |
| Railway/Render | Cloud Deployment |
| Python         | Backend REST API |

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

## 🚀 Getting Started

### Prasyarat

- Python 3.11.x
- FastAPI 0.110+
- PostgreSQL 15.x
- Node.js 20.x (LTS)
- React 18.x
- Docker 24.x
- Docker Compose 2.x

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📅 Roadmap

| Minggu | Target                 | Status |
| ------ | ---------------------- | ------ |
| 1      | Setup & Hello World    | ✅     |
| 2      | REST API + Database    | ✅     |
| 3      | React Frontend         | ✅     |
| 4      | Full-Stack Integration | ✅     |
| 5-7    | Docker & Compose       | ⬜     |
| 8      | UTS Demo               | ⬜     |
| 9-11   | CI/CD Pipeline         | ⬜     |
| 12-14  | Microservices          | ⬜     |
| 15-16  | Final & UAS            | ⬜     |

---

## Project Structure
```
cc-kelompok-bismillah_a/
├── backend/
│   ├── _pyache_
│   │   ├── crud.cpython-311.pyc
│   │   ├── database.cpython-311.pyc
│   │   ├── main.cpython-311.pyc
│   │   ├── models.cpython-311.pyc
│   │   ├── schemas.cpython-311.pyc
│   ├── .env
│   ├── .env.example
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── requirements.txt
│   └── schemas.py
├── docs/
│   ├── image/
│   ├── api.test.result.md
│   ├── member-[Aditya-Laksamana-P-Butar-Butar].md
│   ├── member-[Firni-Fauziah-Ramadhini].md
│   ├── member-[Muhammad-Novri-Aziztra].md
│   ├── member-[Salsabila-Putri-Zahrani].md
│   ├── setup-guide.md
│   ├── ui-test-results.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Daftar *Endpoint* API yang Tersedia

Bagian ini menjelaskan daftar *endpoint* API yang tersedia pada sistem beserta metode HTTP yang digunakan. Setiap *endpoint* memiliki fungsi yang berbeda, seperti mengambil data, menambahkan data baru, memperbarui data, hingga menghapus data item. Tabel berikut menampilkan informasi mengenai metode HTTP, alamat *endpoint*, deskripsi fungsi dari setiap *endpoint*, serta status *code* yang kemungkinan dikembalikan oleh server ketika permintaan berhasil diproses atau ketika terjadi kesalahan.

Base URL: `http://localhost:8000`  
Dokumentasi interaktif: `http://localhost:8000/docs`

| Method | Endpoint | Deskripsi | Status Code |
|------  |------      |------   |------       |
| `GET`  | `/health`| Health check API untuk memastikan server berjalan| 200 |
| `GET`  | `/team`| Menampilkan informasi anggota tim | 200 |
| `POST` | `/items` | Menambahkan data item baru | 201 / 422 |
| `GET` | `/items` | Mengambil daftar item (pagination + search) | 200 / 422 |
| `GET` | `/items/stats`| Menampilkan statistik data item | 200 |
| `GET` | `/items/{item_id}`| Mengambil satu item berdasarkan ID | 200 / 404 / 422|
| `PUT` | `/items/{item_id}`| Memperbarui data item berdasarkan ID | 200 / 404 / 422 |
| `DELETE` | `/items/{ittem_id}`| Menghapus item berdasarkan ID | 204 / 404 |

---
### Contoh Implementasi *Request* dan *Response* API

#### 1. Menambahkan Data Item Baru
**Request Body**
```
{
  "name": "Keyboard Mechanical",
  "price": "1200000",
  "description": "Keyboard untuk coding",
  "quantity": 8
}
```

**Response 201 Created**
```
{
  "name": "Keyboard Mechanical",
  "description": "Keyboard untuk coding",
  "price": 1500000,
  "quantity": 8,
  "id": 4,
  "created_at": "2026-03-03T09:02:07.131493+08:00",
  "updated_at": null
}
```
#### 2. Mengambil Daftar Item dengan Fitur Pencarian
**Request**
```
GET /items?search=laptop&skip=0&limit=20
```

**Response 200 OK**
```
{
  "total": 1,
  "items": [...]
}

```
#### 3. Menampilkan Statistik Data Item
**Request**
```
GET /items/stats
```

**Response 200 OK**
```
{
{
  "total_items": 3,
  "total_value": 84600000,
  "most_expensive": {
    "name": "Laptop",
    "price": 1500000
  },
  "cheapest": {
    "name": "Mouse Wireless",
    "price": 250000
  }
}
}

```
---

## Hasil Pengujian Fungsional API

Bagian ini menampilkan hasil pengujian terhadap setiap *endpoint* API yang telah dibuat. Pengujian dilakukan menggunakan Swagger UI melalui halaman dokumentasi interaktif (`/docs`). Tujuan dari pengujian ini adalah untuk memastikan bahwa setiap *endpoint* dapat berjalan sesuai dengan fungsinya, baik saat menerima input yang valid maupun ketika terjadi kondisi tertentu seperti data tidak ditemukan atau *input* tidak sesuai aturan. Tabel berikut menunjukkan *endpoint* yang diuji, skenario pengujian yang dilakukan, hasil yang diharapkan (*expected*), hasil yang diperoleh dari sistem (*actual*), serta status pengujian yang menunjukkan apakah pengujian tersebut berhasil atau tidak.

| Endpoint             | Skenario            | Expected                 | Actual                   | Status |
| -------------------- | ------------------- | ------------------------ | ------------------------ | ------ |
| `GET /health`        | Health check        | 200 OK                   | 200 OK                   | Pass   |
| `POST /items`        | Input valid         | 201 Created              | 201 Created              | Pass   |
| `POST /items`        | Harga < 0           | 422 Unprocessable Entity | 422 Unprocessable Entity | Pass   |
| `GET /items`         | Ambil semua item    | 200 OK + list            | 200 OK + list            | Pass   |
| `GET /items/stats`   | Statistik data item | 200 OK + JSON stats      | 200 OK + JSON stats      | Pass   |
| `GET /items/{id}`    | ID terdaftar        | 200 OK + data item       | 200 OK + data item       | Pass   |
| `GET /items/{id}`    | ID tidak ada        | 404 Not Found            | 404 Not Found            | Pass   |
| `PUT /items/{id}`    | Update field        | 200 OK + data baru       | 200 OK + data baru       | Pass   |
| `DELETE /items/{id}` | Hapus item          | 204 No Content           | 204 No Content           | Pass   |
| `GET /team`          | Info tim            | 200 OK + list anggota    | 200 OK + list anggota    | Pass   |

---

## Dokumentasi Pengujian Sistem

Dokumentasi ini berisi hasil pengujian sistem berdasarkan skenario End-to-End yang dilakukan pada fitur autentikasi dan pengelolaan data (CRUD). Pengujian dilakukan untuk memastikan seluruh fungsi aplikasi berjalan sesuai dengan kebutuhan.

---

### Pengujian API Autentikasi

| Endpoint            | Skenario                  | Expected                     | Actual                       | Status |
|---------------------|---------------------------|-----------------------------|------------------------------|--------|
| GET /               | Buka aplikasi             | Halaman login tampil        | Halaman login tampil         | ✅ Pass |
| POST /auth/register | Data valid                | 201 Created + user terdaftar| 201 Created + user terdaftar | ✅ Pass |
| POST /auth/register | Email duplikat            | 400 Bad Request             | 400 Bad Request              | ✅ Pass |
| POST /auth/register | Field kosong              | 400 Bad Request             | 400 Bad Request              | ✅ Pass |
| POST /auth/login    | Kredensial benar          | 200 OK + token              | 200 OK + token               | ✅ Pass |
| POST /auth/login    | Password salah            | 401 Unauthorized            | 401 Unauthorized             | ✅ Pass |
| POST /auth/login    | Email tidak terdaftar     | 401 Unauthorized            | 401 Unauthorized             | ✅ Pass |
| POST /auth/login    | Field kosong              | 400 Bad Request             | 400 Bad Request              | ✅ Pass |
| POST /auth/logout   | Logout user               | Redirect ke login           | Redirect ke login            | ✅ Pass |
| GET /auth/me        | Token valid               | 200 OK + data user          | 200 OK + data user           | ✅ Pass |
| GET /auth/me        | Tanpa token               | 401 Unauthorized            | 401 Unauthorized             | ✅ Pass |

---

### Pengujian API Pengelolaan Data (CRUD Items)

| Endpoint           | Skenario                     | Expected                 | Actual                   | Status |
|--------------------|------------------------------|--------------------------|--------------------------|--------|
| GET /items         | Tanpa token                  | 401 Unauthorized         | 401 Unauthorized         | ✅ Pass |
| GET /items         | Token valid                  | 200 OK + daftar item     | 200 OK + daftar item     | ✅ Pass |
| POST /items        | Data valid                   | 201 Created              | 201 Created              | ✅ Pass |
| POST /items        | Field kosong                 | 400 Bad Request          | 400 Bad Request          | ✅ Pass |
| PUT /items/{id}    | ID valid                     | 200 OK + data diperbarui | 200 OK + data diperbarui | ✅ Pass |
| PUT /items/{id}    | ID tidak ditemukan           | 404 Not Found            | 404 Not Found            | ✅ Pass |
| DELETE /items/{id} | ID valid                     | 204 No Content           | 204 No Content           | ✅ Pass |
| DELETE /items/{id} | ID tidak ditemukan           | 404 Not Found            | 404 Not Found            | ✅ Pass |
| GET /items/{id}    | Token tidak valid/expired    | 401 Unauthorized         | 401 Unauthorized         | ✅ Pass |

---