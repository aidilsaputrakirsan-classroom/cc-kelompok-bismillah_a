/**
 * FilterBar — Komponen filter bar reusable
 * Digunakan di DashboardPage dan AdminDashboardPage
 * untuk filter laporan berdasarkan search, status, dan kategori
 */

const filterBarStyle = {
  display: "flex",
  gap: "0.75rem",
  marginBottom: "1.5rem",
  flexWrap: "wrap",
  alignItems: "center",
  background: "white",
  padding: "1rem",
  borderRadius: "var(--radius)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

/**
 * @param {object} filters - State filter { status, kategori_id, search }
 * @param {function} onFilterChange - Handler perubahan filter
 * @param {Array} categories - Daftar kategori
 * @param {function} onSubmit - Handler submit filter
 * @param {object} inputStyle - Style tambahan untuk input search (opsional)
 * @param {object} selectStyle - Style tambahan untuk select (opsional)
 */
export default function FilterBar({
  filters,
  onFilterChange,
  categories,
  onSubmit,
  inputStyle = { maxWidth: 300, flex: 1 },
  selectStyle = { maxWidth: 200 },
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} style={filterBarStyle}>
      <input
        className="form-input"
        placeholder="🔍 Cari laporan..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        style={inputStyle}
      />
      <select
        className="form-select"
        value={filters.status}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        style={selectStyle}
      >
        <option value="">Semua Status</option>
        <option value="menunggu">⏳ Menunggu</option>
        <option value="diproses">🔄 Diproses</option>
        <option value="selesai">✅ Selesai</option>
      </select>
      <select
        className="form-select"
        value={filters.kategori_id}
        onChange={(e) => onFilterChange({ ...filters, kategori_id: e.target.value })}
        style={selectStyle}
      >
        <option value="">Semua Kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.nama_kategori}</option>
        ))}
      </select>
      <button type="submit" className="btn btn-primary">Cari</button>
    </form>
  );
}
