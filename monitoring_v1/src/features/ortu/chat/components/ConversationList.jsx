import { FaCircle, FaPlus, FaSearch } from 'react-icons/fa'
import { formatTime } from '../config/utils'
import Button from '../../../../components/ui/Button'

/**
 * ConversationList Component
 * Display list of conversations with guru
 */
export default function ConversationList({
  conversations,
  selectedConversation,
  isLoading,
  searchQuery,
  onSelectConversation,
  onNewChatClick,
  onSearchChange,
}) {
  const hasNoResults = conversations.length === 0 && searchQuery.trim()
  const isEmpty = conversations.length === 0 && !searchQuery.trim()

  return (
    <>
      {/* New Chat Button & Search */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <Button
          variant="primary"
          icon={<FaPlus />}
          onClick={onNewChatClick}
          className="w-full"
          size="sm"
        >
          Chat Baru
        </Button>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Cari guru atau siswa..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
            Memuat percakapan...
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-sm">Belum ada percakapan</p>
            <p className="text-xs text-gray-400 mt-2">
              Klik "Chat Baru" untuk memulai percakapan dengan guru
            </p>
          </div>
        </div>
      ) : hasNoResults ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-sm">Tidak ada hasil</p>
            <p className="text-xs text-gray-400 mt-2">Coba kata kunci lain</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conv.id
                  ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Guru Name + Online Status */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{conv.guru_nama}</h4>
                    {conv.is_online === true && (
                      <FaCircle className="text-green-500 text-xs flex-shrink-0" />
                    )}
                  </div>

                  {/* Siswa Name */}
                  <p className="text-xs text-gray-500 truncate mb-1">Tentang: {conv.siswa_nama}</p>

                  {/* Last Message */}
                  <p
                    className={`text-sm truncate ${
                      conv.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {conv.last_message}
                  </p>
                </div>

                {/* Time + Unread Badge */}
                <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(conv.last_message_time)}
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full min-w-[20px] text-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
