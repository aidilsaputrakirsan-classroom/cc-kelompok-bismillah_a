import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FeedbackForm from '../FeedbackForm'

const mockForm = {
  rating: 0,
  komentar: '',
}

describe('FeedbackForm Component', () => {
  it('menampilkan form feedback dengan rating stars dan textarea', () => {
    const handleFormChange = vi.fn()
    const handleSubmit = vi.fn()

    render(
      <FeedbackForm
        form={mockForm}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        done={false}
        loading={false}
      />
    )

    // Memastikan title feedback tampil
    expect(screen.getByText(/Berikan Feedback/i)).toBeInTheDocument()
    
    // Memastikan textarea tampil
    expect(screen.getByPlaceholderText(/Bagaimana penanganan laporan Anda/i)).toBeInTheDocument()
    
    // Memastikan submit button tampil
    expect(screen.getByRole('button', { name: /Kirim Feedback/i })).toBeInTheDocument()
  })

  it('memanggil onSubmit saat form di-submit dengan rating dan komentar', () => {
    const handleFormChange = vi.fn()
    const handleSubmit = vi.fn()

    const form = {
      rating: 5,
      komentar: 'Penanganan sangat bagus!',
    }

    render(
      <FeedbackForm
        form={form}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        done={false}
        loading={false}
      />
    )

    const submitButton = screen.getByRole('button', { name: /Kirim Feedback/i })
    fireEvent.click(submitButton)

    // Memastikan handler submit dipanggil
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('menampilkan pesan sukses ketika feedback sudah dikirim', () => {
    const handleFormChange = vi.fn()
    const handleSubmit = vi.fn()

    render(
      <FeedbackForm
        form={mockForm}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        done={true}
        loading={false}
      />
    )

    // Memastikan success message tampil
    expect(screen.getByText(/Terima kasih atas feedback Anda/i)).toBeInTheDocument()
    
    // Form tidak boleh tampil
    expect(screen.queryByPlaceholderText(/Bagaimana penanganan laporan Anda/i)).not.toBeInTheDocument()
  })

  it('memanggil onFormChange saat user klik rating star', () => {
    const handleFormChange = vi.fn()
    const handleSubmit = vi.fn()

    render(
      <FeedbackForm
        form={mockForm}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        done={false}
        loading={false}
      />
    )

    // Cari semua star buttons dan klik rating 4
    const starButtons = screen.getAllByRole('button', { name: '⭐' })
    fireEvent.click(starButtons[3]) // Index 3 = rating 4

    // Memastikan handler dipanggil dengan rating 4
    expect(handleFormChange).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 4 })
    )
  })
})
