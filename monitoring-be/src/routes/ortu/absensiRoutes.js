import { Router } from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import {
  getTahunAjaran,
  getSemester,
  getBulan,
  getSummary,
  getDetail,
} from '../../controllers/ortu/absensiController.js'

const router = Router()

// Apply authentication middleware
router.use(authMiddleware)

/**
 * GET /api/ortu/absensi/tahun-ajaran
 * Get daftar tahun ajaran yang relevan untuk orang tua
 * Return: Array tahun ajaran (aktif + history)
 */
router.get('/tahun-ajaran', getTahunAjaran)

/**
 * GET /api/ortu/absensi/semester
 * Get daftar semester berdasarkan tahun ajaran yang dipilih
 * Query: tahun_ajaran_id (required)
 * Return: Array semester dengan info status dan has_data
 */
router.get('/semester', getSemester)

/**
 * GET /api/ortu/absensi/bulan
 * Get daftar bulan berdasarkan semester yang dipilih
 * Query: tahun_ajaran_id (required), semester (required)
 * Return: Array bulan dalam rentang semester dengan info has_data
 */
router.get('/bulan', getBulan)

/**
 * GET /api/ortu/absensi/summary
 * Get summary kehadiran untuk cards (Hadir, Sakit, Izin, Alpha)
 * Query: tahun_ajaran_id (required), semester (required)
 * Return: Summary total per status untuk SELURUH semester
 */
router.get('/summary', getSummary)

/**
 * GET /api/ortu/absensi/detail
 * Get detail absensi untuk tabel (TERPENGARUH oleh filter bulan)
 * Query: tahun_ajaran_id (required), semester (required), bulan (optional)
 * Return: Array detail absensi dengan info guru dan kelas
 */
router.get('/detail', getDetail)

export default router
