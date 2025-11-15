import { useState, useEffect, useCallback, useRef } from 'react'
import Modal from '../../../ui/Modal'
import Button from '../../../ui/Button'
import {
  FaTimes,
  FaSearch,
  FaUser,
  FaIdCard,
  FaVenusMars,
  FaPlus,
  FaTrash,
  FaUserMinus,
  FaSpinner,
  FaSave,
  FaUserPlus,
} from 'react-icons/fa'
import { KelasService } from '../../../../services/Admin/kelas/KelasService'
import toast from 'react-hot-toast'

// ============================================================================
// COMPONENT
// ============================================================================

export default function TambahSiswaModal({ isOpen, onClose, onSave, kelasInfo, tahunAjaranId }) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const [selectedStudents, setSelectedStudents] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState([])
  const [isSearchMode, setIsSearchMode] = useState(false)

  const abortControllerRef = useRef(null)
  const hasLoadedInitialData = useRef(false)

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const searchSiswa = useCallback(
    async (searchQuery) => {
      if (!tahunAjaranId) {
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new AbortController
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setIsSearching(true)
      try {
        if (searchQuery && searchQuery.length >= 2) {
          // Search dengan query
          const response = await KelasService.searchSiswa(searchQuery, tahunAjaranId, 20, signal)

          if (response.status === 'success') {
            // Handle empty response - tampilkan array kosong jika tidak ada hasil
            const results = response.data || []
            setFilteredOptions(results)
            setIsSearchMode(true)
          } else {
            toast.error(response.message || 'Gagal mencari siswa')
            setFilteredOptions([])
            setIsSearchMode(true)
          }
        } else {
          // Load available siswa jika tidak ada query atau query terlalu pendek
          const response = await KelasService.getAvailableSiswa(tahunAjaranId, 1, 20, signal)

          if (response.status === 'success') {
            // Handle empty response - tampilkan array kosong jika tidak ada siswa tersedia
            const results = response.data?.data || []
            setFilteredOptions(results)
            setIsSearchMode(false)
          } else {
            toast.error(response.message || 'Gagal memuat daftar siswa')
            setFilteredOptions([])
            setIsSearchMode(false)
          }
        }
      } catch (error) {
        // Don't show error if request was cancelled
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          return
        }

        if (error.response?.data?.message) {
          const errorMessage = error.response.data.message
          if (errorMessage.includes('tidak boleh kosong')) {
            toast.error('Query pencarian tidak boleh kosong')
          } else if (errorMessage.includes('harus berupa angka')) {
            toast.error('ID tahun ajaran tidak valid')
          } else if (errorMessage.includes('Limit harus antara 1-100')) {
            toast.error('Jumlah data tidak valid')
          } else {
            toast.error(errorMessage)
          }
        } else {
          toast.error('Gagal mencari siswa')
        }
        setFilteredOptions([])
      } finally {
        setIsSearching(false)
      }
    },
    [tahunAjaranId]
  )

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (showDropdown && !hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true
      searchSiswa('')
    }
  }, [showDropdown, searchSiswa])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showDropdown) {
        if (searchTerm && searchTerm.length >= 2) {
          // Clear previous results immediately when starting new search
          setFilteredOptions([])
          setIsSearchMode(true)
          searchSiswa(searchTerm)
        } else if (searchTerm.length === 0) {
          // Load available siswa jika search term kosong
          setFilteredOptions([])
          setIsSearchMode(false)
          searchSiswa('')
        } else if (searchTerm.length === 1) {
          // Clear results if search term is too short
          setFilteredOptions([])
          setIsSearchMode(false)
        }
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, showDropdown, searchSiswa])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddStudent = (siswa) => {
    // Cek apakah siswa sudah dipilih
    const isAlreadySelected = selectedStudents.some((s) => s.id === siswa.id)
    if (!isAlreadySelected) {
      setSelectedStudents((prev) => [...prev, siswa])
      toast.success(`${siswa.nama_lengkap} ditambahkan ke daftar`)
    } else {
      toast.error('Siswa sudah dipilih')
    }
    setSearchTerm('')
    setIsSearchMode(false)
  }

  const handleRemoveStudent = (siswaId) => {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== siswaId))
  }

  const handleClearAll = () => {
    setSelectedStudents([])
    toast.success('Semua siswa dihapus dari daftar')
  }

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Pilih minimal satu siswa')
      return
    }

    if (!kelasInfo?.id) {
      toast.error('ID kelas tidak tersedia')
      return
    }

    if (!tahunAjaranId) {
      toast.error('ID tahun ajaran tidak tersedia')
      return
    }

    setIsLoading(true)
    try {
      // Extract siswa IDs from selected students
      const siswaIds = selectedStudents.map((siswa) => siswa.id)

      // Call bulk tambah siswa API
      const response = await KelasService.bulkTambahSiswa(kelasInfo.id, siswaIds, tahunAjaranId)

      if (response.status === 'success') {
        const summary = response.data.summary

        // Show success message with summary
        if (summary.failed === 0) {
          toast.success(`Berhasil menambahkan ${summary.success} siswa ke kelas`)
        } else {
          toast.success(
            `Berhasil menambahkan ${summary.success} dari ${summary.total} siswa ke kelas`
          )
          if (summary.failed > 0) {
            toast.error(`${summary.failed} siswa gagal ditambahkan`)
          }
        }

        // Call onSave with response data
        onSave?.(response.data)
        handleClose()
      } else {
        toast.error(response.message || 'Gagal menambahkan siswa ke kelas')
      }
    } catch (error) {
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message

        // Handle specific error messages
        if (errorMessage.includes('sudah terdaftar')) {
          toast.error('Beberapa siswa sudah terdaftar di kelas lain')
        } else if (errorMessage.includes('tidak ditemukan')) {
          toast.error('Beberapa siswa tidak ditemukan')
        } else if (errorMessage.includes('melebihi limit')) {
          toast.error('Jumlah siswa melebihi batas maksimal')
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error('Terjadi kesalahan saat menambahkan siswa')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setSearchTerm('')
    setSelectedStudents([])
    setFilteredOptions([])
    setShowDropdown(false)
    setIsSearchMode(false)
    hasLoadedInitialData.current = false
    onClose?.()
  }

  const handleClickOutside = (e) => {
    if (e.target.closest('.dropdown-container')) return
    setShowDropdown(false)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="md">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 -m-6 mb-4">
        <div className="p-1.5 bg-emerald-100 rounded-lg">
          <FaUserPlus className="text-emerald-600 text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Tambah Siswa ke Kelas</h2>
          <p className="text-xs text-gray-600">
            {selectedStudents.length > 0
              ? `${selectedStudents.length} siswa dipilih`
              : 'Pilih siswa untuk ditambahkan ke kelas'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {kelasInfo && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <FaUser className="w-3 h-3" />
              <span className="font-medium">{kelasInfo.nama_kelas}</span>
              <span>•</span>
              <span>
                {kelasInfo.tahun} {kelasInfo.semester}
              </span>
            </div>
          </div>
        )}

        <div className="dropdown-container relative">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Cari dan Tambah Siswa <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowDropdown(!showDropdown)
                if (!showDropdown) {
                  // Clear search term dan reset state saat dropdown dibuka
                  setSearchTerm('')
                  setFilteredOptions([])
                  setIsSearchMode(false)
                  hasLoadedInitialData.current = false
                }
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs"
              disabled={isLoading}
            >
              <span className="text-slate-500">Klik untuk mencari siswa...</span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  showDropdown ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg">
                <div className="p-2 border-b border-slate-200">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        const value = e.target.value
                        setSearchTerm(value)

                        // Clear results immediately when user starts typing
                        if (value.length === 0) {
                          setFilteredOptions([])
                          setIsSearchMode(false)
                        } else if (value.length === 1) {
                          setFilteredOptions([])
                          setIsSearchMode(false)
                        }
                      }}
                      placeholder="Cari siswa berdasarkan nama atau NISN..."
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs"
                      autoFocus
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <FaSpinner className="w-4 h-4 text-emerald-500 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto">
                  {(() => {
                    return filteredOptions.length > 0
                  })() ? (
                    filteredOptions.map((siswa) => {
                      const isSelected = selectedStudents.some((s) => s.id === siswa.id)
                      return (
                        <div
                          key={siswa.id}
                          className={`p-2 border-b border-slate-100 last:border-b-0 ${
                            isSelected
                              ? 'bg-emerald-50 cursor-not-allowed'
                              : 'hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div
                                className={`font-medium text-xs ${
                                  isSelected ? 'text-emerald-700' : 'text-slate-900'
                                }`}
                              >
                                {siswa.nama_lengkap}
                                {isSelected && (
                                  <span className="ml-1 text-xs text-emerald-600">
                                    (Sudah dipilih)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <FaIdCard className="w-3 h-3" />
                                  {siswa.nisn}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaVenusMars className="w-3 h-3" />
                                  {siswa.jenis_kelamin}
                                </span>
                              </div>
                            </div>
                            {!isSelected && (
                              <button
                                onClick={() => handleAddStudent(siswa)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                                title="Tambah ke daftar"
                              >
                                <FaPlus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      {isSearching ? (
                        <div className="flex items-center justify-center gap-2">
                          <FaSpinner className="w-4 h-4 animate-spin" />
                          <span>Mencari siswa...</span>
                        </div>
                      ) : isSearchMode ? (
                        <div>
                          <div className="font-medium mb-1">Tidak ada siswa ditemukan</div>
                          <div className="text-xs">Coba kata kunci lain atau periksa ejaan</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium mb-1">Tidak ada siswa tersedia</div>
                          <div className="text-xs">Semua siswa sudah terdaftar di kelas</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedStudents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-700">Siswa yang Dipilih</label>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
              >
                <FaTrash className="w-3 h-3 inline mr-1" />
                Hapus Semua
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
              {selectedStudents.map((siswa) => (
                <div key={siswa.id} className="bg-white border border-slate-200 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <FaUser className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-xs">
                          {siswa.nama_lengkap}
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <FaIdCard className="w-3 h-3" />
                            {siswa.nisn}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaVenusMars className="w-3 h-3" />
                            {siswa.jenis_kelamin}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(siswa.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                      title="Hapus dari daftar"
                    >
                      <FaUserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            <FaTimes className="mr-2" />
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedStudents.length === 0 || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Menambahkan...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Tambah {selectedStudents.length} Siswa
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
