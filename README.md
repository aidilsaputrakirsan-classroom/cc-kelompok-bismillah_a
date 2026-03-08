# ☁️ Cloud App - LAPORin ITK

LAPORin ITK atau singkatan dari Layanan Pelaporan *Online* Responsif Institut Teknologi Kalimantan adalah aplikasi berbasis *cloud* yang berfungsi sebagai saluran resmi untuk menerima, mengelola, dan melacak status pelaporan berbagai insiden di kampus, seperti kerusakan fasilitas, kehilangan barang, hingga kasus perundungan secara *real-time* dan terpusat dengan fitur opsi anonimitas. Aplikasi ini dirancang khusus untuk seluruh sivitas akademika Institut Teknologi Kalimantan (ITK), yang mencakup mahasiswa, dosen, dan tenaga kependidikan sebagai pelapor, serta pihak berwenang kampus sebagai admin pengelola laporan.

Kehadiran aplikasi ini menyelesaikan masalah keengganan melapor yang sering terjadi akibat birokrasi yang rumit atau ketakutan pelapor akan identitasnya yang terbongkar. Selain itu, sistem *cloud* pada LAPORin ITK memecahkan masalah manajemen data pelaporan yang tercecer atau tidak transparan, dengan memastikan setiap keluhan tersimpan aman di database dan status penanganannya (Menunggu, Diproses, Selesai) dapat dipantau secara langsung, menciptakan lingkungan kampus yang lebih aman dan responsif.

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
| Python         | Backend REST API |

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

## Project Structure
```
cc-kelompok-bismillah_a/
├── backend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── index.js
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
