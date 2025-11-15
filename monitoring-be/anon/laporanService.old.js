import * as laporanModel from '../../models/guru/laporanModel.js'
import puppeteer from 'puppeteer'
import ejs from 'ejs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Helper untuk mendapatkan __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get kelas wali info
 */
export const getKelasWaliService = async (guruId) => {
  try {
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan')
    }

    // Check if guru is wali kelas
    const isWaliKelas = await laporanModel.checkIsWaliKelas(guruId)
    if (!isWaliKelas) {
      throw new Error('Anda tidak memiliki akses sebagai wali kelas')
    }

    // Get kelas info
    const kelasInfo = await laporanModel.getKelasWali(guruId)
    if (!kelasInfo) {
      throw new Error('Anda belum ditugaskan sebagai wali kelas')
    }

    return kelasInfo
  } catch (error) {
    console.error('Error in getKelasWaliService:', error)
    throw error
  }
}

/**
 * Get list siswa in kelas wali
 */
export const getSiswaListService = async (guruId, kelasId) => {
  try {
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan')
    }

    if (!kelasId) {
      throw new Error('Parameter kelas_id wajib diisi')
    }

    // Check if guru is wali kelas of this kelas
    const isWaliKelasOfKelas = await laporanModel.checkIsWaliKelasOfKelas(guruId, kelasId)
    if (!isWaliKelasOfKelas) {
      throw new Error('Anda bukan wali kelas dari kelas ini')
    }

    // Get siswa list
    const siswaList = await laporanModel.getSiswaByKelas(kelasId)
    
    if (!siswaList || siswaList.length === 0) {
      throw new Error('Tidak ada siswa di kelas ini')
    }

    return siswaList
  } catch (error) {
    console.error('Error in getSiswaListService:', error)
    throw error
  }
}

/**
 * Get perkembangan siswa lengkap (nilai, absensi, catatan)
 */
export const getPerkembanganSiswaService = async (guruId, siswaId) => {
  try {
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan')
    }

    if (!siswaId) {
      throw new Error('Parameter siswa_id wajib diisi')
    }

    // Check if guru is wali kelas of this siswa
    const kelasInfo = await laporanModel.checkIsWaliKelasOfSiswa(guruId, siswaId)
    if (!kelasInfo) {
      throw new Error('Anda bukan wali kelas dari siswa ini')
    }

    const kelasId = kelasInfo.kelas_id

    // Get siswa detail
    const siswaDetail = await laporanModel.getSiswaDetail(siswaId)
    if (!siswaDetail) {
      throw new Error('Data siswa tidak ditemukan')
    }

    // Get nilai akademik (all mapel)
    const nilaiAkademik = await laporanModel.getNilaiAkademikSiswa(siswaId, kelasId)

    // Get rekapitulasi absensi
    const absensi = await laporanModel.getRekapAbsensiSiswa(siswaId)

    // Get catatan perkembangan
    const catatanPerkembangan = await laporanModel.getCatatanPerkembanganSiswa(siswaId)

    // Format response
    return {
      siswa: siswaDetail,
      nilai_akademik: nilaiAkademik.map(nilai => ({
        mapel_id: nilai.mapel_id,
        nama_mapel: nilai.nama_mapel,
        nilai_akhir: nilai.nilai_akhir ? parseFloat(nilai.nilai_akhir) : null,
        grade: nilai.nilai_akhir ? nilai.grade : null
      })),
      absensi: {
        hadir: parseInt(absensi.hadir) || 0,
        sakit: parseInt(absensi.sakit) || 0,
        izin: parseInt(absensi.izin) || 0,
        alpha: parseInt(absensi.alpha) || 0
      },
      catatan_perkembangan: catatanPerkembangan
    }
  } catch (error) {
    console.error('Error in getPerkembanganSiswaService:', error)
    throw error
  }
}

/**
 * Helper: Tentukan grade (for PDF reports)
 */
const tentukanGrade = (nilaiAkhir) => {
  if (nilaiAkhir >= 85) return 'A'
  if (nilaiAkhir >= 70) return 'B'
  if (nilaiAkhir >= 55) return 'C'
  return 'D'
}

/**
 * Generate PDF Laporan Perkembangan Siswa menggunakan Puppeteer + EJS
 */
export const generatePDFPerkembanganService = async (guruId, siswaId, catatanWaliKelas) => {
  let browser

  try {
    // Validation
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan')
    }
    if (!siswaId) {
      throw new Error('Siswa ID wajib diisi')
    }
    if (!catatanWaliKelas || catatanWaliKelas.trim() === '') {
      throw new Error('Catatan wali kelas wajib diisi')
    }

    // Reuse getPerkembanganSiswaService to get all data
    const perkembanganData = await getPerkembanganSiswaService(guruId, siswaId)

    // Get guru info for signature
    const guru = await laporanModel.getGuruById(guruId)
    
    // Get tahun ajaran aktif
    const tahunAjaran = await laporanModel.getTahunAjaranAktif()

    // Konversi logo ke Base64
    let logoBase64 = ''
    try {
      const logoPath = path.join(process.cwd(), 'assets', 'logo-sekolah.png')
      logoBase64 = fs.readFileSync(logoPath).toString('base64')
    } catch (e) {
      console.warn('Logo tidak ditemukan, menggunakan placeholder.')
    }

    // Siapkan data untuk template
    const templateData = {
      siswa: perkembanganData.siswa,
      guru: guru,
      nilai_akademik: perkembanganData.nilai_akademik,
      absensi: perkembanganData.absensi,
      catatan_perkembangan: perkembanganData.catatan_perkembangan,
      catatan_wali_kelas: catatanWaliKelas,
      tahunAjaran: tahunAjaran,
      tanggal_cetak: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      logoBase64: logoBase64
    }

    // School info
    const schoolName = 'SDN 1 LANGENSARI'
    const schoolAddress =
      'Jl. Cipanas, Kp. Korobokan, Cimanganten, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44151'

    // Logo path
    const logoPath = 'assets/logo-sekolah.png'

    // Header
    const headerY = 50
    const pageWidth = 595 // A4 portrait width in points

    // Logo (left side, larger)
    try {
      doc.image(logoPath, 60, headerY, { width: 70, height: 70 })
    } catch (err) {
      console.warn('Logo not found, skipping logo:', err.message)
    }

    // Title section (center)
    const titleX = 150
    const titleWidth = pageWidth - 300

    doc.fontSize(16).font('Times-Bold')
    doc.text('LAPORAN PERKEMBANGAN SISWA', titleX, headerY + 5, { 
      align: 'center', 
      width: titleWidth 
    })

    doc.fontSize(14).font('Times-Bold')
    doc.text(schoolName, titleX, headerY + 25, { 
      align: 'center', 
      width: titleWidth 
    })

    doc.fontSize(9).font('Times-Roman')
    doc.text(schoolAddress, titleX, headerY + 45, { 
      align: 'center', 
      width: titleWidth 
    })

    // Horizontal line below header (thick line)
    const headerLineY = headerY + 75
    doc.lineWidth(2)
    doc
      .moveTo(50, headerLineY)
      .lineTo(pageWidth - 50, headerLineY)
      .stroke()
    doc.lineWidth(1) // Reset line width

    // Move down after header
    doc.y = headerLineY + 20

    // Identitas Siswa - 2 Column Layout
    const col1X = 50
    const col2X = 380
    const labelWidth = 80
    const identitasY = doc.y

    doc.fontSize(11).font('Times-Roman')

    // Left Column
    doc.text('Nama', col1X, identitasY)
    doc.text(':', col1X + labelWidth, identitasY)
    doc.text(perkembanganData.siswa.nama, col1X + labelWidth + 15, identitasY)

    doc.text('Tahun Ajaran', col1X, identitasY + 15)
    doc.text(':', col1X + labelWidth, identitasY + 15)
    doc.text(`${tahunAjaran.tahun}`, col1X + labelWidth + 15, identitasY + 15)

    doc.text('Semester', col1X, identitasY + 30)
    doc.text(':', col1X + labelWidth, identitasY + 30)
    doc.text(tahunAjaran.semester, col1X + labelWidth + 15, identitasY + 30)

    // Right Column
    doc.text('NISN', col2X, identitasY)
    doc.text(':', col2X + labelWidth, identitasY)
    doc.text(perkembanganData.siswa.nisn, col2X + labelWidth + 15, identitasY)

    doc.text('Kelas', col2X, identitasY + 15)
    doc.text(':', col2X + labelWidth, identitasY + 15)
    doc.text(perkembanganData.siswa.kelas, col2X + labelWidth + 15, identitasY + 15)

    doc.text('Orang Tua', col2X, identitasY + 30)
    doc.text(':', col2X + labelWidth, identitasY + 30)
    doc.text(perkembanganData.siswa.nama_ortu, col2X + labelWidth + 15, identitasY + 30)

    // Move Y position after identitas
    doc.y = identitasY + 60

    // Nilai Akademik Section dengan Table
    doc.fontSize(11).font('Times-Bold')
    doc.text('NILAI AKADEMIK', 50, doc.y)
    doc.moveDown(0.5)

    // Table configuration
    const tableTop = doc.y
    const rowHeight = 20
    const colWidths = {
      no: 40,
      mapel: 340,
      nilaiAkhir: 100,
      grade: 65
    }
    const tableStartX = 50

    // Draw table header with border
    let xPos = tableStartX
    const tableHeaderY = tableTop

    doc.fontSize(10).font('Times-Bold')

    // Header background (light gray)
    doc.fillColor('#E8E8E8')
    doc.rect(xPos, tableHeaderY, colWidths.no + colWidths.mapel + colWidths.nilaiAkhir + colWidths.grade, rowHeight).fill()
    doc.fillColor('#000000')

    // No
    doc.rect(xPos, tableHeaderY, colWidths.no, rowHeight).stroke()
    doc.text('No', xPos + 5, tableHeaderY + 6, { width: colWidths.no - 10, align: 'center' })
    xPos += colWidths.no

    // Mata Pelajaran
    doc.rect(xPos, tableHeaderY, colWidths.mapel, rowHeight).stroke()
    doc.text('Mata Pelajaran', xPos + 10, tableHeaderY + 6, { width: colWidths.mapel - 20 })
    xPos += colWidths.mapel

    // Nilai Akhir
    doc.rect(xPos, tableHeaderY, colWidths.nilaiAkhir, rowHeight).stroke()
    doc.text('Nilai Akhir', xPos + 5, tableHeaderY + 6, { width: colWidths.nilaiAkhir - 10, align: 'center' })
    xPos += colWidths.nilaiAkhir

    // Grade
    doc.rect(xPos, tableHeaderY, colWidths.grade, rowHeight).stroke()
    doc.text('Grade', xPos + 5, tableHeaderY + 6, { width: colWidths.grade - 10, align: 'center' })

    // Draw table rows
    doc.fontSize(10).font('Times-Roman')
    let yPos = tableHeaderY + rowHeight

    perkembanganData.nilai_akademik.forEach((nilai, index) => {
      xPos = tableStartX

      // Check if need new page
      if (yPos > 700) {
        doc.addPage()
        yPos = 50
      }

      const nilaiText = nilai.nilai_akhir !== null ? nilai.nilai_akhir.toFixed(1) : '-'
      const gradeText = nilai.grade || '-'

      // No
      doc.rect(xPos, yPos, colWidths.no, rowHeight).stroke()
      doc.text((index + 1).toString(), xPos + 5, yPos + 6, { width: colWidths.no - 10, align: 'center' })
      xPos += colWidths.no

      // Mata Pelajaran
      doc.rect(xPos, yPos, colWidths.mapel, rowHeight).stroke()
      doc.text(nilai.nama_mapel, xPos + 10, yPos + 6, { width: colWidths.mapel - 20 })
      xPos += colWidths.mapel

      // Nilai Akhir
      doc.rect(xPos, yPos, colWidths.nilaiAkhir, rowHeight).stroke()
      doc.text(nilaiText, xPos + 5, yPos + 6, { width: colWidths.nilaiAkhir - 10, align: 'center' })
      xPos += colWidths.nilaiAkhir

      // Grade
      doc.rect(xPos, yPos, colWidths.grade, rowHeight).stroke()
      doc.font('Times-Bold')
      doc.text(gradeText, xPos + 5, yPos + 6, { width: colWidths.grade - 10, align: 'center' })
      doc.font('Times-Roman')

      yPos += rowHeight
    })

    // Update doc.y position after table
    doc.y = yPos + 15

    // Rekapitulasi Absensi Section
    doc.fontSize(10).font('Times-Bold')
    doc.text('REKAPITULASI ABSENSI', 50, doc.y)
    doc.moveDown(0.5)

    const absensiY = doc.y
    doc.font('Times-Roman')
    doc.text(`Hadir: ${perkembanganData.absensi.hadir} hari`, 50, absensiY)
    doc.text(`Sakit: ${perkembanganData.absensi.sakit} hari`, 200, absensiY)
    doc.text(`Izin: ${perkembanganData.absensi.izin} hari`, 350, absensiY)
    doc.text(`Alpha: ${perkembanganData.absensi.alpha} hari`, 50, absensiY + 15)

    doc.moveDown(2)

    // Catatan Perkembangan Section
    doc.fontSize(10).font('Times-Bold')
    doc.text('CATATAN PERKEMBANGAN', 50, doc.y)
    doc.moveDown(0.5)

    doc.fontSize(9).font('Times-Roman')
    if (perkembanganData.catatan_perkembangan.length > 0) {
      perkembanganData.catatan_perkembangan.slice(0, 5).forEach((catatan, index) => {
        doc.text(
          `${index + 1}. ${catatan.tanggal} - ${catatan.guru_nama} (${catatan.mapel_nama})`,
          50,
          doc.y + 3
        )
        doc.text(`   ${catatan.isi_catatan}`, 50, doc.y + 3, { width: pageWidth - 100 })
      })
    } else {
      doc.text('Belum ada catatan perkembangan.', 50, doc.y + 3)
    }

    doc.moveDown(2)

    // Catatan Wali Kelas Section
    doc.fontSize(10).font('Times-Bold')
    doc.text('CATATAN WALI KELAS', 50, doc.y)
    doc.moveDown(0.5)

    doc.fontSize(9).font('Times-Roman')
    doc.text(catatanWaliKelas, 50, doc.y, {
      width: pageWidth - 100,
      align: 'justify',
    })

    doc.moveDown(3)

    // Footer - Signature section
    const currentDate = new Date()
    const dateStr = currentDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Signature section (right)
    const sigStartX = 380
    doc.fontSize(10).font('Times-Roman')
    doc.text(`Garut, ${dateStr}`, sigStartX, doc.y)
    doc.text('Wali Kelas', sigStartX, doc.y + 5)

    // Space for signature (3 lines down)
    const signatureY = doc.y + 60
    doc.text(guru.nama_lengkap, sigStartX, signatureY, { underline: true })
    doc.text(`NIP. ${guru.nip || '-'}`, sigStartX, signatureY + 15)

    return doc
  } catch (error) {
    console.error('Error in generatePDFPerkembanganService:', error)
    throw error
  }
}

export default {
  getKelasWaliService,
  getSiswaListService,
  getPerkembanganSiswaService,
  generatePDFPerkembanganService,
}
