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
    <div className="auth-page">
      {/* Left Side — Branding */}
      <div
        className="auth-left"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #7c3aed 100%)" }}
      >
        <div className="auth-brand" style={{ marginBottom: "3rem" }}>
          <div style={{
            width: 64, height: 64,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, marginBottom: "1rem",
            backdropFilter: "blur(10px)",
          }}>📋</div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0 }}>LaporIn ITK</h1>
          <p style={{ fontSize: "1rem", opacity: 0.8, marginTop: "0.5rem" }}>
            Sistem Pelaporan Institut Teknologi Kalimantan
          </p>
        </div>

        <div className="auth-features" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { icon: "🔒", text: "Anonim & Aman" },
            { icon: "📍", text: "Tracking Lokasi Real-time" },
            { icon: "⚡", text: "Respon Cepat dari Admin" },
            { icon: "📊", text: "Pantau Status Laporan Anda" },
          ].map((f) => (
            <div key={f.text} style={{
              display: "flex", alignItems: "center", gap: "0.875rem",
              background: "rgba(255,255,255,0.1)",
              padding: "0.75rem 1rem",
              borderRadius: 10,
              fontSize: "0.9375rem",
              backdropFilter: "blur(5px)",
            }}>
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>Masuk ke Akun</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
              Belum punya akun?{" "}
              <Link to="/register" style={{ fontWeight: 600 }}>Daftar sekarang</Link>
            </p>
          </div>

          {error && (
            <div className="laporan-alert-error">
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

          <div className="login-demo-hint">
            <strong>💡 Demo Admin:</strong> Buat akun lalu ubah role via database, atau gunakan akun yang sudah ada.
          </div>
        </div>
      </div>
    </div>
  );
}