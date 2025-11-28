import laporanModel from '../../models/admin/laporanModel.js'
import puppeteer from 'puppeteer'
import ejs from 'ejs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import archiver from 'archiver'
import { PassThrough } from 'stream'

// Helper untuk mendapatkan __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get daftar siswa yang sudah memiliki data nilai
 * Filter by kelas_id, tahun_ajaran_id, search (nama/NISN)
 */
export const getDaftarSiswaService = async (filters) => {
  try {
    const { kelas_id, tahun_ajaran_id, search } = filters

    // Get siswa list from model
    const siswaList = await laporanModel.getSiswaWithNilai({
      kelas_id,
      tahun_ajaran_id,
      search,
    })

    // Return empty array if no data
    if (!siswaList || siswaList.length === 0) {
      return []
    }

    // Transform data for response
    return siswaList.map((siswa) => ({
      siswa_id: siswa.siswa_id,
      nama_lengkap: siswa.nama_lengkap,
      nisn: siswa.nisn,
      kelas: siswa.kelas,
      tahun_ajaran: siswa.tahun_ajaran,
      semester: siswa.semester,
      jumlah_mapel_dinilai: Number(siswa.jumlah_mapel_dinilai),
    }))
  } catch (error) {
    console.error('Error in getDaftarSiswaService:', error)
    throw new Error('Gagal mengambil daftar siswa')
  }
}

/**
 * Get transkrip nilai lengkap siswa (semua semester)
 */
export const getTranskripNilaiService = async (siswaId) => {
  try {
    // Get siswa info with current kelas and ortu
    const siswaInfo = await laporanModel.getSiswaInfoWithKelas(siswaId)

    if (!siswaInfo) {
      throw new Error('Data siswa tidak ditemukan')
    }

    // Get nilai per semester with tahun_ajaran_id
    const nilaiPerSemester = await laporanModel.getNilaiPerSemesterWithId(siswaId)

    // Get absensi per semester
    const absensiPerSemester = await laporanModel.getAbsensiPerSemester(siswaId)

    // Group data by tahun ajaran and semester
    const riwayatData = {}

    nilaiPerSemester.forEach((nilai) => {
      const key = `ta${nilai.tahun_ajaran_id}-${nilai.semester.toLowerCase()}`

      if (!riwayatData[key]) {
        riwayatData[key] = {
          id: key,
          tahun_ajaran: nilai.tahun_ajaran,
          tahun_ajaran_id: nilai.tahun_ajaran_id,
          semester: nilai.semester,
          kelas: nilai.kelas,
          absensi: {
            hadir: 0,
            sakit: 0,
            izin: 0,
            alpha: 0,
          },
          nilai: [],
        }
      }

      riwayatData[key].nilai.push({
        mapel_id: nilai.mapel_id,
        nama_mapel: nilai.mapel,
        nilai_akhir: nilai.nilai_akhir,
        grade: nilai.grade,
      })
    })

    // Add absensi data
    absensiPerSemester.forEach((absensi) => {
      const key = `ta${absensi.tahun_ajaran_id}-${absensi.semester.toLowerCase()}`

      if (riwayatData[key]) {
        riwayatData[key].absensi = {
          hadir: Number(absensi.hadir),
          sakit: Number(absensi.sakit),
          izin: Number(absensi.izin),
          alpha: Number(absensi.alpha),
        }
      }
    })

    // Convert to array and sort (newest first)
    const riwayat_nilai = Object.values(riwayatData).sort((a, b) => {
      // Sort by tahun ajaran descending (newest first)
      if (a.tahun_ajaran !== b.tahun_ajaran) {
        return b.tahun_ajaran.localeCompare(a.tahun_ajaran)
      }
      // Ganjil before Genap
      return a.semester === 'Ganjil' ? -1 : 1
    })

    // Format tanggal lahir
    let formattedTanggalLahir = siswaInfo.tanggal_lahir
    if (siswaInfo.tanggal_lahir) {
      const date = new Date(siswaInfo.tanggal_lahir)
      formattedTanggalLahir = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    }

    return {
      siswa: {
        siswa_id: siswaInfo.siswa_id,
        nama: siswaInfo.nama,
        nisn: siswaInfo.nisn,
        kelas: siswaInfo.kelas,
        tempat_lahir: siswaInfo.tempat_lahir,
        tanggal_lahir: formattedTanggalLahir,
        nama_ortu: siswaInfo.nama_ortu,
      },
      riwayat_nilai,
    }
  } catch (error) {
    console.error('Error in getTranskripNilaiService:', error)
    throw new Error(error.message || 'Gagal mengambil transkrip nilai siswa')
  }
}

/**
 * Generate PDF Transkrip Nilai menggunakan Puppeteer + EJS
 */
export const generateTranskripPDFService = async (siswaId) => {
  let browser

  try {
    // Validation
    if (!siswaId) {
      throw new Error('Siswa ID wajib diisi')
    }

    // Reuse getTranskripNilaiService to get all data
    const transkripData = await getTranskripNilaiService(siswaId)

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
      siswa: transkripData.siswa,
      riwayat_nilai: transkripData.riwayat_nilai,
      tanggal_cetak: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      logoBase64: logoBase64,
    }

    // Render HTML dari template EJS
    const templatePath = path.join(__dirname, '../../views/pdf/transkrip-nilai.ejs')
    const htmlContent = await ejs.renderFile(templatePath, templateData)

    // Header Template (Kop Surat)
    const headerTemplate = `
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 10pt; width: 100%; margin: 0; padding: 0; }
        .kop-surat { 
          display: flex; 
          align-items: center; 
          border-bottom: 3px solid black; 
          padding: 10px 40px;
          margin: 0;
        }
        .kop-surat img.logo { width: 70px; height: 70px; margin-right: 20px; }
        .kop-surat .teks-kop { text-align: center; flex-grow: 1; line-height: 1.3; }
        .kop-surat h2 { font-size: 16pt; margin: 0; font-weight: bold; }
        .kop-surat h3 { font-size: 14pt; margin: 0; font-weight: bold; }
        .kop-surat p { font-size: 9pt; margin: 0; }
      </style>
      
      <div class="kop-surat">
        <img src="data:image/png;base64,${logoBase64}" alt="Logo" class="logo">
        <div class="teks-kop">
          <h2>TRANSKRIP NILAI SISWA</h2>
          <h3>SDN 1 LANGENSARI</h3>
          <p>Jl. Cipanas, Kp. Korobokan, Cimanganten, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44151</p>
        </div>
      </div>
    `

    // Footer Template (Nomor Halaman)
    const footerTemplate = `
      <style>
        div { 
          font-family: 'Times New Roman', serif; 
          font-size: 9pt; 
          width: 100%; 
          text-align: right; 
          padding: 0 40px;
          box-sizing: border-box;
        }
      </style>
      <div>
        Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span>
      </div>
    `

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    // Generate PDF dengan header & footer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
      margin: {
        top: '140px',
        bottom: '60px',
        left: '40px',
        right: '40px',
      },
    })

    await browser.close()
    return pdfBuffer
  } catch (error) {
    console.error('Error in generateTranskripPDFService:', error)
    if (browser) await browser.close()
    throw error
  }
}

/**
 * Get all tahun ajaran for dropdown
 */
export const getTahunAjaranDropdownService = async () => {
  try {
    const tahunAjaranList = await laporanModel.getAllTahunAjaran()

    return tahunAjaranList.map((ta) => {
      // Format: "2025/2026 (Ganjil) - Aktif" atau "2024/2025 (Genap)"
      const semesterLabel = ta.semester === 'Ganjil' ? 'Ganjil' : 'Genap'
      const statusLabel = ta.status === 'aktif' ? ' - Aktif' : ''
      const label = `${ta.tahun} (${semesterLabel})${statusLabel}`

      return {
        id: ta.id,
        tahun: ta.tahun,
        semester: ta.semester,
        label: label,
        is_active: ta.status === 'aktif',
      }
    })
  } catch (error) {
    console.error('Error in getTahunAjaranDropdownService:', error)
    throw new Error('Gagal mengambil daftar tahun ajaran')
  }
}

/**
 * Get kelas by tahun ajaran for dropdown
 */
export const getKelasDropdownService = async (tahunAjaranId) => {
  try {
    if (!tahunAjaranId) {
      throw new Error('Tahun ajaran ID wajib diisi')
    }

    const kelasList = await laporanModel.getKelasByTahunAjaran(tahunAjaranId)

    return kelasList.map((kelas) => ({
      id: kelas.id,
      nama_kelas: kelas.nama_kelas,
    }))
  } catch (error) {
    console.error('Error in getKelasDropdownService:', error)
    throw new Error('Gagal mengambil daftar kelas')
  }
}

/**
 * Get siswa by kelas and tahun ajaran for dropdown
 */
export const getSiswaDropdownService = async (kelasId, tahunAjaranId) => {
  try {
    if (!kelasId) {
      throw new Error('Kelas ID wajib diisi')
    }

    if (!tahunAjaranId) {
      throw new Error('Tahun ajaran ID wajib diisi')
    }

    const siswaList = await laporanModel.getSiswaByKelasAndTahun(kelasId, tahunAjaranId)

    return siswaList.map((siswa) => ({
      id: siswa.id,
      nama: siswa.nama,
      nisn: siswa.nisn,
      label: `${siswa.nama} - ${siswa.nisn}`,
    }))
  } catch (error) {
    console.error('Error in getSiswaDropdownService:', error)
    throw new Error('Gagal mengambil daftar siswa')
  }
}

/**
 * Generate bulk transkrip PDF for all siswa in a kelas (ZIP format)
 */
export const generateBulkTranskripService = async (kelasId, tahunAjaranId) => {
  try {
    if (!kelasId) {
      throw new Error('Kelas ID wajib diisi')
    }

    if (!tahunAjaranId) {
      throw new Error('Tahun ajaran ID wajib diisi')
    }

    // Get kelas info for filename
    const kelasInfo = await laporanModel.getKelasInfo(kelasId)
    if (!kelasInfo) {
      throw new Error('Kelas tidak ditemukan')
    }

    // Get all siswa in the kelas
    const siswaIds = await laporanModel.getAllSiswaIdsByKelas(kelasId, tahunAjaranId)

    if (!siswaIds || siswaIds.length === 0) {
      throw new Error('Tidak ada siswa di kelas ini')
    }

    // Create PassThrough stream to collect ZIP data
    const bufferStream = new PassThrough()
    const chunks = []

    bufferStream.on('data', (chunk) => {
      chunks.push(chunk)
    })

    // Create ZIP archive and pipe to buffer stream
    const archive = archiver('zip', {
      zlib: { level: 9 },
    })

    archive.pipe(bufferStream)

    // Track errors
    archive.on('error', (err) => {
      throw err
    })

    // Generate PDF untuk each siswa and add to ZIP
    for (const siswa of siswaIds) {
      try {
        // Generate PDF for this siswa
        const pdfData = await generateTranskripPDFService(siswa.siswa_id)

        // Convert to Buffer if needed (Puppeteer returns Uint8Array)
        const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData)

        // Get siswa name for filename
        const transkripData = await getTranskripNilaiService(siswa.siswa_id)
        const siswaName = transkripData.siswa.nama.replace(/\s+/g, '_')
        const siswaNisn = transkripData.siswa.nisn

        const filename = `Transkrip_${siswaName}_${siswaNisn}.pdf`

        // Add Buffer to ZIP
        archive.append(pdfBuffer, { name: filename })
      } catch (error) {
        console.error(`Error generating PDF for siswa ${siswa.siswa_id}:`, error)
        // Continue with other students even if one fails
      }
    }

    // Finalize the archive (no more files will be added)
    archive.finalize()

    // Wait for stream to finish
    await new Promise((resolve, reject) => {
      bufferStream.on('end', resolve)
      bufferStream.on('error', reject)
    })

    // Combine chunks into single buffer
    const zipBuffer = Buffer.concat(chunks)

    // Return ZIP buffer and filename
    const kelasName = kelasInfo.nama_kelas.replace(/\s+/g, '_')
    const tahunAjaran = kelasInfo.tahun_ajaran.replace(/\//g, '-')
    const zipFilename = `Transkrip_${kelasName}_${tahunAjaran}.zip`

    return {
      buffer: zipBuffer,
      filename: zipFilename,
      totalSiswa: siswaIds.length,
    }
  } catch (error) {
    console.error('Error in generateBulkTranskripService:', error)
    throw error
  }
}

export default {
  getDaftarSiswaService,
  getTranskripNilaiService,
  generateTranskripPDFService,
  getTahunAjaranDropdownService,
  getKelasDropdownService,
  getSiswaDropdownService,
  generateBulkTranskripService,
}
