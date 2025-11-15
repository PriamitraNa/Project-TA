import dashboardModel from '../../models/admin/dashboardModel.js';

/**
 * Get summary statistics
 * Returns total guru, siswa, orangtua from master data
 */
export const getSummaryService = async () => {
  try {
    const statistics = await dashboardModel.getSummaryStatistics();
    
    return {
      total_guru: statistics.total_guru || 0,
      total_siswa: statistics.total_siswa || 0,
      total_orangtua: statistics.total_orangtua || 0
    };
  } catch (error) {
    console.error('Error in getSummaryService:', error);
    throw new Error('Gagal mengambil data statistik dashboard');
  }
};

/**
 * Get siswa gender distribution
 * Returns laki-laki, perempuan, and total count
 */
export const getSiswaGenderService = async () => {
  try {
    const genderData = await dashboardModel.getSiswaGenderDistribution();
    
    return {
      laki_laki: genderData.laki_laki || 0,
      perempuan: genderData.perempuan || 0,
      total: genderData.total || 0
    };
  } catch (error) {
    console.error('Error in getSiswaGenderService:', error);
    throw new Error('Gagal mengambil data distribusi gender siswa');
  }
};

/**
 * Get siswa per kelas for active tahun ajaran
 * Returns array of { kelas, jumlah }
 * Returns empty array if no active tahun ajaran
 */
export const getSiswaPerKelasService = async () => {
  try {
    const kelasData = await dashboardModel.getSiswaPerKelas();
    
    // Return empty array if no active tahun ajaran
    if (!kelasData || kelasData.length === 0) {
      return [];
    }
    
    // Convert BigInt to Number for JSON serialization
    return kelasData.map(kelas => ({
      kelas: kelas.kelas,
      jumlah: Number(kelas.jumlah)
    }));
  } catch (error) {
    console.error('Error in getSiswaPerKelasService:', error);
    throw new Error('Gagal mengambil data siswa per kelas');
  }
};

export default {
  getSummaryService,
  getSiswaGenderService,
  getSiswaPerKelasService
};

