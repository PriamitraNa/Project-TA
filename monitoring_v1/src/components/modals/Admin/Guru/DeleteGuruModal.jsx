import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaExclamationTriangle, FaSpinner } from 'react-icons/fa'

// ============================================================================
// COMPONENT
// ============================================================================
export default function DeleteGuruModal({ isOpen, onClose, onConfirm, guruData }) {
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
      await onConfirm()
    } catch (error) {
      console.error('Error in delete confirmation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="text-red-600 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hapus Data Guru</h3>
            <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">Apakah Anda yakin ingin menghapus data guru berikut?</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Nama:</span>
                <span className="ml-2 text-gray-900">{guruData?.nama_lengkap}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">NIP:</span>
                <span className="ml-2 text-gray-900">{guruData?.nip}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <FaSpinner className="animate-spin" />}
            {isLoading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}
