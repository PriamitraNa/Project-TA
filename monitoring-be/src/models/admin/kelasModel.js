import db from "../../config/db.js";

// Get dropdown tahun ajaran dan tahun ajaran aktif dalam satu response
export const getTahunajaranKelasGuru = () => {
  return new Promise((resolve, reject) => {
    // Query untuk semua tahun ajaran
    const tahunAjaranQuery = `
      SELECT 
        id,
        tahun,
        semester,
        status,
        CONCAT(tahun, ' - ', semester) as label_tahun_ajaran
      FROM tahun_ajaran
      ORDER BY tahun DESC, 
        CASE 
          WHEN semester = 'Ganjil' THEN 1 
          WHEN semester = 'Genap' THEN 2 
          ELSE 3 
        END
    `;
    
    // Query untuk tahun ajaran aktif
    const tahunAjaranAktifQuery = `
      SELECT 
        id,
        tahun,
        semester,
        status,
        CONCAT(tahun, ' - ', semester) as label_tahun_ajaran
      FROM tahun_ajaran
      WHERE status = 'aktif'
      ORDER BY id DESC
      LIMIT 1
    `;
    
    // Execute kedua query secara bersamaan
    db.query(tahunAjaranQuery, (err1, tahunAjaranResults) => {
      if (err1) return reject(err1);
      
      db.query(tahunAjaranAktifQuery, (err2, tahunAjaranAktifResults) => {
        if (err2) return reject(err2);
        
        resolve({
          tahunAjaranList: tahunAjaranResults,
          tahunAjaranAktif: tahunAjaranAktifResults.length > 0 ? tahunAjaranAktifResults[0] : null
        });
      });
    });
  });
};

// Get daftar kelas dengan filter dan pagination
export const getDaftarKelas = (tahunAjaranId, page = 1, limit = 5) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    
    // Query untuk data kelas dengan pagination
    const kelasQuery = `
      SELECT 
        k.id,
        k.nama_kelas,
        g.id as wali_kelas_id,
        g.nama_lengkap as wali_kelas_nama,
        g.nip as wali_kelas_nip,
        ta.id as tahun_ajaran_id,
        ta.tahun,
        ta.semester,
        COUNT(DISTINCT ks.siswa_id) as jumlah_siswa,
        COUNT(DISTINCT km.mapel_id) as jumlah_mapel
      FROM kelas k
      LEFT JOIN guru g ON k.wali_kelas_id = g.id
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      LEFT JOIN kelas_siswa ks ON k.id = ks.kelas_id AND ks.tahun_ajaran_id = ta.id
      LEFT JOIN kelas_mapel km ON k.id = km.kelas_id AND km.tahun_ajaran_id = ta.id
      WHERE ta.id = ?
      GROUP BY k.id, k.nama_kelas, g.id, g.nama_lengkap, g.nip, ta.id, ta.tahun, ta.semester
      ORDER BY k.nama_kelas
      LIMIT ? OFFSET ?
    `;
    
    // Query untuk count total data
    const countQuery = `
      SELECT COUNT(DISTINCT k.id) as total
      FROM kelas k
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE ta.id = ?
    `;
    
    // Execute kedua query secara bersamaan
    db.query(kelasQuery, [tahunAjaranId, limit, offset], (err1, kelasResults) => {
      if (err1) return reject(err1);
      
      db.query(countQuery, [tahunAjaranId], (err2, countResults) => {
        if (err2) return reject(err2);
        
        const totalData = countResults[0].total;
        const totalPages = Math.ceil(totalData / limit);
        
        resolve({
          kelas: kelasResults,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_data: totalData,
            per_page: limit,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        });
      });
    });
  });
};

// Get dropdown kelas dengan filter untuk naik kelas
export const getDropdownKelas = (tahunAjaranId = null, excludeKelasId = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        k.id,
        k.nama_kelas,
        k.tahun_ajaran_id,
        ta.tahun,
        ta.semester,
        CONCAT(k.nama_kelas, ' (', ta.tahun, ' - ', ta.semester, ')') as label_kelas,
        COUNT(DISTINCT ks.siswa_id) as jumlah_siswa
      FROM kelas k
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      LEFT JOIN kelas_siswa ks ON k.id = ks.kelas_id AND ks.tahun_ajaran_id = ta.id
    `;
    
    const params = [];
    const conditions = [];
    
    // Filter berdasarkan tahun ajaran jika ada
    if (tahunAjaranId) {
      conditions.push('ta.id = ?');
      params.push(tahunAjaranId);
    }
    
    // Exclude kelas tertentu jika ada (untuk naik kelas - exclude kelas asal)
    if (excludeKelasId) {
      conditions.push('k.id != ?');
      params.push(excludeKelasId);
    }
    
    // Tambahkan WHERE clause jika ada kondisi
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += `
      GROUP BY k.id, k.nama_kelas, k.tahun_ajaran_id, ta.tahun, ta.semester
      ORDER BY k.nama_kelas
    `;
    
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get dropdown wali kelas (guru aktif yang belum menjadi wali kelas di tahun ajaran tertentu)
export const getDropdownWaliKelas = (tahunAjaranId = null, excludeKelasId = null) => {
  return new Promise((resolve, reject) => {
    let query, params;
    
    if (tahunAjaranId) {
      if (excludeKelasId) {
        // Filter guru yang belum menjadi wali kelas di tahun ajaran tertentu + guru yang sedang menjadi wali kelas di kelas yang diedit
        query = `
          SELECT 
            g.id,
            g.nama_lengkap,
            g.nip
          FROM guru g
          WHERE g.status = 'aktif'
          AND (
            g.id NOT IN (
              SELECT DISTINCT k.wali_kelas_id 
              FROM kelas k 
              WHERE k.tahun_ajaran_id = ? AND k.wali_kelas_id IS NOT NULL
            )
            OR g.id IN (
              SELECT k2.wali_kelas_id 
              FROM kelas k2 
              WHERE k2.id = ? AND k2.wali_kelas_id IS NOT NULL
            )
          )
          ORDER BY g.nama_lengkap ASC
        `;
        params = [tahunAjaranId, excludeKelasId];
      } else {
        // Filter guru yang belum menjadi wali kelas di tahun ajaran tertentu
        query = `
          SELECT 
            g.id,
            g.nama_lengkap,
            g.nip
          FROM guru g
          WHERE g.status = 'aktif'
          AND g.id NOT IN (
            SELECT DISTINCT k.wali_kelas_id 
            FROM kelas k 
            WHERE k.tahun_ajaran_id = ? AND k.wali_kelas_id IS NOT NULL
          )
          ORDER BY g.nama_lengkap ASC
        `;
        params = [tahunAjaranId];
      }
    } else {
      // Tampilkan semua guru aktif (fallback)
      query = `
        SELECT 
          id,
          nama_lengkap,
          nip
        FROM guru
        WHERE status = 'aktif'
        ORDER BY nama_lengkap ASC
      `;
      params = [];
    }
    
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get current selection tahun ajaran dan semester (untuk autofill)
export const getCurrentSelection = (tahunAjaranId = null) => {
  return new Promise((resolve, reject) => {
    let query, params;
    
    if (tahunAjaranId) {
      // Ambil data tahun ajaran yang dipilih user
      query = `
        SELECT 
          id,
          tahun,
          semester,
          status,
          CONCAT(tahun, ' - ', semester) as label_tahun_ajaran
        FROM tahun_ajaran
        WHERE id = ?
      `;
      params = [tahunAjaranId];
    } else {
      // Ambil tahun ajaran aktif (fallback)
      query = `
        SELECT 
          id,
          tahun,
          semester,
          status,
          CONCAT(tahun, ' - ', semester) as label_tahun_ajaran
        FROM tahun_ajaran
        WHERE status = 'aktif'
        ORDER BY id DESC
        LIMIT 1
      `;
      params = [];
    }
    
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};

// Tambah kelas baru
export const tambahKelas = (namaKelas, waliKelasId, tahunAjaranId) => {
  return new Promise((resolve, reject) => {
    // Validasi nama kelas unik per tahun ajaran
    const checkNamaKelasQuery = `
      SELECT id FROM kelas 
      WHERE nama_kelas = ? AND tahun_ajaran_id = ?
    `;
    
    // Validasi wali kelas unik per tahun ajaran (1 wali kelas = 1 kelas per tahun ajaran)
    const checkWaliKelasQuery = `
      SELECT id, nama_kelas FROM kelas 
      WHERE wali_kelas_id = ? AND tahun_ajaran_id = ?
    `;
    
    // Jalankan kedua validasi secara bersamaan
    db.query(checkNamaKelasQuery, [namaKelas, tahunAjaranId], (err1, namaKelasResults) => {
      if (err1) return reject(err1);
      
      db.query(checkWaliKelasQuery, [waliKelasId, tahunAjaranId], (err2, waliKelasResults) => {
        if (err2) return reject(err2);
        
        // Cek validasi nama kelas
        if (namaKelasResults.length > 0) {
          return reject(new Error('Nama kelas sudah ada untuk tahun ajaran ini'));
        }
        
        // Cek validasi wali kelas
        if (waliKelasResults.length > 0) {
          const existingKelas = waliKelasResults[0];
          return reject(new Error(`Guru ini sudah menjadi wali kelas untuk kelas "${existingKelas.nama_kelas}" pada tahun ajaran ini`));
        }
        
        // Insert kelas baru
        const insertQuery = `
          INSERT INTO kelas (nama_kelas, wali_kelas_id, tahun_ajaran_id)
          VALUES (?, ?, ?)
        `;
        
        db.query(insertQuery, [namaKelas, waliKelasId, tahunAjaranId], (err3, result) => {
          if (err3) return reject(err3);
          
          // Ambil data kelas yang baru dibuat
          const getQuery = `
            SELECT 
              k.id,
              k.nama_kelas,
              g.id as wali_kelas_id,
              g.nama_lengkap as wali_kelas_nama,
              g.nip as wali_kelas_nip,
              ta.id as tahun_ajaran_id,
              ta.tahun,
              ta.semester
            FROM kelas k
            LEFT JOIN guru g ON k.wali_kelas_id = g.id
            INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
            WHERE k.id = ?
          `;
          
          db.query(getQuery, [result.insertId], (err4, kelasData) => {
            if (err4) return reject(err4);
            resolve(kelasData[0]);
          });
        });
      });
    });
  });
};

// Get detail kelas untuk edit
export const getDetailKelas = (kelasId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        k.id,
        k.nama_kelas,
        g.id as wali_kelas_id,
        g.nama_lengkap as wali_kelas_nama,
        g.nip as wali_kelas_nip,
        ta.id as tahun_ajaran_id,
        ta.tahun,
        ta.semester,
        ta.status as status_tahun_ajaran
      FROM kelas k
      LEFT JOIN guru g ON k.wali_kelas_id = g.id
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE k.id = ?
    `;
    
    db.query(query, [kelasId], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};

// Update kelas
export const updateKelas = (kelasId, namaKelas, waliKelasId, tahunAjaranId) => {
  return new Promise((resolve, reject) => {
    // Validasi nama kelas unik per tahun ajaran (kecuali kelas yang sedang diedit)
    const checkNamaKelasQuery = `
      SELECT id FROM kelas 
      WHERE nama_kelas = ? AND tahun_ajaran_id = ? AND id != ?
    `;
    
    // Validasi wali kelas unik per tahun ajaran (kecuali kelas yang sedang diedit)
    const checkWaliKelasQuery = `
      SELECT id, nama_kelas FROM kelas 
      WHERE wali_kelas_id = ? AND tahun_ajaran_id = ? AND id != ?
    `;
    
    // Jalankan kedua validasi secara bersamaan
    db.query(checkNamaKelasQuery, [namaKelas, tahunAjaranId, kelasId], (err1, namaKelasResults) => {
      if (err1) return reject(err1);
      
      db.query(checkWaliKelasQuery, [waliKelasId, tahunAjaranId, kelasId], (err2, waliKelasResults) => {
        if (err2) return reject(err2);
        
        // Cek validasi nama kelas
        if (namaKelasResults.length > 0) {
          return reject(new Error('Nama kelas sudah ada untuk tahun ajaran ini'));
        }
        
        // Cek validasi wali kelas
        if (waliKelasResults.length > 0) {
          const existingKelas = waliKelasResults[0];
          return reject(new Error(`Guru ini sudah menjadi wali kelas untuk kelas "${existingKelas.nama_kelas}" pada tahun ajaran ini`));
        }
        
        // Update kelas
        const updateQuery = `
          UPDATE kelas 
          SET nama_kelas = ?, wali_kelas_id = ?, tahun_ajaran_id = ?
          WHERE id = ?
        `;
        
        db.query(updateQuery, [namaKelas, waliKelasId, tahunAjaranId, kelasId], (err3, result) => {
          if (err3) return reject(err3);
          
          if (result.affectedRows === 0) {
            return reject(new Error('Kelas tidak ditemukan'));
          }
          
          // Ambil data kelas yang sudah diupdate
          const getQuery = `
            SELECT 
              k.id,
              k.nama_kelas,
              g.id as wali_kelas_id,
              g.nama_lengkap as wali_kelas_nama,
              g.nip as wali_kelas_nip,
              ta.id as tahun_ajaran_id,
              ta.tahun,
              ta.semester
            FROM kelas k
            LEFT JOIN guru g ON k.wali_kelas_id = g.id
            INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
            WHERE k.id = ?
          `;
          
          db.query(getQuery, [kelasId], (err4, kelasData) => {
            if (err4) return reject(err4);
            resolve(kelasData[0]);
          });
        });
      });
    });
  });
};

// Get daftar siswa dalam kelas
export const getDaftarSiswaKelas = (kelasId, tahunAjaranId = null, page = 1, limit = 20) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    
    // Query untuk mendapatkan tahun ajaran dari kelas jika tidak disediakan
    let tahunAjaranQuery = '';
    let params = [];
    
    if (!tahunAjaranId) {
      tahunAjaranQuery = `
        SELECT tahun_ajaran_id FROM kelas WHERE id = ?
      `;
      params = [kelasId];
    }
    
    // Query utama untuk daftar siswa
    const siswaQuery = `
      SELECT 
        s.id,
        s.nama_lengkap,
        s.nisn,
        s.jenis_kelamin,
        ROW_NUMBER() OVER (ORDER BY s.nama_lengkap ASC) as no_urut
      FROM siswa s
      INNER JOIN kelas_siswa ks ON s.id = ks.siswa_id
      WHERE ks.kelas_id = ? AND ks.tahun_ajaran_id = ?
      ORDER BY s.nama_lengkap ASC
      LIMIT ? OFFSET ?
    `;
    
    // Query untuk total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM siswa s
      INNER JOIN kelas_siswa ks ON s.id = ks.siswa_id
      WHERE ks.kelas_id = ? AND ks.tahun_ajaran_id = ?
    `;
    
    if (!tahunAjaranId) {
      // Jika tahun ajaran tidak disediakan, ambil dari kelas
      db.query(tahunAjaranQuery, params, (err1, tahunAjaranResults) => {
        if (err1) return reject(err1);
        
        if (tahunAjaranResults.length === 0) {
          return reject(new Error('Kelas tidak ditemukan'));
        }
        
        const tahunAjaranIdFromKelas = tahunAjaranResults[0].tahun_ajaran_id;
        
        // Jalankan query siswa dan count secara bersamaan
        db.query(siswaQuery, [kelasId, tahunAjaranIdFromKelas, limit, offset], (err2, siswaResults) => {
          if (err2) return reject(err2);
          
          db.query(countQuery, [kelasId, tahunAjaranIdFromKelas], (err3, countResults) => {
            if (err3) return reject(err3);
            
            resolve({
              data: siswaResults,
              total: countResults[0].total,
              page: page,
              limit: limit,
              totalPages: Math.ceil(countResults[0].total / limit)
            });
          });
        });
      });
    } else {
      // Jika tahun ajaran disediakan, langsung jalankan query
      db.query(siswaQuery, [kelasId, tahunAjaranId, limit, offset], (err1, siswaResults) => {
        if (err1) return reject(err1);
        
        db.query(countQuery, [kelasId, tahunAjaranId], (err2, countResults) => {
          if (err2) return reject(err2);
          
          resolve({
            data: siswaResults,
            total: countResults[0].total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(countResults[0].total / limit)
          });
        });
      });
    }
  });
};

// Bulk tambah siswa ke kelas
export const bulkTambahSiswaKeKelas = (kelasId, siswaIds, tahunAjaranId) => {
  return new Promise((resolve, reject) => {
    // Validasi: Cek apakah kelas dan tahun ajaran valid
    const checkKelasQuery = `
      SELECT 
        k.id,
        k.nama_kelas,
        ta.tahun,
        ta.semester
      FROM kelas k
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE k.id = ? AND ta.id = ?
    `;
    
    // Validasi: Cek apakah semua siswa ada
    const checkSiswaExistsQuery = `
      SELECT id, nama_lengkap, nisn
      FROM siswa
      WHERE id IN (${siswaIds.map(() => '?').join(',')})
    `;
    
    // Validasi: Cek siswa yang sudah terdaftar di tahun ajaran
    const checkSiswaTerdaftarQuery = `
      SELECT 
        ks.siswa_id,
        s.nama_lengkap,
        k.nama_kelas,
        ta.tahun,
        ta.semester
      FROM kelas_siswa ks
      INNER JOIN siswa s ON ks.siswa_id = s.id
      INNER JOIN kelas k ON ks.kelas_id = k.id
      INNER JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      WHERE ks.siswa_id IN (${siswaIds.map(() => '?').join(',')}) 
      AND ks.tahun_ajaran_id = ?
    `;
    
    // Jalankan validasi secara berurutan
    db.query(checkKelasQuery, [kelasId, tahunAjaranId], (err1, kelasResults) => {
      if (err1) return reject(err1);
      
      if (kelasResults.length === 0) {
        return reject(new Error('Kelas atau tahun ajaran tidak ditemukan'));
      }
      
      db.query(checkSiswaExistsQuery, siswaIds, (err2, siswaResults) => {
        if (err2) return reject(err2);
        
        if (siswaResults.length !== siswaIds.length) {
          const foundIds = siswaResults.map(s => s.id);
          const notFoundIds = siswaIds.filter(id => !foundIds.includes(id));
          return reject(new Error(`Siswa dengan ID ${notFoundIds.join(', ')} tidak ditemukan`));
        }
        
        db.query(checkSiswaTerdaftarQuery, [...siswaIds, tahunAjaranId], (err3, terdaftarResults) => {
          if (err3) return reject(err3);
          
          if (terdaftarResults.length > 0) {
            const terdaftarInfo = terdaftarResults.map(r => 
              `${r.nama_lengkap} (sudah di ${r.nama_kelas} ${r.tahun} ${r.semester})`
            ).join(', ');
            return reject(new Error(`Siswa berikut sudah terdaftar: ${terdaftarInfo}`));
          }
          
          // Mulai transaction untuk bulk insert
          db.beginTransaction((err4) => {
            if (err4) return reject(err4);
            
            // Prepare bulk insert query
            const insertValues = siswaIds.map(id => [kelasId, id, tahunAjaranId]);
            const insertQuery = `
              INSERT INTO kelas_siswa (kelas_id, siswa_id, tahun_ajaran_id)
              VALUES ?
            `;
            
            db.query(insertQuery, [insertValues], (err5, result) => {
              if (err5) {
                return db.rollback(() => {
                  reject(err5);
                });
              }
              
              // Ambil data lengkap setelah insert
              const getQuery = `
                SELECT 
                  ks.id,
                  s.id as siswa_id,
                  s.nama_lengkap as siswa_nama,
                  s.nisn as siswa_nisn,
                  s.jenis_kelamin as siswa_jenis_kelamin,
                  k.id as kelas_id,
                  k.nama_kelas,
                  ta.id as tahun_ajaran_id,
                  ta.tahun,
                  ta.semester
                FROM kelas_siswa ks
                INNER JOIN siswa s ON ks.siswa_id = s.id
                INNER JOIN kelas k ON ks.kelas_id = k.id
                INNER JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
                WHERE ks.id IN (${Array(result.affectedRows).fill('?').join(',')})
              `;
              
              const insertedIds = Array.from({length: result.affectedRows}, (_, i) => result.insertId + i);
              
              db.query(getQuery, insertedIds, (err6, finalResults) => {
                if (err6) {
                  return db.rollback(() => {
                    reject(err6);
                  });
                }
                
                // Commit transaction
                db.commit((err7) => {
                  if (err7) {
                    return db.rollback(() => {
                      reject(err7);
                    });
                  }
                  
                  resolve({
                    success: finalResults,
                    failed: [],
                    summary: {
                      total: siswaIds.length,
                      success: finalResults.length,
                      failed: 0
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// Hapus siswa dari kelas
export const hapusSiswaDariKelas = (kelasId, siswaId, tahunAjaranId) => {
  return new Promise((resolve, reject) => {
    // Validasi: Cek apakah siswa ada di kelas tersebut
    const checkSiswaQuery = `
      SELECT 
        ks.id,
        s.nama_lengkap,
        s.nisn,
        k.nama_kelas,
        ta.tahun,
        ta.semester
      FROM kelas_siswa ks
      INNER JOIN siswa s ON ks.siswa_id = s.id
      INNER JOIN kelas k ON ks.kelas_id = k.id
      INNER JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      WHERE ks.kelas_id = ? AND ks.siswa_id = ? AND ks.tahun_ajaran_id = ?
    `;
    
    // Validasi: Cek apakah kelas dan tahun ajaran valid
    const checkKelasQuery = `
      SELECT 
        k.id,
        k.nama_kelas,
        ta.tahun,
        ta.semester
      FROM kelas k
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE k.id = ? AND ta.id = ?
    `;
    
    // Validasi: Cek apakah siswa ada
    const checkSiswaExistsQuery = `
      SELECT id, nama_lengkap, nisn
      FROM siswa
      WHERE id = ?
    `;
    
    // Jalankan validasi secara berurutan
    db.query(checkSiswaExistsQuery, [siswaId], (err1, siswaResults) => {
      if (err1) return reject(err1);
      
      if (siswaResults.length === 0) {
        return reject(new Error('Siswa tidak ditemukan'));
      }
      
      db.query(checkKelasQuery, [kelasId, tahunAjaranId], (err2, kelasResults) => {
        if (err2) return reject(err2);
        
        if (kelasResults.length === 0) {
          return reject(new Error('Kelas atau tahun ajaran tidak ditemukan'));
        }
        
        db.query(checkSiswaQuery, [kelasId, siswaId, tahunAjaranId], (err3, existingSiswaResults) => {
          if (err3) return reject(err3);
          
          if (existingSiswaResults.length === 0) {
            return reject(new Error('Siswa tidak ditemukan di kelas ini'));
          }
          
          // Simpan data siswa sebelum dihapus untuk response
          const siswaData = existingSiswaResults[0];
          
          // Hapus siswa dari kelas
          const deleteQuery = `
            DELETE FROM kelas_siswa 
            WHERE kelas_id = ? AND siswa_id = ? AND tahun_ajaran_id = ?
          `;
          
          db.query(deleteQuery, [kelasId, siswaId, tahunAjaranId], (err4, result) => {
            if (err4) return reject(err4);
            
            if (result.affectedRows === 0) {
              return reject(new Error('Gagal menghapus siswa dari kelas'));
            }
            
            // Return data siswa yang sudah dihapus
            resolve({
              id: siswaData.id,
              siswa_id: siswaId,
              siswa_nama: siswaData.nama_lengkap,
              siswa_nisn: siswaData.nisn,
              kelas_id: kelasId,
              nama_kelas: siswaData.nama_kelas,
              tahun_ajaran_id: tahunAjaranId,
              tahun: siswaData.tahun,
              semester: siswaData.semester,
              message: `Siswa ${siswaData.nama_lengkap} berhasil dihapus dari ${siswaData.nama_kelas}`
            });
          });
        });
      });
    });
  });
};

// Tambah siswa ke kelas
export const tambahSiswaKeKelas = (kelasId, siswaId, tahunAjaranId) => {
  return new Promise((resolve, reject) => {
    // Validasi: Cek apakah siswa sudah terdaftar di kelas lain di tahun ajaran yang sama
    const checkSiswaQuery = `
      SELECT 
        ks.id,
        k.nama_kelas,
        ta.tahun,
        ta.semester
      FROM kelas_siswa ks
      INNER JOIN kelas k ON ks.kelas_id = k.id
      INNER JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      WHERE ks.siswa_id = ? AND ks.tahun_ajaran_id = ?
    `;
    
    // Validasi: Cek apakah kelas dan tahun ajaran valid
    const checkKelasQuery = `
      SELECT 
        k.id,
        k.nama_kelas,
        ta.tahun,
        ta.semester
      FROM kelas k
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE k.id = ? AND ta.id = ?
    `;
    
    // Validasi: Cek apakah siswa ada
    const checkSiswaExistsQuery = `
      SELECT id, nama_lengkap, nisn
      FROM siswa
      WHERE id = ?
    `;
    
    // Jalankan validasi secara berurutan
    db.query(checkSiswaExistsQuery, [siswaId], (err1, siswaResults) => {
      if (err1) return reject(err1);
      
      if (siswaResults.length === 0) {
        return reject(new Error('Siswa tidak ditemukan'));
      }
      
      db.query(checkKelasQuery, [kelasId, tahunAjaranId], (err2, kelasResults) => {
        if (err2) return reject(err2);
        
        if (kelasResults.length === 0) {
          return reject(new Error('Kelas atau tahun ajaran tidak ditemukan'));
        }
        
        db.query(checkSiswaQuery, [siswaId, tahunAjaranId], (err3, existingSiswaResults) => {
          if (err3) return reject(err3);
          
          if (existingSiswaResults.length > 0) {
            const existingKelas = existingSiswaResults[0];
            return reject(new Error(`Siswa sudah terdaftar di kelas "${existingKelas.nama_kelas}" pada tahun ajaran ${existingKelas.tahun} ${existingKelas.semester}`));
          }
          
          // Jika semua validasi berhasil, tambahkan siswa ke kelas
          const insertQuery = `
            INSERT INTO kelas_siswa (kelas_id, siswa_id, tahun_ajaran_id)
            VALUES (?, ?, ?)
          `;
          
          db.query(insertQuery, [kelasId, siswaId, tahunAjaranId], (err4, result) => {
            if (err4) return reject(err4);
            
            // Ambil data lengkap setelah insert
            const getQuery = `
              SELECT 
                ks.id,
                s.id as siswa_id,
                s.nama_lengkap as siswa_nama,
                s.nisn as siswa_nisn,
                s.jenis_kelamin as siswa_jenis_kelamin,
                k.id as kelas_id,
                k.nama_kelas,
                ta.id as tahun_ajaran_id,
                ta.tahun,
                ta.semester
              FROM kelas_siswa ks
              INNER JOIN siswa s ON ks.siswa_id = s.id
              INNER JOIN kelas k ON ks.kelas_id = k.id
              INNER JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
              WHERE ks.id = ?
            `;
            
            db.query(getQuery, [result.insertId], (err5, finalResults) => {
              if (err5) return reject(err5);
              resolve(finalResults[0]);
            });
          });
        });
      });
    });
  });
};

// Search siswa yang belum terdaftar di tahun ajaran
export const searchSiswa = (query, tahunAjaranId, limit = 20) => {
  return new Promise((resolve, reject) => {
    const searchQuery = `
      SELECT 
        s.id,
        s.nama_lengkap,
        s.nisn,
        s.jenis_kelamin
      FROM siswa s
      WHERE (s.nama_lengkap LIKE ? OR s.nisn LIKE ?)
      AND s.id NOT IN (
        SELECT ks.siswa_id 
        FROM kelas_siswa ks 
        WHERE ks.tahun_ajaran_id = ?
      )
      ORDER BY s.nama_lengkap ASC
      LIMIT ?
    `;
    
    const searchPattern = `%${query}%`;
    const params = [searchPattern, searchPattern, tahunAjaranId, limit];
    
    db.query(searchQuery, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get available siswa yang belum terdaftar di tahun ajaran
export const getAvailableSiswa = (tahunAjaranId, page = 1, limit = 50) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    
    // Query untuk data siswa
    const siswaQuery = `
      SELECT 
        s.id,
        s.nama_lengkap,
        s.nisn,
        s.jenis_kelamin
      FROM siswa s
      WHERE s.id NOT IN (
        SELECT ks.siswa_id 
        FROM kelas_siswa ks 
        WHERE ks.tahun_ajaran_id = ?
      )
      ORDER BY s.nama_lengkap ASC
      LIMIT ? OFFSET ?
    `;
    
    // Query untuk total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM siswa s
      WHERE s.id NOT IN (
        SELECT ks.siswa_id 
        FROM kelas_siswa ks 
        WHERE ks.tahun_ajaran_id = ?
      )
    `;
    
    // Jalankan query siswa dan count secara bersamaan
    db.query(siswaQuery, [tahunAjaranId, limit, offset], (err1, siswaResults) => {
      if (err1) return reject(err1);
      
      db.query(countQuery, [tahunAjaranId], (err2, countResults) => {
        if (err2) return reject(err2);
        
        resolve({
          data: siswaResults,
          total: countResults[0].total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(countResults[0].total / limit)
        });
      });
    });
  });
};

// Get info kelas untuk header
export const getInfoKelas = (kelasId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        k.id,
        k.nama_kelas,
        g.id as wali_kelas_id,
        g.nama_lengkap as wali_kelas_nama,
        g.nip as wali_kelas_nip,
        ta.id as tahun_ajaran_id,
        ta.tahun,
        ta.semester,
        ta.status as status_tahun_ajaran,
        (SELECT COUNT(*) FROM kelas_siswa ks WHERE ks.kelas_id = k.id) as jumlah_siswa,
        (SELECT COUNT(*) FROM kelas_mapel km WHERE km.kelas_id = k.id) as jumlah_mata_pelajaran
      FROM kelas k
      LEFT JOIN guru g ON k.wali_kelas_id = g.id
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE k.id = ?
    `;
    
    db.query(query, [kelasId], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};

// Get info naik kelas (kelas asal + tahun ajaran tujuan yang benar)
export const getNaikKelasInfo = (kelasId) => {
  return new Promise((resolve, reject) => {
    // Query untuk ambil info kelas asal
    const kelasAsalQuery = `
      SELECT 
        k.id,
        k.nama_kelas,
        ta.id as tahun_ajaran_id,
        ta.tahun,
        ta.semester,
        COUNT(DISTINCT ks.siswa_id) as total_siswa
      FROM kelas k
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      LEFT JOIN kelas_siswa ks ON k.id = ks.kelas_id AND ks.tahun_ajaran_id = ta.id
      WHERE k.id = ?
      GROUP BY k.id, k.nama_kelas, ta.id, ta.tahun, ta.semester
    `;
    
    db.query(kelasAsalQuery, [kelasId], (err, kelasResults) => {
      if (err) return reject(err);
      
      if (kelasResults.length === 0) {
        return reject(new Error('Kelas tidak ditemukan'));
      }
      
      const kelasAsal = kelasResults[0];
      
      // Hitung tahun ajaran tujuan berdasarkan logika semester
      let tahunTujuan, semesterTujuan;
      
      if (kelasAsal.semester === 'Ganjil') {
        // Jika semester Ganjil, tujuan adalah Genap di tahun yang sama
        tahunTujuan = kelasAsal.tahun;
        semesterTujuan = 'Genap';
      } else {
        // Jika semester Genap, tujuan adalah Ganjil di tahun berikutnya
        const [tahunMulai, tahunAkhir] = kelasAsal.tahun.split('/');
        const tahunMulaiBaru = parseInt(tahunAkhir);
        const tahunAkhirBaru = tahunMulaiBaru + 1;
        tahunTujuan = `${tahunMulaiBaru}/${tahunAkhirBaru}`;
        semesterTujuan = 'Ganjil';
      }
      
      // Query untuk cari tahun ajaran tujuan yang sesuai
      const tahunAjaranTujuanQuery = `
        SELECT 
          id,
          tahun,
          semester,
          status
        FROM tahun_ajaran
        WHERE tahun = ? AND semester = ?
        LIMIT 1
      `;
      
      db.query(tahunAjaranTujuanQuery, [tahunTujuan, semesterTujuan], (err2, tahunResults) => {
        if (err2) return reject(err2);
        
        const result = {
          kelas_asal: {
            id: kelasAsal.id,
            nama_kelas: kelasAsal.nama_kelas,
            tahun_ajaran_id: kelasAsal.tahun_ajaran_id,
            tahun: kelasAsal.tahun,
            semester: kelasAsal.semester,
            total_siswa: kelasAsal.total_siswa
          },
          tahun_ajaran_tujuan: tahunResults.length > 0 ? {
            id: tahunResults[0].id,
            tahun: tahunResults[0].tahun,
            semester: tahunResults[0].semester,
            status: tahunResults[0].status
          } : null
        };
        
        resolve(result);
      });
    });
  });
};

// Get daftar mata pelajaran dalam kelas
export const getDaftarMataPelajaranKelas = (kelasId, tahunAjaranId = null, page = 1, limit = 20) => {
  return new Promise((resolve, reject) => {
    // Step 1: Get info kelas
    const getKelasQuery = `
      SELECT 
        k.id,
        k.nama_kelas,
        g.nama_lengkap as wali_kelas,
        ta.id as tahun_ajaran_id,
        ta.tahun,
        ta.semester
      FROM kelas k
      INNER JOIN guru g ON k.wali_kelas_id = g.id
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE k.id = ?
    `;
    
    db.query(getKelasQuery, [kelasId], (err1, kelasResults) => {
      if (err1) return reject(err1);
      
      if (kelasResults.length === 0) {
        return reject(new Error('Kelas tidak ditemukan'));
      }
      
      const kelasInfo = kelasResults[0];
      const targetTahunAjaranId = tahunAjaranId || kelasInfo.tahun_ajaran_id;
      
      // Step 2: Get total count mata pelajaran
      const countQuery = `
        SELECT COUNT(*) as total
        FROM kelas_mapel km
        WHERE km.kelas_id = ? AND km.tahun_ajaran_id = ?
      `;
      
      db.query(countQuery, [kelasId, targetTahunAjaranId], (err2, countResults) => {
        if (err2) return reject(err2);
        
        const totalMapel = countResults[0].total;
        
        // Step 3: Get list mata pelajaran dengan pagination
        const offset = (page - 1) * limit;
        const listQuery = `
          SELECT 
            km.id,
            mp.id as mata_pelajaran_id,
            mp.nama_mapel,
            g.id as guru_id,
            g.nama_lengkap as guru_pengampu,
            g.nip as nip_guru
          FROM kelas_mapel km
          INNER JOIN mapel mp ON km.mapel_id = mp.id
          INNER JOIN guru g ON km.guru_id = g.id
          WHERE km.kelas_id = ? AND km.tahun_ajaran_id = ?
          ORDER BY mp.nama_mapel ASC
          LIMIT ? OFFSET ?
        `;
        
        db.query(listQuery, [kelasId, targetTahunAjaranId, limit, offset], (err3, mapelResults) => {
          if (err3) return reject(err3);
          
          const result = {
            info_kelas: {
              id: kelasInfo.id,
              nama_kelas: kelasInfo.nama_kelas,
              wali_kelas: kelasInfo.wali_kelas,
              tahun: kelasInfo.tahun,
              semester: kelasInfo.semester,
              jumlah_mapel: totalMapel
            },
            mata_pelajaran: mapelResults,
            pagination: {
              current_page: page,
              per_page: limit,
              total: totalMapel,
              total_pages: Math.ceil(totalMapel / limit)
            }
          };
          
          resolve(result);
        });
      });
    });
  });
};

// Execute naik kelas siswa
export const executeNaikKelas = (kelasAsalId, kelasTujuanId, tahunAjaranTujuanId, siswaIds) => {
  return new Promise((resolve, reject) => {
    // Step 1: Validasi kelas asal
    const kelasAsalQuery = `
      SELECT 
        k.id,
        k.nama_kelas,
        ta.id as tahun_ajaran_id,
        ta.tahun,
        ta.semester
      FROM kelas k
      INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE k.id = ?
    `;
    
    db.query(kelasAsalQuery, [kelasAsalId], (err1, kelasAsalResults) => {
      if (err1) return reject(err1);
      
      if (kelasAsalResults.length === 0) {
        return reject(new Error('Kelas asal tidak ditemukan'));
      }
      
      const kelasAsal = kelasAsalResults[0];
      
      // Step 2: Validasi kelas tujuan
      const kelasTujuanQuery = `
        SELECT 
          k.id,
          k.nama_kelas,
          ta.id as tahun_ajaran_id,
          ta.tahun,
          ta.semester
        FROM kelas k
        INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
        WHERE k.id = ? AND ta.id = ?
      `;
      
      db.query(kelasTujuanQuery, [kelasTujuanId, tahunAjaranTujuanId], (err2, kelasTujuanResults) => {
        if (err2) return reject(err2);
        
        if (kelasTujuanResults.length === 0) {
          return reject(new Error('Kelas tujuan atau tahun ajaran tujuan tidak ditemukan'));
        }
        
        const kelasTujuan = kelasTujuanResults[0];
        
        // Step 3: Validasi semua siswa ada di kelas asal
        const placeholders = siswaIds.map(() => '?').join(',');
        const validasiSiswaQuery = `
          SELECT 
            s.id,
            s.nama_lengkap,
            s.nisn,
            CASE 
              WHEN ks.siswa_id IS NOT NULL THEN 1
              ELSE 0
            END as ada_di_kelas_asal
          FROM siswa s
          LEFT JOIN kelas_siswa ks ON s.id = ks.siswa_id 
            AND ks.kelas_id = ? 
            AND ks.tahun_ajaran_id = ?
          WHERE s.id IN (${placeholders})
        `;
        
        db.query(validasiSiswaQuery, [kelasAsalId, kelasAsal.tahun_ajaran_id, ...siswaIds], (err3, siswaResults) => {
          if (err3) return reject(err3);
          
          // Cek apakah semua siswa ditemukan
          if (siswaResults.length !== siswaIds.length) {
            return reject(new Error('Beberapa siswa tidak ditemukan'));
          }
          
          // Cek apakah semua siswa ada di kelas asal
          const siswaTidakDiKelas = siswaResults.filter(s => s.ada_di_kelas_asal === 0);
          if (siswaTidakDiKelas.length > 0) {
            return reject(new Error(`Siswa ${siswaTidakDiKelas[0].nama_lengkap} tidak terdaftar di kelas asal`));
          }
          
          // Step 4: Cek apakah siswa sudah terdaftar di kelas tujuan
          const cekDuplikatQuery = `
            SELECT 
              s.id,
              s.nama_lengkap,
              k.nama_kelas
            FROM kelas_siswa ks
            INNER JOIN siswa s ON ks.siswa_id = s.id
            INNER JOIN kelas k ON ks.kelas_id = k.id
            WHERE ks.siswa_id IN (${placeholders})
              AND ks.kelas_id = ?
              AND ks.tahun_ajaran_id = ?
          `;
          
          db.query(cekDuplikatQuery, [...siswaIds, kelasTujuanId, tahunAjaranTujuanId], (err4, duplikatResults) => {
            if (err4) return reject(err4);
            
            if (duplikatResults.length > 0) {
              return reject(new Error(`Siswa ${duplikatResults[0].nama_lengkap} sudah terdaftar di kelas ${duplikatResults[0].nama_kelas}`));
            }
            
            // Step 5: Begin transaction untuk insert bulk
            db.beginTransaction((errTrans) => {
              if (errTrans) return reject(errTrans);
              
              // Prepare bulk insert
              const insertValues = siswaIds.map(siswaId => [kelasTujuanId, siswaId, tahunAjaranTujuanId]);
              const insertQuery = `
                INSERT INTO kelas_siswa (kelas_id, siswa_id, tahun_ajaran_id)
                VALUES ?
              `;
              
              db.query(insertQuery, [insertValues], (errInsert) => {
                if (errInsert) {
                  return db.rollback(() => {
                    reject(errInsert);
                  });
                }
                
                // Commit transaction
                db.commit((errCommit) => {
                  if (errCommit) {
                    return db.rollback(() => {
                      reject(errCommit);
                    });
                  }
                  
                  // Success - return detail
                  const result = {
                    summary: {
                      total_diproses: siswaIds.length,
                      berhasil: siswaIds.length,
                      gagal: 0,
                      kelas_asal: `${kelasAsal.nama_kelas} (${kelasAsal.tahun} - ${kelasAsal.semester})`,
                      kelas_tujuan: `${kelasTujuan.nama_kelas} (${kelasTujuan.tahun} - ${kelasTujuan.semester})`
                    },
                    detail: siswaResults.map(siswa => ({
                      siswa_id: siswa.id,
                      nama: siswa.nama_lengkap,
                      nisn: siswa.nisn,
                      status: 'berhasil',
                      message: `Berhasil dinaikkan ke ${kelasTujuan.nama_kelas}`
                    }))
                  };
                  
                  resolve(result);
                });
              });
            });
          });
        });
      });
    });
  });
};

// Get dropdown mata pelajaran (exclude yang sudah ada di kelas)
export const getDropdownMataPelajaran = (kelasId = null, tahunAjaranId = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        m.id,
        m.nama_mapel
      FROM mapel m
    `;
    
    const params = [];
    
    // Jika ada kelas_id dan tahun_ajaran_id, exclude mapel yang sudah ada di kelas
    if (kelasId && tahunAjaranId) {
      query += `
        WHERE m.id NOT IN (
          SELECT km.mapel_id 
          FROM kelas_mapel km 
          WHERE km.kelas_id = ? AND km.tahun_ajaran_id = ?
        )
      `;
      params.push(kelasId, tahunAjaranId);
    }
    
    query += ` ORDER BY m.nama_mapel ASC`;
    
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get dropdown guru aktif
export const getDropdownGuru = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id,
        nama_lengkap,
        nip
      FROM guru 
      WHERE status = 'aktif'
      ORDER BY nama_lengkap ASC
    `;
    
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get dropdown guru untuk edit (include guru yang sedang diedit)
export const getDropdownGuruEdit = (excludeGuruId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        g.id,
        g.nama_lengkap,
        g.nip
      FROM guru g
      WHERE g.status = 'aktif'
      ORDER BY g.nama_lengkap ASC
    `;
    
    db.query(query, [], (err, results) => {
      if (err) return reject(err);
      
      // If excludeGuruId is provided, we need to include that guru in the results
      // even if they might be excluded by other filters
      if (excludeGuruId) {
        // Check if the excluded guru is already in results
        const guruExists = results.find(guru => guru.id === parseInt(excludeGuruId));
        if (!guruExists) {
          // Add the excluded guru to the results
          const excludeQuery = `
            SELECT 
              g.id,
              g.nama_lengkap,
              g.nip
            FROM guru g
            WHERE g.id = ? AND g.status = 'aktif'
          `;
          db.query(excludeQuery, [excludeGuruId], (err2, excludeResults) => {
            if (err2) return reject(err2);
            if (excludeResults.length > 0) {
              results.unshift(excludeResults[0]); // Add to beginning
            }
            resolve(results);
          });
        } else {
          resolve(results);
        }
      } else {
        resolve(results);
      }
    });
  });
};

// Tambah mata pelajaran ke kelas (assign existing)
export const tambahMataPelajaranKeKelas = (kelasId, mapelId, guruId, tahunAjaranId) => {
  return new Promise((resolve, reject) => {
    // Step 1: Validasi mata pelajaran belum ada di kelas
    const cekDuplikatQuery = `
      SELECT COUNT(*) as jumlah
      FROM kelas_mapel 
      WHERE kelas_id = ? AND mapel_id = ? AND tahun_ajaran_id = ?
    `;
    
    db.query(cekDuplikatQuery, [kelasId, mapelId, tahunAjaranId], (err1, duplikatResults) => {
      if (err1) return reject(err1);
      
      if (duplikatResults[0].jumlah > 0) {
        return reject(new Error('Mata pelajaran sudah terdaftar di kelas ini untuk tahun ajaran yang sama'));
      }
      
      // Step 2: Insert ke kelas_mapel
      const insertQuery = `
        INSERT INTO kelas_mapel (kelas_id, mapel_id, guru_id, tahun_ajaran_id)
        VALUES (?, ?, ?, ?)
      `;
      
      db.query(insertQuery, [kelasId, mapelId, guruId, tahunAjaranId], (err2, insertResults) => {
        if (err2) return reject(err2);
        
        // Step 3: Get data yang baru ditambahkan
        const getDataQuery = `
          SELECT 
            km.id,
            m.id as mata_pelajaran_id,
            m.nama_mapel,
            g.id as guru_id,
            g.nama_lengkap as guru_pengampu,
            g.nip as nip_guru
          FROM kelas_mapel km
          INNER JOIN mapel m ON km.mapel_id = m.id
          INNER JOIN guru g ON km.guru_id = g.id
          WHERE km.id = ?
        `;
        
        db.query(getDataQuery, [insertResults.insertId], (err3, dataResults) => {
          if (err3) return reject(err3);
          
          resolve(dataResults[0]);
        });
      });
    });
  });
};

// Tambah mata pelajaran baru ke master
export const tambahMataPelajaranBaru = (namaMapel) => {
  return new Promise((resolve, reject) => {
    // Step 1: Cek duplikat nama mata pelajaran
    const cekDuplikatQuery = `
      SELECT COUNT(*) as jumlah
      FROM mapel 
      WHERE nama_mapel = ?
    `;
    
    db.query(cekDuplikatQuery, [namaMapel], (err1, duplikatResults) => {
      if (err1) return reject(err1);
      
      if (duplikatResults[0].jumlah > 0) {
        return reject(new Error('Mata pelajaran dengan nama ini sudah ada'));
      }
      
      // Step 2: Insert ke mapel
      const insertQuery = `
        INSERT INTO mapel (nama_mapel)
        VALUES (?)
      `;
      
      db.query(insertQuery, [namaMapel], (err2, insertResults) => {
        if (err2) return reject(err2);
        
        // Step 3: Get data yang baru ditambahkan
        const getDataQuery = `
          SELECT 
            id,
            nama_mapel
          FROM mapel 
          WHERE id = ?
        `;
        
        db.query(getDataQuery, [insertResults.insertId], (err3, dataResults) => {
          if (err3) return reject(err3);
          
          resolve(dataResults[0]);
        });
      });
    });
  });
};

// Delete kelas
export const deleteKelas = (kelasId) => {
  return new Promise((resolve, reject) => {
    // Cek apakah kelas memiliki siswa (referential integrity check)
    const checkSiswaQuery = `
      SELECT COUNT(*) as jumlah_siswa 
      FROM kelas_siswa 
      WHERE kelas_id = ?
    `;
    
    // Cek apakah kelas memiliki mata pelajaran (referential integrity check)
    const checkMapelQuery = `
      SELECT COUNT(*) as jumlah_mapel 
      FROM kelas_mapel 
      WHERE kelas_id = ?
    `;
    
    // Jalankan pengecekan referential integrity
    db.query(checkSiswaQuery, [kelasId], (err1, siswaResults) => {
      if (err1) return reject(err1);
      
      db.query(checkMapelQuery, [kelasId], (err2, mapelResults) => {
        if (err2) return reject(err2);
        
        const jumlahSiswa = siswaResults[0].jumlah_siswa;
        const jumlahMapel = mapelResults[0].jumlah_mapel;
        
        // Jika kelas memiliki siswa atau mata pelajaran, tidak bisa dihapus
        if (jumlahSiswa > 0) {
          return reject(new Error(`Kelas tidak dapat dihapus karena masih memiliki ${jumlahSiswa} siswa`));
        }
        
        if (jumlahMapel > 0) {
          return reject(new Error(`Kelas tidak dapat dihapus karena masih memiliki ${jumlahMapel} mata pelajaran`));
        }
        
        // Ambil data kelas sebelum dihapus untuk response
        const getKelasQuery = `
          SELECT 
            k.id,
            k.nama_kelas,
            g.id as wali_kelas_id,
            g.nama_lengkap as wali_kelas_nama,
            g.nip as wali_kelas_nip,
            ta.id as tahun_ajaran_id,
            ta.tahun,
            ta.semester
          FROM kelas k
          LEFT JOIN guru g ON k.wali_kelas_id = g.id
          INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
          WHERE k.id = ?
        `;
        
        db.query(getKelasQuery, [kelasId], (err3, kelasData) => {
          if (err3) return reject(err3);
          
          if (kelasData.length === 0) {
            return reject(new Error('Kelas tidak ditemukan'));
          }
          
          // Hapus kelas
          const deleteQuery = `DELETE FROM kelas WHERE id = ?`;
          
          db.query(deleteQuery, [kelasId], (err4, result) => {
            if (err4) return reject(err4);
            
            if (result.affectedRows === 0) {
              return reject(new Error('Kelas tidak ditemukan'));
            }
            
            resolve(kelasData[0]);
          });
        });
      });
    });
  });
};

// Get detail mata pelajaran untuk edit
export const getDetailMataPelajaranKelas = (kelasId, mapelId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        km.id,
        km.mapel_id,
        mp.nama_mapel,
        km.guru_id,
        g.nama_lengkap as guru_nama,
        g.nip as nip_guru,
        km.kelas_id,
        km.tahun_ajaran_id
      FROM kelas_mapel km
      INNER JOIN mapel mp ON km.mapel_id = mp.id
      INNER JOIN guru g ON km.guru_id = g.id
      WHERE km.kelas_id = ? AND km.id = ?
    `;
    
    db.query(query, [kelasId, mapelId], (err, results) => {
      if (err) return reject(err);
      
      if (results.length === 0) {
        return reject(new Error('Mata pelajaran tidak ditemukan di kelas ini'));
      }
      
      resolve(results[0]);
    });
  });
};

// Get dropdown mata pelajaran untuk edit (exclude yang sudah ada + include yang sedang diedit)
export const getDropdownMataPelajaranEdit = (kelasId, tahunAjaranId, excludeMapelId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        mp.id,
        mp.nama_mapel
      FROM mapel mp
      WHERE mp.id NOT IN (
        SELECT km.mapel_id 
        FROM kelas_mapel km 
        WHERE km.kelas_id = ? AND km.tahun_ajaran_id = ?
      ) OR mp.id = ?
      ORDER BY mp.nama_mapel ASC
    `;
    
    db.query(query, [kelasId, tahunAjaranId, excludeMapelId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Update mata pelajaran di kelas
export const updateMataPelajaranKelas = (kelasId, mapelId, newMapelId, guruId, tahunAjaranId) => {
  return new Promise((resolve, reject) => {
    // Cek apakah mata pelajaran baru sudah ada di kelas
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM kelas_mapel 
      WHERE kelas_id = ? AND mapel_id = ? AND tahun_ajaran_id = ? AND id != ?
    `;
    
    db.query(checkQuery, [kelasId, newMapelId, tahunAjaranId, mapelId], (err1, checkResults) => {
      if (err1) return reject(err1);
      
      if (checkResults[0].count > 0) {
        return reject(new Error('Mata pelajaran ini sudah ada di kelas ini'));
      }
      
      // Update mata pelajaran
      const updateQuery = `
        UPDATE kelas_mapel 
        SET mapel_id = ?, guru_id = ?
        WHERE id = ? AND kelas_id = ?
      `;
      
      db.query(updateQuery, [newMapelId, guruId, mapelId, kelasId], (err2, result) => {
        if (err2) return reject(err2);
        
        if (result.affectedRows === 0) {
          return reject(new Error('Mata pelajaran tidak ditemukan di kelas ini'));
        }
        
        // Ambil data yang sudah diupdate
        const getQuery = `
          SELECT 
            km.id,
            km.mapel_id,
            mp.nama_mapel,
            km.guru_id,
            g.nama_lengkap as guru_nama,
            g.nip as nip_guru
          FROM kelas_mapel km
          INNER JOIN mapel mp ON km.mapel_id = mp.id
          INNER JOIN guru g ON km.guru_id = g.id
          WHERE km.id = ?
        `;
        
        db.query(getQuery, [mapelId], (err3, updatedData) => {
          if (err3) return reject(err3);
          resolve(updatedData[0]);
        });
      });
    });
  });
};

// Hapus mata pelajaran dari kelas
export const hapusMataPelajaranKelas = (kelasId, mapelId) => {
  return new Promise((resolve, reject) => {
    // Ambil data mata pelajaran sebelum dihapus untuk response
    const getDataQuery = `
      SELECT 
        km.id,
        km.mapel_id,
        mp.nama_mapel,
        km.guru_id,
        g.nama_lengkap as guru_nama,
        g.nip as nip_guru,
        km.kelas_id,
        k.nama_kelas,
        km.tahun_ajaran_id,
        ta.tahun,
        ta.semester
      FROM kelas_mapel km
      INNER JOIN mapel mp ON km.mapel_id = mp.id
      INNER JOIN guru g ON km.guru_id = g.id
      INNER JOIN kelas k ON km.kelas_id = k.id
      INNER JOIN tahun_ajaran ta ON km.tahun_ajaran_id = ta.id
      WHERE km.kelas_id = ? AND km.id = ?
    `;
    
    db.query(getDataQuery, [kelasId, mapelId], (err1, dataResults) => {
      if (err1) return reject(err1);
      
      if (dataResults.length === 0) {
        return reject(new Error('Mata pelajaran tidak ditemukan di kelas ini'));
      }
      
      const mataPelajaranData = dataResults[0];
      
      // Hapus mata pelajaran dari kelas
      const deleteQuery = `
        DELETE FROM kelas_mapel 
        WHERE kelas_id = ? AND id = ?
      `;
      
      db.query(deleteQuery, [kelasId, mapelId], (err2, result) => {
        if (err2) return reject(err2);
        
        if (result.affectedRows === 0) {
          return reject(new Error('Gagal menghapus mata pelajaran dari kelas'));
        }
        
        // Return data mata pelajaran yang sudah dihapus
        resolve({
          id: mataPelajaranData.id,
          mapel_id: mataPelajaranData.mapel_id,
          nama_mapel: mataPelajaranData.nama_mapel,
          guru_id: mataPelajaranData.guru_id,
          guru_nama: mataPelajaranData.guru_nama,
          nip_guru: mataPelajaranData.nip_guru,
          kelas_id: mataPelajaranData.kelas_id,
          nama_kelas: mataPelajaranData.nama_kelas,
          tahun_ajaran_id: mataPelajaranData.tahun_ajaran_id,
          tahun: mataPelajaranData.tahun,
          semester: mataPelajaranData.semester,
          message: `Mata pelajaran ${mataPelajaranData.nama_mapel} berhasil dihapus dari ${mataPelajaranData.nama_kelas}`
        });
      });
    });
  });
};
