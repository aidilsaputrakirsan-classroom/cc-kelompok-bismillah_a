import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (onLogin) onLogin(data);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message || "Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left Side — Branding */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>📋</div>
          <h1 style={styles.brandName}>LaporIn ITK</h1>
          <p style={styles.brandTagline}>
            Sistem Pelaporan Institut Teknologi Kalimantan
          </p>
        </div>
        <div style={styles.features}>
          {[
            { icon: "🔒", text: "Anonim & Aman" },
            { icon: "📍", text: "Tracking Lokasi Real-time" },
            { icon: "⚡", text: "Respon Cepat dari Admin" },
            { icon: "📊", text: "Pantau Status Laporan Anda" },
          ].map((f) => (
            <div key={f.text} style={styles.feature}>
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side — Form */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={styles.formTitle}>Masuk ke Akun</h2>
            <p style={styles.formSub}>Belum punya akun?{" "}
              <Link to="/register" style={{ fontWeight: 600 }}>Daftar sekarang</Link>
            </p>
          </div>

          {error && (
            <div style={styles.alertError}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="user@student.itk.ac.id"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: "0.5rem" }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" style={{ borderTopColor: "white" }} />
                  Memproses...
                </>
              ) : "Masuk"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f8fafc", borderRadius: "8px", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            <strong>💡 Demo Admin:</strong> Buat akun lalu ubah role via database, atau gunakan akun yang sudah ada.
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    "@media (max-width: 768px)": { gridTemplateColumns: "1fr" },
  },
  left: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #7c3aed 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "4rem 3rem",
    color: "white",
    minHeight: "100vh",
  },
  brand: { marginBottom: "3rem" },
  logo: {
    width: 64, height: 64,
    background: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 32, marginBottom: "1rem",
    backdropFilter: "blur(10px)",
  },
  brandName: { fontSize: "2.5rem", fontWeight: 800, margin: 0 },
  brandTagline: { fontSize: "1rem", opacity: 0.8, marginTop: "0.5rem" },
  features: { display: "flex", flexDirection: "column", gap: "1rem" },
  feature: {
    display: "flex", alignItems: "center", gap: "0.875rem",
    background: "rgba(255,255,255,0.1)",
    padding: "0.75rem 1rem",
    borderRadius: 10,
    fontSize: "0.9375rem",
    backdropFilter: "blur(5px)",
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "#f8fafc",
  },
  formCard: {
    width: "100%",
    maxWidth: 440,
    background: "white",
    padding: "2.5rem",
    borderRadius: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
  },
  formTitle: { fontSize: "1.75rem", fontWeight: 800, margin: 0 },
  formSub: { color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" },
  alertError: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "0.875rem 1rem",
    borderRadius: 8,
    marginBottom: "1.5rem",
    fontSize: "0.875rem",
  },
};