import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import {
  getCatatanList,
  getCatatanStatistik,
  getKelasDropdown,
  getSiswaDropdown,
  getMapelDropdown,
  createCatatan,
  getCatatanDetail,
  addCatatanReply,
  getCatatanForEdit,
  updateCatatan,
  deleteCatatan
} from '../../controllers/guru/catatanController.js';

const router = Router();

// Apply authentication middleware
router.use(authMiddleware);

/**
 * GET /api/guru/catatan/statistik
 * Get statistik catatan (untuk summary cards)
 * Response: { total, positif, negatif, netral }
 */
router.get('/statistik', getCatatanStatistik);

/**
 * GET /api/guru/catatan/kelas
 * Get daftar kelas yang diampu guru (untuk dropdown)
 * Response: [{ kelas_id, nama_kelas, total_siswa }]
 */
router.get('/kelas', getKelasDropdown);

/**
 * GET /api/guru/catatan/siswa
 * Get daftar siswa berdasarkan kelas (untuk dropdown)
 * Query params: kelas_id (required)
 * Response: [{ siswa_id, nama_lengkap, nisn, kelas }]
 */
router.get('/siswa', getSiswaDropdown);

/**
 * GET /api/guru/catatan/mata-pelajaran
 * Get daftar mata pelajaran yang diampu guru di kelas tertentu (untuk dropdown)
 * Query params: kelas_id (required)
 * Response: [{ mapel_id, nama_mapel }]
 * UPDATED: Cascading dropdown - filter by kelas_id
 */
router.get('/mata-pelajaran', getMapelDropdown);

/**
 * POST /api/guru/catatan
 * Create catatan baru
 * Body: { siswa_id, kelas_id, kategori, jenis, isi_catatan, mapel_id? }
 */
router.post('/', createCatatan);

/**
 * POST /api/guru/catatan/:id/reply
 * Add reply/balasan to catatan
 * Params: id (catatan_id)
 * Body: { pesan }
 */
router.post('/:id/reply', addCatatanReply);

/**
 * GET /api/guru/catatan/:id/edit
 * Get catatan data for edit form
 * Params: id (catatan_id)
 * Returns: { id, siswa_id, kategori, jenis, kelas_id, mapel_id, isi_catatan, can_edit }
 */
router.get('/:id/edit', getCatatanForEdit);

/**
 * PUT /api/guru/catatan/:id
 * Update catatan (15-minute time limit)
 * Params: id (catatan_id)
 * Body: { kategori, jenis, kelas_id, isi_catatan, mapel_id? }
 */
router.put('/:id', updateCatatan);

/**
 * DELETE /api/guru/catatan/:id
 * Delete catatan (15-minute time limit)
 * Params: id (catatan_id)
 */
router.delete('/:id', deleteCatatan);

/**
 * GET /api/guru/catatan/:id
 * Get detail catatan dengan semua replies/diskusi
 * Params: id (catatan_id)
 * Auto-update status "Terkirim" → "Dibaca" jika diakses oleh orangtua
 */
router.get('/:id', getCatatanDetail);

/**
 * GET /api/guru/catatan
 * Get daftar catatan dengan pagination, filter, dan search
 * Query params:
 *   - page (optional): number, default 1
 *   - per_page (optional): number, default 10
 *   - search (optional): string (search by siswa nama or isi catatan)
 *   - kategori (optional): Positif, Negatif, Netral
 *   - jenis (optional): Akademik, Perilaku, Kehadiran, Prestasi, Lainnya
 *   - sort_by (optional): tanggal, siswa_nama, kelas, kategori, jenis, status
 *   - sort_order (optional): asc, desc
 */
router.get('/', getCatatanList);

export default router;

