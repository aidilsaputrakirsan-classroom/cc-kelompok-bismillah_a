import { useState, useEffect, useCallback } from "react";
import {
  fetchAllUsers, toggleUserActive, resetUserPassword,
  createUser, updateUser, deleteUser,
} from "../services/api";
import { PageLoading } from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ServiceUnavailableBanner, { isServiceError } from "../components/ServiceUnavailableBanner";

// ─────────────────────────────────────────────
// Modal Tambah / Edit Pengguna
// ─────────────────────────────────────────────
function UserFormModal({ mode, user, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    nama: user?.nama || "",
    email: user?.email || "",
    no_hp: user?.no_hp || "",
    role: user?.role || "user",
    password: "",
    is_active: user?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const payload = {
          nama: form.nama,
          email: form.email,
          no_hp: form.no_hp || null,
          role: form.role,
          is_active: form.is_active,
        };
        await updateUser(user.id, payload);
      } else {
        await createUser({
          nama: form.nama,
          email: form.email,
          no_hp: form.no_hp || null,
          role: form.role,
          password: form.password,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "var(--bg-primary, #fff)",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        width: "100%", maxWidth: "480px",
        padding: "2rem",
        animation: "fadeInUp 0.2s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.25rem", margin: 0 }}>
            {isEdit ? "✏️ Edit Pengguna" : "➕ Tambah Pengguna"}
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: "1.5rem",
            cursor: "pointer", color: "var(--text-muted)", lineHeight: 1,
          }}>×</button>
        </div>

        {error && (
          <div style={{
            background: "#fee2e2", color: "#991b1b",
            padding: "0.75rem 1rem", borderRadius: "8px",
            marginBottom: "1rem", fontSize: "0.875rem",
          }}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Nama */}
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem" }}>
              Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text" name="nama" required
              className="form-input" value={form.nama}
              onChange={handleChange} placeholder="Contoh: Budi Santoso"
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem" }}>
              Email <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="email" name="email" required
              className="form-input" value={form.email}
              onChange={handleChange} placeholder="user@laporitk.ac.id"
            />
          </div>

          {/* No HP */}
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem" }}>
              No. HP
            </label>
            <input
              type="tel" name="no_hp"
              className="form-input" value={form.no_hp}
              onChange={handleChange} placeholder="08xxxxxxxxxx (opsional)"
            />
          </div>

          {/* Password — hanya saat tambah */}
          {!isEdit && (
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem" }}>
                Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="password" name="password" required={!isEdit}
                className="form-input" value={form.password}
                onChange={handleChange} placeholder="Min 8 karakter, huruf besar, angka, simbol"
              />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Contoh: Cloud@123
              </p>
            </div>
          )}

          {/* Role */}
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem" }}>
              Role <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="user">👤 User</option>
              <option value="admin">🛡️ Admin</option>
            </select>
          </div>

          {/* Status aktif — hanya saat edit */}
          {isEdit && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              background: "var(--bg-secondary, #f1f5f9)",
              padding: "0.75rem 1rem", borderRadius: "8px",
            }}>
              <input
                type="checkbox" id="is_active" name="is_active"
                checked={form.is_active} onChange={handleChange}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="is_active" style={{ fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
                Akun Aktif
              </label>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? "Menyimpan…" : isEdit ? "💾 Simpan" : "➕ Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Halaman Utama
// ─────────────────────────────────────────────
export default function AdminKelolaUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // null | { mode: "add"|"edit", user?: ... }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const data = await fetchAllUsers(params);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleToggleActive = async (userId, userName) => {
    const user = users.find((u) => u.id === userId);
    const action = user?.is_active ? "menonaktifkan" : "mengaktifkan";
    if (!confirm(`Yakin ingin ${action} akun "${userName}"?`)) return;
    setActionLoading(userId + "-toggle");
    try {
      await toggleUserActive(userId);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId, userName) => {
    if (!confirm(`Reset password "${userName}" ke default (Reset@123)?`)) return;
    setActionLoading(userId + "-reset");
    try {
      const result = await resetUserPassword(userId);
      alert(result.message);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`⚠️ Hapus akun "${userName}" secara PERMANEN? Tindakan ini tidak bisa dibatalkan.`)) return;
    setActionLoading(userId + "-delete");
    try {
      await deleteUser(userId);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  if (loading && users.length === 0) return <PageLoading />;

  return (
    <div className="page">
      {/* Modal */}
      {modal && (
        <UserFormModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}

      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.75rem", margin: 0 }}>
              👥 Kelola Pengguna
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: "0.25rem", marginBottom: 0 }}>
              Total <strong>{total}</strong> pengguna terdaftar
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setModal({ mode: "add" })}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}
          >
            ➕ Tambah Pengguna
          </button>
        </div>

        {/* Search & Filter */}
        <div className="card-flat" style={{
          display: "flex", gap: "1rem", marginBottom: "1.5rem",
          padding: "1rem 1.25rem", flexWrap: "wrap", alignItems: "center",
        }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: 220 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama atau email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 1, fontSize: "0.875rem" }}
            />
            <button type="submit" className="btn btn-primary btn-sm">🔍 Cari</button>
          </form>

          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: "auto", minWidth: 140, fontSize: "0.875rem" }}
          >
            <option value="">Semua Role</option>
            <option value="user">👤 User</option>
            <option value="admin">🛡️ Admin</option>
          </select>
        </div>

        {/* Error */}
        {error && isServiceError(error) && <ServiceUnavailableBanner onRetry={load} />}
        {error && !isServiceError(error) && (
          <div style={{
            background: "#fee2e2", color: "#991b1b",
            padding: "0.875rem 1rem", borderRadius: "8px",
            marginBottom: "1rem", fontSize: "0.875rem",
          }}>⚠️ {error}</div>
        )}

        {/* Users Table */}
        {users.length === 0 ? (
          <EmptyState icon="👤" title="Tidak Ada Pengguna" description="Tidak ditemukan pengguna sesuai filter." />
        ) : (
          <div className="card-flat" style={{ overflow: "auto" }}>
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-secondary, #f1f5f9)", textAlign: "left" }}>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 700 }}>Pengguna</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 700 }}>Role</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 700 }}>Terdaftar</th>
                  <th style={{ padding: "0.875rem 1rem", fontWeight: 700, textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.nama}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{u.email}</div>
                        {u.no_hp && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>📱 {u.no_hp}</div>}
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span className="badge" style={{
                        background: u.role === "admin" ? "#fef3c7" : "#eff6ff",
                        color: u.role === "admin" ? "#d97706" : "#2563eb",
                        fontWeight: 600,
                      }}>
                        {u.role === "admin" ? "🛡️ Admin" : "👤 User"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span className="badge" style={{
                        background: u.is_active ? "#f0fdf4" : "#fef2f2",
                        color: u.is_active ? "#10b981" : "#ef4444",
                        fontWeight: 600,
                      }}>
                        {u.is_active ? "✅ Aktif" : "🚫 Nonaktif"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                      {formatDate(u.created_at)}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.375rem", justifyContent: "center", flexWrap: "wrap" }}>
                        {/* Edit */}
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setModal({ mode: "edit", user: u })}
                          disabled={actionLoading !== null}
                          style={{ fontSize: "0.75rem", padding: "0.375rem 0.625rem" }}
                          title="Edit pengguna"
                        >
                          ✏️ Edit
                        </button>

                        {/* Toggle Aktif */}
                        <button
                          className={`btn btn-sm ${u.is_active ? "btn-danger" : "btn-success"}`}
                          onClick={() => handleToggleActive(u.id, u.nama)}
                          disabled={actionLoading !== null || u.role === "admin"}
                          title={u.role === "admin" ? "Tidak bisa menonaktifkan admin" : ""}
                          style={{ fontSize: "0.75rem", padding: "0.375rem 0.625rem" }}
                        >
                          {actionLoading === u.id + "-toggle" ? "…" : u.is_active ? "🚫 Nonaktif" : "✅ Aktifkan"}
                        </button>

                        {/* Reset Password */}
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleResetPassword(u.id, u.nama)}
                          disabled={actionLoading !== null}
                          style={{ fontSize: "0.75rem", padding: "0.375rem 0.625rem" }}
                        >
                          {actionLoading === u.id + "-reset" ? "…" : "🔑 Reset PW"}
                        </button>

                        {/* Hapus */}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(u.id, u.nama)}
                          disabled={actionLoading !== null || u.role === "admin"}
                          title={u.role === "admin" ? "Tidak bisa menghapus admin" : "Hapus pengguna"}
                          style={{ fontSize: "0.75rem", padding: "0.375rem 0.625rem" }}
                        >
                          {actionLoading === u.id + "-delete" ? "…" : "🗑️ Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
