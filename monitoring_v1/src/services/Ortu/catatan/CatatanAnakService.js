import axios from 'axios'
import { API_URL } from '../../api'

export const CatatanAnakService = {
  // GET /api/ortu/catatan/statistik - Get statistik catatan
  getStatistik: async () => {
    const res = await axios.get(`${API_URL}/ortu/catatan/statistik`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // GET /api/ortu/catatan - Get list catatan dengan filter, search, pagination
  getList: async (params = {}) => {
    const {
      page = 1,
      per_page = 10,
      search = '',
      kategori = '',
      jenis = '',
      sort_by = 'tanggal',
      sort_order = 'desc',
    } = params

    // Build query string
    const queryParams = new URLSearchParams()
    queryParams.append('page', page)
    queryParams.append('per_page', per_page)
    if (search) queryParams.append('search', search)
    if (kategori) queryParams.append('kategori', kategori)
    if (jenis) queryParams.append('jenis', jenis)
    queryParams.append('sort_by', sort_by)
    queryParams.append('sort_order', sort_order)

    const res = await axios.get(`${API_URL}/ortu/catatan?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // GET /api/ortu/catatan/:id - Get detail catatan dengan diskusi
  getDetail: async (id) => {
    const res = await axios.get(`${API_URL}/ortu/catatan/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // POST /api/ortu/catatan/:id/reply - Send reply to catatan
  sendReply: async (id, pesan) => {
    const res = await axios.post(
      `${API_URL}/ortu/catatan/${id}/reply`,
      { pesan },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return res.data
  },
}
