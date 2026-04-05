import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearToken, getUser } from "../services/api";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  const initials = user?.nama
    ? user.nama.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/"} className="navbar-brand">
          <div className="navbar-logo">📋</div>
          <span>LaporIn ITK</span>
        </Link>

        {/* Nav Links */}
        {user && (
          <ul className="navbar-nav">
            {user.role === "admin" ? (
              <>
                <li><Link to="/admin" className={isActive("/admin")}>Dashboard</Link></li>
                <li><Link to="/admin/laporan" className={isActive("/admin/laporan")}>Kelola Laporan</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/dashboard" className={isActive("/dashboard")}>Laporan Saya</Link></li>
                <li><Link to="/laporan/buat" className={isActive("/laporan/buat")}>Buat Laporan</Link></li>
              </>
            )}
          </ul>
        )}

        {/* User Area */}
        <div className="navbar-user">
          {user ? (
            <>
              <div className="navbar-avatar" title={user.nama}>
                {initials}
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {user.nama?.split(" ")[0]}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {user.role === "admin" ? "Admin" : "Pelapor"}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Masuk</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}