/**
 * StatCard — Komponen stat card untuk dashboard admin
 * Menampilkan angka statistik dengan icon dan warna
 */

/**
 * @param {string} label - Label statistik (cth: "Total Laporan")
 * @param {number} value - Nilai angka
 * @param {string} icon - Emoji icon
 * @param {string} bg - Warna background icon
 * @param {string} color - Warna teks value
 */
export default function StatCard({ label, value, icon, bg, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
      </div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
