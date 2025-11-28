import Button from '../../../../components/ui/Button'
import { FaSearch, FaPlus, FaCircle } from 'react-icons/fa'
import { formatTime } from '../config'

/**
 * ConversationList Component
 * Sidebar with conversations list and search
 */
export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewChatClick,
  searchQuery,
  onSearchChange,
  isLoading,
}) {
  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col">
      {/* New Chat Button & Search */}
      <div className="p-3 md:p-4 border-b border-gray-200 space-y-3">
        <Button
          variant="primary"
          icon={<FaPlus />}
          onClick={onNewChatClick}
          className="w-full"
          size="sm"
        >
          New Chat
        </Button>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Cari orang tua siswa..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Tidak ada percakapan
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conv.id
                  ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 truncate">{conv.ortu_nama}</h4>
                    {conv.is_online === true && <FaCircle className="text-green-500 text-xs" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.siswa_nama}</p>
                  <p
                    className={`text-sm mt-1 truncate ${
                      conv.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {conv.last_message}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(conv.last_message_time)}
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
