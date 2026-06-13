import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearToken, getUser, fetchNotifications, markNotificationRead } from "../services/api";

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
                  <li><Link to="/status" className={isActive("/status")}>📊 Status</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/dashboard" className={isActive("/dashboard")}>Laporan Saya</Link></li>
                  <li><Link to="/laporan/buat" className={isActive("/laporan/buat")}>Buat Laporan</Link></li>
                  <li><Link to="/kehilangan" className={isActive("/kehilangan")}>Daftar Kehilangan</Link></li>
                  <li><Link to="/peta" className={isActive("/peta")}>🗺️ Peta</Link></li>
                  <li><Link to="/status" className={isActive("/status")}>📊 Status</Link></li>
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
                <NotificationBell />
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
              {user && <NotificationBell />}
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
                <Link to="/status" className={isActive("/status")}>📡 System Status</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={isActive("/dashboard")}>📋 Laporan Saya</Link>
                <Link to="/laporan/buat" className={isActive("/laporan/buat")}>➕ Buat Laporan</Link>
                <Link to="/kehilangan" className={isActive("/kehilangan")}>🔍 Daftar Kehilangan</Link>
                <Link to="/peta" className={isActive("/peta")}>🗺️ Peta Sebaran</Link>
                <Link to="/status" className={isActive("/status")}>📡 System Status</Link>
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

// ── Notification Bell ──
function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  const unreadCount = items.filter((n) => n.status_baca === "unread").length;

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications(false);
      if (Array.isArray(data)) setItems(data);
    } catch {
      // Silent — jangan ganggu navbar bila notifikasi gagal dimuat
    }
  }, []);

  // Fetch saat mount + polling tiap 30 detik
  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Tutup panel saat klik di luar
  useEffect(() => {
    const handleClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await load();
      setLoading(false);
    }
  };

  const handleItemClick = async (notif) => {
    if (notif.status_baca === "unread") {
      try {
        await markNotificationRead(notif.id);
        setItems((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, status_baca: "read" } : n))
        );
      } catch {
        // Abaikan kegagalan mark-read; tetap navigasi
      }
    }
    setOpen(false);
    // Notifikasi terkait klaim penemuan → arahkan ke daftar laporan user
    if (/klaim|menemukan|ditemukan/i.test(notif.pesan || "")) {
      navigate("/dashboard");
    }
  };

  const formatTime = (dt) => {
    if (!dt) return "";
    const d = new Date(dt);
    return d.toLocaleString("id-ID", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        className="btn btn-ghost btn-sm"
        onClick={toggle}
        title="Notifikasi"
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
        aria-expanded={open}
        style={{ position: "relative", padding: "0.4rem 0.55rem", fontSize: "1.1rem", lineHeight: 1 }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute", top: -2, right: -2,
              minWidth: 18, height: 18, padding: "0 4px",
              background: "#ef4444", color: "white",
              borderRadius: 9, fontSize: "0.65rem", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 2px var(--bg, #fff)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Daftar notifikasi"
          style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            width: 340, maxWidth: "90vw", maxHeight: 420, overflowY: "auto",
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          <div style={{
            padding: "0.875rem 1rem", borderBottom: "1px solid var(--border, #e5e7eb)",
            fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)",
            position: "sticky", top: 0, background: "var(--card-bg, #fff)",
          }}>
            🔔 Notifikasi {unreadCount > 0 && `(${unreadCount} baru)`}
          </div>

          {loading && items.length === 0 ? (
            <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Memuat...
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Belum ada notifikasi.
            </div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleItemClick(n)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "0.75rem 1rem", border: "none",
                  borderBottom: "1px solid var(--border, #f1f5f9)",
                  background: n.status_baca === "unread" ? "rgba(245,158,11,0.08)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  fontSize: "0.8125rem", lineHeight: 1.5,
                  color: "var(--text-primary)",
                  fontWeight: n.status_baca === "unread" ? 600 : 400,
                }}>
                  {n.status_baca === "unread" && (
                    <span style={{
                      display: "inline-block", width: 8, height: 8,
                      borderRadius: "50%", background: "#ef4444",
                      marginRight: 6, verticalAlign: "middle",
                    }} />
                  )}
                  {n.pesan}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 4 }}>
                  🕐 {formatTime(n.created_at)}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
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