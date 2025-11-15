import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import LaporanService from '../../../../services/Ortu/laporan/LaporanService'
import { GRADE_COLORS } from '../config/constants'

export const useLaporan = () => {
  // State for tahun ajaran options
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([])
  const [selectedTahun, setSelectedTahun] = useState(null)

  // State for semester options (NEW!)
  const [semesterOptions, setSemesterOptions] = useState([])
  const [selectedSemester, setSelectedSemester] = useState(null)

  // State for laporan data
  const [siswaInfo, setSiswaInfo] = useState(null)
  const [dataTampil, setDataTampil] = useState([])
  const [statistik, setStatistik] = useState(null)

  // Loading states
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isLoadingSemester, setIsLoadingSemester] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // === API #1: Load Tahun Ajaran Options ===
  useEffect(() => {
    const loadTahunAjaran = async () => {
      try {
        setIsLoadingOptions(true)
        const response = await LaporanService.getTahunAjaran()

        if (response.status === 'success') {
          const options = response.data.map((item) => ({
            value: item.id,
            label: item.label,
            is_active: item.is_active,
          }))
          setTahunAjaranOptions(options)

          // Auto-select active tahun ajaran
          const active = response.data.find((item) => item.is_active)
          if (active) {
            setSelectedTahun(active.id)
          } else if (response.data.length > 0) {
            setSelectedTahun(response.data[0].id)
          }
        }
      } catch (error) {
        console.error('Error loading tahun ajaran:', error)

        if (error.response?.status === 401) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
        } else if (error.response?.status === 403) {
          toast.error('Akses ditolak. Hanya orang tua yang dapat mengakses halaman ini.')
        } else {
          toast.error('Gagal memuat tahun ajaran')
        }
      } finally {
        setIsLoadingOptions(false)
      }
    }

    loadTahunAjaran()
  }, [])

  // === API #2: Load Semester Options (NEW!) ===
  useEffect(() => {
    if (!selectedTahun) return

    const loadSemester = async () => {
      try {
        setIsLoadingSemester(true)
        const response = await LaporanService.getSemester(selectedTahun)

        if (response.status === 'success') {
          const options = response.data.map((item) => ({
            value: item.semester,
            label: item.label,
            has_nilai: item.has_nilai,
          }))
          setSemesterOptions(options)

          // Auto-select first semester or semester with nilai
          const withNilai = response.data.find((item) => item.has_nilai)
          if (withNilai) {
            setSelectedSemester(withNilai.semester)
          } else if (response.data.length > 0) {
            setSelectedSemester(response.data[0].semester)
          }
        }
      } catch (error) {
        console.error('Error loading semester:', error)

        if (error.response?.status === 401) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
        } else if (error.response?.status === 403) {
          toast.error('Akses ditolak.')
        } else {
          toast.error('Gagal memuat semester')
        }
      } finally {
        setIsLoadingSemester(false)
      }
    }

    loadSemester()
  }, [selectedTahun])

  // === API #3: Load Laporan Nilai ===
  useEffect(() => {
    if (!selectedTahun || !selectedSemester) return

    const loadLaporanNilai = async () => {
      try {
        setIsLoading(true)
        const response = await LaporanService.getLaporanNilai(selectedTahun, selectedSemester)

        if (response.status === 'success') {
          setSiswaInfo(response.data.siswa)
          setDataTampil(response.data.nilai || [])
          setStatistik(response.data.statistik)

          if (response.data.nilai.length === 0) {
            toast.info('Belum ada data laporan untuk periode ini')
          }
        }
      } catch (error) {
        console.error('Error loading laporan nilai:', error)

        if (error.response?.status === 400) {
          toast.error(error.response.data.message || 'Parameter tidak valid')
        } else if (error.response?.status === 401) {
          toast.error('NISN anak tidak ditemukan. Silakan login kembali.')
        } else if (error.response?.status === 403) {
          toast.error('Anda tidak memiliki akses ke data ini')
        } else if (error.response?.status === 404) {
          toast.info('Data nilai tidak ditemukan untuk siswa ini')
          setSiswaInfo(null)
          setDataTampil([])
          setStatistik(null)
        } else {
          toast.error('Gagal memuat laporan nilai')
        }

        // Reset data on error
        if (error.response?.status !== 404) {
          setDataTampil([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadLaporanNilai()
  }, [selectedTahun, selectedSemester])

  // Get grade badge color class
  const getPredikatBadge = (predikat) => {
    return GRADE_COLORS[predikat] || 'bg-gray-100 text-gray-800'
  }

  // === API #4: Handle Download PDF ===
  const handleDownloadPDF = async () => {
    if (!selectedTahun || !selectedSemester || dataTampil.length === 0) {
      toast.error('Tidak ada data untuk diunduh')
      return
    }

    try {
      setIsDownloading(true)
      await LaporanService.downloadPDF(selectedTahun, selectedSemester)
      toast.success('PDF berhasil diunduh')
    } catch (error) {
      console.error('Error downloading PDF:', error)

      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Parameter tidak valid')
      } else if (error.response?.status === 401) {
        toast.error('NISN anak tidak ditemukan. Silakan login kembali.')
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses untuk mengunduh laporan ini')
      } else if (error.response?.status === 404) {
        toast.error('Data tidak ditemukan untuk generate PDF')
      } else {
        toast.error('Gagal mengunduh PDF')
      }
    } finally {
      setIsDownloading(false)
    }
  }

  return {
    // State
    tahunAjaranOptions,
    selectedTahun,
    semesterOptions,
    selectedSemester,
    siswaInfo,
    dataTampil,
    statistik,
    isLoadingOptions,
    isLoadingSemester,
    isLoading,
    isDownloading,

    // Actions
    setSelectedTahun,
    setSelectedSemester,
    getPredikatBadge,
    handleDownloadPDF,
  }
}
