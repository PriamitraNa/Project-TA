# 📋 API Requirements - Laporan Anak (Role Ortu)

## 🎯 Overview

Halaman Laporan Anak menampilkan laporan akademik (rapor) anak yang bisa difilter berdasarkan tahun ajaran dan semester. Orang tua yang login bisa melihat nilai anak mereka berdasarkan NISN yang terkait dengan akun mereka.

---

## 🔑 Authentication & Authorization

- **Auth Required**: Ya (Bearer Token)
- **Role**: Ortu
- **Data Scope**: Hanya data anak yang terkait dengan NISN orang tua yang login

---

## 📡 API Endpoints yang Dibutuhkan

### **API #1: GET Daftar Tahun Ajaran**

**Endpoint**: `GET /api/ortu/laporan/tahun-ajaran`

**Purpose**: Mendapatkan daftar tahun ajaran yang tersedia untuk filter

**Headers**:

```
Authorization: Bearer {token}
```

**Response Success (200)**:

```json
{
  "status": "success",
  "message": "Data tahun ajaran berhasil diambil",
  "data": [
    {
      "id": 1,
      "tahun_ajaran": "2025/2026",
      "label": "T.A 2025/2026",
      "is_active": true
    },
    {
      "id": 2,
      "tahun_ajaran": "2024/2025",
      "label": "T.A 2024/2025",
      "is_active": false
    }
  ]
}
```

**Error Responses**:

- `401`: Unauthorized - Token tidak valid
- `403`: Forbidden - Bukan role ortu
- `500`: Server error

---

### **API #2: GET Laporan Nilai Anak**

**Endpoint**: `GET /api/ortu/laporan/nilai`

**Purpose**: Mendapatkan detail laporan nilai anak berdasarkan tahun ajaran dan semester

**Headers**:

```
Authorization: Bearer {token}
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tahun_ajaran_id` | integer | Yes | ID tahun ajaran |
| `semester` | string | Yes | Semester: `ganjil` atau `genap` |

**Example Request**:

```
GET /api/ortu/laporan/nilai?tahun_ajaran_id=1&semester=ganjil
```

**Response Success (200)**:

```json
{
  "status": "success",
  "message": "Data laporan berhasil diambil",
  "data": {
    "siswa": {
      "nisn": "0012345678",
      "nama": "Ahmad Santoso",
      "kelas": "7A"
    },
    "tahun_ajaran": {
      "id": 1,
      "tahun_ajaran": "2025/2026",
      "label": "T.A 2025/2026"
    },
    "semester": "ganjil",
    "nilai": [
      {
        "id": 1,
        "mapel_id": 101,
        "mapel": "Matematika",
        "kkm": 75,
        "nilai_akhir": 78,
        "predikat": "C",
        "deskripsi": "Perlu meningkatkan pemahaman konsep dasar."
      },
      {
        "id": 2,
        "mapel_id": 102,
        "mapel": "Bahasa Indonesia",
        "kkm": 75,
        "nilai_akhir": 88,
        "predikat": "A",
        "deskripsi": "Sangat baik dalam pemahaman teks dan menulis."
      },
      {
        "id": 3,
        "mapel_id": 103,
        "mapel": "IPA",
        "kkm": 75,
        "nilai_akhir": 87,
        "predikat": "A",
        "deskripsi": "Memiliki rasa ingin tahu yang tinggi."
      },
      {
        "id": 4,
        "mapel_id": 104,
        "mapel": "IPS",
        "kkm": 75,
        "nilai_akhir": 82,
        "predikat": "B",
        "deskripsi": "Baik dalam memahami sejarah dan geografi."
      }
    ],
    "statistik": {
      "total_mapel": 8,
      "nilai_rata_rata": 86.5,
      "jumlah_a": 5,
      "jumlah_b": 2,
      "jumlah_c": 1,
      "jumlah_d": 0
    }
  }
}
```

**Response Empty Data (200)**:

```json
{
  "status": "success",
  "message": "Belum ada data laporan untuk periode ini",
  "data": {
    "siswa": {
      "nisn": "0012345678",
      "nama": "Ahmad Santoso",
      "kelas": "7A"
    },
    "tahun_ajaran": {
      "id": 1,
      "tahun_ajaran": "2025/2026",
      "label": "T.A 2025/2026"
    },
    "semester": "ganjil",
    "nilai": [],
    "statistik": null
  }
}
```

**Error Responses**:

- `400`: Bad Request - Parameter tidak valid
- `401`: Unauthorized - Token tidak valid
- `403`: Forbidden - Bukan role ortu atau tidak punya akses ke data ini
- `404`: Not Found - Data tidak ditemukan
- `500`: Server error

**Validasi Backend**:

1. ✅ Token harus valid
2. ✅ User harus role ortu
3. ✅ NISN anak harus terkait dengan ortu yang login
4. ✅ Tahun ajaran harus valid
5. ✅ Semester harus 'ganjil' atau 'genap'

---

### **API #3: POST Download PDF Laporan**

**Endpoint**: `POST /api/ortu/laporan/download-pdf`

**Purpose**: Generate dan download PDF laporan nilai anak

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "tahun_ajaran_id": 1,
  "semester": "ganjil"
}
```

**Response Success (200)**:

- **Content-Type**: `application/pdf`
- **Headers**:
  - `Content-Disposition: attachment; filename="Laporan_Ahmad_Santoso_2025_2026_Ganjil.pdf"`
- **Body**: Binary PDF data

**Error Responses**:

- `400`: Bad Request - Parameter tidak valid
- `401`: Unauthorized - Token tidak valid
- `403`: Forbidden - Tidak punya akses
- `404`: Not Found - Data tidak ditemukan untuk generate PDF
- `500`: Server error

**PDF Content Should Include**:

- Header sekolah
- Identitas siswa (nama, NISN, kelas)
- Tahun ajaran & semester
- Tabel nilai semua mata pelajaran
- Keterangan predikat (A: 85-100, B: 70-84, C: 55-69, D: 0-54)
- Tanda tangan wali kelas (optional)
- Tanggal cetak

---

## 🔄 Flow Diagram

```
[Ortu Login]
    ↓
[Token disimpan dengan role=ortu & nisn_anak]
    ↓
[Masuk Halaman Laporan]
    ↓
[API #1: Load Tahun Ajaran] → Populate dropdown tahun ajaran
    ↓
[User Pilih Tahun Ajaran & Semester]
    ↓
[API #2: Load Laporan Nilai] → Tampilkan tabel nilai
    ↓
[User Klik "Unduh PDF"]
    ↓
[API #3: Download PDF] → Generate & download PDF
```

---

## 🏗️ Database Relations

```
ortu (users)
  ├── nisn_anak (foreign key to siswa.nisn)
  └── role = 'ortu'

siswa
  ├── nisn (primary key)
  ├── nama
  └── kelas_id

nilai
  ├── siswa_nisn (foreign key)
  ├── mapel_id (foreign key)
  ├── tahun_ajaran_id (foreign key)
  ├── semester (enum: ganjil/genap)
  ├── nilai_akhir (decimal)
  └── predikat (enum: A/B/C/D)

mata_pelajaran
  ├── id
  ├── nama_mapel
  └── kkm

tahun_ajaran
  ├── id
  ├── tahun_ajaran
  └── is_active
```

---

## 💡 Business Logic

### **Perhitungan Predikat**

Backend harus menghitung predikat berdasarkan nilai_akhir:

```
A: nilai_akhir >= 85
B: nilai_akhir >= 70
C: nilai_akhir >= 55
D: nilai_akhir < 55
```

_(Sesuai dengan standar yang digunakan guru)_

### **Authorization Logic**

```sql
-- Backend harus memastikan:
SELECT nilai.*
FROM nilai
JOIN siswa ON nilai.siswa_nisn = siswa.nisn
JOIN users ON users.nisn_anak = siswa.nisn
WHERE users.id = {logged_in_user_id}
  AND users.role = 'ortu'
  AND nilai.tahun_ajaran_id = {param_tahun_ajaran_id}
  AND nilai.semester = {param_semester}
```

### **Data Filtering**

- Ortu **HANYA** bisa lihat data anak yang terkait dengan NISN mereka
- Filter berdasarkan tahun_ajaran_id & semester
- Tampilkan semua mata pelajaran yang ada nilai di periode tersebut

---

## 🎨 Frontend Integration Plan

### **1. Create Service**

File: `src/services/Ortu/laporan/LaporanService.js`

```javascript
import axios from 'axios'
import { API_URL } from '../../api'

export const LaporanService = {
  // API #1: Get tahun ajaran options
  getTahunAjaran: async () => {
    const res = await axios.get(`${API_URL}/ortu/laporan/tahun-ajaran`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // API #2: Get laporan nilai
  getLaporanNilai: async (tahunAjaranId, semester) => {
    const res = await axios.get(`${API_URL}/ortu/laporan/nilai`, {
      params: {
        tahun_ajaran_id: tahunAjaranId,
        semester: semester,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  // API #3: Download PDF
  downloadPDF: async (tahunAjaranId, semester) => {
    const res = await axios.post(
      `${API_URL}/ortu/laporan/download-pdf`,
      {
        tahun_ajaran_id: tahunAjaranId,
        semester: semester,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        responseType: 'blob',
      }
    )

    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url

    // Extract filename from header or use default
    const contentDisposition = res.headers['content-disposition']
    let filename = `Laporan_${semester}_${tahunAjaranId}.pdf`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
      if (filenameMatch) filename = filenameMatch[1]
    }

    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return res
  },
}
```

### **2. Update Hook**

File: `src/features/ortu/laporan/hooks/useLaporan.js`

```javascript
import { useState, useEffect, useMemo } from 'react'
import { LaporanService } from '../../../../services/Ortu/laporan/LaporanService'
import { toast } from 'react-hot-toast'
import { GRADE_COLORS } from '../config/constants'

export const useLaporan = () => {
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([])
  const [selectedTahun, setSelectedTahun] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState('ganjil')
  const [dataTampil, setDataTampil] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [siswaInfo, setSiswaInfo] = useState(null)

  // Load tahun ajaran options on mount
  useEffect(() => {
    const loadTahunAjaran = async () => {
      try {
        setIsLoadingOptions(true)
        const response = await LaporanService.getTahunAjaran()

        if (response.status === 'success') {
          const options = response.data.map((item) => ({
            value: item.id,
            label: item.label,
          }))
          setTahunAjaranOptions(options)

          // Auto-select active tahun ajaran
          const active = response.data.find((item) => item.is_active)
          if (active) {
            setSelectedTahun(active.id)
          } else if (response.data.length > 0) {
            setSelectedTahun(response.data[0].id)
          }
        }
      } catch (error) {
        console.error('Error loading tahun ajaran:', error)
        toast.error('Gagal memuat tahun ajaran')
      } finally {
        setIsLoadingOptions(false)
      }
    }

    loadTahunAjaran()
  }, [])

  // Load laporan data when filters change
  useEffect(() => {
    if (!selectedTahun) return

    const loadLaporanNilai = async () => {
      try {
        setIsLoading(true)
        const response = await LaporanService.getLaporanNilai(selectedTahun, selectedSemester)

        if (response.status === 'success') {
          setDataTampil(response.data.nilai || [])
          setSiswaInfo(response.data.siswa)

          if (response.data.nilai.length === 0) {
            toast.info('Belum ada data laporan untuk periode ini')
          }
        }
      } catch (error) {
        console.error('Error loading laporan:', error)

        if (error.response?.status === 403) {
          toast.error('Anda tidak memiliki akses ke data ini')
        } else if (error.response?.status === 404) {
          toast.error('Data tidak ditemukan')
        } else {
          toast.error('Gagal memuat laporan nilai')
        }

        setDataTampil([])
      } finally {
        setIsLoading(false)
      }
    }

    loadLaporanNilai()
  }, [selectedTahun, selectedSemester])

  // Get grade badge color class
  const getPredikatBadge = (predikat) => {
    return GRADE_COLORS[predikat] || 'bg-gray-100 text-gray-800'
  }

  // Handle download PDF
  const handleDownloadPDF = async () => {
    if (!selectedTahun || dataTampil.length === 0) {
      toast.error('Tidak ada data untuk diunduh')
      return
    }

    try {
      setIsLoading(true)
      await LaporanService.downloadPDF(selectedTahun, selectedSemester)
      toast.success('PDF berhasil diunduh')
    } catch (error) {
      console.error('Error downloading PDF:', error)

      if (error.response?.status === 404) {
        toast.error('Data tidak ditemukan untuk generate PDF')
      } else {
        toast.error('Gagal mengunduh PDF')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // State
    tahunAjaranOptions,
    selectedTahun,
    selectedSemester,
    dataTampil,
    isLoading,
    isLoadingOptions,
    siswaInfo,

    // Actions
    setSelectedTahun,
    setSelectedSemester,
    getPredikatBadge,
    handleDownloadPDF,
  }
}
```

### **3. Update Components**

**FilterSection.jsx** - Tambah loading state untuk options:

```javascript
{isLoadingOptions ? (
  <div className="text-sm text-gray-500">Loading...</div>
) : (
  <FilterDropdown ... />
)}
```

**LaporanTable.jsx** - Tambah loading skeleton:

```javascript
{isLoading ? (
  <div className="text-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
    <p className="text-gray-500 mt-4">Memuat data...</p>
  </div>
) : data.length === 0 ? (
  // Empty state
) : (
  // Table
)}
```

---

## ✅ Testing Checklist

### **Manual Testing**

- [ ] Login sebagai ortu yang punya anak dengan NISN valid
- [ ] Dropdown tahun ajaran tampil dengan benar
- [ ] Auto-select tahun ajaran yang aktif
- [ ] Pilih semester ganjil → data muncul
- [ ] Pilih semester genap → data berubah
- [ ] Ganti tahun ajaran → data update
- [ ] Empty state muncul jika belum ada data
- [ ] Download PDF berhasil dengan nama file yang benar
- [ ] Toast notification muncul sesuai scenario
- [ ] Predikat warna sesuai (A=hijau, B=biru, C=kuning, D=merah)
- [ ] Grade ranges di footer: 85-100, 70-84, 55-69, 0-54

### **Error Handling**

- [ ] Token expired → redirect ke login
- [ ] Role bukan ortu → error 403
- [ ] NISN tidak terkait → error 403
- [ ] Parameter invalid → error 400
- [ ] Server error → toast error + fallback
- [ ] Network error → toast error

### **Authorization Testing**

- [ ] Ortu A tidak bisa lihat data anak Ortu B
- [ ] Role guru tidak bisa akses endpoint ortu
- [ ] Token palsu → error 401

---

## 📝 Notes untuk Backend Developer

1. **NISN Linkage**: Pastikan table `users` (ortu) punya column `nisn_anak` yang link ke `siswa.nisn`

2. **Predikat Calculation**: Gunakan standar yang sama dengan guru (85/70/55), jangan hardcode di frontend

3. **PDF Generation**: Bisa pakai library seperti:

   - PHP: TCPDF, FPDF, DomPDF
   - Node.js: PDFKit, Puppeteer
   - Python: ReportLab, WeasyPrint

4. **Performance**:

   - Index pada `nilai.siswa_nisn`, `nilai.tahun_ajaran_id`, `nilai.semester`
   - Cache PDF jika perlu (optional)

5. **Data Privacy**:

   - Double-check authorization di semua endpoint
   - Log access untuk audit trail

6. **Response Time**:
   - Target: < 500ms untuk API #2
   - PDF generation: < 3 detik

---

## 🚀 Implementation Priority

1. **HIGH**: API #1 (Tahun Ajaran) - Simple, needed first
2. **HIGH**: API #2 (Laporan Nilai) - Core functionality
3. **MEDIUM**: API #3 (Download PDF) - Nice to have, bisa pakai "Coming Soon" dulu

---

## 📞 Questions for Backend Team?

1. Apakah struktur table `users` sudah punya `nisn_anak`?
2. Apakah table `nilai` sudah punya `tahun_ajaran_id` dan `semester`?
3. Format PDF yang diinginkan seperti apa? Ada template khusus?
4. Perlu watermark atau digital signature di PDF?
5. Apakah perlu endpoint tambahan untuk statistik (rata-rata, jumlah A/B/C/D)?
