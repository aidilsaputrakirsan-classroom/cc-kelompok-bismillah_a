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

    // Sejak VITE_API_URL=http://localhost (gateway), BASE_URL tidak lagi kosong.
    // URL yang di-fetch harus menyertakan prefix gateway.
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/reports?skip=0&limit=20'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        })
      })
    )
    expect(data.reports).toEqual([])
  })

  it('handle error saat API gagal (service unavailable)', async () => {
    // Simulasi fetch gagal (misalnya karena gateway/Docker tidak berjalan)
    fetch.mockRejectedValueOnce(new Error('Network error'))

    // api.js menangkap error jaringan dan melempar pesan user-friendly dalam bahasa Indonesia
    // (bukan meneruskan pesan teknis 'Network error' langsung ke user)
    await expect(
      fetchReports()
    ).rejects.toThrow('Layanan sementara tidak tersedia')
  })
})