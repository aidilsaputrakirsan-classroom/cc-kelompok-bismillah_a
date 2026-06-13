/**
 * ReportCard — Komponen card laporan individual
 * Digunakan di DashboardPage untuk menampilkan daftar laporan user
 */
import { Link } from "react-router-dom";

const STATUS_BADGE = {
  menunggu: "badge badge-menunggu",
  diproses: "badge badge-diproses",
  selesai: "badge badge-selesai",
};

const PRIO_BADGE = {
  tinggi: "badge badge-tinggi",
  sedang: "badge badge-sedang",
  rendah: "badge badge-rendah",
};

const styles = {
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

/**
 * @param {object} report - Data laporan
 * @param {function} formatDate - Fungsi format tanggal
 * @param {function} onEdit - Handler klik tombol edit
 * @param {function} onDelete - Handler klik tombol hapus
 */
export default function ReportCard({ report, formatDate, onEdit, onDelete }) {
  const r = report;
  const pendingClaims = (r.found_claims || []).filter((c) => c.status === "pending").length;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Banner klaim penemuan menunggu konfirmasi pemilik */}
      {pendingClaims > 0 && (
        <Link
          to={`/laporan/${r.id}`}
          style={{
            display: "flex", alignItems: "center", gap: "0.625rem",
            padding: "0.75rem 1.5rem", textDecoration: "none",
            background: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
            borderBottom: "2px solid #f59e0b", color: "#92400e",
          }}
        >
          <span style={{ fontSize: "1.25rem", lineHeight: 1, flexShrink: 0 }}>🔔</span>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, flex: 1, lineHeight: 1.4 }}>
            {pendingClaims} klaim penemuan menunggu konfirmasi Anda — klik untuk meninjau
          </span>
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>→</span>
        </Link>
      )}
      {/* Clickable area → detail page */}
      <Link
        to={`/laporan/${r.id}`}
        style={{ textDecoration: "none", color: "inherit", display: "block", padding: "1.25rem 1.5rem" }}
      >
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
                <span className="badge badge-anonim">
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
      </Link>

      {/* Action bar — hanya tampil jika status "menunggu" */}
      {r.status === "menunggu" && (
        <div className="report-action-bar">
          <span className="report-action-hint">
            ℹ️ Laporan masih bisa diedit atau dihapus selagi menunggu
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onEdit(r)}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: "#ef4444" }}
              onClick={() => onDelete(r.id)}
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
