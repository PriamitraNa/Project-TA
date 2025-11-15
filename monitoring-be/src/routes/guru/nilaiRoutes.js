import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import {
  getKelasDropdown,
  getMapelDropdown,
  getTahunAjaranAktif,
  getSiswaWithNilai,
  simpanCell
} from '../../controllers/guru/nilaiController.js';

const router = Router();

// Apply authentication middleware
router.use(authMiddleware);

/**
 * GET /api/guru/nilai/kelas
 * Get daftar kelas yang diampu guru (Wali Kelas + Guru Mapel)
 * Filter by tahun ajaran aktif
 */
router.get('/kelas', getKelasDropdown);

/**
 * GET /api/guru/nilai/mata-pelajaran
 * Get daftar mata pelajaran yang diampu guru di kelas tertentu
 * Query params: kelas_id (required)
 */
router.get('/mata-pelajaran', getMapelDropdown);

/**
 * GET /api/guru/nilai/tahun-ajaran-aktif
 * Get info tahun ajaran dan semester yang sedang aktif
 */
router.get('/tahun-ajaran-aktif', getTahunAjaranAktif);

/**
 * GET /api/guru/nilai/siswa
 * Get daftar siswa beserta nilai-nilai mereka
 * Query params: kelas_id (required), mapel_id (required), tahun_ajaran_id (optional), semester (optional)
 */
router.get('/siswa', getSiswaWithNilai);

/**
 * POST /api/guru/nilai/simpan-cell
 * Save single nilai cell (auto-save)
 * Body: { siswa_id, kelas_id, mapel_id, tahun_ajaran_id, semester, field, nilai }
 */
router.post('/simpan-cell', simpanCell);

export default router;

