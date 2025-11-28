import { useEffect, useState } from 'react'
import Button from '../../../../components/ui/Button'
import { FaSearch, FaComments, FaFilter, FaCheckCircle } from 'react-icons/fa'
import { ChatService } from '../../../../services/Ortu/ChatService'
import toast from 'react-hot-toast'

export default function NewChatModal({ isOpen, onClose, conversations, onConversationCreated }) {
  const [guruList, setGuruList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyNoConversation, setShowOnlyNoConversation] = useState(false)
  const [selectedGuru, setSelectedGuru] = useState(null)
  const [initialMessage, setInitialMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadGuruList()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      loadGuruList()
    }
  }, [searchQuery, showOnlyNoConversation])

  const loadGuruList = async () => {
    try {
      setIsLoading(true)
      const response = await ChatService.getGuruList({
        search: searchQuery,
        filter: showOnlyNoConversation ? 'no_conversation' : '',
      })

      if (response.status === 'success') {
        setGuruList(response.data)
      }
    } catch (error) {
      console.error('Error loading guru list:', error)

      if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else if (error.response?.status === 500) {
        toast.error('Terjadi kesalahan pada server')
      } else {
        toast.error('Gagal memuat daftar guru')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectGuru = (guru) => {
    if (guru.has_conversation && guru.existing_conversation_id) {
      const existingConv = conversations.find((c) => c.id === guru.existing_conversation_id)
      if (existingConv) {
        onConversationCreated(existingConv, true)
        handleClose()
        toast.success('Membuka percakapan yang sudah ada')
        return
      }
    }

    setSelectedGuru(guru)
  }

  const handleStartNewChat = async () => {
    if (!selectedGuru) return

    // Validate initial message if provided
    const trimmedMessage = initialMessage.trim()
    if (trimmedMessage && trimmedMessage.length > 1000) {
      toast.error('Pesan awal maksimal 1000 karakter')
      return
    }

    try {
      setIsSending(true)

      const requestData = {
        guru_id: selectedGuru.guru_id,
      }

      // Add initial message if provided
      if (trimmedMessage) {
        requestData.initial_message = trimmedMessage
      }

      const response = await ChatService.createConversation(requestData)

      if (response.status === 'success') {
        const { data } = response

        // Check if new or existing conversation
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

        // Pass conversation data to parent
        onConversationCreated(data, data.is_new === false)
        handleClose()
      }
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
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const handleBack = () => {
    setSelectedGuru(null)
    setInitialMessage('')
  }

  const resetForm = () => {
    setSearchQuery('')
    setShowOnlyNoConversation(false)
    setSelectedGuru(null)
    setInitialMessage('')
  }

  const toggleFilter = () => {
    setShowOnlyNoConversation((prev) => !prev)
  }

  const guruWithConversation = guruList.filter((g) => g.has_conversation).length
  const guruWithoutConversation = guruList.filter((g) => !g.has_conversation).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedGuru && (
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Kembali"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FaComments className="text-emerald-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    {selectedGuru ? 'Mulai Percakapan' : 'Pilih Guru untuk Chat'}
                  </h2>
                  {!selectedGuru && (
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                      {guruWithConversation > 0 && `${guruWithConversation} sudah chat • `}
                      {guruWithoutConversation} belum chat
                    </p>
                  )}
                  {selectedGuru && (
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                      {selectedGuru.guru_nama} • {selectedGuru.kelas}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
              aria-label="Tutup"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {!selectedGuru && (
            <div className="mt-3 md:mt-4 space-y-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Cari nama guru..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={toggleFilter}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                  showOnlyNoConversation
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter className="text-xs" />
                <span>
                  {showOnlyNoConversation ? 'Hanya yang belum chat' : 'Tampilkan semua guru'}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selectedGuru ? (
            isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Memuat daftar guru...</p>
                </div>
              </div>
            ) : guruList.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-gray-500">
                  <FaComments className="text-4xl md:text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-sm md:text-base">
                    {searchQuery
                      ? 'Tidak ada guru yang sesuai pencarian'
                      : showOnlyNoConversation
                      ? 'Semua guru sudah ada percakapan'
                      : 'Tidak ada guru'}
                  </p>
                  {searchQuery && (
                    <p className="text-xs text-gray-400 mt-2">Coba kata kunci lain</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {guruList.map((guru) => (
                  <button
                    key={guru.guru_id}
                    onClick={() => handleSelectGuru(guru)}
                    className={`w-full p-3 md:p-4 border rounded-lg transition-all text-left ${
                      guru.has_conversation
                        ? 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'
                        : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          guru.has_conversation ? 'bg-gray-200' : 'bg-emerald-100'
                        }`}
                      >
                        <span
                          className={`text-sm md:text-base font-semibold ${
                            guru.has_conversation ? 'text-gray-600' : 'text-emerald-600'
                          }`}
                        >
                          {guru.guru_nama?.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                            {guru.guru_nama}
                          </h4>
                          {guru.has_conversation && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                              <FaCheckCircle className="text-[10px]" />
                              <span className="hidden sm:inline">Chat</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 truncate">
                          Kelas: {guru.kelas}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          @{guru.guru_username}
                        </p>
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <FaComments
                          className={`text-lg md:text-xl ${
                            guru.has_conversation ? 'text-gray-400' : 'text-emerald-600'
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              {/* Info Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 md:p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-emerald-900 mb-1">Tips</h4>
                    <p className="text-xs text-emerald-700">
                      Anda bisa melewati pesan pembuka dan langsung memulai percakapan. Atau kirim
                      pesan pembuka untuk memperkenalkan topik diskusi.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan Pembuka (Opsional)
                </label>
                <textarea
                  placeholder="Contoh: Selamat pagi Pak/Bu, saya ingin bertanya tentang perkembangan anak saya..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
                />
                <div className="flex justify-between items-center mt-2 px-1">
                  <p className="text-xs text-gray-400">
                    {initialMessage.trim()
                      ? 'Pesan siap dikirim'
                      : 'Kosongkan untuk memulai tanpa pesan'}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      initialMessage.length > 1000
                        ? 'text-red-500'
                        : initialMessage.length > 900
                        ? 'text-orange-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {initialMessage.length}/1000
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200">
          {!selectedGuru ? (
            <Button variant="secondary" onClick={handleClose} className="w-full">
              Tutup
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                Kembali
              </Button>
              <Button
                variant="primary"
                onClick={handleStartNewChat}
                loading={isSending}
                disabled={
                  isSending || (initialMessage.trim() && initialMessage.trim().length > 1000)
                }
                className="flex-1"
              >
                {initialMessage.trim() ? 'Kirim & Mulai Chat' : 'Mulai Chat'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
