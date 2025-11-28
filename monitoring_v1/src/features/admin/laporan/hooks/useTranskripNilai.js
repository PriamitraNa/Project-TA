import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { LaporanService } from '../../../../services/Admin/laporan/LaporanService'

export function useTranskripNilai() {
  // Cascade State
  const [tahunAjaranList, setTahunAjaranList] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [siswaList, setSiswaList] = useState([])

  // Selected Values
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('')
  const [selectedKelas, setSelectedKelas] = useState('')
  const [selectedSiswa, setSelectedSiswa] = useState('')

  // Mode: 'individual' or 'bulk'
  const [downloadMode, setDownloadMode] = useState('individual')

  // Loading States
  const [isLoadingTahunAjaran, setIsLoadingTahunAjaran] = useState(true)
  const [isLoadingKelas, setIsLoadingKelas] = useState(false)
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false)
  const [isLoadingTranskrip, setIsLoadingTranskrip] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Transkrip Data
  const [transkripData, setTranskripData] = useState(null)

  // ==================== LOAD TAHUN AJARAN (Initial) ====================
  useEffect(() => {
    loadTahunAjaran()
  }, [])

  const loadTahunAjaran = async () => {
    setIsLoadingTahunAjaran(true)
    try {
      const response = await LaporanService.getTahunAjaran()
      if (response.success) {
        setTahunAjaranList(response.data)
      }
    } catch (error) {
      console.error('Error loading tahun ajaran:', error)
      toast.error('Gagal memuat data tahun ajaran')
    } finally {
      setIsLoadingTahunAjaran(false)
    }
  }

  // ==================== LOAD KELAS (When Tahun Ajaran Selected) ====================
  useEffect(() => {
    if (selectedTahunAjaran) {
      loadKelas(selectedTahunAjaran)
    } else {
      // Reset
      setKelasList([])
      setSelectedKelas('')
      setSiswaList([])
      setSelectedSiswa('')
      setTranskripData(null)
    }
  }, [selectedTahunAjaran])

  const loadKelas = async (tahunAjaranId) => {
    setIsLoadingKelas(true)
    try {
      const response = await LaporanService.getKelasByTahunAjaran(tahunAjaranId)
      if (response.success) {
        setKelasList(response.data)
      }
    } catch (error) {
      console.error('Error loading kelas:', error)
      toast.error('Gagal memuat data kelas')
    } finally {
      setIsLoadingKelas(false)
    }
  }

  // ==================== LOAD SISWA (When Kelas Selected) ====================
  useEffect(() => {
    if (selectedKelas && selectedTahunAjaran) {
      loadSiswa(selectedKelas, selectedTahunAjaran)
    } else {
      // Reset
      setSiswaList([])
      setSelectedSiswa('')
      setTranskripData(null)
    }
  }, [selectedKelas, selectedTahunAjaran])

  const loadSiswa = async (kelasId, tahunAjaranId) => {
    setIsLoadingSiswa(true)
    try {
      const response = await LaporanService.getSiswaByKelas(kelasId, tahunAjaranId)
      if (response.success) {
        setSiswaList(response.data)
      }
    } catch (error) {
      console.error('Error loading siswa:', error)
      toast.error('Gagal memuat data siswa')
    } finally {
      setIsLoadingSiswa(false)
    }
  }

  // ==================== LOAD TRANSKRIP (When Siswa Selected in Individual Mode) ====================
  useEffect(() => {
    if (selectedSiswa && downloadMode === 'individual') {
      loadTranskrip(selectedSiswa)
    } else {
      setTranskripData(null)
    }
  }, [selectedSiswa, downloadMode])

  const loadTranskrip = async (siswaId) => {
    setIsLoadingTranskrip(true)
    try {
      const response = await LaporanService.getTranskripSiswa(siswaId)
      if (response.success) {
        setTranskripData(response.data)
      }
    } catch (error) {
      console.error('Error loading transkrip:', error)
      toast.error('Gagal memuat transkrip nilai')
      setTranskripData(null)
    } finally {
      setIsLoadingTranskrip(false)
    }
  }

  // ==================== HANDLERS ====================
  const handleTahunAjaranChange = (e) => {
    setSelectedTahunAjaran(e.target.value)
    setSelectedKelas('')
    setSelectedSiswa('')
  }

  const handleKelasChange = (e) => {
    setSelectedKelas(e.target.value)
    setSelectedSiswa('')
  }

  const handleSiswaChange = (e) => {
    setSelectedSiswa(e.target.value)
  }

  const handleModeChange = (mode) => {
    setDownloadMode(mode)
    if (mode === 'bulk') {
      setSelectedSiswa('')
    }
  }

  // ==================== DOWNLOAD PDF ====================
  const handleDownloadPDF = async () => {
    if (downloadMode === 'individual') {
      if (!selectedSiswa) {
        toast.error('Pilih siswa terlebih dahulu')
        return
      }

      setIsDownloading(true)
      try {
        await LaporanService.downloadTranskripPDF(selectedSiswa)
        toast.success('Transkrip PDF berhasil diunduh')
      } catch (error) {
        console.error('Error downloading PDF:', error)
        toast.error('Gagal mengunduh transkrip PDF')
      } finally {
        setIsDownloading(false)
      }
    } else {
      // Bulk download
      if (!selectedKelas || !selectedTahunAjaran) {
        toast.error('Pilih tahun ajaran dan kelas terlebih dahulu')
        return
      }

      setIsDownloading(true)
      try {
        await LaporanService.downloadTranskripBulk(selectedKelas, selectedTahunAjaran)
        toast.success('Transkrip PDF semua siswa berhasil diunduh')
      } catch (error) {
        console.error('Error downloading bulk PDF:', error)
        toast.error('Gagal mengunduh transkrip PDF')
      } finally {
        setIsDownloading(false)
      }
    }
  }

  // ==================== COMPUTED ====================
  const canDownloadPDF = () => {
    if (downloadMode === 'individual') {
      return selectedSiswa && transkripData
    } else {
      return selectedKelas && selectedTahunAjaran && siswaList.length > 0
    }
  }

  return {
    // Cascade State
    tahunAjaranList,
    kelasList,
    siswaList,

    // Selected Values
    selectedTahunAjaran,
    selectedKelas,
    selectedSiswa,
    downloadMode,

    // Handlers
    handleTahunAjaranChange,
    handleKelasChange,
    handleSiswaChange,
    handleModeChange,

    // Loading States
    isLoadingTahunAjaran,
    isLoadingKelas,
    isLoadingSiswa,
    isLoadingTranskrip,
    isDownloading,

    // Data
    transkripData,

    // Actions
    handleDownloadPDF,
    canDownloadPDF: canDownloadPDF(),
  }
}
