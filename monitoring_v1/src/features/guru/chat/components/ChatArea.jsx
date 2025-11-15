import { useState, useRef, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
import { formatTime, getInitials } from '../config';

export default function ChatArea({
  selectedConversation,
  conversationInfo,
  messages,
  onSendMessage,
  isSending
}) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    const success = await onSendMessage(messageInput);
    if (success) {
      setMessageInput('');
    }
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-lg">Pilih percakapan untuk memulai chat</p>
        </div>
      </div>
    );
  }

  const displayInfo = conversationInfo || selectedConversation;

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
            {getInitials(displayInfo?.ortu_nama)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {displayInfo?.ortu_nama}
            </h3>
            <p className="text-sm text-gray-600">
              Orang tua dari {displayInfo?.siswa_nama} {displayInfo?.kelas_nama && `• ${displayInfo.kelas_nama}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender_role === 'guru';
          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                {!isOwnMessage && (
                  <p className="text-xs text-gray-600 mb-1 ml-1">
                    {msg.sender_nama}
                  </p>
                )}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right mr-1' : 'ml-1'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="space-y-2">
          <div className="flex gap-2">
            <textarea
              placeholder="Ketik pesan..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={isSending}
              rows={2}
              maxLength={1000}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              variant="primary"
              icon={<FaPaperPlane />}
              disabled={!messageInput.trim() || isSending}
              loading={isSending}
            >
              Kirim
            </Button>
          </div>
          {messageInput.length > 0 && (
            <div className="flex justify-between items-center px-1">
              <p className="text-xs text-gray-500">
                Tekan Enter untuk kirim, Shift+Enter untuk baris baru
              </p>
              <p className={`text-xs ${messageInput.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
                {messageInput.length}/1000
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

