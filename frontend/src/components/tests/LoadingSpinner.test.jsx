import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageLoading, InlineLoading, ButtonLoading } from '../LoadingSpinner'

describe('LoadingSpinner Component', () => {
  it('menampilkan PageLoading spinner', () => {
    const { container } = render(<PageLoading />)

    // Memastikan spinner div tampil
    const spinnerDiv = container.querySelector('.page.loading-overlay')
    expect(spinnerDiv).toBeInTheDocument()
    
    // Memastikan spinner element ada
    const spinner = container.querySelector('.spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('menampilkan InlineLoading spinner', () => {
    const { container } = render(<InlineLoading />)

    // Memastikan inline loading overlay tampil
    const loadingOverlay = container.querySelector('.loading-overlay')
    expect(loadingOverlay).toBeInTheDocument()
    
    // Memastikan spinner element ada
    const spinner = container.querySelector('.spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('menampilkan ButtonLoading dengan teks default', () => {
    render(<ButtonLoading />)

    // Memastikan teks default tampil
    expect(screen.getByText('Memproses...')).toBeInTheDocument()
  })

  it('menampilkan ButtonLoading dengan custom teks', () => {
    render(<ButtonLoading text="Menyimpan..." />)

    // Memastikan custom teks tampil
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument()
  })
})
