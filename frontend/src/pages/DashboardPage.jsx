import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchReports,
  fetchCategories,
  updateReportByUser,
  deleteReport,
} from "../services/api";
import { InlineLoading } from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import FilterBar from "../components/FilterBar";
import ReportCard from "../components/ReportCard";
import EditReportModal from "../components/EditReportModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", kategori_id: "", search: "" });

  // Edit modal state
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ judul: "", deskripsi: "", lokasi: "", kategori_id: 1 });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.kategori_id) params.kategori_id = filters.kategori_id;
      if (filters.search) params.search = filters.search;
      const data = await fetchReports(params);
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories().then(setCategories);
    load();
  }, []);

  const handleEditOpen = (report) => {
    setEditForm({
      judul: report.judul,
      deskripsi: report.deskripsi,
      lokasi: report.lokasi || "",
      kategori_id: report.kategori_id,
    });
    setEditModal(report);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await updateReportByUser(editModal.id, {
        judul: editForm.judul,
        deskripsi: editForm.deskripsi,
        lokasi: editForm.lokasi || null,
        kategori_id: Number(editForm.kategori_id),
      });
      setEditModal(null);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteExecute = async () => {
    setDeleteLoading(true);
    try {
      await deleteReport(deleteConfirm);
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Laporan Saya</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Total {total} laporan tercatat
            </p>
          </div>
          <Link to="/laporan/buat" className="btn btn-primary">
            ➕ Buat Laporan Baru
          </Link>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          onSubmit={load}
        />

        {/* Content */}
        {loading ? (
          <InlineLoading />
        ) : reports.length === 0 ? (
          <EmptyState
            icon="📭"
            title="Belum Ada Laporan"
            description="Anda belum membuat laporan. Klik tombol di atas untuk memulai."
            action={<Link to="/laporan/buat" className="btn btn-primary">Buat Laporan Pertama</Link>}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reports.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                formatDate={formatDate}
                onEdit={handleEditOpen}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== EDIT MODAL ===== */}
      <EditReportModal
        report={editModal}
        form={editForm}
        onFormChange={setEditForm}
        categories={categories}
        loading={editLoading}
        onSubmit={handleEditSubmit}
        onClose={() => setEditModal(null)}
      />

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      <DeleteConfirmModal
        open={deleteConfirm !== null}
        loading={deleteLoading}
        onConfirm={handleDeleteExecute}
        onClose={() => setDeleteConfirm(null)}
      />
    </div>
  );
}