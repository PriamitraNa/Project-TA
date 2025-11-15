import dashboardService from '../../services/admin/dashboardService.js';

/**
 * GET /api/admin/dashboard/summary
 * Get summary statistics (total guru, siswa, orangtua)
 */
export const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummaryService();
    
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/siswa-gender
 * Get siswa gender distribution (pie chart data)
 */
export const getSiswaGender = async (req, res, next) => {
  try {
    const data = await dashboardService.getSiswaGenderService();
    
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/siswa-per-kelas
 * Get siswa per kelas for active tahun ajaran (bar chart data)
 */
export const getSiswaPerKelas = async (req, res, next) => {
  try {
    const data = await dashboardService.getSiswaPerKelasService();
    
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getSummary,
  getSiswaGender,
  getSiswaPerKelas
};

