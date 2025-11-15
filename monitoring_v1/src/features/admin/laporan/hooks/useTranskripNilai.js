import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { LaporanService } from '../../../../services/Admin/laporan/LaporanService'

// ==================== MOCK DATA ====================
const MOCK_SISWA_OPTIONS = [
  { siswa_id: 1, nama: 'Ahmad Fauzi', nisn: '1234567890', kelas: '5A' },
  { siswa_id: 2, nama: 'Budi Santoso', nisn: '0987654321', kelas: '4B' },
  { siswa_id: 3, nama: 'Citra Lestari', nisn: '1122334455', kelas: '5A' },
  { siswa_id: 4, nama: 'Dewi Pratiwi', nisn: '5544332211', kelas: '6A' },
  { siswa_id: 5, nama: 'Eko Saputra', nisn: '9988776655', kelas: '4A' },
]

const MOCK_TRANSKRIP_DATA = {
  1: {
    siswa: {
      siswa_id: 1,
      nama: 'Ahmad Fauzi',
      nisn: '1234567890',
      kelas: '5A',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '15/05/2015',
      nama_ortu: 'Bapak Fauzi bin Ahmad',
    },
    riwayat_nilai: [
      {
        id: 'ta3-ganjil',
        tahun_ajaran: '2025/2026',
        semester: 'Ganjil',
        absensi: {
          hadir: 58,
          sakit: 1,
          izin: 0,
          alpha: 0,
        },
        nilai: [
          {
            mapel_id: 1,
            nama_mapel: 'Matematika',
            tugas_1: 85,
            tugas_2: 90,
            uts: 88,
            uas: 87,
            nilai_akhir: 87.5,
            grade: 'B+',
          },
          {
            mapel_id: 2,
            nama_mapel: 'Bahasa Indonesia',
            tugas_1: 80,
            tugas_2: 85,
            uts: 82,
            uas: 88,
            nilai_akhir: 83.75,
            grade: 'B',
          },
          {
            mapel_id: 3,
            nama_mapel: 'IPA',
            tugas_1: 90,
            tugas_2: 92,
            uts: 91,
            uas: 95,
            nilai_akhir: 92,
            grade: 'A',
          },
          {
            mapel_id: 4,
            nama_mapel: 'IPS',
            tugas_1: 88,
            tugas_2: 86,
            uts: 90,
            uas: 89,
            nilai_akhir: 88.25,
            grade: 'B+',
          },
          {
            mapel_id: 5,
            nama_mapel: 'Bahasa Inggris',
            tugas_1: 85,
            tugas_2: 87,
            uts: 86,
            uas: 88,
            nilai_akhir: 86.5,
            grade: 'B+',
          },
        ],
      },
      {
        id: 'ta2-genap',
        tahun_ajaran: '2024/2025',
        semester: 'Genap',
        absensi: {
          hadir: 55,
          sakit: 2,
          izin: 1,
          alpha: 0,
        },
        nilai: [
          {
            mapel_id: 1,
            nama_mapel: 'Matematika',
            tugas_1: 82,
            tugas_2: 88,
            uts: 85,
            uas: 86,
            nilai_akhir: 85.25,
            grade: 'B',
          },
          {
            mapel_id: 2,
            nama_mapel: 'Bahasa Indonesia',
            tugas_1: 78,
            tugas_2: 80,
            uts: 80,
            uas: 82,
            nilai_akhir: 80,
            grade: 'B-',
          },
          {
            mapel_id: 3,
            nama_mapel: 'IPA',
            tugas_1: 88,
            tugas_2: 90,
            uts: 89,
            uas: 91,
            nilai_akhir: 89.5,
            grade: 'B+',
          },
          {
            mapel_id: 4,
            nama_mapel: 'IPS',
            tugas_1: 85,
            tugas_2: 83,
            uts: 87,
            uas: 86,
            nilai_akhir: 85.25,
            grade: 'B',
          },
        ],
      },
      {
        id: 'ta2-ganjil',
        tahun_ajaran: '2024/2025',
        semester: 'Ganjil',
        absensi: {
          hadir: 52,
          sakit: 3,
          izin: 2,
          alpha: 1,
        },
        nilai: [
          {
            mapel_id: 1,
            nama_mapel: 'Matematika',
            tugas_1: 75,
            tugas_2: 80,
            uts: 78,
            uas: 80,
            nilai_akhir: 78.25,
            grade: 'C+',
          },
          {
            mapel_id: 2,
            nama_mapel: 'Bahasa Indonesia',
            tugas_1: 70,
            tugas_2: 75,
            uts: 72,
            uas: 74,
            nilai_akhir: 72.75,
            grade: 'C',
          },
          {
            mapel_id: 3,
            nama_mapel: 'IPA',
            tugas_1: 80,
            tugas_2: 85,
            uts: 82,
            uas: 83,
            nilai_akhir: 82.5,
            grade: 'B',
          },
        ],
      },
    ],
  },
  2: {
    siswa: {
      siswa_id: 2,
      nama: 'Budi Santoso',
      nisn: '0987654321',
      kelas: '4B',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '20/08/2016',
      nama_ortu: 'Ibu Santoso',
    },
    riwayat_nilai: [
      {
        id: 'ta3-ganjil',
        tahun_ajaran: '2025/2026',
        semester: 'Ganjil',
        absensi: {
          hadir: 56,
          sakit: 2,
          izin: 1,
          alpha: 0,
        },
        nilai: [
          {
            mapel_id: 1,
            nama_mapel: 'Matematika',
            tugas_1: 75,
            tugas_2: 80,
            uts: 78,
            uas: 77,
            nilai_akhir: 77.5,
            grade: 'C+',
          },
          {
            mapel_id: 2,
            nama_mapel: 'Bahasa Indonesia',
            tugas_1: 85,
            tugas_2: 88,
            uts: 82,
            uas: 90,
            nilai_akhir: 86.25,
            grade: 'B+',
          },
          {
            mapel_id: 3,
            nama_mapel: 'IPA',
            tugas_1: 80,
            tugas_2: 82,
            uts: 81,
            uas: 83,
            nilai_akhir: 81.5,
            grade: 'B',
          },
        ],
      },
    ],
  },
  3: {
    siswa: {
      siswa_id: 3,
      nama: 'Citra Lestari',
      nisn: '1122334455',
      kelas: '5A',
      tempat_lahir: 'Surabaya',
      tanggal_lahir: '10/03/2015',
      nama_ortu: 'Bapak Lestari',
    },
    riwayat_nilai: [],
  },
}

export function useTranskripNilai() {
  // ==================== STATE MANAGEMENT ====================
  const [selectedSiswa, setSelectedSiswa] = useState('')
  const [siswaOptions, setSiswaOptions] = useState([])
  const [transkripData, setTranskripData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(true)

  // ==================== FETCH SISWA OPTIONS ====================
  useEffect(() => {
    const fetchSiswaOptions = async () => {
      setIsLoadingSiswa(true)
      try {
        const response = await LaporanService.getSiswaList()

        if (response.status === 'success') {
          // Transform API response to match component format
          const transformedData = response.data.map((siswa) => ({
            siswa_id: siswa.siswa_id,
            nama: siswa.nama_lengkap,
            nisn: siswa.nisn,
            kelas: siswa.kelas,
            tahun_ajaran: siswa.tahun_ajaran,
            semester: siswa.semester,
            jumlah_mapel_dinilai: siswa.jumlah_mapel_dinilai,
          }))

          setSiswaOptions(transformedData)
        } else {
          toast.error(response.message || 'Gagal memuat daftar siswa')
          setSiswaOptions([])
        }
      } catch (error) {
        console.error('Error fetching siswa:', error)

        if (error.response?.data?.message) {
          toast.error(error.response.data.message)
        } else {
          toast.error('Gagal memuat daftar siswa')
        }

        setSiswaOptions([])
      } finally {
        setIsLoadingSiswa(false)
      }
    }

    fetchSiswaOptions()
  }, [])

  // ==================== FETCH TRANSKRIP DATA ====================
  useEffect(() => {
    if (!selectedSiswa) {
      setTranskripData(null)
      return
    }

    const fetchTranskripData = async () => {
      setIsLoading(true)
      try {
        const response = await LaporanService.getTranskripNilai(selectedSiswa)

        if (response.success) {
          setTranskripData(response.data)

          if (!response.data || response.data.riwayat_nilai.length === 0) {
            toast.info('Tidak ada riwayat nilai untuk siswa ini')
          }
        } else {
          toast.error(response.message || 'Gagal memuat transkrip nilai')
          setTranskripData(null)
        }
      } catch (error) {
        console.error('Error fetching transkrip:', error)

        if (error.response?.data?.message) {
          toast.error(error.response.data.message)
        } else {
          toast.error('Gagal memuat transkrip nilai')
        }

        setTranskripData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranskripData()
  }, [selectedSiswa])

  // ==================== HANDLE DOWNLOAD PDF ====================
  const handleDownloadPDF = async () => {
    if (!transkripData) {
      toast.error('Tidak ada data untuk diunduh')
      return
    }

    try {
      toast.loading('Membuat PDF...', { id: 'pdf-loading' })

      const response = await LaporanService.downloadTranskripPDF(selectedSiswa)

      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      // Extract filename from Content-Disposition header or create default
      let filename = `Transkrip_${transkripData.siswa.nama}_${transkripData.siswa.nisn}.pdf`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }

      // Create download link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('PDF berhasil diunduh!', { id: 'pdf-loading' })
    } catch (error) {
      console.error('Error downloading PDF:', error)

      if (error.response?.data) {
        // If error response is JSON
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result)
            toast.error(errorData.message || 'Gagal mengunduh PDF', { id: 'pdf-loading' })
          } catch {
            toast.error('Gagal mengunduh PDF', { id: 'pdf-loading' })
          }
        }
        reader.readAsText(error.response.data)
      } else {
        toast.error('Gagal mengunduh PDF', { id: 'pdf-loading' })
      }
    }
  }

  // ==================== COMPUTED VALUES ====================
  const canDownloadPDF = selectedSiswa && transkripData && transkripData.riwayat_nilai.length > 0

  return {
    // State
    selectedSiswa,
    setSelectedSiswa,
    siswaOptions,
    transkripData,
    isLoading,
    isLoadingSiswa,

    // Actions
    handleDownloadPDF,
    canDownloadPDF,
  }
}
