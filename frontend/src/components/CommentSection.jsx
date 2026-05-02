/**
 * CommentSection — Section percakapan/komentar di detail laporan
 * Digunakan di DetailLaporanPage
 */
import { ButtonLoading } from "./LoadingSpinner";

const styles = {
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    marginBottom: "1.25rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid var(--border)",
  },
  comment: {
    maxWidth: "75%",
    display: "flex",
    flexDirection: "column",
  },
  commentBubble: {
    padding: "0.625rem 0.875rem",
    borderRadius: 12,
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
};

/**
 * @param {Array} comments - Daftar komentar
 * @param {number} currentUserId - ID user yang sedang login
 * @param {string} newComment - Value input komentar baru
 * @param {function} onNewCommentChange - Handler perubahan input
 * @param {boolean} loading - Status loading submit komentar
 * @param {function} onSubmit - Handler submit komentar
 * @param {function} formatDate - Fungsi format tanggal
 */
export default function CommentSection({ comments, currentUserId, newComment, onNewCommentChange, loading, onSubmit, formatDate }) {
  return (
    <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
      <h3 style={styles.sectionTitle}>💬 Percakapan ({comments.length})</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.25rem" }}>
        {comments.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontStyle: "italic" }}>
            Belum ada percakapan. Berikan komentar atau tanyakan perkembangan laporan.
          </p>
        )}
        {comments.map((c) => {
          const isMe = c.user_id === currentUserId;
          return (
            <div key={c.id} style={{ ...styles.comment, alignSelf: isMe ? "flex-end" : "flex-start" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                {isMe ? "Anda" : (c.user?.nama || "Admin")} · {formatDate(c.created_at)}
              </div>
              <div style={{
                ...styles.commentBubble,
                background: isMe ? "var(--primary)" : "white",
                color: isMe ? "white" : "var(--text-primary)",
                border: isMe ? "none" : "1px solid var(--border)",
              }}>
                {c.pesan}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: "0.75rem" }}>
        <input
          className="form-input"
          placeholder="Tulis pesan atau pertanyaan..."
          value={newComment}
          onChange={(e) => onNewCommentChange(e.target.value)}
          style={{ flex: 1 }}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner spinner-sm" style={{ borderTopColor: "white" }} />
              Mengirim...
            </>
          ) : "Kirim"}
        </button>
      </form>
    </div>
  );
}
