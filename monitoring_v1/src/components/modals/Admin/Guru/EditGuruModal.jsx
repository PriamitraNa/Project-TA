import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa'
import { GuruService } from '../../../../services/Admin/guru/GuruService'

// ============================================================================
// COMPONENT
// ============================================================================
export default function EditGuruModal({ isOpen, onClose, onSave, guruData }) {
  // ============================================================================
  // STATE
  // ============================================================================
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    namaLengkap: '',
    nip: '',
  })
  const [validationState, setValidationState] = useState({})
  const [isValidating, setIsValidating] = useState({})
  const [errors, setErrors] = useState({})
  const debounceTimers = useRef({})

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (isOpen && guruData) {
      setFormData({
        namaLengkap: guruData.nama_lengkap || '',
        nip: guruData.nip || '',
      })
      setValidationState({})
      setIsValidating({})
      setErrors({})

      Object.values(debounceTimers.current).forEach((timer) => clearTimeout(timer))
      debounceTimers.current = {}
    }
  }, [isOpen, guruData])

  // ============================================================================
  // VALIDATION
  // ============================================================================
  const checkUniqueness = async (field, value) => {
    if (!value || (field === 'nip' && value.length !== 18)) {
      return
    }

    setIsValidating((prev) => ({ ...prev, [field]: true }))
    setValidationState((prev) => ({ ...prev, [field]: null }))

    try {
      const response = await GuruService.checkWithExclude(value, guruData.id)
      console.log(`📥 API Response for ${field}:`, response)

      if (response.status === 'success') {
        const exists = response.data.nip_exists

        setValidationState((prev) => ({
          ...prev,
          [field]: exists ? 'duplicate' : 'available',
        }))

        if (exists) {
          setErrors((prev) => ({
            ...prev,
            [field]: 'NIP sudah digunakan guru lain',
          }))
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[field]
            return newErrors
          })
        }
      } else {
        setValidationState((prev) => ({ ...prev, [field]: 'error' }))
        setErrors((prev) => ({
          ...prev,
          [field]: 'Gagal validasi NIP',
        }))
      }
    } catch (error) {
      console.error(`❌ Validation error for ${field}:`, error)
      setValidationState((prev) => ({ ...prev, [field]: 'error' }))
      setErrors((prev) => ({
        ...prev,
        [field]: 'Gagal validasi NIP',
      }))
    } finally {
      setIsValidating((prev) => ({ ...prev, [field]: false }))
    }
  }

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field])
    }

    if (field === 'nip' && value.length === 18) {
      debounceTimers.current[field] = setTimeout(() => {
        checkUniqueness(field, value)
      }, 500)
    } else if (field === 'nip' && value.length !== 18) {
      setValidationState((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.namaLengkap.trim()) {
      newErrors.namaLengkap = 'Nama lengkap harus diisi'
    }

    if (!formData.nip.trim()) {
      newErrors.nip = 'NIP harus diisi'
    } else if (!/^\d{18}$/.test(formData.nip)) {
      newErrors.nip = 'NIP harus 18 digit angka'
    }

    return newErrors
  }

  // ============================================================================
  // SUBMIT HANDLER
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault()

    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      Object.values(formErrors).forEach((error) => toast.error(error))
      return
    }

    const isAnyValidating = Object.values(isValidating).some((validating) => validating)
    if (isAnyValidating) {
      toast.error('Mohon tunggu validasi selesai')
      return
    }

    if (validationState.nip === 'duplicate') {
      toast.error('NIP sudah digunakan guru lain')
      return
    }

    setIsLoading(true)
    try {
      const apiData = {
        nama_lengkap: formData.namaLengkap.trim(),
        nip: formData.nip,
      }

      console.log('📤 Sending to API:', apiData)

      const response = await GuruService.update(guruData.id, apiData)
      console.log('📥 API Response:', response)

      if (response.status === 'success') {
        onSave?.(response.data)
        onClose()
      } else {
        throw new Error(response.message || 'Gagal memperbarui guru')
      }
    } catch (error) {
      console.error('❌ Error updating guru:', error)

      if (error.response) {
        const errorData = error.response.data
        console.log('📥 Error Response:', errorData)

        if (errorData.data && errorData.data.errors) {
          errorData.data.errors.forEach((err) => toast.error(err))
        } else if (errorData.message) {
          toast.error(errorData.message)
        } else {
          toast.error('Gagal memperbarui guru')
        }
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error('Gagal memperbarui guru')
      }
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Edit Data Guru</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl transition-colors"
            disabled={isLoading}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
              <input
                type="text"
                value={formData.namaLengkap}
                onChange={(e) => handleFormChange('namaLengkap', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.namaLengkap ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nama lengkap guru"
                disabled={isLoading}
              />
              {errors.namaLengkap && (
                <p className="text-red-500 text-sm mt-1">{errors.namaLengkap}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIP *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.nip}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    handleFormChange('nip', value)
                  }}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.nip
                      ? 'border-red-500'
                      : validationState.nip === 'available'
                      ? 'border-green-500'
                      : validationState.nip === 'duplicate'
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="18 digit angka"
                  maxLength={18}
                  disabled={isLoading}
                />

                {/* Validation Icon */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidating.nip ? (
                    <FaSpinner className="animate-spin text-gray-400" />
                  ) : validationState.nip === 'available' ? (
                    <FaCheck className="text-green-500" />
                  ) : validationState.nip === 'duplicate' ? (
                    <FaTimes className="text-red-500" />
                  ) : null}
                </div>
              </div>

              {/* Validation Messages */}
              {errors.nip && <p className="text-red-500 text-sm mt-1">{errors.nip}</p>}
              {validationState.nip === 'available' && !errors.nip && (
                <p className="text-green-500 text-sm mt-1">NIP tersedia</p>
              )}
              {validationState.nip === 'duplicate' && !errors.nip && (
                <p className="text-red-500 text-sm mt-1">NIP sudah digunakan guru lain</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
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
                type="submit"
                disabled={isLoading || Object.values(isValidating).some((validating) => validating)}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <FaSpinner className="animate-spin" />}
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
