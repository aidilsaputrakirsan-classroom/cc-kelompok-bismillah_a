## Tugas: Buat README.md yang Lengkap & Endpoint /team

### Deskripsi

Setiap tim membuat file `README.md` yang menjelaskan proyek. Ini akan menjadi "wajah" proyek Anda di GitHub dan terus di-update sepanjang semester.

**Pembagian pengerjaan tugas:**

| Bagian README                                                         | Dikerjakan oleh     | Juga mengerjakan                             |
| --------------------------------------------------------------------- | ------------------- | -------------------------------------------- |
| Deskripsi proyek & Architecture Overview                              | Lead Backend        | Update endpoint `/team` dengan data asli     |
| Tech Stack & Getting Started                                          | Lead Frontend       | Pastikan instruksi running benar             |
| Roadmap Milestone & Project Structure                                 | Lead DevOps         | Setup branch protection rules                |
| Identitas Tim & Peer Review README                                    | Lead QA & Docs      | Review & finalisasi seluruh README           |
| _(Jika 5 orang)_ Getting Started dipecah: Backend + Frontend terpisah | Lead CI/CD & Deploy | Tambahkan section "Deployment" (placeholder) |

### Isi Wajib README.md

# ☁️ Cloud App - Bismillah_A

Deskripsi singkat aplikasi (1-2 paragraf): apa yang dilakukan,
untuk siapa, masalah apa yang diselesaikan.

## 👥 Tim

| Nama                           | NIM      | Peran          |
| ------------------------------ | -------- | -------------- |
| Aditya Laksamana P Butar Butar | 10231006 | Lead Backend   |
| ...                            | ...      | Lead Frontend  |
| ...                            | ...      | Lead DevOps    |
| ...                            | ...      | Lead QA & Docs |

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
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]
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
