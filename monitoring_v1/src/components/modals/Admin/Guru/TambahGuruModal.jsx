import { useState, useEffect, useRef } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaUserPlus, FaSpinner, FaTrash, FaPlus, FaMinus, FaCheck, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { GuruService } from '../../../../services/Admin/guru/GuruService'

// ============================================================================
// COMPONENT
// ============================================================================
export default function TambahGuruModal({ isOpen, onClose, onSave }) {
  console.log('TambahGuruModal - isOpen:', isOpen)

  // ============================================================================
  // STATE
  // ============================================================================
  const [guruForms, setGuruForms] = useState([
    {
      id: 1,
      namaLengkap: '',
      nip: '',
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [nextId, setNextId] = useState(2)
  const [validationState, setValidationState] = useState({})
  const [isValidating, setIsValidating] = useState({})

  const debounceTimers = useRef({})

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (isOpen) {
      setGuruForms([
        {
          id: 1,
          namaLengkap: '',
          nip: '',
        },
      ])
      setNextId(2)
      setValidationState({})
      setIsValidating({})
      Object.keys(debounceTimers.current).forEach((key) => {
        clearTimeout(debounceTimers.current[key])
      })
      debounceTimers.current = {}
    }
  }, [isOpen])

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================
  const checkBatchDuplicate = (formId, field, value) => {
    if (!value) return false

    const otherForms = guruForms.filter((form) => form.id !== formId)
    const isDuplicate = otherForms.some((form) => form[field] === value)

    return isDuplicate
  }

  const checkUniqueness = async (formId, field, value) => {
    if (!value || (field === 'nip' && value.length !== 18)) {
      return
    }

    const key = `${formId}_${field}`
    setIsValidating((prev) => ({ ...prev, [key]: true }))

    try {
      console.log(`🔍 Checking ${field}:`, value)

      const isDuplicateInBatch = checkBatchDuplicate(formId, field, value)

      if (isDuplicateInBatch) {
        setValidationState((prev) => ({
          ...prev,
          [key]: {
            isUnique: false,
            message: `${field.toUpperCase()} duplikat dalam form`,
          },
        }))
        return
      }

      const response = await GuruService.checkSingle(value)
      console.log(`📥 API Response for ${field}:`, response)

      if (response.status === 'success') {
        const exists = response.data.nip_exists

        setValidationState((prev) => ({
          ...prev,
          [key]: {
            isUnique: !exists,
            message: exists
              ? `${field.toUpperCase()} sudah digunakan`
              : `${field.toUpperCase()} tersedia`,
          },
        }))

        console.log(`✅ ${field} validation result:`, !exists ? 'Available' : 'Used')
      }
    } catch (error) {
      console.error(`❌ Error checking ${field}:`, error)
      setValidationState((prev) => ({
        ...prev,
        [key]: {
          isUnique: null,
          message: 'Error validasi',
        },
      }))
    } finally {
      setIsValidating((prev) => ({ ...prev, [key]: false }))
    }
  }

  const debouncedCheck = (formId, field, value) => {
    const key = `${formId}_${field}`

    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key])
    }

    debounceTimers.current[key] = setTimeout(() => {
      checkUniqueness(formId, field, value)
    }, 500)
  }

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================
  const handleFormChange = (formId, field, value) => {
    setGuruForms((prev) =>
      prev.map((form) => (form.id === formId ? { ...form, [field]: value } : form))
    )

    const key = `${formId}_${field}`
    setValidationState((prev) => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })

    if (field === 'nip') {
      debouncedCheck(formId, field, value)
    }
  }

  const handleAddForm = () => {
    const newForm = {
      id: nextId,
      namaLengkap: '',
      nip: '',
    }

    setGuruForms((prev) => [...prev, newForm])
    setNextId((prev) => prev + 1)
  }

  const handleRemoveForm = (formId) => {
    if (guruForms.length <= 1) return

    setGuruForms((prev) => {
      const newForms = prev.filter((form) => form.id !== formId)

      // Renumber forms
      return newForms.map((form, index) => ({
        ...form,
        id: index + 1,
      }))
    })

    const keysToRemove = Object.keys(validationState).filter((key) => key.startsWith(`${formId}_`))
    setValidationState((prev) => {
      const newState = { ...prev }
      keysToRemove.forEach((key) => delete newState[key])
      return newState
    })

    keysToRemove.forEach((key) => {
      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key])
        delete debounceTimers.current[key]
      }
    })

    setValidationState((prev) => {
      const newState = {}
      Object.keys(prev).forEach((key) => {
        const [formIdStr, field] = key.split('_')
        const formIdNum = parseInt(formIdStr)
        if (formIdNum > formId) {
          const newFormId = formIdNum - 1
          newState[`${newFormId}_${field}`] = prev[key]
        } else if (formIdNum < formId) {
          newState[key] = prev[key]
        }
      })
      return newState
    })

    setIsValidating((prev) => {
      const newState = {}
      Object.keys(prev).forEach((key) => {
        const [formIdStr, field] = key.split('_')
        const formIdNum = parseInt(formIdStr)
        if (formIdNum > formId) {
          const newFormId = formIdNum - 1
          newState[`${newFormId}_${field}`] = prev[key]
        } else if (formIdNum < formId) {
          newState[key] = prev[key]
        }
      })
      return newState
    })
  }

  // ============================================================================
  // FORM VALIDATION
  // ============================================================================
  const validateForm = (form) => {
    const errors = []

    if (!form.namaLengkap.trim()) {
      errors.push('Nama lengkap harus diisi')
    }

    if (!form.nip.trim()) {
      errors.push('NIP harus diisi')
    } else if (!/^\d{18}$/.test(form.nip)) {
      errors.push('NIP harus 18 digit angka')
    }

    return errors
  }

  const validateAllForms = () => {
    const allErrors = []

    const nipList = guruForms.map((form) => form.nip).filter((nip) => nip.trim())
    const duplicateNip = nipList.filter((nip, index) => nipList.indexOf(nip) !== index)

    if (duplicateNip.length > 0) {
      allErrors.push('Terdapat NIP duplikat dalam form')
    }

    guruForms.forEach((form, index) => {
      const formErrors = validateForm(form)
      if (formErrors.length > 0) {
        allErrors.push(`Form ${index + 1}: ${formErrors.join(', ')}`)
      }
    })

    return allErrors
  }

  const formatDateForAPI = (dateString) => {
    if (!dateString) return ''

    if (dateString.includes('/')) {
      return dateString
    }

    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-')
      return `${day}/${month}/${year}`
    }

    return dateString
  }

  // ============================================================================
  // SUBMIT HANDLER
  // ============================================================================
  const handleSubmitAll = async () => {
    console.log('🚀 Submit All Guru Forms - Data:', guruForms)

    const errors = validateAllForms()

    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors)
      errors.forEach((error) => toast.error(error))
      return
    }

    // Check jika masih ada validation yang sedang berjalan
    const isAnyValidating = Object.values(isValidating).some((validating) => validating)
    if (isAnyValidating) {
      toast.error('Mohon tunggu validasi selesai')
      return
    }

    // Batch validation sebelum submit
    try {
      const nipList = guruForms.map((form) => form.nip).filter((nip) => nip.trim())
      if (nipList.length > 0) {
        console.log('🔍 Batch validation NIP:', nipList)
        const batchResponse = await GuruService.checkMultiple(nipList)

        if (batchResponse.status === 'success' && batchResponse.data.existing_nips.length > 0) {
          const existingNips = batchResponse.data.existing_nips
          toast.error(`NIP berikut sudah digunakan: ${existingNips.join(', ')}`)
          return
        }
      }
    } catch (error) {
      console.error('❌ Batch validation error:', error)
      toast.error('Gagal validasi batch NIP')
      return
    }

    setIsLoading(true)
    try {
      // Prepare data untuk API
      const apiData = guruForms.map((form) => ({
        nama_lengkap: form.namaLengkap.trim(),
        nip: form.nip,
      }))

      console.log('📤 Sending to API:', apiData)

      // Call API bulk create
      const response = await GuruService.bulkCreate(apiData)
      console.log('📥 API Response:', response)

      if (response.status === 'success') {
        toast.success(`Berhasil menambah ${response.data.inserted_count} guru`)
        onSave?.(response.data)
        onClose()
      } else {
        // Handle error response
        throw new Error(response.message || 'Gagal menambah guru')
      }
    } catch (error) {
      console.error('❌ Error creating guru:', error)

      // Handle different error types
      if (error.response) {
        const errorData = error.response.data
        console.log('📥 Error Response:', errorData)

        if (errorData.data && errorData.data.error_type === 'validation') {
          // Validation errors dari backend
          errorData.data.errors.forEach((error) => {
            if (error.errors && Array.isArray(error.errors)) {
              error.errors.forEach((err) => toast.error(`Form ${error.index}: ${err}`))
            }
          })
        } else if (errorData.message) {
          // Error message dari backend
          toast.error(errorData.message)
        } else {
          toast.error('Gagal menambah guru')
        }
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error('Gagal menambah guru')
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
      title="Tambah Multiple Guru"
      description="Input data guru baru ke database"
      icon={<FaUserPlus className="text-emerald-600 text-xl" />}
      size="4xl"
      isLoading={isLoading}
    >
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-800">Tambah Multiple Guru</h3>
            <p className="text-sm text-blue-600 mt-1">
              Anda dapat menambah/hapus form guru sesuai kebutuhan (minimal 1 guru)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{guruForms.length}</div>
            <div className="text-sm text-blue-500">Form Guru</div>
          </div>
        </div>
      </div>

      {/* Dynamic Forms */}
      <div className="space-y-4">
        {guruForms.map((form, index) => (
          <div key={form.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            {/* Form Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <h4 className="font-medium text-gray-800 text-sm">Form Guru {index + 1}</h4>
              </div>
              {guruForms.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveForm(form.id)}
                  className="px-2 py-1 text-xs"
                >
                  <FaMinus className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Form Fields - Compact Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={form.namaLengkap}
                  onChange={(e) => handleFormChange(form.id, 'namaLengkap', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nama lengkap guru"
                />
              </div>

              {/* NIP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIP *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.nip}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '') // Hanya angka
                      handleFormChange(form.id, 'nip', value)
                    }}
                    className={`w-full px-3 py-2 pr-10 text-sm border rounded focus:outline-none focus:ring-1 ${
                      validationState[`${form.id}_nip`]?.isUnique === false
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : validationState[`${form.id}_nip`]?.isUnique === true
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    placeholder="18 digit angka"
                    maxLength={18}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValidating[`${form.id}_nip`] ? (
                      <FaSpinner className="text-blue-500 text-sm animate-spin" />
                    ) : validationState[`${form.id}_nip`] ? (
                      validationState[`${form.id}_nip`].isUnique === true ? (
                        <FaCheck className="text-green-500 text-sm" />
                      ) : validationState[`${form.id}_nip`].isUnique === false ? (
                        <FaTimes className="text-red-500 text-sm" />
                      ) : null
                    ) : null}
                  </div>
                </div>
                {validationState[`${form.id}_nip`] && (
                  <p
                    className={`text-xs mt-1 ${
                      validationState[`${form.id}_nip`].isUnique === true
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {validationState[`${form.id}_nip`].message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Form Button */}
      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          onClick={handleAddForm}
          className="px-4 py-2 text-sm border-dashed border-2 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
        >
          <FaPlus className="w-3 h-3 mr-2" />
          Tambah Guru Lain
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmitAll}
          disabled={isLoading}
          icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
          className="flex-1"
        >
          {isLoading ? 'Memproses...' : `Simpan Semua (${guruForms.length})`}
        </Button>
      </div>
    </CustomModal>
  )
}
