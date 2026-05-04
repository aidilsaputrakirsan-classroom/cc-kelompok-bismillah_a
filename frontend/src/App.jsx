import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react"; // ✅ TAMBAH
import { getUser } from "./services/api";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BuatLaporanPage from "./pages/BuatLaporanPage";
import DetailLaporanPage from "./pages/DetailLaporanPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

// ============================================================
// ROUTE GUARDS (TETAP)
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
// APP
// ============================================================

export default function App() {
  // ✅ TAMBAH DARK MODE
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <RequireGuest><LoginPage /></RequireGuest>
        } />
        <Route path="/register" element={
          <RequireGuest><RegisterPage /></RequireGuest>
        } />

        {/* User */}
        <Route path="/dashboard" element={
          <RequireAuth>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> {/* ✅ */}
            <DashboardPage />
          </RequireAuth>
        } />

        <Route path="/laporan/buat" element={
          <RequireAuth>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> {/* ✅ */}
            <BuatLaporanPage />
          </RequireAuth>
        } />

        <Route path="/laporan/:id" element={
          <RequireAuth>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> {/* ✅ */}
            <DetailLaporanPage />
          </RequireAuth>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <RequireAdmin>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> {/* ✅ */}
            <AdminDashboardPage />
          </RequireAdmin>
        } />

        <Route path="/admin/laporan" element={
          <RequireAdmin>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> {/* ✅ */}
            <AdminDashboardPage />
          </RequireAdmin>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}