/**
 * ServiceUnavailableBanner — Komponen peringatan service tidak tersedia
 *
 * Ditampilkan saat API Gateway mengembalikan error 502/503/504
 * atau saat tidak bisa terhubung ke server sama sekali.
 *
 * Exports:
 *  - default ServiceUnavailableBanner — banner inline di dalam halaman
 *  - isServiceError()                 — helper deteksi service error
 *  - AuthDownBanner                   — banner tipis di atas app saat auth down
 */

import { useState } from "react";

// ============================================================
// HELPERS
// ============================================================

/**
 * Deteksi apakah error adalah service unavailable.
 * @param {string} errorMessage
 * @returns {boolean}
 */
export function isServiceError(errorMessage) {
  if (!errorMessage) return false;
  return (
    errorMessage.includes("Layanan sementara tidak tersedia") ||
    errorMessage.includes("Tidak dapat terhubung ke server") ||
    errorMessage.includes("502") ||
    errorMessage.includes("503") ||
    errorMessage.includes("504")
  );
}

// ============================================================
// INLINE BANNER (default export)
// Tampil di dalam halaman saat data gagal dimuat
// ============================================================

/**
 * @param {Object}   props
 * @param {Function} props.onRetry   - callback saat "Coba Lagi" diklik
 * @param {string}   [props.message] - pesan error dari api.js
 * @param {boolean}  [props.compact] - varian kecil (satu baris)
 */
export default function ServiceUnavailableBanner({ onRetry, message, compact = false }) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setRetrying(false), 800);
    }
  };

  if (compact) {
    return (
      <div style={s.compactWrap}>
        <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: "0.875rem", color: "#92400e" }}>
            Layanan Sementara Tidak Tersedia
          </strong>
          <p style={s.compactDesc}>
            {message || "Backend tidak dapat dihubungi. Pastikan semua container Docker berjalan."}
          </p>
        </div>
        {onRetry && (
          <button
            id="service-retry-btn"
            onClick={handleRetry}
            disabled={retrying}
            style={{ ...s.retryBtn, ...(retrying ? s.retryBtnDisabled : {}) }}
          >
            {retrying ? "⏳ Mencoba..." : "🔄 Coba Lagi"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={s.outerWrap}>
      <div style={s.card}>
        <div style={s.iconCircle}>
          <span style={{ fontSize: "2rem" }}>🔌</span>
        </div>
        <h3 style={s.title}>Layanan Sementara Tidak Tersedia</h3>
        <p style={s.desc}>
          {message ||
            "Salah satu layanan backend sedang tidak aktif atau sedang dalam pemeliharaan. " +
            "Pastikan semua container Docker sudah berjalan, lalu coba lagi."}
        </p>
        <div style={s.chipRow}>
          {["502 Bad Gateway", "503 Unavailable", "504 Timeout", "Network Error"].map((chip) => (
            <span key={chip} style={s.chip}>{chip}</span>
          ))}
        </div>
        {onRetry && (
          <button
            id="service-retry-btn"
            onClick={handleRetry}
            disabled={retrying}
            style={{ ...s.retryBtnLarge, ...(retrying ? s.retryBtnDisabled : {}) }}
          >
            {retrying ? "⏳ Mencoba kembali…" : "🔄 Coba Lagi"}
          </button>
        )}
        <p style={s.hint}>
          Jika masalah berlanjut, periksa log container dengan{" "}
          <code style={s.code}>docker compose logs</code>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// AUTH DOWN BANNER (named export)
// Banner tipis di atas aplikasi saat auth service terdeteksi down
// ============================================================

/**
 * @param {Object}   props
 * @param {Function} [props.onDismiss] - callback saat banner ditutup
 */
export function AuthDownBanner({ onDismiss }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div id="auth-down-banner" style={s.authBannerWrap} role="alert" aria-live="polite">
      <div style={s.authBannerInner}>
        <span style={s.pulseDotWrap}>
          <span style={s.pulseDot} />
          <span style={s.pulseRing} />
        </span>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: "0.875rem", color: "#7c2d12" }}>
            ⚠️ Some features temporarily unavailable
          </strong>
          <p style={s.authDesc}>
            Layanan autentikasi sedang tidak aktif. Login, register, dan fitur yang memerlukan
            autentikasi mungkin tidak berfungsi sementara.
          </p>
        </div>
        <button
          id="auth-banner-dismiss-btn"
          onClick={handleDismiss}
          title="Tutup notifikasi"
          style={s.dismissBtn}
          aria-label="Tutup notifikasi"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const s = {
  compactWrap: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    border: "1px solid #fde68a",
    borderLeft: "4px solid #f59e0b",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    marginBottom: "1rem",
  },
  compactDesc: {
    fontSize: "0.8125rem",
    color: "#78350f",
    margin: "0.25rem 0 0",
    lineHeight: 1.5,
  },
  outerWrap: { padding: "1rem 0" },
  card: {
    background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    border: "1px solid #fde68a",
    borderRadius: "16px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(245,158,11,0.12)",
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: "50%",
    background: "rgba(245,158,11,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 1.25rem",
    border: "2px solid rgba(245,158,11,0.3)",
  },
  title: { fontSize: "1.125rem", fontWeight: 700, color: "#92400e", margin: "0 0 0.75rem" },
  desc: {
    fontSize: "0.875rem", color: "#78350f", lineHeight: 1.6,
    margin: "0 0 1.25rem", maxWidth: 480, marginLeft: "auto", marginRight: "auto",
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "1.5rem" },
  chip: {
    fontSize: "0.75rem", fontWeight: 600,
    padding: "0.2rem 0.6rem", borderRadius: "999px",
    background: "rgba(245,158,11,0.2)", color: "#92400e",
    border: "1px solid rgba(245,158,11,0.4)",
  },
  retryBtn: {
    padding: "0.5rem 1.25rem",
    background: "#f59e0b", color: "white",
    border: "none", borderRadius: "8px",
    fontWeight: 700, fontSize: "0.875rem",
    cursor: "pointer", fontFamily: "inherit",
    whiteSpace: "nowrap", alignSelf: "center", flexShrink: 0,
    transition: "opacity 0.2s",
  },
  retryBtnLarge: {
    display: "inline-flex", alignItems: "center", gap: "0.5rem",
    padding: "0.75rem 2rem",
    background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white",
    border: "none", borderRadius: "10px",
    fontWeight: 700, fontSize: "0.9375rem",
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(245,158,11,0.35)",
    transition: "all 0.2s", marginBottom: "1rem",
  },
  retryBtnDisabled: { opacity: 0.65, cursor: "not-allowed", boxShadow: "none" },
  hint: { fontSize: "0.8rem", color: "#a16207", margin: 0 },
  code: {
    background: "rgba(0,0,0,0.07)", padding: "0.1em 0.4em",
    borderRadius: 4, fontFamily: "monospace", fontSize: "0.85em",
  },
  authBannerWrap: {
    background: "linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%)",
    borderBottom: "2px solid #fed7aa",
    position: "relative", zIndex: 999,
  },
  authBannerInner: {
    maxWidth: 1200, margin: "0 auto",
    padding: "0.75rem 1.5rem",
    display: "flex", alignItems: "flex-start", gap: "0.875rem",
  },
  authDesc: { fontSize: "0.8125rem", color: "#9a3412", margin: "0.2rem 0 0", lineHeight: 1.5 },
  pulseDotWrap: {
    position: "relative", display: "flex",
    alignItems: "center", justifyContent: "center",
    width: 20, height: 20, flexShrink: 0, marginTop: 2,
  },
  pulseDot: {
    width: 10, height: 10, borderRadius: "50%",
    background: "#f97316", display: "block",
    position: "relative", zIndex: 1,
  },
  pulseRing: {
    position: "absolute", width: 20, height: 20,
    borderRadius: "50%", border: "2px solid #f97316",
    animation: "pulse 1.5s ease-out infinite", opacity: 0.6,
  },
  dismissBtn: {
    background: "none", border: "1px solid #fed7aa",
    borderRadius: "6px", color: "#9a3412",
    cursor: "pointer", fontSize: "0.75rem",
    fontWeight: 700, padding: "0.25rem 0.5rem",
    flexShrink: 0, alignSelf: "flex-start",
    fontFamily: "inherit", marginTop: 2,
  },
};
