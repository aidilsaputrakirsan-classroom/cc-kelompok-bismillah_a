/**
 * Modal — Komponen modal/overlay reusable
 * Digunakan sebagai wrapper untuk semua modal di aplikasi
 */

export default function Modal({ open, onClose, maxWidth = 560, children, style = {} }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{ maxWidth, width: "100%", ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
