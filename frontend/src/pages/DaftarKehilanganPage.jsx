import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchLostReports } from "../services/api";
import { InlineLoading } from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ServiceUnavailableBanner, { isServiceError } from "../components/ServiceUnavailableBanner";

const STATUS_CONFIG = {
  menunggu: { label: "Menunggu", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  diproses: { label: "Diproses", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  selesai:  { label: "Selesai",  color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

const PRIO_CONFIG = {
  tinggi: { label: "Tinggi", color: "#ef4444" },
  sedang: { label: "Sedang", color: "#f59e0b" },
  rendah: { label: "Rendah", color: "#6b7280" },
};

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function LostItemCard({ report }) {
  const r = report;
  const statusCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.menunggu;
  const prioCfg   = PRIO_CONFIG[r.prioritas]  || PRIO_CONFIG.sedang;

  return (
    <Link
      to={`/laporan/${r.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          transition: "transform 0.18s, box-shadow 0.18s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        {/* Color accent bar */}
        <div style={{
          height: 4,
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          borderRadius: "12px 12px 0 0",
        }} />

        <div style={{ padding: "1.25rem 1.5rem" }}>
          {/* Top row: badges + arrow */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {/* Status badge */}
              <span style={{
                fontSize: "0.75rem", fontWeight: 600, padding: "2px 10px",
                borderRadius: 20, background: statusCfg.bg, color: statusCfg.color,
              }}>
                {statusCfg.label}
              </span>
              {/* Priority badge */}
              <span style={{
                fontSize: "0.75rem", fontWeight: 600, padding: "2px 10px",
                borderRadius: 20, background: "var(--bg-secondary)", color: prioCfg.color,
              }}>
                ● {prioCfg.label}
              </span>
              {r.anonim && (
                <span style={{
                  fontSize: "0.75rem", fontWeight: 600, padding: "2px 10px",
                  borderRadius: 20, background: "rgba(107,114,128,0.1)", color: "#6b7280",
                }}>
                  🕶️ Anonim
                </span>
              )}
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "1.125rem", flexShrink: 0 }}>→</span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: "1.0625rem", fontWeight: 700,
            color: "var(--text-primary)", marginBottom: "0.375rem",
            lineHeight: 1.35,
          }}>
            🔍 {r.judul}
          </h3>

          {/* Description */}
          <p style={{
            fontSize: "0.875rem", color: "var(--text-secondary)",
            lineHeight: 1.55, marginBottom: "1rem",
          }}>
            {r.deskripsi?.length > 130 ? r.deskripsi.slice(0, 130) + "..." : r.deskripsi || "—"}
          </p>

          {/* Footer meta */}
          <div style={{
            display: "flex", gap: "1.25rem", fontSize: "0.8rem",
            color: "var(--text-muted)", paddingTop: "0.875rem",
            borderTop: "1px solid var(--border)", flexWrap: "wrap",
          }}>
            <span>📍 {r.lokasi || "Lokasi tidak dicantumkan"}</span>
            <span>🕐 {formatDate(r.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DaftarKehilanganPage() {
  const navigate = useNavigate();

  const [reports, setReports]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(0);

  const LIMIT = 12;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchLostReports({
        skip: page * LIMIT,
        limit: LIMIT,
        search: search || undefined,
      });
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat daftar kehilangan.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(0);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div style={{
              width: 44, height: 44,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.375rem", flexShrink: 0,
            }}>
              🔍
            </div>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
                Daftar Kehilangan
              </h1>
              <p style={{ color: "var(--text-muted)", margin: "0.2rem 0 0", fontSize: "0.9rem" }}>
                {total > 0
                  ? `${total} laporan kehilangan dari seluruh civitas ITK`
                  : "Laporan kehilangan barang dari seluruh civitas ITK"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <form
          onSubmit={handleSearch}
          style={{
            display: "flex", gap: "0.75rem", marginBottom: "1.75rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{
            position: "relative", flex: "1 1 300px",
          }}>
            <span style={{
              position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
              fontSize: "1rem", color: "var(--text-muted)", pointerEvents: "none",
            }}>
              🔎
            </span>
            <input
              id="search-kehilangan"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama/deskripsi/lokasi barang..."
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                borderRadius: 10,
                border: "1.5px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontSize: "0.9375rem",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
          >
            Cari
          </button>

          {search && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClearSearch}
              style={{ padding: "0.75rem 1.25rem" }}
            >
              ✕ Hapus Filter
            </button>
          )}
        </form>

        {/* ── Active filter chip ── */}
        {search && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(59,130,246,0.1)", color: "#3b82f6",
            padding: "0.375rem 0.875rem", borderRadius: 20,
            fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.25rem",
          }}>
            🔎 Hasil pencarian: <em>"{search}"</em>
            <button
              onClick={handleClearSearch}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 0, fontSize: "0.875rem", marginLeft: 2 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Service Error Banner ── */}
        {error && isServiceError(error) && (
          <ServiceUnavailableBanner onRetry={load} />
        )}

        {/* ── Generic Error ── */}
        {error && !isServiceError(error) && (
          <div style={{
            background: "#fee2e2", color: "#991b1b",
            padding: "0.875rem 1rem", borderRadius: 8,
            marginBottom: "1rem", fontSize: "0.875rem",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <InlineLoading />
        ) : reports.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={search ? "Tidak Ada Hasil" : "Belum Ada Laporan Kehilangan"}
            description={
              search
                ? `Tidak ditemukan laporan kehilangan yang cocok dengan kata kunci "${search}".`
                : "Belum ada laporan kehilangan yang dibuat oleh civitas ITK."
            }
            action={
              search
                ? <button className="btn btn-ghost" onClick={handleClearSearch}>Hapus Pencarian</button>
                : <Link to="/laporan/buat" className="btn btn-primary">Buat Laporan Kehilangan</Link>
            }
          />
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}>
              {reports.map((r) => (
                <LostItemCard key={r.id} report={r} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                gap: "0.5rem", marginTop: "1rem",
              }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Sebelumnya
                </button>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", padding: "0 0.5rem" }}>
                  Halaman {page + 1} dari {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
