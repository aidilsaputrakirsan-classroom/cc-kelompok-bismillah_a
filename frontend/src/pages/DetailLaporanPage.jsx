import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { getReport, fetchComments, createComment, submitFeedback, getUser, markReportFound, confirmFoundClaim, rejectFoundClaim, getUploadUrl } from "../services/api";
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

const STATUS_COLORS = { menunggu: "#f59e0b", diproses: "#3b82f6", selesai: "#10b981", ditemukan: "#8b5cf6" };
const STATUS_ICONS = { menunggu: "⏳", diproses: "🔄", selesai: "✅", ditemukan: "🎉" };

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
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [markFoundLoading, setMarkFoundLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Upload URL dibangun via getUploadUrl() dari api.js

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
    setFeedbackLoading(true);
    try {
      await submitFeedback({ report_id: Number(id), ...feedbackForm });
      setFeedbackDone(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleMarkFound = async () => {
    if (!confirm("Tandai laporan ini sebagai sudah ditemukan sendiri?")) return;
    setMarkFoundLoading(true);
    try {
      await markReportFound(Number(id));
      alert("Barang berhasil ditandai ditemukan!");
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setMarkFoundLoading(false);
    }
  };

  const handleConfirmClaim = async (claimId) => {
    if (!confirm("Konfirmasi bahwa barang Anda memang ditemukan oleh orang ini?")) return;
    setActionLoading(claimId);
    try {
      await confirmFoundClaim(Number(id), claimId);
      alert("✅ Klaim dikonfirmasi! Barang sudah ditemukan.");
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClaim = async (claimId) => {
    if (!confirm("Tolak klaim penemuan ini?")) return;
    setActionLoading(claimId);
    try {
      await rejectFoundClaim(Number(id), claimId);
      alert("Klaim ditolak.");
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
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
          <div className="detail-header-top" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
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

          <div className="detail-meta-row" style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {report.lokasi && <span>📍 {report.lokasi}</span>}
            {report.tanggal_kejadian && <span>📅 {report.tanggal_kejadian}</span>}
          </div>
        </div>

        {/* Status Timeline */}
        <StatusTimeline currentStatus={report.status} />

        {/* Mark Found Button — khusus laporan Kehilangan milik sendiri yang belum ditemukan */}
        {report.category?.nama_kategori?.toLowerCase() === "kehilangan" &&
          !(["ditemukan", "selesai"].includes(report.status)) && (
          <div className="card" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Apakah barang Anda sudah ditemukan?
            </p>
            <button
              className="btn btn-primary"
              onClick={handleMarkFound}
              disabled={markFoundLoading}
              style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}
            >
              {markFoundLoading ? "⏳ Memproses..." : "🎉 Tandai Sudah Ditemukan Sendiri"}
            </button>
          </div>
        )}

        {/* Ditemukan Banner */}
        {report.status === "ditemukan" && (
          <div className="card" style={{ marginBottom: "1.5rem", background: "#f5f3ff", border: "2px solid #8b5cf6", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎉</div>
            <h3 style={{ fontWeight: 700, color: "#7c3aed", marginBottom: "0.25rem" }}>Barang Sudah Ditemukan!</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Laporan ini telah ditandai sebagai sudah ditemukan.</p>
          </div>
        )}

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
            <div className="map-container map-container-detail" style={{ height: 300 }}>
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

        {/* Found Claims Section — hanya untuk laporan Kehilangan */}
        {report.category?.nama_kategori?.toLowerCase() === "kehilangan" && (() => {
          const allClaims = report.found_claims || [];
          const pendingClaims = allClaims.filter(c => c.status === "pending");
          if (allClaims.length === 0) return null;
          return (
            <>
              {/* Banner notifikasi klaim pending */}
              {pendingClaims.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
                  border: "2px solid #f59e0b",
                  borderRadius: 14,
                  padding: "1.25rem 1.5rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}>
                  <div style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0 }}>🔔</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#92400e", fontSize: "0.9375rem", marginBottom: "0.375rem" }}>
                      Ada {pendingClaims.length} Klaim Penemuan Menunggu Konfirmasi Anda!
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#78350f", lineHeight: 1.6 }}>
                      {pendingClaims.map((c, i) => (
                        <span key={c.id}>
                          <strong>{c.user_nama || "Pengguna"}</strong> mengklaim menemukan barang Anda
                          {i < pendingClaims.length - 1 ? "; " : ". "}
                        </span>
                      ))}
                      Lihat detail dan konfirmasi di bawah.
                    </div>
                  </div>
                </div>
              )}

              {/* Daftar semua klaim */}
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                  📋 Klaim Penemuan ({allClaims.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {allClaims.map((claim) => {
                    const CLAIM_STATUS = {
                      pending: { label: "Menunggu Konfirmasi", color: "#f59e0b", bg: "#fffbeb" },
                      accepted: { label: "Diterima", color: "#10b981", bg: "#f0fdf4" },
                      rejected: { label: "Ditolak", color: "#ef4444", bg: "#fef2f2" },
                    };
                    const cs = CLAIM_STATUS[claim.status] || CLAIM_STATUS.pending;
                    return (
                      <div key={claim.id} style={{
                        background: "var(--card-bg, #f8fafc)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "1rem",
                        opacity: claim.status === "rejected" ? 0.6 : 1,
                      }}>
                        {/* Header klaim */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <span style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                              color: "white", display: "inline-flex",
                              alignItems: "center", justifyContent: "center",
                              fontSize: "0.875rem", fontWeight: 700, flexShrink: 0,
                            }}>
                              {(claim.user_nama || "?")[0].toUpperCase()}
                            </span>
                            {claim.user_nama || "Pengguna"}
                          </span>
                          <span className="badge" style={{ background: cs.bg, color: cs.color, fontSize: "0.75rem" }}>
                            {cs.label}
                          </span>
                        </div>

                        {/* Deskripsi */}
                        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.75rem", lineHeight: 1.6 }}>
                          {claim.deskripsi}
                        </p>

                        {/* Foto bukti */}
                        {claim.bukti_url && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem" }}>📸 Foto Bukti:</div>
                            <img
                              src={getUploadUrl(claim.bukti_url)}
                              alt="Bukti penemuan"
                              style={{
                                maxWidth: "100%", maxHeight: 220, borderRadius: 8,
                                objectFit: "cover", border: "1px solid var(--border)",
                                cursor: "pointer", display: "block",
                              }}
                              onClick={() => window.open(getUploadUrl(claim.bukti_url), "_blank")}
                            />
                          </div>
                        )}

                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                          🕐 {formatDate(claim.created_at)}
                        </div>

                        {/* Tombol konfirmasi/tolak — hanya untuk klaim pending */}
                        {claim.status === "pending" && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleConfirmClaim(claim.id)}
                              disabled={actionLoading === claim.id}
                              style={{ flex: 1 }}
                            >
                              {actionLoading === claim.id ? "⏳" : "✅ Konfirmasi — Ini Barang Saya"}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRejectClaim(claim.id)}
                              disabled={actionLoading === claim.id}
                              style={{ flex: 1 }}
                            >
                              {actionLoading === claim.id ? "⏳" : "❌ Tolak"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          );
        })()}

        {/* Feedback (hanya jika selesai) */}
        {report.status === "selesai" && (
          <FeedbackForm
            form={feedbackForm}
            onFormChange={setFeedbackForm}
            onSubmit={handleFeedback}
            done={feedbackDone}
            loading={feedbackLoading}
          />
        )}
      </div>
    </div>
  );
}