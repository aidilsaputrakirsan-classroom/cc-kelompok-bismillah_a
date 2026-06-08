# 🔀 Git Workflow Guide 

## 📌 Deskripsi
Dokumen ini merupakan pedoman resmi penggunaan Git dalam tim pengembangan untuk memastikan seluruh proses kolaborasi berjalan secara **terstruktur, konsisten, dan terkontrol**. Dengan adanya workflow ini, setiap anggota tim diharapkan dapat memahami alur kerja yang sama, sehingga dapat meminimalkan konflik, meningkatkan kualitas kode, serta memastikan setiap perubahan telah melalui proses validasi sebelum digabungkan ke branch utama (`main`).

Workflow ini juga bertujuan untuk:
- Menjaga kerapihan riwayat perubahan (commit history)
- Mempermudah proses code review
- Meningkatkan komunikasi antar anggota tim
- Mengurangi risiko kesalahan dalam pengembangan sistem

---

## 1. Branch Naming

Setiap anggota tim **WAJIB membuat branch baru dari `main`** sebelum mulai mengerjakan tugas. Hal ini dilakukan agar perubahan yang dibuat tidak langsung mempengaruhi branch utama, sehingga stabilitas sistem tetap terjaga.

Branch digunakan sebagai ruang kerja terpisah untuk setiap fitur, perbaikan, atau perubahan tertentu.

### Format Penamaan
```
type/deskripsi-singkat
```

### Aturan Penamaan
- Menggunakan huruf kecil semua untuk menjaga konsistensi
- Menggunakan tanda hubung (`-`) sebagai pemisah kata
- Deskripsi harus jelas, spesifik, dan mencerminkan pekerjaan yang dilakukan
- Satu branch hanya digunakan untuk satu jenis pekerjaan
- Tidak diperbolehkan menggunakan nama yang terlalu umum seperti `update`, `revisi`, atau `fix-bug`

### Jenis Branch

| Tipe | Kapan Digunakan | Penjelasan | Contoh |
|------|----------------|------------|--------|
| `feature/` | Saat menambahkan fitur baru | Digunakan ketika mengembangkan fungsi atau fitur baru yang sebelumnya belum ada dalam sistem | `feature/user-profile` |
| `fix/` | Saat memperbaiki bug atau error | Digunakan untuk menangani kesalahan pada sistem, baik error kecil maupun bug kritis | `fix/login-token-expired` |
| `docs/` | Saat mengubah dokumentasi | Digunakan untuk menambah, mengubah, atau memperbaiki dokumentasi tanpa mengubah kode utama | `docs/api-docs-update` |
| `refactor/` | Saat merapikan kode | Digunakan ketika melakukan perbaikan struktur kode agar lebih rapi dan efisien tanpa mengubah fungsionalitas | `refactor/split-service-layer` |
| `chore/` | Saat melakukan maintenance | Digunakan untuk perubahan pendukung seperti update dependency, konfigurasi, atau file build | `chore/update-dependencies` |

### Contoh Penamaan

| Penamaan yang Benar | Penamaan yang Kurang Tepat | Penjelasan |
|--------------------|--------------------------|-----------|
| `feature/payment-integration` | `feature/payment` | Terlalu umum, tidak menjelaskan detail fitur |
| `fix/api-timeout-error` | `fix/bug` | Tidak spesifik terhadap bug yang diperbaiki |
| `docs/docker-setup-guide` | `docs/update` | Tidak menjelaskan perubahan yang dilakukan |

---

## 2. Commit Convention

Commit message merupakan catatan perubahan yang dilakukan dalam repository. Oleh karena itu, setiap commit harus ditulis dengan jelas dan konsisten menggunakan standar **Conventional Commits**.

### Format
```
type: deskripsi singkat
```

### Jenis Commit

| Tipe | Kapan Digunakan | Penjelasan | Contoh |
|------|----------------|------------|--------|
| `feat` | Saat menambahkan fitur baru | Digunakan untuk perubahan yang menambahkan fungsionalitas baru ke dalam sistem | `feat: add user profile page` |
| `fix` | Saat memperbaiki bug | Digunakan untuk memperbaiki error atau bug yang ditemukan | `fix: resolve JWT token expiry issue` |
| `docs` | Saat mengubah dokumentasi | Digunakan untuk perubahan pada file dokumentasi | `docs: update API documentation` |
| `refactor` | Saat merapikan kode | Digunakan ketika memperbaiki struktur kode tanpa mengubah hasil output | `refactor: simplify auth logic` |
| `chore` | Saat maintenance | Digunakan untuk update dependency, konfigurasi, atau perubahan non-fungsional lainnya | `chore: update dependencies` |
| `test` | Saat menambah testing | Digunakan untuk menambahkan atau memperbarui unit test | `test: add unit test for login` |
| `style` | Saat memperbaiki format kode | Digunakan untuk perubahan terkait tampilan kode seperti indentasi atau spasi | `style: fix indentation` |

### Aturan Commit
- Menggunakan bahasa Inggris agar lebih universal
- Menggunakan kata kerja aktif seperti *add*, *fix*, *update*
- Satu commit hanya untuk satu perubahan utama
- Menghindari commit dengan deskripsi yang tidak jelas seperti:
  - `update`
  - `revisi`
  - `fix bug`

---

## 3. Pull Request Process

Pull Request (PR) merupakan proses pengajuan perubahan agar dapat direview sebelum digabungkan ke branch `main`.

### Alur Kerja

#### 1. Update branch main
```bash
git checkout main
git pull origin main
```

#### 2. Membuat branch baru
```bash
git checkout -b feature/nama-fitur
```

#### 3. Melakukan pengembangan
- Kerjakan sesuai dengan task yang diberikan
- Fokus pada satu jenis perubahan
- Pastikan tidak merusak fitur lain

#### 4. Melakukan commit
```bash
git add .
git commit -m "feat: add fitur baru"
```

#### 5. Push ke repository
```bash
git push origin feature/nama-fitur
```

#### 6. Membuat Pull Request di GitHub
Isi PR dengan:
- Title sesuai commit utama
- Description yang menjelaskan:
  - Apa yang dikerjakan
  - Tujuan perubahan
  - Dampak terhadap sistem

Tambahkan:
- Assignee (diri sendiri)
- Reviewer (minimal 1 orang)

### Checklist PR

- [ ] Sudah update dari main terbaru
- [ ] Tidak ada konflik (conflict)
- [ ] Perubahan sudah diuji
- [ ] Tidak ada file sensitif
- [ ] Sudah sesuai dengan aturan penamaan dan commit

#### 7. Proses Review
- Reviewer wajib memeriksa perubahan
- Memberikan komentar jika diperlukan
- PR tidak boleh langsung di-merge tanpa review

#### 8. Proses Merge
- Gunakan metode **Squash and Merge**
- Hapus branch setelah merge selesai

---

## 4. Code Review Guidelines

Code review dilakukan untuk memastikan kualitas kode tetap terjaga dan sesuai standar tim.

### Hal yang Harus Dicek

| Aspek | Penjelasan |
|------|-----------|
| Fungsionalitas | Memastikan fitur berjalan sesuai dengan tujuan yang diharapkan |
| Readability | Memastikan kode mudah dibaca dan dipahami oleh anggota tim lain |
| Struktur | Memastikan kode tersusun rapi dan konsisten |
| Error Handling | Memastikan error sudah ditangani dengan baik |
| Security | Memastikan tidak ada data sensitif dalam kode |
| Dampak Perubahan | Memastikan perubahan tidak merusak bagian lain |

---

## 5. Standar Review Comment

Setiap reviewer wajib memberikan minimal tiga jenis komentar:

### 1. Praise
Komentar apresiasi terhadap bagian yang sudah baik.

### 2. Suggestion
Saran perbaikan untuk meningkatkan kualitas kode.

### 3. Question
Pertanyaan untuk klarifikasi atau diskusi lebih lanjut.

### Larangan
- Tidak diperbolehkan hanya menulis "LGTM"
- Tidak diperbolehkan memberikan review tanpa komentar

---

## 6. CODEOWNERS & Review Mapping

File `.github/CODEOWNERS` digunakan untuk menentukan reviewer otomatis berdasarkan area file yang diubah.

### Tujuan
- Memastikan setiap bagian direview oleh orang yang sesuai
- Mempercepat proses review

### Pasangan Review

| PR dari | Reviewer |
|--------|----------|
| Lead Backend | Lead Frontend |
| Lead Frontend | Lead Backend |
| Lead DevOps | Lead QA & Docs |
| Lead QA & Docs | Lead DevOps |

### Mapping Area File

| Path | Penanggung Jawab |
|------|----------------|
| backend/ | Lead Backend |
| frontend/ | Lead Frontend |
| docker-compose.yml | DevOps |
| backend/Dockerfile | DevOps |
| frontend/Dockerfile | DevOps |
| Makefile | DevOps |
| docs/ | QA & Docs |
| README.md | QA & Docs |

---

## 7. Aturan Wajib Tim

### Larangan
- Tidak boleh push langsung ke branch `main`
- Tidak boleh merge tanpa melalui Pull Request
- Tidak boleh commit file sensitif seperti `.env`, password, atau token
- Tidak boleh membuat PR tanpa deskripsi

### Kewajiban
- Semua perubahan harus melalui Pull Request
- Minimal terdapat 1 approval sebelum merge
- Menggunakan metode **Squash and Merge**
- Mengikuti aturan branch naming dan commit convention

---

## 8. Best Practice

- Gunakan branch kecil agar mudah direview
- Update branch secara berkala dari `main`
- Hindari Pull Request yang terlalu besar
- Gunakan nama yang deskriptif
- Dokumentasikan perubahan penting

---

## 📌 Kesimpulan

Dengan mengikuti Git Workflow ini, tim dapat:
- Bekerja secara lebih terstruktur dan terorganisir
- Mengurangi konflik saat kolaborasi
- Meningkatkan kualitas kode yang dihasilkan
- Mempermudah proses review dan pemeliharaan sistem