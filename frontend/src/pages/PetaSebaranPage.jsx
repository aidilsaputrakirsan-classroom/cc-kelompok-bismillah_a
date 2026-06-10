import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { fetchMapReports, fetchCategories, getUser } from "../services/api";
import ServiceUnavailableBanner, { isServiceError } from "../components/ServiceUnavailableBanner";

// ============================================================
// ITK CAMPUS CONFIG
// ============================================================

const ITK_CENTER = [-1.1497004212549657, 116.8626097222715];
const ITK_ZOOM = 17;
const ITK_MIN_ZOOM = 15;
const ITK_MAX_ZOOM = 19;

const ITK_BOUNDS = [
  [-1.1570, 116.8540],
  [-1.1410, 116.8720],
];

// ============================================================
// CATEGORY CONFIG
// ============================================================

const CATEGORY_CONFIG = {
  Kehilangan: { color: "#8b5cf6", icon: "🔍", bg: "#ede9fe" },
  Fasilitas: { color: "#3b82f6", icon: "🏗️", bg: "#dbeafe" },
  Perundungan: { color: "#ef4444", icon: "🛡️", bg: "#fee2e2" },
};

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "menunggu", label: "⏳ Menunggu" },
  { value: "diproses", label: "🔄 Diproses" },
  { value: "selesai", label: "✅ Selesai" },
  { value: "ditemukan", label: "🎉 Ditemukan" },
];

// ============================================================
// CUSTOM MARKER ICON
// ============================================================

function createCategoryIcon(kategoriNama) {
  const config = CATEGORY_CONFIG[kategoriNama] || { color: "#6b7280", icon: "📌" };

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="marker-pin" style="background: ${config.color};">
        <span class="marker-emoji">${config.icon}</span>
      </div>
      <div class="marker-pulse" style="background: ${config.color};"></div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -48],
  });
}

// ============================================================
// MAP BOUNDS ENFORCER
// ============================================================

function MapBoundsEnforcer() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(ITK_BOUNDS);
    map.options.maxBoundsViscosity = 1.0;
  }, [map]);
  return null;
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function PetaSebaranPage() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";

  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState("");

  // Load categories on mount — sekaligus tentukan ID kehilangan
  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      if (isAdmin) {
        setActiveCategories(new Set(cats.map((c) => c.nama_kategori)));
      } else {
        // User only sees Kehilangan
        setActiveCategories(new Set(["Kehilangan"]));
      }
    });
  }, [isAdmin]);

  // Load map reports
  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      // Tidak ada filter user_id — ambil semua laporan dari semua user
      // Filter kategori dilakukan client-side via activeCategories
      // Untuk user: backend mengembalikan semua laporan yg punya koordinat,
      // lalu activeCategories akan menyaring hanya "Kehilangan"
      const data = await fetchMapReports(params);
      setReports(data);
    } catch (err) {
      setError(err.message || "Gagal memuat data peta");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Filter reports by active categories (client-side)
  const filteredReports = useMemo(() => {
    return reports.filter((r) => activeCategories.has(r.kategori_nama));
  }, [reports, activeCategories]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    reports.forEach((r) => {
      counts[r.kategori_nama] = (counts[r.kategori_nama] || 0) + 1;
    });
    return counts;
  }, [reports]);

  // Toggle category filter (admin only)
  const toggleCategory = (catName) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
      } else {
        next.add(catName);
      }
      return next;
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Determine where to navigate on detail click
  const handleDetailClick = (report) => {
    if (isAdmin) {
      navigate(`/laporan/${report.id}`);
    } else {
      // User: if own report → detail laporan; else → detail kehilangan publik
      if (currentUser?.id === report.user_id) {
        navigate(`/laporan/${report.id}`);
      } else {
        navigate(`/kehilangan/${report.id}`);
      }
    }
  };

  // Visible categories for filter bar
  const visibleCategories = isAdmin
    ? categories
    : categories.filter((c) => c.nama_kategori === "Kehilangan");

  return (
    <div className="page">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.75rem" }}>
            🗺️ Peta Sebaran {isAdmin ? "Laporan" : "Kehilangan"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {isAdmin
              ? "Visualisasi semua laporan di area kampus ITK"
              : "Semua laporan kehilangan barang dari seluruh civitas kampus ITK"
            }
          </p>
          {!isAdmin && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              marginTop: "0.5rem", background: "#ede9fe", color: "#7c3aed",
              padding: "0.375rem 0.875rem", borderRadius: "var(--radius-full)",
              fontSize: "0.8rem", fontWeight: 600,
            }}>
              <span>ℹ️</span>
              <span>Klik marker untuk melihat detail &amp; melaporkan penemuan</span>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="card-flat peta-filter-bar" style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
          padding: "1rem 1.25rem",
        }}>
          {/* Category toggles (admin: all, user: only Kehilangan) */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {visibleCategories.map((cat) => {
              const config = CATEGORY_CONFIG[cat.nama_kategori] || { color: "#6b7280", icon: "📌", bg: "#f1f5f9" };
              const isActive = activeCategories.has(cat.nama_kategori);
              const count = categoryCounts[cat.nama_kategori] || 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => isAdmin ? toggleCategory(cat.nama_kategori) : null}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "var(--radius-full)",
                    border: `2px solid ${isActive ? config.color : "var(--border)"}`,
                    background: isActive ? config.bg : "transparent",
                    color: isActive ? config.color : "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    cursor: isAdmin ? "pointer" : "default",
                    fontFamily: "inherit",
                    transition: "var(--transition)",
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  <span>{config.icon}</span>
                  <span>{cat.nama_kategori}</span>
                  <span style={{
                    background: isActive ? config.color : "var(--text-muted)",
                    color: "white",
                    borderRadius: "var(--radius-full)",
                    padding: "0.1rem 0.5rem",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    minWidth: 20,
                    textAlign: "center",
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Separator */}
          <div className="peta-filter-separator" style={{ width: 1, height: 32, background: "var(--border)", flexShrink: 0 }} />

          {/* Status filter */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto", minWidth: 160, padding: "0.5rem 0.75rem", fontSize: "0.8125rem" }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Counter */}
          <div className="peta-filter-counter" style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
            📍 <strong style={{ color: "var(--text-primary)" }}>{filteredReports.length}</strong> laporan ditampilkan
          </div>
        </div>

        {/* Error */}
        {error && isServiceError(error) && (
          <ServiceUnavailableBanner onRetry={loadReports} message={error} compact />
        )}
        {error && !isServiceError(error) && (
          <div style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "0.875rem 1rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Map */}
        <div style={{ position: "relative", borderRadius: "var(--radius)", overflow: "hidden" }}>
          {loading && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(4px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "0.75rem",
            }}>
              <span className="spinner" />
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                Memuat peta sebaran...
              </span>
            </div>
          )}

          <div className="map-container peta-map-container" style={{ height: "calc(100vh - 260px)", minHeight: 450 }}>
            <MapContainer
              center={ITK_CENTER}
              zoom={ITK_ZOOM}
              minZoom={ITK_MIN_ZOOM}
              maxZoom={ITK_MAX_ZOOM}
              maxBounds={ITK_BOUNDS}
              maxBoundsViscosity={1.0}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapBoundsEnforcer />

              {/* Render markers */}
              {filteredReports.map((report) => (
                <Marker
                  key={report.id}
                  position={[report.latitude, report.longitude]}
                  icon={createCategoryIcon(report.kategori_nama)}
                >
                  <Popup className="custom-popup" maxWidth={280} minWidth={220}>
                    <div style={{ fontFamily: "'Inter', sans-serif" }}>
                      {/* Category badge */}
                      <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                        <span className={`badge badge-${report.kategori_nama.toLowerCase()}`}>
                          {(CATEGORY_CONFIG[report.kategori_nama]?.icon || "📌") + " " + report.kategori_nama}
                        </span>
                        <span className={`badge badge-${report.status}`}>
                          {report.status === "menunggu" ? "⏳" : report.status === "diproses" ? "🔄" : report.status === "ditemukan" ? "🎉" : "✅"}{" "}
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                        {/* Badge "Milik Anda" jika laporan sendiri */}
                        {!isAdmin && currentUser?.id === report.user_id && (
                          <span className="badge" style={{ background: "var(--primary)", color: "white" }}>Milik Anda</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        margin: "0 0 0.375rem",
                        color: "#0f172a",
                        lineHeight: 1.3,
                      }}>
                        {report.judul}
                      </h3>

                      {/* Location & Date */}
                      {report.lokasi && (
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          📍 {report.lokasi}
                        </div>
                      )}
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
                        🕐 {formatDate(report.tanggal_kejadian || report.created_at)}
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => handleDetailClick(report)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          background: "var(--primary, #2563eb)",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {!isAdmin && currentUser?.id !== report.user_id
                          ? "📦 Saya Menemukan Ini →"
                          : "Lihat Detail →"
                        }
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 999,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            boxShadow: "var(--shadow)",
            border: "1px solid var(--border)",
            fontSize: "0.75rem",
          }}>
            <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Legenda
            </div>
            {Object.entries(CATEGORY_CONFIG)
              .filter(([name]) => isAdmin || name === "Kehilangan")
              .map(([name, config]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: config.color,
                    flexShrink: 0,
                  }} />
                  <span style={{ color: "var(--text-secondary)" }}>
                    {name} ({categoryCounts[name] || 0})
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
