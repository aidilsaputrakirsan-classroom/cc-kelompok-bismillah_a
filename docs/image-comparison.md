# Perbandingan Ukuran Docker Image (Python 3.12)

Dokumen ini berisi hasil perbandingan (komparasi) ukuran dasar dari beberapa varian _base image_ Docker untuk **Python 3.12**. Pengujian ini dilakukan oleh tim *Quality Assurance* (QA) & Docs sebagai landasan untuk menentukan _image_ versi mana yang paling efisien, aman, dan ringan untuk digunakan pada tahap _production/deployment_ layanan backend aplikasi **LaporIn ITK**.

---

## 1. Tabel Perbandingan Image OS Dasar *(Base Image)*

Berikut ini adalah perbandingan ukuran _uncompressed_ (ukuran saat image diekstrak di dalam _local storage_ mesin saat di _build_) untuk masing-masing varian Docker Image `python` versi 3.12:

| Varian Base Image | Kisaran Ukuran Image | Sistem Operasi | Keterangan & Karakteristik Utama |
| :--- | :--- | :--- | :--- |
| **`python:3.12`** | **~ 1.01 GB** | Debian Linux | Varian default (paling lengkap). Membawa segala macam _system library_ dan *build tool* C-compiler bawaan OS. Secara kompatibilitas sangat baik, namun ukurannya sangat membengkak dan berat. |
| **`python:3.12-slim`** | **~ 152 MB** | Debian Slim | Varian yang difokuskan pada penghematan _storage_. *Package*-*package* level OS yang jarang dipakai telah dihapuskan. Menawarkan titik kompromi terbaik antara kompatibilitas (masih pakai `glibc`) dan keringanan *size*. |
| **`python:3.12-alpine`** | **~ 55 MB** | Alpine Linux | Varian paling minimalis dan mutlak teringan. Dibangun di atas OS Alpine Linux. Sangat hemat *storage*, tetapi menggunakan standar `musl libc` alih-alih `glibc` standar, yang membuatnya kerap mengalami error (_compatibility issue_) terutama saat install *library* yang memiliki ekstensi C-compiled (seperti driver PostgreSQL). |

*\*Catatan: Ukuran size tersebut merupakan patokan referensi rata-rata size default dari Docker Hub Registries uncompressed.*

---

## 2. Kesimpulan & Analisis Kelayakan

Dari data hasil perbandingan di atas, evaluasi dari sudut pandang optimasi Docker adalah sebagai berikut:

1. **Penggunaan varian `python:3.12` (Default) Sangat Tidak Efisien:** Memaksakan image berukuran di atas 1 GB untuk *container* microservice akan memperlambat alur *pipeline* *Continuous Integration / Continuous Deployment* (CI/CD) dikarenakan besarnya jumlah _bandwidth_ yang termakan ketika melakukan _pull_ / _push_ image.
2. **Keterbatasan Varian `python:3.12-alpine`:** Meskipun ukurannya menang telak (hanya segelintir puluh Megabytes), banyak pustaka Python (seperti NumPy, Pandas, Scikit, hingga _bindings_ database besar) yang tidak di- _compile_ dengan mulus untuk lingkungan arsitektur non-`glibc`. Diperlukan instalasi header tambahan agar proses instalasi tak macet, yang pada akhirnya malah memperbesar *image* Alpine itu sendiri.
3. **Pilihan Terbaik Paling Optimal (`python:3.12-slim`):** Kombinasi performa kompromi paling bagus jatuh pada varian `-slim`. Hanya memakan *storage* sekitar ~150 MB (menghemat ukuran image setidaknya ±85% dibandingkan varian original), tidak rewel saat _building dependency_ menggunakan PIP, serta _boot-up time container_ di sisi server *production* bisa berlangsung secara instan.

## 3. Rekomendasi 

Sebagai rumusan keputusan untuk tim *Lead DevOps*, saya selaku *Lead QA & Docs* sangat merekomendasikan penggunaan **`python:3.12-slim`** (atau versi sejenis seperti `python:3.12-slim-bookworm`) di dalam skrip `Dockerfile` _backend_ LaporIn. Pendekatan ini dipercaya akan sangat mengefisiensi ruang _cloud server_ tanpa mengorbankan _stability_ layanan.
