/**
 * FeedbackForm — Form feedback untuk laporan yang sudah selesai
 * Digunakan di DetailLaporanPage ketika status = "selesai"
 */

const sectionTitle = {
  fontSize: "1rem",
  fontWeight: 700,
  marginBottom: "1.25rem",
  paddingBottom: "0.75rem",
  borderBottom: "1px solid var(--border)",
  color: "#10b981",
};

/**
 * @param {object} form - State form { rating, komentar }
 * @param {function} onFormChange - Handler perubahan form
 * @param {function} onSubmit - Handler submit feedback
 * @param {boolean} done - Apakah feedback sudah dikirim
 */
export default function FeedbackForm({ form, onFormChange, onSubmit, done, loading }) {
  if (done) {
    return (
      <div style={{ background: "#d1fae5", color: "#065f46", padding: "1rem 1.25rem", borderRadius: "var(--radius)", textAlign: "center" }}>
        🎉 Terima kasih atas feedback Anda!
      </div>
    );
  }

  return (
    <div className="card-flat" style={{ border: "2px solid #10b981" }}>
      <h3 style={sectionTitle}>⭐ Berikan Feedback</h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label">Rating</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onFormChange({ ...form, rating: r })}
                style={{
                  fontSize: "2rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: r <= form.rating ? 1 : 0.3,
                  transition: "opacity 0.2s",
                }}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Komentar (opsional)</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Bagaimana penanganan laporan Anda?"
            value={form.komentar}
            onChange={(e) => onFormChange({ ...form, komentar: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner spinner-sm" style={{ borderTopColor: "white" }} />
              Mengirim...
            </>
          ) : "Kirim Feedback"}
        </button>
      </form>
    </div>
  );
}
