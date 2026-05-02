/**
 * DeleteConfirmModal — Modal konfirmasi hapus laporan
 * Digunakan di DashboardPage saat user ingin menghapus laporan
 */
import Modal from "./Modal";

/**
 * @param {boolean} open - Apakah modal ditampilkan
 * @param {boolean} loading - Status loading delete
 * @param {function} onConfirm - Handler konfirmasi hapus
 * @param {function} onClose - Handler tutup modal
 */
export default function DeleteConfirmModal({ open, loading, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={() => !loading && onClose()} maxWidth={420} style={{ textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗑️</div>
      <h3 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Hapus Laporan?</h3>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
        Laporan yang dihapus <strong>tidak dapat dikembalikan</strong>.<br />
        Yakin ingin melanjutkan?
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button
          className="btn btn-ghost"
          onClick={onClose}
          disabled={loading}
        >
          Batal
        </button>
        <button
          className="btn"
          style={{ background: "#ef4444", color: "white", border: "none" }}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Menghapus..." : "Ya, Hapus Laporan"}
        </button>
      </div>
    </Modal>
  );
}
