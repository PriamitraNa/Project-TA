import * as laporanModel from '../../models/ortu/laporanModel.js'
import PDFDocument from 'pdfkit'

/**
 * Helper function untuk menghitung nilai_akhir dari satu mapel
 * Formula: (Rata Formatif × 40%) + (Rata Sumatif LM × 20%) + (UTS × 20%) + (UAS × 20%)
 *
 * Bobot (Kebijakan Sekolah):
 * - Formatif (LM1-5 TP1-4):  40%
 * - Sumatif Lingkup Materi:  20%
 * - Ujian Tengah Semester:   20%
 * - Ujian Akhir Semester:    20%
 */
const calculateNilaiAkhir = (row) => {
  // Collect all nilai components
  const komponenFormatif = [
    row.lm1_tp1,
    row.lm1_tp2,
    row.lm1_tp3,
    row.lm1_tp4,
    row.lm2_tp1,
    row.lm2_tp2,
    row.lm2_tp3,
    row.lm2_tp4,
    row.lm3_tp1,
    row.lm3_tp2,
    row.lm3_tp3,
    row.lm3_tp4,
    row.lm4_tp1,
    row.lm4_tp2,
    row.lm4_tp3,
    row.lm4_tp4,
    row.lm5_tp1,
    row.lm5_tp2,
    row.lm5_tp3,
    row.lm5_tp4,
  ].filter((val) => val !== null && val !== undefined)

  const komponenSumatif = [
    row.lm1_ulangan,
    row.lm2_ulangan,
    row.lm3_ulangan,
    row.lm4_ulangan,
    row.lm5_ulangan,
  ].filter((val) => val !== null && val !== undefined)

  // Calculate averages
  const avgFormatif =
    komponenFormatif.length > 0
      ? komponenFormatif.reduce((a, b) => a + b, 0) / komponenFormatif.length
      : 0

  const avgSumatif =
    komponenSumatif.length > 0
      ? komponenSumatif.reduce((a, b) => a + b, 0) / komponenSumatif.length
      : 0

  const uts = row.uts || 0
  const uas = row.uas || 0

  // Jika tidak ada nilai sama sekali, return 0
  if (komponenFormatif.length === 0 && komponenSumatif.length === 0 && uts === 0 && uas === 0) {
    return 0
  }

  // Formula: (Formatif 40% + Sumatif 20% + UTS 20% + UAS 20%)
  const nilaiAkhir = avgFormatif * 0.4 + avgSumatif * 0.2 + uts * 0.2 + uas * 0.2

  return Math.round(nilaiAkhir * 100) / 100 // Round to 2 decimal places
}

/**
 * Get list tahun ajaran untuk dropdown (hanya yang ada data nilai siswa)
 */
export const getTahunAjaranService = async (siswaId) => {
  try {
    const tahunAjaranList = await laporanModel.getTahunAjaranListBySiswa(siswaId)

    return tahunAjaranList.map((ta) => ({
      id: ta.id,
      tahun_ajaran: ta.tahun_ajaran,
      label: ta.label,
      is_active: ta.is_active === 1 || ta.is_active === true,
    }))
  } catch (error) {
    console.error('Error in getTahunAjaranService:', error)
    throw error
  }
}

/**
 * Get list semester untuk dropdown (hanya yang ada data nilai)
 */
export const getSemesterService = async (siswaId, tahunAjaranId) => {
  try {
    // Validation
    if (!siswaId) {
      throw new Error('Data siswa tidak ditemukan dalam token')
    }

    if (!tahunAjaranId) {
      throw new Error('Tahun ajaran wajib dipilih')
    }

    const semesterList = await laporanModel.getSemesterListBySiswa(siswaId, tahunAjaranId)

    // Map dan konversi Ganjil/Genap ke format 1/2 untuk frontend
    return semesterList.map((sem) => {
      // Konversi Ganjil -> 1, Genap -> 2 untuk value
      let semesterValue = sem.semester
      if (sem.semester === 'Ganjil') {
        semesterValue = '1'
      } else if (sem.semester === 'Genap') {
        semesterValue = '2'
      }

      return {
        semester: semesterValue, // '1' atau '2' untuk frontend
        label: sem.label, // "Semester 1 (Ganjil)" atau "Semester 2 (Genap)"
      }
    })
  } catch (error) {
    console.error('Error in getSemesterService:', error)
    throw error
  }
}

/**
 * Get nilai laporan dengan validasi siswa_id ketat
 */
export const getNilaiLaporanService = async (siswaId, tahunAjaranId, semester) => {
  try {
    // Validation 1: siswa_id wajib ada (dari JWT token)
    if (!siswaId) {
      throw new Error('Data siswa tidak ditemukan dalam token')
    }

    // Validation 2: tahun_ajaran_id wajib
    if (!tahunAjaranId) {
      throw new Error('Tahun ajaran wajib dipilih')
    }

    // Validation 3: semester wajib dan valid (support '1'/'2' atau 'Ganjil'/'Genap')
    if (!semester) {
      throw new Error('Semester wajib diisi')
    }

    // Normalize semester: convert 1/2 to Ganjil/Genap or keep as is
    let normalizedSemester = semester
    if (semester === '1' || semester === 1) {
      normalizedSemester = 'Ganjil'
    } else if (semester === '2' || semester === 2) {
      normalizedSemester = 'Genap'
    } else if (semester !== 'Ganjil' && semester !== 'Genap') {
      throw new Error('Semester harus 1 atau 2 (atau Ganjil/Genap)')
    }

    // Get nilai data
    const nilaiData = await laporanModel.getNilaiBySiswaId(
      siswaId,
      tahunAjaranId,
      normalizedSemester
    )

    // Check if data found
    if (!nilaiData || nilaiData.length === 0) {
      throw new Error('Data nilai tidak ditemukan untuk siswa ini')
    }

    // Extract siswa info (dari row pertama)
    const siswaInfo = {
      siswa_id: nilaiData[0].siswa_id,
      siswa_nama: nilaiData[0].siswa_nama,
      nisn: nilaiData[0].nisn,
      kelas_nama: nilaiData[0].kelas_nama,
      tahun_ajaran: nilaiData[0].tahun_ajaran,
      semester: nilaiData[0].semester,
    }

    // Format nilai array - Show ALL mapel (even if nilai is empty)
    const nilaiArray = nilaiData.map((row) => {
      // Calculate nilai_akhir (will be 0 if no grades)
      const nilaiAkhir = calculateNilaiAkhir(row)
      return {
        nilai_id: row.nilai_id, // Might be null if no grades
        nama_mapel: row.nama_mapel,
        nilai_akhir: nilaiAkhir, // 0 if no grades
        guru_nama: row.guru_nama,
      }
    })

    // Calculate statistik only from mapel that have grades (nilai_akhir > 0)
    const nilaiAkhirValues = nilaiArray.map((n) => n.nilai_akhir).filter((v) => v > 0)

    const calculatedStatistik = {
      total_mapel: nilaiArray.length, // All mapel in class
      mapel_dengan_nilai: nilaiAkhirValues.length, // Only mapel with grades
      rata_rata:
        nilaiAkhirValues.length > 0
          ? (nilaiAkhirValues.reduce((a, b) => a + b, 0) / nilaiAkhirValues.length).toFixed(2)
          : '0.00',
      nilai_tertinggi: nilaiAkhirValues.length > 0 ? Math.max(...nilaiAkhirValues) : 0,
      nilai_terendah: nilaiAkhirValues.length > 0 ? Math.min(...nilaiAkhirValues) : 0,
      tuntas: nilaiAkhirValues.filter((v) => v >= 75).length,
      belum_tuntas: nilaiAkhirValues.filter((v) => v < 75).length,
    }

    return {
      siswa: siswaInfo,
      nilai: nilaiArray,
      statistik: calculatedStatistik,
    }
  } catch (error) {
    console.error('Error in getNilaiLaporanService:', error)
    throw error
  }
}

/**
 * Generate PDF laporan nilai untuk ortu
 */
export const generatePDFLaporanService = async (siswaId, tahunAjaranId, semester) => {
  try {
    // Reuse logic from getNilaiLaporanService to get data
    const laporanData = await getNilaiLaporanService(siswaId, tahunAjaranId, semester)

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'portrait',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    })

    // School info
    const schoolName = 'SDN 1 Langensari'
    const schoolAddress =
      'Jl. Cipanas, Kp. Korobokan, Cimanganten, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44151'

    // Logo path
    const logoPath = 'assets/logo-sekolah.png'

    // Header with logo
    const headerY = 50
    const pageWidth = 595 // A4 portrait width in points

    // Logo (left side)
    try {
      doc.image(logoPath, 50, headerY, { width: 60, height: 60 })
    } catch (err) {
      console.warn('Logo not found, skipping logo:', err.message)
    }

    // School name (center, offset for logo)
    doc.fontSize(16).font('Times-Bold')
    doc.text(schoolName, 120, headerY + 10, { align: 'center', width: pageWidth - 170 })

    // School address (center, below name)
    doc.fontSize(8).font('Times-Roman')
    doc.text(schoolAddress, 120, headerY + 32, { align: 'center', width: pageWidth - 170 })

    doc.moveDown(1.5)

    // Horizontal line below header
    doc.moveDown(0.5)
    const titleLineY = doc.y
    doc
      .moveTo(50, titleLineY)
      .lineTo(pageWidth - 50, titleLineY)
      .stroke()

    doc.moveDown(2)

    // Title
    doc.fontSize(14).font('Times-Bold')
    doc.text('LAPORAN NILAI SISWA', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(10).font('Times-Roman')
    doc.text(`${laporanData.siswa.tahun_ajaran} - Semester ${laporanData.siswa.semester}`, {
      align: 'center',
    })

    doc.moveDown(1)

    // Student info (left aligned, stacked, rapi dengan tab)
    const infoY = doc.y
    const labelWidth = 110 // Fixed width untuk label

    doc.fontSize(10).font('Times-Roman')
    doc.text('Nama Siswa', 50, infoY)
    doc.text(': ' + laporanData.siswa.siswa_nama, 50 + labelWidth, infoY)

    doc.text('NISN', 50, infoY + 15)
    doc.text(': ' + laporanData.siswa.nisn, 50 + labelWidth, infoY + 15)

    doc.text('Kelas', 50, infoY + 30)
    doc.text(': ' + laporanData.siswa.kelas_nama, 50 + labelWidth, infoY + 30)

    doc.moveDown(3)

    // Table header
    const tableTop = doc.y
    const rowHeight = 22
    const headerHeight = 22
    const colWidths = {
      no: 30,
      mapel: 200,
      nilaiAkhir: 80,
      guru: 150,
    }

    let xPos = 50

    // Calculate total table width
    const totalWidth = colWidths.no + colWidths.mapel + colWidths.nilaiAkhir + colWidths.guru

    // Draw table header with gray background
    doc.fontSize(8).font('Times-Bold')

    // Header background
    doc.fillColor('#E8E8E8')
    doc.rect(xPos, tableTop, totalWidth, headerHeight).fill()
    doc.fillColor('#000000')

    // No
    doc.rect(xPos, tableTop, colWidths.no, headerHeight).stroke()
    doc.text('No', xPos + 5, tableTop + 8, { width: colWidths.no - 10, align: 'center' })
    xPos += colWidths.no

    // Mata Pelajaran
    doc.rect(xPos, tableTop, colWidths.mapel, headerHeight).stroke()
    doc.text('Mata Pelajaran', xPos + 5, tableTop + 8, {
      width: colWidths.mapel - 10,
      align: 'center',
    })
    xPos += colWidths.mapel

    // Nilai Akhir
    doc.rect(xPos, tableTop, colWidths.nilaiAkhir, headerHeight).stroke()
    doc.text('Nilai Akhir', xPos + 5, tableTop + 8, {
      width: colWidths.nilaiAkhir - 10,
      align: 'center',
    })
    xPos += colWidths.nilaiAkhir

    // Guru
    doc.rect(xPos, tableTop, colWidths.guru, headerHeight).stroke()
    doc.text('Guru', xPos + 5, tableTop + 8, { width: colWidths.guru - 10, align: 'center' })

    // Draw table rows
    doc.font('Times-Roman')
    doc.fontSize(8)
    let yPos = tableTop + headerHeight

    laporanData.nilai.forEach((nilai, index) => {
      // Check if need new page
      if (yPos > 720) {
        doc.addPage()
        yPos = 50
      }

      xPos = 50

      // No
      doc.rect(xPos, yPos, colWidths.no, rowHeight).stroke()
      doc.text((index + 1).toString(), xPos + 5, yPos + 8, {
        width: colWidths.no - 10,
        align: 'center',
      })
      xPos += colWidths.no

      // Mata Pelajaran
      doc.rect(xPos, yPos, colWidths.mapel, rowHeight).stroke()
      doc.text(nilai.nama_mapel || '-', xPos + 5, yPos + 8, { width: colWidths.mapel - 10 })
      xPos += colWidths.mapel

      // Nilai Akhir
      doc.rect(xPos, yPos, colWidths.nilaiAkhir, rowHeight).stroke()
      doc.text(
        nilai.nilai_akhir !== null ? nilai.nilai_akhir.toString() : '-',
        xPos + 5,
        yPos + 8,
        {
          width: colWidths.nilaiAkhir - 10,
          align: 'center',
        }
      )
      xPos += colWidths.nilaiAkhir

      // Guru
      doc.rect(xPos, yPos, colWidths.guru, rowHeight).stroke()
      doc.text(nilai.guru_nama || '-', xPos + 5, yPos + 8, {
        width: colWidths.guru - 10,
        align: 'center',
      })

      yPos += rowHeight
    })

    // Statistik section
    doc.moveDown(2)
    const statY = doc.y

    doc.fontSize(10).font('Times-Bold')
    doc.text('Statistik Nilai:', 50, statY)

    doc.fontSize(9).font('Times-Roman')
    doc.text(`Rata-rata: ${laporanData.statistik.rata_rata}`, 50, statY + 20)
    doc.text(`Nilai Tertinggi: ${laporanData.statistik.nilai_tertinggi}`, 50, statY + 35)
    doc.text(`Nilai Terendah: ${laporanData.statistik.nilai_terendah}`, 50, statY + 50)
    doc.text(
      `Tuntas: ${laporanData.statistik.tuntas} / ${laporanData.statistik.total_mapel}`,
      50,
      statY + 65
    )
    doc.text(
      `Belum Tuntas: ${laporanData.statistik.belum_tuntas} / ${laporanData.statistik.total_mapel}`,
      50,
      statY + 80
    )

    // Footer - Tanggal cetak
    doc.moveDown(3)
    const footerY = doc.y

    // Tanggal cetak (right aligned)
    doc.fontSize(10).font('Times-Roman')
    const currentDate = new Date()
    const dateStr = currentDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    doc.text(`Dicetak pada: ${dateStr}`, 380, footerY, { align: 'right' })

    return doc
  } catch (error) {
    console.error('Error in generatePDFLaporanService:', error)
    throw error
  }
}

export default {
  getTahunAjaranService,
  getNilaiLaporanService,
  generatePDFLaporanService,
}
