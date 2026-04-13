# Laporan Testing UI - LaporIn ITK  

**Lead QA:** Salsabila Putri Zahrani | **Tim:** Bismillah_A  


Dokumen ini berisi hasil pengujian antarmuka pengguna (UI) pada aplikasi **LaporIn ITK**, baik untuk sisi pengguna maupun admin. Pengujian dilakukan untuk memastikan seluruh fitur berjalan sesuai dengan yang diharapkan, termasuk validasi form, navigasi, serta interaksi antar elemen pada sistem.  

---

## Ringkasan Testing  

| Kategori | Total Test Case | Pass | Fail | Pass Rate |
|----------|-----------------|------|------|-----------|
| UI Pengguna | 44 | 44 | 0 | 100% |
| UI Admin | 13 | 13 | 0 | 100% |
| **TOTAL** | **57** | **57** | **0** | **100%** |

---

## 1. Testing UI Pengguna  

### 1.1 Landing Page  

**TC #1 - Button Register**  
Skenario: Klik tombol Register  
Expected: Berpindah ke halaman register  
Status: ✅ PASS  
![ui1](image/ui1.png)

---

**TC #2 - Button Login**  
Skenario: Klik tombol Login  
Expected: Berpindah ke halaman login  
Status: ✅ PASS  
![ui2](image/ui2.png)

---

### 1.2 Register  

**TC #3 - Nama Kosong**  
Skenario: Submit tanpa nama  
Expected: Muncul error  
Status: ✅ PASS  
![ui3](image/ui3.png)

---

**TC #4 - Email Tidak Valid**  
Skenario: Input email salah format  
Expected: Muncul error  
Status: ✅ PASS  
![ui4](image/ui4.png)

---

**TC #5 - Password Pendek**  
Skenario: Password < 8 karakter  
Expected: Muncul error  
Status: ✅ PASS  
![ui5](image/ui5.png)

---

**TC #6 - Password Tanpa Angka/Symbol**  
Skenario: Password tidak memenuhi aturan  
Expected: Muncul error  
Status: ✅ PASS  
![ui6](image/ui6.png)

---

**TC #7 - Nomor HP Tidak Valid**  
Skenario: Format nomor salah  
Expected: Muncul error  
Status: ✅ PASS  
![ui7](image/ui7.png)

---

**TC #8 - Nomor HP Kosong**  
Skenario: Tidak isi nomor HP  
Expected: Tetap bisa daftar  
Status: ✅ PASS  
![ui8](image/ui8.png)

---

**TC #9 - Submit Kosong**  
Skenario: Klik daftar tanpa isi  
Expected: Muncul error  
Status: ✅ PASS  
![ui9](image/ui9.png)

---

**TC #10 - Registrasi Berhasil**  
Skenario: Input valid  
Expected: Berhasil daftar  
Status: ✅ PASS  
![ui10](image/ui10.png)

---

**TC #11 - Link Login**  
Skenario: Klik link login  
Expected: Pindah ke login  
Status: ✅ PASS  
![ui11](image/ui11.png)

---

### 1.3 Login  

**TC #12 - Email Invalid**  
Skenario: Email salah format  
Expected: Error  
Status: ✅ PASS  
![ui12](image/ui12.png)

---

**TC #13 - Email Tidak Terdaftar**  
Skenario: Email tidak ada  
Expected: Error  
Status: ✅ PASS  
![ui13](image/ui13.png)

---

**TC #14 - Password Invalid**  
Skenario: Password tidak valid  
Expected: Error  
Status: ✅ PASS  
![ui14](image/ui14.png)

---

**TC #15 - Password Salah**  
Skenario: Password salah  
Expected: Error  
Status: ✅ PASS  
![ui15](image/ui15.png)

---

**TC #16 - Login Kosong**  
Skenario: Submit tanpa isi  
Expected: Error  
Status: ✅ PASS  
![ui16](image/ui16.png)

---

**TC #17 - Login Berhasil**  
Skenario: Data benar  
Expected: Masuk sistem  
Status: ✅ PASS  
![ui17](image/ui17.png)

---

**TC #18 - Link Register**  
Skenario: Klik daftar  
Expected: Ke register  
Status: ✅ PASS  
![ui18](image/ui18.png)

---

### 1.4 Buat Laporan Baru  

**TC #19 - Pilih Kategori**  
Skenario: Klik kategori  
Expected: Kategori aktif  
Status: ✅ PASS  
![ui19](image/ui19.png)

---

**TC #20 - Kategori Kosong**  
Skenario: Tidak pilih kategori  
Expected: Error  
Status: ✅ PASS  
![ui20](image/ui20.png)

---

**TC #21 - Judul Kosong**  
Skenario: Judul kosong  
Expected: Error  
Status: ✅ PASS  
![ui21](image/ui21.png)

---

**TC #22 - Judul Pendek**  
Skenario: Judul terlalu singkat  
Expected: Error  
Status: ✅ PASS  
![ui22](image/ui22.png)

---

**TC #23 - Deskripsi Kosong**  
Skenario: Tidak isi deskripsi  
Expected: Error  
Status: ✅ PASS  
![ui23](image/ui23.png)

---

**TC #24 - Deskripsi Pendek**  
Skenario: Deskripsi terlalu singkat  
Expected: Error  
Status: ✅ PASS  
![ui24](image/ui24.png)

---

**TC #25 - Lokasi Opsional**  
Skenario: Lokasi kosong  
Expected: Tetap bisa kirim  
Status: ✅ PASS  
![ui25](image/ui25.png)

---

**TC #26 - Tanggal Kosong**  
Skenario: Tidak isi tanggal  
Expected: Error  
Status: ✅ PASS  
![ui26](image/ui26.png)

---

**TC #27 - Klik Peta**  
Skenario: Klik peta  
Expected: Marker muncul  
Status: ✅ PASS  
![ui27](image/ui27.png)

---

**TC #28 - Hapus Marker**  
Skenario: Hapus titik  
Expected: Marker hilang  
Status: ✅ PASS  
![ui28](image/ui28.png)

---

**TC #29 - Zoom Peta**  
Skenario: Zoom  
Expected: Peta berubah  
Status: ✅ PASS  
![ui29](image/ui29.png)

---

**TC #30 - Anonim Aktif**  
Skenario: Centang anonim  
Expected: Identitas disembunyikan  
Status: ✅ PASS  
![ui30](image/ui30.png)

---

**TC #31 - Anonim Nonaktif**  
Skenario: Tidak centang  
Expected: Identitas tampil  
Status: ✅ PASS  
![ui31](image/ui31.png)

---

**TC #32 - Tombol Batal**  
Skenario: Klik batal  
Expected: Kembali  
Status: ✅ PASS  
![ui32](image/ui32.png)

---

**TC #33 - Tombol Kembali**  
Skenario: Klik kembali  
Expected: Kembali  
Status: ✅ PASS  
![ui33](image/ui33.png)

---

**TC #34 - Kirim Kosong**  
Skenario: Submit tanpa isi  
Expected: Error  
Status: ✅ PASS  
![ui34](image/ui34.png)

---

**TC #35 - Kirim Berhasil**  
Skenario: Data lengkap  
Expected: Laporan terkirim  
Status: ✅ PASS  
![ui35](image/ui35.png)

---

**TC #36 - Laporan Saya**  
Skenario: Klik menu  
Expected: Ke halaman laporan  
Status: ✅ PASS  
![ui36](image/ui36.png)

---

### 1.5 Laporan Saya  

**TC #37 - Empty State**  
Skenario: Tidak ada data  
Expected: Tampil kosong  
Status: ✅ PASS  
![ui37](image/ui37.png)

---

**TC #38 - Buat Laporan Baru**  
Skenario: Klik tombol  
Expected: Ke form  
Status: ✅ PASS  
![ui38](image/ui38.png)

---

**TC #39 - Laporan Pertama**  
Skenario: Klik tombol  
Expected: Ke form  
Status: ✅ PASS  
![ui39](image/ui39.png)

---

**TC #40 - Filter Status**  
Skenario: Pilih status  
Expected: Data terfilter  
Status: ✅ PASS  
![ui40](image/ui40.png)

---

**TC #41 - Filter Kategori**  
Skenario: Pilih kategori  
Expected: Data terfilter  
Status: ✅ PASS  
![ui41](image/ui41.png)

---

**TC #42 - Filter Kombinasi**  
Skenario: Kombinasi filter  
Expected: Data sesuai  
Status: ✅ PASS  
![ui42](image/ui42.png)

---

**TC #43 - Navbar Buat Laporan**  
Skenario: Klik menu  
Expected: Ke form  
Status: ✅ PASS  
![ui43](image/ui43.png)

---

**TC #44 - Logout**  
Skenario: Klik keluar  
Expected: Ke login  
Status: ✅ PASS  
![ui44](image/ui44.png)

---

## 2. Testing UI Admin  

### 2.1 Dashboard Laporan  

**TC #45 - Load Data**  
Skenario: Buka halaman  
Expected: Data tampil  
Status: ✅ PASS  
![ui-adm1](image/ui-adm1.png)

---

**TC #46 - Filter Status**  
Skenario: Pilih status  
Expected: Terfilter  
Status: ✅ PASS  
![ui-adm2](image/ui-adm2.png)

---

**TC #47 - Filter Kategori**  
Skenario: Pilih kategori  
Expected: Terfilter  
Status: ✅ PASS  
![ui-adm3](image/ui-adm3.png)

---

**TC #48 - Filter Kombinasi**  
Skenario: Gabungan filter  
Expected: Sesuai  
Status: ✅ PASS  
![ui-adm4](image/ui-adm4.png)

---

**TC #49 - Ubah Status**  
Skenario: Ubah dropdown  
Expected: Tersimpan  
Status: ✅ PASS  
![ui-adm5](image/ui-adm5.png)

---

**TC #50 - Detail Laporan**  
Skenario: Klik detail  
Expected: Modal muncul  
Status: ✅ PASS  
![ui-adm6](image/ui-adm6.png)

---

**TC #51 - Tombol Pin**  
Skenario: Klik pin  
Expected: Modal tampil  
Status: ✅ PASS  
![ui-adm7](image/ui-adm7.png)

---

**TC #52 - Assign Unit**  
Skenario: Pilih unit  
Expected: Berhasil  
Status: ✅ PASS  
![ui-adm8](image/ui-adm8.png)

---

**TC #53 - Ke Statistik**  
Skenario: Klik statistik  
Expected: Pindah halaman  
Status: ✅ PASS  
![ui-adm9](image/ui-adm9.png)

---

### 2.2 Dashboard Statistik  

**TC #54 - Donut Chart**  
Skenario: Hover chart  
Expected: Tooltip muncul  
Status: ✅ PASS  
![ui-adm10](image/ui-adm10.png)

---

**TC #55 - Bar Chart**  
Skenario: Hover chart  
Expected: Tooltip muncul  
Status: ✅ PASS  
![ui-adm11](image/ui-adm11.png)

---

**TC #56 - Button Laporan**  
Skenario: Klik tombol  
Expected: Kembali ke laporan  
Status: ✅ PASS  
![ui-adm12](image/ui-adm12.png)

---

**TC #57 - Logout Admin**  
Skenario: Klik keluar  
Expected: Ke login  
Status: ✅ PASS  
![ui-adm13](image/ui-adm13.png)
