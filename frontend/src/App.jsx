import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./services/api";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BuatLaporanPage from "./pages/BuatLaporanPage";
import DetailLaporanPage from "./pages/DetailLaporanPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

// ============================================================
// ROUTE GUARDS
// ============================================================

function RequireAuth({ children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function RequireGuest({ children }) {
  const user = getUser();
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
}

// ============================================================
// LANDING PAGE (inline — simple redirect to login)
// ============================================================

function LandingPage() {
  const user = getUser();
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a, #2563eb, #7c3aed)" }}>
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "100vh", color: "white", textAlign: "center",
        padding: "2rem",
      }}>
        <div style={{
          width: 80, height: 80,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40, marginBottom: "1.5rem",
          backdropFilter: "blur(10px)",
        }}>📋</div>

        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, margin: "0 0 1rem" }}>
          LaporIn ITK
        </h1>
        <p style={{ fontSize: "1.25rem", opacity: 0.85, marginBottom: "3rem", maxWidth: 560 }}>
          Platform pelaporan digital untuk civitas Institut Teknologi Kalimantan —
          aman, transparan, dan efisien.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "4rem" }}>
          {[
            { icon: "🔍", label: "Kehilangan Barang" },
            { icon: "🏗️", label: "Kerusakan Fasilitas" },
            { icon: "🛡️", label: "Perundungan" },
          ].map((f) => (
            <div key={f.label} style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              padding: "1rem 1.5rem",
              borderRadius: 12,
              fontSize: "1rem",
              display: "flex", alignItems: "center", gap: "0.75rem",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <span style={{ fontSize: "1.5rem" }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <a
            href="/login"
            style={{
              padding: "0.875rem 2.5rem",
              background: "white",
              color: "#2563eb",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              transition: "transform 0.2s",
            }}
          >
            Masuk
          </a>
          <a
            href="/register"
            style={{
              padding: "0.875rem 2.5rem",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              border: "2px solid rgba(255,255,255,0.4)",
            }}
          >
            Daftar Sekarang
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP
// ============================================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — Guest only */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <RequireGuest><LoginPage /></RequireGuest>
        } />
        <Route path="/register" element={
          <RequireGuest><RegisterPage /></RequireGuest>
        } />

        {/* Protected — User */}
        <Route path="/dashboard" element={
          <RequireAuth>
            <Navbar />
            <DashboardPage />
          </RequireAuth>
        } />
        <Route path="/laporan/buat" element={
          <RequireAuth>
            <Navbar />
            <BuatLaporanPage />
          </RequireAuth>
        } />
        <Route path="/laporan/:id" element={
          <RequireAuth>
            <Navbar />
            <DetailLaporanPage />
          </RequireAuth>
        } />

        {/* Protected — Admin */}
        <Route path="/admin" element={
          <RequireAdmin>
            <Navbar />
            <AdminDashboardPage />
          </RequireAdmin>
        } />
        <Route path="/admin/laporan" element={
          <RequireAdmin>
            <Navbar />
            <AdminDashboardPage />
          </RequireAdmin>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}