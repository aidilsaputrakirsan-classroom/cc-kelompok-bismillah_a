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
  actionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.625rem 1.5rem",
    background: "#fffbeb",
    borderTop: "1px solid #fde68a",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  actionHint: {
    fontSize: "0.75rem",
    color: "#92400e",
    fontWeight: 500,
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

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
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
      </Link>

      {/* Action bar — hanya tampil jika status "menunggu" */}
      {r.status === "menunggu" && (
        <div style={styles.actionBar}>
          <span style={styles.actionHint}>
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
