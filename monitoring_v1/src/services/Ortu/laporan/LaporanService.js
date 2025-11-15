import axios from 'axios'
import { API_URL } from '../../api'

/**
 * Service untuk Laporan Anak (Role Ortu)
 *
 * Authorization: Bearer Token (dari localStorage)
 * Data Scope: Hanya data anak yang terkait dengan NISN ortu yang login
 */
export const LaporanService = {
  /**
   * API #1: Get Daftar Tahun Ajaran
   * GET /api/ortu/laporan/tahun-ajaran
   *
   * @returns {Promise} Response dengan daftar tahun ajaran
   * @example
   * const response = await LaporanService.getTahunAjaran()
   * // response.data = [{ id: 1, tahun_ajaran: "2025/2026", label: "T.A 2025/2026", is_active: true }]
   */
  getTahunAjaran: async () => {
    try {
      const res = await axios.get(`${API_URL}/ortu/laporan/tahun-ajaran`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      return res.data
    } catch (error) {
      console.error('LaporanService.getTahunAjaran error:', error)
      throw error
    }
  },

  /**
   * API #2: Get Daftar Semester (NEW!)
   * GET /api/ortu/laporan/semester
   *
   * @param {number} tahunAjaranId - ID tahun ajaran untuk filter semester
   * @returns {Promise} Response dengan daftar semester yang tersedia
   * @example
   * const response = await LaporanService.getSemester(1)
   * // response.data = [{ id: 1, semester: "1", label: "Semester 1 (Ganjil)", has_nilai: true }]
   */
  getSemester: async (tahunAjaranId) => {
    try {
      const res = await axios.get(`${API_URL}/ortu/laporan/semester`, {
        params: {
          tahun_ajaran_id: tahunAjaranId,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      return res.data
    } catch (error) {
      console.error('LaporanService.getSemester error:', error)
      throw error
    }
  },

  /**
   * API #3: Get Laporan Nilai Anak
   * GET /api/ortu/laporan/nilai
   *
   * @param {number} tahunAjaranId - ID tahun ajaran
   * @param {string} semester - Semester: '1' atau '2'
   * @returns {Promise} Response dengan data laporan nilai
   * @example
   * const response = await LaporanService.getLaporanNilai(1, '1')
   * // response.data = { siswa: {...}, nilai: [...], statistik: {...} }
   */
  getLaporanNilai: async (tahunAjaranId, semester) => {
    try {
      const res = await axios.get(`${API_URL}/ortu/laporan/nilai`, {
        params: {
          tahun_ajaran_id: tahunAjaranId,
          semester: semester,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      return res.data
    } catch (error) {
      console.error('LaporanService.getLaporanNilai error:', error)
      throw error
    }
  },

  /**
   * API #4: Download PDF Laporan
   * POST /api/ortu/laporan/download-pdf
   *
   * @param {number} tahunAjaranId - ID tahun ajaran
   * @param {string} semester - Semester: '1' atau '2'
   * @returns {Promise} Response dengan binary PDF data
   * @example
   * await LaporanService.downloadPDF(1, '1')
   * // PDF akan otomatis terdownload dengan nama file yang sesuai
   */
  downloadPDF: async (tahunAjaranId, semester) => {
    try {
      const res = await axios.post(
        `${API_URL}/ortu/laporan/download-pdf`,
        {
          tahun_ajaran_id: tahunAjaranId,
          semester: semester,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob', // Important untuk handle binary data
        }
      )

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = res.headers['content-disposition']
      let filename = `Laporan_${semester}_${tahunAjaranId}.pdf`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)

      return res
    } catch (error) {
      console.error('LaporanService.downloadPDF error:', error)
      throw error
    }
  },
}

export default LaporanService
