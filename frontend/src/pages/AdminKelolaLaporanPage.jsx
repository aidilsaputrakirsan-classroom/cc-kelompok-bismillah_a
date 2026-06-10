import { useState, useEffect, useCallback } from "react";
import {
  fetchAllReports, updateReport, fetchCategories,
  fetchUnits, assignReport,
} from "../services/api";
import { PageLoading } from "../components/LoadingSpinner";
import FilterBar from "../components/FilterBar";
import ReportTable from "../components/ReportTable";
import AssignUnitModal from "../components/AssignUnitModal";
import ServiceUnavailableBanner, { isServiceError } from "../components/ServiceUnavailableBanner";

export default function AdminKelolaLaporanPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [filters, setFilters] = useState({ status: "", kategori_id: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignModal, setAssignModal] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.kategori_id) params.kategori_id = filters.kategori_id;
      if (filters.search) params.search = filters.search;
      const data = await fetchAllReports(params);
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || "Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    Promise.all([
      fetchCategories().then(setCategories),
      fetchUnits().then(setUnits),
    ]);
    loadReports();
  }, []);

  const handleStatusChange = async (reportId, newStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
    try {
      await updateReport(reportId, { status: newStatus });
    } catch (err) {
      await loadReports();
      alert("Gagal mengubah status: " + err.message);
    }
  };

  const handlePrioritasChange = async (reportId, newPrioritas) => {
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
    setAssignLoading(true);
    try {
      await assignReport(reportId, Number(unitId));
      setAssignModal(null);
      alert("Laporan berhasil ditugaskan ke unit.");
    } catch (err) {
      alert(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading && reports.length === 0) return <PageLoading />;

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>📋 Kelola Laporan</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Total {total} laporan dari semua pengguna
          </p>
        </div>

        {/* Error */}
        {error && isServiceError(error) && <ServiceUnavailableBanner onRetry={loadReports} />}
        {error && !isServiceError(error) && (
          <div style={{
            background: "#fee2e2", color: "#991b1b",
            padding: "0.875rem 1rem", borderRadius: "8px",
            marginBottom: "1rem", fontSize: "0.875rem",
          }}>⚠️ {error}</div>
        )}

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

        {/* Assign Modal */}
        <AssignUnitModal
          open={!!assignModal}
          reportId={assignModal}
          units={units}
          loading={assignLoading}
          onAssign={handleAssign}
          onClose={() => setAssignModal(null)}
        />
      </div>
    </div>
  );
}
