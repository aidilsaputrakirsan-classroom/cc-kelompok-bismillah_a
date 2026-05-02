/**
 * EmptyState — Komponen empty state reusable
 * Ditampilkan ketika tidak ada data yang ditemukan
 */

/**
 * @param {string} icon - Emoji icon (default 📭)
 * @param {string} title - Judul empty state
 * @param {string} description - Deskripsi/pesan
 * @param {React.ReactNode} action - Tombol aksi (opsional)
 */
export default function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
