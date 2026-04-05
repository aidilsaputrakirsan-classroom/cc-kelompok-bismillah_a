import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { fetchDashboardStats, fetchAllReports, updateReport, fetchCategories, fetchUnits, assignReport } from "../services/api";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [filters, setFilters] = useState({ status: "", kategori_id: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState(null);
  const [assignModal, setAssignModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, cats, u] = await Promise.all([
        fetchDashboardStats(),
        fetchCategories(),
        fetchUnits(),
      ]);
      setStats(s);
      setCategories(cats);
      setUnits(u);
      await loadReports();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.kategori_id) params.kategori_id = filters.kategori_id;
    if (filters.search) params.search = filters.search;
    const data = await fetchAllReports(params);
    setReports(data.reports);
    setTotal(data.total);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateReport(reportId, { status: newStatus });
      await loadReports();
      if (stats) {
        const s = await fetchDashboardStats();
        setStats(s);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssign = async (reportId, unitId) => {
    try {
      await assignReport(reportId, Number(unitId));
      setAssignModal(null);
      alert("Laporan berhasil ditugaskan ke unit.");
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading && !stats) return (
    <div className="page loading-overlay"><div className="spinner" /></div>
  );

  const donutData = stats ? {
    labels: Object.keys(stats.kategori_stats),
    datasets: [{
      data: Object.values(stats.kategori_stats),
      backgroundColor: ["#8b5cf6", "#3b82f6", "#ef4444"],
      borderWidth: 0,
    }],
  } : null;

  const barData = stats ? {
    labels: ["Menunggu", "Diproses", "Selesai"],
    datasets: [{
      label: "Jumlah Laporan",
      data: [stats.menunggu, stats.diproses, stats.selesai],
      backgroundColor: ["#fef3c7", "#dbeafe", "#d1fae5"],
      borderColor: ["#f59e0b", "#3b82f6", "#10b981"],
      borderWidth: 2,
      borderRadius: 8,
    }],
  } : null;

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Dashboard Admin</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>LaporIn ITK — Kelola semua laporan masuk</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`btn ${activeTab === "dashboard" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("dashboard")}
            >📊 Statistik</button>
            <button
              className={`btn ${activeTab === "reports" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => { setActiveTab("reports"); loadReports(); }}
            >📋 Laporan</button>
          </div>
        </div>

        {/* === DASHBOARD TAB === */}
        {activeTab === "dashboard" && stats && (
          <>
            {/* Stat Cards */}
            <div className="grid-4" style={{ marginBottom: "2rem" }}>
              {[
                { label: "Total Laporan", value: stats.total_laporan, icon: "📋", bg: "#eff6ff", color: "#2563eb" },
                { label: "Menunggu", value: stats.menunggu, icon: "⏳", bg: "#fffbeb", color: "#f59e0b" },
                { label: "Diproses", value: stats.diproses, icon: "🔄", bg: "#eff6ff", color: "#3b82f6" },
                { label: "Selesai", value: stats.selesai, icon: "✅", bg: "#f0fdf4", color: "#10b981" },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg }}>
                    <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid-2">
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: "1.5rem" }}>🗂️ Laporan per Kategori</h3>
                {donutData && (
                  <div style={{ maxWidth: 280, margin: "0 auto" }}>
                    <Doughnut data={donutData} options={{
                      plugins: { legend: { position: "bottom" } },
                      cutout: "65%",
                    }} />
                  </div>
                )}
              </div>
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: "1.5rem" }}>📈 Laporan per Status</h3>
                {barData && (
                  <Bar data={barData} options={{
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  }} />
                )}
              </div>
            </div>
          </>
        )}

        {/* === REPORTS TAB === */}
        {activeTab === "reports" && (
          <>
            {/* Filter */}
            <div style={styles.filterBar}>
              <input
                className="form-input"
                placeholder="🔍 Cari laporan..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{ flex: 1, maxWidth: 280 }}
              />
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{ maxWidth: 180 }}
              >
                <option value="">Semua Status</option>
                <option value="menunggu">⏳ Menunggu</option>
                <option value="diproses">🔄 Diproses</option>
                <option value="selesai">✅ Selesai</option>
              </select>
              <select
                className="form-select"
                value={filters.kategori_id}
                onChange={(e) => setFilters({ ...filters, kategori_id: e.target.value })}
                style={{ maxWidth: 180 }}
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={loadReports}>Cari</button>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Judul</th>
                    <th>Kategori</th>
                    <th>Status</th>
                    <th>Prioritas</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                        Tidak ada laporan ditemukan
                      </td>
                    </tr>
                  ) : reports.map((r) => (
                    <tr key={r.id}>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>#{r.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, maxWidth: 250 }}>
                          {r.judul}
                          {r.anonim && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>🕶️</span>}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{r.lokasi || "—"}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${r.category?.nama_kategori?.toLowerCase()}`}>
                          {r.category?.nama_kategori}
                        </span>
                      </td>
                      <td>
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          style={{
                            padding: "0.375rem 0.5rem",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            fontSize: "0.8125rem",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <option value="menunggu">⏳ Menunggu</option>
                          <option value="diproses">🔄 Diproses</option>
                          <option value="selesai">✅ Selesai</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge badge-${r.prioritas}`}>{r.prioritas}</span>
                      </td>
                      <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        {formatDate(r.created_at)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.375rem" }}>
                          <Link to={`/laporan/${r.id}`} className="btn btn-ghost btn-sm" title="Detail">
                            👁️
                          </Link>
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Assign Unit"
                            onClick={() => setAssignModal(r.id)}
                          >
                            📌
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Assign Modal */}
        {assignModal && (
          <div style={styles.modalOverlay} onClick={() => setAssignModal(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: "1rem", fontWeight: 700 }}>📌 Tugaskan ke Unit</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {units.map((u) => (
                  <button
                    key={u.id}
                    className="btn btn-secondary"
                    style={{ justifyContent: "flex-start", textAlign: "left" }}
                    onClick={() => handleAssign(assignModal, u.id)}
                  >
                    {u.nama_unit}
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: "1rem" }} onClick={() => setAssignModal(null)}>
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  filterBar: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
    alignItems: "center",
    background: "white",
    padding: "1rem",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "white",
    borderRadius: "var(--radius-lg)",
    padding: "2rem",
    minWidth: 360,
    boxShadow: "var(--shadow-xl)",
  },
};