import { useState, useEffect, useRef } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import {
  FaUserPlus,
  FaSpinner,
  FaTrash,
  FaPlus,
  FaMinus,
  FaCheck,
  FaTimes,
  FaSearch,
  FaUser,
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { OrtuService } from '../../../../services/Admin/ortu/OrtuService'

// ============================================================================
// COMPONENT
// ============================================================================

export default function TambahOrtuModal({ isOpen, onClose, onSave }) {
  console.log('TambahOrtuModal - isOpen:', isOpen)

  // ============================================================================
  // STATE
  // ============================================================================

  const [ortuForms, setOrtuForms] = useState([
    {
      id: 1,
      namaLengkap: '',
      nik: '',
      kontak: '',
      relasi: '',
      anak: [],
    },
  ])

  const [isLoading, setIsLoading] = useState(false)

  const [nextId, setNextId] = useState(2)

  const [validationState, setValidationState] = useState({})
  const [isValidating, setIsValidating] = useState({})

  const [availableStudents, setAvailableStudents] = useState([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [studentSearchQuery, setStudentSearchQuery] = useState({})
  const [showStudentDropdown, setShowStudentDropdown] = useState({})
  const [selectedStudentsData, setSelectedStudentsData] = useState({})

  const debounceTimers = useRef({})

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDropdown = event.target.closest('.student-dropdown')
      if (!isClickInsideDropdown) {
        setShowStudentDropdown({})
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setOrtuForms([
        {
          id: 1,
          namaLengkap: '',
          nik: '',
          kontak: '',
          relasi: '',
          anak: [],
        },
      ])
      setNextId(2)
      setValidationState({})
      setIsValidating({})
      setAvailableStudents([])
      setStudentSearchQuery({})
      setShowStudentDropdown({})
      setSelectedStudentsData({})
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

    const otherForms = ortuForms.filter((form) => form.id !== formId)
    const isDuplicate = otherForms.some((form) => form[field] === value)

    return isDuplicate
  }

  const checkUniqueness = async (formId, field, value) => {
    if (!value || (field === 'nik' && value.length !== 16)) {
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
      const response = await OrtuService.checkSingle(value)
      console.log(`📥 API Response for ${field}:`, response)

      if (response.status === 'success') {
        const exists = response.data.nik_exists

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

      // Handle specific error messages from API
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message
        setValidationState((prev) => ({
          ...prev,
          [key]: {
            isUnique: false,
            message: errorMessage,
          },
        }))
      } else {
        setValidationState((prev) => ({
          ...prev,
          [key]: {
            isUnique: null,
            message: 'Error validasi',
          },
        }))
      }
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
  // DATA LOADING
  // ============================================================================

  const loadAvailableStudents = async (formId, searchQuery = '') => {
    setIsLoadingStudents(true)
    try {
      const allSelectedStudentIds = ortuForms.flatMap((form) => form.anak || []).filter((id) => id)

      console.log('🔍 Loading available students, excluding:', allSelectedStudentIds)

      const response = await OrtuService.getAvailableStudents({
        search: searchQuery,
        limit: 50,
        exclude_ids: allSelectedStudentIds,
      })

      if (response.status === 'success') {
        setAvailableStudents(response.data.students || [])
        console.log('📥 Available students loaded:', response.data.students)
      }
    } catch (error) {
      console.error('❌ Error loading available students:', error)

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message
        if (errorMessage.includes('Limit harus berupa angka antara 1-100')) {
          toast.error('Limit harus berupa angka antara 1-100')
        } else if (errorMessage.includes('Terjadi kesalahan server')) {
          toast.error('Terjadi kesalahan server')
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error('Gagal memuat data siswa')
      }
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const debouncedStudentSearch = (formId, searchQuery) => {
    const key = `student_search_${formId}`

    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key])
    }

    debounceTimers.current[key] = setTimeout(() => {
      loadAvailableStudents(formId, searchQuery)
    }, 300)
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFormChange = (formId, field, value) => {
    setOrtuForms((prev) =>
      prev.map((form) => (form.id === formId ? { ...form, [field]: value } : form))
    )

    // Clear previous validation
    const key = `${formId}_${field}`
    setValidationState((prev) => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })

    // Trigger debounced validation for NIK
    if (field === 'nik') {
      debouncedCheck(formId, field, value)

      // Re-validate other forms yang mungkin punya nilai yang sama
      ortuForms.forEach((form) => {
        if (form.id !== formId && form[field] === value) {
          // Trigger re-validation untuk form lain dengan nilai yang sama
          debouncedCheck(form.id, field, form[field])
        }
      })
    }
  }

  // Handler untuk student search
  const handleStudentSearch = (formId, searchQuery) => {
    setStudentSearchQuery((prev) => ({ ...prev, [formId]: searchQuery }))
    debouncedStudentSearch(formId, searchQuery)
  }

  // Handler untuk toggle student dropdown
  const handleToggleStudentDropdown = (formId) => {
    const isCurrentlyOpen = showStudentDropdown[formId]
    setShowStudentDropdown((prev) => ({ ...prev, [formId]: !isCurrentlyOpen }))

    // Load students when opening dropdown
    if (!isCurrentlyOpen) {
      loadAvailableStudents(formId, studentSearchQuery[formId] || '')
    }
  }

  // Handler untuk select student
  const handleSelectStudent = (formId, student) => {
    // Store selected student data first
    setSelectedStudentsData((prev) => ({
      ...prev,
      [student.id]: student,
    }))

    // Update form with student ID
    setOrtuForms((prev) => {
      const updated = prev.map((form) =>
        form.id === formId ? { ...form, anak: [...(form.anak || []), student.id] } : form
      )
      return updated
    })

    // Close dropdown and clear search
    setShowStudentDropdown((prev) => ({ ...prev, [formId]: false }))
    setStudentSearchQuery((prev) => ({ ...prev, [formId]: '' }))

    // Reload available students for all forms to update exclusions
    setTimeout(() => {
      ortuForms.forEach((form) => {
        if (form.id !== formId) {
          loadAvailableStudents(form.id, studentSearchQuery[form.id] || '')
        }
      })
    }, 100)
  }

  // Handler untuk remove selected student
  const handleRemoveStudent = (formId, studentId) => {
    setOrtuForms((prev) =>
      prev.map((form) =>
        form.id === formId
          ? { ...form, anak: (form.anak || []).filter((id) => id !== studentId) }
          : form
      )
    )

    // Remove from selectedStudentsData if no other form is using this student
    setSelectedStudentsData((prev) => {
      const newData = { ...prev }
      // Check if student is still used in any form
      const isStillUsed = ortuForms.some(
        (form) => form.id !== formId && (form.anak || []).includes(studentId)
      )
      if (!isStillUsed) {
        delete newData[studentId]
      }
      return newData
    })

    // Reload available students for all forms to update exclusions
    ortuForms.forEach((form) => {
      loadAvailableStudents(form.id, studentSearchQuery[form.id] || '')
    })
  }

  // Handler untuk tambah form orangtua baru
  const handleAddForm = () => {
    const newForm = {
      id: nextId,
      namaLengkap: '',
      nik: '',
      kontak: '',
      relasi: '',
      anak: [],
    }
    setOrtuForms((prev) => [...prev, newForm])
    setNextId((prev) => prev + 1)
    toast.success('Form orangtua baru ditambahkan')
  }

  // Handler untuk hapus form orangtua
  const handleRemoveForm = (formId) => {
    if (ortuForms.length <= 1) {
      toast.error('Minimal harus ada 1 form orangtua')
      return
    }

    // Clear validation state dan debounce timers untuk form yang akan dihapus
    setValidationState((prev) => {
      const newState = { ...prev }
      delete newState[`${formId}_nik`]
      return newState
    })

    setIsValidating((prev) => {
      const newState = { ...prev }
      delete newState[`${formId}_nik`]
      return newState
    })

    // Clear debounce timers
    if (debounceTimers.current[`${formId}_nik`]) {
      clearTimeout(debounceTimers.current[`${formId}_nik`])
      delete debounceTimers.current[`${formId}_nik`]
    }

    setOrtuForms((prev) => {
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

          if (oldState[`${oldId}_nik`]) {
            newState[`${newId}_nik`] = oldState[`${oldId}_nik`]
          }
        })
        return newState
      })

      return renumbered
    })

    setNextId((prev) => prev - 1)
    toast.success('Form orangtua dihapus')
  }

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateForm = (form) => {
    const errors = []

    if (!form.namaLengkap.trim()) {
      errors.push('Nama lengkap harus diisi')
    }

    if (!form.nik.trim()) {
      errors.push('NIK harus diisi')
    } else if (!/^\d{16}$/.test(form.nik)) {
      errors.push('NIK harus 16 digit angka')
    }

    if (!form.kontak.trim()) {
      errors.push('Kontak harus diisi')
    } else if (form.kontak.length > 12) {
      errors.push('Kontak maksimal 12 digit')
    }

    if (!form.relasi) {
      errors.push('Relasi harus dipilih')
    }

    if (!form.anak || !Array.isArray(form.anak) || form.anak.length === 0) {
      errors.push('Anak harus dipilih minimal 1')
    }

    return errors
  }

  // Validasi semua form
  const validateAllForms = () => {
    const allErrors = []

    console.log('🔍 Validating all forms:', ortuForms)

    // Check for duplicate NIK
    const nikList = ortuForms.map((form) => form.nik).filter((nik) => nik.trim())
    const duplicateNik = nikList.filter((nik, index) => nikList.indexOf(nik) !== index)

    if (duplicateNik.length > 0) {
      allErrors.push('Terdapat NIK duplikat dalam form')
    }

    // Validate each form
    ortuForms.forEach((form, index) => {
      console.log(`🔍 Validating form ${index + 1}:`, form)
      const formErrors = validateForm(form)
      console.log(`🔍 Form ${index + 1} errors:`, formErrors)
      if (formErrors.length > 0) {
        allErrors.push(`Form ${index + 1}: ${formErrors.join(', ')}`)
      }
    })

    console.log('🔍 All validation errors:', allErrors)
    return allErrors
  }

  // Function untuk validate batch dengan API
  const validateBatchWithAPI = async () => {
    try {
      const nikList = ortuForms.map((form) => form.nik).filter((nik) => nik.trim())

      console.log('🔍 Checking batch:', { nikList })

      const response = await OrtuService.checkMultiple(nikList)
      console.log('📥 Batch check response:', response)

      if (response.status === 'success') {
        const { existing_niks } = response.data

        if (existing_niks && existing_niks.length > 0) {
          const errors = []

          ortuForms.forEach((form, index) => {
            if (existing_niks.includes(form.nik)) {
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

      // Handle specific error messages from API
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message
        if (errorMessage.includes('List NIK harus berupa array dan tidak boleh kosong')) {
          toast.error('List NIK harus berupa array dan tidak boleh kosong')
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error('Error validasi data')
      }
      return false
    }
  }

  // Function untuk format data sebelum dikirim ke API
  const formatDataForAPI = (forms) => {
    return forms.map((form) => ({
      nama_lengkap: form.namaLengkap.trim(),
      nik: form.nik.trim(),
      kontak: form.kontak.trim(),
      relasi: form.relasi,
      anak: (form.anak || [])
        .map((studentId) => {
          const student = selectedStudentsData[studentId]
          return student
            ? {
                id: student.id,
                nama_lengkap: student.nama_lengkap,
                nisn: student.nisn,
              }
            : null
        })
        .filter(Boolean), // Remove null entries
    }))
  }

  // Handler untuk submit semua form
  const handleSubmitAll = async () => {
    console.log('🔍 Starting submit process...')
    console.log('🔍 Current ortuForms state:', ortuForms)

    // 1. Validate client-side
    const errors = validateAllForms()

    if (errors.length > 0) {
      console.log('❌ Validation failed, errors:', errors)
      errors.forEach((error) => toast.error(error))
      return
    }

    console.log('✅ Client-side validation passed')

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
      const formattedData = formatDataForAPI(ortuForms)
      console.log('📤 Step 2: Sending data to API:', formattedData)

      // 4. Submit ke API bulk create
      const response = await OrtuService.bulkCreate(formattedData)
      console.log('📥 Step 3: API Response:', response)

      if (response.status === 'success') {
        const { inserted_count, inserted_data } = response.data
        console.log(`✅ Success: ${inserted_count} orangtua berhasil ditambahkan`)

        toast.success(`${inserted_count} orangtua berhasil ditambahkan`)
        onSave?.(inserted_data)
        onClose()
      } else {
        console.log('❌ API returned error status:', response.message)
        toast.error(response.message || 'Gagal menambahkan orangtua')
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
            toast.error(`${err.field} ${err.values.join(', ')} - ${err.error}`)
          })
        } else if (errorData.data?.error_type === 'existing') {
          // Existing data errors
          console.log('❌ Existing data errors:', errorData.data.errors)
          errorData.data.errors.forEach((err) => {
            toast.error(`${err.field} ${err.values.join(', ')} - ${err.error}`)
          })
        } else {
          toast.error(errorData.message || 'Gagal menambahkan orangtua')
        }
      } else {
        toast.error('Gagal menambahkan orangtua')
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
      title="Tambah Multiple Orangtua"
      description="Input data orangtua baru ke database"
      icon={<FaUserPlus className="text-emerald-600 text-xl" />}
      size="4xl"
      isLoading={isLoading}
    >
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-800">Tambah Multiple Orangtua</h3>
            <p className="text-sm text-blue-600 mt-1">
              Anda dapat menambah/hapus form orangtua sesuai kebutuhan (minimal 1 orangtua)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{ortuForms.length}</div>
            <div className="text-sm text-blue-500">Form Orangtua</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {ortuForms.map((form, index) => (
          <div key={form.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <h4 className="font-medium text-gray-800 text-sm">Form Orangtua {index + 1}</h4>
              </div>
              {ortuForms.length > 1 && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">NIK *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.nik}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
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

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kontak *</label>
                <input
                  type="text"
                  value={form.kontak}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12)
                    handleFormChange(form.id, 'kontak', value)
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nomor telepon/WA (max 12 digit)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Relasi *</label>
                <select
                  value={form.relasi}
                  onChange={(e) => handleFormChange(form.id, 'relasi', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Pilih Relasi</option>
                  <option value="Ayah">Ayah</option>
                  <option value="Ibu">Ibu</option>
                  <option value="Wali">Wali</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Anak *</label>
              <div className="relative">
                {form.anak && form.anak.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {form.anak.map((studentId) => {
                      const student = selectedStudentsData[studentId]
                      return (
                        <div
                          key={studentId}
                          className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded px-2 py-1"
                        >
                          <span className="text-xs text-emerald-700">
                            {student ? student.nama_lengkap : `Siswa ID: ${studentId}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(form.id, studentId)}
                            className="text-emerald-600 hover:text-emerald-800 text-xs"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={studentSearchQuery[form.id] || ''}
                    onChange={(e) => handleStudentSearch(form.id, e.target.value)}
                    onFocus={() => {
                      setShowStudentDropdown((prev) => ({ ...prev, [form.id]: true }))
                      loadAvailableStudents(form.id, studentSearchQuery[form.id] || '')
                    }}
                    placeholder="Cari siswa..."
                    className="w-full px-2 py-1.5 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                </div>

                {showStudentDropdown[form.id] && (
                  <div className="student-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                    {isLoadingStudents ? (
                      <div className="p-2 text-center text-xs text-gray-500">
                        <FaSpinner className="animate-spin mx-auto mb-1" />
                        Memuat siswa...
                      </div>
                    ) : availableStudents.length > 0 ? (
                      availableStudents.map((student) => (
                        <div
                          key={student.id}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleSelectStudent(form.id, student)
                          }}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400 text-xs" />
                            <div>
                              <div className="text-xs font-medium text-gray-900">
                                {student.nama_lengkap}
                              </div>
                              <div className="text-xs text-gray-500">NISN: {student.nisn}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-center text-xs text-gray-500">
                        {studentSearchQuery[form.id]
                          ? 'Tidak ada siswa ditemukan'
                          : 'Tidak ada siswa tersedia'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          onClick={handleAddForm}
          className="px-4 py-2 text-sm border-dashed border-2 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
        >
          <FaPlus className="w-3 h-3 mr-2" />
          Tambah Orangtua Lain
        </Button>
      </div>

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
          {isLoading ? 'Memproses...' : `Simpan Semua (${ortuForms.length})`}
        </Button>
      </div>
    </CustomModal>
  )
}
