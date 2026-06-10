import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearToken, getUser } from "../services/api";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const hamburgerRef = useRef(null);

  const handleLogout = () => {
    setLogoutLoading(true);
    setDrawerOpen(false);
    setTimeout(() => {
      clearToken();
      navigate("/login");
    }, 900);
  };

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  const initials = user?.nama
    ? user.nama.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Close drawer on outside click (but not the hamburger itself)
  useEffect(() => {
    const handleClick = (e) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  return (
    <>
      {/* Logout Loading Overlay */}
      {logoutLoading && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(255,255,255,0.9)",
          zIndex: 9999,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "1rem", backdropFilter: "blur(4px)",
        }}>
          <span className="spinner" style={{ width: 48, height: 48, borderWidth: 4, borderTopColor: "var(--primary)" }} />
          <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)" }}>
            Sedang keluar...
          </span>
        </div>
      )}

      <nav className="navbar">
        <div className="navbar-inner">

          {/* ── LEFT: Brand ── */}
          <Link
            to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/"}
            className="navbar-brand"
          >
            <div className="navbar-logo">📋</div>
            {/* Hide brand text on very small screens to save space */}
            <span className="navbar-brand-text">LaporIn ITK</span>
          </Link>

          {/* ── CENTER: Desktop Nav Links ── */}
          {user && (
            <ul className="navbar-nav">
              {user.role === "admin" ? (
                <>
                  <li><Link to="/admin" className={isActive("/admin")}>Dashboard</Link></li>
                  <li><Link to="/admin/laporan" className={isActive("/admin/laporan")}>Kelola Laporan</Link></li>
                  <li><Link to="/admin/users" className={isActive("/admin/users")}>Kelola Pengguna</Link></li>
                  <li><Link to="/peta" className={isActive("/peta")}>🗺️ Peta</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/dashboard" className={isActive("/dashboard")}>Laporan Saya</Link></li>
                  <li><Link to="/laporan/buat" className={isActive("/laporan/buat")}>Buat Laporan</Link></li>
                  <li><Link to="/kehilangan" className={isActive("/kehilangan")}>Daftar Kehilangan</Link></li>
                  <li><Link to="/peta" className={isActive("/peta")}>🗺️ Peta</Link></li>
                </>
              )}
            </ul>
          )}

          {/* ── RIGHT: Actions ── */}
          <div className="navbar-right">

            {/* Desktop: user info + dark toggle + logout */}
            {user ? (
              <div className="navbar-desktop-actions">
                <div className="navbar-avatar" title={user.nama}>{initials}</div>
                <div className="navbar-user-name-block">
                  <span className="navbar-user-name">{user.nama?.split(" ")[0]}</span>
                  <span className="navbar-user-role">{user.role === "admin" ? "Admin" : "Pelapor"}</span>
                </div>
                <DarkModeToggle />
                <button className="btn btn-ghost btn-sm navbar-logout-btn" onClick={handleLogout} disabled={logoutLoading}>
                  {logoutLoading ? "Keluar..." : "Keluar"}
                </button>
              </div>
            ) : (
              <div className="navbar-desktop-actions">
                <DarkModeToggle />
                <Link to="/login" className="btn btn-ghost btn-sm navbar-guest-masuk">Masuk</Link>
                <Link to="/register" className="btn btn-primary btn-sm navbar-guest-daftar">Daftar</Link>
              </div>
            )}

            {/* Mobile: only dark toggle + hamburger */}
            <div className="navbar-mobile-actions">
              <DarkModeToggle />
              <button
                ref={hamburgerRef}
                className={`navbar-hamburger${drawerOpen ? " open" : ""}`}
                onClick={() => setDrawerOpen((v) => !v)}
                aria-label={drawerOpen ? "Tutup menu" : "Buka menu"}
                aria-expanded={drawerOpen}
              >
                <span />
                <span />
                <span />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        ref={drawerRef}
        className={`navbar-drawer${drawerOpen ? " open" : ""}`}
        role="dialog"
        aria-label="Menu navigasi"
      >
        {user ? (
          <>
            {/* User profile row */}
            <div className="navbar-drawer-user">
              <div className="navbar-avatar" style={{ width: 40, height: 40, fontSize: "1rem" }}>{initials}</div>
              <div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {user.nama}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  {user.role === "admin" ? "Admin" : "Pelapor"}
                </div>
              </div>
            </div>

            <div className="navbar-drawer-divider" />

            {/* Navigation links */}
            {user.role === "admin" ? (
              <>
                <Link to="/admin" className={isActive("/admin")}>📊 Dashboard</Link>
                <Link to="/admin/laporan" className={isActive("/admin/laporan")}>📋 Kelola Laporan</Link>
                <Link to="/admin/users" className={isActive("/admin/users")}>👥 Kelola Pengguna</Link>
                <Link to="/peta" className={isActive("/peta")}>🗺️ Peta Sebaran</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={isActive("/dashboard")}>📋 Laporan Saya</Link>
                <Link to="/laporan/buat" className={isActive("/laporan/buat")}>➕ Buat Laporan</Link>
                <Link to="/kehilangan" className={isActive("/kehilangan")}>🔍 Daftar Kehilangan</Link>
                <Link to="/peta" className={isActive("/peta")}>🗺️ Peta Sebaran</Link>
              </>
            )}

            <div className="navbar-drawer-divider" />

            {/* Logout */}
            <div className="navbar-drawer-actions">
              <button
                className="btn btn-danger"
                onClick={handleLogout}
                disabled={logoutLoading}
                style={{ flex: 1, justifyContent: "center" }}
              >
                {logoutLoading ? "⏳ Keluar..." : "🚪 Keluar"}
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">🔑 Masuk</Link>
            <Link to="/register">📝 Daftar Sekarang</Link>
          </>
        )}
      </div>
    </>
  );
}

// ── Dark Mode Toggle ──
function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("darkMode", String(next));
    document.body.classList.toggle("dark", next);
  };

  return (
    <button
      className="btn btn-ghost btn-sm dark-mode-toggle"
      onClick={toggle}
      title={isDark ? "Light Mode" : "Dark Mode"}
      aria-label={isDark ? "Aktifkan Light Mode" : "Aktifkan Dark Mode"}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}