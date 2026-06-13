import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  getPublicReport, getUser, claimFoundReport,
  confirmFoundClaim, rejectFoundClaim, markReportFound,
} from "../services/api";
import { PageLoading } from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_CONFIG = {
  menunggu: { label: "Menunggu", icon: "⏳", color: "#f59e0b", bg: "#fffbeb" },
  diproses: { label: "Diproses", icon: "🔄", color: "#3b82f6", bg: "#eff6ff" },
  selesai: { label: "Selesai", icon: "✅", color: "#10b981", bg: "#f0fdf4" },
  ditemukan: { label: "Ditemukan", icon: "🎉", color: "#8b5cf6", bg: "#f5f3ff" },
};

const CLAIM_STATUS = {
  pending: { label: "Menunggu Konfirmasi", color: "#f59e0b", bg: "#fffbeb" },
  accepted: { label: "Diterima", color: "#10b981", bg: "#f0fdf4" },
  rejected: { label: "Ditolak", color: "#ef4444", bg: "#fef2f2" },
};

const BASE_URL = import.meta.env.VITE_API_URL || "";

export default function DetailKehilanganPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prevClaimCount, setPrevClaimCount] = useState(0);
  const [newClaimAlert, setNewClaimAlert] = useState(false);

  // Claim form
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimDesc, setClaimDesc] = useState("");
  const [claimFile, setClaimFile] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimPreview, setClaimPreview] = useState(null);

  // Mark found
  const [markFoundLoading, setMarkFoundLoading] = useState(false);

  // Confirm/reject
  const [actionLoading, setActionLoading] = useState(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getPublicReport(Number(id));
      // Deteksi klaim baru untuk pemilik laporan
      if (silent && data) {
        const newCount = (data.found_claims || []).length;
        if (newCount > prevClaimCount && prevClaimCount > 0) {
          setNewClaimAlert(true);
          setTimeout(() => setNewClaimAlert(false), 8000);
        }
        setPrevClaimCount(newCount);
      } else if (data) {
        setPrevClaimCount((data.found_claims || []).length);
      }
      setReport(data);
    } catch (err) {
      console.error(err);
      if (!silent) setReport(null);
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // Auto-polling setiap 30 detik agar pemilik bisa lihat klaim baru tanpa refresh manual
  useEffect(() => {
    const interval = setInterval(() => load(true), 30000);
    return () => clearInterval(interval);
  }, [id, prevClaimCount]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClaimFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setClaimPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setClaimFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setClaimPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimFile) return alert("Harap upload foto bukti.");
    if (claimDesc.trim().length < 5) return alert("Deskripsi minimal 5 karakter.");
    setClaimLoading(true);
    try {
      await claimFoundReport(Number(id), claimDesc.trim(), claimFile);
      alert("Klaim berhasil dikirim! Menunggu konfirmasi dari pemilik barang.");
      setShowClaimForm(false);
      setClaimDesc("");
      setClaimFile(null);
      setClaimPreview(null);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleMarkFound = async () => {
    if (!confirm("Tandai barang ini sudah ditemukan?")) return;
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
      alert("Klaim dikonfirmasi! Barang sudah ditemukan.");
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClaim = async (claimId) => {
    if (!confirm("Tolak klaim ini?")) return;
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
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) return <PageLoading />;
  if (!report) return (
    <div className="page">
      <EmptyState
        icon="❌"
        title="Laporan Tidak Ditemukan"
        description="Laporan kehilangan tidak ditemukan atau bukan kategori kehilangan."
        action={<button className="btn btn-primary" onClick={() => navigate("/kehilangan")}>Kembali ke Daftar</button>}
      />
    </div>
  );

  const isOwner = Number(currentUser?.id) === Number(report.pelapor_id);
  const hasMap = report.latitude && report.longitude;
  const sc = STATUS_CONFIG[report.status] || STATUS_CONFIG.menunggu;
  const canClaim = !isOwner && report.status !== "ditemukan" && report.status !== "selesai";
  const canMarkFound = isOwner && report.status !== "ditemukan" && report.status !== "selesai";
  const pendingClaims = (report.found_claims || []).filter((c) => c.status === "pending");
  const allClaims = report.found_claims || [];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900, padding: "2rem 1.5rem" }}>

        {/* New claim alert banner */}
        {newClaimAlert && isOwner && (
          <div style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white",
            borderRadius: 14,
            padding: "1rem 1.5rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            animation: "pulse 1s ease-in-out",
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
          }}>
            <span style={{ fontSize: "1.75rem" }}>🔔</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Ada Klaim Penemuan Baru!</div>
              <div style={{ fontSize: "0.8125rem", opacity: 0.9 }}>Seseorang baru saja mengklaim menemukan barang Anda. Scroll ke bawah untuk melihat.</div>
            </div>
          </div>
        )}

        {/* Back + Refresh row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            ← Kembali
          </button>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="btn btn-ghost btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem" }}
          >
            <span style={{ display: "inline-block", animation: refreshing ? "spin 1s linear infinite" : "none" }}>🔄</span>
            {refreshing ? "Memperbarui..." : "Perbarui"}
          </button>
        </div>

        {/* Header Card */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <span className="badge badge-kehilangan">🔍 Kehilangan</span>
              <span className="badge" style={{ background: sc.bg, color: sc.color }}>{sc.icon} {sc.label}</span>
              {isOwner && <span className="badge" style={{ background: "var(--primary)", color: "white" }}>Milik Anda</span>}
              {isOwner && pendingClaims.length > 0 && (
                <span className="badge" style={{
                  background: "#dc2626", color: "white",
                  animation: "pulse 2s ease-in-out infinite",
                  fontWeight: 700,
                }}>
                  🔔 {pendingClaims.length} Klaim Menunggu!
                </span>
              )}
            </div>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              #{report.id} · {formatDate(report.created_at)}
            </span>
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>{report.judul}</h1>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>{report.deskripsi}</p>

          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {report.lokasi && <span>📍 {report.lokasi}</span>}
            {report.tanggal_kejadian && <span>📅 {report.tanggal_kejadian}</span>}
            <span>👤 Pelapor: <strong style={{ color: "var(--text-primary)" }}>{report.pelapor_nama || "Pengguna"}</strong></span>
          </div>
        </div>

        {/* Banner: ada klaim pending menunggu konfirmasi (hanya untuk pemilik) */}
        {isOwner && pendingClaims.length > 0 && (
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
                Scroll ke bawah untuk melihat bukti dan konfirmasi atau tolak klaim.
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        {hasMap && (
          <div className="card-flat" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
              📍 Lokasi Kehilangan
            </h3>
            <div className="map-container map-container-detail" style={{ height: 300 }}>
              <MapContainer center={[report.latitude, report.longitude]} zoom={16} style={{ height: "100%", width: "100%" }}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[report.latitude, report.longitude]}>
                  <Popup><strong>Lokasi Kehilangan</strong><br />{report.lokasi}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          {/* Owner: Mark as found */}
          {canMarkFound && (
            <button
              className="btn btn-primary"
              onClick={handleMarkFound}
              disabled={markFoundLoading}
              style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", marginBottom: pendingClaims.length > 0 ? "1rem" : 0 }}
            >
              {markFoundLoading ? "⏳ Memproses..." : "🎉 Tandai Sudah Ditemukan Sendiri"}
            </button>
          )}

          {/* Other user: Claim found */}
          {canClaim && !showClaimForm && (
            <button
              className="btn btn-success"
              onClick={() => setShowClaimForm(true)}
              style={{ width: "100%", padding: "0.875rem", fontSize: "1rem" }}
            >
              📦 Saya Menemukan Barang Ini
            </button>
          )}

          {/* Claim Form */}
          {showClaimForm && (
            <form onSubmit={handleClaimSubmit} style={{ marginTop: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
                📦 Kirim Bukti Penemuan Barang
              </h3>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.375rem", display: "block" }}>
                  Deskripsi <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Jelaskan di mana dan bagaimana Anda menemukan barang ini..."
                  value={claimDesc}
                  onChange={(e) => setClaimDesc(e.target.value)}
                  required
                  minLength={5}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>
                  Foto Bukti <span style={{ color: "#ef4444" }}>*</span>
                </label>

                {/* Custom drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("bukti-upload-input").click()}
                  style={{
                    border: `2px dashed ${claimPreview ? "#8b5cf6" : "var(--border)"}`,
                    borderRadius: 12,
                    padding: claimPreview ? "0.75rem" : "2rem 1rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: claimPreview ? "#faf5ff" : "var(--input-bg, #f8fafc)",
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {claimPreview ? (
                    // Preview mode
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img
                        src={claimPreview}
                        alt="Preview bukti"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 200,
                          borderRadius: 8,
                          objectFit: "cover",
                          display: "block",
                          margin: "0 auto",
                        }}
                      />
                      <div style={{
                        marginTop: "0.625rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        fontSize: "0.8125rem",
                        color: "#7c3aed",
                        fontWeight: 600,
                      }}>
                        <span>✅</span>
                        <span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {claimFile?.name}
                        </span>
                        <span style={{
                          fontSize: "0.6875rem",
                          color: "#94a3b8",
                          fontWeight: 400,
                          background: "#f1f5f9",
                          padding: "0.1rem 0.4rem",
                          borderRadius: 4,
                        }}>
                          {claimFile ? (claimFile.size / 1024).toFixed(0) + " KB" : ""}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                        Klik untuk ganti foto
                      </div>
                    </div>
                  ) : (
                    // Empty state
                    <>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.625rem", lineHeight: 1 }}>📸</div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                        Drag & drop foto di sini
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                        atau klik untuk pilih dari perangkat
                      </div>
                      <div style={{
                        display: "inline-block",
                        padding: "0.4rem 1rem",
                        background: "var(--primary, #2563eb)",
                        color: "white",
                        borderRadius: 6,
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                      }}>
                        📂 Pilih Foto
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#cbd5e1", marginTop: "0.625rem" }}>
                        JPG, PNG, WebP · Maks. 10 MB
                      </div>
                    </>
                  )}
                </div>

                {/* Hidden native input */}
                <input
                  id="bukti-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  required
                  style={{ display: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" disabled={claimLoading} style={{ flex: 1 }}>
                  {claimLoading ? "⏳ Mengirim..." : "📤 Kirim Bukti"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowClaimForm(false); setClaimPreview(null); }}>
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* Status ditemukan message */}
          {report.status === "ditemukan" && (
            <div style={{
              background: "#f5f3ff", border: "2px solid #8b5cf6",
              borderRadius: 12, padding: "1.25rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎉</div>
              <h3 style={{ fontWeight: 700, color: "#7c3aed", marginBottom: "0.25rem" }}>Barang Sudah Ditemukan!</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Barang ini sudah dikonfirmasi ditemukan.</p>
            </div>
          )}
        </div>

        {/* Found Claims Section */}
        {allClaims.length > 0 && (
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
              📋 Klaim Penemuan ({allClaims.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {allClaims.map((claim) => {
                const cs = CLAIM_STATUS[claim.status] || CLAIM_STATUS.pending;
                return (
                  <div key={claim.id} style={{
                    background: "var(--card-bg, #f8fafc)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: "1rem",
                    opacity: claim.status === "rejected" ? 0.6 : 1,
                  }}>
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

                    <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                      {claim.deskripsi}
                    </p>

                    {claim.bukti_url && (
                      <div style={{ marginBottom: "0.5rem" }}>
                        <img
                          src={`${BASE_URL}${claim.bukti_url}`}
                          alt="Bukti penemuan"
                          style={{
                            maxWidth: "100%", maxHeight: 200, borderRadius: 8,
                            objectFit: "cover", border: "1px solid var(--border)",
                            cursor: "pointer",
                          }}
                          onClick={() => window.open(`${BASE_URL}${claim.bukti_url}`, "_blank")}
                        />
                      </div>
                    )}

                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                      🕐 {formatDate(claim.created_at)}
                    </div>

                    {/* Owner actions: confirm / reject */}
                    {isOwner && claim.status === "pending" && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleConfirmClaim(claim.id)}
                          disabled={actionLoading === claim.id}
                          style={{ flex: 1 }}
                        >
                          {actionLoading === claim.id ? "⏳" : "✅ Konfirmasi"}
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
        )}
      </div>
    </div>
  );
}
