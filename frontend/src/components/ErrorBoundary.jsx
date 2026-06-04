import React from "react";

/**
 * ErrorBoundary — Menangkap error React yang tidak ter-handle
 *
 * Menampilkan pesan user-friendly jika terjadi crash pada komponen.
 * Ini penting di production agar user tidak melihat blank screen
 * atau pesan error teknis yang membingungkan.
 *
 * Referensi: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state agar render fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error untuk debugging (bisa diganti dengan logging service di production)
    this.setState({ errorInfo });
    console.error("[ErrorBoundary] Terjadi error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            {/* Icon */}
            <div style={styles.iconWrapper}>
              <span style={styles.icon}>⚠️</span>
            </div>

            {/* Heading */}
            <h1 style={styles.title}>Oops! Terjadi Kesalahan</h1>

            {/* User-friendly message */}
            <p style={styles.message}>
              Maaf, terjadi kesalahan yang tidak terduga pada aplikasi.
              Silakan coba muat ulang halaman atau kembali ke beranda.
            </p>

            {/* Error detail (hanya tampil di development) */}
            {import.meta.env.DEV && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Detail Error (Development Only)</summary>
                <pre style={styles.pre}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Action buttons */}
            <div style={styles.actions}>
              <button onClick={this.handleReload} style={styles.btnPrimary}>
                🔄 Muat Ulang Halaman
              </button>
              <button onClick={this.handleGoHome} style={styles.btnSecondary}>
                🏠 Kembali ke Beranda
              </button>
            </div>

            {/* Help text */}
            <p style={styles.helpText}>
              Jika masalah terus berlanjut, hubungi administrator sistem.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================
// INLINE STYLES — agar ErrorBoundary tetap tampil meskipun
// CSS gagal dimuat (defense-in-depth)
// ============================================================
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)",
    padding: "2rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "3rem 2.5rem",
    maxWidth: "520px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    animation: "fadeIn 0.5s ease",
  },
  iconWrapper: {
    width: "80px",
    height: "80px",
    background: "#fef3c7",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
  },
  icon: {
    fontSize: "2.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "0.75rem",
  },
  message: {
    fontSize: "1rem",
    color: "#64748b",
    lineHeight: "1.6",
    marginBottom: "1.5rem",
  },
  details: {
    textAlign: "left",
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "1.5rem",
    border: "1px solid #e2e8f0",
  },
  summary: {
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.875rem",
    color: "#475569",
    marginBottom: "0.5rem",
  },
  pre: {
    fontSize: "0.75rem",
    color: "#ef4444",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: "200px",
    overflow: "auto",
    marginTop: "0.5rem",
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "1.5rem",
  },
  btnPrimary: {
    padding: "0.75rem 1.5rem",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  btnSecondary: {
    padding: "0.75rem 1.5rem",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  helpText: {
    fontSize: "0.8125rem",
    color: "#94a3b8",
  },
};

export default ErrorBoundary;
