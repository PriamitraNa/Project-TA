import laporanService from '../../services/admin/laporanService.js';

/**
 * GET /api/admin/laporan/siswa
 * Get daftar siswa yang sudah memiliki data nilai
 * Query params: kelas_id, tahun_ajaran_id, search
 */
export const getDaftarSiswa = async (req, res, next) => {
  try {
    const { kelas_id, tahun_ajaran_id, search } = req.query;
    
    const data = await laporanService.getDaftarSiswaService({
      kelas_id: kelas_id ? parseInt(kelas_id) : null,
      tahun_ajaran_id: tahun_ajaran_id ? parseInt(tahun_ajaran_id) : null,
      search: search || null
    });
    
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/laporan/transkrip/:siswa_id
 * Get transkrip nilai lengkap siswa (semua semester)
 */
export const getTranskripNilai = async (req, res, next) => {
  try {
    const { siswa_id } = req.params;
    
    if (!siswa_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter siswa_id wajib diisi',
        data: null
      });
    }
    
    const data = await laporanService.getTranskripNilaiService(parseInt(siswa_id));
    
    res.status(200).json({
      success: true,
      message: 'Transkrip nilai berhasil diambil',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/laporan/transkrip/:siswa_id/pdf
 * Download transkrip nilai dalam format PDF
 */
export const downloadTranskripPDF = async (req, res, next) => {
  try {
    const { siswa_id } = req.params;
    
    if (!siswa_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter siswa_id wajib diisi',
        data: null
      });
    }
    
    // Generate PDF (returns Buffer)
    const pdfBuffer = await laporanService.generateTranskripPDFService(parseInt(siswa_id));
    
    // Get siswa data for filename
    const transkripData = await laporanService.getTranskripNilaiService(parseInt(siswa_id));
    const siswaName = transkripData.siswa.nama.replace(/\s+/g, '_');
    const siswanis = transkripData.siswa.nisn;
    
    const filename = `Transkrip_${siswaName}_${siswanis}.pdf`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send buffer directly
    res.send(pdfBuffer);
    
  } catch (error) {
    // Handle specific errors
    if (error.message === 'Data siswa tidak ditemukan') {
      return res.status(404).json({
        success: false,
        message: 'Data transkrip tidak ditemukan'
      });
    }
    
    // Generic error
    return res.status(500).json({
      success: false,
      message: 'Gagal generate PDF',
      error: error.message
    });
  }
};

export default {
  getDaftarSiswa,
  getTranskripNilai,
  downloadTranskripPDF
};
