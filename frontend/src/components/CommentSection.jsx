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
    color: "var(--text-primary)",
  },
  comment: {
    maxWidth: "75%",
    display: "flex",
    flexDirection: "column",
  },
};

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
              {/* Use CSS class for bubble so dark mode can override */}
              <div className={isMe ? "comment-bubble-self" : "comment-bubble-other"}>
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
