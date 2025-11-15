import { useState, useEffect, useCallback } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaSpinner, FaPlus, FaBook } from 'react-icons/fa'
import toast from 'react-hot-toast'
import TambahMapelCustomModal from './TambahMapelCustomModal'
import { KelasService } from '../../../../services/Admin/kelas/KelasService'

// ============================================================================
// COMPONENT
// ============================================================================

export default function TambahMapelModal({ isOpen, onClose, onSave, kelasId, tahunAjaranId }) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [mapelId, setMapelId] = useState('')
  const [guruPengampuId, setGuruPengampuId] = useState('')
  const [guruOptions, setGuruOptions] = useState([])
  const [mapelOptions, setMapelOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGuru, setIsLoadingGuru] = useState(false)
  const [isLoadingMapel, setIsLoadingMapel] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [showMapelDropdown, setShowMapelDropdown] = useState(false)
  const [showGuruDropdown, setShowGuruDropdown] = useState(false)

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadGuruOptions = useCallback(async () => {
    setIsLoadingGuru(true)
    try {
      const response = await KelasService.getDropdownGuru()

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

  const loadMapelOptions = useCallback(async () => {
    if (!kelasId || !tahunAjaranId) return

    setIsLoadingMapel(true)
    try {
      const response = await KelasService.getDropdownMataPelajaran({
        kelas_id: kelasId,
        tahun_ajaran_id: tahunAjaranId,
      })

      if (response.status === 'success') {
        setMapelOptions(response.data || [])
      } else {
        toast.error(response.message || 'Gagal mengambil data mata pelajaran')
      }
    } catch (error) {
      console.error('Error loading mapel options:', error)
      toast.error('Terjadi kesalahan saat memuat daftar mata pelajaran')
    } finally {
      setIsLoadingMapel(false)
    }
  }, [kelasId, tahunAjaranId])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      loadGuruOptions()
      loadMapelOptions()
    }
  }, [isOpen, loadGuruOptions, loadMapelOptions])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectMapel = (mapel) => {
    if (mapel.id === '__custom__') {
      // Buka modal custom
      setIsCustomModalOpen(true)
    } else {
      setMapelId(mapel.id.toString())
      setShowMapelDropdown(false)
    }
  }

  const handleSelectGuru = (guru) => {
    setGuruPengampuId(guru.id.toString())
    setShowGuruDropdown(false)
  }

  const handleSaveCustomMapel = async (mapelData) => {
    try {
      // Refresh dropdown mapel
      await loadMapelOptions()

      // Set mapel yang baru ditambahkan
      setMapelId(mapelData.id.toString())
      setIsCustomModalOpen(false)
      toast.success(`"${mapelData.nama_mapel}" berhasil ditambahkan dan dipilih`)
    } catch (error) {
      console.error('Error handling custom mapel:', error)
      toast.error('Gagal memproses mata pelajaran baru')
    }
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
      const response = await KelasService.tambahMataPelajaranKeKelas(kelasId, {
        mapel_id: parseInt(mapelId),
        guru_id: parseInt(guruPengampuId),
        tahun_ajaran_id: tahunAjaranId,
      })

      if (response.status === 'success') {
        toast.success('Mata pelajaran berhasil ditambahkan ke kelas')
        onSave?.({
          id: response.data.id,
          nama_mapel: response.data.nama_mapel,
          guru_pengampu: response.data.guru_pengampu,
          nip_guru: response.data.nip_guru,
        })
        handleClose()
      } else {
        toast.error(response.message || 'Gagal menambahkan mata pelajaran')
      }
    } catch (error) {
      console.error('Error adding mapel:', error)
      toast.error('Terjadi kesalahan saat menambahkan mata pelajaran')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClickOutside = (e) => {
    if (e.target.closest('.dropdown-container')) return
    setShowMapelDropdown(false)
    setShowGuruDropdown(false)
  }

  const handleClose = () => {
    setMapelId('')
    setGuruPengampuId('')
    setGuruOptions([])
    setMapelOptions([])
    setShowMapelDropdown(false)
    setShowGuruDropdown(false)
    onClose?.()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Mata Pelajaran"
      description="Tambahkan mata pelajaran ke kelas"
      icon={<FaBook className="text-blue-600 text-xl" />}
      size="md"
      isLoading={isLoading}
    >
      <div className="space-y-4">
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
                className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isLoading || isLoadingMapel}
              >
                <span className={mapelId ? 'text-slate-900' : 'text-slate-500'}>
                  {mapelId
                    ? mapelOptions.find((m) => m.id.toString() === mapelId)?.nama_mapel ||
                      'Pilih Mata Pelajaran'
                    : 'Pilih Mata Pelajaran'}
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
                        className="w-full text-left px-3 py-2 text-sm text-slate-900 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:bg-blue-50 focus:text-blue-700"
                      >
                        {mapel.nama_mapel}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSelectMapel({ id: '__custom__' })}
                      className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 border-t border-slate-200"
                    >
                      + Tambah Mata Pelajaran Baru
                    </button>
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
                className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        className="w-full text-left px-3 py-2 text-sm text-slate-900 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:bg-blue-50 focus:text-blue-700"
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

        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading} className="flex-1">
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !mapelId || !guruPengampuId}
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

      <TambahMapelCustomModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleSaveCustomMapel}
      />
    </CustomModal>
  )
}
