import chatService from '../../services/ortu/chatService.js'

/**
 * GET /api/ortu/chat/conversations
 * Get list conversations orang tua dengan guru-guru
 */
export const getConversations = async (req, res, next) => {
  try {
    // Get siswa_id dari token (ortu login dengan NISN, jadi siswa_id ada di token)
    const siswaId = req.user.siswa_id

    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan dalam token',
      })
    }

    // Get query params
    const { search } = req.query

    // Call service
    const data = await chatService.getConversationsService(siswaId, { search })

    res.status(200).json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error in getConversations:', error)
    next(error)
  }
}

/**
 * GET /api/ortu/chat/conversations/:id/messages
 * Get all messages dalam conversation + auto mark as read
 */
export const getMessages = async (req, res, next) => {
  try {
    // Get siswa_id dari token
    const siswaId = req.user.siswa_id

    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan dalam token',
      })
    }

    const { id } = req.params

    // Call service
    const data = await chatService.getMessagesService(siswaId, id)

    res.status(200).json({
      status: 'success',
      data,
    })
  } catch (error) {
    // Handle not found or forbidden
    if (
      error.message === 'Percakapan tidak ditemukan atau Anda tidak memiliki akses' ||
      error.message === 'Conversation ID tidak ditemukan'
    ) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
      })
    }

    console.error('Error in getMessages:', error)
    next(error)
  }
}

/**
 * POST /api/ortu/chat/conversations/:id/messages
 * Send message baru ke guru
 */
export const sendMessage = async (req, res, next) => {
  try {
    // Get siswa_id from JWT token
    const siswaId = req.user.siswa_id
    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan dalam token',
      })
    }

    // Get user_id from token
    const userId = req.user.id
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User ID tidak ditemukan dalam token',
      })
    }

    // Get conversation_id from params
    const { id } = req.params

    // Get message from body
    const { message } = req.body

    // Call service
    const data = await chatService.sendMessageService(siswaId, userId, id, { message })

    res.status(201).json({
      status: 'success',
      message: 'Pesan berhasil dikirim',
      data,
    })
  } catch (error) {
    // Handle specific errors
    if (error.message === 'Pesan tidak boleh kosong') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      })
    }

    if (error.message === 'Pesan maksimal 1000 karakter') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      })
    }

    if (error.message === 'Percakapan tidak ditemukan atau Anda tidak memiliki akses') {
      return res.status(404).json({
        status: 'error',
        message: error.message,
      })
    }

    if (error.message && error.message.includes('Terlalu cepat!')) {
      return res.status(429).json({
        status: 'error',
        message: error.message,
      })
    }

    console.error('Error in sendMessage controller:', error)
    next(error)
  }
}

/**
 * GET /api/ortu/chat/guru-list
 * Get list guru untuk new chat
 */
export const getGuruList = async (req, res, next) => {
  try {
    // Get siswa_id from JWT token
    const siswaId = req.user.siswa_id
    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan dalam token',
      })
    }

    // Get filters from query
    const { search = '', filter = '' } = req.query

    // Call service
    const data = await chatService.getGuruForNewChatService(siswaId, {
      search,
      filter,
    })

    res.status(200).json({
      status: 'success',
      data: data,
    })
  } catch (error) {
    console.error('Error in getGuruList controller:', error)
    next(error)
  }
}

/**
 * POST /api/ortu/chat/conversations
 * Create new conversation dengan guru
 */
export const createConversation = async (req, res, next) => {
  try {
    // Get siswa_id from JWT token
    const siswaId = req.user.siswa_id
    if (!siswaId) {
      return res.status(401).json({
        status: 'error',
        message: 'Siswa ID tidak ditemukan dalam token',
      })
    }

    // Get user_id from token
    const userId = req.user.id
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User ID tidak ditemukan dalam token',
      })
    }

    // Get guru_id and initial_message from body
    const { guru_id, initial_message } = req.body

    // Call service
    const data = await chatService.createConversationService(siswaId, userId, {
      guru_id,
      initial_message,
    })

    // Return appropriate status code
    const statusCode = data.is_new ? 201 : 200

    res.status(statusCode).json({
      status: 'success',
      message: data.is_new ? 'Percakapan baru berhasil dibuat' : 'Percakapan sudah ada',
      data,
    })
  } catch (error) {
    // Handle specific errors
    if (error.message === 'guru_id wajib diisi') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      })
    }

    if (error.message === 'Guru tidak ditemukan') {
      return res.status(404).json({
        status: 'error',
        message: error.message,
      })
    }

    if (error.message === 'Guru ini tidak mengajar siswa Anda') {
      return res.status(403).json({
        status: 'error',
        message: error.message,
      })
    }

    if (error.message === 'Data orang tua tidak ditemukan') {
      return res.status(404).json({
        status: 'error',
        message: error.message,
      })
    }

    if (error.message === 'Pesan awal maksimal 1000 karakter') {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      })
    }

    console.error('Error in createConversation controller:', error)
    next(error)
  }
}
