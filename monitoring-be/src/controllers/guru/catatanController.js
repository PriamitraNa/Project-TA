import catatanService from '../../services/guru/catatanService.js';

// Helper to get guru_id from request
const getGuruId = async (req) => {
  let guruId = req.user.guru_id;
  
  if (!guruId) {
    const db = (await import('../../config/db.js')).default;
    const [results] = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM guru WHERE user_id = ?', [req.user.id], (err, results) => {
        if (err) return reject(err);
        resolve([results]);
      });
    });
    
    if (!results || results.length === 0) {
      throw new Error('Guru ID tidak ditemukan. Pastikan Anda login sebagai guru');
    }
    
    guruId = results[0].id;
  }
  
  return guruId;
};

/**
 * GET /api/guru/catatan
 * Get daftar catatan dengan pagination, filter, dan search
 * Query params: page, per_page, search, kategori, jenis, sort_by, sort_order
 */
export const getCatatanList = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    
    const filters = {
      page: req.query.page,
      per_page: req.query.per_page,
      search: req.query.search,
      kategori: req.query.kategori,
      jenis: req.query.jenis,
      sort_by: req.query.sort_by,
      sort_order: req.query.sort_order
    };

    const data = await catatanService.getCatatanListService(guruId, filters);

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    if (error.message.includes('tidak valid') || 
        error.message.includes('harus')) {
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
 * GET /api/guru/catatan/kelas
 * Get daftar kelas yang diampu guru (untuk dropdown)
 */
export const getKelasDropdown = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    
    const data = await catatanService.getKelasDropdownService(guruId);

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    if (error.message === 'Anda tidak mengampu kelas apapun') {
      return res.status(403).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    next(error);
  }
};

/**
 * GET /api/guru/catatan/siswa
 * Get daftar siswa berdasarkan kelas (untuk dropdown)
 * Query params: kelas_id (required)
 */
export const getSiswaDropdown = async (req, res, next) => {
  try {
    const { kelas_id } = req.query;
    
    const data = await catatanService.getSiswaDropdownService(kelas_id);

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    if (error.message.includes('wajib') || 
        error.message.includes('tidak valid') ||
        error.message.includes('Tidak ada siswa')) {
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
 * GET /api/guru/catatan/mata-pelajaran
 * Get daftar mata pelajaran yang diampu guru di kelas tertentu (untuk dropdown)
 * Query params: kelas_id (required)
 * UPDATED: Cascading dropdown - filter by kelas_id
 */
export const getMapelDropdown = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { kelas_id } = req.query;
    
    const data = await catatanService.getMapelDropdownService(guruId, kelas_id);

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    if (error.message.includes('wajib') || 
        error.message.includes('tidak valid') ||
        error.message.includes('Tidak ada') ||
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
 * POST /api/guru/catatan
 * Create catatan baru
 */
export const createCatatan = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const userId = req.user.id; // User ID dari JWT token
    
    const data = await catatanService.createCatatanService(guruId, userId, req.body);

    res.status(201).json({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data
    });
  } catch (error) {
    if (error.message.includes('harus') || 
        error.message.includes('tidak valid') ||
        error.message.includes('minimal') ||
        error.message.includes('tidak ditemukan')) {
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
 * GET /api/guru/catatan/statistik
 * Get statistik catatan (untuk summary cards)
 */
export const getCatatanStatistik = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    
    const data = await catatanService.getCatatanStatistikService(guruId);

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/guru/catatan/:id
 * Get detail catatan dengan semua replies
 */
export const getCatatanDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const data = await catatanService.getCatatanDetailService(id, userId, userRole);

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
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
 * POST /api/guru/catatan/:id/reply
 * Add reply to catatan
 */
export const addCatatanReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const data = await catatanService.addCatatanReplyService(id, userId, req.body);

    res.status(201).json({
      status: 'success',
      message: data.message,
      data: data.catatan
    });
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    if (error.message.includes('harus') || 
        error.message.includes('tidak boleh kosong')) {
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
 * GET /api/guru/catatan/:id/edit
 * Get catatan data for edit form
 */
export const getCatatanForEdit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guruId = await getGuruId(req);
    
    const data = await catatanService.getCatatanForEditService(id, guruId);

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    if (error.message.includes('tidak ditemukan') || 
        error.message.includes('tidak memiliki akses')) {
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
 * PUT /api/guru/catatan/:id
 * Update catatan (with 15-minute time limit)
 */
export const updateCatatan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guruId = await getGuruId(req);
    
    const data = await catatanService.updateCatatanService(id, guruId, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Catatan berhasil diperbarui',
      data
    });
  } catch (error) {
    if (error.message.includes('tidak ditemukan') || 
        error.message.includes('tidak memiliki akses')) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    if (error.message.includes('Waktu edit sudah habis')) {
      return res.status(403).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    if (error.message.includes('harus') || 
        error.message.includes('tidak valid') ||
        error.message.includes('minimal')) {
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
 * DELETE /api/guru/catatan/:id
 * Delete catatan (with 15-minute time limit)
 */
export const deleteCatatan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guruId = await getGuruId(req);
    
    const data = await catatanService.deleteCatatanService(id, guruId);

    res.status(200).json({
      status: 'success',
      message: data.message,
      data: { catatan_id: data.catatan_id }
    });
  } catch (error) {
    if (error.message.includes('tidak ditemukan') || 
        error.message.includes('tidak memiliki akses')) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    if (error.message.includes('Waktu hapus sudah habis')) {
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
};

