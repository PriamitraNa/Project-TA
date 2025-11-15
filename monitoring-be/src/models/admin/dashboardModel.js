import db from '../../config/db.js';

/**
 * Get summary statistics for dashboard
 * - Total Guru (all)
 * - Total Siswa (all)
 * - Total Orangtua (all)
 */
export const getSummaryStatistics = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM guru) as total_guru,
        (SELECT COUNT(*) FROM siswa) as total_siswa,
        (SELECT COUNT(*) FROM orangtua) as total_orangtua
    `;
    
    db.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0]);
    });
  });
};

/**
 * Get siswa gender distribution for pie chart
 * - Laki-laki count
 * - Perempuan count
 * - Total
 */
export const getSiswaGenderDistribution = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(CASE WHEN jenis_kelamin = 'Laki-laki' THEN 1 END) as laki_laki,
        COUNT(CASE WHEN jenis_kelamin = 'Perempuan' THEN 1 END) as perempuan,
        COUNT(*) as total
      FROM siswa
    `;
    
    db.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0]);
    });
  });
};

/**
 * Get siswa per kelas for active tahun ajaran (bar chart)
 * - Only kelas from active tahun_ajaran
 * - Include kelas with 0 students (LEFT JOIN)
 * - Return empty array if no active tahun_ajaran
 */
export const getSiswaPerKelas = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        k.nama_kelas as kelas,
        COALESCE(COUNT(ks.siswa_id), 0) as jumlah
      FROM kelas k
      LEFT JOIN kelas_siswa ks ON k.id = ks.kelas_id 
        AND ks.tahun_ajaran_id = (
          SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
        )
      WHERE k.tahun_ajaran_id = (
        SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
      )
      GROUP BY k.id, k.nama_kelas
      ORDER BY k.nama_kelas
    `;
    
    db.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

export default {
  getSummaryStatistics,
  getSiswaGenderDistribution,
  getSiswaPerKelas
};

