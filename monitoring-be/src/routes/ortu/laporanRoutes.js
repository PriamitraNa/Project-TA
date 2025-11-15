import express from 'express'
import * as laporanController from '../../controllers/ortu/laporanController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Apply auth middleware: Must be ortu role
router.use(authMiddleware)

/**
 * GET /api/ortu/laporan/tahun-ajaran
 * Get list tahun ajaran untuk dropdown
 */
router.get('/tahun-ajaran', laporanController.getTahunAjaran)

/**
 * GET /api/ortu/laporan/semester
 * Get list semester untuk dropdown berdasarkan tahun ajaran
 * Query params: tahun_ajaran_id (required)
 * CRITICAL: Filter by siswa_id from JWT token!
 */
router.get('/semester', laporanController.getSemester)

/**
 * GET /api/ortu/laporan/nilai
 * Get nilai laporan anak berdasarkan tahun ajaran dan semester
 * Query params: tahun_ajaran_id (required), semester (required - 1 atau 2)
 * CRITICAL: Filter by siswa_id from JWT token!
 */
router.get('/nilai', laporanController.getNilaiLaporan)

/**
 * POST /api/ortu/laporan/download-pdf
 * Generate dan download PDF laporan nilai
 * Body: { tahun_ajaran_id, semester }
 * CRITICAL: Filter by siswa_id from JWT token!
 */
router.post('/download-pdf', laporanController.downloadPDF)

export default router
