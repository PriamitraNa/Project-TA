import { useState } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaSpinner, FaPlus, FaBookOpen } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { KelasService } from '../../../../services/Admin/kelas/KelasService'

// ============================================================================
// COMPONENT
// ============================================================================

export default function TambahMapelCustomModal({ isOpen, onClose, onSave }) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [namaMapel, setNamaMapel] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
    // Validasi form
    if (!namaMapel.trim()) {
      toast.error('Nama mata pelajaran tidak boleh kosong')
      return
    }

    setIsLoading(true)
    try {
      const response = await KelasService.tambahMataPelajaranBaru({
        nama_mapel: namaMapel.trim(),
      })

      if (response.status === 'success') {
        toast.success('Mata pelajaran baru berhasil ditambahkan')

        // Return data mapel ke parent modal
        onSave?.(response.data)
        handleClose()
      } else {
        toast.error(response.message || 'Gagal menambahkan mata pelajaran baru')
      }
    } catch (error) {
      console.error('Error adding custom mapel:', error)
      toast.error('Terjadi kesalahan saat menambahkan mata pelajaran')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNamaMapel('')
    onClose?.()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Mata Pelajaran Baru"
      description="Buat mata pelajaran baru untuk ditambahkan ke kelas"
      icon={<FaBookOpen className="text-blue-600 text-xl" />}
      size="md"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Tambahkan nama mata pelajaran baru yang belum ada dalam daftar
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nama Mata Pelajaran <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={namaMapel}
            onChange={(e) => setNamaMapel(e.target.value)}
            placeholder="Contoh: Prakarya, Mulok, Bahasa Daerah"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={isLoading}
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
          />
          <p className="mt-1 text-xs text-slate-500">
            Mata pelajaran ini akan ditambahkan ke database
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading} className="flex-1">
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !namaMapel.trim()}
            icon={
              isLoading ? (
                <FaSpinner className="animate-spin w-4 h-4" />
              ) : (
                <FaPlus className="w-4 h-4" />
              )
            }
            className="flex-1"
          >
            {isLoading ? 'Menambahkan...' : 'Tambah Mata Pelajaran'}
          </Button>
        </div>
      </div>
    </CustomModal>
  )
}
