/**
 * ServiceUnavailableBanner — Komponen peringatan service tidak tersedia
 *
 * Ditampilkan saat API Gateway mengembalikan error 502/503/504
 * atau saat tidak bisa terhubung ke server sama sekali.
 */

/**
 * Deteksi apakah error adalah service unavailable.
 * @param {string} errorMessage - pesan error dari api.js
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

/**
 * Banner peringatan dengan tombol retry.
 * @param {Object} props
 * @param {Function} props.onRetry - fungsi saat "Coba Lagi" ditekan
 * @param {string} [props.message] - pesan kustom (opsional)
 */
export default function ServiceUnavailableBanner({ onRetry, message }) {
  return (
    <div style={{ padding: "1rem 0" }}>
      <div className="service-banner">
        <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0, marginTop: "2px" }}>⚠️</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <strong className="service-banner-title">Layanan Sementara Tidak Tersedia</strong>
          <p className="service-banner-desc">
            {message ||
              "Salah satu layanan backend sedang tidak aktif atau sedang dalam pemeliharaan. " +
              "Pastikan semua container Docker sudah berjalan, lalu coba lagi."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: "0.5rem 1rem",
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              alignSelf: "center",
              flexShrink: 0,
            }}
          >
            🔄 Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}
