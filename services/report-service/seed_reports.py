"""
Seed laporan untuk setiap user (bukan admin).
Masing-masing user mendapat 3 laporan: Kehilangan, Fasilitas, Perundungan.

Jalankan:
    docker cp services/report-service/seed_reports.py laporin-report-service:/app/seed_reports.py
    docker exec laporin-report-service python seed_reports.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Report, Category

from datetime import date, timedelta
import random

# ── user_id → (nama_pelapor)
USERS = [
    {"id": 2,  "nama": "Aditya Laksamana P Butar Butar"},
    {"id": 5,  "nama": "Firni Fauziah Ramadhini"},
    {"id": 6,  "nama": "Muhammad Novri Aziztra"},
    {"id": 7,  "nama": "Salsabila Putri Zahrani"},
]

# kategori_id
KAT_KEHILANGAN  = 1
KAT_FASILITAS   = 2
KAT_PERUNDUNGAN = 3

# Template laporan per kategori; {nama} akan diganti nama pelapor
TEMPLATES = {
    KAT_KEHILANGAN: [
        {
            "judul": "Kehilangan Dompet di Kantin",
            "deskripsi": "Dompet berwarna coklat hilang di area kantin kampus. "
                         "Di dalam dompet terdapat KTP, kartu mahasiswa, dan sejumlah uang tunai. "
                         "Jika menemukan, harap hubungi saya segera.",
            "lokasi": "Kantin ITK",
            "latitude": -1.1492,
            "longitude": 116.8618,
        },
        {
            "judul": "Kehilangan Earphone Bluetooth",
            "deskripsi": "Earphone Bluetooth merk JBL warna hitam tertinggal di ruang baca perpustakaan. "
                         "Terakhir digunakan saat jam istirahat. Mohon bantuannya.",
            "lokasi": "Perpustakaan ITK",
            "latitude": -1.1488,
            "longitude": 116.8640,
        },
        {
            "judul": "Kehilangan Buku Catatan",
            "deskripsi": "Buku catatan berwarna biru dengan cover nama pemilik hilang setelah kelas. "
                         "Sangat penting karena berisi catatan UTS. Terima kasih.",
            "lokasi": "Gedung Perkuliahan A",
            "latitude": -1.1480,
            "longitude": 116.8620,
        },
        {
            "judul": "Kehilangan Kartu Mahasiswa",
            "deskripsi": "Kartu mahasiswa hilang kemungkinan terjatuh di area parkir atau lorong gedung. "
                         "Sangat dibutuhkan untuk keperluan administrasi. Harap menghubungi jika menemukan.",
            "lokasi": "Area Parkir ITK",
            "latitude": -1.1485,
            "longitude": 116.8655,
        },
    ],
    KAT_FASILITAS: [
        {
            "judul": "Kursi Ruang Kelas Rusak",
            "deskripsi": "Terdapat beberapa kursi di ruang kelas yang kakinya patah dan berpotensi membahayakan mahasiswa. "
                         "Mohon segera dilakukan perbaikan agar tidak mengganggu kegiatan belajar mengajar.",
            "lokasi": "Ruang Kelas B204",
            "latitude": -1.1505,
            "longitude": 116.8630,
        },
        {
            "judul": "AC Laboratorium Komputer Tidak Berfungsi",
            "deskripsi": "Air Conditioner di laboratorium komputer tidak dingin sejak seminggu lalu. "
                         "Suhu ruangan sangat panas dan mengganggu konsentrasi serta merusak perangkat komputer.",
            "lokasi": "Lab Komputer Lantai 2",
            "latitude": -1.1510,
            "longitude": 116.8625,
        },
        {
            "judul": "Toilet Lantai 3 Tersumbat",
            "deskripsi": "Toilet di lantai 3 gedung perkuliahan sudah tersumbat selama 3 hari. "
                         "Menimbulkan bau tidak sedap dan tidak bisa digunakan. Mohon penanganan segera.",
            "lokasi": "Gedung Perkuliahan Lantai 3",
            "latitude": -1.1500,
            "longitude": 116.8610,
        },
        {
            "judul": "Lampu Lorong Mati",
            "deskripsi": "Lampu penerangan di lorong gedung utama sudah mati sejak beberapa hari lalu. "
                         "Kondisi ini sangat gelap dan berbahaya, terutama saat malam hari.",
            "lokasi": "Lorong Gedung Utama",
            "latitude": -1.1520,
            "longitude": 116.8628,
        },
    ],
    KAT_PERUNDUNGAN: [
        {
            "judul": "Perundungan Verbal di Grup Media Sosial",
            "deskripsi": "Terdapat mahasiswa yang melakukan perundungan verbal secara online di grup media sosial angkatan. "
                         "Korban merasa tertekan dan tidak nyaman. Mohon ditindaklanjuti.",
            "lokasi": "Online / Media Sosial",
            "latitude": None,
            "longitude": None,
            "is_sensitive": True,
        },
        {
            "judul": "Intimidasi dari Senior",
            "deskripsi": "Dilaporkan adanya intimidasi dari mahasiswa senior kepada mahasiswa baru "
                         "selama kegiatan orientasi. Korban diminta melakukan hal-hal yang tidak wajar. "
                         "Laporan ini bersifat rahasia.",
            "lokasi": "Area Kampus ITK",
            "latitude": -1.1495,
            "longitude": 116.8650,
            "is_sensitive": True,
        },
        {
            "judul": "Perundungan Fisik di Lingkungan Kampus",
            "deskripsi": "Terdapat insiden perundungan fisik yang dialami mahasiswa di area kampus. "
                         "Korban mengalami tekanan psikologis dan membutuhkan bantuan. "
                         "Mohon segera ditindaklanjuti.",
            "lokasi": "Lingkungan Kampus ITK",
            "latitude": -1.1515,
            "longitude": 116.8635,
            "is_sensitive": True,
        },
        {
            "judul": "Diskriminasi dalam Kegiatan Organisasi",
            "deskripsi": "Mahasiswa tertentu mengalami diskriminasi dan perlakuan tidak adil "
                         "dalam kegiatan organisasi kemahasiswaan. Laporan ini memerlukan penanganan bijaksana.",
            "lokasi": "Ruang Organisasi Mahasiswa",
            "latitude": -1.1475,
            "longitude": 116.8615,
            "is_sensitive": True,
        },
    ],
}


LOKASI_LIST = [
    "Perpustakaan ITK", "Kantin ITK", "Lab Komputer",
    "Gedung Perkuliahan A", "Gedung Perkuliahan B", "Area Parkir",
]

STATUS_LIST = ["menunggu", "diproses", "selesai"]


def pick_template(kategori_id: int, user_index: int) -> dict:
    """Ambil template berdasarkan user_index (0-3) agar tiap user beda konten."""
    templates = TEMPLATES[kategori_id]
    return templates[user_index % len(templates)]


def seed_reports(db: Session):
    print("\n📋 Mulai seed laporan...\n")
    created = 0

    base_date = date(2026, 5, 1)

    for idx, user in enumerate(USERS):
        user_id = user["id"]
        nama = user["nama"]
        print(f"  👤 {nama} (id={user_id})")

        for kat_id, kat_label in [
            (KAT_KEHILANGAN, "Kehilangan"),
            (KAT_FASILITAS, "Fasilitas"),
            (KAT_PERUNDUNGAN, "Perundungan"),
        ]:
            # Cek apakah sudah ada laporan dari user ini dengan kategori ini
            existing = db.query(Report).filter(
                Report.user_id == user_id,
                Report.kategori_id == kat_id
            ).first()
            if existing:
                print(f"    ⏭️  [{kat_label}] sudah ada, dilewati")
                continue

            tmpl = pick_template(kat_id, idx)
            tanggal = base_date + timedelta(days=idx * 7 + kat_id * 2)

            report = Report(
                user_id=user_id,
                judul=tmpl["judul"],
                deskripsi=tmpl["deskripsi"],
                kategori_id=kat_id,
                lokasi=tmpl.get("lokasi", "Kampus ITK"),
                latitude=tmpl.get("latitude"),
                longitude=tmpl.get("longitude"),
                tanggal_kejadian=tanggal,
                status="menunggu",
                prioritas="sedang",
                anonim=False,
                is_sensitive=tmpl.get("is_sensitive", False),
                pelapor_nama=nama,
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            print(f"    ✅ [{kat_label}] id={report.id} — {report.judul}")
            created += 1

        print()

    print(f"{'='*55}")
    print(f"  Total laporan dibuat : {created}")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_reports(db)
    finally:
        db.close()
