import { useState, useEffect, useRef } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaUserEdit, FaSpinner, FaCheck, FaTimes, FaUser, FaSearch } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { OrtuService } from '../../../../services/Admin/ortu/OrtuService'

// ============================================================================
// COMPONENT
// ============================================================================

export default function EditOrtuModal({ isOpen, onClose, onSave, ortuData }) {
  console.log('EditOrtuModal - isOpen:', isOpen, 'ortuData:', ortuData)

  // ============================================================================
  // STATE
  // ============================================================================

  const [formData, setFormData] = useState({
    namaLengkap: '',
    nik: '',
    kontak: '',
    relasi: '',
    anak: [],
  })

  const [isLoading, setIsLoading] = useState(false)

  const [validationState, setValidationState] = useState({})
  const [isValidating, setIsValidating] = useState(false)

  const [availableStudents, setAvailableStudents] = useState([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  const [selectedStudentsData, setSelectedStudentsData] = useState({})

  const debounceTimer = useRef(null)
  const studentSearchTimer = useRef(null)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen && ortuData) {
      console.log('🔍 Loading ortuData:', ortuData)
      console.log('🔍 ortuData.nama_lengkap:', ortuData.nama_lengkap)
      console.log('🔍 ortuData.nama_lengkap type:', typeof ortuData.nama_lengkap)
      console.log('🔍 ortuData.nama_lengkap length:', ortuData.nama_lengkap?.length)
      console.log('🔍 ortuData.nama_lengkap JSON:', JSON.stringify(ortuData.nama_lengkap))

      const newFormData = {
        namaLengkap: ortuData.nama_lengkap || '',
        nik: ortuData.nik || '',
        kontak: ortuData.kontak || '',
        relasi: ortuData.relasi || '',
        anak: ortuData.anak ? ortuData.anak.map((student) => student.id) : [],
      }

      console.log('🔍 Setting formData:', newFormData)
      console.log('🔍 formData.namaLengkap:', newFormData.namaLengkap)
      console.log('🔍 formData.namaLengkap length:', newFormData.namaLengkap.length)
      console.log('🔍 formData.namaLengkap JSON:', JSON.stringify(newFormData.namaLengkap))

      setFormData(newFormData)

      // Debug formData setelah di-set
      setTimeout(() => {
        console.log('🔍 formData after setState:', formData)
        console.log('🔍 formData.namaLengkap after setState:', formData.namaLengkap)
      }, 100)

      // Set selected students data
      if (ortuData.anak && ortuData.anak.length > 0) {
        const studentsData = {}
        ortuData.anak.forEach((student) => {
          // Map fields sesuai dengan API response format
          studentsData[student.id] = {
            id: student.id,
            nama_lengkap: student.nama_lengkap,
            nisn: student.nisn,
            nama_kelas: student.kelas || student.nama_kelas || 'Belum ada kelas',
            tahun: student.tahun_ajaran || student.tahun || 'Belum ada tahun ajaran',
          }
        })
        setSelectedStudentsData(studentsData)
      } else {
        setSelectedStudentsData({})
      }

      // Reset validation state
      setValidationState({})
      setIsValidating(false)
      // Reset student dropdown states
      setAvailableStudents([])
      setStudentSearchQuery('')
      setShowStudentDropdown(false)
      // Clear debounce timers
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
        debounceTimer.current = null
      }
      if (studentSearchTimer.current) {
        clearTimeout(studentSearchTimer.current)
        studentSearchTimer.current = null
      }
    }
  }, [isOpen, ortuData])

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const checkNikUniqueness = async (nik) => {
    if (!nik || nik.length !== 16) {
      return
    }

    setIsValidating(true)

    try {
      console.log('🔍 Checking NIK:', nik)

      // Check ke database via API dengan exclude current ID
      const response = await OrtuService.checkWithExclude(nik, ortuData?.id)
      console.log('📥 API Response for NIK:', response)

      if (response.status === 'success') {
        const exists = response.data.nik_exists

        setValidationState({
          isUnique: !exists,
          message: exists ? 'NIK sudah digunakan oleh orangtua lain' : 'NIK tersedia',
        })

        console.log('✅ NIK validation result:', !exists ? 'Available' : 'Already exists')
      }
    } catch (error) {
      console.error('❌ Error checking NIK:', error)

      // Handle specific error messages from API
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message
        setValidationState({
          isUnique: false,
          message: errorMessage,
        })
      } else {
        setValidationState({
          isUnique: null,
          message: 'Error validasi',
        })
      }
    } finally {
      setIsValidating(false)
    }
  }

  const debouncedCheckNik = (nik) => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      checkNikUniqueness(nik)
    }, 500)
  }

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadAvailableStudents = async (searchQuery = '') => {
    setIsLoadingStudents(true)
    try {
      const currentParentChildren = ortuData?.anak ? ortuData.anak.map((anak) => anak.id) : []

      const response = await OrtuService.getAvailableStudentsForEdit({
        search: searchQuery,
        limit: 50,
        exclude_ids: formData.anak || [],
        include_ids: currentParentChildren,
      })

      if (response.status === 'success') {
        setAvailableStudents(response.data.students || [])
      }
    } catch (error) {
      console.error('❌ Error loading available students for edit:', error)
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

  const validateForm = () => {
    console.log('🔍 Validating form...')
    console.log('🔍 formData.namaLengkap:', formData.namaLengkap)
    console.log('🔍 formData.namaLengkap.trim():', formData.namaLengkap.trim())
    console.log('🔍 formData.namaLengkap.trim().length:', formData.namaLengkap.trim().length)

    if (!formData.namaLengkap.trim()) {
      console.log('❌ Nama lengkap kosong')
      errors.push('Nama lengkap harus diisi')
    } else if (formData.namaLengkap.trim().length < 2) {
      console.log('❌ Nama lengkap kurang dari 2 karakter')
      errors.push('Nama lengkap minimal 2 karakter')
    }

    if (!formData.nik.trim()) {
      errors.push('NIK harus diisi')
    } else if (!/^\d{16}$/.test(formData.nik)) {
      errors.push('NIK harus 16 digit angka')
    } else if (validationState.isUnique === false) {
      errors.push('NIK sudah digunakan oleh orangtua lain')
    }

    if (!formData.kontak.trim()) {
      errors.push('Kontak harus diisi')
    } else if (formData.kontak.length > 12) {
      errors.push('Kontak maksimal 12 digit')
    }

    if (!formData.relasi) {
      errors.push('Relasi harus dipilih')
    }

    if (!formData.anak || !Array.isArray(formData.anak) || formData.anak.length === 0) {
      errors.push('Anak harus dipilih minimal 1')
    }

    return errors
  }

  const formatDataForAPI = () => {
    const namaLengkap = formData.namaLengkap.trim()

    console.log('🔍 formatDataForAPI - formData.namaLengkap:', formData.namaLengkap)
    console.log('🔍 formatDataForAPI - namaLengkap after trim:', namaLengkap)
    console.log('🔍 formatDataForAPI - namaLengkap length:', namaLengkap.length)

    // Validasi tambahan untuk nama lengkap
    if (!namaLengkap || namaLengkap.length < 2) {
      console.log('❌ formatDataForAPI - Nama lengkap validation failed')
      throw new Error('Nama lengkap harus diisi dan minimal 2 karakter')
    }

    const formattedData = {
      nama_lengkap: namaLengkap,
      nik: formData.nik.trim(),
      kontak: formData.kontak.trim(),
      relasi: formData.relasi,
      anak: (formData.anak || [])
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
    }

    console.log('🔍 Formatted data for API:', formattedData)
    console.log('🔍 Nama lengkap value:', formattedData.nama_lengkap)
    console.log('🔍 Nama lengkap length:', formattedData.nama_lengkap.length)
    console.log('🔍 Formatted data JSON:', JSON.stringify(formattedData, null, 2))

    return formattedData
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleStudentSearch = (value) => {
    setStudentSearchQuery(value)

    if (studentSearchTimer.current) {
      clearTimeout(studentSearchTimer.current)
    }

    studentSearchTimer.current = setTimeout(() => {
      loadAvailableStudents(value)
    }, 300)
  }

  const handleToggleStudentDropdown = () => {
    setShowStudentDropdown(!showStudentDropdown)
  }

  const handleSelectStudent = (student) => {
    console.log('� handleSelectStudent called with student:', student)

    if (formData.anak?.includes(student.id)) {
      toast.warning(`${student.nama_lengkap} sudah ditambahkan`)
      return
    }

    setFormData((prev) => ({
      ...prev,
      anak: [...(prev.anak || []), student.id],
    }))

    setSelectedStudentsData((prev) => ({
      ...prev,
      [student.id]: student,
    }))

    setStudentSearchQuery('')
    setShowStudentDropdown(false)
  }

  const handleRemoveStudent = (studentId) => {
    setFormData((prev) => ({
      ...prev,
      anak: prev.anak.filter((id) => id !== studentId),
    }))

    setSelectedStudentsData((prev) => {
      const newData = { ...prev }
      delete newData[studentId]
      return newData
    })
  }

  const handleFormChange = (field, value) => {
    console.log(`📝 handleFormChange - field: ${field}, value:`, value)

    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === 'nik' && value.length === 16) {
      debouncedCheckNik(value)
    } else if (field === 'nik') {
      setValidationState({ isUnique: undefined, message: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('�🔍 Starting submit process...')
    console.log('🔍 Current formData:', formData)
    console.log('🔍 formData.namaLengkap:', formData.namaLengkap)
    console.log('🔍 formData.namaLengkap length:', formData.namaLengkap?.length)

    const errors = validateForm()

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error))
      return
    }

    if (isValidating) {
      toast.error('Harap tunggu validasi NIK selesai')
      return
    }

    setIsLoading(true)
    try {
      const formattedData = formatDataForAPI()
      console.log('📤 Sending data to parent component:', formattedData)

      console.log('📤 Calling onSave with formatted data')
      onSave?.(formattedData)
      onClose()
    } catch (error) {
      console.error('❌ Error during submit:', error)

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message
        console.log('🚨 API Error message:', errorMessage)

        if (errorMessage.includes('NIK sudah digunakan')) {
          toast.error('NIK sudah digunakan oleh orangtua lain')
          setValidationState({
            isUnique: false,
            message: 'NIK sudah digunakan oleh orangtua lain',
          })
        } else if (errorMessage.includes('Orangtua tidak ditemukan')) {
          toast.error('Orangtua tidak ditemukan')
        } else if (errorMessage.includes('ID orangtua tidak valid')) {
          toast.error('ID orangtua tidak valid')
        } else if (errorMessage.includes('Nama lengkap harus diisi')) {
          toast.error('Nama lengkap harus diisi dan minimal 2 karakter')
        } else if (errorMessage.includes('NIK harus diisi')) {
          toast.error('NIK harus diisi dan harus 16 digit angka')
        } else if (errorMessage.includes('Kontak harus diisi')) {
          toast.error('Kontak harus diisi dan minimal 10 karakter')
        } else if (errorMessage.includes('Relasi harus dipilih')) {
          toast.error('Relasi harus dipilih')
        } else if (errorMessage.includes('Validasi data gagal')) {
          toast.error('Validasi data gagal. Periksa kembali form yang diisi.')
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error('Gagal memperbarui data orangtua')
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
      title="Edit Data Orangtua"
      description="Perbarui data orangtua yang ada di database"
      icon={<FaUserEdit className="text-emerald-600 text-xl" />}
      size="2xl"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
          <input
            type="text"
            value={formData.namaLengkap}
            onChange={(e) => handleFormChange('namaLengkap', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Masukkan nama lengkap"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">NIK *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.nik}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // Hanya angka
                handleFormChange('nik', value)
              }}
              className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                validationState.isUnique === false
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : validationState.isUnique === true
                  ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="16 digit angka"
              maxLength={16}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValidating ? (
                <FaSpinner className="text-blue-500 text-sm animate-spin" />
              ) : validationState.isUnique !== undefined ? (
                validationState.isUnique === true ? (
                  <FaCheck className="text-green-500 text-sm" />
                ) : (
                  <FaTimes className="text-red-500 text-sm" />
                )
              ) : null}
            </div>
          </div>
          {validationState.message && (
            <p
              className={`text-xs mt-1 ${
                validationState.isUnique === true ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {validationState.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kontak *</label>
          <input
            type="text"
            value={formData.kontak}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 12)
              handleFormChange('kontak', value)
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Nomor telepon/WA (max 12 digit)"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Relasi *</label>
          <select
            value={formData.relasi}
            onChange={(e) => handleFormChange('relasi', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="">Pilih Relasi</option>
            <option value="Ayah">Ayah</option>
            <option value="Ibu">Ibu</option>
            <option value="Wali">Wali</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Anak *</label>
        <div className="relative">
          {formData.anak && formData.anak.length > 0 && (
            <div className="mb-3 space-y-2">
              {formData.anak.map((studentId) => {
                const student = selectedStudentsData[studentId]
                return (
                  <div
                    key={studentId}
                    className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-emerald-700">
                      {student ? student.nama_lengkap : `Siswa ID: ${studentId}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(studentId)}
                      className="text-emerald-600 hover:text-emerald-800 text-sm"
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
              value={studentSearchQuery}
              onChange={(e) => handleStudentSearch(e.target.value)}
              onFocus={() => {
                setShowStudentDropdown(true)
                loadAvailableStudents(studentSearchQuery)
              }}
              placeholder="Cari siswa..."
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={isLoading}
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          </div>

          {showStudentDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {isLoadingStudents ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  <FaSpinner className="animate-spin mx-auto mb-2" />
                  Memuat siswa...
                </div>
              ) : availableStudents.length > 0 ? (
                availableStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSelectStudent(student)
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <FaUser className="text-gray-400 text-sm" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {student.nama_lengkap}
                        </div>
                        <div className="text-xs text-gray-500">
                          NISN: {student.nisn} | {student.nama_kelas} - {student.tahun}
                        </div>
                      </div>
                      {student.is_related_to_current_parent === 1 && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Sudah terkait
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-gray-500">
                  {studentSearchQuery ? 'Tidak ada siswa ditemukan' : 'Tidak ada siswa tersedia'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading || isValidating}
          icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaUserEdit />}
          className="flex-1"
        >
          {isLoading ? 'Memproses...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </CustomModal>
  )
}
