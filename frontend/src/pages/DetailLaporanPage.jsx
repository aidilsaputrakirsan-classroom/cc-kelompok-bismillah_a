import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { getReport, fetchComments, createComment, submitFeedback, getUser } from "../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_COLORS = { menunggu: "#f59e0b", diproses: "#3b82f6", selesai: "#10b981" };
const STATUS_ICONS  = { menunggu: "⏳", diproses: "🔄", selesai: "✅" };

export default function DetailLaporanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, komentar: "" });
  const [feedbackDone, setFeedbackDone] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [rep, comms] = await Promise.all([
        getReport(Number(id)),
        fetchComments(Number(id)),
      ]);
      setReport(rep);
      setComments(comms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const c = await createComment(Number(id), newComment.trim());
      setComments([...comments, c]);
      setNewComment("");
    } catch (err) {
      alert(err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      await submitFeedback({ report_id: Number(id), ...feedbackForm });
      setFeedbackDone(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("id-ID", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) return <div className="page loading-overlay"><div className="spinner" /></div>;
  if (!report) return (
    <div className="page empty-state">
      <div className="empty-state-icon">❌</div>
      <h3>Laporan Tidak Ditemukan</h3>
      <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>Kembali</button>
    </div>
  );

  const hasMap = report.latitude && report.longitude;
  const trackingPoints = report.locations?.length > 0
    ? [[report.latitude, report.longitude], ...report.locations.map((l) => [l.latitude, l.longitude])]
    : [];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900, padding: "2rem 1.5rem" }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: "1.5rem" }}>
          ← Kembali
        </button>

        {/* Header Card */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span className={`badge badge-${report.category?.nama_kategori?.toLowerCase()}`}>
                {report.category?.nama_kategori}
              </span>
              <span
                className="badge"
                style={{
                  background: `${STATUS_COLORS[report.status]}20`,
                  color: STATUS_COLORS[report.status],
                }}
              >
                {STATUS_ICONS[report.status]} {report.status}
              </span>
              <span className={`badge badge-${report.prioritas}`}>{report.prioritas}</span>
              {report.anonim && <span className="badge" style={{ background: "#f1f5f9", color: "#475569" }}>🕶️ Anonim</span>}
            </div>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              #{report.id} · {formatDate(report.created_at)}
            </span>
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>{report.judul}</h1>

          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
            {report.deskripsi}
          </p>

          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {report.lokasi && <span>📍 {report.lokasi}</span>}
            {report.tanggal_kejadian && <span>📅 {report.tanggal_kejadian}</span>}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
          <h3 style={styles.sectionTitle}>📊 Status Laporan</h3>
          <div style={styles.statusTimeline}>
            {["menunggu", "diproses", "selesai"].map((s, i) => {
              const statuses = ["menunggu", "diproses", "selesai"];
              const currentIndex = statuses.indexOf(report.status);
              const isActive = i <= currentIndex;
              return (
                <div key={s} style={styles.timelineStep}>
                  <div style={{
                    ...styles.timelineDot,
                    background: isActive ? STATUS_COLORS[s] : "#e2e8f0",
                    color: isActive ? "white" : "#94a3b8",
                  }}>
                    {STATUS_ICONS[s]}
                  </div>
                  <div style={{ ...styles.timelineLabel, fontWeight: isActive ? 700 : 400, color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </div>
                  {i < 2 && (
                    <div style={{ ...styles.timelineLine, background: i < currentIndex ? STATUS_COLORS[statuses[i + 1]] : "#e2e8f0" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        {hasMap && (
          <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
            <h3 style={styles.sectionTitle}>
              📍 Lokasi Kejadian
              {report.locations?.length > 0 && (
                <span style={{ fontSize: "0.8125rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  + {report.locations.length} titik tracking
                </span>
              )}
            </h3>
            <div className="map-container" style={{ height: 300 }}>
              <MapContainer
                center={[report.latitude, report.longitude]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[report.latitude, report.longitude]}>
                  <Popup><strong>Lokasi Kejadian</strong><br />{report.lokasi}</Popup>
                </Marker>
                {report.locations?.map((loc) => (
                  <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                    <Popup>{loc.keterangan || "Titik tracking"}</Popup>
                  </Marker>
                ))}
                {trackingPoints.length > 1 && (
                  <Polyline positions={trackingPoints} color="#2563eb" weight={3} dashArray="8" />
                )}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
          <h3 style={styles.sectionTitle}>💬 Percakapan ({comments.length})</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.25rem" }}>
            {comments.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontStyle: "italic" }}>
                Belum ada percakapan. Berikan komentar atau tanyakan perkembangan laporan.
              </p>
            )}
            {comments.map((c) => {
              const isMe = c.user_id === currentUser?.id;
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

          <form onSubmit={handleComment} style={{ display: "flex", gap: "0.75rem" }}>
            <input
              className="form-input"
              placeholder="Tulis pesan atau pertanyaan..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={commentLoading}>
              {commentLoading ? "..." : "Kirim"}
            </button>
          </form>
        </div>

        {/* Feedback (hanya jika selesai) */}
        {report.status === "selesai" && !feedbackDone && (
          <div className="card-flat" style={{ border: "2px solid #10b981" }}>
            <h3 style={{ ...styles.sectionTitle, color: "#10b981" }}>⭐ Berikan Feedback</h3>
            <form onSubmit={handleFeedback}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: r })}
                      style={{
                        fontSize: "2rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        opacity: r <= feedbackForm.rating ? 1 : 0.3,
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
                  value={feedbackForm.komentar}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, komentar: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-success">Kirim Feedback</button>
            </form>
          </div>
        )}

        {feedbackDone && (
          <div style={{ background: "#d1fae5", color: "#065f46", padding: "1rem 1.25rem", borderRadius: "var(--radius)", textAlign: "center" }}>
            🎉 Terima kasih atas feedback Anda!
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    marginBottom: "1.25rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid var(--border)",
  },
  statusTimeline: {
    display: "flex",
    alignItems: "flex-start",
    gap: 0,
    position: "relative",
  },
  timelineStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  timelineDot: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.125rem",
    marginBottom: "0.5rem",
    zIndex: 1,
    position: "relative",
  },
  timelineLabel: {
    fontSize: "0.8125rem",
    textAlign: "center",
    textTransform: "capitalize",
  },
  timelineLine: {
    position: "absolute",
    top: 22,
    left: "calc(50% + 22px)",
    right: "calc(-50% + 22px)",
    height: 3,
    zIndex: 0,
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