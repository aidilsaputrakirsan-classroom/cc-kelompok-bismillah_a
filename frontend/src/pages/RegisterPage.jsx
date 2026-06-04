import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, login } from "../services/api";
import { ButtonLoading } from "../components/LoadingSpinner";

export default function RegisterPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: "", email: "", password: "", no_hp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      const data = await login(form.email, form.password);
      if (onLogin) onLogin(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registrasi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left */}
      <div
        className="auth-left"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)" }}
      >
        <div className="auth-brand" style={{ marginBottom: "3rem" }}>
          <div style={{
            width: 64, height: 64,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, marginBottom: "1rem",
          }}>📋</div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0 }}>LaporIn ITK</h1>
          <p style={{ fontSize: "1rem", opacity: 0.8, marginTop: "0.5rem" }}>
            Buat laporan dengan mudah, aman, dan terpantau
          </p>
        </div>

        <div className="auth-steps" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { num: "1", text: "Daftar akun dengan email kampus" },
            { num: "2", text: "Buat laporan dengan detail lokasi" },
            { num: "3", text: "Pantau status laporan Anda" },
            { num: "4", text: "Berikan feedback setelah selesai" },
          ].map((s) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9375rem" }}>
              <div style={{
                width: 32, height: 32,
                background: "rgba(255,255,255,0.25)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "0.875rem", flexShrink: 0,
              }}>{s.num}</div>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>Buat Akun</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
              Sudah punya akun?{" "}
              <Link to="/login" style={{ fontWeight: 600 }}>Masuk di sini</Link>
            </p>
          </div>

          {error && (
            <div className="laporan-alert-error">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap <span className="required">*</span></label>
              <input
                className="form-input"
                placeholder="Masukkan nama lengkap"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required minLength={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <input
                type="email"
                className="form-input"
                placeholder="user@student.itk.ac.id"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 8 karakter, huruf besar, kecil, angka, simbol"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required minLength={8}
              />
              <p className="form-hint">Contoh: Cloud@123</p>
            </div>

            <div className="form-group">
              <label className="form-label">No. HP (opsional)</label>
              <input
                className="form-input"
                placeholder="08xxxxxxxxxx"
                value={form.no_hp}
                onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? <ButtonLoading text="Memproses..." /> : "Daftar Sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}