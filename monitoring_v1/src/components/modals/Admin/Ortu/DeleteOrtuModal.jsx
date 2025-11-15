import { useState } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa'
import toast from 'react-hot-toast'

// ============================================================================
// COMPONENT
// ============================================================================

export default function DeleteOrtuModal({ isOpen, onClose, onConfirm, ortuData }) {
  console.log('DeleteOrtuModal - isOpen:', isOpen, 'ortuData:', ortuData)

  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleConfirm = async () => {
    if (!ortuData?.id) {
      toast.error('Data orangtua tidak valid')
      return
    }

    setIsLoading(true)
    try {
      console.log('🔍 Deleting ortu:', ortuData.id)

      // Call onConfirm dengan ID orangtua
      const result = await onConfirm(ortuData.id)

      if (result?.success) {
        console.log('✅ Ortu deleted successfully')
        toast.success('Data orangtua berhasil dihapus')
        onClose()
      } else {
        console.log('❌ Failed to delete ortu:', result?.error)
        // Error message sudah ditampilkan di hook/service
      }
    } catch (error) {
      console.error('❌ Error during delete:', error)
      toast.error('Terjadi kesalahan saat menghapus data')
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
      title="Hapus Data Orangtua"
      description="Apakah Anda yakin ingin menghapus data orangtua ini?"
      icon={<FaTrash className="text-red-600 text-xl" />}
      size="md"
      isLoading={isLoading}
    >
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Perhatian!</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Tindakan ini akan menghapus data orangtua secara permanen dari database.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Pastikan Anda tidak memerlukan data ini lagi sebelum melanjutkan.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-800 mb-2">Data yang akan dihapus:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Nama:</span>
            <span className="font-medium">{ortuData?.nama_lengkap || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">NIK:</span>
            <span className="font-medium">{ortuData?.nik || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Kontak:</span>
            <span className="font-medium">{ortuData?.kontak || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Relasi:</span>
            <span className="font-medium">{ortuData?.relasi || '-'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
          Batal
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          disabled={isLoading}
          icon={
            isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FaTrash />
            )
          }
          className="flex-1"
        >
          {isLoading ? 'Menghapus...' : 'Hapus Data'}
        </Button>
      </div>
    </CustomModal>
  )
}
