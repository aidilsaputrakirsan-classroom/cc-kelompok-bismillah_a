# UAS Presentation Outline

## Slide 1: Title

* Nama proyek: LaporIn ITK
* Nama tim: Kelompok Bismillah_A
* Anggota:

  * Aditya Laksamana P Butar Butar
  * Firni Fauziah Ramadhini
  * Muhammad Novri Aziztra
  * Salsabila Putri Zahrani

## Slide 2: Problem & Solution

* Masalah yang diselesaikan: Proses pelaporan kehilangan barang, kerusakan fasilitas, dan perundungan di lingkungan kampus masih dilakukan secara manual sehingga kurang terstruktur, sulit dipantau, dan proses tindak lanjut menjadi kurang efektif.
* Target pengguna: Civitas akademika Institut Teknologi Kalimantan (ITK).
* Solusi: Platform pelaporan digital berbasis web yang memungkinkan pengguna membuat laporan secara online, memberikan lokasi kejadian melalui peta interaktif, memantau perkembangan laporan, serta membantu pihak terkait dalam proses penanganan.

## Slide 3: Architecture Journey

* Week 1-4: Monolith (React + FastAPI + PostgreSQL)
* Week 5-7: Containerized (Docker & Docker Compose)
* Week 9-11: CI/CD (GitHub Actions)
* Week 12-14: Microservices (Auth Service + Report Service + API Gateway)
* Week 15-16: Security Hardening, Monitoring, dan Final Documentation

## Slide 4: Tech Stack & Infrastructure

* Frontend: React + Vite
* Backend: FastAPI + SQLAlchemy
* Database: PostgreSQL
* Containerization: Docker & Docker Compose
* API Gateway: Nginx
* CI/CD: GitHub Actions
* Diagram arsitektur final
* Total 6 containers (Frontend, Gateway, Auth Service, Report Service, Auth Database, Report Database)
* CI/CD pipeline flow
* Monitoring, structured logging, metrics, dan health check endpoint

## Slide 5: Live Demo

* Flow:
  Open App → Register → Login → Create Report → View Report → View Report Detail & Map → Add Comment → Admin Update Report Status → Open Swagger Docs → Show CI/CD Badge

* Backup: Video demo jika terjadi kendala internet.

## Slide 6: Challenges & Lessons Learned

* Challenge 1: Integrasi Frontend dan Backend → Solution: REST API menggunakan FastAPI dan JWT Authentication.
* Challenge 2: Migrasi dari monolith ke microservices → Solution: Memisahkan Auth Service dan Report Service dengan komunikasi HTTP antar-service.
* Challenge 3: Manajemen container dan environment → Solution: Menggunakan Docker Compose, environment variables, dan API Gateway Nginx.
* Challenge 4: Monitoring dan reliability → Solution: Menerapkan health check, metrics, structured logging, retry, dan circuit breaker.
* Biggest Learning: Memahami pengembangan aplikasi cloud-native menggunakan Docker, microservices, CI/CD, keamanan API, testing, dan dokumentasi.

## Slide 7: Team Contributions

* Aditya Laksamana P Butar Butar — Lead Backend — Auth Service, Report Service, API, Database Integration, JWT Authentication.
* Firni Fauziah Ramadhini — Lead Frontend — React UI, API Integration, Form Laporan, dan Interactive Map.
* Muhammad Novri Aziztra — Lead DevOps — Docker, Docker Compose, Nginx Gateway, CI/CD GitHub Actions, dan Infrastruktur.
* Salsabila Putri Zahrani — Lead QA & Documentation — API Testing, UI Testing, Reliability Testing, README, API Contract, Release Notes, dan Dokumentasi.

## Demo Script (Urutan Langkah)

1. Buka aplikasi LaporIn ITK (Frontend URL).
2. Register pengguna baru.
3. Login menggunakan akun yang dibuat.
4. Membuat laporan kehilangan, kerusakan, atau perundungan.
5. Menampilkan daftar laporan.
6. Membuka detail laporan dan lokasi pada peta.
7. Menambahkan komentar pada laporan.
8. Login sebagai admin dan mengubah status laporan.
9. Membuka Swagger API Documentation.
10. Menampilkan GitHub Actions dengan status pipeline berhasil.
11. Menampilkan README dan dokumentasi proyek.
