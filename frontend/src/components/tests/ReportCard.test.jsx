import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import ReportCard from '../ReportCard'

// Menyesuaikan mock data dengan data laporan (report) di project Anda
const mockReport = {
  id: 1,
  judul: 'Proyektor Rusak',
  deskripsi: 'Proyektor di ruang kelas 301 tidak bisa menyala',
  status: 'menunggu', // Status harus "menunggu" agar tombol action muncul
  prioritas: 'tinggi',
  lokasi: 'Ruang 301',
  created_at: '2026-05-05T10:00:00Z',
  category: { nama_kategori: 'Fasilitas' }
}

// Dummy function untuk kebutuhan prop formatDate
const mockFormatDate = (date) => '05 Mei 2026'

describe('ReportCard Component', () => {
  it('menampilkan judul dan lokasi laporan', () => {
    render(
      <BrowserRouter>
        <ReportCard
          report={mockReport}
          formatDate={mockFormatDate}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </BrowserRouter>
    )
    
    // Pastikan judul dan lokasi tampil di dalam komponen
    expect(screen.getByText('Proyektor Rusak')).toBeInTheDocument()
    expect(screen.getByText(/Ruang 301/)).toBeInTheDocument()
  })

  it('memanggil onEdit saat tombol edit diklik', () => {
    const handleEdit = vi.fn()
    render(
      <BrowserRouter>
        <ReportCard
          report={mockReport}
          formatDate={mockFormatDate}
          onEdit={handleEdit}
          onDelete={() => {}}
        />
      </BrowserRouter>
    )
    
    // Teks tombol di komponen Anda adalah "✏️ Edit"
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)
    
    // Memastikan handleEdit dipanggil dan mengirim objek laporan (report)
    expect(handleEdit).toHaveBeenCalledWith(mockReport)
  })

  it('memanggil onDelete saat tombol hapus diklik', () => {
    const handleDelete = vi.fn()
    render(
      <BrowserRouter>
        <ReportCard
          report={mockReport}
          formatDate={mockFormatDate}
          onEdit={() => {}}
          onDelete={handleDelete}
        />
      </BrowserRouter>
    )
    
    // Teks tombol di komponen Anda adalah "🗑️ Hapus"
    const deleteButton = screen.getByRole('button', { name: /hapus/i })
    fireEvent.click(deleteButton)
    
    // Memastikan handleDelete dipanggil dan mengirimkan report.id
    expect(handleDelete).toHaveBeenCalledWith(mockReport.id)
  })
})