import * as laporanService from '../../services/ortu/laporanService.js'

/**
 * GET /api/ortu/laporan/tahun-ajaran
 * Get list tahun ajaran untuk dropdown (hanya yang ada data nilai anak)
 */
export const getTahunAjaran = async (req, res, next) => {
  try {
    // Check role
    if (req.user.role !== 'ortu') {
      return res.status(403).json({
        status: 'error',
        message: 'Akses ditolak. Hanya orang tua yang dapat mengakses endpoint ini.',
      })
    }

    // CRITICAL: Get siswa_id from JWT token
    const siswaId = req.user.siswa_id
    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Data siswa tidak ditemukan dalam token. Silakan login ulang.',
      })
    }

    const data = await laporanService.getTahunAjaranService(siswaId)

    res.status(200).json({
      status: 'success',
      data: data,
    })
  } catch (error) {
    console.error('Error in getTahunAjaran controller:', error)
    next(error)
  }
}

/**
 * GET /api/ortu/laporan/semester
 * Get list semester untuk dropdown (hanya yang ada data nilai)
 * Query param: tahun_ajaran (string, misal: '2025/2026')
 */
export const getSemester = async (req, res, next) => {
  try {
    // Check role
    if (req.user.role !== 'ortu') {
      return res.status(403).json({
        status: 'error',
        message: 'Akses ditolak. Hanya orang tua yang dapat mengakses endpoint ini.',
      })
    }

    // CRITICAL: Get siswa_id from JWT token
    const siswaId = req.user.siswa_id
    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Data siswa tidak ditemukan dalam token. Silakan login ulang.',
      })
    }

    // Get tahun_ajaran from query
    const { tahun_ajaran } = req.query

    if (!tahun_ajaran) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter tahun_ajaran wajib diisi',
      })
    }

    const data = await laporanService.getSemesterService(siswaId, tahun_ajaran)

    res.status(200).json({
      status: 'success',
      data: data,
    })
  } catch (error) {
    console.error('Error in getSemester controller:', error)
    next(error)
  }
}

/**
 * GET /api/ortu/laporan/nilai
 * Get nilai laporan anak
 * CRITICAL: Must use NISN from JWT token!
 */
export const getNilaiLaporan = async (req, res, next) => {
  try {
    // Check role
    if (req.user.role !== 'ortu') {
      return res.status(403).json({
        status: 'error',
        message: 'Akses ditolak. Hanya orang tua yang dapat mengakses endpoint ini.',
      })
    }

    // CRITICAL: Get siswa_id from JWT token
    const siswaId = req.user.siswa_id
    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Data siswa tidak ditemukan dalam token. Silakan login ulang.',
      })
    }

    // Get query params
    const { tahun_ajaran_id, semester } = req.query

    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter tahun_ajaran_id wajib diisi',
      })
    }

    if (!semester) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter semester wajib diisi (1 atau 2)',
      })
    }

    // Call service with siswa_id from token
    const data = await laporanService.getNilaiLaporanService(siswaId, tahun_ajaran_id, semester)

    res.status(200).json({
      status: 'success',
      data: data,
    })
  } catch (error) {
    // Handle specific errors
    if (error.message === 'Data siswa tidak ditemukan dalam token') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
      })
    }

    if (error.message === 'Tahun ajaran wajib dipilih') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      })
    }

    if (
      error.message === 'Semester harus 1 atau 2' ||
      error.message === 'Semester harus 1 atau 2 (atau Ganjil/Genap)' ||
      error.message === 'Semester wajib diisi'
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Semester harus 1 atau 2',
      })
    }

    if (error.message === 'Data nilai tidak ditemukan untuk siswa ini') {
      return res.status(404).json({
        status: 'error',
        message: error.message,
      })
    }

    console.error('Error in getNilaiLaporan controller:', error)
    next(error)
  }
}
/**
 * POST /api/ortu/laporan/download-pdf
 * Download PDF laporan nilai
 * CRITICAL: Must use siswa_id from JWT token!
 */
export const downloadPDF = async (req, res, next) => {
  try {
    // Check role
    if (req.user.role !== 'ortu') {
      return res.status(403).json({
        status: 'error',
        message: 'Akses ditolak. Hanya orang tua yang dapat mengakses endpoint ini.',
      })
    }

    // CRITICAL: Get siswa_id from JWT token
    const siswaId = req.user.siswa_id
    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Data siswa tidak ditemukan dalam token. Silakan login ulang.',
      })
    }

    // Get body params
    const { tahun_ajaran_id, semester } = req.body

    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter tahun_ajaran_id wajib diisi',
      })
    }

    if (!semester) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter semester wajib diisi (1 atau 2)',
      })
    }

    // Generate PDF
    const pdfBuffer = await laporanService.generatePDFLaporanService(
      siswaId,
      tahun_ajaran_id,
      semester
    )

    // Get laporan data for filename
    const laporanData = await laporanService.getNilaiLaporanService(
      siswaId,
      tahun_ajaran_id,
      semester
    )
    const siswaName = laporanData.siswa.siswa_nama.replace(/\s+/g, '_')
    const tahunAjaran = laporanData.siswa.tahun_ajaran.replace(/\//g, '-')

    const filename = `Laporan_Nilai_${siswaName}_${tahunAjaran}_Semester_${semester}.pdf`

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    // Send PDF buffer
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error in downloadPDF controller:', error)

    // Handle specific errors
    if (error.message === 'Data siswa tidak ditemukan dalam token') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
      })
    }

    if (error.message === 'Tahun ajaran wajib dipilih') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      })
    }

    if (
      error.message === 'Semester harus 1 atau 2' ||
      error.message === 'Semester harus 1 atau 2 (atau Ganjil/Genap)' ||
      error.message === 'Semester wajib diisi'
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Semester harus 1 atau 2',
      })
    }

    if (error.message === 'Data nilai tidak ditemukan untuk siswa ini') {
      return res.status(404).json({
        status: 'error',
        message: error.message,
      })
    }

    next(error)
  }
}

export default {
  getTahunAjaran,
  getSemester,
  getNilaiLaporan,
  downloadPDF,
}
