import laporanService from '../../services/guru/laporanService.js';

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
 * GET /api/guru/laporan/kelas-wali
 * Get kelas info for wali kelas
 */
export const getKelasWali = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    
    console.log('📥 GET /api/guru/laporan/kelas-wali');
    console.log(' - guruId:', guruId);
    
    const kelasInfo = await laporanService.getKelasWaliService(guruId);
    
    res.status(200).json({
      status: 'success',
      data: kelasInfo
    });
  } catch (error) {
    console.error('❌ Error in getKelasWali:', error.message);
    
    // Handle specific errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Anda tidak memiliki akses sebagai wali kelas') {
      return res.status(403).json({
        status: 'error',
        message: error.message,
        code: 403
      });
    }
    
    if (error.message === 'Anda belum ditugaskan sebagai wali kelas') {
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
 * GET /api/guru/laporan/siswa
 * Get list siswa in kelas wali
 */
export const getSiswaList = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { kelas_id } = req.query;
    
    console.log('📥 GET /api/guru/laporan/siswa');
    console.log(' - guruId:', guruId);
    console.log(' - kelas_id:', kelas_id);
    
    const siswaList = await laporanService.getSiswaListService(
      guruId, 
      kelas_id ? parseInt(kelas_id) : null
    );
    
    res.status(200).json({
      status: 'success',
      data: siswaList
    });
  } catch (error) {
    console.error('❌ Error in getSiswaList:', error.message);
    
    // Handle specific errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Parameter kelas_id wajib diisi') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Anda bukan wali kelas dari kelas ini') {
      return res.status(403).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Tidak ada siswa di kelas ini') {
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
 * GET /api/guru/laporan/perkembangan
 * Get data lengkap perkembangan siswa (nilai, absensi, catatan)
 */
export const getPerkembanganSiswa = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { siswa_id } = req.query;
    
    console.log('📥 GET /api/guru/laporan/perkembangan');
    console.log(' - guruId:', guruId);
    console.log(' - siswa_id:', siswa_id);
    
    const perkembangan = await laporanService.getPerkembanganSiswaService(
      guruId,
      siswa_id ? parseInt(siswa_id) : null
    );
    
    res.status(200).json({
      status: 'success',
      data: perkembangan
    });
  } catch (error) {
    console.error('❌ Error in getPerkembanganSiswa:', error.message);
    
    // Handle specific errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Parameter siswa_id wajib diisi') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Anda bukan wali kelas dari siswa ini') {
      return res.status(403).json({
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
 * POST /api/guru/laporan/download-perkembangan
 * Download PDF laporan perkembangan siswa
 */
export const downloadPDFPerkembangan = async (req, res, next) => {
  try {
    const guruId = await getGuruId(req);
    const { siswa_id, catatan_wali_kelas } = req.body;
    
    console.log('📥 POST /api/guru/laporan/download-perkembangan');
    console.log(' - guruId:', guruId);
    console.log(' - siswa_id:', siswa_id);
    console.log(' - catatan_wali_kelas:', catatan_wali_kelas);
    
    // Validation
    if (!siswa_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter siswa_id wajib diisi',
        data: null
      });
    }
    
    if (!catatan_wali_kelas || catatan_wali_kelas.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Catatan wali kelas wajib diisi',
        data: null
      });
    }
    
    // Generate PDF (returns Buffer)
    const pdfBuffer = await laporanService.generatePDFPerkembanganService(
      guruId, 
      parseInt(siswa_id), 
      catatan_wali_kelas
    );
    
    // Get siswa data for filename
    const perkembanganData = await laporanService.getPerkembanganSiswaService(guruId, parseInt(siswa_id));
    const siswaName = perkembanganData.siswa.nama.replace(/\s+/g, '_');
    const kelasName = perkembanganData.siswa.kelas.replace(/\s+/g, '_');
    
    const filename = `Laporan_Perkembangan_${siswaName}_${kelasName}.pdf`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send buffer directly
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error in downloadPDFPerkembangan:', error.message);
    
    // Known errors
    if (error.message === 'Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Anda bukan wali kelas dari siswa ini') {
      return res.status(403).json({
        status: 'error',
        message: error.message,
        data: null
      });
    }
    
    if (error.message === 'Parameter siswa_id wajib diisi' || 
        error.message === 'Siswa ID wajib diisi' ||
        error.message === 'Catatan wali kelas wajib diisi') {
      return res.status(400).json({
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

export default {
  getKelasWali,
  getSiswaList,
  getPerkembanganSiswa,
  downloadPDFPerkembangan
};

