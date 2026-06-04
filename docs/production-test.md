# 🚀 Production Test

Dokumen ini berisi hasil serta panduan pengujian pada environment production setelah aplikasi berhasil dideploy ke Railway.

Pengujian production dilakukan untuk memastikan bahwa aplikasi yang telah berjalan di cloud dapat berfungsi dengan optimal, baik dari sisi frontend, backend, maupun koneksi ke database.

---

## 1. Smoke Test Checklist

Smoke test merupakan pengujian awal untuk memastikan seluruh fitur utama aplikasi dapat berjalan dengan baik setelah proses deployment.

| No | Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
|----|----------|------------------|----------------------|--------|
| 1 | Buka Frontend Production | Akses URL frontend production melalui browser | Halaman frontend tampil tanpa error | ✅ |
| 2 | Register User Baru | Membuat akun melalui halaman register | Akun berhasil dibuat | ✅ |
| 3 | Login User | Login menggunakan akun yang telah dibuat | User berhasil masuk ke sistem | ✅ |
| 4 | Create Item | Menambahkan data/item baru | Data berhasil tersimpan | ✅ |
| 5 | Read Item | Melihat daftar data/item | Data tampil pada daftar | ✅ |
| 6 | Update Item | Mengubah data/item yang ada | Perubahan berhasil disimpan | ✅ |
| 7 | Delete Item | Menghapus data/item | Data berhasil dihapus | ✅ |
| 8 | Health Check Backend | Mengakses endpoint `/health` | Backend merespons dengan status `healthy` | ✅ |

---

## 2. Hasil Perbandingan Development dan Production

Tabel berikut menunjukkan perbandingan performa fitur antara environment development (localhost) dan production (Railway).

| Test | Development / Localhost | Production / Railway | Status |
|------|------------------------|----------------------|--------|
| Backend `/health` | ✅ | ✅ | ✅ Pass |
| Register user | ✅ | ✅ | ✅ Pass |
| Login | ✅ | ✅ | ✅ Pass |
| Create item | ✅ | ✅ | ✅ Pass |
| Read items | ✅ | ✅ | ✅ Pass |
| Update item | ✅ | ✅ | ✅ Pass |
| Delete item | ✅ | ✅ | ✅ Pass |
| Search | ✅ | ✅ | ✅ Pass |

---

## Keterangan

- ✅ **Pass** → Fitur berhasil diuji dan berjalan dengan baik  
- ❌ **Failed** → Fitur diuji namun tidak berjalan  
- ⏳ **Pending** → Belum dapat diuji karena bergantung pada fitur lain  

---

## Kesimpulan

Berdasarkan hasil pengujian production, seluruh fitur aplikasi telah berjalan dengan baik baik pada environment development (localhost) maupun production (Railway). Hal ini menunjukkan bahwa proses deployment berhasil dilakukan tanpa kendala yang berarti.
Tidak ditemukan perbedaan signifikan antara kedua environment, sehingga dapat disimpulkan bahwa konfigurasi backend, koneksi database, environment variable, serta integrasi API telah berjalan dengan konsisten dan stabil di production.
