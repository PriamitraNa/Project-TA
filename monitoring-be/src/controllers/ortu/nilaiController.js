import nilaiService from '../../services/ortu/nilaiService.js'

/**
 * Helper function to extract siswa_id from JWT token
 */
const getSiswaId = async (req) => {
  if (!req.user || !req.user.siswa_id) {
    throw new Error('Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua.');
  }
  return req.user.siswa_id;
};

/**
 * GET /api/ortu/nilai/tahun-ajaran
 * Get daftar tahun ajaran yang pernah diikuti siswa
 * Authorization: Bearer token (ortu login)
 */
export const getTahunAjaran = async (req, res, next) => {
  try {
    const siswaId = await getSiswaId(req);

    const data = await nilaiService.getTahunAjaranService(siswaId)

    res.status(200).json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error in getTahunAjaran:', error.message);
    
    if (error.message === 'Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    next(error)
  }
}

/**
 * GET /api/ortu/nilai/semester
 * Get daftar semester berdasarkan tahun ajaran untuk siswa
 * Authorization: Bearer token (ortu login)
 * Query: tahun_ajaran_id (required)
 */
export const getSemester = async (req, res, next) => {
  try {
    const siswaId = await getSiswaId(req);
    const { tahun_ajaran_id } = req.query

    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: 'error',
        message: 'tahun_ajaran_id wajib diisi',
        data: null,
      })
    }

    const data = await nilaiService.getSemesterService(siswaId, tahun_ajaran_id)

    res.status(200).json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error in getSemester:', error.message);
    
    if (error.message === 'Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    next(error)
  }
}

/**
 * GET /api/ortu/nilai
 * Get nilai detail siswa dengan statistik
 * Authorization: Bearer token (ortu login)
 * Query: tahun_ajaran_id (required), semester (required)
 */
export const getNilaiDetail = async (req, res, next) => {
  try {
    const siswaId = await getSiswaId(req);
    const { tahun_ajaran_id, semester } = req.query

    // Validate tahun_ajaran_id
    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: 'error',
        message: 'tahun_ajaran_id wajib diisi',
        data: null,
      })
    }

    // Validate semester
    if (!semester) {
      return res.status(400).json({
        status: 'error',
        message: 'semester wajib diisi',
        data: null,
      })
    }

    if (semester !== 'Ganjil' && semester !== 'Genap') {
      return res.status(400).json({
        status: 'error',
        message: 'semester harus "Ganjil" atau "Genap"',
        data: null,
      })
    }

    const data = await nilaiService.getNilaiDetailService(siswaId, tahun_ajaran_id, semester)

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data nilai tidak ditemukan untuk periode ini',
      })
    }

    res.status(200).json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error in getNilaiDetail:', error.message);
    
    if (error.message === 'Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    next(error)
  }
}

export default {
  getTahunAjaran,
  getSemester,
  getNilaiDetail,
}
