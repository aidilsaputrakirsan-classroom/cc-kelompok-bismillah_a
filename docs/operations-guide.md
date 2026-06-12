# 📘 Operations Guide

## 1. Tujuan Dokumen

Dokumen ini dibuat sebagai panduan operasional untuk melakukan monitoring dan troubleshooting pada sistem microservices **Laporin**.

Dokumen ini mencakup:

- Cara melakukan health check service
- Cara membaca log service
- Cara melakukan request tracing menggunakan Correlation ID
- Cara melakukan pengecekan metrics
- Common troubleshooting
- Escalation path jika terjadi masalah


---

## 2. Arsitektur Singkat Sistem

| Service | Fungsi |
|---|---|
| frontend | Menampilkan antarmuka pengguna aplikasi Laporin |
| gateway | API Gateway berbasis Nginx yang menerima request dan meneruskannya ke service terkait |
| auth-service | Mengelola autentikasi pengguna seperti register, login, token, dan manajemen user |
| report-service | Mengelola laporan kehilangan/penemuan, kategori, unit, notifikasi, dan feedback |
| auth database | Database untuk kebutuhan auth-service |
| report database | Database untuk kebutuhan report-service |


---

## 3. Menjalankan Sistem

Untuk menjalankan seluruh service:

```bash
docker compose up -d --build
```

Untuk melihat status seluruh container:

```bash
docker compose ps
```

Pastikan seluruh service berjalan dengan status:

```
Up
```

Jika terdapat status:

- `Exited` → Container berhenti atau crash
- `Restarting` → Container mengalami restart berulang
- `Unhealthy` → Health check container gagal


---

## 4. Cara Check Health

Health check digunakan untuk memastikan service dapat berjalan dengan baik.

### 4.1 Gateway Health Check

Melalui gateway:

```powershell
curl http://localhost/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "gateway"
}
```


### 4.2 Report Service Health Check

Melalui gateway:

```powershell
curl http://localhost/reports/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "backend",
  "database": "connected"
}
```

Jika response menunjukkan database error, lakukan pengecekan pada database dan log report-service.


### 4.3 Auth Service Health Check

Auth service saat ini tidak memiliki endpoint `/auth/health`.

Untuk memastikan auth-service berjalan, lakukan pengecekan:

```powershell
docker compose ps
```

atau lihat log:

```powershell
docker compose logs auth-service
```

Jika di masa mendatang endpoint health ditambahkan, pengecekan dapat dilakukan melalui:

```powershell
curl http://localhost/auth/health
```


---

## 5. Cara Membaca Log

Log digunakan untuk melihat aktivitas service, error, dan proses komunikasi antar service.

### 5.1 Melihat Semua Log

```powershell
docker compose logs
```


### 5.2 Melihat Log Gateway

```powershell
docker compose logs gateway --tail=50
```


### 5.3 Melihat Log Auth Service

```powershell
docker compose logs auth-service --tail=50
```


### 5.4 Melihat Log Report Service

```powershell
docker compose logs report-service --tail=50
```


### 5.5 Melihat Log Database

Auth database:

```powershell
docker compose logs auth-db --tail=50
```

Report database:

```powershell
docker compose logs report-db --tail=50
```


### 5.6 Melihat Log Secara Real-Time

```powershell
docker compose logs -f
```

Tekan `CTRL + C` untuk menghentikan monitoring.


---

## 6. Trace Request Menggunakan Correlation ID

Correlation ID digunakan untuk melacak satu request yang melewati beberapa service.

### 6.1 Mengirim Request dengan Correlation ID

PowerShell:

```powershell
Invoke-WebRequest `
  -Uri "http://localhost/reports/health" `
  -Headers @{ "X-Correlation-ID" = "test-123" }
```

### 6.2 Melihat Correlation ID di Log

```powershell
docker compose logs report-service
```

Pastikan log menampilkan nilai Correlation ID yang dikirim, contohnya:

```
correlation_id=test-123
GET /health
```


Jika Correlation ID tidak muncul, periksa:

- Middleware logging pada service
- Konfigurasi structured logging
- Konfigurasi header forwarding pada gateway


---

## 7. Cara Check Metrics

Metrics digunakan untuk melakukan monitoring jumlah request, error, dan performa service.


### 7.1 Auth Service Metrics

Melalui gateway:

```powershell
curl http://localhost/auth/metrics
```

Expected output:

```
# HELP
# TYPE
http_requests_total
```


### 7.2 Report Service Metrics

Melalui gateway:

```powershell
curl http://localhost/reports/metrics
```

Expected output:

```
# HELP
# TYPE
http_requests_total
```


Jika muncul:

```
404 Not Found
```

berarti endpoint metrics belum tersedia.

Jika muncul:

```
502 Bad Gateway
```

berarti gateway tidak dapat terhubung dengan service tujuan.


---

## 8. Common Troubleshooting


### 8.1 Masalah: 502 Bad Gateway

Gejala:

```
502 Bad Gateway
```

Kemungkinan penyebab:

- Service tujuan belum berjalan
- Konfigurasi route pada Nginx salah
- Nama service Docker tidak sesuai
- Gateway belum menggunakan konfigurasi terbaru


Langkah pengecekan:

```powershell
docker compose ps
```

```powershell
docker compose logs gateway --tail=50
```


Jika konfigurasi gateway berubah:

```powershell
docker compose restart gateway
```


---

### 8.2 Masalah: Database Tidak Terhubung

Gejala:

```json
{
  "database": "error"
}
```

Langkah pengecekan:

Lihat log database:

```powershell
docker compose logs report-db --tail=50
```

Lihat konfigurasi koneksi database pada file environment (`.env`) dan pastikan:

- Host menggunakan nama service Docker
- Port database sesuai konfigurasi
- Username dan password sesuai konfigurasi


---

### 8.3 Masalah: Container Tidak Berjalan

Langkah pengecekan:

```powershell
docker compose ps
```

Lihat log service:

```powershell
docker compose logs nama-service --tail=80
```

Jalankan ulang service:

```powershell
docker compose up -d --build nama-service
```


---

### 8.4 Masalah: Metrics Tidak Bisa Diakses

Gejala:

```
404 Not Found
```

atau:

```
502 Bad Gateway
```


Langkah pengecekan:

```powershell
curl http://localhost/auth/metrics
```

```powershell
curl http://localhost/reports/metrics
```

Lihat log gateway:

```powershell
docker compose logs gateway --tail=50
```


---

## 9. Escalation Path


Jika ditemukan masalah yang tidak dapat diselesaikan melalui pengecekan awal, lakukan eskalasi sesuai tanggung jawab berikut:


| Masalah | Eskalasi ke |
|---|---|
| Error endpoint auth-service atau report-service | Lead Backend |
| Error frontend atau tampilan aplikasi | Lead Frontend |
| Error Docker, gateway, deployment, atau konfigurasi server | Lead DevOps |
| Dokumentasi, hasil pengujian, atau monitoring | Lead QA & Documentation |


Alur eskalasi:

1. Lead QA & Documentation melakukan pengecekan melalui health check, logs, metrics, dan Correlation ID.
2. Jika masalah berasal dari backend, lampirkan endpoint yang gagal, response error, dan log service.
3. Jika masalah berasal dari gateway atau Docker, lampirkan hasil `docker compose ps`, konfigurasi terkait, dan log error.
4. Setelah perbaikan dilakukan, lakukan verifikasi ulang untuk memastikan sistem kembali berjalan normal.


---

## 10. Checklist Operasional


Gunakan checklist berikut sebelum menyatakan sistem siap digunakan:


- [✓] Seluruh container berjalan dengan `docker compose ps`
- [✓] Gateway dapat diakses melalui `http://localhost/health`
- [✓] Report service dapat diakses melalui `http://localhost/reports/health`
- [✓] Auth service berjalan berdasarkan status container dan log service
- [✓] Endpoint metrics `/auth/metrics` dan `/reports/metrics` dapat diakses melalui gateway
- [✓] Log setiap service dapat dibaca melalui `docker compose logs`
- [✓] Correlation ID dapat dikirim dan ditelusuri melalui log service
- [✓] Tidak terdapat error kritis pada database
- [✓] Gateway berhasil meneruskan request ke service terkait


---

**Dokumen ini digunakan sebagai panduan operasional dan troubleshooting sistem microservices Laporin.**