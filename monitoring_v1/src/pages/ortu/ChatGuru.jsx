import { useState } from 'react'
import ContentWrapper from '../../components/ui/ContentWrapper'
import PageHeader from '../../components/ui/PageHeader'
import { FaComments } from 'react-icons/fa'
import { useChatGuru, ConversationList, ChatArea, NewChatModal } from '../../features/ortu/chat'

export default function ChatGuru() {
  // State for modal
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)

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
      }, 300)
    }
  }

  return (
    <div className="space-y-6">
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
        <div className="flex h-[calc(100vh-280px)] bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              isLoading={isLoadingConversations}
              searchQuery={searchQuery}
              onSelectConversation={handleSelectConversation}
              onNewChatClick={handleNewChatClick}
              onSearchChange={handleSearch}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ChatArea
              selectedConversation={selectedConversation}
              messages={messages}
              messageInput={messageInput}
              isSending={isSending}
              isLoadingMessages={isLoadingMessages}
              messagesEndRef={messagesEndRef}
              onSendMessage={handleSendMessage}
              onMessageInputChange={setMessageInput}
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
