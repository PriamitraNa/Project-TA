import { Router } from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import {
  getStatistik,
  getCatatanList,
  getCatatanDetail,
  addCatatanReply,
} from '../../controllers/ortu/catatanController.js'

const router = Router()

// Apply authentication middleware
router.use(authMiddleware)

/**
 * GET /api/ortu/catatan/statistik
 * Get statistik catatan untuk siswa (cards summary)
 * No query params - auto filter by siswa_id from token
 */
router.get('/statistik', getStatistik)

/**
 * POST /api/ortu/catatan/:id/reply
 * Add reply to catatan
 * Body: { pesan: string }
 */
router.post('/:id/reply', addCatatanReply)

/**
 * GET /api/ortu/catatan/:id
 * Get detail catatan dengan semua replies
 * Auto mark as read when opened
 */
router.get('/:id', getCatatanDetail)

/**
 * GET /api/ortu/catatan
 * Get list catatan dengan pagination, filter, dan search
 * Query params: page, per_page, search, kategori, jenis, sort_by, sort_order
 */
router.get('/', getCatatanList)

export default router
