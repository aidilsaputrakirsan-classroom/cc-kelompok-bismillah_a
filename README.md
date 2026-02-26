# ☁️ LAPORin ITK - Bismillah_A

LAPORin ITK adalah aplikasi berbasis cloud yang berfungsi sebagai saluran resmi untuk menerima, mengelola, dan melacak status pelaporan berbagai insiden di kampus seperti kerusakan fasilitas, kehilangan barang, hingga kasus perundungan secara real-time dan terpusat dengan fitur opsi anonimitas. Aplikasi ini dirancang khusus untuk seluruh civitas akademika Institut Teknologi Kalimantan (ITK), yang mencakup mahasiswa, dosen, dan tenaga kependidikan sebagai pelapor, serta pihak berwenang kampus sebagai admin pengelola laporan.

Kehadiran aplikasi ini menyelesaikan masalah keengganan melapor yang sering terjadi akibat birokrasi yang rumit atau ketakutan pelapor akan identitasnya yang terbongkar. Selain itu, sistem cloud pada LAPORin ITK memecahkan masalah manajemen data pelaporan yang tercecer atau tidak transparan, dengan memastikan setiap keluhan tersimpan aman di database dan status penanganannya (Menunggu, Diproses, Selesai) dapat dipantau secara langsung, menciptakan lingkungan kampus yang lebih aman dan responsif.

## 👥 Tim

| Nama                           | NIM      | Peran          |
| ------------------------------ | -------- | -------------- |
| Aditya Laksamana P Butar Butar | 10231006 | Lead Backend   |
| Firni Fauziah Ramadhini        | 10231038 | Lead Frontend  |
| Muhammad Novri Aziztra         | 10231066 | Lead DevOps    |
| Salsabila Putri Zahrani        | 10231086 | Lead QA & Docs |

## 🛠️ Tech Stack

| Teknologi      | Fungsi           |
| -------------- | ---------------- |
| FastAPI        | Backend REST API |
| React          | Frontend SPA     |
| PostgreSQL     | Database         |
| Docker         | Containerization |
| GitHub Actions | CI/CD            |
| Railway/Render | Cloud Deployment |

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

_(Diagram ini akan berkembang setiap minggu)_

## 🚀 Getting Started

### Prasyarat

- Python 3.10+
- Node.js 18+
- Git

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

## 📅 Roadmap

| Minggu | Target                 | Status |
| ------ | ---------------------- | ------ |
| 1      | Setup & Hello World    | ✅     |
| 2      | REST API + Database    | ⬜     |
| 3      | React Frontend         | ⬜     |
| 4      | Full-Stack Integration | ⬜     |
| 5-7    | Docker & Compose       | ⬜     |
| 8      | UTS Demo               | ⬜     |
| 9-11   | CI/CD Pipeline         | ⬜     |
| 12-14  | Microservices          | ⬜     |
| 15-16  | Final & UAS            | ⬜     |
