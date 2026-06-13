"""Test foto bukti klaim disimpan di DB & disajikan via /claim-photo/{id}."""

import io

from PIL import Image

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


def _png_bytes():
    img = Image.new("RGB", (40, 40), (10, 150, 60))
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


def test_upload_claim_stores_photo_in_db_and_serves(client, db_session):
    # Owner laporan
    client.post("/auth/register", json={
        "email": "owner3@student.itk.ac.id", "password": "Owner@1234", "nama": "Owner Tiga",
    })
    # Finder (yang mengklaim)
    client.post("/auth/register", json={
        "email": "finder3@student.itk.ac.id", "password": "Finder@1234", "nama": "Finder Tiga",
    })

    owner_login = client.post("/auth/login", json={
        "email": "owner3@student.itk.ac.id", "password": "Owner@1234",
    })
    owner_headers = {"Authorization": f"Bearer {owner_login.json()['access_token']}"}

    finder_login = client.post("/auth/login", json={
        "email": "finder3@student.itk.ac.id", "password": "Finder@1234",
    })
    finder_headers = {"Authorization": f"Bearer {finder_login.json()['access_token']}"}

    cat = _ensure_kehilangan(db_session)
    resp = client.post("/reports", json={
        "judul": "Kunci Motor Hilang",
        "deskripsi": "kunci motor dengan gantungan biru",
        "kategori_id": cat.id, "lokasi": "parkiran",
    }, headers=owner_headers)
    report_id = resp.json()["id"]

    # Finder upload klaim + foto
    files = {"bukti": ("bukti.png", _png_bytes(), "image/png")}
    data = {"deskripsi": "saya menemukan kunci ini"}
    up = client.post(f"/reports/{report_id}/claim-found", data=data, files=files, headers=finder_headers)
    assert up.status_code == 200, up.text
    body = up.json()
    claim_id = body["id"]
    assert body["bukti_url"] == f"/claim-photo/{claim_id}"

    # Foto tersimpan sebagai biner di DB
    claim = db_session.query(FoundClaim).filter(FoundClaim.id == claim_id).first()
    assert claim.bukti_data is not None and len(claim.bukti_data) > 0
    assert claim.bukti_mime == "image/jpeg"

    # Endpoint serve mengembalikan gambar
    photo = client.get(f"/claim-photo/{claim_id}")
    assert photo.status_code == 200, photo.text
    assert photo.headers["content-type"] == "image/jpeg"
    assert len(photo.content) > 0


def test_claim_photo_404_when_no_data(client, db_session):
    photo = client.get("/claim-photo/999999")
    assert photo.status_code == 404
