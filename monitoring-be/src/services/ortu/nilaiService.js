import nilaiModel from '../../models/ortu/nilaiModel.js'

/**
 * Get daftar tahun ajaran yang pernah diikuti siswa
 * Return UNIQUE tahun saja (misal: ['2025/2026', '2024/2025'])
 */
export const getTahunAjaranService = async (siswaId) => {
  try {
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }

    const tahunAjaranList = await nilaiModel.getTahunAjaranBySiswa(siswaId)

    if (!tahunAjaranList || tahunAjaranList.length === 0) {
      return []
    }

    // Format response - hanya tahun ajaran string
    const formattedData = tahunAjaranList.map((item) => ({
      tahun_ajaran: item.tahun_ajaran,
    }))

    return formattedData
  } catch (error) {
    console.error('Error in getTahunAjaranService:', error)
    throw error
  }
}

/**
 * Get daftar semester berdasarkan tahun ajaran untuk siswa
 * Semester yang pernah diikuti siswa di tahun ajaran tertentu
 * Order by ASC (Ganjil dulu, baru Genap)
 * Return semester beserta tahun_ajaran_id untuk fetch nilai
 */
export const getSemesterService = async (siswaId, tahunAjaran) => {
  try {
    // Validation
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }

    if (!tahunAjaran) {
      throw new Error('Tahun ajaran tidak valid')
    }

    // Get semester dari model
    const semesterList = await nilaiModel.getSemesterBySiswaAndTahun(siswaId, tahunAjaran)

    if (!semesterList || semesterList.length === 0) {
      return []
    }

    // Format response - semester + tahun_ajaran_id
    const formattedData = semesterList.map((item) => ({
      tahun_ajaran_id: item.tahun_ajaran_id,
      semester: item.semester,
    }))

    return formattedData
  } catch (error) {
    console.error('Error in getSemesterService:', error)
    throw error
  }
}

/**
 * Get nilai detail siswa
 * Mengambil SEMUA mapel di kelas siswa, terlepas sudah ada nilai atau belum
 * Jika belum ada nilai, field nilai akan null
 * Hanya menampilkan data nilai, tanpa statistik
 */
export const getNilaiDetailService = async (siswaId, tahunAjaranId, semester) => {
  try {
    // Validation
    if (!siswaId) {
      throw new Error('Siswa ID tidak ditemukan')
    }

    if (!tahunAjaranId || isNaN(tahunAjaranId)) {
      throw new Error('Tahun ajaran ID tidak valid')
    }

    if (!semester || (semester !== 'Ganjil' && semester !== 'Genap')) {
      throw new Error('Semester harus "Ganjil" atau "Genap"')
    }

    // Get SEMUA mapel di kelas (dengan nilai jika ada, atau null jika belum ada nilai)
    const mapelList = await nilaiModel.getAllMapelByKelas(siswaId, tahunAjaranId, semester)

    if (!mapelList || mapelList.length === 0) {
      return []
    }

    // Format response - use stored nilai_akhir from database
    const formattedNilai = mapelList.map((item) => {
      return {
        mapel_id: item.mapel_id,
        nama_mapel: item.nama_mapel,
        lm1_tp1: item.lm1_tp1,
        lm1_tp2: item.lm1_tp2,
        lm1_tp3: item.lm1_tp3,
        lm1_tp4: item.lm1_tp4,
        lm2_tp1: item.lm2_tp1,
        lm2_tp2: item.lm2_tp2,
        lm2_tp3: item.lm2_tp3,
        lm2_tp4: item.lm2_tp4,
        lm3_tp1: item.lm3_tp1,
        lm3_tp2: item.lm3_tp2,
        lm3_tp3: item.lm3_tp3,
        lm3_tp4: item.lm3_tp4,
        lm4_tp1: item.lm4_tp1,
        lm4_tp2: item.lm4_tp2,
        lm4_tp3: item.lm4_tp3,
        lm4_tp4: item.lm4_tp4,
        lm5_tp1: item.lm5_tp1,
        lm5_tp2: item.lm5_tp2,
        lm5_tp3: item.lm5_tp3,
        lm5_tp4: item.lm5_tp4,
        lm1_ulangan: item.lm1_ulangan,
        lm2_ulangan: item.lm2_ulangan,
        lm3_ulangan: item.lm3_ulangan,
        lm4_ulangan: item.lm4_ulangan,
        lm5_ulangan: item.lm5_ulangan,
        uts: item.uts,
        uas: item.uas,
        nilai_akhir: item.nilai_akhir, // ← Use stored nilai_akhir from DB
      }
    })

    return formattedNilai
  } catch (error) {
    console.error('Error in getNilaiDetailService:', error)
    throw error
  }
}

export default {
  getTahunAjaranService,
  getSemesterService,
  getNilaiDetailService,
}
