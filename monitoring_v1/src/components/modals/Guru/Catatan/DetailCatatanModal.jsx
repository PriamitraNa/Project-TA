import { useState, useRef, useEffect } from 'react';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import { FaSmile, FaMeh, FaFrown, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { CatatanService } from '../../../../services/Guru/catatan/CatatanService';
import toast from 'react-hot-toast';

export default function DetailCatatanModal({ isOpen, onClose, catatanId, onRefresh }) {
  const [catatan, setCatatan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const repliesEndRef = useRef(null);

  // Load catatan detail
  useEffect(() => {
    if (isOpen && catatanId) {
      loadCatatanDetail();
    }
  }, [isOpen, catatanId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCatatanDetail = async () => {
    try {
      setIsLoading(true);
      const response = await CatatanService.getById(catatanId);
      const data = response.data;
      
      // Map API response to component format
      const mappedData = {
        id: data.id,
        siswa_nama: data.siswa.nama,
        kelas_nama: data.kelas.nama,
        mata_pelajaran: data.mata_pelajaran?.nama || null,
        kategori: data.kategori,
        jenis: data.jenis,
        status: data.status.toLowerCase(),
        tanggal: data.tanggal,
        total_pesan: data.total_pesan,
        // Map diskusi to replies format
        replies: data.diskusi || []
      };
      
      setCatatan(mappedData);
    } catch (error) {
      console.error('Error loading catatan detail:', error);
      if (error.response?.status === 404) {
        toast.error('Catatan tidak ditemukan');
      } else {
        toast.error('Gagal memuat detail catatan');
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto scroll to bottom when replies change
  useEffect(() => {
    if (catatan?.replies) {
      scrollToBottom();
    }
  }, [catatan?.replies]);

  const scrollToBottom = () => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle send reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = replyMessage.trim();
    
    // Validation - only check if empty
    if (!trimmedMessage) {
      toast.error('Pesan tidak boleh kosong');
      return;
    }
    
    try {
      setIsSendingReply(true);
      const response = await CatatanService.addReply(catatanId, trimmedMessage);
      
      // Update catatan with full updated diskusi from API
      setCatatan(prev => ({
        ...prev,
        total_pesan: response.data.total_pesan,
        status: response.data.status.toLowerCase(),
        replies: response.data.diskusi || []  // Full updated diskusi from API
      }));
      
      setReplyMessage('');
      toast.success(response.message || 'Balasan berhasil ditambahkan');
      onRefresh?.(); // Refresh parent list
    } catch (error) {
      console.error('Error sending reply:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Data tidak valid');
      } else if (error.response?.status === 404) {
        toast.error('Catatan tidak ditemukan');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal mengirim balasan');
      }
    } finally {
      setIsSendingReply(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get kategori badge
  const getKategoriBadge = (kategori) => {
    const configs = {
      'positif': {
        icon: <FaSmile className="inline mr-1" />,
        className: 'bg-green-100 text-green-800 border-green-300'
      },
      'negatif': {
        icon: <FaFrown className="inline mr-1" />,
        className: 'bg-red-100 text-red-800 border-red-300'
      },
      'netral': {
        icon: <FaMeh className="inline mr-1" />,
        className: 'bg-gray-100 text-gray-800 border-gray-300'
      }
    };

    const config = configs[kategori?.toLowerCase()] || configs.netral;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
        {config.icon}
        {kategori}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Catatan Siswa"
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Memuat data...</div>
        </div>
      ) : catatan ? (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Header Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {catatan.siswa_nama}
                </h3>
                <p className="text-xs text-gray-600">Kelas {catatan.kelas_nama}</p>
              </div>
              <div className="text-right">
                {getKategoriBadge(catatan.kategori)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Tanggal:</span>
                <p className="font-medium text-gray-900">
                  {catatan.tanggal}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Jenis:</span>
                <p className="font-medium text-gray-900">{catatan.jenis}</p>
              </div>
              {catatan.mata_pelajaran && (
                <div>
                  <span className="text-gray-600">Mata Pelajaran:</span>
                  <p className="font-medium text-gray-900">{catatan.mata_pelajaran}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-medium text-gray-900">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    catatan.status === 'terkirim' 
                      ? 'bg-green-100 text-green-800' 
                      : catatan.status === 'dibaca'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {catatan.status === 'terkirim' ? 'Terkirim' : catatan.status === 'dibaca' ? 'Dibaca' : 'Draft'}
                  </span>
                </p>
              </div>
            </div>

            {catatan.dibaca_pada && (
              <div className="text-xs">
                <span className="text-gray-600">Dibaca pada:</span>
                <p className="font-medium text-gray-900">{formatDate(catatan.dibaca_pada)}</p>
              </div>
            )}
          </div>

          {/* Isi Catatan - dari pesan pertama di diskusi */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Isi Catatan:</label>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {catatan.replies && catatan.replies.length > 0 
                  ? catatan.replies[0].pesan 
                  : '-'}
              </p>
            </div>
          </div>

          {/* Tindak Lanjut */}
          {catatan.tindak_lanjut && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Tindak Lanjut:</label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{catatan.tindak_lanjut}</p>
              </div>
            </div>
          )}

          {/* Lampiran */}
          {catatan.lampiran && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Lampiran:</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                <a 
                  href={catatan.lampiran} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 text-xs underline"
                >
                  Lihat Lampiran
                </a>
              </div>
            </div>
          )}

          {/* Thread Diskusi / Replies */}
          <div className="border-t pt-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-3">
              Diskusi dengan Orang Tua ({catatan.replies?.length || 0})
            </h4>

            {/* Diskusi List */}
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {catatan.replies && catatan.replies.length > 0 ? (
                catatan.replies.map((message) => {
                  const isFromOrtu = message.pengirim.role === 'Orangtua';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromOrtu ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] ${isFromOrtu ? 'order-1' : 'order-2'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${
                            isFromOrtu ? 'text-blue-600' : 'text-emerald-600'
                          }`}>
                            {isFromOrtu ? '👤 ' + message.pengirim.nama : '👨‍🏫 ' + message.pengirim.nama}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isFromOrtu
                              ? 'bg-blue-50 text-gray-900 border border-blue-200'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.pesan}
                          </p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${
                          isFromOrtu ? 'text-left ml-1' : 'text-right mr-1'
                        }`}>
                          {message.tanggal}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Belum ada balasan dari orang tua
                </div>
              )}
              <div ref={repliesEndRef} />
            </div>

            {/* Reply Input - Selalu tampil untuk guru */}
            <form onSubmit={handleSendReply} className="space-y-2 mt-3 pt-3 border-t">
              <div className="relative">
                <textarea
                  placeholder="Tulis balasan untuk orang tua..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  disabled={isSendingReply}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<FaPaperPlane />}
                  disabled={!replyMessage.trim() || isSendingReply}
                  loading={isSendingReply}
                >
                  Kirim Balasan
                </Button>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t sticky bottom-0 bg-white">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              icon={<FaTimes />}
            >
              Tutup
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Data catatan tidak ditemukan
        </div>
      )}
    </Modal>
  );
}

