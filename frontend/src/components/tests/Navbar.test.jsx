import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../Navbar'

describe('Navbar Component', () => {
  // Simulasi (Mock) fungsi matchMedia khusus untuk lingkungan testing
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), 
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('menampilkan judul aplikasi', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )
    
    // Memastikan judul aplikasi Anda tampil di Navbar
    expect(screen.getByText(/LaporIn ITK/i)).toBeInTheDocument()
  })
})