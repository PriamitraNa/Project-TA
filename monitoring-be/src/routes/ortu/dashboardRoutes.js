import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { 
  getProfileAnak,
  getAbsensiHariIni,
  getCatatanTerbaru,
  getNilaiPerMapel
} from '../../controllers/ortu/dashboardController.js';

const router = Router();

// Apply authentication middleware
router.use(authMiddleware);

/**
 * GET /api/ortu/dashboard/profile-anak
 * Get profile anak dan nilai rata-rata semester aktif
 */
router.get('/profile-anak', getProfileAnak);

/**
 * GET /api/ortu/dashboard/absensi-hari-ini
 * Get status absensi anak untuk hari ini
 */
router.get('/absensi-hari-ini', getAbsensiHariIni);

/**
 * GET /api/ortu/dashboard/catatan-terbaru
 * Get catatan terbaru dari guru tentang anak
 * Query params: limit (optional, default: 5, max: 20)
 */
router.get('/catatan-terbaru', getCatatanTerbaru);

/**
 * GET /api/ortu/dashboard/nilai-per-mapel
 * Get nilai akhir per mata pelajaran untuk bar chart (semester aktif)
 */
router.get('/nilai-per-mapel', getNilaiPerMapel);

export default router;

