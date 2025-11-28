# 📊 API Documentation - Laporan Admin

## Overview
API untuk halaman **Laporan** (Role: Admin)

### Base URL
```
/api/admin/laporan
```

### Authentication
- Bearer Token (JWT)
- Role: `admin`

---

## 📋 API Endpoints

### 1. GET /api/admin/laporan/siswa

**Deskripsi:** Mengambil daftar siswa yang sudah memiliki data nilai untuk dropdown filter

#### Request
```
GET /api/admin/laporan/siswa
Authorization: Bearer <token>
```

#### Authorization
- ✅ JWT Token required (role: admin)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `kelas_id` | integer | No | Filter siswa berdasarkan kelas tertentu |
| `tahun_ajaran_id` | integer | No | Filter siswa berdasarkan tahun ajaran (default: tahun ajaran aktif) |
| `search` | string | No | Pencarian berdasarkan nama lengkap atau NISN siswa |

#### Response (200 - Success)

**Tanpa Filter:**
```json
{
  "status": "success",
  "data": [
    {
      "siswa_id": 19,
      "nama_lengkap": "131231231",
      "nisn": "1231323231",
      "kelas": "Kelas 1",
      "tahun_ajaran": "2027/2028",
      "semester": "Genap",
      "jumlah_mapel_dinilai": 1
    },
    {
      "siswa_id": 23,
      "nama_lengkap": "Ahmad Rizki",
      "nisn": "1111111111",
      "kelas": "Kelas 1",
      "tahun_ajaran": "2027/2028",
      "semester": "Genap",
      "jumlah_mapel_dinilai": 1
    },
    {
      "siswa_id": 16,
      "nama_lengkap": "Asep",
      "nisn": "2222222222",
      "kelas": "Kelas 1",
      "tahun_ajaran": "2027/2028",
      "semester": "Genap",
      "jumlah_mapel_dinilai": 1
    }
  ]
}
```

**Dengan Filter kelas_id:**
```
GET /api/admin/laporan/siswa?kelas_id=17
```

**Dengan Filter tahun_ajaran_id:**
```
GET /api/admin/laporan/siswa?tahun_ajaran_id=17
```

**Dengan Search:**
```
GET /api/admin/laporan/siswa?search=Ahmad
```

**Kombinasi Filter:**
```
GET /api/admin/laporan/siswa?kelas_id=17&search=Ahmad
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `siswa_id` | Integer | ID siswa |
| `nama_lengkap` | String | Nama lengkap siswa |
| `nisn` | String | NISN siswa |
| `kelas` | String | Nama kelas siswa |
| `tahun_ajaran` | String | Tahun ajaran (e.g., "2027/2028") |
| `semester` | String | Semester ("Ganjil" / "Genap") |
| `jumlah_mapel_dinilai` | Integer | Jumlah mata pelajaran yang sudah memiliki nilai |

#### Business Logic

1. **Query siswa yang sudah memiliki nilai:**
   - Menggunakan `INNER JOIN` dengan tabel `nilai` untuk memastikan hanya siswa yang sudah memiliki nilai yang ditampilkan
   - Menghitung jumlah mata pelajaran yang sudah dinilai per siswa

2. **Filter tahun_ajaran_id:**
   - Jika tidak ada parameter `tahun_ajaran_id`, default menggunakan tahun ajaran dengan status `'aktif'`
   - Jika ada parameter `tahun_ajaran_id`, filter berdasarkan ID tersebut

3. **Filter kelas_id:**
   - Filter siswa berdasarkan kelas tertentu dari tabel `nilai`

4. **Search:**
   - Pencarian menggunakan `LIKE` pada kolom `nama_lengkap` dan `nisn`
   - Case-insensitive search

5. **Sorting:**
   - Data diurutkan berdasarkan `nama_lengkap` secara ascending (A-Z)

#### SQL Query Structure

```sql
SELECT DISTINCT
  s.id AS siswa_id,
  s.nama_lengkap,
  s.nisn,
  k.nama_kelas AS kelas,
  ta.tahun AS tahun_ajaran,
  ta.semester,
  COUNT(DISTINCT n.mapel_id) AS jumlah_mapel_dinilai
FROM siswa s
INNER JOIN nilai n ON s.id = n.siswa_id
INNER JOIN kelas k ON n.kelas_id = k.id
INNER JOIN tahun_ajaran ta ON n.tahun_ajaran_id = ta.id
WHERE 1=1
  -- Filter tahun ajaran (default: aktif)
  AND (n.tahun_ajaran_id = ? OR ta.status = 'aktif')
  -- Filter kelas (optional)
  AND (n.kelas_id = ? OR ? IS NULL)
  -- Search (optional)
  AND (s.nama_lengkap LIKE ? OR s.nisn LIKE ? OR ? IS NULL)
GROUP BY s.id, s.nama_lengkap, s.nisn, k.nama_kelas, ta.tahun, ta.semester
ORDER BY s.nama_lengkap ASC
```

#### Error Responses

**401 Unauthorized** (Token invalid/expired)
```json
{
  "status": "error",
  "message": "Token tidak valid atau telah kadaluarsa",
  "data": null
}
```

**403 Forbidden** (Bukan role admin)
```json
{
  "status": "error",
  "message": "Akses ditolak. Hanya admin yang dapat mengakses endpoint ini",
  "data": null
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "message": "Gagal mengambil daftar siswa",
  "data": null
}
```

#### Response (200 - Empty Data)
Jika tidak ada siswa yang memiliki nilai:
```json
{
  "status": "success",
  "data": []
}
```

---

## 🧪 Testing Guide

### Test Case 1: Get All Siswa dengan Nilai ✅

**Scenario:** Admin mengambil semua siswa yang sudah memiliki nilai

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/siswa" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200 OK
- Data: Array of siswa yang sudah memiliki nilai
- Sorted by nama_lengkap ASC

---

### Test Case 2: Filter by Kelas ✅

**Scenario:** Admin filter siswa berdasarkan kelas tertentu

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/siswa?kelas_id=17" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200 OK
- Data: Hanya siswa dari kelas_id = 17 yang sudah memiliki nilai

---

### Test Case 3: Filter by Tahun Ajaran ✅

**Scenario:** Admin filter siswa berdasarkan tahun ajaran tertentu

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/siswa?tahun_ajaran_id=17" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200 OK
- Data: Siswa dari tahun_ajaran_id = 17 yang sudah memiliki nilai

---

### Test Case 4: Search by Nama ✅

**Scenario:** Admin search siswa berdasarkan nama

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/siswa?search=Ahmad" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200 OK
- Data: Siswa dengan nama mengandung "Ahmad" yang sudah memiliki nilai

---

### Test Case 5: Search by NISN ✅

**Scenario:** Admin search siswa berdasarkan NISN

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/siswa?search=1111111111" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200 OK
- Data: Siswa dengan NISN mengandung "1111111111" yang sudah memiliki nilai

---

### Test Case 6: Kombinasi Filter ✅

**Scenario:** Admin menggunakan multiple filter

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/siswa?kelas_id=17&search=Ahmad" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200 OK
- Data: Siswa dari kelas 17 dengan nama mengandung "Ahmad" yang sudah memiliki nilai

---

### Test Case 7: No Data ✅

**Scenario:** Tidak ada siswa yang memenuhi kriteria

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/siswa?search=XYZ999" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
```json
{
  "status": "success",
  "data": []
}
```

---

### Test Case 8: Unauthorized Access ❌

**Scenario:** User tanpa token mencoba akses

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/siswa"
```

**Expected Result:**
- Status: 401 Unauthorized
- Error message tentang token

---

### Test Case 9: Non-Admin Access ❌

**Scenario:** User dengan role guru/ortu mencoba akses

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/siswa" \
  -H "Authorization: Bearer GURU_OR_ORTU_TOKEN"
```

**Expected Result:**
- Status: 403 Forbidden
- Error message: "Akses ditolak"

---

## 📝 Frontend Implementation Example

### JavaScript (Fetch API)

```javascript
/**
 * Get daftar siswa dengan nilai
 * @param {Object} filters - Filter parameters
 * @param {number|null} filters.kelas_id - Filter by kelas
 * @param {number|null} filters.tahun_ajaran_id - Filter by tahun ajaran
 * @param {string|null} filters.search - Search by nama/NISN
 */
const getDaftarSiswa = async (filters = {}) => {
  try {
    // Build query string
    const params = new URLSearchParams();
    if (filters.kelas_id) params.append('kelas_id', filters.kelas_id);
    if (filters.tahun_ajaran_id) params.append('tahun_ajaran_id', filters.tahun_ajaran_id);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = `/api/admin/laporan/siswa${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data siswa');
    }
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage Example 1: Get all siswa
const allSiswa = await getDaftarSiswa();

// Usage Example 2: Filter by kelas
const siswaKelas17 = await getDaftarSiswa({ kelas_id: 17 });

// Usage Example 3: Search by nama
const searchResult = await getDaftarSiswa({ search: 'Ahmad' });

// Usage Example 4: Multiple filters
const filtered = await getDaftarSiswa({ 
  kelas_id: 17, 
  search: 'Ahmad' 
});
```

### HTML Form Example

```html
<div class="filter-container">
  <h3>Filter Siswa</h3>
  
  <div class="form-group">
    <label>Kelas:</label>
    <select id="filter-kelas" class="form-control">
      <option value="">-- Semua Kelas --</option>
      <!-- Populated from /api/admin/kelas -->
    </select>
  </div>
  
  <div class="form-group">
    <label>Tahun Ajaran:</label>
    <select id="filter-tahun-ajaran" class="form-control">
      <option value="">-- Tahun Ajaran Aktif --</option>
      <!-- Populated from /api/admin/tahun-ajaran -->
    </select>
  </div>
  
  <div class="form-group">
    <label>Cari Siswa:</label>
    <input 
      type="text" 
      id="search-siswa" 
      class="form-control" 
      placeholder="Nama atau NISN..."
    />
  </div>
  
  <button onclick="handleFilter()" class="btn btn-primary">
    <i class="fas fa-filter"></i> Filter
  </button>
  <button onclick="handleReset()" class="btn btn-secondary">
    <i class="fas fa-redo"></i> Reset
  </button>
</div>

<div class="siswa-list">
  <table class="table">
    <thead>
      <tr>
        <th>No</th>
        <th>Nama Lengkap</th>
        <th>NISN</th>
        <th>Kelas</th>
        <th>Tahun Ajaran</th>
        <th>Semester</th>
        <th>Mapel Dinilai</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody id="siswa-table-body">
      <!-- Populated by JavaScript -->
    </tbody>
  </table>
</div>

<script>
const handleFilter = async () => {
  const kelasId = document.getElementById('filter-kelas').value;
  const tahunAjaranId = document.getElementById('filter-tahun-ajaran').value;
  const search = document.getElementById('search-siswa').value;
  
  const filters = {};
  if (kelasId) filters.kelas_id = parseInt(kelasId);
  if (tahunAjaranId) filters.tahun_ajaran_id = parseInt(tahunAjaranId);
  if (search) filters.search = search;
  
  try {
    const siswaList = await getDaftarSiswa(filters);
    displaySiswaList(siswaList);
  } catch (error) {
    alert('Gagal mengambil data siswa');
  }
};

const displaySiswaList = (siswaList) => {
  const tbody = document.getElementById('siswa-table-body');
  
  if (siswaList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Tidak ada data</td></tr>';
    return;
  }
  
  tbody.innerHTML = siswaList.map((siswa, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${siswa.nama_lengkap}</td>
      <td>${siswa.nisn}</td>
      <td>${siswa.kelas}</td>
      <td>${siswa.tahun_ajaran}</td>
      <td>${siswa.semester}</td>
      <td>${siswa.jumlah_mapel_dinilai}</td>
      <td>
        <button onclick="viewDetail(${siswa.siswa_id})" class="btn btn-sm btn-info">
          <i class="fas fa-eye"></i> Detail
        </button>
      </td>
    </tr>
  `).join('');
};

const handleReset = () => {
  document.getElementById('filter-kelas').value = '';
  document.getElementById('filter-tahun-ajaran').value = '';
  document.getElementById('search-siswa').value = '';
  handleFilter();
};

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  handleFilter();
});
</script>
```

---

## 🔍 Notes

1. **Siswa yang Ditampilkan:**
   - Hanya siswa yang **sudah memiliki data nilai** di tabel `nilai`
   - Menggunakan `INNER JOIN` untuk memastikan siswa memiliki minimal 1 nilai

2. **Default Tahun Ajaran:**
   - Jika parameter `tahun_ajaran_id` tidak diberikan, sistem akan menggunakan tahun ajaran dengan status `'aktif'`

3. **Jumlah Mapel Dinilai:**
   - Menghitung berapa banyak mata pelajaran yang sudah memiliki nilai untuk siswa tersebut
   - Berguna untuk mengetahui kelengkapan data nilai siswa

4. **Performance:**
   - Query menggunakan `DISTINCT` dan `GROUP BY` untuk menghindari duplikasi data
   - Index pada kolom `siswa_id`, `kelas_id`, `tahun_ajaran_id` akan meningkatkan performa

5. **Case Sensitivity:**
   - Search menggunakan `LIKE` yang case-insensitive di MySQL (default collation)

---

### 2. GET /api/admin/laporan/transkrip/:siswa_id

**Deskripsi:** Mengambil transkrip nilai lengkap siswa (semua semester)

#### Request
```
GET /api/admin/laporan/transkrip/:siswa_id
Authorization: Bearer <token>
```

#### Authorization
- ✅ JWT Token required (role: admin)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `siswa_id` | integer | Yes | ID siswa yang akan diambil transkripnya |

#### Response (200 - Success)

```json
{
  "success": true,
  "message": "Transkrip nilai berhasil diambil",
  "data": {
    "siswa": {
      "siswa_id": 19,
      "nama": "Ahmad Rizki",
      "nisn": "1111111111",
      "kelas": "Kelas 1",
      "tempat_lahir": "Jakarta",
      "tanggal_lahir": "2005-05-05",
      "nama_ortu": "Siti Nurhaliza"
    },
    "riwayat_nilai": [
      {
        "id": "ta17-genap",
        "tahun_ajaran": "2027/2028",
        "tahun_ajaran_id": 17,
        "semester": "Genap",
        "kelas": "Kelas 1",
        "absensi": {
          "hadir": 58,
          "sakit": 1,
          "izin": 0,
          "alpha": 0
        },
        "nilai": [
          {
            "mapel_id": 1,
            "nama_mapel": "MTK",
            "nilai_akhir": 88.0,
            "grade": "A"
          }
        ]
      },
      {
        "id": "ta16-ganjil",
        "tahun_ajaran": "2026/2027",
        "tahun_ajaran_id": 16,
        "semester": "Ganjil",
        "kelas": "Kelas 1",
        "absensi": {
          "hadir": 55,
          "sakit": 2,
          "izin": 1,
          "alpha": 0
        },
        "nilai": [
          {
            "mapel_id": 1,
            "nama_mapel": "Matematika",
            "nilai_akhir": 85.5,
            "grade": "A"
          },
          {
            "mapel_id": 2,
            "nama_mapel": "Bahasa Indonesia",
            "nilai_akhir": 78.0,
            "grade": "B"
          }
        ]
      }
    ]
  }
}
```

#### Response Fields

**Siswa Object:**
| Field | Type | Description |
|-------|------|-------------|
| `siswa_id` | Integer | ID siswa |
| `nama` | String | Nama lengkap siswa |
| `nisn` | String | NISN siswa |
| `kelas` | String | Kelas saat ini (tahun ajaran aktif) |
| `tempat_lahir` | String | Tempat lahir siswa |
| `tanggal_lahir` | String | Tanggal lahir (format: YYYY-MM-DD) |
| `nama_ortu` | String | Nama orang tua/wali |

**Riwayat Nilai Array:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique ID (format: "ta{id}-{semester}") |
| `tahun_ajaran` | String | Tahun ajaran (e.g., "2027/2028") |
| `tahun_ajaran_id` | Integer | ID tahun ajaran |
| `semester` | String | Semester ("Ganjil" / "Genap") |
| `kelas` | String | Nama kelas pada semester tersebut |
| `absensi` | Object | Data absensi semester tersebut |
| `nilai` | Array | Array nilai per mata pelajaran |

**Absensi Object:**
| Field | Type | Description |
|-------|------|-------------|
| `hadir` | Integer | Jumlah kehadiran |
| `sakit` | Integer | Jumlah sakit |
| `izin` | Integer | Jumlah izin |
| `alpha` | Integer | Jumlah alpha |

**Nilai Object:**
| Field | Type | Description |
|-------|------|-------------|
| `mapel_id` | Integer | ID mata pelajaran |
| `nama_mapel` | String | Nama mata pelajaran |
| `nilai_akhir` | Float | Nilai akhir siswa |
| `grade` | String | Grade nilai (A/B/C/D) |

#### Business Logic

1. **Get Siswa Info:**
   - Mengambil data siswa dari tabel `siswa`
   - JOIN dengan `kelas_siswa` dan `kelas` untuk mendapatkan kelas saat ini (tahun ajaran aktif)
   - Mengambil nama orang tua dari tabel `orangtua_siswa` dan `orangtua`
   - Jika siswa tidak ditemukan, return error 404

2. **Get Nilai Per Semester:**
   - Query semua nilai siswa dari tabel `nilai`
   - JOIN dengan `tahun_ajaran`, `kelas`, dan `mapel`
   - Include `tahun_ajaran_id` dan `mapel_id` untuk referensi
   - Menghitung grade berdasarkan nilai_akhir:
     - A: >= 85
     - B: >= 70
     - C: >= 55
     - D: < 55

3. **Get Absensi Per Semester:**
   - Query absensi dari tabel `absensi`
   - JOIN dengan `kelas` dan `tahun_ajaran`
   - GROUP BY tahun_ajaran_id dan semester
   - COUNT untuk setiap status (Hadir, Sakit, Izin, Alpha)

4. **Group by Tahun Ajaran & Semester:**
   - Mengelompokkan nilai berdasarkan kombinasi tahun_ajaran_id dan semester
   - Generate unique ID dengan format "ta{id}-{semester}"
   - Setiap grup berisi kelas, absensi, dan array nilai
   - Merge data absensi ke dalam grup yang sesuai

5. **Sorting:**
   - Riwayat nilai diurutkan berdasarkan tahun ajaran **descending** (terbaru duluan)
   - Dalam tahun ajaran yang sama, Ganjil sebelum Genap
   - Nilai mapel diurutkan berdasarkan nama mapel (ascending)

#### SQL Query Structure

**Get Siswa Info with Kelas & Ortu:**
```sql
SELECT 
  s.id AS siswa_id,
  s.nama_lengkap AS nama,
  s.nisn,
  s.tempat_lahir,
  s.tanggal_lahir,
  COALESCE(k.nama_kelas, '-') AS kelas,
  COALESCE(
    (SELECT o.nama_lengkap 
     FROM orangtua_siswa os 
     JOIN orangtua o ON os.orangtua_id = o.id 
     WHERE os.siswa_id = s.id 
     LIMIT 1),
    'Tidak Ada Data'
  ) AS nama_ortu
FROM siswa s
LEFT JOIN kelas_siswa ks ON s.id = ks.siswa_id 
  AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
LEFT JOIN kelas k ON ks.kelas_id = k.id
WHERE s.id = ?
LIMIT 1
```

**Get Nilai Per Semester:**
```sql
SELECT 
  ta.id AS tahun_ajaran_id,
  ta.tahun AS tahun_ajaran,
  ta.semester,
  k.nama_kelas AS kelas,
  m.id AS mapel_id,
  m.nama_mapel AS mapel,
  n.nilai_akhir,
  CASE 
    WHEN n.nilai_akhir >= 85 THEN 'A'
    WHEN n.nilai_akhir >= 70 THEN 'B'
    WHEN n.nilai_akhir >= 55 THEN 'C'
    ELSE 'D'
  END AS grade
FROM nilai n
INNER JOIN tahun_ajaran ta ON n.tahun_ajaran_id = ta.id
INNER JOIN kelas k ON n.kelas_id = k.id
INNER JOIN mapel m ON n.mapel_id = m.id
WHERE n.siswa_id = ?
ORDER BY ta.tahun DESC, ta.semester ASC, m.nama_mapel ASC
```

**Get Absensi Per Semester:**
```sql
SELECT 
  ta.id AS tahun_ajaran_id,
  ta.semester,
  COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) AS hadir,
  COUNT(CASE WHEN a.status = 'Sakit' THEN 1 END) AS sakit,
  COUNT(CASE WHEN a.status = 'Izin' THEN 1 END) AS izin,
  COUNT(CASE WHEN a.status = 'Alpha' THEN 1 END) AS alpha
FROM absensi a
INNER JOIN kelas k ON a.kelas_id = k.id
INNER JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
WHERE a.siswa_id = ?
GROUP BY ta.id, ta.semester
ORDER BY ta.tahun DESC, ta.semester ASC
```

#### Error Responses

**400 Bad Request** (Missing siswa_id)
```json
{
  "success": false,
  "message": "Parameter siswa_id wajib diisi",
  "data": null
}
```

**401 Unauthorized** (Token invalid/expired)
```json
{
  "success": false,
  "message": "Token tidak valid atau telah kadaluarsa",
  "data": null
}
```

**403 Forbidden** (Bukan role admin)
```json
{
  "success": false,
  "message": "Akses ditolak. Hanya admin yang dapat mengakses endpoint ini",
  "data": null
}
```

**404 Not Found** (Siswa tidak ditemukan)
```json
{
  "success": false,
  "message": "Data siswa tidak ditemukan",
  "data": null
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Gagal mengambil transkrip nilai siswa",
  "data": null
}
```

#### Response (200 - Empty Riwayat)
Jika siswa belum memiliki nilai:
```json
{
  "success": true,
  "message": "Transkrip nilai berhasil diambil",
  "data": {
    "siswa": {
      "siswa_id": 19,
      "nama": "Ahmad Rizki",
      "nisn": "1111111111",
      "kelas": "Kelas 1",
      "tempat_lahir": "Jakarta",
      "tanggal_lahir": "2005-05-05",
      "nama_ortu": "Siti Nurhaliza"
    },
    "riwayat_nilai": []
  }
}
```

---

## 🧪 Testing Guide - Transkrip Nilai

### Test Case 1: Get Transkrip Siswa ✅

**Scenario:** Admin mengambil transkrip nilai siswa

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/transkrip/19" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200 OK
- Data: Siswa info + transkrip nilai semua semester
- Transkrip sorted by tahun ajaran dan semester

---

### Test Case 2: Siswa Tidak Ditemukan ❌

**Scenario:** Admin request transkrip untuk siswa yang tidak ada

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/transkrip/99999" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 404 Not Found
- Error message: "Data siswa tidak ditemukan"

---

### Test Case 3: Siswa Belum Punya Nilai ✅

**Scenario:** Siswa ada tapi belum punya nilai

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/transkrip/5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 200 OK
- Data: Siswa info dengan transkrip array kosong

---

## 📝 Frontend Implementation Example - Transkrip

### JavaScript (Fetch API)

```javascript
/**
 * Get transkrip nilai siswa
 */
const getTranskripNilai = async (siswaId) => {
  try {
    const response = await fetch(`/api/admin/laporan/transkrip/${siswaId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil transkrip nilai');
    }
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage Example
const transkrip = await getTranskripNilai(19);
console.log(transkrip.siswa);
console.log(transkrip.transkrip);
```

### HTML Display Example

```html
<div class="transkrip-container">
  <div class="siswa-info">
    <h3>Informasi Siswa</h3>
    <table>
      <tr>
        <td>Nama</td>
        <td>: <span id="siswa-nama"></span></td>
      </tr>
      <tr>
        <td>NISN</td>
        <td>: <span id="siswa-nisn"></span></td>
      </tr>
      <tr>
        <td>Jenis Kelamin</td>
        <td>: <span id="siswa-jk"></span></td>
      </tr>
      <tr>
        <td>Tempat, Tanggal Lahir</td>
        <td>: <span id="siswa-ttl"></span></td>
      </tr>
    </table>
  </div>

  <div class="transkrip-nilai">
    <h3>Transkrip Nilai</h3>
    <div id="transkrip-list"></div>
  </div>
</div>

<script>
const displayTranskrip = async (siswaId) => {
  try {
    const data = await getTranskripNilai(siswaId);
    
    // Display siswa info
    document.getElementById('siswa-nama').innerText = data.siswa.nama_lengkap;
    document.getElementById('siswa-nisn').innerText = data.siswa.nisn;
    document.getElementById('siswa-jk').innerText = data.siswa.jenis_kelamin;
    document.getElementById('siswa-ttl').innerText = 
      `${data.siswa.tempat_lahir}, ${data.siswa.tanggal_lahir}`;
    
    // Display transkrip
    const transkripList = document.getElementById('transkrip-list');
    
    if (data.transkrip.length === 0) {
      transkripList.innerHTML = '<p>Belum ada data nilai</p>';
      return;
    }
    
    transkripList.innerHTML = data.transkrip.map(semester => `
      <div class="semester-card">
        <h4>${semester.tahun_ajaran} - ${semester.semester}</h4>
        <p>Kelas: ${semester.kelas}</p>
        <table class="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Mata Pelajaran</th>
              <th>Nilai</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${semester.nilai_mapel.map((nilai, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${nilai.mapel}</td>
                <td>${nilai.nilai_akhir}</td>
                <td><span class="badge grade-${nilai.grade}">${nilai.grade}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');
    
  } catch (error) {
    alert('Gagal mengambil transkrip: ' + error.message);
  }
};
</script>
```

---

---

### 3. GET /api/admin/laporan/transkrip/:siswa_id/pdf

**Deskripsi:** Download transkrip nilai dalam format PDF

#### Request
```
GET /api/admin/laporan/transkrip/:siswa_id/pdf
Authorization: Bearer <token>
```

#### Authorization
- ✅ JWT Token required (role: admin)

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `siswa_id` | integer | Yes | ID siswa yang akan didownload transkripnya |

#### Response (200 - Success)

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="Transkrip_Ahmad_Rizki_1111111111.pdf"`
- **Body:** PDF Binary Data

#### Response Headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | `application/pdf` | Tipe konten PDF |
| `Content-Disposition` | `attachment; filename="..."` | Nama file download |
| `Content-Length` | `{size}` | Ukuran file dalam bytes |

#### Filename Format

Format nama file: `Transkrip_{Nama_Siswa}_{NISN}.pdf`

**Contoh:**
- `Transkrip_Ahmad_Rizki_1111111111.pdf`
- `Transkrip_Siti_Nurhaliza_2222222222.pdf`

#### PDF Content Structure

**Header (Kop Surat):**
- Logo sekolah (left)
- Nama: TRANSKRIP NILAI SISWA (center)
- Nama sekolah: SDN 1 LANGENSARI (center)
- Alamat sekolah (center)
- Horizontal line separator

**Sections:**

1. **IDENTITAS SISWA**
   - Nama Lengkap
   - NISN
   - Kelas Saat Ini
   - Tempat, Tanggal Lahir
   - Nama Orang Tua/Wali

2. **RIWAYAT NILAI PER SEMESTER** (Diurutkan terbaru duluan)
   
   Untuk setiap semester:
   - Header: Tahun Ajaran - Semester (e.g., "2027/2028 - Semester Genap")
   - Kelas pada semester tersebut
   
   **Absensi Box:**
   - Hadir: X hari
   - Sakit: X hari
   - Izin: X hari
   - Alpha: X hari
   
   **Tabel Nilai:**
   - Kolom: No | Mata Pelajaran | Nilai | Grade
   - Grade dengan warna:
     - A: Hijau
     - B: Biru
     - C: Orange
     - D: Merah

**Footer:**
- Nomor halaman (kanan bawah)
- Tanggal cetak (kanan bawah)

#### Business Logic

1. **Validation:**
   - Check `siswa_id` dari path parameter
   - Jika tidak ada, return 400 Bad Request

2. **Get Transkrip Data:**
   - Reuse `getTranskripNilaiService` untuk mendapatkan semua data
   - Jika siswa tidak ditemukan, return 404 Not Found

3. **Generate PDF:**
   - Load logo sekolah dari `assets/logo-sekolah.png`
   - Convert logo ke Base64
   - Render HTML dari template EJS (`transkrip-nilai.ejs`)
   - Launch Puppeteer browser
   - Generate PDF dengan header & footer
   - Return PDF buffer

4. **Create Filename:**
   - Format: `Transkrip_{nama}_{nisn}.pdf`
   - Replace spaces dengan underscore

5. **Set Response Headers:**
   - Content-Type: application/pdf
   - Content-Disposition: attachment
   - Content-Length: buffer size

6. **Send PDF:**
   - Send buffer directly ke response

#### Error Responses

**400 Bad Request** (Missing siswa_id)
```json
{
  "success": false,
  "message": "Parameter siswa_id wajib diisi",
  "data": null
}
```

**404 Not Found** (Siswa tidak ditemukan)
```json
{
  "success": false,
  "message": "Data transkrip tidak ditemukan"
}
```

**500 Internal Server Error** (PDF generation failed)
```json
{
  "success": false,
  "message": "Gagal generate PDF",
  "error": "Error details..."
}
```

---

## 🧪 Testing Guide - Download PDF

### Test Case 1: Download PDF Transkrip ✅

**Scenario:** Admin download transkrip nilai siswa dalam PDF

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/transkrip/19/pdf" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output transkrip.pdf
```

**Expected Result:**
- Status: 200 OK
- Content-Type: application/pdf
- File PDF terdownload dengan nama `Transkrip_Ahmad_Rizki_1111111111.pdf`
- PDF berisi identitas siswa, riwayat nilai per semester, absensi, dan grade

---

### Test Case 2: Siswa Tidak Ditemukan ❌

**Scenario:** Download PDF untuk siswa yang tidak ada

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/laporan/transkrip/99999/pdf" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Result:**
- Status: 404 Not Found
- Error message: "Data transkrip tidak ditemukan"

---

## 📝 Frontend Implementation Example - Download PDF

### JavaScript (Fetch API)

```javascript
/**
 * Download transkrip PDF
 */
const downloadTranskripPDF = async (siswaId) => {
  try {
    const response = await fetch(`/api/admin/laporan/transkrip/${siswaId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal download PDF');
    }
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'Transkrip.pdf';
    
    // Convert response to blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert('PDF berhasil diunduh!');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal download PDF: ' + error.message);
  }
};

// Usage Example
downloadTranskripPDF(19);
```

### HTML Button Example

```html
<button onclick="downloadTranskripPDF(19)" class="btn btn-primary">
  <i class="fas fa-download"></i> Download PDF
</button>
```

---

## 📚 Related Endpoints

Endpoint ini dapat dikombinasikan dengan endpoint lain untuk membuat fitur laporan yang lengkap:

- `GET /api/admin/kelas` - Untuk mendapatkan daftar kelas (filter dropdown)
- `GET /api/admin/tahun-ajaran` - Untuk mendapatkan daftar tahun ajaran (filter dropdown)
- `GET /api/admin/laporan/siswa` - Daftar siswa yang sudah memiliki nilai
- `GET /api/admin/laporan/transkrip/:siswa_id` - Transkrip nilai lengkap siswa (JSON)
- `GET /api/admin/laporan/transkrip/:siswa_id/pdf` - Download transkrip nilai (PDF)
- `GET /api/admin/laporan/absensi` - (Future) Laporan absensi siswa
