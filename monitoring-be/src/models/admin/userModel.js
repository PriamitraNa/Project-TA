import db from '../../config/db.js'

// Get all users data with pagination, search, filter, and sorting
export const getAllDataUsers = (
  page = 1,
  limit = 10,
  search = '',
  role = '',
  status = '',
  sortBy = 'nama_lengkap',
  sortOrder = 'ASC'
) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        u.id,
        u.nama_lengkap,
        u.username,
        u.role,
        u.status,
        CASE 
          WHEN u.last_login IS NOT NULL 
          THEN DATE_FORMAT(u.last_login, '%Y-%m-%d %H:%i:%s')
          ELSE NULL 
        END as last_login,
        u.created_at
      FROM users u
      WHERE 1=1
    `

    let countQuery = `SELECT COUNT(*) as total FROM users u WHERE 1=1`
    const params = []
    const countParams = []

    // Add search filter
    if (search) {
      const searchPattern = `%${search}%`
      query += ` AND (u.nama_lengkap LIKE ? OR u.username LIKE ?)`
      countQuery += ` AND (u.nama_lengkap LIKE ? OR u.username LIKE ?)`
      params.push(searchPattern, searchPattern)
      countParams.push(searchPattern, searchPattern)
    }

    // Add role filter
    if (role && role !== '') {
      query += ` AND u.role = ?`
      countQuery += ` AND u.role = ?`
      params.push(role)
      countParams.push(role)
    }

    // Add status filter
    if (status && status !== '') {
      query += ` AND u.status = ?`
      countQuery += ` AND u.status = ?`
      params.push(status)
      countParams.push(status)
    }

    // Add sorting
    const validSortColumns = [
      'nama_lengkap',
      'username',
      'role',
      'status',
      'last_login',
      'created_at',
    ]
    const validSortOrders = ['ASC', 'DESC']

    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'nama_lengkap'
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : 'ASC'

    query += ` ORDER BY u.${sortColumn} ${sortDirection}`
    query += ` LIMIT ? OFFSET ?`
    params.push(limit, offset)

    // Execute count query first
    db.query(countQuery, countParams, (err, countResult) => {
      if (err) return reject(err)

      const total = countResult[0].total

      // Execute main query
      db.query(query, params, (err, results) => {
        if (err) return reject(err)

        const totalPages = Math.ceil(total / limit)

        resolve({
          data: results,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_data: total,
            per_page: limit,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        })
      })
    })
  })
}

// Get user statistics (role-based)
export const getUsersStatistics = (search = '', role = '', status = '') => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        COUNT(*) as total_akun,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin,
        SUM(CASE WHEN role = 'guru' THEN 1 ELSE 0 END) as guru,
        SUM(CASE WHEN role = 'ortu' THEN 1 ELSE 0 END) as orangtua
      FROM users u
      WHERE 1=1
    `

    const params = []

    // Add search filter
    if (search) {
      const searchPattern = `%${search}%`
      query += ` AND (u.nama_lengkap LIKE ? OR u.username LIKE ?)`
      params.push(searchPattern, searchPattern)
    }

    // Add role filter
    if (role && role !== '') {
      query += ` AND u.role = ?`
      params.push(role)
    }

    // Add status filter
    if (status && status !== '') {
      query += ` AND u.status = ?`
      params.push(status)
    }

    db.query(query, params, (err, results) => {
      if (err) return reject(err)
      resolve(results[0])
    })
  })
}

// Get available guru (guru yang belum punya akun)
export const getAvailableGuru = (search = '', limit = 50) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        g.id,
        g.nama_lengkap,
        g.nip,
        g.status
      FROM guru g
      LEFT JOIN users u ON g.user_id = u.id
      WHERE g.user_id IS NULL
    `

    let countQuery = `
      SELECT COUNT(*) as total
      FROM guru g
      LEFT JOIN users u ON g.user_id = u.id
      WHERE g.user_id IS NULL
    `

    const params = []
    const countParams = []

    // Add search filter
    if (search) {
      const searchPattern = `%${search}%`
      query += ` AND g.nama_lengkap LIKE ?`
      countQuery += ` AND g.nama_lengkap LIKE ?`
      params.push(searchPattern)
      countParams.push(searchPattern)
    }

    // Add ordering and limit
    query += ` ORDER BY g.nama_lengkap ASC`
    query += ` LIMIT ?`
    params.push(limit)

    // Execute count query first
    db.query(countQuery, countParams, (err, countResult) => {
      if (err) return reject(err)

      const total = countResult[0].total

      // Execute main query
      db.query(query, params, (err, results) => {
        if (err) return reject(err)

        resolve({
          data: results,
          total_available: total,
        })
      })
    })
  })
}

// Get available orangtua (orangtua yang belum punya akun untuk semua anaknya)
export const getAvailableOrtu = (search = '', limit = 50) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        o.id,
        o.nama_lengkap,
        o.nik,
        o.kontak,
        o.relasi,
        COUNT(DISTINCT os.siswa_id) as total_anak,
        COUNT(DISTINCT u.id) as akun_terbuat
      FROM orangtua o
      LEFT JOIN orangtua_siswa os ON o.id = os.orangtua_id
      LEFT JOIN users u ON o.id = u.ortu_id AND u.role = 'ortu'
      GROUP BY o.id, o.nama_lengkap, o.nik, o.kontak, o.relasi
      HAVING total_anak > 0 AND akun_terbuat < total_anak
    `

    let countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT 
          o.id,
          COUNT(DISTINCT os.siswa_id) as total_anak,
          COUNT(DISTINCT u.id) as akun_terbuat
        FROM orangtua o
        LEFT JOIN orangtua_siswa os ON o.id = os.orangtua_id
        LEFT JOIN users u ON o.id = u.ortu_id AND u.role = 'ortu'
        GROUP BY o.id
        HAVING total_anak > 0 AND akun_terbuat < total_anak
      ) as available_ortu
    `

    const params = []
    const countParams = []

    // Add search filter
    if (search) {
      const searchPattern = `%${search}%`
      query += ` AND o.nama_lengkap LIKE ?`
      countQuery += ` AND o.nama_lengkap LIKE ?`
      params.push(searchPattern)
      countParams.push(searchPattern)
    }

    // Add ordering and limit
    query += ` ORDER BY o.nama_lengkap ASC`
    query += ` LIMIT ?`
    params.push(limit)

    // Execute count query first
    db.query(countQuery, countParams, (err, countResult) => {
      if (err) return reject(err)

      const total = countResult[0].total

      // Execute main query
      db.query(query, params, (err, results) => {
        if (err) return reject(err)

        resolve({
          data: results,
          total_available: total,
        })
      })
    })
  })
}

// Get children by parent ID
export const getChildrenByParent = (ortuId, search = '', limit = 50) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        s.id,
        s.nama_lengkap,
        s.nisn,
        s.jenis_kelamin,
        s.tanggal_lahir,
        s.tempat_lahir,
        ks.kelas_id,
        k.nama_kelas,
        ta.tahun,
        ta.semester,
        CASE 
          WHEN u.id IS NOT NULL THEN 1 
          ELSE 0 
        END as sudah_punya_akun,
        u.username as username_akun
      FROM siswa s
      INNER JOIN orangtua_siswa os ON s.id = os.siswa_id
      INNER JOIN orangtua o ON os.orangtua_id = o.id
      LEFT JOIN kelas_siswa ks ON s.id = ks.siswa_id AND ks.tahun_ajaran_id = (
        SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
      )
      LEFT JOIN kelas k ON ks.kelas_id = k.id
      LEFT JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      LEFT JOIN users u ON s.nisn = u.username AND u.role = 'ortu' AND u.ortu_id = o.id
      WHERE o.id = ?
        AND u.id IS NULL
    `

    let countQuery = `
      SELECT COUNT(*) as total
      FROM siswa s
      INNER JOIN orangtua_siswa os ON s.id = os.siswa_id
      INNER JOIN orangtua o ON os.orangtua_id = o.id
      LEFT JOIN users u ON s.nisn = u.username AND u.role = 'ortu' AND u.ortu_id = o.id
      WHERE o.id = ?
        AND u.id IS NULL
    `

    const params = [ortuId]
    const countParams = [ortuId]

    // Add search filter
    if (search) {
      const searchPattern = `%${search}%`
      query += ` AND s.nama_lengkap LIKE ?`
      countQuery += ` AND s.nama_lengkap LIKE ?`
      params.push(searchPattern)
      countParams.push(searchPattern)
    }

    // Add ordering and limit
    query += ` ORDER BY s.nama_lengkap ASC`
    query += ` LIMIT ?`
    params.push(limit)

    // Execute count query first
    db.query(countQuery, countParams, (err, countResult) => {
      if (err) return reject(err)

      const total = countResult[0].total

      // Execute main query
      db.query(query, params, (err, results) => {
        if (err) return reject(err)

        resolve({
          data: results,
          total_available: total,
        })
      })
    })
  })
}

// =============== VALIDATION HELPERS ===============

// Check if a username already exists (optionally excluding a user id)
export const checkUsernameExists = (username, excludeUserId = null) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT COUNT(*) as cnt FROM users WHERE username = ?`
    const params = [username]
    if (excludeUserId) {
      query += ` AND id <> ?`
      params.push(excludeUserId)
    }
    db.query(query, params, (err, results) => {
      if (err) return reject(err)
      resolve(results[0].cnt > 0)
    })
  })
}

// Find a guru by NIP and indicate if already linked to a user
export const findGuruByNip = (nip) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT g.id, g.nama_lengkap, g.nip, g.user_id
      FROM guru g
      WHERE g.nip = ?
      LIMIT 1
    `
    db.query(query, [nip], (err, results) => {
      if (err) return reject(err)
      resolve(results[0] || null)
    })
  })
}

// Check if a siswa with given NISN belongs to the specified parent
export const findSiswaByNisnForOrtu = (ortuId, nisn) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT s.id, s.nama_lengkap, s.nisn
      FROM siswa s
      INNER JOIN orangtua_siswa os ON os.siswa_id = s.id
      WHERE os.orangtua_id = ? AND s.nisn = ?
      LIMIT 1
    `
    db.query(query, [ortuId, nisn], (err, results) => {
      if (err) return reject(err)
      resolve(results[0] || null)
    })
  })
}

// Check if a user exists for an ortu using a specific child NISN (username)
export const checkUserExistsForOrtuUsername = (ortuId, username, excludeUserId = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT COUNT(*) as cnt
      FROM users
      WHERE role = 'ortu' AND ortu_id = ? AND username = ?
    `
    const params = [ortuId, username]
    if (excludeUserId) {
      query += ` AND id <> ?`
      params.push(excludeUserId)
    }
    db.query(query, params, (err, results) => {
      if (err) return reject(err)
      resolve(results[0].cnt > 0)
    })
  })
}

// Create single user account
export const createUser = (userData) => {
  return new Promise((resolve, reject) => {
    const { nama_lengkap, username, password, role, status = 'aktif', ortu_id = null } = userData

    const query = `
      INSERT INTO users (nama_lengkap, username, password, must_change_password, role, status, ortu_id)
      VALUES (?, ?, ?, 1, ?, ?, ?)
    `

    const params = [nama_lengkap, username, password, role, status, ortu_id]

    db.query(query, params, (err, results) => {
      if (err) return reject(err)
      resolve({
        id: results.insertId,
        nama_lengkap,
        username,
        role,
        status,
        ortu_id,
      })
    })
  })
}

// Create multiple user accounts (bulk)
export const createBulkUsers = (usersData) => {
  return new Promise((resolve, reject) => {
    if (!usersData || usersData.length === 0) {
      return reject(new Error('Data users tidak boleh kosong'))
    }

    const values = usersData.map((user) => [
      user.nama_lengkap,
      user.username,
      user.password,
      1, // must_change_password
      user.role,
      user.status || 'aktif',
      user.ortu_id || null,
    ])

    const query = `
      INSERT INTO users (nama_lengkap, username, password, must_change_password, role, status, ortu_id)
      VALUES ?
    `

    db.query(query, [values], (err, results) => {
      if (err) return reject(err)
      resolve({
        insertedCount: results.affectedRows,
        insertedIds: Array.from({ length: results.affectedRows }, (_, i) => results.insertId + i),
      })
    })
  })
}

// Reset password user by ID
export const resetUserPassword = (userId, newPasswordHash) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE users 
      SET password = ?, must_change_password = 1 
      WHERE id = ?
    `

    db.query(query, [newPasswordHash, userId], (err, results) => {
      if (err) return reject(err)

      if (results.affectedRows === 0) {
        return reject(new Error('User tidak ditemukan'))
      }

      resolve({
        affectedRows: results.affectedRows,
        userId: userId,
      })
    })
  })
}

// Get user by ID (untuk validasi sebelum reset)
export const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, nama_lengkap, username, role, status 
      FROM users 
      WHERE id = ?
    `

    db.query(query, [userId], (err, results) => {
      if (err) return reject(err)
      resolve(results[0] || null)
    })
  })
}

// Delete user by ID
export const deleteUserById = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM users WHERE id = ?`

    db.query(query, [userId], (err, results) => {
      if (err) return reject(err)

      if (results.affectedRows === 0) {
        return reject(new Error('User tidak ditemukan'))
      }

      resolve({
        affectedRows: results.affectedRows,
        userId: userId,
      })
    })
  })
}
