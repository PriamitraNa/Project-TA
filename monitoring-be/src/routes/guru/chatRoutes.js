import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  getSiswaForNewChat,
  createConversation
} from '../../controllers/guru/chatController.js';

const router = Router();

// Apply authentication middleware
router.use(authMiddleware);

/**
 * GET /api/guru/chat/conversations
 * Get daftar percakapan guru dengan orangtua
 * Query params: search (optional)
 */
router.get('/conversations', getConversations);

/**
 * POST /api/guru/chat/conversations
 * Create new conversation
 * Body: { siswa_id, initial_message (optional) }
 */
router.post('/conversations', createConversation);

/**
 * GET /api/guru/chat/conversations/:id/messages
 * Get messages dalam conversation + auto mark as read
 * Params: id (conversation_id)
 */
router.get('/conversations/:id/messages', getMessages);

/**
 * POST /api/guru/chat/conversations/:id/messages
 * Send message baru
 * Params: id (conversation_id)
 * Body: { message }
 */
router.post('/conversations/:id/messages', sendMessage);

/**
 * GET /api/guru/chat/siswa
 * Get list siswa untuk new chat
 * Query params: search (optional), filter (optional: 'no_conversation')
 */
router.get('/siswa', getSiswaForNewChat);

export default router;

