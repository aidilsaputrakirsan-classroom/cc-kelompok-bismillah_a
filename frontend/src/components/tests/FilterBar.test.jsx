import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from '../FilterBar'

const mockCategories = [
  { id: 1, nama_kategori: 'Fasilitas' },
  { id: 2, nama_kategori: 'Keamanan' },
]

const mockFilters = {
  search: '',
  status: '',
  kategori_id: '',
}

describe('FilterBar Component', () => {
  it('menampilkan input search dan select filter', () => {
    const handleFilterChange = vi.fn()
    const handleSubmit = vi.fn()

    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={handleFilterChange}
        categories={mockCategories}
        onSubmit={handleSubmit}
      />
    )

    // Memastikan input search tampil
    expect(screen.getByPlaceholderText(/Cari laporan/i)).toBeInTheDocument()
    
    // Memastikan select status tampil
    expect(screen.getByDisplayValue('Semua Status')).toBeInTheDocument()
  })

  it('memanggil onFilterChange saat user mengetik di search input', () => {
    const handleFilterChange = vi.fn()
    const handleSubmit = vi.fn()

    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={handleFilterChange}
        categories={mockCategories}
        onSubmit={handleSubmit}
      />
    )

    const searchInput = screen.getByPlaceholderText(/Cari laporan/i)
    fireEvent.change(searchInput, { target: { value: 'proyektor' } })

    // Memastikan handler dipanggil dengan search value
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'proyektor' })
    )
  })

  it('memanggil onFilterChange saat user mengubah status filter', () => {
    const handleFilterChange = vi.fn()
    const handleSubmit = vi.fn()

    render(
      <FilterBar
        filters={mockFilters}
        onFilterChange={handleFilterChange}
        categories={mockCategories}
        onSubmit={handleSubmit}
      />
    )

    const statusSelect = screen.getByDisplayValue('Semua Status')
    fireEvent.change(statusSelect, { target: { value: 'menunggu' } })

    // Memastikan handler dipanggil dengan status value
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'menunggu' })
    )
  })
})
