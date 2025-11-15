import { useState } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaTrash, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useSiswa } from '../../../../features/admin/siswa'

// ============================================================================
// COMPONENT
// ============================================================================

export default function DeleteSiswaModal({ isOpen, onClose, onConfirm, siswaData }) {
  const { handleDeleteSiswa } = useSiswa()

  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const result = await handleDeleteSiswa(siswaData.id)

      if (result.success) {
        onConfirm?.(result.data)
        onClose()
      } else {
        toast.error(result.error || 'Gagal menghapus data siswa')
      }
    } catch (error) {
      console.error('Error deleting siswa:', error)
      toast.error('Gagal menghapus data siswa')
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Siswa"
      description="Konfirmasi penghapusan data siswa"
      icon={<FaTrash className="text-red-600 text-xl" />}
      size="md"
      isLoading={isLoading}
    >
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <FaExclamationTriangle className="text-red-500 text-lg mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Peringatan!</h3>
            <p className="text-sm text-red-700 mt-1">
              Tindakan ini tidak dapat dibatalkan. Data siswa akan dihapus secara permanen dari
              database.
            </p>
          </div>
        </div>
      </div>

      {siswaData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-800 mb-2">Data yang akan dihapus:</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Nama:</span> {siswaData.nama_lengkap}
            </p>
            <p>
              <span className="font-medium">NISN:</span> {siswaData.nisn}
            </p>
            <p>
              <span className="font-medium">NIK:</span> {siswaData.nik}
            </p>
            <p>
              <span className="font-medium">Jenis Kelamin:</span> {siswaData.jenis_kelamin}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
          Batal
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          disabled={isLoading}
          icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
          className="flex-1"
        >
          {isLoading ? 'Menghapus...' : 'Hapus Data'}
        </Button>
      </div>
    </CustomModal>
  )
}
