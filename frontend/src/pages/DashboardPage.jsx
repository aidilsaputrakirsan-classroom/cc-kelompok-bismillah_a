import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchReports, fetchCategories } from "../services/api";

const STATUS_BADGE = {
  menunggu: "badge badge-menunggu",
  diproses: "badge badge-diproses",
  selesai:  "badge badge-selesai",
};

const PRIO_BADGE = {
  tinggi: "badge badge-tinggi",
  sedang: "badge badge-sedang",
  rendah: "badge badge-rendah",
};

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", kategori_id: "", search: "" });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.kategori_id) params.kategori_id = filters.kategori_id;
      if (filters.search) params.search = filters.search;
      const data = await fetchReports(params);
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories().then(setCategories);
    load();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    load();
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Laporan Saya</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Total {total} laporan tercatat
            </p>
          </div>
          <Link to="/laporan/buat" className="btn btn-primary">
            ➕ Buat Laporan Baru
          </Link>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleFilter} style={styles.filterBar}>
          <input
            className="form-input"
            placeholder="🔍 Cari laporan..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ maxWidth: 300, flex: 1 }}
          />
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{ maxWidth: 200 }}
          >
            <option value="">Semua Status</option>
            <option value="menunggu">⏳ Menunggu</option>
            <option value="diproses">🔄 Diproses</option>
            <option value="selesai">✅ Selesai</option>
          </select>
          <select
            className="form-select"
            value={filters.kategori_id}
            onChange={(e) => setFilters({ ...filters, kategori_id: e.target.value })}
            style={{ maxWidth: 200 }}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nama_kategori}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Cari</button>
        </form>

        {/* Content */}
        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Belum Ada Laporan</h3>
            <p>Anda belum membuat laporan. Klik tombol di atas untuk memulai.</p>
            <Link to="/laporan/buat" className="btn btn-primary">Buat Laporan Pertama</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reports.map((r) => (
              <Link
                key={r.id}
                to={`/laporan/${r.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card" style={styles.reportCard}>
                  <div style={styles.cardTop}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.cardMeta}>
                        <span className={`badge badge-${r.category?.nama_kategori?.toLowerCase() || "fasilitas"}`}>
                          {r.category?.nama_kategori || "—"}
                        </span>
                        <span className={STATUS_BADGE[r.status]}>
                          {r.status}
                        </span>
                        <span className={PRIO_BADGE[r.prioritas]}>
                          {r.prioritas}
                        </span>
                        {r.anonim && (
                          <span className="badge" style={{ background: "#f1f5f9", color: "#475569" }}>
                            🕶️ Anonim
                          </span>
                        )}
                      </div>
                      <h3 style={styles.cardTitle}>{r.judul}</h3>
                      <p style={styles.cardDesc}>{r.deskripsi?.slice(0, 120)}...</p>
                    </div>
                    <div style={styles.cardArrow}>→</div>
                  </div>
                  <div style={styles.cardBottom}>
                    <span>📍 {r.lokasi || "Lokasi tidak dicantumkan"}</span>
                    <span>🕐 {formatDate(r.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  filterBar: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    alignItems: "center",
    background: "white",
    padding: "1rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
  },
  reportCard: {
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "1rem",
  },
  cardMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  cardTitle: {
    fontSize: "1.0625rem",
    fontWeight: 700,
    marginBottom: "0.375rem",
    color: "var(--text-primary)",
  },
  cardDesc: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  cardArrow: {
    fontSize: "1.25rem",
    color: "var(--text-muted)",
    flexShrink: 0,
    alignSelf: "center",
  },
  cardBottom: {
    display: "flex",
    gap: "1.5rem",
    fontSize: "0.8125rem",
    color: "var(--text-muted)",
    paddingTop: "1rem",
    borderTop: "1px solid var(--border)",
    flexWrap: "wrap",
  },
};