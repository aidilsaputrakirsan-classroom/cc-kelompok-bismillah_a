import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EmptyState from '../EmptyState'

describe('EmptyState Component', () => {
  it('menampilkan title, description, dan icon', () => {
    render(
      <EmptyState
        icon="📭"
        title="Tidak Ada Data"
        description="Belum ada laporan yang ditemukan. Silakan coba cari dengan kata kunci lain."
      />
    )

    // Memastikan title dan description tampil
    expect(screen.getByText('Tidak Ada Data')).toBeInTheDocument()
    expect(
      screen.getByText(/Belum ada laporan yang ditemukan/i)
    ).toBeInTheDocument()
    
    // Memastikan icon tampil
    expect(screen.getByText('📭')).toBeInTheDocument()
  })

  it('menampilkan action button jika disediakan', () => {
    const mockAction = <button>Buat Laporan Baru</button>

    render(
      <EmptyState
        icon="📭"
        title="Tidak Ada Laporan"
        description="Mulai dengan membuat laporan pertama Anda"
        action={mockAction}
      />
    )

    // Memastikan action button tampil
    expect(screen.getByRole('button', { name: /Buat Laporan Baru/i })).toBeInTheDocument()
  })

  it('menggunakan icon default jika tidak disediakan', () => {
    render(
      <EmptyState
        title="Kosong"
        description="Tidak ada data"
      />
    )

    // Memastikan icon default (📭) tampil
    expect(screen.getByText('📭')).toBeInTheDocument()
  })
})
