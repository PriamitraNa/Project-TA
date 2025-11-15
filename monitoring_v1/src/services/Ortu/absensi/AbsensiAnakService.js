import axios from 'axios'
import { API_URL } from '../../api'

export const AbsensiAnakService = {
  // GET /api/ortu/absensi/tahun-ajaran - Get daftar tahun ajaran
  getTahunAjaran: async () => {
    const res = await axios.get(`${API_URL}/ortu/absensi/tahun-ajaran`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // GET /api/ortu/absensi/semester - Get daftar semester berdasarkan tahun ajaran
  getSemester: async (tahunAjaranId) => {
    const res = await axios.get(`${API_URL}/ortu/absensi/semester`, {
      params: {
        tahun_ajaran_id: tahunAjaranId,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // GET /api/ortu/absensi/bulan - Get daftar bulan berdasarkan semester
  getBulan: async (tahunAjaranId, semester) => {
    const res = await axios.get(`${API_URL}/ortu/absensi/bulan`, {
      params: {
        tahun_ajaran_id: tahunAjaranId,
        semester: semester,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // GET /api/ortu/absensi/summary - Get summary kehadiran (cards)
  getSummary: async (tahunAjaranId, semester) => {
    const res = await axios.get(`${API_URL}/ortu/absensi/summary`, {
      params: {
        tahun_ajaran_id: tahunAjaranId,
        semester: semester,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // GET /api/ortu/absensi/detail - Get detail absensi untuk tabel
  getDetail: async (tahunAjaranId, semester, bulan = null) => {
    const params = {
      tahun_ajaran_id: tahunAjaranId,
      semester: semester,
    }

    // Tambahkan filter bulan jika ada
    if (bulan) {
      params.bulan = bulan
    }

    const res = await axios.get(`${API_URL}/ortu/absensi/detail`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // DEPRECATED - Legacy method (gunakan getDetail sebagai gantinya)
  // GET /api/ortu/absensi - Get absensi anak (mengembalikan data + summary)
  getAbsensi: async (startDate, endDate, tahunAjaranId = null, semester = null) => {
    const params = {
      tanggal_mulai: startDate,
      tanggal_akhir: endDate,
    }

    // Tambahkan filter tahun ajaran dan semester jika ada
    if (tahunAjaranId) {
      params.tahun_ajaran_id = tahunAjaranId
    }
    if (semester) {
      params.semester = semester
    }

    const res = await axios.get(`${API_URL}/ortu/absensi`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },
}
