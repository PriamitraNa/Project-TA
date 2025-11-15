// src/services/Ortu/ChatService.js

import axios from 'axios'
import { API_URL } from '../api'

export const ChatService = {
  /**
   * Get all conversations for Ortu
   * GET /api/ortu/chat/conversations
   * @param {Object} params - Query params
   * @param {String} params.search - Search guru nama atau mapel
   * @returns {Promise<Object>} List of conversations
   */
  getConversations: async (params = {}) => {
    const { search = '' } = params

    // Build query string
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)

    const url = search
      ? `${API_URL}/ortu/chat/conversations?${queryParams.toString()}`
      : `${API_URL}/ortu/chat/conversations`

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * Get messages in a conversation
   * @param {Number} conversationId - Conversation ID
   * @returns {Promise<Object>} List of messages
   */
  getMessages: async (conversationId) => {
    const url = `${API_URL}/ortu/chat/conversations/${conversationId}/messages`
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })

    return res.data
  },

  /**
   * Send a message (reply to guru)
   * POST /api/ortu/chat/conversations/:id/messages
   * @param {Number} conversationId - Conversation ID
   * @param {String} message - Message content
   * @returns {Promise<Object>} Sent message
   */
  sendMessage: async (conversationId, message) => {
    const url = `${API_URL}/ortu/chat/conversations/${conversationId}/messages`

    const res = await axios.post(
      url,
      { message },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return res.data
  },

  /**
   * Mark messages as read
   * @param {Number} conversationId - Conversation ID
   * @returns {Promise<Object>} Success response
   */
  markAsRead: async (conversationId) => {
    console.log('MOCK API (Ortu): Marking conversation as read:', conversationId)

    const conv = MOCK_CONVERSATIONS.find((c) => c.id === conversationId)
    if (conv) {
      conv.unread_count = 0
    }

    if (MOCK_MESSAGES[conversationId]) {
      MOCK_MESSAGES[conversationId].forEach((msg) => {
        if (msg.sender_role === 'guru') {
          msg.is_read = true
        }
      })
    }

    return Promise.resolve({
      status: 'success',
      message: 'Pesan ditandai sudah dibaca',
    })
  },

  /**
   * Get list of guru for new chat
   * GET /api/ortu/chat/guru-list
   * @param {Object} params - Query params
   * @param {String} params.search - Search guru nama
   * @param {String} params.filter - Filter: 'no_conversation'
   * @returns {Promise<Object>} List of guru
   */
  getGuruList: async (params = {}) => {
    const { search = '', filter = '' } = params

    // Build query string
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (filter) queryParams.append('filter', filter)

    const queryString = queryParams.toString()
    const url = queryString
      ? `${API_URL}/ortu/chat/guru-list?${queryString}`
      : `${API_URL}/ortu/chat/guru-list`

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })

    return res.data
  },

  /**
   * Create new conversation with guru
   * POST /api/ortu/chat/conversations
   * @param {Object} data - Request body
   * @param {Number} data.guru_id - Guru ID
   * @param {String} data.initial_message - Initial message (optional, max 1000 chars)
   * @returns {Promise<Object>} Created or existing conversation
   */
  createConversation: async (data) => {
    const url = `${API_URL}/ortu/chat/conversations`

    const res = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    })

    return res.data
  },
}
