/**
 * ServiceUnavailableBanner — Komponen peringatan service tidak tersedia
 *
 * Ditampilkan saat API Gateway mengembalikan error 502/503/504
 * atau saat tidak bisa terhubung ke server sama sekali.
 *
 * Penggunaan:
 *   {error && isServiceError(error) && <ServiceUnavailableBanner onRetry={load} />}
 */

/**
 * Deteksi apakah error adalah service unavailable (bukan error biasa seperti 404/400).
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
 * @param {Function} props.onRetry - fungsi yang dipanggil saat tombol "Coba Lagi" ditekan
 * @param {string} [props.message] - pesan kustom (opsional)
 */
export default function ServiceUnavailableBanner({ onRetry, message }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.banner}>
        <span style={styles.icon}>⚠️</span>
        <div style={styles.content}>
          <strong style={styles.title}>Layanan Sementara Tidak Tersedia</strong>
          <p style={styles.desc}>
            {message ||
              "Salah satu layanan backend sedang tidak aktif atau sedang dalam pemeliharaan. " +
              "Pastikan semua container Docker sudah berjalan, lalu coba lagi."}
          </p>
        </div>
        {onRetry && (
          <button onClick={onRetry} style={styles.btn}>
            🔄 Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "1rem 0",
  },
  banner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    background: "#fffbeb",
    border: "1.5px solid #f59e0b",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    flexWrap: "wrap",
  },
  icon: {
    fontSize: "1.5rem",
    lineHeight: 1,
    flexShrink: 0,
    marginTop: "2px",
  },
  content: {
    flex: 1,
    minWidth: 200,
  },
  title: {
    display: "block",
    fontSize: "0.9375rem",
    fontWeight: 700,
    color: "#92400e",
    marginBottom: "0.25rem",
  },
  desc: {
    fontSize: "0.875rem",
    color: "#78350f",
    margin: 0,
    lineHeight: 1.5,
  },
  btn: {
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
  },
};
