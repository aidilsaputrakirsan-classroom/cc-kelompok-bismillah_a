# Testing Guide

Dokumen ini berfungsi sebagai referensi untuk menjalankan pengujian backend dan frontend, memahami hasil pipeline CI/CD, serta melakukan troubleshooting ketika terjadi kegagalan pada project.



## 1. Menjalankan Test Backend Secara Lokal

Bagian ini menjelaskan cara mengeksekusi seluruh pengujian backend di lingkungan lokal menggunakan `pytest`. Tujuannya adalah untuk memverifikasi bahwa endpoint API, mekanisme autentikasi, dan operasi CRUD berfungsi sebagaimana mestinya sebelum kode dikirim ke GitHub.

#### Langkah-langkah:

Buka terminal dan navigasikan ke direktori backend:

```bash
cd backend
```
Pasang semua dependency yang dibutuhkan (lakukan sekali saja):
```bash
pip install -r requirements.txt
```
Eksekusi pengujian:
```bash
pytest
```
Untuk output yang lebih informatif, tambahkan flag verbose:
```bash
pytest -v
```
Apabila perintah `pytest` tidak dikenali oleh sistem, install terlebih dahulu:
```bash
pip install pytest
```
Kemudian jalankan kembali:
```bash
pytest
```

---

## 2. Menjalankan Test Frontend Secara Lokal

Bagian ini membahas cara mengeksekusi pengujian pada sisi frontend. Pengujian ini bertujuan untuk memastikan komponen-komponen React dan berbagai fitur frontend bekerja dengan benar.

#### Langkah-langkah:

Pindah ke direktori frontend:

```bash
cd frontend
```
Install seluruh package yang diperlukan:
```bash
npm install
```
Jalankan test frontend:
```bash
npm test
```
Jika perintah di atas tidak tersedia, periksa bagian `scripts` di file berikut:
```bash
frontend/package.json
```
Perintah yang digunakan bisa bervariasi tergantung konfigurasi project, misalnya:
```bash
npm run test
```
atau:
```bash
npm run test -- --run
```

---

## 3. Membaca CI Log di GitHub Actions

Bagian ini menjelaskan cara memeriksa output CI/CD setelah melakukan push atau membuat Pull Request ke repository GitHub.

### Langkah-langkah:

1. Buka halaman repository di GitHub.
2. Navigasi ke tab **Actions**.
3. Pilih workflow yang sedang berjalan atau yang menampilkan status gagal.
4. Klik salah satu job untuk melihat detailnya:
   - Test Backend
   - Test Frontend
   - Build Docker
5. Temukan step yang ditandai warna merah jika ada error.
6. Baca pesan error yang tertera pada log tersebut.



## 4. Cara Debug Ketika Test Gagal

Bagian ini memberikan panduan untuk mengidentifikasi dan menyelesaikan penyebab kegagalan pengujian.

### Alur Debugging

1. Perhatikan pesan error yang muncul di terminal atau di GitHub Actions.
2. Identifikasi file test yang mengalami kegagalan.
3. Telusuri bagian assertion yang bermasalah.
4. Bandingkan nilai aktual yang dihasilkan dengan nilai yang seharusnya.
5. Verifikasi endpoint backend yang dipanggil.
6. Pastikan semua dependency sudah terpasang dengan benar.
7. Jalankan ulang test di lingkungan lokal.
8. Perbaiki error, lalu lakukan commit dan push kembali.

### Contoh Kasus Test Gagal

```python
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 999
```

Pengujian di atas akan gagal karena endpoint `/health` seharusnya merespons dengan status code `200`, bukan `999`.

### Solusi

```python
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
```

Setelah diperbaiki, jalankan ulang:

```bash
pytest
```

---

## 5. Menambahkan Test Baru

Penambahan test diperlukan untuk memverifikasi bahwa fitur baru atau perubahan pada kode tidak memunculkan regresi atau bug yang tidak terduga.

### Test Backend

Simpan file test di dalam folder berikut:

```bash
backend/tests/
```

Contoh nama file:

```bash
backend/tests/test_health.py
```

Contoh penulisan test backend yang sederhana:

```bash
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
```

### Hal Penting Saat Menulis Test

1. Nama file test untuk backend harus diawali dengan `test_`.
2. Nama fungsi test harus deskriptif agar mudah dipahami, dan wajib diawali dengan `test_`.
3. Selalu jalankan test secara lokal terlebih dahulu sebelum melakukan push ke GitHub.

## 6. Menjalankan Semua Test Sebelum Pull Request

Sebelum mengajukan Pull Request, pastikan semua test dijalankan dan hasilnya bersih dari error.

Backend:
```bash
cd backend
python -m pytest
```

Frontend:
```bash
cd frontend
npm test
```

Menggunakan Docker Compose:
```bash
docker compose up -d --build
docker compose exec backend pytest
```

Jika semua test berhasil, perubahan aman untuk di-push ke branch tujuan.

## 7. Memvalidasi Hasil Test

Bagian ini menjelaskan cara memastikan hasil pengujian sudah lolos dan siap untuk diintegrasikan ke repository.

#### Indikator keberhasilan:

Output dianggap berhasil apabila terminal menampilkan:
```bash
passed
```
atau:
```bash
All tests passed
```

- Jika semua test lulus, perubahan aman untuk diajukan sebagai Pull Request dan di-merge ke branch utama.
- Jika masih ada test yang gagal, sebaiknya tahan dulu proses merge. Perbaiki semua error hingga seluruh test berhasil dilewati.

Validasi juga dapat dipantau melalui GitHub Actions. Jika status CI menampilkan warna hijau atau keterangan *passing*, berarti seluruh workflow berjalan tanpa masalah.