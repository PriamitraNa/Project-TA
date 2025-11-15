import axios from "axios";
import { API_URL } from "../../api";

export const ChatService = {
    // GET /api/guru/chat/conversations - Get list percakapan guru dengan orang tua
    getConversations: async (search = '') => {
        const params = {};
        if (search) {
            params.search = search;
        }

        const res = await axios.get(`${API_URL}/guru/chat/conversations`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/chat/conversations/:id/messages - Get messages in a conversation
    getMessages: async (conversationId) => {
        const res = await axios.get(`${API_URL}/guru/chat/conversations/${conversationId}/messages`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/guru/chat/conversations/:id/messages - Send a new message
    sendMessage: async (conversationId, message) => {
        const res = await axios.post(
            `${API_URL}/guru/chat/conversations/${conversationId}/messages`,
            { message },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return res.data;
    },

    // POST /api/guru/chat/conversations/:id/mark-as-read - Mark messages as read
    markAsRead: async (conversationId) => {
        const res = await axios.post(
            `${API_URL}/guru/chat/conversations/${conversationId}/mark-as-read`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return res.data;
    },

    // GET /api/guru/chat/siswa - Get list siswa for starting new chat
    getSiswaList: async (search = '') => {
        const params = {};
        if (search) {
            params.search = search;
        }

        const res = await axios.get(`${API_URL}/guru/chat/siswa`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/guru/chat/conversations - Create new conversation
    createConversation: async (siswaId, initialMessage = '') => {
        const payload = { siswa_id: siswaId };
        if (initialMessage) {
            payload.initial_message = initialMessage;
        }

        const res = await axios.post(
            `${API_URL}/guru/chat/conversations`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return res.data;
    }
};

