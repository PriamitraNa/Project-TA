import * as dashboardService from '../../services/ortu/dashboardService.js';

/**
 * Helper function to extract siswa_id from JWT token
 */
const getSiswaId = (req) => {
  return new Promise((resolve, reject) => {
    if (!req.user || !req.user.siswa_id) {
      return reject(new Error('Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua.'));
    }
    resolve(req.user.siswa_id);
  });
};

/**
 * GET /api/ortu/dashboard/profile-anak
 * Get profile anak dan nilai rata-rata semester aktif
 */
export const getProfileAnak = async (req, res, next) => {
  try {
    const siswaId = await getSiswaId(req);
    
    console.log('📥 GET /api/ortu/dashboard/profile-anak');
    console.log(' - req.user:', req.user);
    console.log(' - siswaId from getSiswaId():', siswaId);
    
    const profileData = await dashboardService.getProfileAnakService(siswaId);

    res.status(200).json({
      status: 'success',
      data: profileData
    });
  } catch (error) {
    console.error('❌ Error in getProfileAnak controller:', error.message);
    
    // Known errors
    if (error.message === 'Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Data siswa tidak ditemukan') {
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
 * GET /api/ortu/dashboard/absensi-hari-ini
 * Get status absensi anak untuk hari ini
 */
export const getAbsensiHariIni = async (req, res, next) => {
  try {
    const siswaId = await getSiswaId(req);
    
    console.log('📥 GET /api/ortu/dashboard/absensi-hari-ini');
    console.log(' - req.user:', req.user);
    console.log(' - siswaId from getSiswaId():', siswaId);
    
    const absensiData = await dashboardService.getAbsensiHariIniService(siswaId);

    res.status(200).json({
      status: 'success',
      data: absensiData
    });
  } catch (error) {
    console.error('❌ Error in getAbsensiHariIni controller:', error.message);
    
    // Known errors
    if (error.message === 'Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua.') {
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
 * GET /api/ortu/dashboard/catatan-terbaru
 * Get catatan terbaru dari guru tentang anak
 */
export const getCatatanTerbaru = async (req, res, next) => {
  try {
    const siswaId = await getSiswaId(req);
    const { limit } = req.query;
    
    console.log('📥 GET /api/ortu/dashboard/catatan-terbaru');
    console.log(' - req.user:', req.user);
    console.log(' - req.query:', req.query);
    console.log(' - siswaId from getSiswaId():', siswaId);
    
    const catatanData = await dashboardService.getCatatanTerbaruService(siswaId, limit);

    res.status(200).json({
      status: 'success',
      data: catatanData
    });
  } catch (error) {
    console.error('❌ Error in getCatatanTerbaru controller:', error.message);
    
    // Known errors
    if (error.message === 'Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Limit harus antara 1-20') {
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
 * GET /api/ortu/dashboard/nilai-per-mapel
 * Get nilai akhir per mata pelajaran untuk bar chart
 */
export const getNilaiPerMapel = async (req, res, next) => {
  try {
    const siswaId = await getSiswaId(req);
    
    console.log('📥 GET /api/ortu/dashboard/nilai-per-mapel');
    console.log(' - req.user:', req.user);
    console.log(' - siswaId from getSiswaId():', siswaId);
    
    const nilaiData = await dashboardService.getNilaiPerMapelService(siswaId);

    res.status(200).json({
      status: 'success',
      data: nilaiData.data,
      semester: nilaiData.semester,
      tahun_ajaran: nilaiData.tahun_ajaran
    });
  } catch (error) {
    console.error('❌ Error in getNilaiPerMapel controller:', error.message);
    
    // Known errors
    if (error.message === 'Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    next(error);
  }
};

export default {
  getProfileAnak,
  getAbsensiHariIni,
  getCatatanTerbaru,
  getNilaiPerMapel
};

