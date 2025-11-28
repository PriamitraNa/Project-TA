import { useState } from 'react'
import ContentWrapper from '../../components/ui/ContentWrapper'
import PageHeader from '../../components/ui/PageHeader'
import { FaComments } from 'react-icons/fa'
import { useChat, ConversationList, ChatArea, NewChatModal } from '../../features/guru/chat'

export default function Chat() {
  // State for modal
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  // State for mobile view - show conversation list or chat area
  const [showChatOnMobile, setShowChatOnMobile] = useState(false)

  const {
    conversations,
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
    addConversation,
  } = useChat()

  // Handle new chat click
  const handleNewChatClick = () => {
    setIsNewChatModalOpen(true)
  }

  // Handle conversation created (new or existing)
  const handleConversationCreated = (conversation, isExisting) => {
    if (!isExisting) {
      // Add new conversation to list
      addConversation(conversation)
    }
    // Select the conversation
    handleSelectConversation(conversation)
    // Show chat area on mobile
    setShowChatOnMobile(true)
  }

  // Handle select conversation - show chat on mobile
  const handleSelectConv = (conversation) => {
    handleSelectConversation(conversation)
    setShowChatOnMobile(true)
  }

  // Handle back to conversation list on mobile
  const handleBackToList = () => {
    setShowChatOnMobile(false)
  }

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FaComments />}
        title="Chat dengan Orang Tua"
        description={`Komunikasi informal dengan orang tua siswa ${
          totalUnread > 0 ? `(${totalUnread} pesan baru)` : ''
        }`}
      />

      {/* Chat Container */}
      <ContentWrapper>
        <div className="flex h-[calc(100vh-200px)] md:h-[calc(100vh-280px)] bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Conversations Sidebar - Hidden on mobile when chat is open */}
          <div className={`${showChatOnMobile ? 'hidden md:flex' : 'flex'} md:flex`}>
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConv}
              onNewChatClick={handleNewChatClick}
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              isLoading={isLoading}
            />
          </div>

          {/* Chat Area - Show on mobile when conversation selected, always show on desktop */}
          <div className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1`}>
            <ChatArea
              selectedConversation={selectedConversation}
              conversationInfo={conversationInfo}
              messages={messages}
              onSendMessage={handleSendMessage}
              isSending={isSending}
              onBackToList={handleBackToList}
            />
          </div>
        </div>
      </ContentWrapper>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        conversations={conversations}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}
