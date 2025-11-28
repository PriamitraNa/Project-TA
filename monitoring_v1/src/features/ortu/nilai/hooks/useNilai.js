import { useState, useEffect } from 'react'
import NilaiService from '../../../../services/Ortu/nilai/NilaiService'
import { toast } from 'react-hot-toast'

export const useNilai = () => {
  // === State ===
  const [selectedTahun, setSelectedTahun] = useState('') // Tahun ajaran string (e.g., "2025/2026")
  const [selectedSemester, setSelectedSemester] = useState('') // Semester string ("Ganjil"/"Genap")
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState('') // ID untuk fetch nilai

  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([])
  const [semesterOptions, setSemesterOptions] = useState([])
  const [semesterData, setSemesterData] = useState([]) // Simpan data semester dengan tahun_ajaran_id

  const [nilaiData, setNilaiData] = useState([])

  const [isLoadingTahun, setIsLoadingTahun] = useState(false)
  const [isLoadingSemester, setIsLoadingSemester] = useState(false)
  const [isLoadingNilai, setIsLoadingNilai] = useState(false)

  // === Load Tahun Ajaran Options (API #1) ===
  useEffect(() => {
    const loadTahunAjaran = async () => {
      try {
        setIsLoadingTahun(true)

        // API #1: GET /api/ortu/nilai/tahun-ajaran
        // Response: [{ "tahun_ajaran": "2025/2026" }, { "tahun_ajaran": "2024/2025" }]
        const response = await NilaiService.getTahunAjaran()

        // Map tahun ajaran (sudah unique dari backend)
        const options = response.data.map((tahun) => ({
          value: tahun.tahun_ajaran, // Value adalah string tahun (e.g., "2025/2026")
          label: `T.A ${tahun.tahun_ajaran}`,
        }))
        setTahunAjaranOptions(options)

        // Auto-select first option
        if (options.length > 0) {
          setSelectedTahun(options[0].value)
        }
      } catch (error) {
        console.error('Error loading tahun ajaran:', error)
        if (error.response?.status === 401) {
          toast.error('Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua siswa', {
            id: 'ortu-nilai-tahun-error',
          })
        } else {
          toast.error('Gagal memuat data tahun ajaran', { id: 'ortu-nilai-tahun-error' })
        }
        setTahunAjaranOptions([])
      } finally {
        setIsLoadingTahun(false)
      }
    }

    loadTahunAjaran()
  }, [])

  // === Load Semester Options (API #2) ===
  useEffect(() => {
    const loadSemester = async () => {
      if (!selectedTahun) {
        setSemesterOptions([])
        setSemesterData([])
        setSelectedSemester('')
        setSelectedTahunAjaranId('')
        return
      }

      try {
        setIsLoadingSemester(true)

        // API #2: GET /api/ortu/nilai/semester?tahun_ajaran=2025/2026
        // Response: [{ "tahun_ajaran_id": 1, "semester": "Ganjil" }, { "tahun_ajaran_id": 2, "semester": "Genap" }]
        const response = await NilaiService.getSemester(selectedTahun)

        // Simpan data lengkap untuk mendapatkan tahun_ajaran_id nanti
        setSemesterData(response.data)

        // Map semester untuk dropdown
        const options = response.data.map((sem) => ({
          value: sem.semester, // "Ganjil" atau "Genap"
          label: `Semester ${sem.semester}`,
        }))
        setSemesterOptions(options)

        // Auto-select first option dan set tahun_ajaran_id
        if (options.length > 0 && response.data.length > 0) {
          setSelectedSemester(options[0].value)
          setSelectedTahunAjaranId(response.data[0].tahun_ajaran_id.toString())
        } else {
          setSelectedSemester('')
          setSelectedTahunAjaranId('')
        }
      } catch (error) {
        console.error('Error loading semester:', error)
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Parameter tidak valid', {
            id: 'ortu-nilai-semester-error',
          })
        } else if (error.response?.status === 401) {
          toast.error('Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua siswa', {
            id: 'ortu-nilai-semester-error',
          })
        } else {
          toast.error('Gagal memuat data semester', { id: 'ortu-nilai-semester-error' })
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

  // === Load Nilai Data (API #3) ===
  useEffect(() => {
    const loadNilaiData = async () => {
      if (!selectedTahunAjaranId || !selectedSemester) {
        setNilaiData([])
        return
      }

      try {
        setIsLoadingNilai(true)

        // API #3: GET /api/ortu/nilai?tahun_ajaran_id=1&semester=Ganjil
        const response = await NilaiService.getNilai(selectedTahunAjaranId, selectedSemester)

        // Map data untuk tabel (struktur sama dengan guru nilai)
        // Backend mengirim array langsung di response.data, bukan response.data.nilai
        const mappedData = response.data.map((item) => ({
          id: item.mapel_id,
          nama_mapel: item.nama_mapel,

          // Formatif LM1 - TP1-4
          lm1_tp1: item.lm1_tp1,
          lm1_tp2: item.lm1_tp2,
          lm1_tp3: item.lm1_tp3,
          lm1_tp4: item.lm1_tp4,

          // Formatif LM2 - TP1-4
          lm2_tp1: item.lm2_tp1,
          lm2_tp2: item.lm2_tp2,
          lm2_tp3: item.lm2_tp3,
          lm2_tp4: item.lm2_tp4,

          // Formatif LM3 - TP1-4
          lm3_tp1: item.lm3_tp1,
          lm3_tp2: item.lm3_tp2,
          lm3_tp3: item.lm3_tp3,
          lm3_tp4: item.lm3_tp4,

          // Formatif LM4 - TP1-4
          lm4_tp1: item.lm4_tp1,
          lm4_tp2: item.lm4_tp2,
          lm4_tp3: item.lm4_tp3,
          lm4_tp4: item.lm4_tp4,

          // Formatif LM5 - TP1-4
          lm5_tp1: item.lm5_tp1,
          lm5_tp2: item.lm5_tp2,
          lm5_tp3: item.lm5_tp3,
          lm5_tp4: item.lm5_tp4,

          // Sumatif LM (Ulangan)
          lm1_ulangan: item.lm1_ulangan,
          lm2_ulangan: item.lm2_ulangan,
          lm3_ulangan: item.lm3_ulangan,
          lm4_ulangan: item.lm4_ulangan,
          lm5_ulangan: item.lm5_ulangan,

          // UTS & UAS
          uts: item.uts,
          uas: item.uas,
        }))

        setNilaiData(mappedData)

        // Statistik dihapus karena cards sudah dihapus
        // Backend tidak perlu kirim statistik lagi
      } catch (error) {
        console.error('Error loading nilai data:', error)
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Parameter tidak valid', {
            id: 'ortu-nilai-data-error',
          })
        } else if (error.response?.status === 404) {
          toast.error('Nilai tidak ditemukan', { id: 'ortu-nilai-data-error' })
        } else {
          toast.error('Gagal memuat data nilai', { id: 'ortu-nilai-data-error' })
        }
        setNilaiData([])
      } finally {
        setIsLoadingNilai(false)
      }
    }

    loadNilaiData()
  }, [selectedTahunAjaranId, selectedSemester])

  return {
    selectedTahun,
    setSelectedTahun,
    selectedSemester,
    setSelectedSemester,
    tahunAjaranOptions,
    semesterOptions,
    nilaiData,
    isLoadingTahun,
    isLoadingSemester,
    isLoadingNilai,
  }
}
