/**
 * Modal — Komponen modal/overlay reusable
 * Digunakan sebagai wrapper untuk semua modal di aplikasi
 */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "1rem",
};

const modalStyle = {
  background: "white",
  borderRadius: "var(--radius-lg)",
  padding: "2rem",
  width: "100%",
  boxShadow: "var(--shadow-xl)",
  maxHeight: "90vh",
  overflowY: "auto",
};

/**
 * @param {boolean} open - Apakah modal ditampilkan
 * @param {function} onClose - Handler saat overlay diklik (tutup modal)
 * @param {number} maxWidth - Lebar maksimum modal (default 560)
 * @param {React.ReactNode} children - Konten modal
 */
export default function Modal({ open, onClose, maxWidth = 560, children, style = {} }) {
  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={{ ...modalStyle, maxWidth, ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
