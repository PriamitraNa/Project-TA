import { useState } from 'react'
import Modal from '../../../ui/Modal'
import Button from '../../../ui/Button'
import { FaSpinner, FaTrash, FaExclamationTriangle } from 'react-icons/fa'
import toast from 'react-hot-toast'

// ============================================================================
// COMPONENT
// ============================================================================

export default function DeleteSiswaModal({ isOpen, onClose, onDelete, siswaData }) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDelete = async () => {
    if (!siswaData?.id) {
      toast.error('Data siswa tidak valid')
      return
    }

    setIsLoading(true)
    try {
      // Call parent delete handler
      await onDelete?.(siswaData.id, siswaData.nama_lengkap)
      handleClose()
    } catch (error) {
      console.error('Error deleting siswa:', error)
      toast.error('Terjadi kesalahan saat menghapus siswa')
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Konfirmasi Hapus Siswa" size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="text-red-600 w-8 h-8" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Hapus Siswa dari Kelas</h3>
          <p className="text-slate-600 mb-4">
            Apakah Anda yakin ingin menghapus <strong>{siswaData?.nama_lengkap}</strong> dari kelas
            ini?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Siswa akan dihapus
              dari kelas ini.
            </p>
          </div>
        </div>

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
            {isLoading ? 'Menghapus...' : 'Hapus Siswa'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
