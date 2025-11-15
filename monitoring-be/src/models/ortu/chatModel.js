import db from '../../config/db.js'

/**
 * Get daftar conversations untuk ortu berdasarkan siswa_id
 * Filter by siswa (anak dari ortu), bukan ortu_id
 */
export const getConversationsBySiswa = (siswaId, filters) => {
  return new Promise((resolve, reject) => {
    const { search = '' } = filters

    let query = `
      SELECT 
        cc.id,
        cc.guru_id,
        u.nama_lengkap AS guru_nama,
        cc.siswa_id,
        s.nama_lengkap AS siswa_nama,
        k.nama_kelas AS kelas_nama,
        cc.last_message,
        cc.last_message_time,
        cc.unread_count_ortu AS unread_count,
        FALSE AS is_online
      FROM chat_conversations cc
      JOIN guru g ON cc.guru_id = g.id
      JOIN users u ON g.user_id = u.id
      JOIN siswa s ON cc.siswa_id = s.id
      LEFT JOIN kelas_siswa ks ON (
        ks.siswa_id = cc.siswa_id 
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      )
      LEFT JOIN kelas k ON ks.kelas_id = k.id
      WHERE cc.siswa_id = ?
        AND cc.is_archived_ortu = FALSE
    `

    const params = [siswaId]

    // Add search filter if provided (search di guru_nama saja)
    if (search && search.trim() !== '') {
      query += ` AND u.nama_lengkap LIKE ?`
      const searchPattern = `%${search}%`
      params.push(searchPattern)
    }

    // Sort: unread first, then by last message time
    query += `
      ORDER BY 
        cc.unread_count_ortu DESC,
        cc.last_message_time DESC
    `

    db.query(query, params, (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

/**
 * Get total unread count untuk siswa tertentu
 */
export const getTotalUnreadBySiswa = (siswaId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COALESCE(SUM(unread_count_ortu), 0) AS total_unread
      FROM chat_conversations
      WHERE siswa_id = ?
        AND is_archived_ortu = FALSE
    `

    db.query(query, [siswaId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0]?.total_unread || 0)
    })
  })
}

export default {
  getConversationsBySiswa,
  getTotalUnreadBySiswa,
}

/**
 * Get conversation by ID untuk authorization check
 * Check apakah conversation ini untuk siswa tertentu
 */
export const getConversationBySiswaId = (conversationId, siswaId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        cc.*,
        u.nama_lengkap AS guru_nama,
        s.nama_lengkap AS siswa_nama,
        k.nama_kelas AS kelas_nama
      FROM chat_conversations cc
      JOIN guru g ON cc.guru_id = g.id
      JOIN users u ON g.user_id = u.id
      JOIN siswa s ON cc.siswa_id = s.id
      LEFT JOIN kelas_siswa ks ON (
        ks.siswa_id = cc.siswa_id 
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
      )
      LEFT JOIN kelas k ON ks.kelas_id = k.id
      WHERE cc.id = ? AND cc.siswa_id = ?
    `

    db.query(query, [conversationId, siswaId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0] || null)
    })
  })
}

/**
 * Get all messages dalam conversation
 */
export const getMessagesByConversation = (conversationId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        cm.id,
        cm.conversation_id,
        cm.sender_id,
        cm.sender_role,
        u.nama_lengkap AS sender_nama,
        cm.message,
        cm.is_read,
        cm.read_at,
        cm.created_at
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.conversation_id = ?
      ORDER BY cm.created_at ASC
    `

    db.query(query, [conversationId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

/**
 * Mark messages as read (messages from guru)
 */
export const markMessagesAsReadOrtu = (conversationId) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE chat_messages
      SET is_read = TRUE,
          read_at = NOW()
      WHERE conversation_id = ?
        AND sender_role = 'guru'
        AND is_read = FALSE
    `

    db.query(query, [conversationId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

/**
 * Update unread count ortu jadi 0
 */
export const resetUnreadCountOrtu = (conversationId) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE chat_conversations
      SET unread_count_ortu = 0
      WHERE id = ?
    `

    db.query(query, [conversationId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

/**
 * Get last message from ortu untuk rate limiting check
 */
export const getLastMessageFromOrtu = (conversationId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT created_at
      FROM chat_messages
      WHERE conversation_id = ?
        AND sender_role = 'ortu'
      ORDER BY created_at DESC
      LIMIT 1
    `

    db.query(query, [conversationId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0] || null)
    })
  })
}

/**
 * Insert message baru
 */
export const insertMessage = (data) => {
  return new Promise((resolve, reject) => {
    const { conversation_id, sender_id, sender_role, message } = data

    const query = `
      INSERT INTO chat_messages (
        conversation_id, sender_id, sender_role, message, created_at
      ) VALUES (?, ?, ?, ?, NOW())
    `

    db.query(query, [conversation_id, sender_id, sender_role, message], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve({
        insertId: results.insertId,
        affectedRows: results.affectedRows,
      })
    })
  })
}

/**
 * Get message by ID (untuk return data setelah insert)
 */
export const getMessageById = (messageId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        cm.id,
        cm.conversation_id,
        cm.sender_id,
        cm.sender_role,
        u.nama_lengkap AS sender_nama,
        cm.message,
        cm.is_read,
        cm.read_at,
        cm.created_at
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.id = ?
    `

    db.query(query, [messageId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0] || null)
    })
  })
}

/**
 * Update conversation last_message dan increment unread_count_guru
 */
export const updateConversationAfterSendOrtu = (conversationId, message) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE chat_conversations
      SET last_message = ?,
          last_message_time = NOW(),
          unread_count_guru = unread_count_guru + 1
      WHERE id = ?
    `

    db.query(query, [message, conversationId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

/**
 * Get list guru untuk new chat (guru yang mengajar siswa ini)
 */
export const getGuruForNewChat = (siswaId, filters) => {
  return new Promise((resolve, reject) => {
    const { search = '', filter = '' } = filters

    let query = `
      SELECT DISTINCT
        g.id AS guru_id,
        u.nama_lengkap AS guru_nama,
        u.username AS guru_username,
        k.id AS kelas_id,
        k.nama_kelas AS kelas,
        cc.id AS existing_conversation_id,
        CASE WHEN cc.id IS NOT NULL THEN TRUE ELSE FALSE END AS has_conversation
      FROM guru g
      JOIN users u ON g.user_id = u.id
      JOIN kelas_siswa ks ON ks.siswa_id = ?
      JOIN kelas k ON ks.kelas_id = k.id
      LEFT JOIN chat_conversations cc ON (
        cc.siswa_id = ? AND 
        cc.guru_id = g.id
      )
      WHERE ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
        AND (
          k.wali_kelas_id = g.id OR
          EXISTS (
            SELECT 1 FROM kelas_mapel km
            WHERE km.kelas_id = k.id
              AND km.guru_id = g.id
              AND km.tahun_ajaran_id = ks.tahun_ajaran_id
          )
        )
    `

    const params = [siswaId, siswaId]

    // Filter: only no_conversation
    if (filter === 'no_conversation') {
      query += ` AND cc.id IS NULL`
    }

    // Search by nama guru
    if (search && search.trim() !== '') {
      query += ` AND u.nama_lengkap LIKE ?`
      params.push(`%${search}%`)
    }

    // Order by has_conversation (false first), then guru_nama
    query += `
      ORDER BY 
        has_conversation ASC,
        u.nama_lengkap ASC
    `

    db.query(query, params, (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results)
    })
  })
}

/**
 * Get guru info by ID
 */
export const getGuruById = (guruId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT g.id, u.nama_lengkap AS guru_nama
      FROM guru g
      JOIN users u ON g.user_id = u.id
      WHERE g.id = ?
    `

    db.query(query, [guruId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0] || null)
    })
  })
}

/**
 * Check if guru mengajar siswa (Wali Kelas atau Guru Mapel)
 */
export const checkGuruMengajarSiswa = (guruId, siswaId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT ks.siswa_id
      FROM kelas_siswa ks
      JOIN kelas k ON ks.kelas_id = k.id
      WHERE ks.siswa_id = ?
        AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
        AND (
          k.wali_kelas_id = ? OR
          EXISTS (
            SELECT 1 FROM kelas_mapel km
            WHERE km.kelas_id = ks.kelas_id
              AND km.guru_id = ?
              AND km.tahun_ajaran_id = ks.tahun_ajaran_id
          )
        )
    `

    db.query(query, [siswaId, guruId, guruId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results.length > 0)
    })
  })
}

/**
 * Get orang tua dari siswa
 */
export const getOrtuBySiswa = (siswaId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT os.orangtua_id, o.nama_lengkap AS ortu_nama
      FROM orangtua_siswa os
      JOIN orangtua o ON os.orangtua_id = o.id
      WHERE os.siswa_id = ?
      LIMIT 1
    `

    db.query(query, [siswaId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0] || null)
    })
  })
}

/**
 * Check if conversation already exists
 */
export const checkConversationExistsOrtu = (guruId, ortuId, siswaId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        cc.*,
        u.nama_lengkap AS guru_nama,
        s.nama_lengkap AS siswa_nama
      FROM chat_conversations cc
      JOIN guru g ON cc.guru_id = g.id
      JOIN users u ON g.user_id = u.id
      JOIN siswa s ON cc.siswa_id = s.id
      WHERE cc.guru_id = ? 
        AND cc.ortu_id = ? 
        AND cc.siswa_id = ?
    `

    db.query(query, [guruId, ortuId, siswaId], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve(results[0] || null)
    })
  })
}

/**
 * Insert new conversation
 */
export const insertConversationOrtu = (data) => {
  return new Promise((resolve, reject) => {
    const { guru_id, ortu_id, siswa_id } = data

    const query = `
      INSERT INTO chat_conversations (
        guru_id, ortu_id, siswa_id, created_at, updated_at
      ) VALUES (?, ?, ?, NOW(), NOW())
    `

    db.query(query, [guru_id, ortu_id, siswa_id], (error, results) => {
      if (error) {
        return reject(error)
      }
      resolve({
        insertId: results.insertId,
        affectedRows: results.affectedRows,
      })
    })
  })
}
