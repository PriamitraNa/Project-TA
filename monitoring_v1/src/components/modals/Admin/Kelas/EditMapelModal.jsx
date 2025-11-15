import { useState, useEffect, useCallback } from 'react'
import Modal from '../../../ui/Modal'
import Button from '../../../ui/Button'
import { FaSpinner, FaEdit } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { KelasService } from '../../../../services/Admin/kelas/KelasService'

// ============================================================================
// COMPONENT
// ============================================================================

export default function EditMapelModal({
  isOpen,
  onClose,
  onSave,
  mapelData,
  kelasId,
  tahunAjaranId,
}) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [namaMapel, setNamaMapel] = useState('')
  const [mapelId, setMapelId] = useState('')
  const [guruPengampuId, setGuruPengampuId] = useState('')
  const [guruOptions, setGuruOptions] = useState([])
  const [mapelOptions, setMapelOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGuru, setIsLoadingGuru] = useState(false)
  const [isLoadingMapel, setIsLoadingMapel] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [showMapelDropdown, setShowMapelDropdown] = useState(false)
  const [showGuruDropdown, setShowGuruDropdown] = useState(false)

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadGuruOptions = useCallback(async (guruId) => {
    if (!guruId) return

    setIsLoadingGuru(true)
    try {
      const response = await KelasService.getDropdownGuruEdit(guruId)

      if (response.status === 'success') {
        setGuruOptions(response.data || [])
      } else {
        toast.error(response.message || 'Gagal mengambil data guru')
      }
    } catch (error) {
      console.error('Error loading guru options:', error)
      toast.error('Gagal mengambil data guru')
    } finally {
      setIsLoadingGuru(false)
    }
  }, [])

  // Load mapel options saat modal dibuka
  const loadMapelOptions = useCallback(
    async (currentMapelId) => {
      if (!kelasId || !tahunAjaranId || !currentMapelId) return

      setIsLoadingMapel(true)
      try {
        const response = await KelasService.getDropdownMataPelajaranEdit(kelasId, {
          tahun_ajaran_id: tahunAjaranId,
          exclude_mapel_id: currentMapelId,
        })

        if (response.status === 'success') {
          setMapelOptions(response.data || [])
        } else {
          toast.error(response.message || 'Gagal mengambil data mata pelajaran')
        }
      } catch (error) {
        console.error('Error loading mapel options:', error)
        toast.error('Gagal mengambil data mata pelajaran')
      } finally {
        setIsLoadingMapel(false)
      }
    },
    [kelasId, tahunAjaranId]
  )

  const loadMapelData = useCallback(async () => {
    if (!mapelData?.id || !kelasId) return

    setIsLoadingData(true)
    try {
      const response = await KelasService.getDetailMataPelajaran(kelasId, mapelData.id)

      if (response.status === 'success') {
        const data = response.data
        setNamaMapel(data.nama_mapel || '')
        setMapelId(data.mapel_id?.toString() || '')
        setGuruPengampuId(data.guru_id?.toString() || '')

        // Load guru options setelah mendapat guru_id
        if (data.guru_id) {
          await loadGuruOptions(data.guru_id)
        }

        // Load mapel options setelah mendapat mapel_id
        if (data.mapel_id) {
          await loadMapelOptions(data.mapel_id)
        }
      } else {
        toast.error(response.message || 'Gagal mengambil detail mata pelajaran')
      }
    } catch (error) {
      console.error('Error loading mapel data:', error)
      toast.error('Terjadi kesalahan saat memuat data mata pelajaran')
    } finally {
      setIsLoadingData(false)
    }
  }, [mapelData?.id, kelasId, loadGuruOptions, loadMapelOptions])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectMapel = (mapel) => {
    setMapelId(mapel.id.toString())
    setNamaMapel(mapel.nama_mapel)
    setShowMapelDropdown(false)
  }

  const handleSelectGuru = (guru) => {
    setGuruPengampuId(guru.id.toString())
    setShowGuruDropdown(false)
  }

  const handleClickOutside = (e) => {
    if (e.target.closest('.dropdown-container')) return
    setShowMapelDropdown(false)
    setShowGuruDropdown(false)
  }

  const handleSubmit = async () => {
    // Validasi form
    if (!mapelId) {
      toast.error('Pilih mata pelajaran terlebih dahulu')
      return
    }

    if (!guruPengampuId) {
      toast.error('Pilih guru pengampu terlebih dahulu')
      return
    }

    setIsLoading(true)
    try {
      const response = await KelasService.updateMataPelajaran(kelasId, mapelData.id, {
        mapel_id: parseInt(mapelId),
        guru_id: parseInt(guruPengampuId),
        tahun_ajaran_id: tahunAjaranId,
      })

      if (response.status === 'success') {
        toast.success('Mata pelajaran berhasil diperbarui')
        onSave?.(response.data)
        handleClose()
      } else {
        toast.error(response.message || 'Gagal memperbarui mata pelajaran')
      }
    } catch (error) {
      console.error('Error updating mapel:', error)
      toast.error('Terjadi kesalahan saat memperbarui mata pelajaran')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNamaMapel('')
    setMapelId('')
    setGuruPengampuId('')
    setGuruOptions([])
    setMapelOptions([])
    setShowMapelDropdown(false)
    setShowGuruDropdown(false)
    onClose?.()
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      loadMapelData()
    }
  }, [isOpen, loadMapelData])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Mata Pelajaran" size="md">
      <div className="space-y-4">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-slate-400 w-6 h-6 mr-2" />
            <span className="text-slate-600">Memuat data mata pelajaran...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <div className="dropdown-container relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowMapelDropdown(!showMapelDropdown)
                    setShowGuruDropdown(false) // Tutup dropdown guru
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  disabled={isLoading || isLoadingMapel}
                >
                  <span className={mapelId ? 'text-slate-900' : 'text-slate-500'}>
                    {mapelId
                      ? mapelOptions.find((m) => m.id.toString() === mapelId)?.nama_mapel ||
                        namaMapel ||
                        'Pilih Mata Pelajaran'
                      : namaMapel || 'Pilih Mata Pelajaran'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      showMapelDropdown ? 'rotate-180' : ''
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

                {showMapelDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl">
                    <div className="max-h-60 overflow-y-auto">
                      {mapelOptions.map((mapel) => (
                        <button
                          key={mapel.id}
                          type="button"
                          onClick={() => handleSelectMapel(mapel)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-900 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:bg-amber-50 focus:text-amber-700"
                        >
                          {mapel.nama_mapel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {isLoadingMapel && (
                  <FaSpinner className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 animate-spin w-4 h-4" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Guru Pengampu <span className="text-red-500">*</span>
              </label>
              <div className="dropdown-container relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuruDropdown(!showGuruDropdown)
                    setShowMapelDropdown(false) // Tutup dropdown mapel
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  disabled={isLoading || isLoadingGuru}
                >
                  <span className={guruPengampuId ? 'text-slate-900' : 'text-slate-500'}>
                    {guruPengampuId
                      ? guruOptions.find((g) => g.id.toString() === guruPengampuId)?.nama_lengkap ||
                        'Pilih Guru Pengampu'
                      : 'Pilih Guru Pengampu'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      showGuruDropdown ? 'rotate-180' : ''
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

                {showGuruDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl">
                    <div className="max-h-60 overflow-y-auto">
                      {guruOptions.map((guru) => (
                        <button
                          key={guru.id}
                          type="button"
                          onClick={() => handleSelectGuru(guru)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-900 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:bg-amber-50 focus:text-amber-700"
                        >
                          {guru.nama_lengkap} ({guru.nip})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {isLoadingGuru && (
                  <FaSpinner className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 animate-spin w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-200"
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || isLoadingData || !mapelId || !guruPengampuId}
            icon={
              isLoading ? (
                <FaSpinner className="animate-spin w-4 h-4" />
              ) : (
                <FaEdit className="w-4 h-4" />
              )
            }
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memperbarui...' : 'Perbarui Mata Pelajaran'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
