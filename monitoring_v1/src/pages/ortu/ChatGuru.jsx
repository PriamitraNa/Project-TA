import { useState } from 'react'
import ContentWrapper from '../../components/ui/ContentWrapper'
import PageHeader from '../../components/ui/PageHeader'
import { FaComments } from 'react-icons/fa'
import { useChatGuru, ConversationList, ChatArea, NewChatModal } from '../../features/ortu/chat'

export default function ChatGuru() {
  // State for modal
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  // State for mobile view - show conversation list or chat area
  const [showChatOnMobile, setShowChatOnMobile] = useState(false)

  const {
    // State
    conversations,
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
    setMessageInput,
    loadConversations,
  } = useChatGuru()

  // Handle new chat click
  const handleNewChatClick = () => {
    setIsNewChatModalOpen(true)
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

  // Handle conversation created from new chat modal
  const handleConversationCreated = async (conversation, isExisting) => {
    // Reload conversations to get updated list
    await loadConversations()

    // Find the conversation in the updated list
    // The conversation ID might be in conversation.id or conversation.conversation_id
    const conversationId = conversation.id || conversation.conversation_id

    if (conversationId) {
      // Select the conversation to open chat area
      // Wait a bit for conversations to be loaded
      setTimeout(() => {
        const conv = conversations.find((c) => c.id === conversationId)
        if (conv) {
          handleSelectConversation(conv)
        } else {
          // If not found in list, create temporary conversation object
          handleSelectConversation({
            id: conversationId,
            guru_id: conversation.guru_id,
            guru_nama: conversation.guru_nama,
            ...conversation,
          })
        }
        // Show chat area on mobile
        setShowChatOnMobile(true)
      }, 300)
    }
  }

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FaComments />}
        title="Chat dengan Guru"
        description={`Komunikasi dengan guru tentang perkembangan anak${
          totalUnread > 0 ? ` (${totalUnread} pesan baru)` : ''
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
              isLoading={isLoadingConversations}
              searchQuery={searchQuery}
              onSelectConversation={handleSelectConv}
              onNewChatClick={handleNewChatClick}
              onSearchChange={handleSearch}
            />
          </div>

          {/* Chat Area - Show on mobile when conversation selected, always show on desktop */}
          <div className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1`}>
            <ChatArea
              selectedConversation={selectedConversation}
              messages={messages}
              messageInput={messageInput}
              isSending={isSending}
              isLoadingMessages={isLoadingMessages}
              messagesEndRef={messagesEndRef}
              onSendMessage={handleSendMessage}
              onMessageInputChange={setMessageInput}
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
