import { Router } from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import {
  getConversations,
  getMessages,
  sendMessage,
  getGuruList,
  createConversation,
} from '../../controllers/ortu/chatController.js'

const router = Router()

// Apply authentication middleware
router.use(authMiddleware)

/**
 * GET /api/ortu/chat/conversations
 * Get list percakapan orang tua dengan guru-guru
 * Query params: search (optional)
 */
router.get('/conversations', getConversations)

/**
 * POST /api/ortu/chat/conversations
 * Create new conversation dengan guru
 * Body: { guru_id, initial_message (optional) }
 */
router.post('/conversations', createConversation)

/**
 * GET /api/ortu/chat/conversations/:id/messages
 * Get all messages dalam conversation + auto mark as read
 */
router.get('/conversations/:id/messages', getMessages)

/**
 * POST /api/ortu/chat/conversations/:id/messages
 * Send message baru ke guru
 * Body: { message }
 */
router.post('/conversations/:id/messages', sendMessage)

/**
 * GET /api/ortu/chat/guru-list
 * Get list guru untuk new chat
 * Query params: search, filter (optional)
 */
router.get('/guru-list', getGuruList)

export default router
