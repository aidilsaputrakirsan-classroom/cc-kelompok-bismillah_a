/**
 * LoadingSpinner — Komponen loading reusable
 * Digunakan di seluruh halaman untuk menampilkan loading state
 */

/**
 * Full-page loading spinner overlay
 */
export function PageLoading() {
  return (
    <div className="page loading-overlay">
      <div className="spinner" />
    </div>
  );
}

/**
 * Inline loading spinner (dalam card/section)
 */
export function InlineLoading() {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
    </div>
  );
}

/**
 * Button loading content — spinner kecil + teks
 * @param {string} text - Teks yang ditampilkan saat loading
 */
export function ButtonLoading({ text = "Memproses..." }) {
  return (
    <>
      <span className="spinner spinner-sm" style={{ borderTopColor: "white" }} />
      {text}
    </>
  );
}

export default { PageLoading, InlineLoading, ButtonLoading };
