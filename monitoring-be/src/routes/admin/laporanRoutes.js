import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import {
  getDaftarSiswa,
  getTranskripNilai,
  downloadTranskripPDF
} from '../../controllers/admin/laporanController.js';

const router = Router();

// All laporan routes require authentication
router.use(authMiddleware);

/**
 * GET /api/admin/laporan/siswa
 * Get daftar siswa yang sudah memiliki data nilai
 * Query params: kelas_id, tahun_ajaran_id, search
 */
router.get('/siswa', getDaftarSiswa);

/**
 * GET /api/admin/laporan/transkrip/:siswa_id
 * Get transkrip nilai lengkap siswa (semua semester)
 */
router.get('/transkrip/:siswa_id', getTranskripNilai);

/**
 * GET /api/admin/laporan/transkrip/:siswa_id/pdf
 * Download transkrip nilai dalam format PDF
 */
router.get('/transkrip/:siswa_id/pdf', downloadTranskripPDF);

export default router;
