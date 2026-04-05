import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { fetchCategories, createReport } from "../services/api";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ITK coordinates
const ITK_CENTER = [-1.2655, 116.8308];

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function BuatLaporanPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    kategori_id: "",
    lokasi: "",
    tanggal_kejadian: "",
    anonim: false,
  });
  const [mapPosition, setMapPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const selectedCategory = categories.find((c) => c.id === Number(form.kategori_id));
  const isPerundungan = selectedCategory?.nama_kategori?.toLowerCase() === "perundungan";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        kategori_id: Number(form.kategori_id),
        latitude: mapPosition?.[0] || null,
        longitude: mapPosition?.[1] || null,
        tanggal_kejadian: form.tanggal_kejadian || null,
        anonim: isPerundungan ? true : form.anonim,
      };

      const report = await createReport(payload);
      navigate(`/laporan/${report.id}`);
    } catch (err) {
      setError(err.message || "Gagal membuat laporan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 860, padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: "1rem" }}
          >
            ← Kembali
          </button>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Buat Laporan Baru</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Semua laporan akan ditangani dengan cepat oleh tim ITK
          </p>
        </div>

        {/* Alert Perundungan */}
        {isPerundungan && (
          <div style={styles.alertInfo}>
            🔒 <strong>Laporan Perundungan</strong> — Identitas Anda akan <strong>dirahasiakan sepenuhnya</strong> dan lokasi hanya akan ditampilkan sebagai area umum.
          </div>
        )}

        {error && (
          <div style={styles.alertError}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
            <h3 style={styles.sectionTitle}>📝 Informasi Laporan</h3>

            <div className="form-group">
              <label className="form-label">
                Kategori <span className="required">*</span>
              </label>
              <div style={styles.categoryGrid}>
                {categories.map((cat) => {
                  const icons = { Kehilangan: "🔍", Fasilitas: "🏗️", Perundungan: "🛡️" };
                  const colors = { Kehilangan: "#8b5cf6", Fasilitas: "#3b82f6", Perundungan: "#ef4444" };
                  const selected = form.kategori_id === String(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, kategori_id: String(cat.id) })}
                      style={{
                        ...styles.categoryBtn,
                        borderColor: selected ? colors[cat.nama_kategori] || "var(--primary)" : "var(--border)",
                        background: selected ? `${colors[cat.nama_kategori]}18` : "white",
                        color: selected ? colors[cat.nama_kategori] || "var(--primary)" : "var(--text-primary)",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{icons[cat.nama_kategori] || "📋"}</span>
                      <span style={{ fontWeight: 600 }}>{cat.nama_kategori}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Judul Laporan <span className="required">*</span>
              </label>
              <input
                className="form-input"
                placeholder="Deskripsi singkat permasalahan"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                required minLength={5}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Deskripsi Detail <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Ceritakan detail kejadian, waktu, dan informasi relevan lainnya..."
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                required minLength={10}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nama Lokasi</label>
                <input
                  className="form-input"
                  placeholder="cth: Perpustakaan ITK Lantai 2"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Kejadian</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.tanggal_kejadian}
                  onChange={(e) => setForm({ ...form, tanggal_kejadian: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
            <h3 style={styles.sectionTitle}>📍 Pilih Lokasi di Peta</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Klik pada peta untuk menandai lokasi kejadian.
              {mapPosition && (
                <strong style={{ color: "var(--primary)", marginLeft: "0.5rem" }}>
                  📌 {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}
                </strong>
              )}
            </p>
            <div className="map-container" style={{ height: 350 }}>
              <MapContainer
                center={ITK_CENTER}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
              </MapContainer>
            </div>
            {mapPosition && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setMapPosition(null)}
                style={{ marginTop: "0.5rem" }}
              >
                × Hapus Titik Lokasi
              </button>
            )}
          </div>

          {/* Anonim */}
          {!isPerundungan && (
            <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
              <h3 style={styles.sectionTitle}>🕶️ Pengaturan Privasi</h3>
              <label style={{ display: "flex", alignItems: "center", gap: "0.875rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.anonim}
                  onChange={(e) => setForm({ ...form, anonim: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--primary)" }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Laporkan Secara Anonim</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    Identitas Anda tidak akan ditampilkan kepada publik
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !form.kategori_id}
            >
              {loading ? "Mengirim Laporan..." : "📤 Kirim Laporan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    marginBottom: "1.25rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-primary)",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.75rem",
  },
  categoryBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem",
    borderRadius: "var(--radius)",
    border: "2px solid",
    cursor: "pointer",
    background: "none",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  alertInfo: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1e40af",
    padding: "1rem 1.25rem",
    borderRadius: "var(--radius)",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
  },
  alertError: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "0.875rem 1rem",
    borderRadius: "var(--radius-sm)",
    marginBottom: "1.5rem",
    fontSize: "0.875rem",
  },
};