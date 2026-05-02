# Retrospective — Milestone 1

> Dokumen refleksi tim Kelompok Bismillah_A setelah menyelesaikan Milestone 1 (Minggu 1-8).

---

## 🟢 Apa yang Berjalan Baik?

1. **Docker Compose berhasil disetup** — Semua service (backend, frontend, database) berjalan dengan satu perintah `docker compose up -d`
2. **Pembagian tugas sesuai peran** — Setiap anggota fokus pada area masing-masing (backend, frontend, devops, QA)
3. **Integrasi frontend-backend lancar** — API dan UI terhubung dengan baik menggunakan Axios
4. **Fitur utama selesai** — Pelaporan (kehilangan, kerusakan, perundungan), autentikasi, peta interaktif, dan dashboard admin semua berfungsi
5. **UI Testing 100% pass rate** — 59 test case, semua lulus

---

## 🔴 Apa yang Perlu Diperbaiki?

1. **Komunikasi tim perlu ditingkatkan** — Beberapa kali terjadi pekerjaan ganda karena kurang koordinasi
2. **Tidak ada code review** — Semua push langsung ke main tanpa review, berisiko konflik
3. **Dokumentasi belum lengkap** — Beberapa endpoint dan fitur belum didokumentasikan
4. **Testing hanya manual** — Belum ada automated testing (unit test / integration test)
5. **Tidak ada branching strategy** — Semua bekerja di branch main

---

## 🔵 Action Items untuk Milestone 2

1. [x] Terapkan GitHub Flow — branch protection + PR wajib (Modul 9)
2. [ ] Setup CI/CD pipeline dengan GitHub Actions (Modul 10-11)
3. [ ] Tingkatkan komunikasi via GitHub Issues dan PR discussions
4. [ ] Tambahkan automated testing
5. [ ] Lengkapi dokumentasi API dan user guide

---

## 📊 Kontribusi Tim

| Anggota | NIM | Peran | Kontribusi Utama |
|---------|-----|-------|-----------------|
| Aditya Laksamana P Butar Butar | 10231006 | Lead Backend | REST API, Database, Auth, Health Endpoint |
| Firni Fauziah Ramadhini | 10231038 | Lead Frontend | React UI, Pages, Routing, About Page |
| Muhammad Novri Aziztra | 10231066 | Lead DevOps | Docker, Compose, Deployment, Infrastructure |
| Salsabila Putri Zahrani | 10231086 | Lead QA & Docs | UI Testing, Documentation, README |

---

## 📝 Kesimpulan

Milestone 1 berhasil diselesaikan dengan seluruh fitur inti berfungsi dan deployable via Docker Compose. Perbaikan utama yang dibutuhkan adalah penerapan Git workflow yang lebih terstruktur (dimulai dari Modul 9) dan CI/CD pipeline untuk otomatisasi proses build dan testing.