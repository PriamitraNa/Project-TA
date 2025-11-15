import { useEffect, useState } from 'react';
import Button from '../../../../components/ui/Button';
import { FaSearch, FaComments, FaFilter, FaCheckCircle } from 'react-icons/fa';
import { useSiswaList } from '../hooks';
import { ChatService } from '../../../../services/Guru/chat/ChatService';
import toast from 'react-hot-toast';

export default function NewChatModal({
  isOpen,
  onClose,
  conversations,
  onConversationCreated
}) {
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [initialMessage, setInitialMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const {
    siswaList,
    isLoading,
    searchQuery,
    showOnlyNoConversation,
    siswaWithConversation,
    siswaWithoutConversation,
    loadSiswaList,
    handleSearch,
    toggleFilter,
    resetSearch,
  } = useSiswaList();

  useEffect(() => {
    if (isOpen) {
      loadSiswaList();
    }
  }, [isOpen, loadSiswaList]);

  const handleSelectSiswa = (siswa) => {
    if (siswa.has_conversation && siswa.existing_conversation_id) {
      const existingConv = conversations.find(c => c.id === siswa.existing_conversation_id);
      if (existingConv) {
        onConversationCreated(existingConv, true);
        handleClose();
        toast.success('Membuka percakapan yang sudah ada');
        return;
      }
    }
    
    setSelectedSiswa(siswa);
  };

  const handleStartNewChat = async () => {
    if (!selectedSiswa) return;
    
    try {
      setIsSending(true);
      const response = await ChatService.createConversation(
        selectedSiswa.siswa_id,
        initialMessage.trim()
      );
      const conversationData = response.data;
      
      const conversation = {
        id: conversationData.id,
        ortu_id: conversationData.ortu_id,
        ortu_nama: conversationData.ortu_nama,
        siswa_id: conversationData.siswa_id,
        siswa_nama: conversationData.siswa_nama,
        last_message: initialMessage.trim() || '',
        last_message_time: conversationData.created_at,
        unread_count: 0,
        is_online: false
      };
      
      if (conversationData.is_new) {
        onConversationCreated(conversation, false);
        toast.success('Percakapan baru dimulai');
      } else {
        onConversationCreated(conversation, true);
        toast.success('Membuka percakapan yang sudah ada');
      }
      
      handleClose();
    } catch (error) {
      console.error('Error starting new chat:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Data siswa tidak valid');
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak mengampu siswa ini');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memulai percakapan');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetSearch();
    setSelectedSiswa(null);
    setInitialMessage('');
  };
  
  const handleBack = () => {
    setSelectedSiswa(null);
    setInitialMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedSiswa && (
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedSiswa ? 'Mulai Percakapan' : 'Pilih Siswa untuk Memulai Chat'}
                </h2>
                {!selectedSiswa && (
                  <p className="text-sm text-gray-500 mt-1">
                    {siswaWithConversation} sudah ada percakapan • {siswaWithoutConversation} belum
                  </p>
                )}
                {selectedSiswa && (
                  <p className="text-sm text-gray-500 mt-1">
                    Dengan {selectedSiswa.ortu_nama} (Orang tua {selectedSiswa.nama_lengkap})
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search & Filter - Only show when selecting siswa */}
          {!selectedSiswa && (
            <div className="mt-4 space-y-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari siswa, NISN, atau nama orang tua..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <button
                onClick={toggleFilter}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showOnlyNoConversation
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter className="text-sm" />
                <span className="text-sm font-medium">
                  {showOnlyNoConversation ? 'Menampilkan: Belum ada percakapan' : 'Tampilkan semua siswa'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedSiswa ? (
            /* Siswa List */
            isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Memuat daftar siswa...</div>
              </div>
            ) : siswaList.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">
                  {searchQuery ? 'Tidak ada siswa yang sesuai pencarian' : 'Tidak ada siswa'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {siswaList.map((siswa) => (
                  <button
                    key={siswa.siswa_id}
                    onClick={() => handleSelectSiswa(siswa)}
                    className={`w-full p-4 border rounded-lg transition-all text-left ${
                      siswa.has_conversation
                        ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {siswa.nama_lengkap}
                          </h4>
                          {siswa.has_conversation && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <FaCheckCircle className="text-[10px]" />
                              Ada Chat
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          NISN: {siswa.nisn} • Kelas: {siswa.kelas}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          Orang Tua: {siswa.ortu_nama || '-'}
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          siswa.has_conversation
                            ? 'bg-gray-200'
                            : 'bg-emerald-100'
                        }`}>
                          <FaComments className={siswa.has_conversation ? 'text-gray-600' : 'text-emerald-600'} />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            /* Initial Message Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan Pembuka (Opsional)
                </label>
                <textarea
                  placeholder="Ketik pesan pembuka untuk memulai percakapan..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <div className="flex justify-between items-center mt-2 px-1">
                  <p className="text-xs text-gray-500">
                    Anda dapat melewati ini dan langsung mulai percakapan
                  </p>
                  <p className={`text-xs ${initialMessage.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
                    {initialMessage.length}/1000
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200">
          {!selectedSiswa ? (
            <Button
              variant="secondary"
              onClick={handleClose}
              className="w-full"
            >
              Batal
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
              >
                Kembali
              </Button>
              <Button
                variant="primary"
                onClick={handleStartNewChat}
                loading={isSending}
                disabled={isSending}
                className="flex-1"
              >
                {initialMessage.trim() ? 'Kirim & Mulai Chat' : 'Mulai Chat'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

