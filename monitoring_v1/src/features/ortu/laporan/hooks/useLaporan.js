import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import LaporanService from '../../../../services/Ortu/laporan/LaporanService'
import { GRADE_COLORS } from '../config/constants'

export const useLaporan = () => {
  // State for tahun ajaran options
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([])
  const [selectedTahun, setSelectedTahun] = useState('') // String tahun (e.g., "2025/2026")

  // State for semester options
  const [semesterOptions, setSemesterOptions] = useState([])
  const [semesterData, setSemesterData] = useState([]) // Data lengkap dengan tahun_ajaran_id
  const [selectedSemester, setSelectedSemester] = useState('') // Semester value ("1" atau "2")
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState('') // ID dari semester response

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
          // Response: [{ "tahun_ajaran": "2025/2026", "is_active": true }]
          const options = response.data.map((item) => ({
            value: item.tahun_ajaran,
            label: `T.A ${item.tahun_ajaran}`,
            is_active: item.is_active,
          }))
          setTahunAjaranOptions(options)

          // Auto-select active tahun ajaran
          const active = response.data.find((item) => item.is_active)
          if (active) {
            setSelectedTahun(active.tahun_ajaran)
          } else if (response.data.length > 0) {
            setSelectedTahun(response.data[0].tahun_ajaran)
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

  // === API #2: Load Semester Options ===
  useEffect(() => {
    if (!selectedTahun) {
      setSemesterOptions([])
      setSemesterData([])
      setSelectedSemester('')
      setSelectedTahunAjaranId('')
      return
    }

    const loadSemester = async () => {
      try {
        setIsLoadingSemester(true)
        const response = await LaporanService.getSemester(selectedTahun)

        if (response.status === 'success') {
          // Response: [{ "tahun_ajaran_id": 1, "semester": "1", "label": "Semester 1 (Ganjil)" }]
          const semData = response.data
          setSemesterData(semData)

          const options = semData.map((item) => ({
            value: item.semester,
            label: item.label,
          }))
          setSemesterOptions(options)

          // Auto-select first semester
          if (semData.length > 0) {
            setSelectedSemester(semData[0].semester)
            setSelectedTahunAjaranId(semData[0].tahun_ajaran_id.toString())
          } else {
            setSelectedSemester('')
            setSelectedTahunAjaranId('')
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
        setSemesterOptions([])
        setSemesterData([])
        setSelectedSemester('')
        setSelectedTahunAjaranId('')
      } finally {
        setIsLoadingSemester(false)
      }
    }

    loadSemester()
  }, [selectedTahun])

  // === Update tahun_ajaran_id when semester changes ===
  useEffect(() => {
    if (selectedSemester && semesterData.length > 0) {
      const selected = semesterData.find((sem) => sem.semester === selectedSemester)
      if (selected) {
        setSelectedTahunAjaranId(selected.tahun_ajaran_id.toString())
      }
    }
  }, [selectedSemester, semesterData])

  // === API #3: Load Laporan Nilai ===
  useEffect(() => {
    if (!selectedTahunAjaranId || !selectedSemester) return

    const loadLaporanNilai = async () => {
      try {
        setIsLoading(true)
        const response = await LaporanService.getLaporanNilai(
          selectedTahunAjaranId,
          selectedSemester
        )

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
  }, [selectedTahunAjaranId, selectedSemester])

  // Get grade badge color class
  const getPredikatBadge = (predikat) => {
    return GRADE_COLORS[predikat] || 'bg-gray-100 text-gray-800'
  }

  // === API #4: Handle Download PDF ===
  const handleDownloadPDF = async () => {
    if (!selectedTahunAjaranId || !selectedSemester || dataTampil.length === 0) {
      toast.error('Tidak ada data untuk diunduh')
      return
    }

    try {
      setIsDownloading(true)
      await LaporanService.downloadPDF(selectedTahunAjaranId, selectedSemester)
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
