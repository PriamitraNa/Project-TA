# API Documentation: Laporan Nilai Admin (Multi-Dropdown + Bulk ZIP)

## 📋 Overview

API untuk halaman Laporan Nilai role Admin dengan fitur:

- ✅ 3 Dropdown cascade (Tahun Ajaran → Kelas → Siswa)
- ✅ Generate transkrip individual (PDF)
- ✅ Generate transkrip bulk (ZIP untuk satu kelas)

---

## 🔗 Base URL

```
http://localhost:5000/api/admin/laporan
```

**Authentication:** Required (JWT Token in Authorization header)

---

## 📍 Endpoints

### 1. **GET** `/tahun-ajaran`

Get all tahun ajaran for dropdown

**Query Parameters:** None

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tahun": "2025/2026",
      "semester": "Ganjil",
      "label": "2025/2026 (Aktif)",
      "is_active": true
    },
    {
      "id": 2,
      "tahun": "2024/2025",
      "semester": "Genap",
      "label": "2024/2025",
      "is_active": false
    }
  ]
}
```

**Frontend Implementation:**

```javascript
const fetchTahunAjaran = async () => {
  const response = await axios.get('/api/admin/laporan/tahun-ajaran', {
    headers: { Authorization: `Bearer ${token}` },
  })
  setTahunAjaranList(response.data.data)
}
```

---

### 2. **GET** `/kelas?tahun_ajaran_id={id}`

Get kelas by tahun ajaran for dropdown

**Query Parameters:**

- `tahun_ajaran_id` (required): ID tahun ajaran

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama_kelas": "Kelas 1A"
    },
    {
      "id": 2,
      "nama_kelas": "Kelas 1B"
    }
  ]
}
```

**Frontend Implementation:**

```javascript
const fetchKelas = async (tahunAjaranId) => {
  const response = await axios.get(`/api/admin/laporan/kelas?tahun_ajaran_id=${tahunAjaranId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  setKelasList(response.data.data)
}
```

---

### 3. **GET** `/siswa-dropdown?kelas_id={id}&tahun_ajaran_id={id}`

Get siswa by kelas and tahun ajaran for dropdown

**Query Parameters:**

- `kelas_id` (required): ID kelas
- `tahun_ajaran_id` (required): ID tahun ajaran

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Ahmad Fikri",
      "nisn": "2025100001",
      "label": "Ahmad Fikri - 2025100001"
    },
    {
      "id": 2,
      "nama": "Bunga Melati",
      "nisn": "2025100002",
      "label": "Bunga Melati - 2025100002"
    }
  ]
}
```

**Frontend Implementation:**

```javascript
const fetchSiswa = async (kelasId, tahunAjaranId) => {
  const response = await axios.get(
    `/api/admin/laporan/siswa-dropdown?kelas_id=${kelasId}&tahun_ajaran_id=${tahunAjaranId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  setSiswaList(response.data.data)
}
```

---

### 4. **GET** `/transkrip/:siswa_id/pdf` (EXISTING - Individual)

Download transkrip individual siswa (PDF)

**URL Parameters:**

- `siswa_id` (required): ID siswa

**Response:** PDF file (binary)

**Frontend Implementation:**

```javascript
const downloadIndividual = async (siswaId) => {
  const response = await axios.get(`/api/admin/laporan/transkrip/${siswaId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob', // Important for file download
  })

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `Transkrip_${siswaId}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
```

---

### 5. **POST** `/transkrip/bulk` (NEW - Bulk ZIP)

Generate transkrip for all siswa in a kelas (ZIP format)

**Request Body:**

```json
{
  "kelas_id": 1,
  "tahun_ajaran_id": 1
}
```

**Response:** ZIP file (binary)

**Response Headers:**

- `Content-Type`: `application/zip`
- `Content-Disposition`: `attachment; filename="Transkrip_Kelas_1A_2025-2026.zip"`
- `X-Total-Siswa`: `24` (jumlah siswa dalam ZIP)

**Frontend Implementation:**

```javascript
const downloadBulk = async (kelasId, tahunAjaranId) => {
  setIsLoading(true)

  try {
    const response = await axios.post(
      '/api/admin/laporan/transkrip/bulk',
      {
        kelas_id: kelasId,
        tahun_ajaran_id: tahunAjaranId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important for file download
      }
    )

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition']
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : 'Transkrip_Kelas.zip'

    // Get total siswa from custom header
    const totalSiswa = response.headers['x-total-siswa']
    console.log(`Downloaded ZIP with ${totalSiswa} students`)

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()

    // Show success message
    alert(`Berhasil download transkrip untuk ${totalSiswa} siswa`)
  } catch (error) {
    console.error('Error downloading bulk:', error)
    alert('Gagal download transkrip')
  } finally {
    setIsLoading(false)
  }
}
```

---

## 🎨 Frontend Flow

### Step-by-Step Implementation

```javascript
import { useState, useEffect } from 'react'
import axios from 'axios'

const LaporanNilaiPage = () => {
  // State management
  const [tahunAjaranList, setTahunAjaranList] = useState([])
  const [kelasList, setKelasList] = useState([])
  const [siswaList, setSiswaList] = useState([])

  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null)
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [selectedSiswa, setSelectedSiswa] = useState(null)

  const [mode, setMode] = useState('individual') // 'individual' | 'bulk'
  const [isLoading, setIsLoading] = useState(false)

  // 1. Load tahun ajaran on component mount
  useEffect(() => {
    fetchTahunAjaran()
  }, [])

  // 2. When tahun ajaran changes, load kelas
  useEffect(() => {
    if (selectedTahunAjaran) {
      fetchKelas(selectedTahunAjaran)
      setSelectedKelas(null)
      setSelectedSiswa(null)
      setKelasList([])
      setSiswaList([])
    }
  }, [selectedTahunAjaran])

  // 3. When kelas changes, load siswa
  useEffect(() => {
    if (selectedKelas && selectedTahunAjaran) {
      fetchSiswa(selectedKelas, selectedTahunAjaran)
      setSelectedSiswa(null)
      setSiswaList([])
    }
  }, [selectedKelas])

  // API calls (see examples above)
  const fetchTahunAjaran = async () => {
    /* ... */
  }
  const fetchKelas = async (tahunAjaranId) => {
    /* ... */
  }
  const fetchSiswa = async (kelasId, tahunAjaranId) => {
    /* ... */
  }

  const handleGenerate = () => {
    if (mode === 'individual' && selectedSiswa) {
      downloadIndividual(selectedSiswa)
    } else if (mode === 'bulk' && selectedKelas && selectedTahunAjaran) {
      downloadBulk(selectedKelas, selectedTahunAjaran)
    }
  }

  return (
    <div>
      {/* Dropdown 1: Tahun Ajaran */}
      <select
        value={selectedTahunAjaran || ''}
        onChange={(e) => setSelectedTahunAjaran(e.target.value)}
      >
        <option value="">Pilih Tahun Ajaran...</option>
        {tahunAjaranList.map((ta) => (
          <option key={ta.id} value={ta.id}>
            {ta.label}
          </option>
        ))}
      </select>

      {/* Dropdown 2: Kelas */}
      <select
        value={selectedKelas || ''}
        onChange={(e) => setSelectedKelas(e.target.value)}
        disabled={!selectedTahunAjaran || kelasList.length === 0}
      >
        <option value="">Pilih Kelas...</option>
        {kelasList.map((kelas) => (
          <option key={kelas.id} value={kelas.id}>
            {kelas.nama_kelas}
          </option>
        ))}
      </select>

      {/* Mode Selection */}
      <div>
        <label>
          <input
            type="radio"
            value="individual"
            checked={mode === 'individual'}
            onChange={(e) => setMode(e.target.value)}
          />
          Siswa Individual
        </label>
        <label>
          <input
            type="radio"
            value="bulk"
            checked={mode === 'bulk'}
            onChange={(e) => setMode(e.target.value)}
          />
          Semua Siswa ({siswaList.length} siswa)
        </label>
      </div>

      {/* Dropdown 3: Siswa (only for individual mode) */}
      {mode === 'individual' && (
        <select
          value={selectedSiswa || ''}
          onChange={(e) => setSelectedSiswa(e.target.value)}
          disabled={!selectedKelas || siswaList.length === 0}
        >
          <option value="">Pilih Siswa...</option>
          {siswaList.map((siswa) => (
            <option key={siswa.id} value={siswa.id}>
              {siswa.label}
            </option>
          ))}
        </select>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={
          isLoading ||
          !selectedTahunAjaran ||
          !selectedKelas ||
          (mode === 'individual' && !selectedSiswa)
        }
      >
        {isLoading ? 'Generating...' : 'Generate Transkrip PDF'}
      </button>
    </div>
  )
}
```

---

## ⚠️ Error Handling

### Possible Errors:

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Parameter tahun_ajaran_id wajib diisi"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Tidak ada siswa di kelas ini"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Gagal generate bulk transkrip"
}
```

---

## 📦 Bulk ZIP Structure

Example ZIP content for "Kelas 1A":

```
Transkrip_Kelas_1A_2025-2026.zip
├── Transkrip_Ahmad_Fikri_2025100001.pdf
├── Transkrip_Bunga_Melati_2025100002.pdf
├── Transkrip_Cahyo_Pratama_2025100003.pdf
└── ...
```

---

## 🚀 Testing

### Test Dropdown Cascade:

```bash
# 1. Get tahun ajaran
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/admin/laporan/tahun-ajaran

# 2. Get kelas (using tahun_ajaran_id from step 1)
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/admin/laporan/kelas?tahun_ajaran_id=1

# 3. Get siswa (using kelas_id from step 2)
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/admin/laporan/siswa-dropdown?kelas_id=1&tahun_ajaran_id=1"
```

### Test Bulk ZIP:

```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"kelas_id": 1, "tahun_ajaran_id": 1}' \
  http://localhost:5000/api/admin/laporan/transkrip/bulk \
  --output transkrip.zip
```

---

## ✅ Summary

| Endpoint             | Method | Purpose                  |
| -------------------- | ------ | ------------------------ |
| `/tahun-ajaran`      | GET    | Dropdown 1: Tahun Ajaran |
| `/kelas`             | GET    | Dropdown 2: Kelas        |
| `/siswa-dropdown`    | GET    | Dropdown 3: Siswa        |
| `/transkrip/:id/pdf` | GET    | Individual PDF           |
| `/transkrip/bulk`    | POST   | Bulk ZIP                 |

**Total Endpoints:** 5 (3 dropdown + 2 download)

---

**Happy Coding! 🎉**
