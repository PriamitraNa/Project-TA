import { FaPlus, FaMagnifyingGlass } from 'react-icons/fa6' // DIUBAH: FaSearch diganti
import Button from '../ui/Button'

export default function ConversationList({
  conversations,
  onSelect,
  activeConversationId,
  hideAddButton = false,
}) {
  return (
    <div className="border-r border-slate-200 h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Catatan dari Guru</h2>
            <p className="text-sm text-slate-500">Pilih untuk melihat detail catatan</p>
          </div>
        </div>
        {!hideAddButton && (
          <Button variant="primary" icon={<FaPlus />} fullWidth className="mt-4">
            Buat Catatan Baru
          </Button>
        )}
      </div>

      {/* Daftar Percakapan */}
      <div className="overflow-y-auto flex-1 p-2 max-h-[calc(100vh-200px)]">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">Belum ada catatan dari guru</p>
            <p className="text-sm text-slate-400 mt-1">Catatan akan muncul di sini</p>
          </div>
        ) : (
          conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => onSelect(convo.id)}
              className={`
                p-4 cursor-pointer rounded-xl transition-all duration-200 mb-2
                ${
                  activeConversationId === convo.id
                    ? 'bg-white shadow-lg border-2 border-emerald-200 transform scale-[1.02]'
                    : 'bg-white/70 hover:bg-white hover:shadow-md border border-slate-200'
                }
              `}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activeConversationId === convo.id ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  ></div>
                  <div className="font-semibold text-slate-800 text-sm">{convo.teacherName}</div>
                </div>
                <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  {convo.timestamp}
                </div>
              </div>

              <div className="ml-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Untuk: {convo.studentName}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {convo.lastMessage}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
