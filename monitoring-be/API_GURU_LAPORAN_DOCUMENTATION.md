# 📊 API Documentation - Laporan Perkembangan Siswa

## Overview
API untuk halaman **Laporan Perkembangan Siswa** (Role: Guru Wali Kelas)

### Base URL
```
/api/guru/laporan
```

### Authentication
- Bearer Token (JWT)
- Role: `guru`
- **Special Authorization:** Hanya Wali Kelas yang dapat mengakses halaman ini

---

## 🔐 Authorization Logic

### Wali Kelas ✅
- Guru yang ditugaskan sebagai wali kelas (`kelas.wali_kelas_id = guru_id`)
- Dapat mengakses laporan untuk **semua siswa di kelasnya**
- Dapat melihat nilai dari **semua mata pelajaran** (termasuk yang diajar guru lain)
- Dapat melihat **semua catatan** dari guru lain
- Dapat generate **PDF Laporan Perkembangan**

### Guru Mapel (Non Wali Kelas) ❌
- **403 Forbidden** - Tidak dapat mengakses halaman ini
- Error message: `"Anda tidak memiliki akses sebagai wali kelas"`
- Frontend harus hide menu "Laporan" untuk Guru Mapel

---

## 📋 API Endpoints

### 1. GET /api/guru/laporan/kelas-wali

**Deskripsi:** Get info kelas yang di-wali oleh guru (untuk header halaman)

#### Request
```
GET /api/guru/laporan/kelas-wali
Authorization: Bearer <token>
```

#### Authorization
- ✅ JWT Token required (role: guru)
- ✅ Must be Wali Kelas
- ❌ Guru Mapel akan dapat 403 Forbidden

#### Query Parameters
None

#### Response (200 - Success)
```json
{
  "status": "success",
  "data": {
    "kelas_id": 17,
    "nama_kelas": "5A",
    "tahun_ajaran": "2027/2028",
    "semester": "Genap"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `kelas_id` | Integer | ID kelas yang di-wali |
| `nama_kelas` | String | Nama kelas (e.g., "5A", "6B") |
| `tahun_ajaran` | String | Tahun ajaran aktif (e.g., "2024/2025") |
| `semester` | String | Semester aktif ("Ganjil" / "Genap") |

#### Business Logic

1. **Extract guru_id dari JWT token:**
   ```javascript
   const guruId = req.user.guru_id;
   ```

2. **Check apakah guru adalah wali kelas:**
   ```sql
   SELECT COUNT(*) AS count
   FROM kelas k
   WHERE k.wali_kelas_id = ?
     AND k.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
   ```
   - Jika `count = 0` → 403 Forbidden

3. **Get kelas info:**
   ```sql
   SELECT 
     k.id AS kelas_id,
     k.nama_kelas,
     ta.tahun AS tahun_ajaran,
     ta.semester
   FROM kelas k
   JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
   WHERE k.wali_kelas_id = ?
     AND ta.status = 'aktif'
   LIMIT 1
   ```

4. **Return single kelas info**

#### Error Responses

**401 Unauthorized** (Token invalid/expired)
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

**403 Forbidden** (Guru Mapel trying to access)
```json
{
  "status": "error",
  "message": "Anda tidak memiliki akses sebagai wali kelas",
  "code": 403
}
```

**404 Not Found** (Guru belum ditugaskan sebagai wali kelas)
```json
{
  "status": "error",
  "message": "Anda belum ditugaskan sebagai wali kelas",
  "data": null
}
```

#### Frontend Implementation

```javascript
// Call on page load
const fetchKelasWali = async () => {
  try {
    const response = await axios.get('/api/guru/laporan/kelas-wali', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Display in header
    const { kelas_id, nama_kelas, tahun_ajaran, semester } = response.data.data;
    
    document.getElementById('header-title').innerText = 
      `Laporan Perkembangan Siswa - Kelas ${nama_kelas}`;
    document.getElementById('tahun-ajaran').innerText = 
      `${tahun_ajaran} ${semester}`;
      
  } catch (error) {
    if (error.response?.status === 403) {
      // Redirect to dashboard atau show 403 page
      alert('Anda tidak memiliki akses sebagai wali kelas');
      window.location.href = '/guru/dashboard';
    }
  }
};
```

---

### 2. GET /api/guru/laporan/siswa

**Deskripsi:** Get daftar siswa di kelas wali (untuk dropdown select siswa)

#### Request
```
GET /api/guru/laporan/siswa?kelas_id=17
Authorization: Bearer <token>
```

#### Authorization
- ✅ JWT Token required (role: guru)
- ✅ Must be Wali Kelas of the specified kelas
- ❌ Guru Mapel atau Wali Kelas dari kelas lain akan dapat 403 Forbidden

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `kelas_id` | Number | ✅ Yes | ID kelas yang di-wali |

#### Response (200 - Success)
```json
{
  "status": "success",
  "data": [
    {
      "siswa_id": 1,
      "nama": "Ahmad Fauzi",
      "nisn": "1234567890"
    },
    {
      "siswa_id": 2,
      "nama": "Siti Aminah",
      "nisn": "0987654321"
    },
    {
      "siswa_id": 3,
      "nama": "Budi Santoso",
      "nisn": "1122334455"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `siswa_id` | Integer | ID siswa |
| `nama` | String | Nama lengkap siswa |
| `nisn` | String | NISN siswa |

#### Business Logic

1. **Validation:**
   - Check `kelas_id` ada di query params
   - Check guru adalah wali kelas dari `kelas_id` tersebut

2. **Authorization Check:**
   ```sql
   SELECT COUNT(*) AS count
   FROM kelas k
   WHERE k.id = ?
     AND k.wali_kelas_id = ?
     AND k.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
   ```
   - Jika `count = 0` → 403 Forbidden

3. **Get Siswa List:**
   ```sql
   SELECT 
     s.id AS siswa_id,
     s.nama_lengkap AS nama,
     s.nisn
   FROM siswa s
   JOIN kelas_siswa ks ON s.id = ks.siswa_id
   WHERE ks.kelas_id = ?
     AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
   ORDER BY s.nama_lengkap ASC
   ```

4. **Return list siswa** (sorted by name)

#### Error Responses

**400 Bad Request** (Missing kelas_id)
```json
{
  "status": "error",
  "message": "Parameter kelas_id wajib diisi",
  "data": null
}
```

**401 Unauthorized** (Token invalid)
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

**403 Forbidden** (Bukan wali kelas dari kelas ini)
```json
{
  "status": "error",
  "message": "Anda bukan wali kelas dari kelas ini",
  "data": null
}
```

**404 Not Found** (Kelas tidak ada siswa)
```json
{
  "status": "error",
  "message": "Tidak ada siswa di kelas ini",
  "data": null
}
```

#### Frontend Implementation

```javascript
// Get siswa list for dropdown
const fetchSiswaList = async (kelasId) => {
  try {
    const response = await axios.get('/api/guru/laporan/siswa', {
      params: { kelas_id: kelasId },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const siswaList = response.data.data;
    
    // Populate dropdown
    const dropdown = document.getElementById('siswa-dropdown');
    dropdown.innerHTML = '<option value="">-- Pilih Siswa --</option>';
    
    siswaList.forEach(siswa => {
      const option = document.createElement('option');
      option.value = siswa.siswa_id;
      option.text = `${siswa.nama} (${siswa.nisn})`;
      dropdown.appendChild(option);
    });
    
  } catch (error) {
    if (error.response?.status === 403) {
      alert('Anda bukan wali kelas dari kelas ini');
    } else if (error.response?.status === 404) {
      alert('Tidak ada siswa di kelas ini');
    }
  }
};
```

---

### 3. GET /api/guru/laporan/perkembangan

**Deskripsi:** Get data lengkap perkembangan siswa (nilai, absensi, catatan) - **ENDPOINT KOMPLEKS**

#### Request
```
GET /api/guru/laporan/perkembangan?siswa_id=1
Authorization: Bearer <token>
```

#### Authorization
- ✅ JWT Token required (role: guru)
- ✅ Must be Wali Kelas of the student's class
- ❌ Guru Mapel atau Wali Kelas dari kelas lain akan dapat 403 Forbidden

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `siswa_id` | Number | ✅ Yes | ID siswa yang akan digenerate laporannya |

#### Response (200 - Success)
```json
{
  "status": "success",
  "data": {
    "siswa": {
      "siswa_id": 1,
      "nama": "Ahmad Fauzi",
      "nisn": "1234567890",
      "kelas": "5A",
      "nama_ortu": "Bapak Ahmad bin Fauzi"
    },
    "nilai_akademik": [
      {
        "mapel_id": 1,
        "nama_mapel": "Matematika",
        "nilai_akhir": 88.5,
        "grade": "B+"
      },
      {
        "mapel_id": 2,
        "nama_mapel": "Bahasa Indonesia",
        "nilai_akhir": 92.0,
        "grade": "A"
      },
      {
        "mapel_id": 3,
        "nama_mapel": "IPA",
        "nilai_akhir": null,
        "grade": null
      }
    ],
    "absensi": {
      "hadir": 120,
      "sakit": 2,
      "izin": 1,
      "alpha": 0
    },
    "catatan_perkembangan": [
      {
        "catatan_id": 15,
        "guru_nama": "Budi Santoso",
        "mapel_nama": "Matematika",
        "kategori": "Positif",
        "jenis": "Akademik",
        "tanggal": "27/10/2025",
        "isi_catatan": "Sangat aktif dalam diskusi kelompok. Menunjukkan pemahaman yang baik."
      },
      {
        "catatan_id": 14,
        "guru_nama": "Siti Nurhaliza",
        "mapel_nama": "Bahasa Indonesia",
        "kategori": "Negatif",
        "jenis": "Akademik",
        "tanggal": "25/10/2025",
        "isi_catatan": "Perlu lebih fokus saat mengerjakan tugas menulis."
      },
      {
        "catatan_id": 13,
        "guru_nama": "Andi Wijaya",
        "mapel_nama": "Umum",
        "kategori": "Positif",
        "jenis": "Perilaku",
        "tanggal": "20/10/2025",
        "isi_catatan": "Siswa menunjukkan sikap yang baik di kelas."
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
| `kelas` | String | Nama kelas (e.g., "5A") |
| `nama_ortu` | String | Nama orang tua (ayah/ibu) |

**Nilai Akademik Array:**
| Field | Type | Description |
|-------|------|-------------|
| `mapel_id` | Integer | ID mata pelajaran |
| `nama_mapel` | String | Nama mata pelajaran |
| `nilai_akhir` | Float/Null | Nilai akhir (calculated by trigger), null jika belum ada nilai |
| `grade` | String/Null | Grade (A, B, C, D), null jika belum ada nilai |

**Absensi Object:**
| Field | Type | Description |
|-------|------|-------------|
| `hadir` | Integer | Jumlah kehadiran |
| `sakit` | Integer | Jumlah sakit |
| `izin` | Integer | Jumlah izin |
| `alpha` | Integer | Jumlah alpha |

**Catatan Perkembangan Array:**
| Field | Type | Description |
|-------|------|-------------|
| `catatan_id` | Integer | ID catatan |
| `guru_nama` | String | Nama guru pembuat catatan |
| `mapel_nama` | String | Nama mata pelajaran, "Umum" jika catatan umum |
| `kategori` | String | Kategori catatan: "Positif", "Negatif", "Netral" |
| `jenis` | String | Jenis catatan: "Akademik", "Perilaku", "Kehadiran", "Prestasi", "Lainnya" |
| `tanggal` | String | Tanggal catatan (format: DD/MM/YYYY) |
| `isi_catatan` | String | Isi catatan |

#### Business Logic

**Step 1: Verify Authorization**
```sql
-- Check if guru is wali kelas of this student
SELECT k.id AS kelas_id 
FROM kelas k
JOIN kelas_siswa ks ON k.id = ks.kelas_id
WHERE k.wali_kelas_id = ? 
  AND ks.siswa_id = ?
  AND k.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
  AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
LIMIT 1
```

**Step 2: Get Siswa Data**
```sql
SELECT 
  s.id AS siswa_id,
  s.nama_lengkap AS nama,
  s.nisn,
  k.nama_kelas AS kelas,
  COALESCE(
    (SELECT o.nama_lengkap 
     FROM orangtua_siswa os 
     JOIN orangtua o ON os.orangtua_id = o.id 
     WHERE os.siswa_id = s.id 
     LIMIT 1),
    'Tidak Ada Data'
  ) AS nama_ortu
FROM siswa s
JOIN kelas_siswa ks ON s.id = ks.siswa_id
JOIN kelas k ON ks.kelas_id = k.id
WHERE s.id = ?
  AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
LIMIT 1
```

**Step 3: Get Nilai Akademik (All Mapel)**
```sql
SELECT 
  m.id AS mapel_id,
  m.nama_mapel,
  n.nilai_akhir,
  CASE 
    WHEN n.nilai_akhir >= 85 THEN 'A'
    WHEN n.nilai_akhir >= 70 THEN 'B'
    WHEN n.nilai_akhir >= 55 THEN 'C'
    ELSE 'D'
  END AS grade
FROM kelas_mapel km
JOIN mapel m ON km.mapel_id = m.id
LEFT JOIN nilai n ON (
  n.siswa_id = ? 
  AND n.kelas_id = km.kelas_id 
  AND n.mapel_id = km.mapel_id
  AND n.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
  AND n.semester = (SELECT semester FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
)
WHERE km.kelas_id = ?
  AND km.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
ORDER BY m.nama_mapel ASC
```

**Grade Mapping (4 Levels):**
```
A: >= 85
B: >= 70
C: >= 55
D: < 55
```

**Notes:**
- `LEFT JOIN` with `nilai` table → Siswa tanpa nilai di mapel tertentu akan return `nilai_akhir: null`, `grade: null`
- Menampilkan **semua mapel** yang ada di kelas, termasuk yang belum ada nilainya

**Step 4: Get Rekapitulasi Absensi**
```sql
SELECT 
  COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) AS hadir,
  COUNT(CASE WHEN a.status = 'Sakit' THEN 1 END) AS sakit,
  COUNT(CASE WHEN a.status = 'Izin' THEN 1 END) AS izin,
  COUNT(CASE WHEN a.status = 'Alpha' THEN 1 END) AS alpha
FROM absensi a
WHERE a.siswa_id = ? 
  AND a.kelas_id = (
    SELECT ks.kelas_id 
    FROM kelas_siswa ks 
    WHERE ks.siswa_id = ? 
      AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
    LIMIT 1
  )
```

**Note:** Tabel `absensi` tidak memiliki `tahun_ajaran_id`/`semester`, jadi kita filter berdasarkan `kelas_id` dari semester aktif.

**Step 5: Get Catatan Perkembangan**
```sql
SELECT 
  ch.id AS catatan_id,
  g.nama_lengkap AS guru_nama,
  COALESCE(m.nama_mapel, 'Umum') AS mapel_nama,
  ch.kategori,
  ch.jenis,
  DATE_FORMAT(ch.created_at, '%d/%m/%Y') AS tanggal,
  (SELECT cd_first.pesan 
   FROM catatan_detail cd_first 
   WHERE cd_first.header_id = ch.id 
   ORDER BY cd_first.created_at ASC 
   LIMIT 1) AS isi_catatan
FROM catatan_header ch
JOIN guru g ON ch.guru_id = g.id
LEFT JOIN mapel m ON ch.mapel_id = m.id
WHERE ch.siswa_id = ? 
  AND ch.kelas_id IN (
    SELECT ks.kelas_id 
    FROM kelas_siswa ks 
    WHERE ks.siswa_id = ? 
      AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
  )
ORDER BY ch.created_at DESC
LIMIT 10
```

**Notes:**
- Menggunakan tabel `catatan_header` dan `catatan_detail` (structure baru)
- Menampilkan **10 catatan terbaru** (header)
- Catatan tanpa mapel (catatan umum) → `mapel_nama: "Umum"`
- Sort by created_at terbaru duluan
- Include catatan dari **semua guru** (bukan hanya wali kelas)
- Menggunakan **subquery** untuk ambil pesan pertama dari setiap thread catatan
- Support multiple kelas jika siswa ada di lebih dari 1 kelas (rare case)

#### Error Responses

**400 Bad Request** (Missing siswa_id)
```json
{
  "status": "error",
  "message": "Parameter siswa_id wajib diisi",
  "data": null
}
```

**401 Unauthorized** (Token invalid)
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

**403 Forbidden** (Bukan wali kelas dari siswa ini)
```json
{
  "status": "error",
  "message": "Anda bukan wali kelas dari siswa ini",
  "data": null
}
```

**404 Not Found** (Siswa tidak ditemukan)
```json
{
  "status": "error",
  "message": "Data siswa tidak ditemukan",
  "data": null
}
```

#### Frontend Implementation

```javascript
// Get perkembangan siswa
const fetchPerkembanganSiswa = async (siswaId) => {
  try {
    const response = await axios.get('/api/guru/laporan/perkembangan', {
      params: { siswa_id: siswaId },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = response.data.data;
    
    // Display siswa info
    document.getElementById('siswa-nama').innerText = data.siswa.nama;
    document.getElementById('siswa-nisn').innerText = data.siswa.nisn;
    document.getElementById('siswa-kelas').innerText = data.siswa.kelas;
    document.getElementById('siswa-ortu').innerText = data.siswa.nama_ortu;
    
    // Display nilai akademik
    const nilaiTable = document.getElementById('nilai-table');
    data.nilai_akademik.forEach(nilai => {
      const row = `
        <tr>
          <td>${nilai.nama_mapel}</td>
          <td>${nilai.nilai_akhir || '-'}</td>
          <td>${nilai.grade || '-'}</td>
        </tr>
      `;
      nilaiTable.innerHTML += row;
    });
    
    // Display absensi
    document.getElementById('absen-hadir').innerText = data.absensi.hadir;
    document.getElementById('absen-sakit').innerText = data.absensi.sakit;
    document.getElementById('absen-izin').innerText = data.absensi.izin;
    document.getElementById('absen-alpha').innerText = data.absensi.alpha;
    
    // Display catatan
    const catatanList = document.getElementById('catatan-list');
    data.catatan_perkembangan.forEach(catatan => {
      const item = `
        <div class="catatan-item">
          <p><strong>${catatan.guru_nama}</strong> - ${catatan.mapel_nama}</p>
          <p>${catatan.tanggal}: ${catatan.isi_catatan}</p>
        </div>
      `;
      catatanList.innerHTML += item;
    });
    
  } catch (error) {
    if (error.response?.status === 403) {
      alert('Anda bukan wali kelas dari siswa ini');
    } else if (error.response?.status === 404) {
      alert('Data siswa tidak ditemukan');
    }
  }
};
```

---

### 4. POST /api/guru/laporan/download-perkembangan

**Deskripsi:** Download PDF Laporan Perkembangan Siswa

#### Authorization
- ✅ JWT Token required (role: guru)
- ✅ Must be Wali Kelas of the student's class

#### Request Body
```json
{
  "siswa_id": 19,
  "catatan_wali_kelas": "Ahmad Rizki menunjukkan perkembangan yang sangat baik selama semester ini. Prestasi akademiknya meningkat signifikan dan sikapnya di kelas sangat positif. Diharapkan dapat mempertahankan semangat belajarnya."
}
```

#### Request Body Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `siswa_id` | Number | ✅ Yes | ID siswa yang akan digenerate laporannya |
| `catatan_wali_kelas` | String | ✅ Yes | Catatan/kesimpulan umum dari wali kelas tentang perkembangan siswa |

#### Response (200 - Success)
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="Laporan_Perkembangan_Ahmad_Rizki_5A.pdf"`
- **Body:** Binary PDF data

#### PDF Content Structure

**Header:**
- Logo sekolah (left)
- Nama sekolah: SDN 1 Langensari (center)
- Alamat sekolah (center)
- Horizontal line separator

**Title:**
- "LAPORAN PERKEMBANGAN SISWA" (centered)
- Tahun Ajaran & Semester (centered)

**Sections:**

1. **IDENTITAS SISWA**
   - Nama: [Nama Lengkap]
   - NISN: [NISN]
   - Kelas: [Nama Kelas]
   - Orang Tua: [Nama Orang Tua]

2. **REKAPITULASI ABSENSI**
   - Hadir: X hari
   - Sakit: X hari
   - Izin: X hari
   - Alpha: X hari

3. **NILAI AKADEMIK**
   - List semua mata pelajaran dengan nilai akhir dan grade
   - Format: "1. Matematika: 88.5 (B)"
   - Mapel tanpa nilai akan ditampilkan: "- (-)"

4. **CATATAN PERKEMBANGAN**
   - Menampilkan 5 catatan terbaru
   - Format: "[Tanggal] - [Guru Nama] ([Mapel])"
   - Isi catatan di baris berikutnya
   - Jika tidak ada catatan: "Belum ada catatan perkembangan."

5. **CATATAN WALI KELAS**
   - Catatan umum/kesimpulan dari wali kelas
   - Text justified, multi-line

**Footer:**
- Tanggal (Garut, [DD MMMM YYYY])
- "Wali Kelas"
- Space untuk tanda tangan (60pt)
- Nama Wali Kelas (underlined)
- NIP Wali Kelas

#### Business Logic

**Step 1: Validation**
```javascript
// Check guru_id from JWT
if (!guruId) throw new Error('Guru ID tidak ditemukan')

// Check siswa_id
if (!siswa_id) throw new Error('Siswa ID wajib diisi')

// Check catatan_wali_kelas
if (!catatan_wali_kelas || catatan_wali_kelas.trim() === '') {
  throw new Error('Catatan wali kelas wajib diisi')
}
```

**Step 2: Reuse getPerkembanganSiswaService**
```javascript
// Get all data (siswa, nilai, absensi, catatan)
const perkembanganData = await getPerkembanganSiswaService(guruId, siswaId)
```
- Automatically checks if guru is wali kelas of this student
- Returns complete data structure

**Step 3: Get Guru & Tahun Ajaran Info**
```javascript
const guru = await laporanModel.getGuruById(guruId)
const tahunAjaran = await laporanModel.getTahunAjaranAktif()
```

**Step 4: Generate PDF using PDFKit**
```javascript
const doc = new PDFDocument({
  size: 'A4',
  layout: 'portrait',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
})
```

**Step 5: Create Filename**
```javascript
// Format: Laporan_Perkembangan_[Nama_Siswa]_[Kelas].pdf
const siswaName = perkembanganData.siswa.nama.replace(/\s+/g, '_')
const kelasName = perkembanganData.siswa.kelas.replace(/\s+/g, '_')
const filename = `Laporan_Perkembangan_${siswaName}_${kelasName}.pdf`
```

**Example Filenames:**
- `Laporan_Perkembangan_Ahmad_Rizki_5A.pdf`
- `Laporan_Perkembangan_Siti_Aminah_5B.pdf`

**Step 6: Set Response Headers & Stream PDF**
```javascript
res.setHeader('Content-Type', 'application/pdf')
res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
pdfDoc.pipe(res)
pdfDoc.end()
```

#### Error Responses

**400 Bad Request** (Missing siswa_id)
```json
{
  "status": "error",
  "message": "Parameter siswa_id wajib diisi",
  "data": null
}
```

**400 Bad Request** (Missing catatan_wali_kelas)
```json
{
  "status": "error",
  "message": "Catatan wali kelas wajib diisi",
  "data": null
}
```

**401 Unauthorized**
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

**403 Forbidden** (Bukan Wali Kelas dari siswa)
```json
{
  "status": "error",
  "message": "Anda bukan wali kelas dari siswa ini",
  "data": null
}
```

**404 Not Found** (Siswa tidak ditemukan)
```json
{
  "status": "error",
  "message": "Data siswa tidak ditemukan",
  "data": null
}
```

#### Frontend Implementation Example

```javascript
/**
 * Download PDF Laporan Perkembangan
 */
const downloadPDFPerkembangan = async (siswaId, catatanWaliKelas) => {
  try {
    const response = await fetch('/api/guru/laporan/download-perkembangan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        siswa_id: siswaId,
        catatan_wali_kelas: catatanWaliKelas
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'Laporan_Perkembangan.pdf';

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
    console.error('Error downloading PDF:', error);
    alert(`Gagal mengunduh PDF: ${error.message}`);
  }
};

// Usage example with form
const handleDownloadPDF = () => {
  const siswaId = document.getElementById('siswa-select').value;
  const catatan = document.getElementById('catatan-wali-kelas').value;

  if (!siswaId) {
    alert('Pilih siswa terlebih dahulu');
    return;
  }

  if (!catatan || catatan.trim() === '') {
    alert('Catatan wali kelas wajib diisi');
    return;
  }

  downloadPDFPerkembangan(parseInt(siswaId), catatan);
};
```

**HTML Form Example:**
```html
<div class="laporan-container">
  <h3>Download Laporan Perkembangan Siswa</h3>
  
  <div class="form-group">
    <label>Pilih Siswa:</label>
    <select id="siswa-select" class="form-control">
      <option value="">-- Pilih Siswa --</option>
      <!-- Populated from /api/guru/laporan/siswa -->
    </select>
  </div>

  <div class="form-group">
    <label>Catatan Wali Kelas: <span class="required">*</span></label>
    <textarea 
      id="catatan-wali-kelas" 
      class="form-control" 
      rows="5"
      placeholder="Tuliskan kesimpulan umum tentang perkembangan siswa selama semester ini..."
      required
    ></textarea>
    <small class="form-text text-muted">
      Catatan ini akan muncul di bagian akhir laporan PDF.
    </small>
  </div>

  <button onclick="handleDownloadPDF()" class="btn btn-primary">
    <i class="fas fa-download"></i> Download PDF
  </button>
</div>
```

---

## 🧪 Testing Guide

### Test Case 1: Wali Kelas Access ✅

**Scenario:** Wali Kelas mengakses halaman Laporan

**Steps:**
1. Login sebagai Guru yang adalah Wali Kelas (e.g., guru_id = 2)
2. GET `/api/guru/laporan/kelas-wali`

**Expected Result:**
```json
{
  "status": "success",
  "data": {
    "kelas_id": 17,
    "nama_kelas": "5A",
    "tahun_ajaran": "2027/2028",
    "semester": "Genap"
  }
}
```

**Test with cURL:**
```bash
curl -X GET "http://localhost:5000/api/guru/laporan/kelas-wali" \
  -H "Authorization: Bearer YOUR_WALI_KELAS_TOKEN"
```

---

### Test Case 2: Guru Mapel Access ❌

**Scenario:** Guru Mapel (bukan Wali Kelas) trying to access

**Steps:**
1. Login sebagai Guru Mapel (e.g., guru_id = 3 yang BUKAN wali kelas)
2. GET `/api/guru/laporan/kelas-wali`

**Expected Result:**
```json
{
  "status": "error",
  "message": "Anda tidak memiliki akses sebagai wali kelas",
  "code": 403
}
```

**HTTP Status:** 403 Forbidden

**Test with cURL:**
```bash
curl -X GET "http://localhost:5000/api/guru/laporan/kelas-wali" \
  -H "Authorization: Bearer YOUR_GURU_MAPEL_TOKEN"
```

---

### Test Case 3: New Guru (Belum Ditugaskan) ❌

**Scenario:** Guru baru yang belum ditugaskan sebagai wali kelas

**Steps:**
1. Login sebagai Guru baru (e.g., guru_id = 10)
2. GET `/api/guru/laporan/kelas-wali`

**Expected Result:**
```json
{
  "status": "error",
  "message": "Anda belum ditugaskan sebagai wali kelas",
  "data": null
}
```

**HTTP Status:** 404 Not Found

---

### Test Case 4: Get Siswa List (Wali Kelas) ✅

**Scenario:** Wali Kelas get list siswa di kelasnya

**Steps:**
1. Login sebagai Wali Kelas (guru_id = 2, kelas_id = 17)
2. GET `/api/guru/laporan/siswa?kelas_id=17`

**Expected Result:**
```json
{
  "status": "success",
  "data": [
    {
      "siswa_id": 1,
      "nama": "Ahmad Fauzi",
      "nisn": "1234567890"
    },
    {
      "siswa_id": 2,
      "nama": "Siti Aminah",
      "nisn": "0987654321"
    }
  ]
}
```

**Test with cURL:**
```bash
curl -X GET "http://localhost:5000/api/guru/laporan/siswa?kelas_id=17" \
  -H "Authorization: Bearer YOUR_WALI_KELAS_TOKEN"
```

---

### Test Case 5: Get Siswa List (Wrong Kelas) ❌

**Scenario:** Wali Kelas mencoba get siswa dari kelas lain

**Steps:**
1. Login sebagai Wali Kelas dari Kelas 5A (guru_id = 2, kelas_id = 17)
2. GET `/api/guru/laporan/siswa?kelas_id=18` (Kelas 5B - bukan kelas dia)

**Expected Result:**
```json
{
  "status": "error",
  "message": "Anda bukan wali kelas dari kelas ini",
  "data": null
}
```

**HTTP Status:** 403 Forbidden

---

### Test Case 6: Get Siswa List (Missing kelas_id) ❌

**Scenario:** Request tanpa kelas_id

**Steps:**
1. Login sebagai Wali Kelas
2. GET `/api/guru/laporan/siswa` (tanpa query param)

**Expected Result:**
```json
{
  "status": "error",
  "message": "Parameter kelas_id wajib diisi",
  "data": null
}
```

**HTTP Status:** 400 Bad Request

---

###Test Case 7: Get Perkembangan Siswa (Success) ✅

**Scenario:** Wali Kelas get perkembangan siswa lengkap

**Steps:**
1. Login sebagai Wali Kelas (guru_id = 2, kelas_id = 17)
2. GET `/api/guru/laporan/perkembangan?siswa_id=1`

**Expected Result:**
```json
{
  "status": "success",
  "data": {
    "siswa": {
      "siswa_id": 1,
      "nama": "Ahmad Fauzi",
      "nisn": "1234567890",
      "kelas": "5A",
      "nama_ortu": "Bapak Ahmad bin Fauzi"
    },
    "nilai_akademik": [...],
    "absensi": {...},
    "catatan_perkembangan": [...]
  }
}
```

**Test with cURL:**
```bash
curl -X GET "http://localhost:5000/api/guru/laporan/perkembangan?siswa_id=1" \
  -H "Authorization: Bearer YOUR_WALI_KELAS_TOKEN"
```

---

### Test Case 8: Get Perkembangan (Wrong Siswa) ❌

**Scenario:** Wali Kelas 5A mencoba get perkembangan siswa dari kelas 5B

**Steps:**
1. Login sebagai Wali Kelas 5A (guru_id = 2)
2. GET `/api/guru/laporan/perkembangan?siswa_id=10` (Siswa dari kelas 5B)

**Expected Result:**
```json
{
  "status": "error",
  "message": "Anda bukan wali kelas dari siswa ini",
  "data": null
}
```

**HTTP Status:** 403 Forbidden

---

### Test Case 9: Download PDF (Wali Kelas) ✅

**Scenario:** Wali Kelas download PDF laporan nilai

**Steps:**
1. Login sebagai Wali Kelas (guru_id = 2, kelas_id = 17)
2. POST `/api/guru/laporan/download-pdf`
3. Body: `{ "kelas_id": 17, "mapel_id": 1 }`

**Expected Result:**
- HTTP Status: 200 OK
- Content-Type: application/pdf
- File downloaded: `Laporan_Nilai_5A_Matematika_2027-2028.pdf`

**Test with cURL:**
```bash
curl -X POST "http://localhost:5000/api/guru/laporan/download-pdf" \
  -H "Authorization: Bearer YOUR_WALI_KELAS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"kelas_id": 17, "mapel_id": 1}' \
  --output laporan.pdf
```

---

### Test Case 10: Download PDF (Unauthorized Mapel) ❌

**Scenario:** Guru trying to download PDF untuk mapel yang tidak diajar

**Steps:**
1. Login sebagai Guru (guru_id = 3)
2. POST `/api/guru/laporan/download-pdf`
3. Body: `{ "kelas_id": 17, "mapel_id": 99 }` (mapel yang tidak diajar)

**Expected Result:**
```json
{
  "status": "error",
  "message": "Anda tidak mengampu mata pelajaran ini di kelas tersebut",
  "data": null
}
```

**HTTP Status:** 403 Forbidden

---

## 📁 File Structure

```
src/
├── routes/guru/
│   └── laporanRoutes.js          # Route definitions
├── controllers/guru/
│   └── laporanController.js      # Request handlers
├── services/guru/
│   └── laporanService.js         # Business logic
└── models/guru/
    └── laporanModel.js           # Database queries
```

---

## 🔄 Database Queries

### 1. Check if Guru is Wali Kelas
```sql
SELECT COUNT(*) AS count
FROM kelas k
WHERE k.wali_kelas_id = ?
  AND k.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
```

### 2. Get Kelas Wali Info
```sql
SELECT 
  k.id AS kelas_id,
  k.nama_kelas,
  ta.tahun AS tahun_ajaran,
  ta.semester
FROM kelas k
JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
WHERE k.wali_kelas_id = ?
  AND ta.status = 'aktif'
LIMIT 1
```

### 3. Check if Guru is Wali Kelas of Specific Kelas
```sql
SELECT COUNT(*) AS count
FROM kelas k
WHERE k.id = ?
  AND k.wali_kelas_id = ?
  AND k.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
```

### 4. Get List Siswa in Kelas
```sql
SELECT 
  s.id AS siswa_id,
  s.nama_lengkap AS nama,
  s.nisn
FROM siswa s
JOIN kelas_siswa ks ON s.id = ks.siswa_id
WHERE ks.kelas_id = ?
  AND ks.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
ORDER BY s.nama_lengkap ASC
```

### 5. Check Guru Mengampu Mapel di Kelas
```sql
SELECT COUNT(*) AS count
FROM kelas_mapel km
WHERE km.guru_id = ?
  AND km.kelas_id = ?
  AND km.mapel_id = ?
  AND km.tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1)
```

### 6. Get Rekap Nilai Siswa (for PDF)
```sql
SELECT 
  s.id AS siswa_id,
  s.nama_lengkap AS nama,
  s.nisn,
  n.lm1_tp1, n.lm1_tp2, ..., n.lm5_tp4,
  n.lm1_ulangan, n.lm2_ulangan, ..., n.lm5_ulangan,
  n.uts, n.uas,
  n.nilai_akhir
FROM siswa s
JOIN kelas_siswa ks ON s.id = ks.siswa_id
LEFT JOIN nilai n ON (
  s.id = n.siswa_id 
  AND n.kelas_id = ?
  AND n.mapel_id = ?
  AND n.tahun_ajaran_id = ?
  AND n.semester = ?
)
WHERE ks.kelas_id = ?
  AND ks.tahun_ajaran_id = ?
ORDER BY s.nama_lengkap ASC
```

---

## 🎨 Frontend Integration

### Page Structure

```
┌─────────────────────────────────────────────┐
│ Laporan Perkembangan Siswa - Kelas 5A      │
│ 2027/2028 Genap                             │
├─────────────────────────────────────────────┤
│                                             │
│ [Content from your new design]              │
│                                             │
│ ... (to be implemented) ...                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Initial Load Flow

```javascript
async function initPage() {
  try {
    // 1. Check if Wali Kelas
    const kelasInfo = await fetchKelasWali();
    
    // 2. Display header
    displayHeader(kelasInfo);
    
    // 3. Load page content (your new design)
    // ... to be implemented ...
    
  } catch (error) {
    if (error.response?.status === 403) {
      // Redirect to dashboard
      window.location.href = '/guru/dashboard';
    }
  }
}
```

---

## 📝 Notes

1. **Wali Kelas Only:** 
   - Halaman ini **HANYA** untuk Wali Kelas
   - Guru Mapel tidak bisa akses (403 Forbidden)
   - Frontend harus hide menu "Laporan" untuk Guru Mapel

2. **Active Semester:**
   - API hanya return data untuk tahun ajaran & semester **aktif**
   - Jika tidak ada semester aktif, return 404

3. **PDF Generation:**
   - PDF menggunakan stored `nilai_akhir` dari database (calculated by trigger)
   - Supporting values (rata_formatif, rata_sumatif_lm) calculated for display only
   - Grade mapping: A (85+), B (70-84), C (55-69), D (<55)

4. **Logo Sekolah:**
   - Logo path: `assets/logo-sekolah.png`
   - If logo not found, PDF will generate without logo (no error)

5. **Future Endpoints:**
   - This documentation will be extended as you add more endpoints for the new Laporan page design

---

## 🔧 Development

### Add New Endpoint (Example)

1. **Add model function** (`src/models/guru/laporanModel.js`)
2. **Add service function** (`src/services/guru/laporanService.js`)
3. **Add controller** (`src/controllers/guru/laporanController.js`)
4. **Add route** (`src/routes/guru/laporanRoutes.js`)
5. **Update this documentation**

---

## ✅ Changelog

### Version 1.2.0 (2025-11-05)
- ✅ Added `GET /api/guru/laporan/perkembangan` - Get data lengkap perkembangan siswa (COMPLEX ENDPOINT)
- ✅ Integration with 3 modules: Nilai, Absensi, Catatan
- ✅ Display all mapel (including those without grades)
- ✅ Show 10 most recent notes from all teachers
- ✅ Authorization: only Wali Kelas of student's class
- ✅ Complete error handling (400, 401, 403, 404)

### Version 1.1.0 (2025-11-05)
- ✅ Added `GET /api/guru/laporan/siswa` - Get list siswa in kelas wali
- ✅ Added authorization check: only Wali Kelas of specific kelas can access
- ✅ Added validation for kelas_id parameter
- ✅ Complete error handling for siswa endpoint (400, 401, 403, 404)

### Version 1.0.0 (2025-11-05)
- ✅ Removed old dropdown endpoints (kelas, mata-pelajaran)
- ✅ Removed old rekap nilai endpoint
- ✅ Added `GET /api/guru/laporan/kelas-wali` (Wali Kelas only)
- ✅ Kept `POST /api/guru/laporan/download-pdf` (with authorization check)
- ✅ Added strict Wali Kelas authorization
- ✅ Complete error handling (401, 403, 404)

---

**Last Updated:** 2025-11-05  
**API Version:** 1.2.0  
**Maintained by:** Backend Team

