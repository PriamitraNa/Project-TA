import axios from 'axios'
import { API_URL } from '../../api'

export const LaporanService = {
  /**
   * GET /api/admin/laporan/tahun-ajaran
   * Mengambil daftar tahun ajaran untuk dropdown cascade
   */
  getTahunAjaran: async () => {
    const res = await axios.get(`${API_URL}/admin/laporan/tahun-ajaran`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * GET /api/admin/laporan/kelas?tahun_ajaran_id=1
   * Mengambil daftar kelas berdasarkan tahun ajaran
   */
  getKelasByTahunAjaran: async (tahunAjaranId) => {
    const res = await axios.get(`${API_URL}/admin/laporan/kelas`, {
      params: { tahun_ajaran_id: tahunAjaranId },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * GET /api/admin/laporan/siswa-dropdown?kelas_id=1&tahun_ajaran_id=1
   * Mengambil daftar siswa berdasarkan kelas dan tahun ajaran untuk dropdown
   */
  getSiswaByKelas: async (kelasId, tahunAjaranId) => {
    const res = await axios.get(`${API_URL}/admin/laporan/siswa-dropdown`, {
      params: {
        kelas_id: kelasId,
        tahun_ajaran_id: tahunAjaranId,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * GET /api/admin/laporan/transkrip/:siswa_id
   * Mengambil transkrip nilai lengkap siswa (semua semester)
   */
  getTranskripSiswa: async (siswaId) => {
    const res = await axios.get(`${API_URL}/admin/laporan/transkrip/${siswaId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * GET /api/admin/laporan/transkrip/:siswa_id/pdf
   * Download transkrip nilai siswa individual dalam format PDF
   */
  downloadTranskripPDF: async (siswaId) => {
    const res = await axios.get(`${API_URL}/admin/laporan/transkrip/${siswaId}/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      responseType: 'blob',
    })

    // Auto download
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = res.headers['content-disposition']
    let filename = 'Transkrip_Nilai_Siswa.pdf'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
      if (filenameMatch) filename = filenameMatch[1]
    }

    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return res
  },

  /**
   * POST /api/admin/laporan/transkrip/bulk
   * Download transkrip semua siswa di kelas (ZIP file)
   */
  downloadTranskripBulk: async (kelasId, tahunAjaranId) => {
    const res = await axios.post(
      `${API_URL}/admin/laporan/transkrip/bulk`,
      {
        kelas_id: kelasId,
        tahun_ajaran_id: tahunAjaranId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        responseType: 'blob',
      }
    )

    // Auto download ZIP
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = res.headers['content-disposition']
    let filename = 'Transkrip_Nilai_Kelas.zip'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
      if (filenameMatch) filename = filenameMatch[1]
    }

    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return res
  },
}
