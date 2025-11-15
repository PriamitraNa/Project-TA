import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { 
  getKelasWali, 
  getSiswaList, 
  getPerkembanganSiswa,
  downloadPDFPerkembangan
} from '../../controllers/guru/laporanController.js';

const router = Router();

// Apply authentication middleware
router.use(authMiddleware);

/**
 * GET /api/guru/laporan/kelas-wali
 * Get info kelas yang di-wali oleh guru (Only Wali Kelas)
 */
router.get('/kelas-wali', getKelasWali);

/**
 * GET /api/guru/laporan/siswa
 * Get list siswa in kelas wali (Only Wali Kelas)
 * Query params: kelas_id (required)
 */
router.get('/siswa', getSiswaList);

/**
 * GET /api/guru/laporan/perkembangan
 * Get data lengkap perkembangan siswa (nilai, absensi, catatan)
 * Query params: siswa_id (required)
 */
router.get('/perkembangan', getPerkembanganSiswa);

/**
 * POST /api/guru/laporan/download-perkembangan
 * Generate dan download PDF laporan perkembangan siswa
 * Body: { siswa_id, catatan_wali_kelas }
 */
router.post('/download-perkembangan', downloadPDFPerkembangan);

export default router;

