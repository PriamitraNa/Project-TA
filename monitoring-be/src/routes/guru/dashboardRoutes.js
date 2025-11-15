import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { 
  getStatistikSiswa,
  getPeringkatSiswa,
  getMataPelajaran,
  getNilaiPerMapel,
  getKehadiranKelas,
  getKehadiranHariIni,
  getCatatanTerbaru
} from '../../controllers/guru/dashboardController.js';

const router = Router();

// Apply authentication middleware
router.use(authMiddleware);

/**
 * GET /api/guru/dashboard/statistik-siswa
 * Get statistik siswa yang diampu guru (total, laki-laki, perempuan)
 */
router.get('/statistik-siswa', getStatistikSiswa);

/**
 * GET /api/guru/dashboard/peringkat-siswa
 * Get peringkat siswa berdasarkan rata-rata nilai dengan pagination
 * Query params: page (default: 1), per_page (default: 10)
 */
router.get('/peringkat-siswa', getPeringkatSiswa);

/**
 * GET /api/guru/dashboard/mata-pelajaran
 * Get mata pelajaran yang diampu guru (untuk dropdown filter)
 */
router.get('/mata-pelajaran', getMataPelajaran);

/**
 * GET /api/guru/dashboard/nilai-per-mapel
 * Get nilai siswa untuk mata pelajaran tertentu dengan pagination
 * Query params: mapel_id (required), page (default: 1), per_page (default: 10)
 */
router.get('/nilai-per-mapel', getNilaiPerMapel);

/**
 * GET /api/guru/dashboard/kehadiran-kelas
 * Get daftar kelas untuk dropdown (guru mapel) atau info kelas (wali kelas)
 */
router.get('/kehadiran-kelas', getKehadiranKelas);

/**
 * GET /api/guru/dashboard/kehadiran-hari-ini
 * Get kehadiran siswa hari ini (pie chart)
 * Query params: kelas_id (optional for wali kelas, required for guru mapel)
 */
router.get('/kehadiran-hari-ini', getKehadiranHariIni);

/**
 * GET /api/guru/dashboard/catatan-terbaru
 * Get catatan terbaru yang dibuat guru (read-only summary)
 * Query params: limit (optional, default: 6, max: 50)
 */
router.get('/catatan-terbaru', getCatatanTerbaru);

export default router;

