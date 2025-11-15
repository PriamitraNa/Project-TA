import { useState } from 'react'
import Modal from '../../../ui/Modal'
import Button from '../../../ui/Button'
import { FaSpinner, FaTrash, FaExclamationTriangle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { KelasService } from '../../../../services/Admin/kelas/KelasService'

// ============================================================================
// COMPONENT
// ============================================================================

export default function DeleteMapelModal({ isOpen, onClose, onDelete, mapelData, kelasId }) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDelete = async () => {
    if (!mapelData?.id || !kelasId) {
      toast.error('Data mata pelajaran atau kelas tidak valid')
      return
    }

    setIsLoading(true)
    try {
      const response = await KelasService.hapusMataPelajaran(kelasId, mapelData.id)

      if (response.status === 'success') {
        toast.success(response.message || 'Mata pelajaran berhasil dihapus dari kelas')
        onDelete?.(mapelData.id)
        handleClose()
      } else {
        toast.error(response.message || 'Gagal menghapus mata pelajaran')
      }
    } catch (error) {
      console.error('Error deleting mapel:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Terjadi kesalahan saat menghapus mata pelajaran')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose?.()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Hapus Mata Pelajaran" size="md">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-1">Peringatan!</h4>
              <p className="text-sm text-red-700">
                Anda akan menghapus mata pelajaran <strong>"{mapelData?.nama_mapel}"</strong> dari
                kelas ini. Semua data terkait mata pelajaran ini akan dihapus secara permanen.
              </p>
            </div>
          </div>
        </div>

        {mapelData && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="space-y-1 text-sm text-slate-600">
              <div>
                <span className="font-medium">Nama:</span> {mapelData.nama_mapel}
              </div>
              {mapelData.guru_nama && (
                <div>
                  <span className="font-medium">Guru Pengampu:</span> {mapelData.guru_nama}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-200"
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
            icon={
              isLoading ? (
                <FaSpinner className="animate-spin w-4 h-4" />
              ) : (
                <FaTrash className="w-4 h-4" />
              )
            }
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Menghapus...' : 'Hapus Mata Pelajaran'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
