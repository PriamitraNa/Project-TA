import * as chatModel from '../../models/guru/chatModel.js';

/**
 * Get conversations untuk guru
 */
export const getConversationsService = async (guruId, filters = {}) => {
  try {
    // Validate guruId
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan');
    }

    // Get conversations
    const conversations = await chatModel.getConversationsByGuru(guruId, filters);

    // Get total unread count
    const totalUnread = await chatModel.getTotalUnreadByGuru(guruId);

    // Format response
    return {
      conversations: conversations.map(conv => ({
        id: conv.id,
        ortu_id: conv.ortu_id,
        ortu_nama: conv.ortu_nama,
        siswa_id: conv.siswa_id,
        siswa_nama: conv.siswa_nama,
        kelas_nama: conv.kelas_nama || '-',
        last_message: conv.last_message || '',
        last_message_time: conv.last_message_time,
        unread_count: conv.unread_count,
        is_online: conv.is_online
      })),
      total_unread: totalUnread
    };
  } catch (error) {
    console.error('Error in getConversationsService:', error);
    throw error;
  }
};

/**
 * Get messages dalam conversation + auto mark as read
 */
export const getMessagesService = async (guruId, conversationId) => {
  try {
    // Validate inputs
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan');
    }
    if (!conversationId) {
      throw new Error('Conversation ID tidak ditemukan');
    }

    // Check authorization: conversation harus milik guru ini
    const conversation = await chatModel.getConversationById(conversationId, guruId);
    if (!conversation) {
      throw new Error('Percakapan tidak ditemukan atau Anda tidak memiliki akses');
    }

    // Get all messages
    const messages = await chatModel.getMessagesByConversation(conversationId);

    // Auto mark messages from ortu as read
    await chatModel.markMessagesAsRead(conversationId);

    // Reset unread count guru
    await chatModel.resetUnreadCountGuru(conversationId);

    // Format response
    return {
      conversation_info: {
        conversation_id: conversation.id,
        ortu_nama: conversation.ortu_nama,
        siswa_nama: conversation.siswa_nama,
        kelas_nama: conversation.kelas_nama || '-'
      },
      messages: messages.map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_role: msg.sender_role,
        sender_nama: msg.sender_nama,
        message: msg.message,
        is_read: msg.sender_role === 'ortu' ? true : msg.is_read, // Ortu messages now marked as read
        read_at: msg.sender_role === 'ortu' && !msg.read_at ? new Date().toISOString() : msg.read_at,
        created_at: msg.created_at
      })),
      unread_count: 0 // After auto mark as read
    };
  } catch (error) {
    console.error('Error in getMessagesService:', error);
    throw error;
  }
};

/**
 * Send message baru dengan rate limiting dan validation
 */
export const sendMessageService = async (guruId, userId, conversationId, messageData) => {
  try {
    const { message } = messageData;

    // Validation 1: Message tidak boleh kosong
    if (!message || message.trim() === '') {
      throw new Error('Pesan tidak boleh kosong');
    }

    // Validation 2: Message max 1000 characters
    if (message.length > 1000) {
      throw new Error('Pesan maksimal 1000 karakter');
    }

    // Authorization: Check conversation belongs to this guru
    const conversation = await chatModel.getConversationById(conversationId, guruId);
    if (!conversation) {
      throw new Error('Percakapan tidak ditemukan atau Anda tidak memiliki akses');
    }

    // Rate Limiting: Check last message from guru (30 seconds)
    const lastMessage = await chatModel.getLastMessageFromGuru(conversationId);
    if (lastMessage) {
      const now = new Date();
      const lastMessageTime = new Date(lastMessage.created_at);
      const diffSeconds = (now - lastMessageTime) / 1000;
      
      if (diffSeconds < 30) {
        const waitSeconds = Math.ceil(30 - diffSeconds);
        throw new Error(`Terlalu cepat! Tunggu ${waitSeconds} detik lagi untuk mengirim pesan.`);
      }
    }

    // Insert message
    const insertResult = await chatModel.insertMessage({
      conversation_id: conversationId,
      sender_id: userId,
      sender_role: 'guru',
      message: message.trim()
    });

    // Update conversation (last_message, last_message_time, unread_count_ortu++)
    await chatModel.updateConversationAfterSend(conversationId, message.trim());

    // Get inserted message with full data
    const newMessage = await chatModel.getMessageById(insertResult.insertId);

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
      created_at: newMessage.created_at
    };
  } catch (error) {
    console.error('Error in sendMessageService:', error);
    throw error;
  }
};

/**
 * Get list siswa untuk new chat
 */
export const getSiswaForNewChatService = async (guruId, filters = {}) => {
  try {
    // Validate guruId
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan');
    }

    // Get siswa list
    const siswaList = await chatModel.getSiswaForNewChat(guruId, filters);

    // Format response
    return siswaList.map(siswa => ({
      siswa_id: siswa.siswa_id,
      nama_lengkap: siswa.nama_lengkap,
      nisn: siswa.nisn,
      kelas: siswa.kelas || '-',
      kelas_id: siswa.kelas_id,
      ortu_id: siswa.ortu_id,
      ortu_nama: siswa.ortu_nama || '-',
      has_conversation: siswa.has_conversation === 1 || siswa.has_conversation === true,
      existing_conversation_id: siswa.existing_conversation_id || null
    }));
  } catch (error) {
    console.error('Error in getSiswaForNewChatService:', error);
    throw error;
  }
};

/**
 * Create new conversation dengan validasi lengkap
 */
export const createConversationService = async (guruId, userId, data) => {
  try {
    const { siswa_id, initial_message } = data;

    // Validation 1: siswa_id wajib diisi
    if (!siswa_id) {
      throw new Error('siswa_id wajib diisi');
    }

    // Validation 2: Check siswa exists
    const siswa = await chatModel.getSiswaById(siswa_id);
    if (!siswa) {
      throw new Error('Siswa tidak ditemukan');
    }

    // Authorization: Check guru mengampu siswa
    const mengampu = await chatModel.checkGuruMengampuSiswa(guruId, siswa_id);
    if (!mengampu) {
      throw new Error('Anda tidak mengampu siswa ini');
    }

    // Get orang tua dari siswa
    const ortu = await chatModel.getOrtuBySiswa(siswa_id);
    if (!ortu) {
      throw new Error('Siswa tidak memiliki orang tua terdaftar');
    }

    // Check if conversation already exists
    const existingConversation = await chatModel.checkConversationExists(
      guruId,
      ortu.orangtua_id,
      siswa_id
    );

    if (existingConversation) {
      // Conversation already exists - return existing
      return {
        id: existingConversation.id,
        is_new: false,
        guru_id: existingConversation.guru_id,
        ortu_id: existingConversation.ortu_id,
        ortu_nama: existingConversation.ortu_nama,
        siswa_id: existingConversation.siswa_id,
        siswa_nama: existingConversation.siswa_nama,
        created_at: existingConversation.created_at
      };
    }

    // Create new conversation
    const insertResult = await chatModel.insertConversation({
      guru_id: guruId,
      ortu_id: ortu.orangtua_id,
      siswa_id: siswa_id
    });

    const newConversationId = insertResult.insertId;

    // Send initial message if provided
    if (initial_message && initial_message.trim() !== '') {
      // Validate initial message length
      if (initial_message.length > 1000) {
        throw new Error('Pesan awal maksimal 1000 karakter');
      }

      // Insert initial message
      await chatModel.insertMessage({
        conversation_id: newConversationId,
        sender_id: userId,
        sender_role: 'guru',
        message: initial_message.trim()
      });

      // Update conversation
      await chatModel.updateConversationAfterSend(newConversationId, initial_message.trim());
    }

    // Return new conversation data
    return {
      id: newConversationId,
      is_new: true,
      guru_id: guruId,
      ortu_id: ortu.orangtua_id,
      ortu_nama: ortu.ortu_nama,
      siswa_id: siswa_id,
      siswa_nama: siswa.nama_lengkap,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in createConversationService:', error);
    throw error;
  }
};

export default {
  getConversationsService,
  getMessagesService,
  sendMessageService,
  getSiswaForNewChatService,
  createConversationService
};

