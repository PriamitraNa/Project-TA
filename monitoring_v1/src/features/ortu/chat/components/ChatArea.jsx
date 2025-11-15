import { FaComments, FaPaperPlane } from 'react-icons/fa'
import Button from '../../../../components/ui/Button'
import { formatTime, getInitials } from '../config/utils'

/**
 * ChatArea Component
 * Display chat messages and input for selected conversation
 */
export default function ChatArea({
  selectedConversation,
  messages,
  messageInput,
  isSending,
  isLoadingMessages,
  messagesEndRef,
  onSendMessage,
  onMessageInputChange,
}) {
  // No conversation selected
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
        <div className="text-center">
          <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Pilih percakapan untuk memulai chat</p>
          <p className="text-sm text-gray-500 mt-2">
            Pilih guru dari daftar di samping untuk melihat pesan
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {getInitials(selectedConversation.guru_nama)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {selectedConversation.guru_nama}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              Tentang {selectedConversation.siswa_nama}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
              Memuat pesan...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">Belum ada pesan</p>
              <p className="text-xs text-gray-400 mt-2">Mulai percakapan dengan guru</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwnMessage = msg.sender_role === 'ortu'
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {/* Sender Name (for guru messages) */}
                    {!isOwnMessage && (
                      <p className="text-xs text-gray-600 mb-1 ml-1">{msg.sender_nama}</p>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>

                    {/* Timestamp */}
                    <p
                      className={`text-xs text-gray-500 mt-1 ${
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
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={onSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              placeholder="Ketik pesan..."
              value={messageInput}
              onChange={(e) => onMessageInputChange(e.target.value)}
              disabled={isSending || isLoadingMessages}
              rows="2"
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 resize-none"
            />
            {/* Character Counter */}
            <div className="flex justify-between items-center mt-1 px-1">
              <p className="text-xs text-gray-400">
                {messageInput.length > 900 && (
                  <span className={messageInput.length > 1000 ? 'text-red-500' : 'text-orange-500'}>
                    {messageInput.length}/1000 karakter
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            icon={<FaPaperPlane />}
            disabled={
              !messageInput.trim() || isSending || isLoadingMessages || messageInput.length > 1000
            }
            loading={isSending}
          >
            Kirim
          </Button>
        </div>
      </form>
    </>
  )
}
