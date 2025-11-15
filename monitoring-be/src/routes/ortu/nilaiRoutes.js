import { Router } from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import {
  getTahunAjaran,
  getSemester,
  getNilaiDetail,
} from '../../controllers/ortu/nilaiController.js'

const router = Router()

// Apply authentication middleware
router.use(authMiddleware)

/**
 * GET /api/ortu/nilai/tahun-ajaran
 * Get daftar tahun ajaran yang pernah diikuti siswa
 * Query params: none
 * Return: Array tahun ajaran (distinct, ordered DESC)
 */
router.get('/tahun-ajaran', getTahunAjaran)

/**
 * GET /api/ortu/nilai/semester
 * Get daftar semester berdasarkan tahun ajaran
 * Query params: tahun_ajaran_id (required)
 * Return: Array semester yang pernah diikuti (Ganjil, Genap)
 */
router.get('/semester', getSemester)

/**
 * GET /api/ortu/nilai
 * Get nilai detail siswa dengan statistik per mapel
 * Query params: tahun_ajaran_id (required), semester (required, "Ganjil" atau "Genap")
 * Return: { nilai: Array, statistik: Object }
 */
router.get('/', getNilaiDetail)

export default router
