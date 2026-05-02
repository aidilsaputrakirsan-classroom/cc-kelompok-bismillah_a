/**
 * EditReportModal — Modal untuk edit laporan
 * Digunakan di DashboardPage saat user ingin mengedit laporan berstatus "menunggu"
 */
import Modal from "./Modal";

/**
 * @param {object|null} report - Data laporan yang diedit (null = modal tutup)
 * @param {object} form - State form { judul, deskripsi, lokasi, kategori_id }
 * @param {function} onFormChange - Handler perubahan form
 * @param {Array} categories - Daftar kategori
 * @param {boolean} loading - Status loading submit
 * @param {function} onSubmit - Handler submit form
 * @param {function} onClose - Handler tutup modal
 */
export default function EditReportModal({ report, form, onFormChange, categories, loading, onSubmit, onClose }) {
  return (
    <Modal open={!!report} onClose={onClose} maxWidth={560}>
      <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.125rem" }}>
        ✏️ Edit Laporan
      </h3>
      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        Hanya laporan berstatus <strong>Menunggu</strong> yang bisa diedit.
      </p>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label">Judul Laporan *</label>
          <input
            className="form-input"
            value={form.judul}
            onChange={(e) => onFormChange({ ...form, judul: e.target.value })}
            required
            minLength={5}
            maxLength={255}
            placeholder="Judul singkat laporan"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Kategori *</label>
          <select
            className="form-select"
            value={form.kategori_id}
            onChange={(e) => onFormChange({ ...form, kategori_id: Number(e.target.value) })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nama_kategori}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi *</label>
          <textarea
            className="form-input"
            rows={4}
            value={form.deskripsi}
            onChange={(e) => onFormChange({ ...form, deskripsi: e.target.value })}
            required
            minLength={10}
            style={{ resize: "vertical" }}
            placeholder="Deskripsi detail kejadian"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Lokasi</label>
          <input
            className="form-input"
            value={form.lokasi}
            onChange={(e) => onFormChange({ ...form, lokasi: e.target.value })}
            placeholder="Contoh: Gedung A Lantai 2"
          />
        </div>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
