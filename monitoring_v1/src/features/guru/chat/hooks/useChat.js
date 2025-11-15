import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChatService } from '../../../../services/Guru/chat/ChatService';
import toast from 'react-hot-toast';

export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ChatService.getConversations(searchQuery);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Gagal memuat daftar percakapan');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const response = await ChatService.getMessages(conversationId);
      setMessages(response.data.messages);
      setConversationInfo(response.data.conversation_info);
      
      setConversations(prevConvs =>
        prevConvs.map(c =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (error) {
      console.error('Error loading messages:', error);
      if (error.response?.status === 404) {
        toast.error('Percakapan tidak ditemukan');
        setSelectedConversation(null);
        setMessages([]);
        setConversationInfo(null);
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke percakapan ini');
        setSelectedConversation(null);
        setMessages([]);
        setConversationInfo(null);
      } else {
        toast.error('Gagal memuat pesan');
      }
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation, loadMessages]);

  const handleSendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || !selectedConversation) return false;
    
    const trimmedMessage = messageText.trim();
    
    if (trimmedMessage.length > 1000) {
      toast.error('Pesan maksimal 1000 karakter');
      return false;
    }
    
    try {
      setIsSending(true);
      const response = await ChatService.sendMessage(selectedConversation.id, trimmedMessage);
      
      setMessages(prev => [...prev, response.data]);
      
      setConversations(prevConvs =>
        prevConvs.map(c =>
          c.id === selectedConversation.id
            ? { 
                ...c, 
                last_message: trimmedMessage, 
                last_message_time: response.data.created_at 
              }
            : c
        )
      );
      
      toast.success('Pesan terkirim');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Pesan tidak valid');
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke percakapan ini');
      } else if (error.response?.status === 429) {
        toast.error('Terlalu banyak pesan. Tunggu 30 detik.');
      } else {
        toast.error('Gagal mengirim pesan');
      }
      
      return false;
    } finally {
      setIsSending(false);
    }
  }, [selectedConversation]);

  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const displayConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (a.unread_count !== b.unread_count) {
        return b.unread_count - a.unread_count;
      }
      return new Date(b.last_message_time) - new Date(a.last_message_time);
    });
  }, [conversations]);

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + conv.unread_count, 0);
  }, [conversations]);

  const addConversation = useCallback((newConversation) => {
    setConversations(prev => [newConversation, ...prev]);
  }, []);

  return {
    conversations: displayConversations,
    selectedConversation,
    messages,
    conversationInfo,
    searchQuery,
    isLoading,
    isSending,
    totalUnread,
    handleSelectConversation,
    handleSendMessage,
    handleSearch,
    loadConversations,
    addConversation,
  };
}

