import Button from '../ui/Button'
import { FaPaperPlane, FaArrowLeft } from 'react-icons/fa6'

export default function ChatView({ conversation, onBack }) {
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Pilih Catatan untuk Dibaca</h3>
        <p className="text-sm text-slate-400 text-center max-w-sm">
          Pilih salah satu catatan dari guru di sebelah kiri untuk melihat detail dan membalasnya
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Chat */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-800">{conversation.studentName}</h3>
            <p className="text-sm text-slate-500">{conversation.parentName}</p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {conversation.timestamp}
            </div>
          </div>
        </div>
      </div>

      {/* Isi Chat */}
      {/* DIUBAH: Menambahkan min-h-0 untuk memastikan flexbox bekerja dengan benar */}
      <div className="flex-1 min-h-0 p-6 pb-2 overflow-y-auto bg-gradient-to-b from-slate-50 to-white space-y-6">
        {conversation.messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'ortu' ? 'justify-end' : 'justify-start'
            } ${index === conversation.messages.length - 1 ? 'mb-6' : ''}`}
          >
            {msg.sender === 'guru' && (
              <div className="p-2 bg-emerald-100 rounded-full flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            <div className={`max-w-lg ${msg.sender === 'ortu' ? 'order-first' : ''}`}>
              <div
                className={`p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'ortu'
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <div
                  className={`text-xs mt-2 ${
                    msg.sender === 'ortu' ? 'text-emerald-100/80' : 'text-slate-400'
                  } text-right`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>

            {msg.sender === 'ortu' && (
              <div className="p-2 bg-slate-100 rounded-full flex-shrink-0">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Balasan */}
      <div className="p-6 pt-6 bg-white border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Ketik balasan Anda di sini..."
            className="w-full pl-6 pr-16 py-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-sm transition-all"
          />
          <Button
            variant="primary"
            className="absolute right-2 top-1/2 -translate-y-1/2 !rounded-xl !p-3 shadow-lg hover:shadow-xl transition-all"
            icon={<FaPaperPlane />}
            iconOnly
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">Tekan Enter untuk mengirim pesan</p>
      </div>
    </div>
  )
}
