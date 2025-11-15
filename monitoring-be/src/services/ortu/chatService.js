import * as chatModel from '../../models/ortu/chatModel.js'

/**
 * Get conversations untuk ortu berdasarkan siswa_id
 */
export const getConversationsService = async (siswaId, filters = {}) => {
  try {
    // Validate siswaId
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }

    // Get conversations
    const conversations = await chatModel.getConversationsBySiswa(siswaId, filters)

    // Get total unread count
    const totalUnread = await chatModel.getTotalUnreadBySiswa(siswaId)

    // Format response
    return {
      conversations: conversations.map((conv) => ({
        id: conv.id,
        guru_id: conv.guru_id,
        guru_nama: conv.guru_nama,
        siswa_id: conv.siswa_id,
        siswa_nama: conv.siswa_nama,
        kelas_nama: conv.kelas_nama || '-',
        last_message: conv.last_message || '',
        last_message_time: conv.last_message_time,
        unread_count: conv.unread_count,
        is_online: conv.is_online,
      })),
      total_unread: totalUnread,
    }
  } catch (error) {
    console.error('Error in getConversationsService:', error)
    throw error
  }
}

/**
 * Get messages dalam conversation + auto mark as read
 */
export const getMessagesService = async (siswaId, conversationId) => {
  try {
    // Validate inputs
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }
    if (!conversationId) {
      throw new Error('Conversation ID tidak ditemukan')
    }

    // Check authorization: conversation harus untuk siswa ini
    const conversation = await chatModel.getConversationBySiswaId(conversationId, siswaId)
    if (!conversation) {
      throw new Error('Percakapan tidak ditemukan atau Anda tidak memiliki akses')
    }

    // Get all messages
    const messages = await chatModel.getMessagesByConversation(conversationId)

    // Auto mark messages from guru as read
    await chatModel.markMessagesAsReadOrtu(conversationId)

    // Reset unread count ortu
    await chatModel.resetUnreadCountOrtu(conversationId)

    // Format response
    return {
      conversation_info: {
        conversation_id: conversation.id,
        guru_nama: conversation.guru_nama,
        siswa_nama: conversation.siswa_nama,
        kelas_nama: conversation.kelas_nama || '-',
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_role: msg.sender_role,
        sender_nama: msg.sender_nama,
        message: msg.message,
        is_read: msg.sender_role === 'guru' ? true : msg.is_read, // Guru messages now marked as read
        read_at:
          msg.sender_role === 'guru' && !msg.read_at ? new Date().toISOString() : msg.read_at,
        created_at: msg.created_at,
      })),
      unread_count: 0, // After auto mark as read
    }
  } catch (error) {
    console.error('Error in getMessagesService:', error)
    throw error
  }
}

/**
 * Send message baru dengan rate limiting dan validation
 */
export const sendMessageService = async (siswaId, userId, conversationId, messageData) => {
  try {
    const { message } = messageData

    // Validation 1: Message tidak boleh kosong
    if (!message || message.trim() === '') {
      throw new Error('Pesan tidak boleh kosong')
    }

    // Validation 2: Message max 1000 characters
    if (message.length > 1000) {
      throw new Error('Pesan maksimal 1000 karakter')
    }

    // Authorization: Check conversation belongs to this siswa
    const conversation = await chatModel.getConversationBySiswaId(conversationId, siswaId)
    if (!conversation) {
      throw new Error('Percakapan tidak ditemukan atau Anda tidak memiliki akses')
    }

    // Rate Limiting: Check last message from ortu (30 seconds)
    const lastMessage = await chatModel.getLastMessageFromOrtu(conversationId)
    if (lastMessage) {
      const now = new Date()
      const lastMessageTime = new Date(lastMessage.created_at)
      const diffSeconds = (now - lastMessageTime) / 1000

      if (diffSeconds < 30) {
        const waitSeconds = Math.ceil(30 - diffSeconds)
        throw new Error(`Terlalu cepat! Tunggu ${waitSeconds} detik lagi untuk mengirim pesan.`)
      }
    }

    // Insert message
    const insertResult = await chatModel.insertMessage({
      conversation_id: conversationId,
      sender_id: userId,
      sender_role: 'ortu',
      message: message.trim(),
    })

    // Update conversation (last_message, last_message_time, unread_count_guru++)
    await chatModel.updateConversationAfterSendOrtu(conversationId, message.trim())

    // Get inserted message with full data
    const newMessage = await chatModel.getMessageById(insertResult.insertId)

    // Format response
    return {
      id: newMessage.id,
      conversation_id: newMessage.conversation_id,
      sender_id: newMessage.sender_id,
      sender_role: newMessage.sender_role,
      sender_nama: newMessage.sender_nama,
      message: newMessage.message,
      is_read: newMessage.is_read,
      read_at: newMessage.read_at,
      created_at: newMessage.created_at,
    }
  } catch (error) {
    console.error('Error in sendMessageService:', error)
    throw error
  }
}

/**
 * Get list guru untuk new chat
 */
export const getGuruForNewChatService = async (siswaId, filters = {}) => {
  try {
    // Validate siswaId
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }

    // Get guru list
    const guruList = await chatModel.getGuruForNewChat(siswaId, filters)

    // Format response
    return guruList.map((guru) => ({
      guru_id: guru.guru_id,
      guru_nama: guru.guru_nama,
      guru_username: guru.guru_username,
      kelas: guru.kelas || '-',
      kelas_id: guru.kelas_id,
      has_conversation: guru.has_conversation === 1 || guru.has_conversation === true,
      existing_conversation_id: guru.existing_conversation_id || null,
    }))
  } catch (error) {
    console.error('Error in getGuruForNewChatService:', error)
    throw error
  }
}

/**
 * Create new conversation dengan validasi lengkap
 */
export const createConversationService = async (siswaId, userId, data) => {
  try {
    const { guru_id, initial_message } = data

    // Validation 1: guru_id wajib diisi
    if (!guru_id) {
      throw new Error('guru_id wajib diisi')
    }

    // Validation 2: Check guru exists
    const guru = await chatModel.getGuruById(guru_id)
    if (!guru) {
      throw new Error('Guru tidak ditemukan')
    }

    // Authorization: Check guru mengajar siswa ini
    const mengajar = await chatModel.checkGuruMengajarSiswa(guru_id, siswaId)
    if (!mengajar) {
      throw new Error('Guru ini tidak mengajar siswa Anda')
    }

    // Get orang tua dari siswa
    const ortu = await chatModel.getOrtuBySiswa(siswaId)
    if (!ortu) {
      throw new Error('Data orang tua tidak ditemukan')
    }

    // Check if conversation already exists
    const existingConversation = await chatModel.checkConversationExistsOrtu(
      guru_id,
      ortu.orangtua_id,
      siswaId
    )

    if (existingConversation) {
      // Conversation already exists - return existing
      return {
        id: existingConversation.id,
        is_new: false,
        guru_id: existingConversation.guru_id,
        guru_nama: existingConversation.guru_nama,
        ortu_id: existingConversation.ortu_id,
        siswa_id: existingConversation.siswa_id,
        siswa_nama: existingConversation.siswa_nama,
        created_at: existingConversation.created_at,
      }
    }

    // Create new conversation
    const insertResult = await chatModel.insertConversationOrtu({
      guru_id: guru_id,
      ortu_id: ortu.orangtua_id,
      siswa_id: siswaId,
    })

    const newConversationId = insertResult.insertId

    // Send initial message if provided
    if (initial_message && initial_message.trim() !== '') {
      // Validate initial message length
      if (initial_message.length > 1000) {
        throw new Error('Pesan awal maksimal 1000 karakter')
      }

      // Insert initial message
      await chatModel.insertMessage({
        conversation_id: newConversationId,
        sender_id: userId,
        sender_role: 'ortu',
        message: initial_message.trim(),
      })

      // Update conversation
      await chatModel.updateConversationAfterSendOrtu(newConversationId, initial_message.trim())
    }

    // Return new conversation data
    return {
      id: newConversationId,
      is_new: true,
      guru_id: guru_id,
      guru_nama: guru.guru_nama,
      ortu_id: ortu.orangtua_id,
      siswa_id: siswaId,
      siswa_nama: null, // Will be populated by frontend
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error in createConversationService:', error)
    throw error
  }
}

export default {
  getConversationsService,
  getMessagesService,
  sendMessageService,
  getGuruForNewChatService,
  createConversationService,
}
