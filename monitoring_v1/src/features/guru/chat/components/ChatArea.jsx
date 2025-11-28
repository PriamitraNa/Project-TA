import { useState, useRef, useEffect } from 'react'
import { FaComments, FaPaperPlane, FaArrowLeft } from 'react-icons/fa'
import { formatTime, getInitials } from '../config'

export default function ChatArea({
  selectedConversation,
  conversationInfo,
  messages,
  onSendMessage,
  isSending,
  onBackToList,
}) {
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef(null)

  // Auto scroll to bottom when new message
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!messageInput.trim()) return

    const success = await onSendMessage(messageInput)
    if (success) {
      setMessageInput('')
    }
  }

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-lg">Pilih percakapan untuk memulai chat</p>
        </div>
      </div>
    )
  }

  const displayInfo = conversationInfo || selectedConversation

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Back Button - Only show on mobile */}
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Kembali ke daftar chat"
            >
              <FaArrowLeft className="text-gray-600 text-sm" />
            </button>
          )}
          <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(displayInfo?.ortu_nama)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {displayInfo?.ortu_nama}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {displayInfo?.siswa_nama} {displayInfo?.kelas_nama && `• ${displayInfo.kelas_nama}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender_role === 'guru'
          return (
            <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {!isOwnMessage && (
                  <p className="text-xs text-gray-600 mb-1 ml-1">{msg.sender_nama}</p>
                )}
                <div
                  className={`px-3 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
                <p
                  className={`text-xs text-gray-500 mt-0.5 ${
                    isOwnMessage ? 'text-right mr-1' : 'ml-1'
                  }`}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-2 border-t border-gray-200 bg-white flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-1.5 items-center">
          <textarea
            placeholder="Ketik pesan..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            disabled={isSending}
            rows={1}
            maxLength={1000}
            className="flex-1 px-2.5 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none max-h-[80px] overflow-y-auto"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isSending}
            className="flex-shrink-0 w-9 h-9 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
          >
            <FaPaperPlane className="text-white text-xs" />
          </button>
        </form>
      </div>
    </div>
  )
}
