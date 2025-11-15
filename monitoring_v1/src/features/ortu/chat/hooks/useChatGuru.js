import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ChatService } from '../../../../services/Ortu/ChatService'
import toast from 'react-hot-toast'

/**
 * Custom hook untuk mengelola chat dengan guru
 * Handle: conversations, messages, send, mark as read
 */
export function useChatGuru() {
  // State untuk conversations
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  // State untuk messages
  const [messages, setMessages] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  // State untuk send message
  const [messageInput, setMessageInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  // State untuk search
  const [searchQuery, setSearchQuery] = useState('')

  // Ref untuk auto scroll
  const messagesEndRef = useRef(null)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true)
      const response = await ChatService.getConversations({
        search: searchQuery,
      })

      if (response.status === 'success') {
        setConversations(response.data.conversations)

        // Don't auto-select first conversation
        // Let user manually click to open a conversation
      }
    } catch (error) {
      console.error('Error loading conversations:', error)

      if (error.response?.status === 401) {
        toast.error('Orang Tua ID tidak ditemukan dalam token')
      } else if (error.response?.status === 500) {
        toast.error('Terjadi kesalahan pada server')
      } else {
        toast.error('Gagal memuat daftar percakapan')
      }

      // Set empty conversations on error
      setConversations([])
    } finally {
      setIsLoadingConversations(false)
    }
  }, [searchQuery])

  // Reload conversations when search query changes
  useEffect(() => {
    loadConversations()
  }, [searchQuery, loadConversations])

  // Load messages from API
  const loadMessages = useCallback(async (conversationId) => {
    try {
      setIsLoadingMessages(true)
      const response = await ChatService.getMessages(conversationId)

      if (response.status === 'success') {
        // API auto marks guru messages as read and returns conversation info + unread_count
        setMessages(response.data.messages)

        // Update local conversations list unread count to match API (should be 0)
        if (typeof response.data.unread_count !== 'undefined') {
          setConversations((prevConvs) =>
            prevConvs.map((c) =>
              c.id === conversationId ? { ...c, unread_count: response.data.unread_count } : c
            )
          )
        }

        // Note: Don't update selectedConversation here to avoid triggering the useEffect again
        // The conversation info from API is already in the conversations list
      }
    } catch (error) {
      console.error('Error loading messages:', error)

      if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else if (error.response?.status === 404) {
        toast.error('Percakapan tidak ditemukan atau Anda tidak memiliki akses')
        // Clear selection and messages
        setSelectedConversation(null)
        setMessages([])
      } else if (error.response?.status === 500) {
        toast.error('Terjadi kesalahan pada server')
      } else {
        toast.error('Gagal memuat pesan')
      }
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  // Load messages when conversation is selected
  // Use selectedConversation.id to prevent infinite loop when conversation object changes
  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation?.id, loadMessages])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle send message
  const handleSendMessage = useCallback(
    async (e) => {
      if (e) e.preventDefault()

      const trimmedMessage = messageInput.trim()

      if (!trimmedMessage || !selectedConversation) return

      // Client-side validation
      if (trimmedMessage.length > 1000) {
        toast.error('Pesan maksimal 1000 karakter')
        return
      }

      try {
        setIsSending(true)
        const response = await ChatService.sendMessage(selectedConversation.id, trimmedMessage)

        if (response.status === 'success') {
          // Add new message to UI
          setMessages((prev) => [...prev, response.data])

          // Update conversation last message and timestamp from API response
          setConversations((prevConvs) =>
            prevConvs.map((c) =>
              c.id === selectedConversation.id
                ? {
                    ...c,
                    last_message: response.data.message,
                    last_message_time: response.data.created_at,
                  }
                : c
            )
          )

          setMessageInput('')
          toast.success('Pesan terkirim')

          // Auto scroll to bottom after sending
          setTimeout(() => scrollToBottom(), 100)
        }
      } catch (error) {
        console.error('Error sending message:', error)

        // Handle specific error cases
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Pesan tidak valid')
        } else if (error.response?.status === 401) {
          toast.error('Siswa ID tidak ditemukan dalam token')
        } else if (error.response?.status === 404) {
          toast.error('Percakapan tidak ditemukan atau Anda tidak memiliki akses')
        } else if (error.response?.status === 429) {
          // Rate limit error with countdown
          toast.error(error.response?.data?.message || 'Terlalu cepat! Tunggu sebentar.')
        } else if (error.response?.status === 500) {
          toast.error('Terjadi kesalahan pada server')
        } else {
          toast.error('Gagal mengirim pesan')
        }
      } finally {
        setIsSending(false)
      }
    },
    [messageInput, selectedConversation]
  )

  // Handle conversation select
  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation)
  }, [])

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  // Handle create new conversation
  const handleCreateConversation = useCallback(
    async (guruId, initialMessage = '') => {
      try {
        const requestData = {
          guru_id: guruId,
        }

        // Add initial message if provided and not empty
        const trimmedMessage = initialMessage.trim()
        if (trimmedMessage) {
          // Client-side validation
          if (trimmedMessage.length > 1000) {
            toast.error('Pesan awal maksimal 1000 karakter')
            return null
          }
          requestData.initial_message = trimmedMessage
        }

        const response = await ChatService.createConversation(requestData)

        if (response.status === 'success') {
          const { data } = response

          // Check if conversation is new or existing
          if (data.is_new === false) {
            // Existing conversation found
            toast.success('Anda sudah memiliki percakapan dengan guru ini')
          } else {
            // New conversation created
            if (trimmedMessage) {
              toast.success('Percakapan baru dibuat dan pesan terkirim!')
            } else {
              toast.success('Percakapan baru berhasil dibuat')
            }
          }

          // Reload conversations to get updated list
          await loadConversations()

          // Return conversation data so caller can navigate/select it
          return data
        }

        return null
      } catch (error) {
        console.error('Error creating conversation:', error)

        // Handle specific error responses
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Data tidak valid')
        } else if (error.response?.status === 401) {
          toast.error('Siswa ID tidak ditemukan dalam token')
        } else if (error.response?.status === 403) {
          toast.error(error.response?.data?.message || 'Guru ini tidak mengajar siswa Anda')
        } else if (error.response?.status === 404) {
          toast.error(error.response?.data?.message || 'Data tidak ditemukan')
        } else if (error.response?.status === 500) {
          toast.error('Terjadi kesalahan pada server')
        } else {
          toast.error('Gagal membuat percakapan baru')
        }

        return null
      }
    },
    [loadConversations]
  )

  // Backend already handles filtering and sorting, so just return conversations as is
  // No need client-side filtering anymore
  const displayConversations = useMemo(() => {
    return conversations
  }, [conversations])

  // Get total unread count
  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + conv.unread_count, 0)
  }, [conversations])

  return {
    // State
    conversations: displayConversations,
    selectedConversation,
    messages,
    messageInput,
    searchQuery,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    totalUnread,
    messagesEndRef,

    // Handlers
    handleSelectConversation,
    handleSendMessage,
    handleSearch,
    handleCreateConversation,
    setMessageInput,
    loadConversations,
  }
}
