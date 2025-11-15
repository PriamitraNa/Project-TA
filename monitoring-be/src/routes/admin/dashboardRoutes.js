import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import {
  getSummary,
  getSiswaGender,
  getSiswaPerKelas
} from '../../controllers/admin/dashboardController.js';

const router = Router();

// All dashboard routes require authentication
router.use(authMiddleware);

/**
 * GET /api/admin/dashboard/summary
 * Get summary statistics (total guru, siswa, orangtua)
 */
router.get('/summary', getSummary);

/**
 * GET /api/admin/dashboard/siswa-gender
 * Get siswa gender distribution for pie chart
 */
router.get('/siswa-gender', getSiswaGender);

/**
 * GET /api/admin/dashboard/siswa-per-kelas
 * Get siswa per kelas for active tahun ajaran (bar chart)
 */
router.get('/siswa-per-kelas', getSiswaPerKelas);

export default router;

