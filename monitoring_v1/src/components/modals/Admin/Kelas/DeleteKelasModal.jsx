import { useState } from 'react'
import { FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa'
import Button from '../../../ui/Button'
import { KelasService } from '../../../../services/Admin/kelas/KelasService'
import toast from 'react-hot-toast'

// ============================================================================
// COMPONENT
// ============================================================================

export default function DeleteKelasModal({ isOpen, onClose, onSuccess, kelasData }) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleConfirmDelete = async () => {
    if (!kelasData?.id) {
      toast.error('Data kelas tidak valid')
      return
    }

    setIsLoading(true)

    try {
      const response = await KelasService.deleteKelasWithValidation(kelasData.id)

      if (response.status === 'success') {
        toast.success(response.message || 'Kelas berhasil dihapus')
        onSuccess?.() // Reload data di parent component
        onClose()
      } else {
        toast.error(response.message || 'Gagal menghapus kelas')
      }
    } catch (error) {
      console.error('Error deleting kelas:', error)

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message

        // Handle specific error messages
        if (errorMessage.includes('tidak ditemukan')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('tidak dapat dihapus karena masih memiliki')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('memiliki data terkait')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('sedang digunakan')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('harus berupa angka')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('Terjadi kesalahan server')) {
          toast.error(errorMessage)
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error('Gagal menghapus kelas')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaTrash className="text-red-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Hapus Kelas</h2>
              <p className="text-sm text-gray-600">Konfirmasi penghapusan kelas</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <FaExclamationTriangle className="text-red-600 text-lg mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Peringatan!</h3>
              <p className="text-sm text-red-700 mb-2">
                Tindakan ini tidak dapat dibatalkan. Semua data terkait kelas ini akan dihapus
                secara permanen.
              </p>
              {kelasData && (kelasData.jumlah_siswa > 0 || kelasData.jumlah_mapel > 0) && (
                <div className="mt-2 p-2 bg-red-100 rounded border border-red-300">
                  <p className="text-xs text-red-800 font-medium">
                    ⚠️ Kelas ini memiliki {kelasData.jumlah_siswa} siswa dan{' '}
                    {kelasData.jumlah_mapel} mata pelajaran. Kelas tidak dapat dihapus jika masih
                    memiliki siswa atau mata pelajaran.
                  </p>
                </div>
              )}
            </div>
          </div>

          {kelasData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Data yang akan dihapus:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Nama Kelas:</span> {kelasData.nama_kelas}
                </p>
                <p>
                  <span className="font-medium">Wali Kelas:</span>{' '}
                  {kelasData.wali_kelas_nama || '-'}
                </p>
                <p>
                  <span className="font-medium">Tahun Ajaran:</span> {kelasData.tahun || '-'}
                </p>
                <p>
                  <span className="font-medium">Semester:</span> {kelasData.semester || '-'}
                </p>
                <p>
                  <span className="font-medium">Jumlah Siswa:</span> {kelasData.jumlah_siswa || 0}
                </p>
                <p>
                  <span className="font-medium">Jumlah Mapel:</span> {kelasData.jumlah_mapel || 0}
                </p>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-gray-700">
              Apakah Anda yakin ingin menghapus kelas{' '}
              <span className="font-semibold text-red-600">{kelasData?.nama_kelas}</span>?
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              <FaTimes className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className={`flex-1 ${
                kelasData && (kelasData.jumlah_siswa > 0 || kelasData.jumlah_mapel > 0)
                  ? 'opacity-75 cursor-not-allowed'
                  : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4 mr-2" />
                  {kelasData && (kelasData.jumlah_siswa > 0 || kelasData.jumlah_mapel > 0)
                    ? 'Tidak Dapat Dihapus'
                    : 'Hapus'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
