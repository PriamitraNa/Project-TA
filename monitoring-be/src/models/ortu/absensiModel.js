import db from '../../config/db.js'

/**
 * Get tahun ajaran yang relevan untuk siswa
 * Menampilkan tahun ajaran UNIQUE (tanpa duplikat semester)
 * Sort DESC (terbaru di atas)
 */
export const getTahunAjaranBySiswa = (siswaId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT
        ta.tahun
      FROM tahun_ajaran ta
      WHERE ta.status = 'aktif'
        OR EXISTS (
          SELECT 1
          FROM absensi a
          WHERE a.siswa_id = ?
            AND a.tanggal >= ta.tanggal_mulai
            AND a.tanggal <= ta.tanggal_selesai
        )
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
 * Get semester berdasarkan tahun ajaran yang dipilih
 * Menampilkan semester dengan info apakah siswa punya data absensi di semester tersebut
 * Filter by tahun (string), bukan ID
 */
export const getSemesterByTahunAjaran = (siswaId, tahunAjaran) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        ta.id,
        ta.semester,
        ta.tanggal_mulai,
        ta.tanggal_selesai,
        COUNT(a.id) as has_data
      FROM tahun_ajaran ta
      LEFT JOIN absensi a ON (
        a.siswa_id = ?
        AND a.tanggal >= ta.tanggal_mulai
        AND a.tanggal <= ta.tanggal_selesai
      )
      WHERE ta.tahun = ?
      GROUP BY ta.id, ta.semester, ta.tanggal_mulai, ta.tanggal_selesai
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
 * Get info semester (tanggal_mulai, tanggal_selesai) berdasarkan tahun ajaran dan semester
 */
export const getSemesterInfo = (tahunAjaranId, semester) => {
  return new Promise((resolve, reject) => {
    // Convert semester number to enum value
    const semesterEnum = semester === '1' ? 'Ganjil' : 'Genap'

    const query = `
      SELECT 
        id,
        semester,
        tanggal_mulai,
        tanggal_selesai
      FROM tahun_ajaran
      WHERE id = ?
        AND semester = ?
    `

    db.query(query, [tahunAjaranId, semesterEnum], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0] || null)
    })
  })
}

/**
 * Check apakah siswa punya data absensi di bulan tertentu
 * Return: count absensi di bulan tersebut
 */
export const checkAbsensiByMonth = (siswaId, tahun, bulan) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count
      FROM absensi
      WHERE siswa_id = ?
        AND YEAR(tanggal) = ?
        AND MONTH(tanggal) = ?
    `

    db.query(query, [siswaId, tahun, bulan], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0].count)
    })
  })
}

/**
 * Get summary absensi berdasarkan semester (seluruh periode semester)
 * Return: Count per status (Hadir, Sakit, Izin, Alpha) + total
 */
export const getAbsensiSummaryBySemester = (siswaId, tanggalMulai, tanggalSelesai) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as total_hadir,
        SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END) as total_sakit,
        SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as total_izin,
        SUM(CASE WHEN status = 'Alpha' THEN 1 ELSE 0 END) as total_alpha,
        COUNT(*) as total_hari
      FROM absensi
      WHERE siswa_id = ?
        AND tanggal >= ?
        AND tanggal <= ?
    `

    db.query(query, [siswaId, tanggalMulai, tanggalSelesai], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0] || {})
    })
  })
}

/**
 * Get info tahun ajaran (untuk response periode)
 */
export const getTahunAjaranInfo = (tahunAjaranId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT tahun
      FROM tahun_ajaran
      WHERE id = ?
    `

    db.query(query, [tahunAjaranId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0] || null)
    })
  })
}

/**
 * Get detail absensi untuk tabel
 * Filter: siswa_id, date range, dan optional bulan
 * Sort: tanggal DESC (terbaru di atas)
 */
export const getDetailAbsensi = (siswaId, tanggalMulai, tanggalSelesai, bulan = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        a.id,
        a.tanggal,
        a.status,
        a.guru_id,
        g.nama_lengkap as guru_nama,
        a.kelas_id,
        k.nama_kelas as kelas_nama
      FROM absensi a
      LEFT JOIN guru g ON a.guru_id = g.id
      LEFT JOIN kelas k ON a.kelas_id = k.id
      WHERE a.siswa_id = ?
        AND a.tanggal >= ?
        AND a.tanggal <= ?
    `

    const params = [siswaId, tanggalMulai, tanggalSelesai]

    // Jika bulan diisi, tambahkan filter bulan
    if (bulan) {
      query += ` AND MONTH(a.tanggal) = ?`
      params.push(parseInt(bulan))
    }

    query += ` ORDER BY a.tanggal DESC`

    db.query(query, params, (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

export default {
  getTahunAjaranBySiswa,
  getSemesterByTahunAjaran,
  getSemesterInfo,
  checkAbsensiByMonth,
  getAbsensiSummaryBySemester,
  getTahunAjaranInfo,
  getDetailAbsensi,
}
