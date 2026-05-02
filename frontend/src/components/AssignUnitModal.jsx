/**
 * AssignUnitModal — Modal untuk menugaskan laporan ke unit
 * Digunakan di AdminDashboardPage
 */
import Modal from "./Modal";

/**
 * @param {boolean} open - Apakah modal ditampilkan
 * @param {number|null} reportId - ID laporan yang akan di-assign
 * @param {Array} units - Daftar unit yang tersedia
 * @param {boolean} loading - Status loading assign
 * @param {function} onAssign - Handler assign (reportId, unitId)
 * @param {function} onClose - Handler tutup modal
 */
export default function AssignUnitModal({ open, reportId, units, loading, onAssign, onClose }) {
  return (
    <Modal open={open} onClose={() => !loading && onClose()} maxWidth={360}>
      <h3 style={{ marginBottom: "1rem", fontWeight: 700 }}>📌 Tugaskan ke Unit</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {units.map((u) => (
          <button
            key={u.id}
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", textAlign: "left" }}
            onClick={() => onAssign(reportId, u.id)}
            disabled={loading}
          >
            {u.nama_unit}
          </button>
        ))}
      </div>
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <span className="spinner spinner-sm" />
          Menugaskan...
        </div>
      )}
      <button className="btn btn-ghost btn-sm" style={{ marginTop: "1rem" }} onClick={onClose} disabled={loading}>
        Batal
      </button>
    </Modal>
  );
}
