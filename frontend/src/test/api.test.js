import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchReports } from '../services/api' // Sesuaikan path jika letak file test Anda berbeda

// Mock fetch global
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear()
    
    // Karena api.js Anda membutuhkan token (via getToken) untuk fetchReports, 
    // kita mock localStorage agar mengembalikan token palsu untuk pengujian.
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token')
  })

  it('fetchReports memanggil endpoint yang benar', async () => {
    // Simulasi respons sukses dari fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ total: 0, reports: [] }),
    })

    // Panggil fungsi dari api.js Anda
    const data = await fetchReports()

    // Memastikan fetch dipanggil dengan endpoint dan parameter default dari project Anda
    expect(fetch).toHaveBeenCalledWith(
      '/reports?skip=0&limit=20',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token' // Harus ada token
        })
      })
    )
    expect(data.reports).toEqual([])
  })

  it('handle error saat API gagal', async () => {
    // Simulasi fetch gagal (misalnya karena jaringan putus)
    fetch.mockRejectedValueOnce(new Error('Network error'))

    // Memastikan fetchReports melempar error saat fetch gagal
    await expect(
      fetchReports()
    ).rejects.toThrow('Network error')
  })
})