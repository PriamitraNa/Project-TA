import dashboardService from '../../services/guru/dashboardService.js';

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
 * GET /api/guru/dashboard/statistik-siswa
 * Get statistik siswa yang diampu guru (total, laki-laki, perempuan)
 */
export const getStatistikSiswa = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    
    console.log('📥 GET /api/guru/dashboard/statistik-siswa');
    console.log(' - req.user:', req.user);
    console.log(' - guruId from getGuruId():', guruId);
    
    const statistik = await dashboardService.getStatistikSiswaService(guruId);

    res.status(200).json({
      status: 'success',
      data: statistik
    });
  } catch (error) {
    console.error('❌ Error in getStatistikSiswa controller:', error.message);
    
    // Known errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    next(error);
  }
};

/**
 * GET /api/guru/dashboard/peringkat-siswa
 * Get peringkat siswa berdasarkan rata-rata nilai dengan pagination
 */
export const getPeringkatSiswa = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { page, per_page } = req.query;
    
    console.log('📥 GET /api/guru/dashboard/peringkat-siswa');
    console.log(' - req.user:', req.user);
    console.log(' - req.query:', req.query);
    console.log(' - guruId from getGuruId():', guruId);
    
    const peringkat = await dashboardService.getPeringkatSiswaService(guruId, page, per_page);

    res.status(200).json({
      status: 'success',
      data: peringkat
    });
  } catch (error) {
    console.error('❌ Error in getPeringkatSiswa controller:', error.message);
    
    // Known errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Page harus lebih besar dari 0' || 
        error.message === 'Per page harus antara 1-100') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Fitur Peringkat Siswa hanya tersedia untuk Wali Kelas') {
      return res.status(403).json({
        status: 'error',
        message: error.message,
        code: 403
      });
    }
    
    next(error);
  }
};

/**
 * GET /api/guru/dashboard/mata-pelajaran
 * Get mata pelajaran yang diampu guru untuk dropdown filter
 */
export const getMataPelajaran = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    
    console.log('📥 GET /api/guru/dashboard/mata-pelajaran');
    console.log(' - req.user:', req.user);
    console.log(' - guruId from getGuruId():', guruId);
    
    const mapelList = await dashboardService.getMataPelajaranService(guruId);

    res.status(200).json({
      status: 'success',
      data: mapelList
    });
  } catch (error) {
    console.error('❌ Error in getMataPelajaran controller:', error.message);
    
    // Known errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Anda tidak mengampu mata pelajaran apapun') {
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
 * GET /api/guru/dashboard/nilai-per-mapel
 * Get nilai siswa untuk mata pelajaran tertentu dengan pagination
 */
export const getNilaiPerMapel = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { mapel_id, page, per_page } = req.query;
    
    console.log('📥 GET /api/guru/dashboard/nilai-per-mapel');
    console.log(' - req.user:', req.user);
    console.log(' - req.query:', req.query);
    console.log(' - guruId from getGuruId():', guruId);
    
    const nilaiData = await dashboardService.getNilaiPerMapelService(guruId, mapel_id, page, per_page);

    res.status(200).json({
      status: 'success',
      data: nilaiData
    });
  } catch (error) {
    console.error('❌ Error in getNilaiPerMapel controller:', error.message);
    
    // Known errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Parameter mapel_id wajib diisi' ||
        error.message === 'Parameter mapel_id harus berupa angka positif' ||
        error.message === 'Page harus lebih besar dari 0' ||
        error.message === 'Per page harus antara 1-100') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Anda tidak mengampu mata pelajaran ini' ||
        error.message === 'Mata pelajaran tidak ada di kelas Anda') {
      return res.status(403).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Mata pelajaran tidak ditemukan') {
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
 * GET /api/guru/dashboard/kehadiran-kelas
 * Get daftar kelas untuk dropdown (guru mapel) atau info kelas (wali kelas)
 */
export const getKehadiranKelas = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    
    console.log('📥 GET /api/guru/dashboard/kehadiran-kelas');
    console.log(' - req.user:', req.user);
    console.log(' - guruId from getGuruId():', guruId);
    
    const kelasData = await dashboardService.getKehadiranKelasService(guruId);

    res.status(200).json({
      status: 'success',
      data: kelasData
    });
  } catch (error) {
    console.error('❌ Error in getKehadiranKelas controller:', error.message);
    
    // Known errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    next(error);
  }
};

/**
 * GET /api/guru/dashboard/kehadiran-hari-ini
 * Get kehadiran siswa hari ini (pie chart)
 * Query params: kelas_id (optional for wali kelas, required for guru mapel)
 */
export const getKehadiranHariIni = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { kelas_id } = req.query;
    
    console.log('📥 GET /api/guru/dashboard/kehadiran-hari-ini');
    console.log(' - req.user:', req.user);
    console.log(' - req.query:', req.query);
    console.log(' - guruId from getGuruId():', guruId);
    
    const kehadiranData = await dashboardService.getKehadiranHariIniService(guruId, kelas_id);

    res.status(200).json({
      status: 'success',
      data: kehadiranData
    });
  } catch (error) {
    console.error('❌ Error in getKehadiranHariIni controller:', error.message);
    
    // Known errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Parameter kelas_id wajib diisi untuk Guru Mapel' ||
        error.message === 'Parameter kelas_id harus berupa angka positif') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Anda tidak mengajar di kelas ini') {
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
 * GET /api/guru/dashboard/catatan-terbaru
 * Get catatan terbaru yang dibuat guru (read-only summary)
 */
export const getCatatanTerbaru = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { limit } = req.query;
    
    console.log('📥 GET /api/guru/dashboard/catatan-terbaru');
    console.log(' - req.user:', req.user);
    console.log(' - req.query:', req.query);
    console.log(' - guruId from getGuruId():', guruId);
    
    const catatanData = await dashboardService.getCatatanTerbaruService(guruId, limit);

    res.status(200).json({
      status: 'success',
      data: catatanData
    });
  } catch (error) {
    console.error('❌ Error in getCatatanTerbaru controller:', error.message);
    
    // Known errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Limit harus antara 1-50') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    next(error);
  }
};

export default {
  getStatistikSiswa,
  getPeringkatSiswa,
  getMataPelajaran,
  getNilaiPerMapel,
  getKehadiranKelas,
  getKehadiranHariIni,
  getCatatanTerbaru
};

