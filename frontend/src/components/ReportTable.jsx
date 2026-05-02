/**
 * ReportTable — Tabel laporan untuk admin dashboard
 * Menampilkan daftar laporan dalam format tabel dengan aksi admin
 */
import { Link } from "react-router-dom";

/**
 * @param {Array} reports - Daftar laporan
 * @param {function} formatDate - Fungsi format tanggal
 * @param {function} onStatusChange - Handler perubahan status
 * @param {function} onPrioritasChange - Handler perubahan prioritas
 * @param {function} onAssign - Handler assign ke unit
 */
export default function ReportTable({ reports, formatDate, onStatusChange, onPrioritasChange, onAssign }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Judul</th>
            <th>Kategori</th>
            <th>Status</th>
            <th>Prioritas</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                Tidak ada laporan ditemukan
              </td>
            </tr>
          ) : reports.map((r) => (
            <tr key={r.id}>
              <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>#{r.id}</td>
              <td>
                <div style={{ fontWeight: 600, maxWidth: 250 }}>
                  {r.judul}
                  {r.anonim && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>🕶️</span>}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{r.lokasi || "—"}</div>
              </td>
              <td>
                <span className={`badge badge-${r.category?.nama_kategori?.toLowerCase()}`}>
                  {r.category?.nama_kategori}
                </span>
              </td>
              <td>
                <select
                  value={r.status}
                  onChange={(e) => onStatusChange(r.id, e.target.value)}
                  style={{
                    padding: "0.375rem 0.5rem",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <option value="menunggu">⏳ Menunggu</option>
                  <option value="diproses">🔄 Diproses</option>
                  <option value="selesai">✅ Selesai</option>
                </select>
              </td>
              <td>
                <select
                  value={r.prioritas}
                  onChange={(e) => onPrioritasChange(r.id, e.target.value)}
                  style={{
                    padding: "0.375rem 0.5rem",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <option value="tinggi">🔴 Tinggi</option>
                  <option value="sedang">🟡 Sedang</option>
                  <option value="rendah">🟢 Rendah</option>
                </select>
              </td>
              <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                {formatDate(r.created_at)}
              </td>
              <td>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <Link to={`/laporan/${r.id}`} className="btn btn-ghost btn-sm" title="Detail">
                    👁️
                  </Link>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Assign Unit"
                    onClick={() => onAssign(r.id)}
                  >
                    📌
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
