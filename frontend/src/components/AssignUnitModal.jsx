/**
 * AssignUnitModal — Modal untuk menugaskan laporan ke unit
 * Digunakan di AdminDashboardPage
 */
import Modal from "./Modal";

/**
 * @param {boolean} open - Apakah modal ditampilkan
 * @param {number|null} reportId - ID laporan yang akan di-assign
 * @param {Array} units - Daftar unit yang tersedia
 * @param {function} onAssign - Handler assign (reportId, unitId)
 * @param {function} onClose - Handler tutup modal
 */
export default function AssignUnitModal({ open, reportId, units, onAssign, onClose }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={360}>
      <h3 style={{ marginBottom: "1rem", fontWeight: 700 }}>📌 Tugaskan ke Unit</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {units.map((u) => (
          <button
            key={u.id}
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start", textAlign: "left" }}
            onClick={() => onAssign(reportId, u.id)}
          >
            {u.nama_unit}
          </button>
        ))}
      </div>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: "1rem" }} onClick={onClose}>
        Batal
      </button>
    </Modal>
  );
}
