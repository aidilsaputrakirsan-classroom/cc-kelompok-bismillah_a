import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchKehilanganReports, getUser } from "../services/api";
import { InlineLoading } from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ServiceUnavailableBanner, { isServiceError } from "../components/ServiceUnavailableBanner";

const STATUS_CONFIG = {
  menunggu: { label: "Menunggu", icon: "⏳", color: "#f59e0b", bg: "#fffbeb" },
  diproses: { label: "Diproses", icon: "🔄", color: "#3b82f6", bg: "#eff6ff" },
  selesai: { label: "Selesai", icon: "✅", color: "#10b981", bg: "#f0fdf4" },
  ditemukan: { label: "Ditemukan", icon: "🎉", color: "#8b5cf6", bg: "#f5f3ff" },
};

export default function DaftarKehilanganPage() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await fetchKehilanganReports(params);
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.75rem" }}>
            🔍 Daftar Kehilangan Barang
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {total} laporan kehilangan dari seluruh civitas ITK
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="card-flat" style={{
          display: "flex", gap: "1rem", marginBottom: "1.5rem",
          padding: "1rem 1.25rem", flexWrap: "wrap", alignItems: "center",
        }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: 220 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari barang hilang..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 1, fontSize: "0.875rem" }}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap" }}>
              🔍 Cari
            </button>
          </form>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto", minWidth: 160, fontSize: "0.875rem" }}
          >
            <option value="">Semua Status</option>
            <option value="menunggu">⏳ Menunggu</option>
            <option value="diproses">🔄 Diproses</option>
            <option value="ditemukan">🎉 Ditemukan</option>
            <option value="selesai">✅ Selesai</option>
          </select>
        </div>

        {/* Error */}
        {error && isServiceError(error) && <ServiceUnavailableBanner onRetry={load} />}
        {error && !isServiceError(error) && (
          <div style={{
            background: "#fee2e2", color: "#991b1b",
            padding: "0.875rem 1rem", borderRadius: "8px",
            marginBottom: "1rem", fontSize: "0.875rem",
          }}>⚠️ {error}</div>
        )}

        {/* Content */}
        {loading ? (
          <InlineLoading />
        ) : reports.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Tidak Ada Laporan Kehilangan"
            description={search ? `Tidak ditemukan hasil untuk "${search}"` : "Belum ada laporan kehilangan barang."}
          />
        ) : (
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
            {reports.map((r) => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.menunggu;
              const isOwner = currentUser?.id === r.pelapor_id;

              return (
                <div key={r.id} className="card kehilangan-card" style={{
                  cursor: "pointer", transition: "var(--transition)",
                  border: r.status === "ditemukan" ? "2px solid #8b5cf6" : undefined,
                }} onClick={() => navigate(isOwner ? `/laporan/${r.id}` : `/kehilangan/${r.id}`)}>

                  {/* Top row: status + date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span className="badge" style={{ background: sc.bg, color: sc.color, fontWeight: 600 }}>
                      {sc.icon} {sc.label}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {formatDate(r.tanggal_kejadian || r.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: "1rem", fontWeight: 700,
                    marginBottom: "0.5rem", lineHeight: 1.4,
                    color: "var(--text-primary)",
                  }}>{r.judul}</h3>

                  {/* Description preview */}
                  <p style={{
                    fontSize: "0.8125rem", color: "var(--text-secondary)",
                    lineHeight: 1.5, marginBottom: "0.75rem",
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{r.deskripsi}</p>

                  {/* Meta row */}
                  <div style={{
                    display: "flex", gap: "1rem", flexWrap: "wrap",
                    fontSize: "0.8rem", color: "var(--text-muted)",
                    paddingTop: "0.75rem", borderTop: "1px solid var(--border)",
                  }}>
                    {r.lokasi && <span>📍 {r.lokasi}</span>}
                    <span>👤 {r.pelapor_nama}</span>
                    {isOwner && (
                      <span className="badge" style={{
                        background: "var(--primary)", color: "white",
                        fontSize: "0.6875rem", padding: "0.125rem 0.5rem",
                      }}>Milik Anda</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
