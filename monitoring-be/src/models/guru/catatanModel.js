import db from '../../config/db.js';

/**
 * Get daftar catatan dengan pagination, filter, dan search
 */
export const getCatatanList = (guruId, filters) => {
  return new Promise((resolve, reject) => {
    const {
      page = 1,
      per_page = 10,
      search = '',
      kategori = '',
      jenis = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

    // Calculate offset
    const limit = parseInt(per_page);
    const offset = (parseInt(page) - 1) * limit;

    // Build WHERE clause
    let whereConditions = ['ch.guru_id = ?'];
    let queryParams = [guruId];

    // Search by siswa nama or isi catatan
    if (search) {
      whereConditions.push('(s.nama_lengkap LIKE ? OR cd.pesan LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Filter by kategori
    if (kategori) {
      whereConditions.push('ch.kategori = ?');
      queryParams.push(kategori);
    }

    // Filter by jenis
    if (jenis) {
      whereConditions.push('ch.jenis = ?');
      queryParams.push(jenis);
    }

    const whereClause = whereConditions.join(' AND ');

    // Determine sort column
    const sortColumns = {
      'tanggal': 'ch.created_at',
      'siswa_nama': 's.nama_lengkap',
      'kelas': 'k.nama_kelas',
      'kategori': 'ch.kategori',
      'jenis': 'ch.jenis',
      'status': 'ch.status'
    };
    const sortColumn = sortColumns[sort_by] || 'ch.created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query - Filter by tahun ajaran aktif
    const query = `
      SELECT 
        ch.id,
        DATE_FORMAT(ch.created_at, '%d/%m/%Y') as tanggal,
        ch.siswa_id,
        s.nama_lengkap as siswa_nama,
        ch.kelas_id,
        k.nama_kelas as kelas,
        ch.kategori,
        ch.jenis,
        m.nama_mapel as mata_pelajaran,
        (
          SELECT pesan 
          FROM catatan_detail 
          WHERE header_id = ch.id 
          ORDER BY id ASC 
          LIMIT 1
        ) as isi_catatan,
        ch.status,
        ch.created_at,
        TIMESTAMPDIFF(MINUTE, ch.created_at, NOW()) as minutes_passed
      FROM catatan_header ch
      JOIN siswa s ON ch.siswa_id = s.id
      JOIN kelas k ON ch.kelas_id = k.id
      JOIN kelas_siswa ks ON s.id = ks.siswa_id AND k.id = ks.kelas_id
      JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      LEFT JOIN mapel m ON ch.mapel_id = m.id
      LEFT JOIN catatan_detail cd ON ch.id = cd.header_id
      WHERE ${whereClause}
        AND ta.status = 'aktif'
      GROUP BY ch.id
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    db.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(error);
      }

      // Count total for pagination - Filter by tahun ajaran aktif
      const countQuery = `
        SELECT COUNT(DISTINCT ch.id) as total
        FROM catatan_header ch
        JOIN siswa s ON ch.siswa_id = s.id
        JOIN kelas k ON ch.kelas_id = k.id
        JOIN kelas_siswa ks ON s.id = ks.siswa_id AND k.id = ks.kelas_id
        JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
        LEFT JOIN catatan_detail cd ON ch.id = cd.header_id
        WHERE ${whereClause}
          AND ta.status = 'aktif'
      `;

      db.query(countQuery, queryParams.slice(0, -2), (countError, countResults) => {
        if (countError) {
          return reject(countError);
        }

        resolve({
          data: results,
          total: countResults[0].total
        });
      });
    });
  });
};

/**
 * Get daftar kelas yang diampu guru
 * Include: Wali Kelas + Guru Mapel (tahun ajaran aktif)
 */
export const getKelasByGuru = (guruId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT
        k.id as kelas_id,
        k.nama_kelas,
        (SELECT COUNT(*) FROM kelas_siswa ks WHERE ks.kelas_id = k.id AND ks.tahun_ajaran_id = ta.id) as total_siswa
      FROM kelas k
      JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE ta.status = 'aktif'
        AND (
          k.wali_kelas_id = ?
          OR EXISTS (
            SELECT 1 FROM kelas_mapel km 
            WHERE km.kelas_id = k.id 
              AND km.guru_id = ?
              AND km.tahun_ajaran_id = ta.id
          )
        )
      ORDER BY k.nama_kelas
    `;

    db.query(query, [guruId, guruId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

/**
 * Get daftar siswa berdasarkan kelas
 * Include: siswa_id, nama_lengkap, nisn, kelas
 */
export const getSiswaByKelas = (kelasId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        s.id as siswa_id,
        s.nama_lengkap,
        s.nisn,
        k.nama_kelas as kelas
      FROM kelas_siswa ks
      JOIN siswa s ON ks.siswa_id = s.id
      JOIN kelas k ON ks.kelas_id = k.id
      JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      WHERE ks.kelas_id = ?
        AND ta.status = 'aktif'
      ORDER BY s.nama_lengkap
    `;

    db.query(query, [kelasId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

/**
 * Get daftar mata pelajaran yang diampu guru di kelas tertentu
 * Include: mapel_id, nama_mapel
 * UPDATED: Filter by kelas_id (cascading dropdown)
 */
export const getMapelByGuruAndKelas = (guruId, kelasId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT
        m.id as mapel_id,
        m.nama_mapel
      FROM kelas_mapel km
      JOIN mapel m ON km.mapel_id = m.id
      JOIN tahun_ajaran ta ON km.tahun_ajaran_id = ta.id
      WHERE km.guru_id = ?
        AND km.kelas_id = ?
        AND ta.status = 'aktif'
      ORDER BY m.nama_mapel
    `;

    db.query(query, [guruId, kelasId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

/**
 * Create catatan baru
 * Insert ke catatan_header dan catatan_detail dalam 1 transaction
 */
export const createCatatan = (catatanData) => {
  return new Promise((resolve, reject) => {
    const {
      guru_id,
      user_id,      // User ID untuk pengirim_id (FK ke users.id)
      orangtua_id,
      siswa_id,
      kategori,
      jenis,
      kelas_id,
      mapel_id,
      isi_catatan
    } = catatanData;

    // Start transaction
    db.beginTransaction((err) => {
      if (err) {
        return reject(err);
      }

      // 1. Insert ke catatan_header
      const headerQuery = `
        INSERT INTO catatan_header 
        (guru_id, orangtua_id, siswa_id, kategori, jenis, kelas_id, mapel_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Terkirim', NOW(), NOW())
      `;

      db.query(headerQuery, [
        guru_id,
        orangtua_id,
        siswa_id,
        kategori,
        jenis,
        kelas_id,
        mapel_id
      ], (err, headerResult) => {
        if (err) {
          return db.rollback(() => reject(err));
        }

        const headerId = headerResult.insertId;

        // 2. Insert ke catatan_detail (isi catatan awal)
        // Note: pengirim_id menggunakan user_id, bukan guru_id
        const detailQuery = `
          INSERT INTO catatan_detail 
          (header_id, pengirim_id, pesan, created_at)
          VALUES (?, ?, ?, NOW())
        `;

        db.query(detailQuery, [headerId, user_id, isi_catatan], (err, detailResult) => {
          if (err) {
            return db.rollback(() => reject(err));
          }

          // Commit transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => reject(err));
            }

            resolve({
              header_id: headerId,
              detail_id: detailResult.insertId
            });
          });
        });
      });
    });
  });
};

/**
 * Get catatan by ID (untuk response after create)
 */
export const getCatatanById = (catatanId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        ch.id,
        ch.siswa_id,
        s.nama_lengkap as siswa_nama,
        ch.kategori,
        ch.jenis,
        ch.status,
        DATE_FORMAT(ch.created_at, '%d/%m/%Y') as tanggal,
        ch.created_at,
        cd.pesan as isi_catatan
      FROM catatan_header ch
      JOIN siswa s ON ch.siswa_id = s.id
      LEFT JOIN catatan_detail cd ON ch.id = cd.header_id
      WHERE ch.id = ?
      ORDER BY cd.created_at ASC
      LIMIT 1
    `;
    
    db.query(query, [catatanId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0] || null);
    });
  });
};

/**
 * Get orangtua_id by siswa_id
 * Note: Uses orangtua_siswa junction table (many-to-many relationship)
 */
export const getOrangtuaBySiswa = (siswaId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT orangtua_id 
      FROM orangtua_siswa 
      WHERE siswa_id = ?
      LIMIT 1
    `;
    
    db.query(query, [siswaId], (error, results) => {
      if (error) {
        return reject(error);
      }
      
      // Return orangtua_id or null if not found
      resolve(results[0]?.orangtua_id || null);
    });
  });
};

/**
 * Get statistik catatan (total, positif, negatif, netral)
 * Filter by tahun ajaran aktif
 */
export const getCatatanStatistik = (guruId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(DISTINCT ch.id) as total,
        SUM(CASE WHEN ch.kategori = 'Positif' THEN 1 ELSE 0 END) as positif,
        SUM(CASE WHEN ch.kategori = 'Negatif' THEN 1 ELSE 0 END) as negatif,
        SUM(CASE WHEN ch.kategori = 'Netral' THEN 1 ELSE 0 END) as netral
      FROM catatan_header ch
      JOIN kelas k ON ch.kelas_id = k.id
      JOIN kelas_siswa ks ON ch.siswa_id = ks.siswa_id AND ch.kelas_id = ks.kelas_id
      JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      WHERE ch.guru_id = ?
        AND ta.status = 'aktif'
    `;

    db.query(query, [guruId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0]);
    });
  });
};

/**
 * Get catatan detail dengan semua replies
 * For GET /api/guru/catatan/{id}
 */
export const getCatatanDetail = (catatanId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        ch.id,
        ch.guru_id,
        ch.orangtua_id,
        ch.siswa_id,
        s.nama_lengkap as siswa_nama,
        s.nisn,
        ch.kategori,
        ch.jenis,
        ch.kelas_id,
        k.nama_kelas,
        ch.mapel_id,
        m.nama_mapel,
        ch.status,
        IFNULL(DATE_FORMAT(ch.created_at, '%d/%m/%Y %H:%i'), 'N/A') as tanggal,
        ch.created_at as raw_created_at
      FROM catatan_header ch
      JOIN siswa s ON ch.siswa_id = s.id
      JOIN kelas k ON ch.kelas_id = k.id
      LEFT JOIN mapel m ON ch.mapel_id = m.id
      WHERE ch.id = ?
    `;

    db.query(query, [catatanId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0] || null);
    });
  });
};

/**
 * Get all replies/messages untuk catatan tertentu
 */
export const getCatatanReplies = (catatanId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        cd.id,
        cd.pengirim_id,
        u.nama_lengkap as pengirim_nama,
        u.role as pengirim_role,
        cd.pesan,
        DATE_FORMAT(cd.created_at, '%d/%m/%Y %H:%i') as tanggal,
        cd.created_at as raw_created_at
      FROM catatan_detail cd
      JOIN users u ON cd.pengirim_id = u.id
      WHERE cd.header_id = ?
      ORDER BY cd.created_at ASC
    `;

    db.query(query, [catatanId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

/**
 * Update status catatan menjadi "Dibaca"
 * Dipanggil ketika orangtua membuka catatan
 */
export const updateCatatanStatus = (catatanId) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE catatan_header 
      SET status = 'Dibaca', updated_at = NOW()
      WHERE id = ? AND status = 'Terkirim'
    `;

    db.query(query, [catatanId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results.affectedRows > 0);
    });
  });
};

/**
 * Verify catatan exists (untuk validation sebelum add reply)
 */
export const verifyCatatanExists = (catatanId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, guru_id, orangtua_id 
      FROM catatan_header 
      WHERE id = ?
    `;

    db.query(query, [catatanId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0] || null);
    });
  });
};

/**
 * Add reply to catatan
 * Insert new message into catatan_detail
 */
export const addCatatanReply = (catatanId, userId, pesan) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO catatan_detail 
      (header_id, pengirim_id, pesan, created_at)
      VALUES (?, ?, ?, NOW())
    `;

    db.query(query, [catatanId, userId, pesan], (error, results) => {
      if (error) {
        return reject(error);
      }
      
      // Update catatan_header.updated_at
      const updateHeaderQuery = `
        UPDATE catatan_header 
        SET updated_at = NOW() 
        WHERE id = ?
      `;
      
      db.query(updateHeaderQuery, [catatanId], (err) => {
        if (err) {
          return reject(err);
        }
        resolve({
          reply_id: results.insertId,
          catatan_id: catatanId
        });
      });
    });
  });
};

/**
 * Check if catatan can be edited/deleted (15-minute time limit)
 * Returns catatan data with time check
 */
export const getCatatanForEdit = (catatanId, guruId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        ch.id,
        ch.guru_id,
        ch.siswa_id,
        ch.kategori,
        ch.jenis,
        ch.kelas_id,
        ch.mapel_id,
        ch.created_at,
        cd.pesan as isi_catatan,
        TIMESTAMPDIFF(MINUTE, ch.created_at, NOW()) as minutes_elapsed
      FROM catatan_header ch
      JOIN catatan_detail cd ON ch.id = cd.header_id
      WHERE ch.id = ? AND ch.guru_id = ?
      ORDER BY cd.created_at ASC
      LIMIT 1
    `;

    db.query(query, [catatanId, guruId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0] || null);
    });
  });
};

/**
 * Update catatan (only first message in catatan_detail)
 */
export const updateCatatan = (catatanId, updateData) => {
  return new Promise((resolve, reject) => {
    const { kategori, jenis, kelas_id, mapel_id, isi_catatan } = updateData;

    // Start transaction
    db.beginTransaction((err) => {
      if (err) {
        return reject(err);
      }

      // 1. Update catatan_header
      const headerQuery = `
        UPDATE catatan_header 
        SET kategori = ?, jenis = ?, kelas_id = ?, mapel_id = ?, updated_at = NOW()
        WHERE id = ?
      `;

      db.query(headerQuery, [kategori, jenis, kelas_id, mapel_id, catatanId], (err) => {
        if (err) {
          return db.rollback(() => reject(err));
        }

        // 2. Update first message in catatan_detail (isi catatan awal)
        const detailQuery = `
          UPDATE catatan_detail 
          SET pesan = ?
          WHERE header_id = ?
          ORDER BY created_at ASC
          LIMIT 1
        `;

        db.query(detailQuery, [isi_catatan, catatanId], (err, results) => {
          if (err) {
            return db.rollback(() => reject(err));
          }

          // Commit transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => reject(err));
            }
            resolve({ catatan_id: catatanId, affected: results.affectedRows });
          });
        });
      });
    });
  });
};

/**
 * Delete catatan (cascade to catatan_detail via FK)
 */
export const deleteCatatan = (catatanId) => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM catatan_header 
      WHERE id = ?
    `;

    db.query(query, [catatanId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results.affectedRows > 0);
    });
  });
};

export default {
  getCatatanList,
  getCatatanStatistik,
  getKelasByGuru,
  getSiswaByKelas,
  getMapelByGuruAndKelas,
  createCatatan,
  getCatatanById,
  getOrangtuaBySiswa,
  getCatatanDetail,
  getCatatanReplies,
  updateCatatanStatus,
  verifyCatatanExists,
  addCatatanReply,
  getCatatanForEdit,
  updateCatatan,
  deleteCatatan
};

