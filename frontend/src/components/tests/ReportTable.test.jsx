import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import ReportTable from '../ReportTable'

const mockReports = [
  {
    id: 1,
    judul: 'Proyektor Rusak',
    lokasi: 'Ruang 301',
    status: 'menunggu',
    prioritas: 'tinggi',
    anonim: false,
    category: { nama_kategori: 'Fasilitas' },
  },
  {
    id: 2,
    judul: 'AC Tidak Dingin',
    lokasi: 'Ruang 302',
    status: 'diproses',
    prioritas: 'sedang',
    anonim: true,
    category: { nama_kategori: 'Fasilitas' },
  },
]

const mockFormatDate = (date) => '05 Mei 2026'

describe('ReportTable Component', () => {
  it('menampilkan daftar laporan dengan judul dan lokasi', () => {
    const handleStatusChange = vi.fn()
    const handlePrioritasChange = vi.fn()
    const handleAssign = vi.fn()

    render(
      <BrowserRouter>
        <ReportTable
          reports={mockReports}
          formatDate={mockFormatDate}
          onStatusChange={handleStatusChange}
          onPrioritasChange={handlePrioritasChange}
          onAssign={handleAssign}
        />
      </BrowserRouter>
    )

    // Memastikan laporan tampil di tabel
    expect(screen.getByText('Proyektor Rusak')).toBeInTheDocument()
    expect(screen.getByText('AC Tidak Dingin')).toBeInTheDocument()
    expect(screen.getByText('Ruang 301')).toBeInTheDocument()
    expect(screen.getByText('Ruang 302')).toBeInTheDocument()
  })

  it('menampilkan pesan empty state saat tidak ada laporan', () => {
    const handleStatusChange = vi.fn()
    const handlePrioritasChange = vi.fn()
    const handleAssign = vi.fn()

    render(
      <BrowserRouter>
        <ReportTable
          reports={[]}
          formatDate={mockFormatDate}
          onStatusChange={handleStatusChange}
          onPrioritasChange={handlePrioritasChange}
          onAssign={handleAssign}
        />
      </BrowserRouter>
    )

    // Memastikan empty state message tampil
    expect(screen.getByText(/Tidak ada laporan ditemukan/i)).toBeInTheDocument()
  })

  it('memanggil onStatusChange saat user mengubah status', () => {
    const handleStatusChange = vi.fn()
    const handlePrioritasChange = vi.fn()
    const handleAssign = vi.fn()

    render(
      <BrowserRouter>
        <ReportTable
          reports={mockReports}
          formatDate={mockFormatDate}
          onStatusChange={handleStatusChange}
          onPrioritasChange={handlePrioritasChange}
          onAssign={handleAssign}
        />
      </BrowserRouter>
    )

    // Cari status select untuk laporan pertama
    const statusSelects = screen.getAllByDisplayValue('⏳ Menunggu')
    fireEvent.change(statusSelects[0], { target: { value: 'selesai' } })

    // Memastikan handler dipanggil
    expect(handleStatusChange).toHaveBeenCalledWith(1, 'selesai')
  })
})
