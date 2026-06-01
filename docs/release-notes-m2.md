# 🚀 Release Notes — Milestone 2

Dokumen ini berisi catatan rilis untuk Milestone 2. Pada milestone ini, aplikasi sudah memasuki tahap CI/CD dan deployment ke environment production.

---


## 1. Fitur yang Sudah Ada

Pada Milestone 2, aplikasi telah dilengkapi dengan berbagai fitur utama yang mendukung proses pelaporan dan pengelolaan pengaduan, seperti manajemen akun pengguna, pembuatan dan pengelolaan laporan, pemantauan status laporan, visualisasi peta sebaran laporan, serta dashboard admin untuk pengelolaan dan tindak lanjut laporan secara menyeluruh.

Beberapa fitur yang sudah tersedia pada aplikasi:

## 📊 Tabel Modul dan Fitur

| No | Aktor | Modul | Fitur | Keterangan |
|----|-------|-------|-------|------------|
| 1 | Umum | Autentikasi | Register | Membuat akun baru di platform LaporIn ITK |
| 2 | Umum | Autentikasi | Login | Masuk ke aplikasi menggunakan akun yang terdaftar |
| 3 | Umum | Autentikasi | Logout | Keluar dari sesi aplikasi |
| 4 | User (Mahasiswa) | Manajemen Laporan | Buat Laporan Baru | Membuat laporan pengaduan baru (Kehilangan, Fasilitas, Perundungan) |
| 5 | User (Mahasiswa) | Manajemen Laporan | Daftar Laporan Saya | Menampilkan riwayat laporan yang telah dibuat beserta statusnya |
| 6 | User (Mahasiswa) | Manajemen Laporan | Cari & Filter Laporan | Mencari laporan dan memfilter berdasarkan status atau kategori |
| 7 | User (Mahasiswa) | Manajemen Laporan | Edit Laporan | Mengubah data laporan (selama status masih "menunggu") |
| 8 | User (Mahasiswa) | Manajemen Laporan | Hapus Laporan | Menghapus laporan (selama status masih "menunggu") |
| 9 | User (Mahasiswa) | Peta | Peta Sebaran Laporan | Visualisasi lokasi laporan di area kampus ITK |
| 10 | Admin | Dashboard Admin | Statistik Laporan | Menampilkan jumlah laporan (menunggu, diproses, selesai) |
| 11 | Admin | Dashboard Admin | Visualisasi Grafik | Menampilkan grafik berdasarkan kategori dan status |
| 12 | Admin | Kelola Laporan | Daftar Seluruh Laporan | Menampilkan seluruh laporan dari user |
| 13 | Admin | Kelola Laporan | Cari & Filter Laporan | Mencari dan menyaring laporan berdasarkan kriteria tertentu |
| 14 | Admin | Kelola Laporan | Detail & Aksi Laporan | Melihat detail lengkap laporan |
| 15 | Admin | Kelola Laporan | Update Status | Mengubah status laporan (Menunggu, Diproses, Selesai) |
| 16 | Admin | Kelola Laporan | Update Prioritas | Mengatur tingkat prioritas laporan |
| 17 | Admin | Kelola Laporan | Penugasan Unit | Menugaskan laporan ke unit terkait (Sarpras, Keamanan, BK, dll) |
| 18 | Admin | Peta | Peta Sebaran Laporan | Visualisasi seluruh laporan untuk monitoring admin |
| 19 | Umum | Pengaturan | Tema Tampilan | Mengubah tema aplikasi (Light/Dark mode) |
| 20 | Umum | Detail Laporan | Percakapan / Diskusi | Memungkinkan user dan admin saling berbalas pesan, memberikan komentar, atau menanyakan perkembangan terkait suatu laporan yang spesifik |
---

## 2. URL Production

| Service | URL |
|---|---|
| Frontend | `https://cc-kelompok-bismillaha.akhzafachrozy.my.id/` |
| Backend API |  |
| API Docs / Swagger |  |


---

## 3. Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI |
| Database | PostgreSQL |
| Containerization | Docker & Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Railway |
| Testing Backend | pytest |
| Testing Frontend | Vitest |

---

## 4. CI/CD Summary

Pada Milestone 2, pipeline CI/CD digunakan untuk membantu proses validasi dan deployment aplikasi.

Pipeline mencakup:

1. Test backend menggunakan pytest.
2. Test frontend menggunakan Vitest.
3. Build Docker image.
4. Deploy aplikasi ke Railway.
5. Validasi production melalui smoke test.

---

## 5. Known Issues

Kendala yang pernah ditemukan selama proses deployment dan pengujian production:

| No | Issue | Dampak |
|---|---|---|
| 1 | Backend menghasilkan error 502 setelah deployment | Backend tidak dapat diakses sehingga fitur registrasi, login, dan pengelolaan data tidak dapat digunakan hingga konfigurasi deployment berhasil diperbaiki. |

---

## 6. Production Testing Summary

Pengujian production dilakukan setelah proses deployment aplikasi selesai untuk memastikan seluruh fitur utama dapat berjalan dengan baik pada environment production. Pengujian dilakukan menggunakan metode smoke testing terhadap fitur-fitur inti aplikasi LAPORin ITK.

Hasil pengujian menunjukkan bahwa proses registrasi pengguna, login, pengelolaan data melalui operasi Create, Read, Update, dan Delete (CRUD), serta health check backend dapat berjalan sesuai dengan fungsinya. Selain itu, koneksi antara frontend, backend, dan database pada environment production juga berhasil berjalan dengan baik.

Berdasarkan hasil pengujian yang dilakukan, tidak ditemukan perbedaan signifikan antara environment development dan production. Seluruh fitur yang diuji berhasil berjalan dengan baik sehingga aplikasi dinyatakan siap digunakan pada environment production.

Hasil pengujian production secara lengkap dapat dilihat pada file :  [Production Testing](production-test.md).