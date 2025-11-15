import { useState, useEffect, useCallback, useMemo } from 'react'
import Modal from '../../../ui/Modal'
import Button from '../../../ui/Button'
import {
  FaGraduationCap,
  FaUsers,
  FaCheck,
  FaSpinner,
  FaArrowUp,
  FaInfoCircle,
  FaSearch,
  FaExclamationTriangle,
} from 'react-icons/fa'
import { KelasService } from '../../../../services/Admin/kelas/KelasService'
import toast from 'react-hot-toast'

// ============================================================================
// COMPONENT
// ============================================================================

export default function NaikKelasModal({ isOpen, onClose, onSave, kelasId }) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [kelasTujuanId, setKelasTujuanId] = useState('')
  const [kelasTujuanOptions, setKelasTujuanOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingKelas, setIsLoadingKelas] = useState(false)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [naikKelasInfo, setNaikKelasInfo] = useState(null)
  const [siswaData, setSiswaData] = useState([])
  const [originalSiswaData, setOriginalSiswaData] = useState([])
  const [isLoadingNaikKelasInfo, setIsLoadingNaikKelasInfo] = useState(false)
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false)

  const [selectedSiswaIds, setSelectedSiswaIds] = useState(new Set())

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const kelasInfo = naikKelasInfo?.kelas_asal || null
  const tahunAjaranTujuanInfo = naikKelasInfo?.tahun_ajaran_tujuan || null
  const tahunAjaranTujuan = tahunAjaranTujuanInfo?.tahun || ''
  const semesterTujuan = tahunAjaranTujuanInfo?.semester || ''
  const tahunAjaranTujuanId = tahunAjaranTujuanInfo?.id || null

  const filteredSiswaData = useMemo(() => siswaData || [], [siswaData])

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadNaikKelasInfo = useCallback(async () => {
    if (!kelasId) return

    setIsLoadingNaikKelasInfo(true)
    try {
      const response = await KelasService.getNaikKelasInfo(kelasId)
      if (response.status === 'success') {
        setNaikKelasInfo(response.data)

        // Validasi tahun ajaran tujuan tersedia
        if (!response.data.tahun_ajaran_tujuan) {
          toast.error('Tahun ajaran tujuan belum tersedia. Silakan buat terlebih dahulu.')
          return
        }
      } else {
        toast.error(response.message || 'Gagal mengambil informasi naik kelas')
      }
    } catch (error) {
      console.error('Error loading naik kelas info:', error)
      toast.error('Terjadi kesalahan saat mengambil informasi naik kelas')
    } finally {
      setIsLoadingNaikKelasInfo(false)
    }
  }, [kelasId])

  const loadSiswaData = useCallback(async () => {
    if (!kelasId || !kelasInfo?.tahun_ajaran_id) return

    setIsLoadingSiswa(true)
    try {
      const response = await KelasService.getDaftarSiswaKelas(kelasId, kelasInfo.tahun_ajaran_id)
      if (response.status === 'success') {
        const siswaList = response.data.data || []
        setOriginalSiswaData(siswaList) // Store data asli
        setSiswaData(siswaList) // Set data untuk display

        // Reset selection saat load data baru
        setSelectedSiswaIds(new Set())
      } else {
        toast.error('Gagal mengambil daftar siswa')
      }
    } catch (error) {
      console.error('Error loading siswa data:', error)
      toast.error('Terjadi kesalahan saat mengambil daftar siswa')
    } finally {
      setIsLoadingSiswa(false)
    }
  }, [kelasId, kelasInfo?.tahun_ajaran_id])

  const loadKelasTujuanOptions = useCallback(async () => {
    if (!tahunAjaranTujuanId) return

    setIsLoadingKelas(true)
    try {
      const response = await KelasService.getDropdownKelas({
        tahun_ajaran_id: tahunAjaranTujuanId,
        exclude_kelas_id: kelasId, // Exclude kelas asal
      })

      if (response.status === 'success') {
        setKelasTujuanOptions(response.data || [])
      } else {
        toast.error('Gagal memuat daftar kelas tujuan')
        setKelasTujuanOptions([])
      }
    } catch (error) {
      console.error('Error loading kelas tujuan options:', error)
      toast.error('Terjadi kesalahan saat memuat daftar kelas tujuan')
      setKelasTujuanOptions([])
    } finally {
      setIsLoadingKelas(false)
    }
  }, [tahunAjaranTujuanId, kelasId])

  const filterSiswa = useCallback(
    (query) => {
      if (!query || query.trim() === '') {
        // Jika search kosong, tampilkan semua siswa dari data asli
        setSiswaData(originalSiswaData)
        return
      }

      // Filter client-side dari data yang sudah di-load
      const filtered = originalSiswaData.filter((siswa) => {
        const searchLower = query.toLowerCase()
        return (
          siswa.nama_lengkap.toLowerCase().includes(searchLower) ||
          siswa.nisn.toLowerCase().includes(searchLower)
        )
      })

      setSiswaData(filtered)
    },
    [originalSiswaData]
  )

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectAll = () => {
    if (selectedSiswaIds.size === originalSiswaData.length) {
      // Deselect all
      setSelectedSiswaIds(new Set())
    } else {
      // Select all siswa di kelas (bukan hanya yang ditampilkan)
      const allIds = originalSiswaData.map((siswa) => siswa.id)
      setSelectedSiswaIds(new Set(allIds))
    }
  }

  const handleToggleSiswa = (siswaId) => {
    setSelectedSiswaIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(siswaId)) {
        newSet.delete(siswaId)
      } else {
        newSet.add(siswaId)
      }
      return newSet
    })
  }

  const handleSubmit = async () => {
    // Validasi form
    if (!kelasTujuanId) {
      toast.error('Pilih kelas tujuan terlebih dahulu')
      return
    }

    if (selectedSiswaIds.size === 0) {
      toast.error('Pilih minimal 1 siswa untuk naik kelas')
      return
    }

    if (!tahunAjaranTujuanId) {
      toast.error('Tahun ajaran tujuan tidak tersedia')
      return
    }

    // Validasi jumlah siswa
    if (selectedSiswaIds.size > 100) {
      toast.error('Maksimal 100 siswa per request')
      return
    }

    // Tampilkan custom confirmation modal
    setShowConfirmModal(true)
  }

  const handleConfirmNaikKelas = async () => {
    if (!kelasTujuanId) {
      toast.error('Pilih kelas tujuan terlebih dahulu')
      return
    }

    if (selectedSiswaIds.size === 0) {
      toast.error('Pilih minimal 1 siswa')
      return
    }

    if (selectedSiswaIds.size > 100) {
      toast.error('Maksimal 100 siswa per request')
      return
    }

    setIsLoading(true)
    try {
      // Execute naik kelas dengan API
      const response = await KelasService.executeNaikKelas(kelasId, {
        kelas_tujuan_id: parseInt(kelasTujuanId),
        tahun_ajaran_tujuan_id: tahunAjaranTujuanId,
        siswa_ids: Array.from(selectedSiswaIds),
      })

      if (response.status === 'success') {
        // Success notification dengan detail
        const summary = response.data.summary
        toast.success(
          `${response.message}\n\n` +
            `Total Diproses: ${summary.total_diproses}\n` +
            `Berhasil: ${summary.berhasil}\n` +
            `Gagal: ${summary.gagal}`,
          { duration: 5000 }
        )

        // Callback dengan data lengkap
        onSave?.({
          kelasAsalId: kelasId,
          kelasTujuanId: parseInt(kelasTujuanId),
          siswaIds: Array.from(selectedSiswaIds),
          summary: {
            total: summary.total_diproses,
            success: summary.berhasil,
            failed: summary.gagal,
          },
          detail: response.data.detail,
        })

        setShowConfirmModal(false)
        handleClose()
      } else {
        // Handle specific error messages
        if (response.message?.includes('tidak ditemukan')) {
          toast.error('Kelas asal atau tujuan tidak ditemukan')
        } else if (response.message?.includes('tidak terdaftar')) {
          toast.error('Siswa tidak terdaftar di kelas asal')
        } else if (response.message?.includes('sudah terdaftar')) {
          toast.error('Siswa sudah terdaftar di kelas tujuan')
        } else if (response.message?.includes('array')) {
          toast.error('Data siswa tidak valid')
        } else if (response.message?.includes('100')) {
          toast.error('Maksimal 100 siswa per request')
        } else {
          toast.error(response.message || 'Gagal memindahkan siswa ke kelas tujuan')
        }
      }
    } catch (error) {
      console.error('Error executing naik kelas:', error)

      // Handle network errors
      if (error.response?.status === 404) {
        toast.error('Kelas asal tidak ditemukan')
      } else if (error.response?.status === 400) {
        toast.error('Data yang dikirim tidak valid')
      } else if (error.response?.status === 500) {
        toast.error('Terjadi kesalahan server')
      } else {
        toast.error('Terjadi kesalahan saat memindahkan siswa ke kelas tujuan')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setKelasTujuanId('')
    setSelectedSiswaIds(new Set())
    setSearchTerm('')
    setNaikKelasInfo(null)
    setSiswaData([])
    setOriginalSiswaData([])
    setKelasTujuanOptions([])
    onClose?.()
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen && kelasId) {
      loadNaikKelasInfo()
    }
  }, [isOpen, kelasId, loadNaikKelasInfo])

  useEffect(() => {
    if (kelasInfo?.tahun_ajaran_id) {
      loadSiswaData()
    }
  }, [kelasInfo?.tahun_ajaran_id, loadSiswaData])

  useEffect(() => {
    if (tahunAjaranTujuanId) {
      loadKelasTujuanOptions()
    }
  }, [tahunAjaranTujuanId, loadKelasTujuanOptions])

  useEffect(() => {
    if (isOpen && originalSiswaData.length > 0) {
      const allIds = originalSiswaData.map((siswa) => siswa.id)
      setSelectedSiswaIds(new Set(allIds))
    }
  }, [isOpen, originalSiswaData])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterSiswa(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterSiswa])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Naik Kelas Siswa" size="lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Header Section - Compact */}
        <div className="text-center bg-gradient-to-r from-emerald-50 to-blue-50 p-3 rounded-lg border border-emerald-100">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FaGraduationCap className="text-emerald-600 w-4 h-4" />
            <h3 className="text-base font-semibold text-slate-800">Promosi Kelas</h3>
          </div>
          <p className="text-xs text-slate-600">
            Pindahkan siswa dari{' '}
            <span className="font-semibold text-emerald-700">
              {isLoadingNaikKelasInfo ? 'Memuat...' : kelasInfo?.nama_kelas || 'Kelas'}
            </span>{' '}
            ke kelas yang lebih tinggi
          </p>

          {/* Informasi Kelas Asal */}
          {kelasInfo && (
            <div className="bg-white/60 rounded-md p-2 border border-emerald-200 mt-2">
              <div className="text-xs font-medium text-slate-700 mb-1">Kelas Asal</div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">{kelasInfo.nama_kelas}</span>
                {kelasInfo.wali_kelas_nama && (
                  <span className="text-slate-500"> • Wali: {kelasInfo.wali_kelas_nama}</span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {kelasInfo.tahun} - {kelasInfo.semester}
                {kelasInfo.jumlah_siswa !== undefined && (
                  <span> • {kelasInfo.jumlah_siswa} siswa</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Selection - Compact Grid */}
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <FaUsers className="text-slate-500 w-3 h-3" />
            Informasi Kelas Tujuan
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Kelas Tujuan */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kelas Tujuan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={kelasTujuanId}
                  onChange={(e) => setKelasTujuanId(e.target.value)}
                  disabled={isLoadingKelas}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs bg-white shadow-sm transition-all duration-200"
                >
                  <option value="">
                    {isLoadingKelas ? 'Memuat kelas tujuan...' : 'Pilih Kelas Tujuan'}
                  </option>
                  {kelasTujuanOptions.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.label_kelas || `${kelas.nama_kelas} (${kelas.jumlah_siswa} siswa)`}
                    </option>
                  ))}
                </select>
                {isLoadingKelas && (
                  <FaSpinner className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 animate-spin w-3 h-3" />
                )}
              </div>
            </div>

            {/* Tahun Ajaran Tujuan (Auto-fill) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tahun Ajaran Tujuan
              </label>
              <div
                className={`px-2 py-1.5 border rounded-md text-xs font-medium shadow-sm ${
                  !tahunAjaranTujuanInfo
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                {isLoadingNaikKelasInfo
                  ? 'Memuat...'
                  : !tahunAjaranTujuanInfo
                  ? 'Tidak tersedia'
                  : tahunAjaranTujuan}
              </div>
            </div>

            {/* Semester Tujuan (Auto-fill) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Semester Tujuan
              </label>
              <div
                className={`px-2 py-1.5 border rounded-md text-xs font-medium shadow-sm ${
                  !tahunAjaranTujuanInfo
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                {isLoadingNaikKelasInfo
                  ? 'Memuat...'
                  : !tahunAjaranTujuanInfo
                  ? 'Tidak tersedia'
                  : semesterTujuan}
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Siswa - Compact */}
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-2">
              <FaUsers className="text-slate-500 w-3 h-3" />
              Daftar Siswa
              <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                {isLoadingSiswa ? 'Memuat...' : `${filteredSiswaData.length} siswa`}
              </span>
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs px-2 py-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              {selectedSiswaIds.size === originalSiswaData.length ? 'Batal Semua' : 'Pilih Semua'}
            </Button>
          </div>

          {/* Search Input - Compact */}
          <div className="mb-2">
            <div className="relative">
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari siswa berdasarkan nama atau NISN..."
                className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs bg-white shadow-sm transition-all duration-200"
              />
            </div>
          </div>

          <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-md bg-slate-50">
            {isLoadingSiswa ? (
              <div className="p-3 text-center">
                <FaSpinner className="mx-auto text-slate-400 w-4 h-4 mb-1 animate-spin" />
                <p className="text-slate-500 text-xs">Memuat daftar siswa...</p>
              </div>
            ) : filteredSiswaData.length > 0 ? (
              filteredSiswaData.map((siswa) => {
                const isSelected = selectedSiswaIds.has(siswa.id)
                return (
                  <div
                    key={siswa.id}
                    className={`flex items-center gap-2 p-2 border-b border-slate-200 last:border-b-0 hover:bg-white cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-emerald-50 border-emerald-200' : 'hover:shadow-sm'
                    }`}
                    onClick={() => handleToggleSiswa(siswa.id)}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center">
                          <FaCheck className="text-white w-2.5 h-2.5" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-300 rounded hover:border-emerald-400 transition-colors duration-200"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {siswa.nama_lengkap}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">{siswa.nisn}</p>
                        </div>
                        <div className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                          {siswa.jenis_kelamin}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-3 text-center">
                <FaUsers className="mx-auto text-slate-300 w-5 h-5 mb-1" />
                <p className="text-slate-500 text-xs">
                  {searchTerm ? 'Tidak ada siswa yang cocok dengan pencarian' : 'Tidak ada siswa'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Section - Compact */}
        <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <FaInfoCircle className="text-emerald-600 w-3 h-3" />
            <span className="text-xs font-semibold text-slate-800">Ringkasan Promosi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-white p-2 rounded-md border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Total Dipilih:</span>
                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                  {selectedSiswaIds.size} dari {originalSiswaData.length} siswa
                </span>
              </div>
            </div>

            <div className="bg-white p-2 rounded-md border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Kelas Asal:</span>
                <span className="text-xs font-semibold text-slate-800">
                  {isLoadingNaikKelasInfo ? 'Memuat...' : kelasInfo?.nama_kelas || 'Kelas'}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {isLoadingNaikKelasInfo
                  ? 'Memuat...'
                  : `${kelasInfo?.tahun || ''} - ${kelasInfo?.semester || ''}`}
              </div>
              {kelasInfo?.wali_kelas_nama && (
                <div className="text-xs text-slate-500">Wali: {kelasInfo.wali_kelas_nama}</div>
              )}
            </div>

            <div className="bg-white p-2 rounded-md border border-slate-200 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Kelas Tujuan:</span>
                <span className="text-xs font-semibold text-slate-800">
                  {kelasTujuanOptions.find((k) => k.id === parseInt(kelasTujuanId))?.nama_kelas ||
                    'Belum dipilih'}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {kelasTujuanOptions.find((k) => k.id === parseInt(kelasTujuanId))
                  ? `${tahunAjaranTujuan} - ${semesterTujuan}`
                  : 'Pilih kelas tujuan terlebih dahulu'}
              </div>
              {kelasTujuanOptions.find((k) => k.id === parseInt(kelasTujuanId))?.jumlah_siswa !==
                undefined && (
                <div className="text-xs text-slate-500 mt-1">
                  {kelasTujuanOptions.find((k) => k.id === parseInt(kelasTujuanId))?.jumlah_siswa}{' '}
                  siswa terdaftar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-200 text-sm"
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              isLoading || !kelasTujuanId || selectedSiswaIds.size === 0 || !tahunAjaranTujuanInfo
            }
            icon={
              isLoading ? (
                <FaSpinner className="animate-spin w-3 h-3" />
              ) : (
                <FaArrowUp className="w-3 h-3" />
              )
            }
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Memproses...' : `Naik Kelas (${selectedSiswaIds.size})`}
          </Button>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Konfirmasi Naik Kelas"
      >
        <div className="p-4">
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <FaExclamationTriangle className="text-amber-500 text-5xl mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Konfirmasi Naik Kelas</h3>
            <p className="text-slate-600 mb-4">
              Apakah Anda yakin ingin memindahkan{' '}
              <span className="font-bold">{selectedSiswaIds.size} siswa</span> dari{' '}
              <span className="font-bold">{naikKelasInfo?.kelas_asal?.nama_kelas}</span> ke kelas
              tujuan?
            </p>
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm w-full max-w-md">
              <p className="font-semibold">Informasi:</p>
              <p>Data di kelas lama akan tetap tersimpan sebagai arsip.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmNaikKelas}
              disabled={isLoading}
              icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaArrowUp />}
            >
              {isLoading ? 'Memproses...' : 'Ya, Naik Kelas'}
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  )
}
