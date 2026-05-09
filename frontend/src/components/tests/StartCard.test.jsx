import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatCard from '../StatCard'

describe('StatCard Component', () => {
  it('menampilkan jumlah total laporan (items)', () => {
    // StatCard adalah komponen di project Anda yang bertugas menampilkan angka
    render(<StatCard label="Total Laporan" value={5} icon="📋" bg="#e0e0e0" color="#333" />)
    
    // Memastikan angka 5 tampil
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })
})