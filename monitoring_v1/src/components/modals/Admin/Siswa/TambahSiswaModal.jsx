import { useState, useEffect, useRef } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaUserPlus, FaSpinner, FaTrash, FaPlus, FaMinus, FaCheck, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { SiswaService } from '../../../../services/Admin/siswa/SiswaService'

// ============================================================================
// COMPONENT
// ============================================================================

export default function TambahSiswaModal({ isOpen, onClose, onSave }) {
  console.log('TambahSiswaModal - isOpen:', isOpen)

  // ============================================================================
  // STATE
  // ============================================================================

  const [siswaForms, setSiswaForms] = useState([
    {
      id: 1,
      namaLengkap: '',
      nisn: '',
      nik: '',
      jenisKelamin: '',
      tempatLahir: '',
      tanggalLahir: '',
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
      setSiswaForms([
        {
          id: 1,
          namaLengkap: '',
          nisn: '',
          nik: '',
          jenisKelamin: '',
          tempatLahir: '',
          tanggalLahir: '',
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
  // VALIDATION
  // ============================================================================

  const checkBatchDuplicate = (formId, field, value) => {
    if (!value) return false

    const otherForms = siswaForms.filter((form) => form.id !== formId)
    const isDuplicate = otherForms.some((form) => form[field] === value)

    return isDuplicate
  }

  // Function untuk check NISN/NIK via API
  const checkUniqueness = async (formId, field, value) => {
    if (
      !value ||
      (field === 'nisn' && value.length !== 10) ||
      (field === 'nik' && value.length !== 16)
    ) {
      return
    }

    const key = `${formId}_${field}`
    setIsValidating((prev) => ({ ...prev, [key]: true }))

    try {
      console.log(`🔍 Checking ${field}:`, value)

      // 1. Check duplikasi dalam batch terlebih dahulu
      const isDuplicateInBatch = checkBatchDuplicate(formId, field, value)

      if (isDuplicateInBatch) {
        console.log(`❌ ${field} duplicate in batch`)
        setValidationState((prev) => ({
          ...prev,
          [key]: {
            isUnique: false,
            message: `${field.toUpperCase()} duplikat dalam form`,
          },
        }))
        setIsValidating((prev) => ({ ...prev, [key]: false }))
        return
      }

      // 2. Check ke database via API
      const nisn = field === 'nisn' ? value : null
      const nik = field === 'nik' ? value : null

      const response = await SiswaService.checkSingle(nisn, nik)
      console.log(`📥 API Response for ${field}:`, response)

      if (response.status === 'success') {
        const exists = field === 'nisn' ? response.data.nisn_exists : response.data.nik_exists

        setValidationState((prev) => ({
          ...prev,
          [key]: {
            isUnique: !exists,
            message: exists
              ? `${field.toUpperCase()} sudah digunakan`
              : `${field.toUpperCase()} tersedia`,
          },
        }))

        console.log(`✅ ${field} validation result:`, !exists ? 'Available' : 'Already exists')
      }
    } catch (error) {
      console.error(`❌ Error checking ${field}:`, error)
      setValidationState((prev) => ({
        ...prev,
        [`${formId}_${field}`]: {
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
  // HANDLERS
  // ============================================================================

  const handleFormChange = (formId, field, value) => {
    setSiswaForms((prev) =>
      prev.map((form) => (form.id === formId ? { ...form, [field]: value } : form))
    )

    // Clear previous validation
    const key = `${formId}_${field}`
    setValidationState((prev) => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })

    // Trigger debounced validation for NISN/NIK
    if (field === 'nisn' || field === 'nik') {
      debouncedCheck(formId, field, value)

      // Re-validate other forms yang mungkin punya nilai yang sama
      siswaForms.forEach((form) => {
        if (form.id !== formId && form[field] === value) {
          // Trigger re-validation untuk form lain dengan nilai yang sama
          debouncedCheck(form.id, field, form[field])
        }
      })
    }
  }

  // Handler untuk tambah form siswa baru
  const handleAddForm = () => {
    const newForm = {
      id: nextId,
      namaLengkap: '',
      nisn: '',
      nik: '',
      jenisKelamin: '',
      tempatLahir: '',
      tanggalLahir: '',
    }
    setSiswaForms((prev) => [...prev, newForm])
    setNextId((prev) => prev + 1)
    toast.success('Form siswa baru ditambahkan')
  }

  // Handler untuk hapus form siswa
  const handleRemoveForm = (formId) => {
    if (siswaForms.length <= 1) {
      toast.error('Minimal harus ada 1 form siswa')
      return
    }

    // Clear validation state dan debounce timers untuk form yang akan dihapus
    setValidationState((prev) => {
      const newState = { ...prev }
      delete newState[`${formId}_nisn`]
      delete newState[`${formId}_nik`]
      return newState
    })

    setIsValidating((prev) => {
      const newState = { ...prev }
      delete newState[`${formId}_nisn`]
      delete newState[`${formId}_nik`]
      return newState
    })

    // Clear debounce timers
    if (debounceTimers.current[`${formId}_nisn`]) {
      clearTimeout(debounceTimers.current[`${formId}_nisn`])
      delete debounceTimers.current[`${formId}_nisn`]
    }
    if (debounceTimers.current[`${formId}_nik`]) {
      clearTimeout(debounceTimers.current[`${formId}_nik`])
      delete debounceTimers.current[`${formId}_nik`]
    }

    setSiswaForms((prev) => {
      const filtered = prev.filter((form) => form.id !== formId)
      // Renumber forms
      const renumbered = filtered.map((form, index) => ({
        ...form,
        id: index + 1,
      }))

      // Renumber validation state juga
      setValidationState((oldState) => {
        const newState = {}
        renumbered.forEach((form, index) => {
          const oldId = form.id
          const newId = index + 1

          // Copy validation state dengan ID baru
          if (oldState[`${oldId}_nisn`]) {
            newState[`${newId}_nisn`] = oldState[`${oldId}_nisn`]
          }
          if (oldState[`${oldId}_nik`]) {
            newState[`${newId}_nik`] = oldState[`${oldId}_nik`]
          }
        })
        return newState
      })

      // Renumber isValidating state juga
      setIsValidating((oldState) => {
        const newState = {}
        renumbered.forEach((form, index) => {
          const oldId = form.id
          const newId = index + 1

          if (oldState[`${oldId}_nisn`]) {
            newState[`${newId}_nisn`] = oldState[`${oldId}_nisn`]
          }
          if (oldState[`${oldId}_nik`]) {
            newState[`${newId}_nik`] = oldState[`${oldId}_nik`]
          }
        })
        return newState
      })

      return renumbered
    })

    setNextId((prev) => prev - 1)
    toast.success('Form siswa dihapus')
  }

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateForm = (form) => {
    const errors = []

    if (!form.namaLengkap.trim()) {
      errors.push('Nama lengkap harus diisi')
    }

    if (!form.nisn.trim()) {
      errors.push('NISN harus diisi')
    } else if (!/^\d{10}$/.test(form.nisn)) {
      errors.push('NISN harus 10 digit angka')
    }

    if (!form.nik.trim()) {
      errors.push('NIK harus diisi')
    } else if (!/^\d{16}$/.test(form.nik)) {
      errors.push('NIK harus 16 digit angka')
    }

    if (!form.jenisKelamin) {
      errors.push('Jenis kelamin harus dipilih')
    }

    if (!form.tempatLahir.trim()) {
      errors.push('Tempat lahir harus diisi')
    }

    if (!form.tanggalLahir) {
      errors.push('Tanggal lahir harus diisi')
    }

    return errors
  }

  // Validasi semua form
  const validateAllForms = () => {
    const allErrors = []

    // Check for duplicate NISN
    const nisnList = siswaForms.map((form) => form.nisn).filter((nisn) => nisn.trim())
    const duplicateNisn = nisnList.filter((nisn, index) => nisnList.indexOf(nisn) !== index)

    if (duplicateNisn.length > 0) {
      allErrors.push('Terdapat NISN duplikat dalam form')
    }

    // Check for duplicate NIK
    const nikList = siswaForms.map((form) => form.nik).filter((nik) => nik.trim())
    const duplicateNik = nikList.filter((nik, index) => nikList.indexOf(nik) !== index)

    if (duplicateNik.length > 0) {
      allErrors.push('Terdapat NIK duplikat dalam form')
    }

    // Validate each form
    siswaForms.forEach((form, index) => {
      const formErrors = validateForm(form)
      if (formErrors.length > 0) {
        allErrors.push(`Form ${index + 1}: ${formErrors.join(', ')}`)
      }
    })

    return allErrors
  }

  // Function untuk validate batch dengan API
  const validateBatchWithAPI = async () => {
    try {
      const nisnList = siswaForms.map((form) => form.nisn).filter((nisn) => nisn.trim())
      const nikList = siswaForms.map((form) => form.nik).filter((nik) => nik.trim())

      console.log('🔍 Checking batch:', { nisnList, nikList })

      const response = await SiswaService.checkMultiple(nisnList, nikList)
      console.log('📥 Batch check response:', response)

      if (response.status === 'success') {
        const { existing_nisn, existing_nik } = response.data

        if (existing_nisn.length > 0 || existing_nik.length > 0) {
          const errors = []

          siswaForms.forEach((form, index) => {
            if (existing_nisn.includes(form.nisn)) {
              errors.push(`Form ${index + 1}: NISN ${form.nisn} sudah ada`)
            }
            if (existing_nik.includes(form.nik)) {
              errors.push(`Form ${index + 1}: NIK ${form.nik} sudah ada`)
            }
          })

          errors.forEach((error) => toast.error(error))
          return false
        }

        console.log('✅ Batch validation passed')
        return true
      }

      return false
    } catch (error) {
      console.error('❌ Error batch validation:', error)
      toast.error('Error validasi data')
      return false
    }
  }

  // Function untuk format data sebelum dikirim ke API
  const formatDataForAPI = (forms) => {
    return forms.map((form) => ({
      nama_lengkap: form.namaLengkap.trim(),
      nisn: form.nisn.trim(),
      nik: form.nik.trim(),
      jenis_kelamin: form.jenisKelamin,
      tempat_lahir: form.tempatLahir.trim(),
      tanggal_lahir: form.tanggalLahir
        ? (() => {
            // Convert yyyy-MM-dd to dd/mm/yyyy
            const [year, month, day] = form.tanggalLahir.split('-')
            return `${day}/${month}/${year}`
          })()
        : '',
    }))
  }

  // Handler untuk submit semua form
  const handleSubmitAll = async () => {
    console.log('🔍 Starting submit process...')

    // 1. Validate client-side
    const errors = validateAllForms()

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error))
      return
    }

    setIsLoading(true)
    try {
      // 2. Validate dengan API (check database duplicates)
      console.log('🔍 Step 1: Validating with API...')
      const isBatchValid = await validateBatchWithAPI()

      if (!isBatchValid) {
        console.log('❌ Batch validation failed')
        setIsLoading(false)
        return
      }

      // 3. Format data untuk API
      const formattedData = formatDataForAPI(siswaForms)
      console.log('📤 Step 2: Sending data to API:', formattedData)

      // 4. Submit ke API bulk create
      const response = await SiswaService.bulkCreate(formattedData)
      console.log('📥 Step 3: API Response:', response)

      if (response.status === 'success') {
        const { inserted_count, inserted_data } = response.data
        console.log(`✅ Success: ${inserted_count} siswa berhasil ditambahkan`)

        toast.success(`${inserted_count} siswa berhasil ditambahkan`)
        onSave?.(inserted_data)
        onClose()
      } else {
        console.log('❌ API returned error status:', response.message)
        toast.error(response.message || 'Gagal menambahkan siswa')
      }
    } catch (error) {
      console.error('❌ Error during submit:', error)

      // Handle different error types from API
      if (error.response?.data) {
        const errorData = error.response.data
        console.log('🔍 Error data:', errorData)

        if (errorData.data?.error_type === 'validation') {
          // Validation errors
          console.log('❌ Validation errors:', errorData.data.errors)
          errorData.data.errors.forEach((err) => {
            toast.error(`Form ${err.index} (${err.nama_lengkap}): ${err.errors.join(', ')}`)
          })
        } else if (errorData.data?.error_type === 'duplicate') {
          // Duplicate in batch errors
          console.log('❌ Duplicate errors:', errorData.data.errors)
          errorData.data.errors.forEach((err) => {
            toast.error(`Form ${err.index}: ${err.field} ${err.value} - ${err.error}`)
          })
        } else if (errorData.data?.error_type === 'existing') {
          // Existing data errors
          console.log('❌ Existing data errors:', errorData.data.errors)
          errorData.data.errors.forEach((err) => {
            const errorMsg = err.error.replace('sudah digunakan', 'sudah ada')
            toast.error(`Form ${err.index}: ${err.field} ${err.value} - ${errorMsg}`)
          })
        } else {
          toast.error(errorData.message || 'Gagal menambahkan siswa')
        }
      } else {
        toast.error('Gagal menambahkan siswa')
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
      title="Tambah Multiple Siswa"
      description="Input data siswa baru ke database"
      icon={<FaUserPlus className="text-emerald-600 text-xl" />}
      size="4xl"
      isLoading={isLoading}
    >
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-800">Tambah Multiple Siswa</h3>
            <p className="text-sm text-blue-600 mt-1">
              Anda dapat menambah/hapus form siswa sesuai kebutuhan (minimal 1 siswa)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{siswaForms.length}</div>
            <div className="text-sm text-blue-500">Form Siswa</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {siswaForms.map((form, index) => (
          <div key={form.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <h4 className="font-medium text-gray-800 text-sm">Form Siswa {index + 1}</h4>
              </div>
              {siswaForms.length > 1 && (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={form.namaLengkap}
                  onChange={(e) => handleFormChange(form.id, 'namaLengkap', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nama lengkap"
                />
              </div>

              {/* NISN */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">NISN *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.nisn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '') // Hanya angka
                      handleFormChange(form.id, 'nisn', value)
                    }}
                    className={`w-full px-2 py-1.5 pr-8 text-sm border rounded focus:outline-none focus:ring-1 ${
                      validationState[`${form.id}_nisn`]?.isUnique === false
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : validationState[`${form.id}_nisn`]?.isUnique === true
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    placeholder="10 digit angka"
                    maxLength={10}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {isValidating[`${form.id}_nisn`] ? (
                      <FaSpinner className="text-blue-500 text-xs animate-spin" />
                    ) : validationState[`${form.id}_nisn`] ? (
                      validationState[`${form.id}_nisn`].isUnique === true ? (
                        <FaCheck className="text-green-500 text-xs" />
                      ) : validationState[`${form.id}_nisn`].isUnique === false ? (
                        <FaTimes className="text-red-500 text-xs" />
                      ) : null
                    ) : null}
                  </div>
                </div>
                {validationState[`${form.id}_nisn`] && (
                  <p
                    className={`text-xs mt-1 ${
                      validationState[`${form.id}_nisn`].isUnique === true
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {validationState[`${form.id}_nisn`].message}
                  </p>
                )}
              </div>

              {/* NIK */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">NIK *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.nik}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '') // Hanya angka
                      handleFormChange(form.id, 'nik', value)
                    }}
                    className={`w-full px-2 py-1.5 pr-8 text-sm border rounded focus:outline-none focus:ring-1 ${
                      validationState[`${form.id}_nik`]?.isUnique === false
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : validationState[`${form.id}_nik`]?.isUnique === true
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    placeholder="16 digit angka"
                    maxLength={16}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {isValidating[`${form.id}_nik`] ? (
                      <FaSpinner className="text-blue-500 text-xs animate-spin" />
                    ) : validationState[`${form.id}_nik`] ? (
                      validationState[`${form.id}_nik`].isUnique === true ? (
                        <FaCheck className="text-green-500 text-xs" />
                      ) : validationState[`${form.id}_nik`].isUnique === false ? (
                        <FaTimes className="text-red-500 text-xs" />
                      ) : null
                    ) : null}
                  </div>
                </div>
                {validationState[`${form.id}_nik`] && (
                  <p
                    className={`text-xs mt-1 ${
                      validationState[`${form.id}_nik`].isUnique === true
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {validationState[`${form.id}_nik`].message}
                  </p>
                )}
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Jenis Kelamin *
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center text-xs">
                    <input
                      type="radio"
                      name={`jenisKelamin_${form.id}`}
                      value="Laki-laki"
                      checked={form.jenisKelamin === 'Laki-laki'}
                      onChange={(e) => handleFormChange(form.id, 'jenisKelamin', e.target.value)}
                      className="mr-1"
                    />
                    Laki-laki
                  </label>
                  <label className="flex items-center text-xs">
                    <input
                      type="radio"
                      name={`jenisKelamin_${form.id}`}
                      value="Perempuan"
                      checked={form.jenisKelamin === 'Perempuan'}
                      onChange={(e) => handleFormChange(form.id, 'jenisKelamin', e.target.value)}
                      className="mr-1"
                    />
                    Perempuan
                  </label>
                </div>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tempat Lahir *
                </label>
                <input
                  type="text"
                  value={form.tempatLahir}
                  onChange={(e) => handleFormChange(form.id, 'tempatLahir', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Kota/Kabupaten"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tanggal Lahir *
                </label>
                <input
                  type="date"
                  value={form.tanggalLahir}
                  onChange={(e) => handleFormChange(form.id, 'tanggalLahir', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
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
          Tambah Siswa Lain
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
          {isLoading ? 'Memproses...' : `Simpan Semua (${siswaForms.length})`}
        </Button>
      </div>
    </CustomModal>
  )
}
