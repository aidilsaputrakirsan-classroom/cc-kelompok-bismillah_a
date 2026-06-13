"""Reproduksi: pemilik laporan harus melihat found_claims di GET /reports/{id}."""

from models import User, Category, Report, FoundClaim
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _ensure_kehilangan(db):
    cat = db.query(Category).filter(Category.nama_kategori == "Kehilangan").first()
    if not cat:
        cat = Category(nama_kategori="Kehilangan")
        db.add(cat)
        db.commit()
        db.refresh(cat)
    return cat


def test_owner_sees_found_claims(client, db_session):
    # Owner register + login
    client.post("/auth/register", json={
        "email": "owner@student.itk.ac.id", "password": "Owner@1234", "nama": "Novri Owner",
    })
    login = client.post("/auth/login", json={
        "email": "owner@student.itk.ac.id", "password": "Owner@1234",
    })
    owner_token = login.json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    # Finder user langsung di DB
    finder = User(email="finder@student.itk.ac.id", nama="Aditya Finder",
                  hashed_password=pwd.hash("Finder@1234"), role="user")
    db_session.add(finder)
    db_session.commit()
    db_session.refresh(finder)

    cat = _ensure_kehilangan(db_session)

    # Owner buat laporan kehilangan
    resp = client.post("/reports", json={
        "judul": "Motor Beat Biru",
        "deskripsi": "kehilangan motor beat biru plat kt 9999 xl",
        "kategori_id": cat.id,
        "lokasi": "labter 2",
    }, headers=owner_headers)
    assert resp.status_code == 201, resp.text
    report_id = resp.json()["id"]

    # Finder klaim (langsung di DB, simulasi setelah upload foto)
    claim = FoundClaim(
        report_id=report_id, user_id=finder.id,
        deskripsi="Saya menemukan ini di gedung e201",
        bukti_path="claim_test.jpg", status="pending",
    )
    db_session.add(claim)
    db_session.commit()

    # Owner buka detail laporannya sendiri
    detail = client.get(f"/reports/{report_id}", headers=owner_headers)
    assert detail.status_code == 200, detail.text
    data = detail.json()

    assert "found_claims" in data, "Response tidak punya field found_claims!"
    assert len(data["found_claims"]) == 1, f"found_claims kosong/salah: {data['found_claims']}"
    fc = data["found_claims"][0]
    assert fc["user_nama"] == "Aditya Finder"
    assert fc["bukti_url"] is not None
    assert fc["status"] == "pending"


def _setup_owner_and_claim(client, db_session):
    """Helper: buat owner (login), finder, laporan kehilangan, dan 1 klaim pending.
    Return (owner_headers, report_id, claim_id)."""
    client.post("/auth/register", json={
        "email": "owner2@student.itk.ac.id", "password": "Owner@1234", "nama": "Owner Dua",
    })
    login = client.post("/auth/login", json={
        "email": "owner2@student.itk.ac.id", "password": "Owner@1234",
    })
    owner_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    finder = User(email="finder2@student.itk.ac.id", nama="Finder Dua",
                  hashed_password=pwd.hash("Finder@1234"), role="user")
    db_session.add(finder)
    db_session.commit()
    db_session.refresh(finder)

    cat = _ensure_kehilangan(db_session)
    resp = client.post("/reports", json={
        "judul": "Dompet Hitam Hilang",
        "deskripsi": "dompet kulit hitam berisi ktm dan kartu",
        "kategori_id": cat.id, "lokasi": "kantin",
    }, headers=owner_headers)
    report_id = resp.json()["id"]

    claim = FoundClaim(report_id=report_id, user_id=finder.id,
                       deskripsi="ketemu di mushola", bukti_path="c.jpg", status="pending")
    db_session.add(claim)
    db_session.commit()
    db_session.refresh(claim)
    return owner_headers, report_id, claim.id


def test_confirm_claim_sets_status_selesai(client, db_session):
    owner_headers, report_id, claim_id = _setup_owner_and_claim(client, db_session)

    resp = client.patch(f"/reports/{report_id}/claims/{claim_id}/confirm", headers=owner_headers)
    assert resp.status_code == 200, resp.text

    detail = client.get(f"/reports/{report_id}", headers=owner_headers).json()
    assert detail["status"] == "selesai", f"status seharusnya 'selesai', dapat '{detail['status']}'"
    assert detail["found_claims"][0]["status"] == "accepted"


def test_reject_claim_keeps_status_menunggu(client, db_session):
    owner_headers, report_id, claim_id = _setup_owner_and_claim(client, db_session)

    resp = client.patch(f"/reports/{report_id}/claims/{claim_id}/reject", headers=owner_headers)
    assert resp.status_code == 200, resp.text

    detail = client.get(f"/reports/{report_id}", headers=owner_headers).json()
    assert detail["status"] == "menunggu", f"status seharusnya tetap 'menunggu', dapat '{detail['status']}'"
    assert detail["found_claims"][0]["status"] == "rejected"

