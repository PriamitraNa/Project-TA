import { Router } from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import {
  getDaftarSiswa,
  getTranskripNilai,
  downloadTranskripPDF,
  getTahunAjaranDropdown,
  getKelasDropdown,
  getSiswaDropdown,
  downloadBulkTranskrip,
} from '../../controllers/admin/laporanController.js'

const router = Router()

// All laporan routes require authentication
router.use(authMiddleware)

/**
 * GET /api/admin/laporan/tahun-ajaran
 * Get all tahun ajaran for dropdown
 */
router.get('/tahun-ajaran', getTahunAjaranDropdown)

/**
 * GET /api/admin/laporan/kelas
 * Get kelas by tahun ajaran for dropdown
 * Query params: tahun_ajaran_id (required)
 */
router.get('/kelas', getKelasDropdown)

/**
 * GET /api/admin/laporan/siswa-dropdown
 * Get siswa by kelas and tahun ajaran for dropdown
 * Query params: kelas_id (required), tahun_ajaran_id (required)
 */
router.get('/siswa-dropdown', getSiswaDropdown)

/**
 * GET /api/admin/laporan/siswa
 * Get daftar siswa yang sudah memiliki data nilai
 * Query params: kelas_id, tahun_ajaran_id, search
 */
router.get('/siswa', getDaftarSiswa)

/**
 * GET /api/admin/laporan/transkrip/:siswa_id
 * Get transkrip nilai lengkap siswa (semua semester)
 */
router.get('/transkrip/:siswa_id', getTranskripNilai)

/**
 * GET /api/admin/laporan/transkrip/:siswa_id/pdf
 * Download transkrip nilai dalam format PDF
 */
router.get('/transkrip/:siswa_id/pdf', downloadTranskripPDF)

/**
 * POST /api/admin/laporan/transkrip/bulk
 * Generate bulk transkrip for all siswa in a kelas (ZIP format)
 * Body: { kelas_id, tahun_ajaran_id }
 */
router.post('/transkrip/bulk', downloadBulkTranskrip)

export default router
