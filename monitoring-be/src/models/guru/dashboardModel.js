import db from '../../config/db.js';

/**
 * Check if guru is wali kelas (return kelas_id if yes, null if not)
 */
export const checkIsWaliKelas = (guruId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT k.id as kelas_id, k.nama_kelas
      FROM kelas k
      JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE k.wali_kelas_id = ?
        AND ta.status = 'aktif'
      LIMIT 1
    `;

    db.query(query, [guruId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0] || null);
    });
  });
};

/**
 * Get statistik siswa untuk Wali Kelas (hanya kelasnya)
 */
export const getStatistikSiswaWaliKelas = (kelasId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(DISTINCT s.id) AS total_siswa,
        SUM(CASE WHEN s.jenis_kelamin = 'Laki-laki' THEN 1 ELSE 0 END) AS laki_laki,
        SUM(CASE WHEN s.jenis_kelamin = 'Perempuan' THEN 1 ELSE 0 END) AS perempuan
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      WHERE ks.kelas_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `;

    db.query(query, [kelasId], (error, results) => {
      if (error) {
        return reject(error);
      }
      
      const stats = results[0] || { total_siswa: 0, laki_laki: 0, perempuan: 0 };
      
      resolve({
        total_siswa: parseInt(stats.total_siswa) || 0,
        laki_laki: parseInt(stats.laki_laki) || 0,
        perempuan: parseInt(stats.perempuan) || 0
      });
    });
  });
};

/**
 * Get statistik siswa untuk Guru Mapel (dari semua kelas yang diajar)
 */
export const getStatistikSiswaGuruMapel = (guruId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(DISTINCT s.id) AS total_siswa,
        SUM(CASE WHEN s.jenis_kelamin = 'Laki-laki' THEN 1 ELSE 0 END) AS laki_laki,
        SUM(CASE WHEN s.jenis_kelamin = 'Perempuan' THEN 1 ELSE 0 END) AS perempuan
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      JOIN kelas_mapel km ON ks.kelas_id = km.kelas_id
      WHERE km.guru_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `;

    db.query(query, [guruId], (error, results) => {
      if (error) {
        return reject(error);
      }
      
      const stats = results[0] || { total_siswa: 0, laki_laki: 0, perempuan: 0 };
      
      resolve({
        total_siswa: parseInt(stats.total_siswa) || 0,
        laki_laki: parseInt(stats.laki_laki) || 0,
        perempuan: parseInt(stats.perempuan) || 0
      });
    });
  });
};

/**
 * Get peringkat siswa berdasarkan rata-rata nilai (WALI KELAS ONLY)
 * Menampilkan SEMUA siswa (termasuk yang belum punya nilai)
 * Uses stored nilai_akhir from database (calculated by trigger)
 */
export const getPeringkatSiswa = (kelasId, page = 1, perPage = 10) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * perPage;
    
    const query = `
      SELECT 
        s.nama_lengkap AS nama,
        COALESCE(ROUND(AVG(n.nilai_akhir), 2), 0) AS nilai,
        k.nama_kelas AS kelas
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      JOIN kelas k ON ks.kelas_id = k.id
      LEFT JOIN nilai n ON s.id = n.siswa_id
        AND n.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
        AND n.nilai_akhir > 0
      WHERE ks.kelas_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      GROUP BY s.id, s.nama_lengkap, k.nama_kelas
      ORDER BY nilai DESC, s.nama_lengkap ASC
      LIMIT ? OFFSET ?
    `;

    // Query untuk total count (semua siswa di kelas)
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) AS total
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      WHERE ks.kelas_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `;

    // Execute count query first
    db.query(countQuery, [kelasId], (countError, countResults) => {
      if (countError) {
        return reject(countError);
      }

      const total = countResults[0]?.total || 0;
      const totalPages = Math.ceil(total / perPage);

      // Execute main query
      db.query(query, [kelasId, perPage, offset], (error, results) => {
        if (error) {
          return reject(error);
        }

        resolve({
          siswa: results || [],
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(perPage),
            total: total,
            total_pages: totalPages
          }
        });
      });
    });
  });
};

/**
 * Get mata pelajaran yang diampu GURU MAPEL (dengan kelas name)
 * Return satu row per kombinasi mapel + kelas
 */
export const getMataPelajaranGuruMapel = (guruId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        m.id AS mapel_id,
        m.nama_mapel,
        k.id AS kelas_id,
        k.nama_kelas
      FROM kelas_mapel km
      JOIN mapel m ON km.mapel_id = m.id
      JOIN kelas k ON km.kelas_id = k.id
      WHERE km.guru_id = ?
        AND km.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      ORDER BY m.nama_mapel ASC, k.nama_kelas ASC
    `;

    db.query(query, [guruId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results || []);
    });
  });
};

/**
 * Get semua mata pelajaran di kelas WALI KELAS
 */
export const getMataPelajaranWaliKelas = (kelasId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT
        m.id AS mapel_id,
        m.nama_mapel
      FROM kelas_mapel km
      JOIN mapel m ON km.mapel_id = m.id
      WHERE km.kelas_id = ?
        AND km.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      ORDER BY m.nama_mapel ASC
    `;

    db.query(query, [kelasId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results || []);
    });
  });
};

/**
 * Check apakah GURU MAPEL mengampu mata pelajaran tertentu
 */
export const checkGuruMengampuMapel = (guruId, mapelId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) AS count
      FROM kelas_mapel
      WHERE guru_id = ?
        AND mapel_id = ?
        AND tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `;

    db.query(query, [guruId, mapelId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0].count > 0);
    });
  });
};

/**
 * Check apakah WALI KELAS punya mapel tertentu di kelasnya
 */
export const checkWaliKelasHasMapel = (kelasId, mapelId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) AS count
      FROM kelas_mapel
      WHERE kelas_id = ?
        AND mapel_id = ?
        AND tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `;

    db.query(query, [kelasId, mapelId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0].count > 0);
    });
  });
};

/**
 * Get info mata pelajaran by ID
 */
export const getMapelById = (mapelId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, nama_mapel FROM mapel WHERE id = ?';

    db.query(query, [mapelId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0] || null);
    });
  });
};

/**
 * Get nilai siswa per mata pelajaran GURU MAPEL (dari kelas yang dia ajar)
 * Menampilkan SEMUA siswa (termasuk yang nilainya 0)
 * Uses stored nilai_akhir from database (calculated by trigger)
 */
export const getNilaiPerMapelGuruMapel = (guruId, mapelId, page = 1, perPage = 10) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * perPage;
    
    const query = `
      SELECT 
        s.nama_lengkap AS nama,
        COALESCE(ROUND(n.nilai_akhir, 2), 0) AS nilai
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      JOIN kelas_mapel km ON ks.kelas_id = km.kelas_id
      LEFT JOIN nilai n ON s.id = n.siswa_id
        AND n.mapel_id = ?
        AND n.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      WHERE km.guru_id = ?
        AND km.mapel_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
        AND km.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      ORDER BY nilai DESC, s.nama_lengkap ASC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT s.id) AS total
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      JOIN kelas_mapel km ON ks.kelas_id = km.kelas_id
      WHERE km.guru_id = ?
        AND km.mapel_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
        AND km.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `;

    db.query(countQuery, [guruId, mapelId], (countError, countResults) => {
      if (countError) {
        return reject(countError);
      }

      const total = countResults[0].total || 0;
      const totalPages = Math.ceil(total / perPage);

      db.query(query, [mapelId, guruId, mapelId, perPage, offset], (error, results) => {
        if (error) {
          return reject(error);
        }

        resolve({
          siswa: results || [],
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(perPage),
            total: total,
            total_pages: totalPages
          }
        });
      });
    });
  });
};

/**
 * Get nilai siswa per mata pelajaran WALI KELAS (semua siswa di kelasnya)
 * Menampilkan SEMUA siswa (termasuk yang nilainya 0)
 * Uses stored nilai_akhir from database (calculated by trigger)
 */
export const getNilaiPerMapelWaliKelas = (kelasId, mapelId, page = 1, perPage = 10) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * perPage;
    
    const query = `
      SELECT 
        s.nama_lengkap AS nama,
        COALESCE(ROUND(n.nilai_akhir, 2), 0) AS nilai
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      LEFT JOIN nilai n ON s.id = n.siswa_id 
        AND n.mapel_id = ?
        AND n.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      WHERE ks.kelas_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      ORDER BY nilai DESC, s.nama_lengkap ASC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT s.id) AS total
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      WHERE ks.kelas_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `;

    db.query(countQuery, [kelasId], (countError, countResults) => {
      if (countError) {
        return reject(countError);
      }

      const total = countResults[0].total || 0;
      const totalPages = Math.ceil(total / perPage);

      db.query(query, [mapelId, kelasId, perPage, offset], (error, results) => {
        if (error) {
          return reject(error);
        }

        resolve({
          siswa: results || [],
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(perPage),
            total: total,
            total_pages: totalPages
          }
        });
      });
    });
  });
};

/**
 * Get kehadiran siswa hari ini untuk WALI KELAS
 */
export const getKehadiranHariIniWaliKelas = (kelasId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        CURDATE() as tanggal,
        k.nama_kelas as kelas,
        COUNT(DISTINCT ks.siswa_id) as total_siswa,
        SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
        SUM(CASE WHEN a.status = 'Sakit' THEN 1 ELSE 0 END) as sakit,
        SUM(CASE WHEN a.status = 'Izin' THEN 1 ELSE 0 END) as izin,
        SUM(CASE WHEN a.status = 'Alpha' THEN 1 ELSE 0 END) as alpha
      FROM kelas_siswa ks
      JOIN kelas k ON ks.kelas_id = k.id
      LEFT JOIN absensi a ON ks.siswa_id = a.siswa_id 
        AND ks.kelas_id = a.kelas_id
        AND a.tanggal = CURDATE()
      WHERE ks.kelas_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      GROUP BY k.nama_kelas
    `;

    db.query(query, [kelasId], (error, results) => {
      if (error) {
        return reject(error);
      }

      if (!results || results.length === 0) {
        return resolve({
          tanggal: new Date(),
          kelas: null,
          total_siswa: 0,
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0
        });
      }

      resolve(results[0]);
    });
  });
};

/**
 * Get kehadiran siswa hari ini untuk GURU MAPEL (per kelas)
 */
export const getKehadiranHariIniGuruMapel = (kelasId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        CURDATE() as tanggal,
        k.nama_kelas as kelas,
        COUNT(DISTINCT ks.siswa_id) as total_siswa,
        SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
        SUM(CASE WHEN a.status = 'Sakit' THEN 1 ELSE 0 END) as sakit,
        SUM(CASE WHEN a.status = 'Izin' THEN 1 ELSE 0 END) as izin,
        SUM(CASE WHEN a.status = 'Alpha' THEN 1 ELSE 0 END) as alpha
      FROM kelas_siswa ks
      JOIN kelas k ON ks.kelas_id = k.id
      LEFT JOIN absensi a ON ks.siswa_id = a.siswa_id 
        AND ks.kelas_id = a.kelas_id
        AND a.tanggal = CURDATE()
      WHERE ks.kelas_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      GROUP BY k.nama_kelas
    `;

    db.query(query, [kelasId], (error, results) => {
      if (error) {
        return reject(error);
      }

      if (!results || results.length === 0) {
        return resolve({
          tanggal: new Date(),
          kelas: null,
          total_siswa: 0,
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0
        });
      }

      resolve(results[0]);
    });
  });
};

/**
 * Get daftar kelas yang diajar GURU MAPEL (untuk dropdown kehadiran)
 */
export const getKelasListGuruMapel = (guruId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT
        k.id as kelas_id,
        k.nama_kelas
      FROM kelas_mapel km
      JOIN kelas k ON km.kelas_id = k.id
      WHERE km.guru_id = ?
        AND km.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      ORDER BY k.nama_kelas ASC
    `;

    db.query(query, [guruId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results || []);
    });
  });
};

/**
 * Check apakah GURU MAPEL mengajar di kelas tertentu
 */
export const checkGuruMengajarDiKelas = (guruId, kelasId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) AS count
      FROM kelas_mapel
      WHERE guru_id = ?
        AND kelas_id = ?
        AND tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    `;

    db.query(query, [guruId, kelasId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0].count > 0);
    });
  });
};

/**
 * Get catatan terbaru GURU MAPEL (hanya yang dia buat)
 * @param {Number} guruId - ID guru
 * @param {Number} limit - Jumlah catatan (default: 6)
 * @returns {Promise<Array>} Array catatan terbaru
 */
export const getCatatanTerbaruGuruMapel = (guruId, limit = 6) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        ch.id,
        s.nama_lengkap AS nama_siswa,
        k.nama_kelas AS kelas,
        cd.pesan AS catatan,
        ch.created_at
      FROM catatan_header ch
      INNER JOIN siswa s ON ch.siswa_id = s.id
      INNER JOIN kelas k ON ch.kelas_id = k.id
      INNER JOIN catatan_detail cd ON ch.id = cd.header_id
      WHERE ch.guru_id = ?
        AND cd.id = (
          SELECT MIN(id) 
          FROM catatan_detail 
          WHERE header_id = ch.id
        )
      ORDER BY ch.created_at DESC
      LIMIT ?
    `;

    db.query(query, [guruId, limit], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results || []);
    });
  });
};

/**
 * Get catatan terbaru WALI KELAS (semua catatan di kelasnya)
 * @param {Number} kelasId - ID kelas
 * @param {Number} limit - Jumlah catatan (default: 6)
 * @returns {Promise<Array>} Array catatan terbaru
 */
export const getCatatanTerbaruWaliKelas = (kelasId, limit = 6) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        ch.id,
        s.nama_lengkap AS nama_siswa,
        k.nama_kelas AS kelas,
        g.nama_lengkap AS nama_guru,
        cd.pesan AS catatan,
        ch.created_at
      FROM catatan_header ch
      INNER JOIN siswa s ON ch.siswa_id = s.id
      INNER JOIN kelas k ON ch.kelas_id = k.id
      INNER JOIN guru g ON ch.guru_id = g.id
      INNER JOIN catatan_detail cd ON ch.id = cd.header_id
      WHERE ch.kelas_id = ?
        AND cd.id = (
          SELECT MIN(id) 
          FROM catatan_detail 
          WHERE header_id = ch.id
        )
      ORDER BY ch.created_at DESC
      LIMIT ?
    `;

    db.query(query, [kelasId, limit], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results || []);
    });
  });
};

export default {
  checkIsWaliKelas,
  getStatistikSiswaWaliKelas,
  getStatistikSiswaGuruMapel,
  getPeringkatSiswa,
  getMataPelajaranGuruMapel,
  getMataPelajaranWaliKelas,
  checkGuruMengampuMapel,
  checkWaliKelasHasMapel,
  getMapelById,
  getNilaiPerMapelGuruMapel,
  getNilaiPerMapelWaliKelas,
  getKehadiranHariIniWaliKelas,
  getKehadiranHariIniGuruMapel,
  getKelasListGuruMapel,
  checkGuruMengajarDiKelas,
  getCatatanTerbaruGuruMapel,
  getCatatanTerbaruWaliKelas
};

