import absensiService from '../../services/ortu/absensiService.js'

/**
 * GET /api/ortu/absensi/tahun-ajaran
 * Get daftar tahun ajaran yang relevan untuk orang tua
 * Authorization: Bearer token (ortu login)
 */
export const getTahunAjaran = async (req, res, next) => {
  try {
    // Get siswa_id dari token
    const siswaId = req.user.siswa_id

    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua siswa',
      })
    }

    const data = await absensiService.getTahunAjaranService(siswaId)

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data tahun ajaran tidak ditemukan',
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Data tahun ajaran berhasil diambil',
      data: {
        tahun_ajaran: data,
      },
    })
  } catch (error) {
    console.error('Error in getTahunAjaran:', error)
    next(error)
  }
}

/**
 * GET /api/ortu/absensi/semester
 * Get daftar semester berdasarkan tahun ajaran yang dipilih
 * Query param: tahun_ajaran (required) - string tahun ajaran (misal: '2025/2026')
 * Authorization: Bearer token (ortu login)
 */
export const getSemester = async (req, res, next) => {
  try {
    // Get siswa_id dari token
    const siswaId = req.user.siswa_id

    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan dalam token',
      })
    }

    // Validasi tahun_ajaran dari query parameter
    const tahunAjaran = req.query.tahun_ajaran

    if (!tahunAjaran) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter tahun_ajaran wajib diisi',
      })
    }

    const data = await absensiService.getSemesterService(siswaId, tahunAjaran)

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data semester tidak ditemukan',
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Data semester berhasil diambil',
      data: {
        semester: data,
      },
    })
  } catch (error) {
    console.error('Error in getSemester:', error)
    next(error)
  }
}

/**
 * GET /api/ortu/absensi/bulan
 * Get daftar bulan berdasarkan semester yang dipilih
 * Query param: tahun_ajaran_id (required), semester (required)
 * Authorization: Bearer token (ortu login)
 */
export const getBulan = async (req, res, next) => {
  try {
    // Get siswa_id dari token
    const siswaId = req.user.siswa_id

    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan dalam token',
      })
    }

    // Validasi query parameters
    const tahunAjaranId = req.query.tahun_ajaran_id
    const semester = req.query.semester

    if (!tahunAjaranId || !semester) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter tahun_ajaran_id dan semester wajib diisi',
      })
    }

    // Validasi semester value (harus 1 atau 2)
    if (semester !== '1' && semester !== '2') {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter semester harus 1 atau 2',
      })
    }

    const data = await absensiService.getBulanService(siswaId, tahunAjaranId, semester)

    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: 'Data bulan tidak ditemukan',
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Data bulan berhasil diambil',
      data: data,
    })
  } catch (error) {
    console.error('Error in getBulan:', error)
    next(error)
  }
}

/**
 * GET /api/ortu/absensi/summary
 * Get summary kehadiran untuk cards (total per status)
 * Query param: tahun_ajaran_id (required), semester (required)
 * Authorization: Bearer token (ortu login)
 */
export const getSummary = async (req, res, next) => {
  try {
    // Get siswa_id dari token
    const siswaId = req.user.siswa_id

    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan dalam token',
      })
    }

    // Validasi query parameters
    const tahunAjaranId = req.query.tahun_ajaran_id
    const semester = req.query.semester

    if (!tahunAjaranId || !semester) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter tahun_ajaran_id dan semester wajib diisi',
      })
    }

    // Validasi semester value (harus 1 atau 2)
    if (semester !== '1' && semester !== '2') {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter semester harus 1 atau 2',
      })
    }

    const data = await absensiService.getSummaryService(siswaId, tahunAjaranId, semester)

    if (!data) {
      return res.status(404).json({
        status: 'error',
        message: 'Data absensi tidak ditemukan untuk periode yang dipilih',
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Summary kehadiran berhasil diambil',
      data: data,
    })
  } catch (error) {
    console.error('Error in getSummary:', error)
    next(error)
  }
}

/**
 * GET /api/ortu/absensi/detail
 * Get detail absensi untuk tabel (TERPENGARUH oleh filter bulan)
 * Query params: tahun_ajaran_id (required), semester (required), bulan (optional)
 */
export const getDetail = async (req, res, next) => {
  try {
    // Get siswa_id dari token
    const siswaId = req.user.siswa_id

    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan dalam token',
      })
    }

    // Get query parameters
    const { tahun_ajaran_id, semester, bulan } = req.query

    // Validasi required params
    if (!tahun_ajaran_id || !semester) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter tahun_ajaran_id dan semester wajib diisi',
      })
    }

    // Validasi semester value
    if (semester !== '1' && semester !== '2') {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter semester harus 1 atau 2',
      })
    }

    const tahunAjaranId = parseInt(tahun_ajaran_id)

    // Call service with optional bulan parameter
    const data = await absensiService.getDetailService(siswaId, tahunAjaranId, semester, bulan)

    if (!data || !data.absensi || data.absensi.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data absensi tidak ditemukan untuk periode yang dipilih',
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'Detail absensi berhasil diambil',
      data: data,
    })
  } catch (error) {
    console.error('Error in getDetail:', error)
    next(error)
  }
}

export default {
  getTahunAjaran,
  getSemester,
  getBulan,
  getSummary,
  getDetail,
}
