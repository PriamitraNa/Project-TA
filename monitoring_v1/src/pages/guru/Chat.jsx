import { useState } from 'react';
import ContentWrapper from '../../components/ui/ContentWrapper';
import PageHeader from '../../components/ui/PageHeader';
import { FaComments } from 'react-icons/fa';
import { 
  useChat,
  ConversationList,
  ChatArea,
  NewChatModal
} from '../../features/guru/chat';

export default function Chat() {
  // State for modal
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

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
  } = useChat();

  // Handle new chat click
  const handleNewChatClick = () => {
    setIsNewChatModalOpen(true);
  };

  // Handle conversation created (new or existing)
  const handleConversationCreated = (conversation, isExisting) => {
    if (!isExisting) {
      // Add new conversation to list
      addConversation(conversation);
    }
    // Select the conversation
    handleSelectConversation(conversation);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FaComments />}
        title="Chat dengan Orang Tua"
        description={`Komunikasi informal dengan orang tua siswa ${totalUnread > 0 ? `(${totalUnread} pesan baru)` : ''}`}
      />

      {/* Chat Container */}
      <ContentWrapper>
        <div className="flex h-[calc(100vh-280px)] bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Conversations Sidebar */}
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            onNewChatClick={handleNewChatClick}
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            isLoading={isLoading}
          />

          {/* Chat Area */}
          <ChatArea
            selectedConversation={selectedConversation}
            conversationInfo={conversationInfo}
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />
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
  );
}
