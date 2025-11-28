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
      nilai_akademik: nilaiAkademik.map((nilai) => ({
        mapel_id: nilai.mapel_id,
        nama_mapel: nilai.nama_mapel,
        nilai_akhir: nilai.nilai_akhir ? parseFloat(nilai.nilai_akhir) : null,
        grade: nilai.nilai_akhir ? nilai.grade : null,
      })),
      absensi: {
        hadir: parseInt(absensi.hadir) || 0,
        sakit: parseInt(absensi.sakit) || 0,
        izin: parseInt(absensi.izin) || 0,
        alpha: parseInt(absensi.alpha) || 0,
      },
      catatan_perkembangan: catatanPerkembangan.map((catatan) => {
        const tanggalObj = new Date(catatan.tanggal)
        const tanggalFormatted = !isNaN(tanggalObj.getTime())
          ? tanggalObj.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : catatan.tanggal.split('T')[0].split('-').reverse().join('/')

        return {
          tanggal: catatan.tanggal,
          tanggal_formatted: tanggalFormatted,
          guru_nama: catatan.guru_nama,
          isi_catatan: catatan.isi_catatan,
          kategori: catatan.kategori,
          jenis: catatan.jenis,
        }
      }),
    }
  } catch (error) {
    console.error('Error in getPerkembanganSiswaService:', error)
    throw error
  }
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
      role: 'guru', // Tambahkan role
      tanggal_cetak: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      logoBase64: logoBase64,
    }

    // Render HTML dari template EJS
    // __dirname = src/services/guru, jadi naik 2 level ke src, lalu masuk views/pdf
    const templatePath = path.join(__dirname, '../../views/pdf/laporan-perkembangan.ejs')
    const cssPath = path.join(__dirname, '../../views/pdf/styles/pdf-laporan.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    // Add CSS content to template data
    templateData.cssContent = cssContent

    const htmlContent = await ejs.renderFile(templatePath, templateData)

    // Header Template (Kop Surat - muncul di setiap halaman)
    const headerTemplate = `
    <style>
        /* Versi CSS Header yang lebih rapi */
        body { font-family: 'Times New Roman', serif; font-size: 10pt; width: 100%; margin: 0; padding: 0; }
        .kop-surat { 
          display: flex; 
          align-items: center; 
          border-bottom: 3px solid black; 
          padding: 10px 40px; /* Padding atas/bawah dikurangi */
          margin: 0;
        }
        .kop-surat img.logo { width: 70px; height: 70px; margin-right: 20px; }
        .kop-surat .teks-kop { text-align: center; flex-grow: 1; line-height: 1.3; }
        
        /* Dibuat konsisten: H2 paling besar, H3 sedang */
        .kop-surat h2 { font-size: 16pt; margin: 0; font-weight: bold; }
        .kop-surat h3 { font-size: 14pt; margin: 0; font-weight: bold; }
        .kop-surat p { font-size: 9pt; margin: 0; }
        

      </style>
      
      <div class="kop-surat">
        <img src="data:image/png;base64,${logoBase64}" alt="Logo" class="logo">
        <div class="teks-kop">
          <h2>LAPORAN PERKEMBANGAN SISWA</h2>
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
        top: '140px', // Area untuk header
        bottom: '60px', // Area untuk footer
        left: '40px',
        right: '40px',
      },
    })

    await browser.close()
    return pdfBuffer
  } catch (error) {
    console.error('Error in generatePDFPerkembanganService:', error)
    if (browser) await browser.close()
    throw error
  }
}

export default {
  getKelasWaliService,
  getSiswaListService,
  getPerkembanganSiswaService,
  generatePDFPerkembanganService,
}
