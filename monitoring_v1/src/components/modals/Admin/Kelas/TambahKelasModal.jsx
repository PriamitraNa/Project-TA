import { useState, useEffect, useCallback } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaSave, FaSpinner, FaGraduationCap } from 'react-icons/fa'
import { KelasService } from '../../../../services/Admin/kelas/KelasService'
import toast from 'react-hot-toast'

// ============================================================================
// COMPONENT
// ============================================================================

export default function TambahKelasModal({
  isOpen,
  onClose,
  onSave,
  selectedTahunAjaranId = null,
}) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [formData, setFormData] = useState({
    nama_kelas: '',
    wali_kelas: '',
    tahun_ajaran: '',
    semester: '',
  })

  const [tahunAjaranId, setTahunAjaranId] = useState(null)

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const [waliKelasOptions, setWaliKelasOptions] = useState([])
  const [isLoadingWaliKelas, setIsLoadingWaliKelas] = useState(false)
  const [isLoadingCurrentSelection, setIsLoadingCurrentSelection] = useState(false)

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadWaliKelasOptions = useCallback(async () => {
    setIsLoadingWaliKelas(true)
    try {
      const response = await KelasService.getDropdownWaliKelas(tahunAjaranId)

      if (response.status === 'success') {
        setWaliKelasOptions(response.data)
      }
    } catch (error) {
      console.error('Error loading wali kelas options:', error)
      setWaliKelasOptions([])
    } finally {
      setIsLoadingWaliKelas(false)
    }
  }, [tahunAjaranId])

  const loadCurrentSelection = useCallback(async () => {
    setIsLoadingCurrentSelection(true)
    try {
      const response = await KelasService.getCurrentSelection(selectedTahunAjaranId)

      if (response.status === 'success') {
        // Autofill form dengan data dari API
        setFormData((prev) => ({
          ...prev,
          tahun_ajaran: response.data.tahun,
          semester: response.data.semester,
        }))

        // Simpan ID tahun ajaran untuk API submission
        setTahunAjaranId(response.data.id)
      }
    } catch (error) {
      console.error('Error loading current selection:', error)
    } finally {
      setIsLoadingCurrentSelection(false)
    }
  }, [selectedTahunAjaranId])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nama_kelas: '',
        wali_kelas: '',
        tahun_ajaran: '',
        semester: '',
      })
      setErrors({})
      setTahunAjaranId(null)
      loadCurrentSelection()
    }
  }, [isOpen, loadCurrentSelection])

  useEffect(() => {
    if (isOpen && tahunAjaranId) {
      loadWaliKelasOptions()
    }
  }, [isOpen, tahunAjaranId, loadWaliKelasOptions])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error saat user mulai mengetik
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nama_kelas.trim()) {
      newErrors.nama_kelas = 'Nama kelas harus diisi'
    }

    if (!formData.wali_kelas) {
      newErrors.wali_kelas = 'Wali kelas harus dipilih'
    }

    if (!formData.tahun_ajaran) {
      newErrors.tahun_ajaran = 'Tahun ajaran harus dipilih'
    }

    if (!formData.semester) {
      newErrors.semester = 'Semester harus dipilih'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Mohon perbaiki data yang tidak valid')
      return
    }

    // Validasi tambahan untuk API
    if (!tahunAjaranId) {
      toast.error('Tahun ajaran belum dimuat')
      return
    }

    setIsLoading(true)

    try {
      // Siapkan data untuk API
      const apiData = {
        nama_kelas: formData.nama_kelas,
        wali_kelas_id: parseInt(formData.wali_kelas),
        tahun_ajaran_id: tahunAjaranId,
      }

      // Call API
      const response = await KelasService.tambahKelas(apiData)

      if (response.status === 'success') {
        toast.success(response.message || 'Kelas berhasil ditambahkan')

        // Panggil callback onSave dengan data response
        onSave(response.data)

        // Reset form
        setFormData({
          nama_kelas: '',
          wali_kelas: '',
          tahun_ajaran: '',
          semester: '',
        })
        setErrors({})
        setTahunAjaranId(null)

        // Tutup modal
        onClose()
      } else {
        // Handle API error
        toast.error(response.message || 'Terjadi kesalahan saat menyimpan data')
      }
    } catch (error) {
      console.error('Error saving kelas:', error)

      // Handle network atau error lainnya
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message

        // Handle specific error messages
        if (errorMessage.includes('sudah ada')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('sudah menjadi wali kelas')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('tidak boleh kosong')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('harus berupa angka')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('wajib diisi')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('Semua field harus diisi')) {
          toast.error(errorMessage)
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error('Gagal menambahkan kelas')
      }
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
      title="Tambah Kelas"
      description="Buat kelas baru"
      icon={<FaGraduationCap className="text-emerald-600 text-xl" />}
      size="md"
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nama Kelas <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nama_kelas}
            onChange={(e) => handleInputChange('nama_kelas', e.target.value)}
            placeholder="Contoh: 6A, 7B, 8C"
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
              errors.nama_kelas ? 'border-red-300' : 'border-slate-300'
            }`}
            disabled={isLoading}
          />
          {errors.nama_kelas && <p className="mt-1 text-sm text-red-600">{errors.nama_kelas}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Wali Kelas <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.wali_kelas}
            onChange={(e) => handleInputChange('wali_kelas', e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white ${
              errors.wali_kelas ? 'border-red-300' : 'border-slate-300'
            }`}
            disabled={isLoading || isLoadingWaliKelas}
          >
            <option value="">{isLoadingWaliKelas ? 'Memuat...' : 'Pilih Wali Kelas'}</option>
            {waliKelasOptions.length > 0
              ? waliKelasOptions.map((guru) => (
                  <option key={guru.id} value={guru.id}>
                    {guru.nama_lengkap}
                  </option>
                ))
              : !isLoadingWaliKelas && (
                  <option value="" disabled>
                    Tidak ada guru tersedia
                  </option>
                )}
          </select>
          {errors.wali_kelas && <p className="mt-1 text-sm text-red-600">{errors.wali_kelas}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.tahun_ajaran || ''}
            readOnly
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
            placeholder={
              isLoadingCurrentSelection ? 'Memuat...' : 'Tahun ajaran akan diisi otomatis'
            }
          />
          {errors.tahun_ajaran && (
            <p className="mt-1 text-sm text-red-600">{errors.tahun_ajaran}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Semester <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.semester || ''}
            readOnly
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
            placeholder={isLoadingCurrentSelection ? 'Memuat...' : 'Semester akan diisi otomatis'}
          />
          {errors.semester && <p className="mt-1 text-sm text-red-600">{errors.semester}</p>}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            className="flex-1"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </CustomModal>
  )
}
