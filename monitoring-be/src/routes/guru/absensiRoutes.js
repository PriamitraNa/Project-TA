import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import {
  getSiswaAbsensi,
  getKelasSaya,
  saveAbsensi,
  getRekapAbsensi,
  getDateRange
} from '../../controllers/guru/absensiController.js';

const router = Router();

// Apply authentication middleware
router.use(authMiddleware);

/**
 * GET /api/guru/absensi/date-range
 * Get valid date range untuk input absensi (dari tahun ajaran aktif)
 * Return: tanggal_mulai, tanggal_selesai, info tahun ajaran, today
 */
router.get('/date-range', getDateRange);

/**
 * GET /api/guru/absensi/kelas-saya
 * Get daftar kelas yang diampu guru (untuk dropdown)
 * Return: 1 kelas (wali kelas) atau multiple (guru mapel)
 */
router.get('/kelas-saya', getKelasSaya);

/**
 * GET /api/guru/absensi/siswa
 * Get daftar siswa dengan status absensi untuk tanggal tertentu
 * Support: Wali kelas & Guru mapel
 * Query params: 
 *   - tanggal (required): YYYY-MM-DD
 *   - kelas_id (optional untuk wali kelas, required untuk guru mapel)
 */
router.get('/siswa', getSiswaAbsensi);

/**
 * POST /api/guru/absensi/save
 * Save/update absensi siswa
 * Hanya untuk wali kelas
 * Body: { tanggal, absensi: [{ siswa_id, status }] }
 */
router.post('/save', saveAbsensi);

/**
 * GET /api/guru/absensi/rekap
 * Get rekap absensi untuk periode tertentu
 * Support: Wali kelas & Guru mapel
 * Query params:
 *   - tanggal_mulai (required): YYYY-MM-DD
 *   - tanggal_akhir (required): YYYY-MM-DD
 *   - kelas_id (optional untuk wali kelas, required untuk guru mapel)
 */
router.get('/rekap', getRekapAbsensi);

export default router;

