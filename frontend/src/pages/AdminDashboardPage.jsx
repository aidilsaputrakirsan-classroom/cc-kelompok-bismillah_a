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
import { PageLoading } from "../components/LoadingSpinner";
import FilterBar from "../components/FilterBar";
import StatCard from "../components/StatCard";
import ReportTable from "../components/ReportTable";
import AssignUnitModal from "../components/AssignUnitModal";

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
    // Optimistic update: langsung update UI tanpa tunggu API
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
    try {
      await updateReport(reportId, { status: newStatus });
      // Refresh stats di background
      const s = await fetchDashboardStats();
      setStats(s);
    } catch (err) {
      // Revert jika API error
      await loadReports();
      alert("Gagal mengubah status: " + err.message);
    }
  };

  const handlePrioritasChange = async (reportId, newPrioritas) => {
    // Optimistic update
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, prioritas: newPrioritas } : r))
    );
    try {
      await updateReport(reportId, { prioritas: newPrioritas });
    } catch (err) {
      await loadReports();
      alert("Gagal mengubah prioritas: " + err.message);
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

  if (loading && !stats) return <PageLoading />;

  const statCards = stats ? [
    { label: "Total Laporan", value: stats.total_laporan, icon: "📋", bg: "#eff6ff", color: "#2563eb" },
    { label: "Menunggu", value: stats.menunggu, icon: "⏳", bg: "#fffbeb", color: "#f59e0b" },
    { label: "Diproses", value: stats.diproses, icon: "🔄", bg: "#eff6ff", color: "#3b82f6" },
    { label: "Selesai", value: stats.selesai, icon: "✅", bg: "#f0fdf4", color: "#10b981" },
  ] : [];

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
              {statCards.map((s) => (
                <StatCard key={s.label} {...s} />
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
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
              onSubmit={loadReports}
              inputStyle={{ flex: 1, maxWidth: 280 }}
              selectStyle={{ maxWidth: 180 }}
            />

            {/* Table */}
            <ReportTable
              reports={reports}
              formatDate={formatDate}
              onStatusChange={handleStatusChange}
              onPrioritasChange={handlePrioritasChange}
              onAssign={(id) => setAssignModal(id)}
            />
          </>
        )}

        {/* Assign Modal */}
        <AssignUnitModal
          open={!!assignModal}
          reportId={assignModal}
          units={units}
          onAssign={handleAssign}
          onClose={() => setAssignModal(null)}
        />
      </div>
    </div>
  );
}