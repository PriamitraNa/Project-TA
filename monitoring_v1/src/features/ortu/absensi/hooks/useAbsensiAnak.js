import { useState, useEffect, useCallback } from 'react'
import { AbsensiAnakService } from '../../../../services/Ortu/absensi/AbsensiAnakService'
import toast from 'react-hot-toast'
import moment from 'moment'

/**
 * Custom hook untuk mengelola data absensi anak
 * Handle: fetching, filtering, error handling
 */
export function useAbsensiAnak() {
  // State untuk filter tahun ajaran & semester
  const [tahunAjaranList, setTahunAjaranList] = useState([])
  const [semesterList, setSemesterList] = useState([])
  const [bulanList, setBulanList] = useState([]) // Daftar bulan dari API
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState(null)
  const [selectedBulan, setSelectedBulan] = useState('') // Format: '01' - '12', empty = semua

  // State untuk data
  const [absensiData, setAbsensiData] = useState([])
  const [summary, setSummary] = useState({
    total_hadir: 0,
    total_sakit: 0,
    total_izin: 0,
    total_alpha: 0,
    total_hari: 0,
    persentase_hadir: 0,
  })

  // State untuk loading
  const [isLoading, setIsLoading] = useState(false)

  // Load tahun ajaran list dari API Ortu
  const loadTahunAjaran = useCallback(async () => {
    try {
      const response = await AbsensiAnakService.getTahunAjaran()
      if (response.status === 'success') {
        setTahunAjaranList(response.data.tahun_ajaran || [])

        // Auto-select tahun ajaran aktif jika ada
        const aktif = response.data.tahun_ajaran.find((ta) => ta.status === 'aktif')
        if (aktif) {
          setSelectedTahunAjaran(aktif.id)
        }
      }
    } catch (error) {
      console.error('Error loading tahun ajaran:', error)
      if (error.response?.status === 404) {
        toast.error('Data tahun ajaran tidak ditemukan')
      } else if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else {
        toast.error('Gagal mengambil data tahun ajaran')
      }
    }
  }, [])

  // Load semester list berdasarkan tahun ajaran
  const loadSemester = useCallback(async (tahunAjaranId) => {
    if (!tahunAjaranId) {
      setSemesterList([])
      setSelectedSemester(null)
      return
    }

    try {
      const response = await AbsensiAnakService.getSemester(tahunAjaranId)
      if (response.status === 'success') {
        setSemesterList(response.data.semester || [])

        // Auto-select semester aktif jika ada
        const aktif = response.data.semester.find((s) => s.status === 'aktif')
        if (aktif) {
          setSelectedSemester(aktif.value)
        } else if (response.data.semester.length > 0) {
          // Jika tidak ada yang aktif, pilih yang pertama
          setSelectedSemester(response.data.semester[0].value)
        }
      }
    } catch (error) {
      console.error('Error loading semester:', error)
      if (error.response?.status === 404) {
        toast.error('Data semester tidak ditemukan')
      } else if (error.response?.status === 400) {
        toast.error('Parameter tahun ajaran tidak valid')
      } else if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else {
        toast.error('Gagal mengambil data semester')
      }
      setSemesterList([])
      setSelectedSemester(null)
    }
  }, [])

  // Load bulan list berdasarkan tahun ajaran & semester
  const loadBulan = useCallback(async (tahunAjaranId, semester) => {
    if (!tahunAjaranId || !semester) {
      setBulanList([])
      return
    }

    try {
      const response = await AbsensiAnakService.getBulan(tahunAjaranId, semester)
      if (response.status === 'success') {
        setBulanList(response.data.bulan || [])
      }
    } catch (error) {
      console.error('Error loading bulan:', error)
      if (error.response?.status === 404) {
        toast.error('Data bulan tidak ditemukan')
      } else if (error.response?.status === 400) {
        toast.error('Parameter tidak valid')
      } else if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else {
        toast.error('Gagal mengambil data bulan')
      }
      setBulanList([])
    }
  }, [])

  // Load summary kehadiran (untuk 4 cards)
  const loadSummary = useCallback(async (tahunAjaranId, semester) => {
    if (!tahunAjaranId || !semester) {
      setSummary({
        total_hadir: 0,
        total_sakit: 0,
        total_izin: 0,
        total_alpha: 0,
        total_hari: 0,
        persentase_hadir: 0,
      })
      return
    }

    try {
      const response = await AbsensiAnakService.getSummary(tahunAjaranId, semester)
      if (response.status === 'success') {
        setSummary(
          response.data.summary || {
            total_hadir: 0,
            total_sakit: 0,
            total_izin: 0,
            total_alpha: 0,
            total_hari: 0,
            persentase_hadir: 0,
          }
        )
      }
    } catch (error) {
      console.error('Error loading summary:', error)
      if (error.response?.status === 404) {
        // Data tidak ditemukan → summary tetap 0 (bukan error)
        console.log('Belum ada data absensi untuk periode ini')
      } else if (error.response?.status === 400) {
        toast.error('Parameter tidak valid')
      } else if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else {
        toast.error('Gagal mengambil ringkasan kehadiran')
      }
      setSummary({
        total_hadir: 0,
        total_sakit: 0,
        total_izin: 0,
        total_alpha: 0,
        total_hari: 0,
        persentase_hadir: 0,
      })
    }
  }, [])

  // Load detail absensi untuk tabel (terpengaruh filter bulan)
  const loadDetail = useCallback(async () => {
    // Harus pilih tahun ajaran dan semester dulu
    if (!selectedTahunAjaran || !selectedSemester) {
      setAbsensiData([])
      return
    }

    setIsLoading(true)
    try {
      // Panggil API dengan bulan (optional)
      const response = await AbsensiAnakService.getDetail(
        selectedTahunAjaran,
        selectedSemester,
        selectedBulan || null // null jika "Semua Bulan"
      )

      if (response.status === 'success') {
        setAbsensiData(response.data.absensi || [])
      } else {
        toast.error(response.message || 'Gagal mengambil data absensi')
        setAbsensiData([])
      }
    } catch (error) {
      console.error('Error loading detail absensi:', error)
      if (error.response?.status === 404) {
        // Data tidak ditemukan → tabel kosong (bukan error)
        console.log('Belum ada data absensi untuk periode ini')
        setAbsensiData([])
      } else if (error.response?.status === 400) {
        toast.error('Parameter tidak valid')
        setAbsensiData([])
      } else if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
        setAbsensiData([])
      } else {
        toast.error('Gagal mengambil data absensi anak')
        setAbsensiData([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedTahunAjaran, selectedSemester, selectedBulan])

  // Load tahun ajaran saat mount
  useEffect(() => {
    loadTahunAjaran()
  }, [loadTahunAjaran])

  // Load semester saat tahun ajaran berubah
  useEffect(() => {
    if (selectedTahunAjaran) {
      loadSemester(selectedTahunAjaran)
    } else {
      setSemesterList([])
      setSelectedSemester(null)
    }
  }, [selectedTahunAjaran, loadSemester])

  // Load bulan saat semester berubah
  useEffect(() => {
    if (selectedTahunAjaran && selectedSemester) {
      loadBulan(selectedTahunAjaran, selectedSemester)
    } else {
      setBulanList([])
      setSelectedBulan('')
    }
  }, [selectedTahunAjaran, selectedSemester, loadBulan])

  // Load summary saat tahun ajaran atau semester berubah (TIDAK terpengaruh bulan)
  useEffect(() => {
    if (selectedTahunAjaran && selectedSemester) {
      loadSummary(selectedTahunAjaran, selectedSemester)
    }
  }, [selectedTahunAjaran, selectedSemester, loadSummary])

  // Load detail saat filter berubah (TERPENGARUH bulan)
  useEffect(() => {
    if (selectedTahunAjaran && selectedSemester) {
      loadDetail()
    }
  }, [selectedTahunAjaran, selectedSemester, selectedBulan, loadDetail])

  // Handlers
  const handleTahunAjaranChange = (tahunAjaranId) => {
    setSelectedTahunAjaran(tahunAjaranId || null)
    // Reset semester dan bulan
    setSelectedSemester(null)
    setSelectedBulan('')
  }

  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester || null)
    // Reset bulan
    setSelectedBulan('')
  }

  const handleBulanChange = (bulan) => {
    setSelectedBulan(bulan)
  }

  const handleRefresh = () => {
    loadDetail()
  }

  return {
    // State
    absensiData,
    summary,
    isLoading,
    tahunAjaranList,
    semesterList,
    bulanList,
    selectedTahunAjaran,
    selectedSemester,
    selectedBulan,

    // Handlers
    handleTahunAjaranChange,
    handleSemesterChange,
    handleBulanChange,
    handleRefresh,
    loadDetail, // Export method baru
  }
}
