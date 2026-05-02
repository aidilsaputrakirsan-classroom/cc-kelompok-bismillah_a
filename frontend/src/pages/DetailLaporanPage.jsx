import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { getReport, fetchComments, createComment, submitFeedback, getUser } from "../services/api";
import { PageLoading } from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StatusTimeline from "../components/StatusTimeline";
import CommentSection from "../components/CommentSection";
import FeedbackForm from "../components/FeedbackForm";

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

  if (loading) return <PageLoading />;
  if (!report) return (
    <div className="page">
      <EmptyState
        icon="❌"
        title="Laporan Tidak Ditemukan"
        action={<button className="btn btn-primary" onClick={() => navigate("/dashboard")}>Kembali</button>}
      />
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
        <StatusTimeline currentStatus={report.status} />

        {/* Map */}
        {hasMap && (
          <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "1.25rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--border)",
            }}>
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
        <CommentSection
          comments={comments}
          currentUserId={currentUser?.id}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          loading={commentLoading}
          onSubmit={handleComment}
          formatDate={formatDate}
        />

        {/* Feedback (hanya jika selesai) */}
        {report.status === "selesai" && (
          <FeedbackForm
            form={feedbackForm}
            onFormChange={setFeedbackForm}
            onSubmit={handleFeedback}
            done={feedbackDone}
          />
        )}
      </div>
    </div>
  );
}