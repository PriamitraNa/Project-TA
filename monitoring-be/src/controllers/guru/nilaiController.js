import nilaiService from '../../services/guru/nilaiService.js';

/**
 * Helper: Get guru_id from JWT token
 */
const getGuruId = async (req) => {
  if (!req.user || !req.user.guru_id) {
    throw new Error('Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.');
  }
  return req.user.guru_id;
};

/**
 * GET /api/guru/nilai/kelas
 * Get daftar kelas yang diampu guru (Wali Kelas + Guru Mapel)
 */
export const getKelasDropdown = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    
    const kelasList = await nilaiService.getKelasDropdownService(guruId);

    res.status(200).json({
      status: 'success',
      data: kelasList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/guru/nilai/mata-pelajaran?kelas_id=17
 * Get daftar mata pelajaran yang diampu guru di kelas tertentu
 */
export const getMapelDropdown = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { kelas_id } = req.query;

    const mapelList = await nilaiService.getMapelDropdownService(guruId, kelas_id);

    res.status(200).json({
      status: 'success',
      data: mapelList
    });
  } catch (error) {
    // Handle specific validation errors
    if (error.message.includes('wajib diisi') || 
        error.message.includes('tidak mengampu')) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    next(error);
  }
};

/**
 * GET /api/guru/nilai/tahun-ajaran-aktif
 * Get info tahun ajaran dan semester yang sedang aktif
 */
export const getTahunAjaranAktif = async (req, res, next) => {
  try {
    const tahunAjaran = await nilaiService.getTahunAjaranAktifService();

    res.status(200).json({
      status: 'success',
      data: tahunAjaran
    });
  } catch (error) {
    // Handle specific error
    if (error.message.includes('Tidak ada tahun ajaran aktif')) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    next(error);
  }
};

/**
 * GET /api/guru/nilai/siswa?kelas_id=17&mapel_id=1
 * Get daftar siswa beserta nilai-nilai mereka
 */
export const getSiswaWithNilai = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { kelas_id, mapel_id, tahun_ajaran_id, semester } = req.query;

    const data = await nilaiService.getSiswaWithNilaiService(
      guruId, 
      kelas_id, 
      mapel_id,
      tahun_ajaran_id,
      semester
    );

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    // Handle specific errors
    if (error.message.includes('wajib diisi') ||
        error.message.includes('tidak memiliki akses') ||
        error.message.includes('Tidak ada siswa')) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    if (error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    next(error);
  }
};

/**
 * POST /api/guru/nilai/simpan-cell
 * Save single nilai cell (auto-save)
 */
export const simpanCell = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const userId = req.user.id;
    const data = req.body;

    const result = await nilaiService.simpanCellService(guruId, userId, data);

    res.status(200).json({
      status: 'success',
      message: 'Nilai berhasil disimpan',
      data: result
    });
  } catch (error) {
    // Handle specific errors
    if (error.message.includes('wajib diisi') ||
        error.message.includes('tidak valid') ||
        error.message.includes('harus antara') ||
        error.message.includes('harus \'Ganjil\'')) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    if (error.message.includes('tidak memiliki akses')) {
      return res.status(403).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    next(error);
  }
};

export default {
  getKelasDropdown,
  getMapelDropdown,
  getTahunAjaranAktif,
  getSiswaWithNilai,
  simpanCell
};

