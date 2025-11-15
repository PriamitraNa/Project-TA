import absensiModel from '../../models/ortu/absensiModel.js'

/**
 * Get daftar tahun ajaran yang relevan untuk orang tua
 * Menampilkan tahun ajaran aktif + tahun ajaran dimana siswa pernah absen
 */
export const getTahunAjaranService = async (siswaId) => {
  try {
    // Validation
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }

    // Get tahun ajaran dari model
    const tahunAjaranList = await absensiModel.getTahunAjaranBySiswa(siswaId)

    if (!tahunAjaranList || tahunAjaranList.length === 0) {
      return []
    }

    // Format response
    const formattedData = tahunAjaranList.map((item) => ({
      id: item.id,
      tahun: item.tahun,
      semester: item.semester,
      status: item.status,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
    }))

    return formattedData
  } catch (error) {
    console.error('Error in getTahunAjaranService:', error)
    throw error
  }
}

/**
 * Get daftar semester berdasarkan tahun ajaran yang dipilih
 * Menampilkan semester dengan info status aktif dan has_data (punya riwayat absensi)
 */
export const getSemesterService = async (siswaId, tahunAjaranId) => {
  try {
    // Validation
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }
    if (!tahunAjaranId) {
      throw new Error('Tahun ajaran ID tidak ditemukan')
    }

    // Get semester list dari model
    const semesterList = await absensiModel.getSemesterByTahunAjaran(siswaId, tahunAjaranId)

    if (!semesterList || semesterList.length === 0) {
      return []
    }

    // Get tanggal sekarang untuk menentukan semester aktif
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Format response
    const formattedData = semesterList.map((item) => {
      // Cek apakah semester aktif (tanggal sekarang dalam range)
      const isAktif =
        today >= item.tanggal_mulai && today <= item.tanggal_selesai ? 'aktif' : 'tidak-aktif'

      // Nama semester berdasarkan enum
      const namaSemester = item.semester === 'Ganjil' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)'
      const valueSemester = item.semester === 'Ganjil' ? '1' : '2'

      return {
        id: item.id,
        nama: namaSemester,
        value: valueSemester,
        status: isAktif,
        tanggal_mulai: item.tanggal_mulai,
        tanggal_selesai: item.tanggal_selesai,
        has_data: item.has_data > 0, // Convert count to boolean
      }
    })

    return formattedData
  } catch (error) {
    console.error('Error in getSemesterService:', error)
    throw error
  }
}

/**
 * Get daftar bulan berdasarkan semester yang dipilih
 * Generate list bulan dalam rentang semester dan cek has_data per bulan
 */
export const getBulanService = async (siswaId, tahunAjaranId, semester) => {
  try {
    // Validation
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }
    if (!tahunAjaranId) {
      throw new Error('Tahun ajaran ID tidak ditemukan')
    }
    if (!semester) {
      throw new Error('Semester tidak ditemukan')
    }

    // Get info semester dari database
    const semesterInfo = await absensiModel.getSemesterInfo(tahunAjaranId, semester)

    if (!semesterInfo) {
      return null
    }

    // Parse tanggal mulai dan selesai
    const tanggalMulai = new Date(semesterInfo.tanggal_mulai)
    const tanggalSelesai = new Date(semesterInfo.tanggal_selesai)

    // Generate list bulan dalam rentang
    const bulanList = []
    const currentDate = new Date(tanggalMulai)

    // Nama bulan dalam Bahasa Indonesia
    const namaBulan = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]

    // Loop untuk setiap bulan dalam rentang
    while (
      currentDate.getFullYear() < tanggalSelesai.getFullYear() ||
      (currentDate.getFullYear() === tanggalSelesai.getFullYear() &&
        currentDate.getMonth() <= tanggalSelesai.getMonth())
    ) {
      const tahun = currentDate.getFullYear()
      const bulan = currentDate.getMonth() + 1 // 1-12
      const bulanStr = bulan.toString().padStart(2, '0') // 01-12

      // Hitung jumlah hari di bulan ini dalam rentang semester
      const firstDayOfMonth = new Date(tahun, bulan - 1, 1)
      const lastDayOfMonth = new Date(tahun, bulan, 0)

      // Tentukan tanggal awal dan akhir yang valid dalam semester
      const startDate = firstDayOfMonth < tanggalMulai ? tanggalMulai : firstDayOfMonth
      const endDate = lastDayOfMonth > tanggalSelesai ? tanggalSelesai : lastDayOfMonth

      // Hitung jumlah hari dengan benar
      const diffTime = Math.abs(endDate - startDate)
      const jumlahHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

      // Cek apakah siswa punya data absensi di bulan ini
      const hasData = await absensiModel.checkAbsensiByMonth(siswaId, tahun, bulan)

      bulanList.push({
        value: bulanStr,
        label: `${namaBulan[bulan - 1]} ${tahun}`,
        tahun: tahun,
        has_data: hasData > 0,
        jumlah_hari: jumlahHari,
      })

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Format response
    return {
      semester_info: {
        semester: semester,
        nama: semester === '1' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)',
        tanggal_mulai: semesterInfo.tanggal_mulai,
        tanggal_selesai: semesterInfo.tanggal_selesai,
      },
      bulan: bulanList,
    }
  } catch (error) {
    console.error('Error in getBulanService:', error)
    throw error
  }
}

/**
 * Get summary kehadiran untuk cards
 * Hitung total per status untuk SELURUH semester (tidak terpengaruh filter bulan)
 */
export const getSummaryService = async (siswaId, tahunAjaranId, semester) => {
  try {
    // Validation
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }
    if (!tahunAjaranId) {
      throw new Error('Tahun ajaran ID tidak ditemukan')
    }
    if (!semester) {
      throw new Error('Semester tidak ditemukan')
    }

    // Get info semester dari database
    const semesterInfo = await absensiModel.getSemesterInfo(tahunAjaranId, semester)

    if (!semesterInfo) {
      return null
    }

    // Get summary absensi dari model
    const summaryData = await absensiModel.getAbsensiSummaryBySemester(
      siswaId,
      semesterInfo.tanggal_mulai,
      semesterInfo.tanggal_selesai
    )

    // Format response
    const summary = {
      total_hadir: summaryData.total_hadir || 0,
      total_sakit: summaryData.total_sakit || 0,
      total_izin: summaryData.total_izin || 0,
      total_alpha: summaryData.total_alpha || 0,
      total_hari: summaryData.total_hari || 0,
      persentase_hadir:
        summaryData.total_hari > 0
          ? parseFloat(((summaryData.total_hadir / summaryData.total_hari) * 100).toFixed(2))
          : 0,
    }

    // Get tahun ajaran info untuk response
    const tahunAjaranInfo = await absensiModel.getTahunAjaranInfo(tahunAjaranId)

    return {
      summary: summary,
      periode: {
        tahun_ajaran: tahunAjaranInfo ? tahunAjaranInfo.tahun : '-',
        semester: semester === '1' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)',
        tanggal_mulai: semesterInfo.tanggal_mulai,
        tanggal_selesai: semesterInfo.tanggal_selesai,
      },
    }
  } catch (error) {
    console.error('Error in getSummaryService:', error)
    throw error
  }
}

/**
 * Get detail absensi untuk tabel
 * Filter: tahun_ajaran_id, semester, bulan (optional)
 * Jika bulan tidak diisi → tampilkan semua data di semester
 * Jika bulan diisi → filter data per bulan tersebut
 */
export const getDetailService = async (siswaId, tahunAjaranId, semester, bulan = null) => {
  try {
    // Validation
    if (!siswaId || !tahunAjaranId || !semester) {
      throw new Error('Parameter tidak lengkap')
    }

    // Get semester info (dates)
    const semesterInfo = await absensiModel.getSemesterInfo(tahunAjaranId, semester)

    if (!semesterInfo) {
      return null
    }

    // Get detail absensi from model
    const absensiList = await absensiModel.getDetailAbsensi(
      siswaId,
      semesterInfo.tanggal_mulai,
      semesterInfo.tanggal_selesai,
      bulan
    )

    if (!absensiList || absensiList.length === 0) {
      return null
    }

    // Array nama hari dalam Bahasa Indonesia
    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

    // Format response
    const formattedData = absensiList.map((item) => {
      const tanggalObj = new Date(item.tanggal)
      const hariIndex = tanggalObj.getDay()

      return {
        id: item.id,
        tanggal: item.tanggal,
        hari: namaHari[hariIndex],
        status: item.status,
        guru_id: item.guru_id,
        guru_nama: item.guru_nama,
        kelas_id: item.kelas_id,
        kelas_nama: item.kelas_nama,
      }
    })

    // Get tahun ajaran info untuk meta
    const tahunAjaranInfo = await absensiModel.getTahunAjaranInfo(tahunAjaranId)

    // Determine bulan label for meta
    let bulanLabel = 'Semua Bulan'
    if (bulan) {
      const namaBulan = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ]
      const bulanIndex = parseInt(bulan) - 1
      const tahunBulan =
        formattedData.length > 0
          ? new Date(formattedData[0].tanggal).getFullYear()
          : new Date().getFullYear()
      bulanLabel = `${namaBulan[bulanIndex]} ${tahunBulan}`
    }

    return {
      absensi: formattedData,
      meta: {
        total: formattedData.length,
        periode: {
          tahun_ajaran: tahunAjaranInfo ? tahunAjaranInfo.tahun : '-',
          semester: semester === '1' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)',
          bulan: bulanLabel,
        },
      },
    }
  } catch (error) {
    console.error('Error in getDetailService:', error)
    throw error
  }
}

export default {
  getTahunAjaranService,
  getSemesterService,
  getBulanService,
  getSummaryService,
  getDetailService,
}
