import db from '../../config/db.js'

/**
 * Get tahun ajaran yang pernah diikuti siswa
 * Berdasarkan siswa_id dari siswa yang linked ke user
 * Return UNIQUE tahun saja (tanpa duplikat semester)
 */
export const getTahunAjaranBySiswa = (siswaId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT
        ta.tahun as tahun_ajaran
      FROM kelas_siswa ks
      JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      WHERE ks.siswa_id = ?
      ORDER BY ta.tahun DESC
    `

    db.query(query, [siswaId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

/**
 * Get semester yang pernah diikuti siswa di tahun ajaran tertentu
 * Filter by siswa_id dan tahun (string tahun ajaran, misal: '2025/2026')
 * Order by ASC (Ganjil dulu, baru Genap)
 * Return semester yang tersedia (bisa 1 atau 2)
 */
export const getSemesterBySiswaAndTahun = (siswaId, tahunAjaran) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT
        ta.id as tahun_ajaran_id,
        ta.semester
      FROM kelas_siswa ks
      JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      WHERE ks.siswa_id = ? AND ta.tahun = ?
      ORDER BY 
        CASE 
          WHEN ta.semester = 'Ganjil' THEN 1
          WHEN ta.semester = 'Genap' THEN 2
          ELSE 3
        END ASC
    `

    db.query(query, [siswaId, tahunAjaran], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

/**
 * Get nilai detail siswa per mapel untuk tahun ajaran dan semester tertentu
 * Includes: semua kolom formatif, sumatif, UTS, UAS
 * Filter by siswa_id, tahun_ajaran_id, semester
 * Order by nama mapel ASC
 */
export const getNilaiDetailBySiswaAndPeriod = (siswaId, tahunAjaranId, semester) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        n.id,
        n.siswa_id,
        n.mapel_id,
        n.tahun_ajaran_id,
        n.semester,
        m.nama_mapel,
        n.lm1_tp1, n.lm1_tp2, n.lm1_tp3, n.lm1_tp4,
        n.lm2_tp1, n.lm2_tp2, n.lm2_tp3, n.lm2_tp4,
        n.lm3_tp1, n.lm3_tp2, n.lm3_tp3, n.lm3_tp4,
        n.lm4_tp1, n.lm4_tp2, n.lm4_tp3, n.lm4_tp4,
        n.lm5_tp1, n.lm5_tp2, n.lm5_tp3, n.lm5_tp4,
        n.lm1_ulangan, n.lm2_ulangan, n.lm3_ulangan, n.lm4_ulangan, n.lm5_ulangan,
        n.uts, n.uas
      FROM nilai n
      JOIN mapel m ON n.mapel_id = m.id
      WHERE n.siswa_id = ? AND n.tahun_ajaran_id = ? AND n.semester = ?
      ORDER BY m.nama_mapel ASC
    `

    db.query(query, [siswaId, tahunAjaranId, semester], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

/**
 * Get peringkat (ranking) siswa di kelasnya untuk tahun ajaran dan semester tertentu
 * Menghitung ranking berdasarkan nilai rata-rata
 */
/**
 * Get semua siswa dengan nilai_rata_rata mereka di kelas yang sama untuk ranking
 * Filter by kelas dan tahun ajaran dan semester
 */
export const getClassNilaiAverage = (siswaId, tahunAjaranId, semester) => {
  return new Promise((resolve, reject) => {
    // Step 1: Get student's kelas
    const kelasQuery = `
      SELECT kelas_id FROM kelas_siswa 
      WHERE siswa_id = ? AND tahun_ajaran_id = ?
      LIMIT 1
    `

    db.query(kelasQuery, [siswaId, tahunAjaranId], (error, kelasResults) => {
      if (error) {
        return reject(error)
      }

      if (!kelasResults || kelasResults.length === 0) {
        return resolve([])
      }

      const kelasId = kelasResults[0].kelas_id

      // Step 2: Get all siswa in same kelas and their average nilai
      const nilaiQuery = `
        SELECT DISTINCT
          ks.siswa_id
        FROM kelas_siswa ks
        WHERE ks.kelas_id = ? AND ks.tahun_ajaran_id = ?
      `

      db.query(nilaiQuery, [kelasId, tahunAjaranId], (error, siswaResults) => {
        if (error) {
          return reject(error)
        }

        if (!siswaResults || siswaResults.length === 0) {
          return resolve([])
        }

        // Step 3: For each siswa, get all nilai values for averaging
        const siswaIds = siswaResults.map((s) => s.siswa_id)
        const nilaiDataQuery = `
          SELECT
            siswa_id,
            lm1_tp1, lm1_tp2, lm1_tp3, lm1_tp4,
            lm2_tp1, lm2_tp2, lm2_tp3, lm2_tp4,
            lm3_tp1, lm3_tp2, lm3_tp3, lm3_tp4,
            lm4_tp1, lm4_tp2, lm4_tp3, lm4_tp4,
            lm5_tp1, lm5_tp2, lm5_tp3, lm5_tp4,
            lm1_ulangan, lm2_ulangan, lm3_ulangan, lm4_ulangan, lm5_ulangan,
            uts, uas
          FROM nilai
          WHERE tahun_ajaran_id = ? AND semester = ?
          AND siswa_id IN (${siswaIds.map(() => '?').join(',')})
        `

        db.query(nilaiDataQuery, [tahunAjaranId, semester, ...siswaIds], (error, nilaiResults) => {
          if (error) {
            return reject(error)
          }

          resolve(nilaiResults)
        })
      })
    })
  })
}

/**
 * Get SEMUA mapel yang diajarkan di kelas siswa untuk tahun ajaran tertentu
 * Ini untuk menampilkan semua mapel, terlepas sudah ada nilai atau belum
 * JOIN dengan nilai untuk LEFT JOIN (semua mapel, nilai bisa null)
 */
export const getAllMapelByKelas = (siswaId, tahunAjaranId, semester) => {
  return new Promise((resolve, reject) => {
    // Step 1: Get kelas_id dari siswa
    const kelasQuery = `
      SELECT kelas_id FROM kelas_siswa 
      WHERE siswa_id = ? AND tahun_ajaran_id = ?
      LIMIT 1
    `

    db.query(kelasQuery, [siswaId, tahunAjaranId], (error, kelasResults) => {
      if (error) {
        return reject(error)
      }

      if (!kelasResults || kelasResults.length === 0) {
        return resolve([])
      }

      const kelasId = kelasResults[0].kelas_id

      // Step 2: Get semua mapel di kelas + nilai siswa (jika ada)
      const mapelQuery = `
        SELECT
          m.id as mapel_id,
          m.nama_mapel,
          n.id,
          n.siswa_id,
          n.tahun_ajaran_id,
          n.semester,
          n.lm1_tp1, n.lm1_tp2, n.lm1_tp3, n.lm1_tp4,
          n.lm2_tp1, n.lm2_tp2, n.lm2_tp3, n.lm2_tp4,
          n.lm3_tp1, n.lm3_tp2, n.lm3_tp3, n.lm3_tp4,
          n.lm4_tp1, n.lm4_tp2, n.lm4_tp3, n.lm4_tp4,
          n.lm5_tp1, n.lm5_tp2, n.lm5_tp3, n.lm5_tp4,
          n.lm1_ulangan, n.lm2_ulangan, n.lm3_ulangan, n.lm4_ulangan, n.lm5_ulangan,
          n.uts, n.uas,
          n.nilai_akhir
        FROM kelas_mapel km
        JOIN mapel m ON km.mapel_id = m.id
        LEFT JOIN nilai n ON n.mapel_id = m.id 
          AND n.siswa_id = ? 
          AND n.tahun_ajaran_id = ? 
          AND n.semester = ?
        WHERE km.kelas_id = ? AND km.tahun_ajaran_id = ?
        ORDER BY m.nama_mapel ASC
      `

      db.query(
        mapelQuery,
        [siswaId, tahunAjaranId, semester, kelasId, tahunAjaranId],
        (error, mapelResults) => {
          if (error) {
            return reject(error)
          }
          resolve(mapelResults)
        }
      )
    })
  })
}

export default {
  getTahunAjaranBySiswa,
  getSemesterBySiswaAndTahun,
  getNilaiDetailBySiswaAndPeriod,
  getClassNilaiAverage,
  getAllMapelByKelas,
}
