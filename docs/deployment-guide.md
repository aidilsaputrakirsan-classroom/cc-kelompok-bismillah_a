# 🚀 Deployment Guide

## Railway Setup

Pada proyek LAPORin ITK, layanan Railway digunakan sebagai platform hosting untuk frontend, backend, dan database PostgreSQL pada environment production. Konfigurasi berikut diperlukan agar aplikasi dapat berjalan dengan baik setelah proses deployment.

### Langkah Setup Railway

1. Login ke Railway menggunakan akun GitHub.
2. Buat project baru di Railway.
3. Tambah PostgreSQL database service.
4. Deploy backend dengan root directory `/backend`.
5. Deploy frontend dengan root directory `/frontend`.

---

## Environment Variables
Environment variables digunakan agar aplikasi dapat berjalan di environment production tanpa menyimpan konfigurasi langsung di dalam kode.

### Backend (Railway)
| Variable | Contoh Value |
|----------|-------------|
| DATABASE_URL | ${{Postgres.DATABASE_URL}} |
| SECRET_KEY | (random hex 64 chars) |
| CORS_ORIGINS | https://frontend-url.railway.app |
| ENVIRONMENT | production |

### Frontend (Railway)
| Variable | Contoh Value |
|----------|-------------|
| VITE_API_URL | https://backend-url.railway.app |

### GitHub Secrets
| Secret | Keterangan |
|--------|-----------|
| RAILWAY_TOKEN | Token dari railway.app/account/tokens |

---

## Troubleshooting

| Masalah | Kemungkinan Penyebab | Solusi |
|----------|----------|----------|
| Backend menghasilkan error 502 setelah deployment | Service backend gagal melakukan startup karena konfigurasi environment variable belum sesuai sehingga aplikasi tidak dapat terhubung ke database dan Railway tidak dapat meneruskan request ke backend | Periksa log deployment pada Railway, perbaiki konfigurasi environment variable yang bermasalah, pastikan koneksi database berhasil, lalu lakukan redeploy dan verifikasi bahwa endpoint backend dapat diakses tanpa error |

