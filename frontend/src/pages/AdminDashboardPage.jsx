import { useState, useEffect } from "react";
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
import { fetchDashboardStats } from "../services/api";
import { PageLoading } from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import ServiceUnavailableBanner, { isServiceError } from "../components/ServiceUnavailableBanner";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const s = await fetchDashboardStats();
      setStats(s);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !stats) return <PageLoading />;

  const statCards = stats ? [
    { label: "Total Laporan", value: stats.total_laporan, icon: "📋", bg: "#eff6ff", color: "#2563eb" },
    { label: "Menunggu", value: stats.menunggu, icon: "⏳", bg: "#fffbeb", color: "#f59e0b" },
    { label: "Diproses", value: stats.diproses, icon: "🔄", bg: "#eff6ff", color: "#3b82f6" },
    { label: "Selesai", value: stats.selesai, icon: "✅", bg: "#f0fdf4", color: "#10b981" },
    { label: "Ditemukan", value: stats.ditemukan || 0, icon: "🎉", bg: "#f5f3ff", color: "#8b5cf6" },
    { label: "Pengguna Aktif", value: `${stats.active_users || 0}/${stats.total_users || 0}`, icon: "👥", bg: "#fef3c7", color: "#d97706" },
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
    labels: ["Menunggu", "Diproses", "Selesai", "Ditemukan"],
    datasets: [{
      label: "Jumlah Laporan",
      data: [stats.menunggu, stats.diproses, stats.selesai, stats.ditemukan || 0],
      backgroundColor: ["#fef3c7", "#dbeafe", "#d1fae5", "#ede9fe"],
      borderColor: ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"],
      borderWidth: 2,
      borderRadius: 8,
    }],
  } : null;

  const prioritasData = stats ? {
    labels: ["Tinggi", "Sedang", "Rendah"],
    datasets: [{
      data: [
        stats.prioritas_stats?.tinggi || 0,
        stats.prioritas_stats?.sedang || 0,
        stats.prioritas_stats?.rendah || 0,
      ],
      backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
      borderWidth: 0,
    }],
  } : null;

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>📊 Dashboard Admin</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
            LaporIn ITK — Ringkasan statistik sistem pelaporan
          </p>
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

        {stats && (
          <>
            {/* Stat Cards */}
            <div className="grid-stat-cards" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}>
              {statCards.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>

            {/* Charts */}
            <div className="grid-2" style={{ marginBottom: "2rem" }}>
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

            {/* Prioritas Chart */}
            <div className="card" style={{ maxWidth: 400, marginBottom: "2rem" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "1.5rem" }}>🎯 Laporan per Prioritas</h3>
              {prioritasData && (
                <div style={{ maxWidth: 250, margin: "0 auto" }}>
                  <Doughnut data={prioritasData} options={{
                    plugins: { legend: { position: "bottom" } },
                    cutout: "60%",
                  }} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}