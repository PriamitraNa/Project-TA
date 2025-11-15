import { useState, useRef, useEffect } from 'react'
import Modal from '../../../ui/Modal'
import Button from '../../../ui/Button'
import { FaSmile, FaMeh, FaFrown, FaPaperPlane, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { CatatanAnakService } from '../../../../services/Ortu/catatan/CatatanAnakService'

export default function DetailCatatanModal({ isOpen, onClose, catatanId, onRefresh }) {
  const [catatan, setCatatan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const repliesEndRef = useRef(null)

  // Load catatan detail
  useEffect(() => {
    if (isOpen && catatanId) {
      loadCatatanDetail()
    }
  }, [isOpen, catatanId])

  const loadCatatanDetail = async () => {
    try {
      setIsLoading(true)
      const response = await CatatanAnakService.getDetail(catatanId)

      if (response.status === 'success') {
        setCatatan(response.data)
        // Refresh parent list setelah mark as read
        onRefresh?.()
      } else {
        toast.error('Data catatan tidak ditemukan')
        onClose()
      }
    } catch (error) {
      console.error('Error loading catatan detail:', error)

      if (error.response?.status === 404) {
        toast.error('Catatan tidak ditemukan')
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke catatan ini')
      } else if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else {
        toast.error('Gagal memuat detail catatan')
      }
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  // Auto scroll to bottom when diskusi changes
  useEffect(() => {
    if (catatan?.diskusi) {
      scrollToBottom()
    }
  }, [catatan?.diskusi])

  const scrollToBottom = () => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle send reply
  const handleSendReply = async (e) => {
    e.preventDefault()

    const trimmedMessage = replyMessage.trim()

    // Client-side validation
    if (!trimmedMessage) {
      toast.error('Pesan tidak boleh kosong')
      return
    }

    if (trimmedMessage.length > 5000) {
      toast.error('Pesan terlalu panjang. Maksimal 5000 karakter')
      return
    }

    try {
      setIsSendingReply(true)
      const response = await CatatanAnakService.sendReply(catatanId, trimmedMessage)

      if (response.status === 'success') {
        // Update catatan dengan data lengkap dari response (Option A)
        setCatatan(response.data.catatan)
        setReplyMessage('')
        toast.success('Balasan berhasil dikirim ke guru')

        // Refresh parent list untuk update "last activity"
        onRefresh?.()
      }
    } catch (error) {
      console.error('Error sending reply:', error)

      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Pesan tidak valid')
      } else if (error.response?.status === 404) {
        toast.error('Catatan tidak ditemukan')
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke catatan ini')
      } else if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else {
        toast.error('Gagal mengirim balasan')
      }
    } finally {
      setIsSendingReply(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get kategori badge
  const getKategoriBadge = (kategori) => {
    const configs = {
      positif: {
        icon: <FaSmile className="inline mr-1" />,
        className: 'bg-green-100 text-green-800 border-green-300',
      },
      negatif: {
        icon: <FaFrown className="inline mr-1" />,
        className: 'bg-red-100 text-red-800 border-red-300',
      },
      netral: {
        icon: <FaMeh className="inline mr-1" />,
        className: 'bg-gray-100 text-gray-800 border-gray-300',
      },
    }

    const config = configs[kategori?.toLowerCase()] || configs.netral

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
        {config.icon}
        {kategori}
      </span>
    )
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Catatan dari Guru" size="lg">
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
                <h3 className="text-base font-semibold text-gray-900">Catatan untuk Anak Anda</h3>
                <p className="text-xs text-gray-600">
                  {catatan.kelas?.nama ? `Kelas ${catatan.kelas.nama}` : ''}
                </p>
              </div>
              <div className="text-right">{getKategoriBadge(catatan.kategori)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Dari Guru:</span>
                <p className="font-medium text-gray-900">{catatan.guru?.nama || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Tanggal:</span>
                <p className="font-medium text-gray-900">{catatan.tanggal || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Jenis:</span>
                <p className="font-medium text-gray-900">{catatan.jenis}</p>
              </div>
              {catatan.mata_pelajaran?.nama && catatan.mata_pelajaran.nama !== '-' && (
                <div>
                  <span className="text-gray-600">Mata Pelajaran:</span>
                  <p className="font-medium text-gray-900">{catatan.mata_pelajaran.nama}</p>
                </div>
              )}
            </div>
          </div>

          {/* Isi Catatan */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Isi Catatan:</label>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {catatan.diskusi && catatan.diskusi.length > 0
                  ? catatan.diskusi[0].pesan
                  : 'Tidak ada isi catatan'}
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
            <h4 className="text-xs font-semibold text-gray-700 mb-2">
              Diskusi dengan Guru ({catatan.total_pesan || 0})
            </h4>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
              <p className="text-xs text-blue-800">
                💡 Anda dapat memberikan tanggapan atau bertanya kepada guru melalui kolom diskusi
                ini.
              </p>
            </div>

            {/* Replies List */}
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {catatan.diskusi && catatan.diskusi.length > 0 ? (
                catatan.diskusi.map((diskusiItem) => {
                  const isFromGuru = diskusiItem.pengirim?.role === 'Guru'
                  return (
                    <div
                      key={diskusiItem.id}
                      className={`flex ${isFromGuru ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] ${isFromGuru ? 'order-1' : 'order-2'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-medium ${
                              isFromGuru ? 'text-blue-600' : 'text-emerald-600'
                            }`}
                          >
                            {isFromGuru ? `👨‍🏫 ${diskusiItem.pengirim?.nama}` : '👤 Anda'}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isFromGuru
                              ? 'bg-blue-50 text-gray-900 border border-blue-200'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {diskusiItem.pesan}
                          </p>
                        </div>
                        <p
                          className={`text-xs text-gray-500 mt-1 ${
                            isFromGuru ? 'text-left ml-1' : 'text-right mr-1'
                          }`}
                        >
                          {diskusiItem.tanggal || '-'}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Belum ada diskusi. Anda dapat memberikan tanggapan di bawah ini.
                </div>
              )}
              <div ref={repliesEndRef} />
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendReply} className="space-y-2">
              <div className="relative">
                <textarea
                  placeholder="Tulis tanggapan atau pertanyaan untuk guru..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  disabled={isSendingReply}
                  rows={3}
                  maxLength={5000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {replyMessage.trim().length}/5000
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  💡 Balasan Anda akan dikirim langsung ke guru
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<FaPaperPlane />}
                  disabled={!replyMessage.trim() || isSendingReply}
                  loading={isSendingReply}
                >
                  Kirim ke Guru
                </Button>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t sticky bottom-0 bg-white">
            <Button variant="secondary" size="sm" onClick={onClose} icon={<FaTimes />}>
              Tutup
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">Data catatan tidak ditemukan</div>
      )}
    </Modal>
  )
}
