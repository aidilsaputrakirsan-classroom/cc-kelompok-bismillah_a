# Deployment Guide — LAPORin ITK

Panduan lengkap untuk proses deployment, health check pasca-deploy, dan prosedur rollback manual jika terjadi kegagalan.

---

## Daftar Isi

1. [Alur Deployment (CD Pipeline)](#-alur-deployment-cd-pipeline)
2. [Health Check Pasca-Deploy](#-health-check-pasca-deploy)
3. [Rollback Manual](#-rollback-manual)
4. [Troubleshooting Deploy](#-troubleshooting-deploy)

---

## Alur Deployment (CD Pipeline)

CD Pipeline berjalan otomatis setelah CI Pipeline sukses, atau bisa dipicu manual melalui **workflow_dispatch**.

```
CI Pipeline ✅
     │
     ▼
Detect Changes  ──►  Deploy ke DeployCC  ──►  Health Check  ──►  Summary
```

### Langkah-langkah Pipeline:

| Step | Deskripsi |
|------|-----------|
| **Detect Changes** | Mendeteksi perubahan pada frontend/backend untuk memutuskan apa yang perlu di-build |
| **Deploy** | Build & kirim paket ZIP ke server DeployCC |
| **🏥 Health Check** | Memanggil endpoint `/health` untuk memverifikasi server berjalan |
| **Summary** | Menampilkan hasil deploy + status health check di GitHub Actions |

---

## Health Check Pasca-Deploy

Setelah deploy berhasil, pipeline secara otomatis memverifikasi bahwa aplikasi benar-benar berjalan dengan memanggil endpoint `/health`.

### Cara Kerja

```yaml
- name: 🏥 Health check
  run: |
    echo "Waiting for deployment to be ready..."
    sleep 30

    HEALTH_URL="https://<repo-name>.akhzafachrozy.my.id/health"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

    if [ "$HTTP_STATUS" == "200" ]; then
      echo "✅ Health check passed! (HTTP $HTTP_STATUS)"
    else
      echo "❌ Health check FAILED! (HTTP $HTTP_STATUS)"
      echo "Check Railway dashboard for logs."
      exit 1
    fi
```

### Logika Health Check:

1. **Tunggu 30 detik** — memberi waktu server untuk startup penuh setelah deploy
2. **Hit endpoint `/health`** — mengirim GET request ke `<domain>/health`
3. **Verifikasi HTTP 200** — jika response bukan 200, **workflow gagal (alert)**
4. **Tampil di Summary** — status health check muncul di ringkasan GitHub Actions

### Endpoint `/health` Backend

Backend FastAPI menyediakan endpoint:

```
GET /health
```

Response sukses (HTTP 200):

```json
{
  "status": "healthy"
}
```

### Kapan Health Check Gagal?

Health check akan **GAGAL** dan **workflow berhenti** jika:

- Server tidak merespons (timeout)
- Server mengembalikan HTTP selain 200 (misal: 502, 503, 500)
- Backend crash setelah deploy

---

## Rollback Manual

Jika health check gagal atau deployment bermasalah, ikuti langkah rollback berikut.

> ⚠️ **Penting:** Rollback dilakukan secara manual via Git + SSH ke server.

---

### Langkah 1 — Identifikasi Commit yang Stabil

```bash
# Lihat riwayat commit di branch main
git log --oneline -10 origin/main

# Contoh output:
# a1b2c3d (HEAD -> main) feat: tambah fitur laporan baru
# e4f5g6h fix: perbaiki validasi form          ← commit stabil terakhir
# i7j8k9l feat: update tampilan dashboard
```

Catat **commit hash** dari versi yang stabil (contoh: `e4f5g6h`).

---

### Langkah 2 — Revert ke Commit Stabil di GitHub

**Opsi A: Revert via Git (direkomendasikan)**

```bash
# Clone atau pull repo terbaru
git clone https://github.com/<org>/cc-kelompok-bismillah_a.git
cd cc-kelompok-bismillah_a

# Buat branch rollback
git checkout -b hotfix/rollback-<tanggal>

# Revert commit bermasalah (buat commit baru yang membatalkan perubahan)
git revert HEAD --no-edit

# Push branch rollback
git push origin hotfix/rollback-<tanggal>

# Buat PR ke main dan merge (atau langsung push jika ada akses)
```

**Opsi B: Hard Reset (HATI-HATI — hanya jika urgent dan sendirian)**

```bash
# Reset main ke commit stabil
git checkout main
git reset --hard e4f5g6h   # ganti dengan commit hash yang stabil

# Force push (berbahaya jika ada orang lain yang push)
git push origin main --force-with-lease
```

---

### Langkah 3 — Trigger Re-Deploy

Setelah kode di `main` kembali ke versi stabil, trigger ulang CD pipeline:

1. Buka GitHub → **Actions** → **CD — Deploy ke DeployCCC**
2. Klik **Run workflow** → pilih branch `main`
3. Aktifkan **"Paksa build ulang frontend"** jika diperlukan
4. Klik **Run workflow**

Pipeline akan berjalan ulang dan health check akan memverifikasi hasilnya.

---

### Langkah 4 — Rollback via SSH (Emergency)

Jika CD pipeline tidak bisa dijalankan, lakukan rollback langsung di server melalui SSH.

**Koneksi SSH ke server:**

```bash
# Dapatkan credentials SSH dari output GitHub Actions (step "Deploy to DeployCC")
ssh <ssh_user>@<server-host> -p <port>
# Masukkan password dari output step deploy
```

**Di dalam server:**

```bash
# 1. Cek status service backend saat ini
svc-status

# 2. Lihat log error
svc-logs       # log systemd live
svc-applog     # log aplikasi

# 3. Kembali ke versi sebelumnya (jika ada backup deployment)
ls /home/<user>/deployments/     # lihat daftar backup deploy

# 4. Restore backup (jika tersedia)
cp -r /home/<user>/deployments/backup-<tanggal>/* /home/<user>/app/

# 5. Restart service
svc-restart

# 6. Verifikasi health check manual
curl -s https://<repo-name>.akhzafachrozy.my.id/health
# Harus mengembalikan: {"status":"healthy"}
```

---

### Langkah 5 — Verifikasi Rollback Berhasil

Setelah rollback, verifikasi secara manual:

```bash
# Test health endpoint
curl -s -o /dev/null -w "%{http_code}" https://<repo-name>.akhzafachrozy.my.id/health
# Expected: 200

# Test endpoint utama
curl -s https://<repo-name>.akhzafachrozy.my.id/
# Expected: HTML atau JSON response normal
```

Jika mengembalikan **200**, rollback berhasil. ✅

---

## Troubleshooting Deploy

### Health Check Gagal Setelah Deploy

**Gejala:** Pipeline gagal di step "🏥 Health check", status HTTP bukan 200.

**Kemungkinan penyebab & solusi:**

| Penyebab | Solusi |
|----------|--------|
| Backend crash saat startup | Cek log dengan `svc-logs` via SSH |
| `.env` tidak lengkap/salah | SSH → `editenv` → edit → `svc-restart` |
| Dependensi baru belum ter-install | Trigger ulang CD dengan `force_full_rebuild=true` |
| Database tidak bisa dikoneksi | Cek `DATABASE_URL` di `.env` via SSH |
| Port conflict | Cek dengan `svc-status`, pastikan Uvicorn berjalan di port benar |

### Deploy Berhasil tapi Aplikasi Tidak Bisa Diakses

**Gejala:** Health check passed tapi browser tidak bisa buka aplikasi.

**Solusi:**
1. Cek Nginx/reverse proxy: `sudo systemctl status nginx`
2. Pastikan domain sudah resolve ke IP server yang benar
3. Cek SSL certificate masih valid

---

**Last Updated: 2026-05-22**
