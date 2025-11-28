# 📊 API Documentation - Dashboard Guru

## Overview
API untuk Dashboard Guru dengan fitur yang berbeda antara **Wali Kelas** dan **Guru Mapel**.

**Base URL:** `/api/guru/dashboard`

**Authentication:** Bearer Token (JWT) - Role: `guru`

---

## 🔐 Authorization Logic

### **Wali Kelas:**
- Guru yang menjadi wali kelas untuk satu kelas tertentu
- Dapat melihat **semua data siswa** di kelasnya (termasuk mapel yang diajar guru lain)
- Akses penuh ke fitur **Peringkat Siswa**

### **Guru Mapel:**
- Guru yang hanya mengajar mata pelajaran (bukan wali kelas)
- Dapat melihat data siswa dari **semua kelas** yang dia ajar
- **Tidak dapat** melihat **Peringkat Siswa** (403 Forbidden)
- Perlu **dropdown kelas** untuk fitur Kehadiran Hari Ini

---

## 📋 API Endpoints

### **1. GET /api/guru/dashboard/statistik-siswa**
Menampilkan summary cards: Total Siswa, Laki-laki, Perempuan.

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)

#### **Query Parameters:**
None

#### **Response (200 - Success):**
```json
{
  "status": "success",
  "data": {
    "total_siswa": 30,
    "laki_laki": 17,
    "perempuan": 13
  }
}
```

#### **Business Logic:**

**Wali Kelas:**
- Count siswa **hanya dari kelasnya**
- Query: `kelas_siswa WHERE kelas_id = wali_kelas.kelas_id`

**Guru Mapel:**
- Count siswa dari **semua kelas yang diajar**
- Query: `kelas_siswa JOIN kelas_mapel WHERE guru_id = current_guru`

#### **Error Responses:**

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

#### **Edge Cases:**
- Guru tidak mengampu kelas apapun → `total_siswa: 0`
- Wali kelas tanpa siswa → `total_siswa: 0`

---

### **2. GET /api/guru/dashboard/peringkat-siswa**
Menampilkan bar chart peringkat siswa berdasarkan rata-rata nilai dari **semua mata pelajaran**.

⚠️ **WALI KELAS ONLY!** Guru Mapel akan mendapat 403 Forbidden.

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)
- ✅ Must be **Wali Kelas**

#### **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Number | ❌ No | 1 | Halaman pagination |
| `per_page` | Number | ❌ No | 10 | Jumlah siswa per halaman (max: 100) |

#### **Response (200 - Success):**
```json
{
  "status": "success",
  "data": {
    "siswa": [
      {
        "nama": "Ahmad Fauzi",
        "nilai": 92.5,
        "kelas": "5A"
      },
      {
        "nama": "Siti Aminah",
        "nilai": 89.3,
        "kelas": "5A"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

#### **Business Logic:**
- Ambil **SEMUA siswa** di kelas wali kelas (termasuk yang belum punya nilai)
- Hitung `AVG(nilai_akhir)` per siswa dari **SEMUA mata pelajaran**
- Siswa tanpa nilai: `nilai = 0` (menggunakan `COALESCE`)
- Sort: `ORDER BY nilai DESC, nama ASC` (nilai tertinggi di atas, lalu alfabetis)
- Pagination: `LIMIT + OFFSET`

#### **Error Responses:**

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Page harus lebih besar dari 0",
  "data": null
}
```
```json
{
  "status": "error",
  "message": "Per page harus antara 1-100",
  "data": null
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

**403 Forbidden (Guru Mapel):**
```json
{
  "status": "error",
  "message": "Fitur Peringkat Siswa hanya tersedia untuk Wali Kelas",
  "code": 403
}
```

#### **Edge Cases:**
- Tidak ada siswa di kelas → `siswa: []`, `total: 0`
- Semua siswa belum punya nilai → Tetap tampil dengan `nilai: 0`
- Siswa tanpa nilai akan muncul di ranking paling bawah (sorted by name)

---

### **3. GET /api/guru/dashboard/mata-pelajaran**
Populate dropdown mata pelajaran untuk filter chart "Nilai Siswa per Mapel".

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)

#### **Query Parameters:**
None

#### **Response (200 - Success):**

**Wali Kelas:**
```json
{
  "status": "success",
  "data": [
    {
      "mapel_id": 1,
      "nama_mapel": "Matematika"
    },
    {
      "mapel_id": 5,
      "nama_mapel": "Bahasa Inggris"
    }
  ]
}
```

**Guru Mapel:**
```json
{
  "status": "success",
  "data": [
    {
      "mapel_id": 1,
      "kelas_id": 17,
      "nama_mapel": "Matematika (5A)"
    },
    {
      "mapel_id": 1,
      "kelas_id": 18,
      "nama_mapel": "Matematika (5B)"
    },
    {
      "mapel_id": 5,
      "kelas_id": 17,
      "nama_mapel": "Bahasa Inggris (5A)"
    }
  ]
}
```

#### **Business Logic:**

**Wali Kelas:**
- Query: Semua mapel di kelasnya
- Format: Nama mapel saja (tanpa kelas)
- Return: Satu item per mapel

**Guru Mapel:**
- Query: Mapel yang dia ajar di semua kelas
- Format: `"Nama Mapel (Kelas)"`
- **Return: Satu item per kombinasi mapel + kelas** (split per kelas)
- Contoh: Jika mengajar Matematika di 5A dan 5B → Return 2 items terpisah
- Sort: By mapel name, then kelas name

#### **Error Responses:**

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Anda tidak mengampu mata pelajaran apapun",
  "data": null
}
```

#### **Edge Cases:**
- Guru hanya wali kelas (tidak ngajar mapel) → Tetap return mapel di kelasnya
- Wali kelas + guru mapel → Return semua mapel di kelasnya

---

### **4. GET /api/guru/dashboard/nilai-per-mapel**
Menampilkan bar chart nilai siswa untuk mata pelajaran tertentu.

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)
- ✅ Must teach/have this `mapel` in their class

#### **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mapel_id` | Number | ✅ **Yes** | - | ID mata pelajaran |
| `page` | Number | ❌ No | 1 | Halaman pagination |
| `per_page` | Number | ❌ No | 10 | Jumlah siswa per halaman (max: 100) |

#### **Response (200 - Success):**
```json
{
  "status": "success",
  "data": {
    "siswa": [
      {
        "nama": "Ahmad Fauzi",
        "nilai": 95.2
      },
      {
        "nama": "Budi Santoso",
        "nilai": 88.5
      }
    ],
    "mata_pelajaran": {
      "id": 5,
      "nama": "Bahasa Inggris"
    },
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

#### **Business Logic:**

**Wali Kelas:**
- Dapat melihat nilai **semua mapel** di kelasnya (termasuk mapel yang diajar guru lain)
- Authorization: Check apakah `mapel_id` ada di kelasnya

**Guru Mapel:**
- Hanya dapat melihat nilai **mapel yang dia ajar**
- Authorization: Check apakah guru mengampu `mapel_id` ini

**Common:**
- Ambil `nilai_akhir` dari database (sudah dihitung oleh trigger)
- Tampilkan **SEMUA siswa** (termasuk yang nilainya 0)
- Siswa tanpa nilai: `nilai = 0` (menggunakan `COALESCE`)
- Sort: `ORDER BY nilai DESC, nama ASC`
- Pagination: `LIMIT + OFFSET`

#### **Error Responses:**

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Parameter mapel_id wajib diisi",
  "data": null
}
```
```json
{
  "status": "error",
  "message": "Parameter mapel_id harus berupa angka positif",
  "data": null
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

**403 Forbidden:**
```json
{
  "status": "error",
  "message": "Anda tidak mengampu mata pelajaran ini",
  "data": null
}
```
```json
{
  "status": "error",
  "message": "Mata pelajaran tidak ada di kelas Anda",
  "data": null
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Mata pelajaran tidak ditemukan",
  "data": null
}
```

#### **Edge Cases:**
- Tidak ada siswa di kelas → `siswa: []`, `total: 0`
- Semua siswa belum dinilai di mapel ini → Tetap tampil dengan `nilai: 0`
- Siswa tanpa nilai akan muncul di ranking paling bawah (sorted by name)

---

### **5. GET /api/guru/dashboard/kehadiran-kelas** ⭐ NEW!
Get daftar kelas untuk dropdown (Guru Mapel) atau info kelas (Wali Kelas).

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)

#### **Query Parameters:**
None

#### **Response (200 - Success):**

**Wali Kelas:**
```json
{
  "status": "success",
  "data": {
    "is_wali_kelas": true,
    "kelas_id": 17,
    "nama_kelas": "5A"
  }
}
```

**Guru Mapel:**
```json
{
  "status": "success",
  "data": {
    "is_wali_kelas": false,
    "kelas_list": [
      {
        "kelas_id": 17,
        "nama_kelas": "5A"
      },
      {
        "kelas_id": 18,
        "nama_kelas": "5B"
      }
    ]
  }
}
```

#### **Business Logic:**
1. Check apakah guru adalah wali kelas (`kelas.wali_kelas_id = guru_id`)
2. **Jika Wali Kelas:**
   - Return `is_wali_kelas: true` + info kelas mereka
   - Frontend: Hide dropdown, langsung tampilkan kehadiran
3. **Jika Guru Mapel:**
   - Return `is_wali_kelas: false` + list kelas yang dia ajar
   - Frontend: Show dropdown untuk pilih kelas

#### **Error Responses:**

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

#### **Usage Flow (Frontend):**
```javascript
// Step 1: Call this API on component mount
const { data } = await fetch('/api/guru/dashboard/kehadiran-kelas');

if (data.is_wali_kelas) {
  // Wali Kelas: Hide dropdown
  // Directly call kehadiran-hari-ini (no kelas_id param)
} else {
  // Guru Mapel: Show dropdown with data.kelas_list
  // User selects kelas → call kehadiran-hari-ini with kelas_id
}
```

---

### **6. GET /api/guru/dashboard/kehadiran-hari-ini**
Menampilkan pie chart kehadiran siswa hari ini.

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)
- ✅ Guru Mapel: Must teach in the specified `kelas_id`

#### **Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `kelas_id` | Number | **Wali Kelas:** ❌ No<br>**Guru Mapel:** ✅ **Yes** | - | ID kelas yang ingin dilihat kehadirannya |

#### **Response (200 - Success):**
```json
{
  "status": "success",
  "data": {
    "tanggal": "03/11/2025",
    "kelas": "5A",
    "kehadiran": [
      {
        "name": "Hadir",
        "value": 28
      },
      {
        "name": "Sakit",
        "value": 1
      },
      {
        "name": "Izin",
        "value": 1
      },
      {
        "name": "Alpha",
        "value": 0
      }
    ],
    "total_siswa": 30
  }
}
```

#### **Business Logic:**

**Wali Kelas:**
- Parameter `kelas_id` **diabaikan** (ignored)
- Auto-use kelasnya sendiri
- Query: `absensi WHERE tanggal = CURDATE() AND kelas_id = wali_kelas.kelas_id`

**Guru Mapel:**
- Parameter `kelas_id` **WAJIB**
- Authorization: Guru harus mengajar di kelas tersebut
- Query: `absensi WHERE tanggal = CURDATE() AND kelas_id = ?`

**Common:**
- Count by status: `COUNT(status = 'Hadir')`, `COUNT(status = 'Sakit')`, dll.
- Tanggal: Format `DD/MM/YYYY`

#### **Error Responses:**

**400 Bad Request (Guru Mapel tanpa kelas_id):**
```json
{
  "status": "error",
  "message": "Parameter kelas_id wajib diisi untuk Guru Mapel",
  "data": null
}
```

**400 Bad Request (Invalid kelas_id):**
```json
{
  "status": "error",
  "message": "Parameter kelas_id harus berupa angka positif",
  "data": null
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
  "data": null
}
```

**403 Forbidden (Guru tidak mengajar di kelas ini):**
```json
{
  "status": "error",
  "message": "Anda tidak mengajar di kelas ini",
  "data": null
}
```

#### **Edge Cases:**
- Belum ada absensi hari ini → `kehadiran: [{ "name": "Hadir", "value": 0 }, ...]`
- Weekend/libur → Tetap return data (semua 0)

#### **Frontend Integration:**

**Wali Kelas:**
```javascript
// No dropdown, langsung call API
const response = await fetch('/api/guru/dashboard/kehadiran-hari-ini', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Guru Mapel:**
```javascript
// User selects from dropdown
const selectedKelasId = 17; // from dropdown

const response = await fetch(
  `/api/guru/dashboard/kehadiran-hari-ini?kelas_id=${selectedKelasId}`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

---

    ### **7. GET /api/guru/dashboard/catatan-terbaru**
    Menampilkan tabel 6 catatan terakhir yang dibuat oleh guru (read-only summary).

    #### **Authorization:**
    - ✅ JWT Token required (role: `guru`)

    #### **Query Parameters:**
    | Parameter | Type | Required | Default | Description |
    |-----------|------|----------|---------|-------------|
    | `limit` | Number | ❌ No | 6 | Jumlah catatan yang ditampilkan (max: 50) |

    #### **Response (200 - Success):**

    **Guru Mapel:**
    ```json
    {
    "status": "success",
    "data": [
        {
        "id": 15,
        "nama_siswa": "Ahmad Fauzi",
        "kelas": "5A",
        "catatan": "Sangat aktif dalam diskusi kelompok matematika.",
        "tanggal": "27/10/2025"
        },
        {
        "id": 14,
        "nama_siswa": "Siti Aminah",
        "kelas": "5A",
        "catatan": "Perlu lebih fokus saat mengerjakan soal esai yang pa...",
        "tanggal": "26/10/2025"
        }
    ]
    }
    ```

    **Wali Kelas:**
    ```json
    {
    "status": "success",
    "data": [
        {
        "id": 15,
        "nama_siswa": "Ahmad Fauzi",
        "kelas": "5A",
        "nama_guru": "Pak Budi Santoso",
        "catatan": "Sangat aktif dalam diskusi kelompok matematika.",
        "tanggal": "27/10/2025"
        },
        {
        "id": 14,
        "nama_siswa": "Siti Aminah",
        "kelas": "5A",
        "nama_guru": "Bu Siti Nurhaliza",
        "catatan": "Perlu lebih fokus saat mengerjakan soal esai yang pa...",
        "tanggal": "26/10/2025"
        }
    ]
    }
    ```

    #### **Business Logic:**

    **Guru Mapel:**
    - Query: `catatan_header WHERE guru_id = current_guru`
    - JOIN: `siswa`, `kelas`, `catatan_detail` (first message)
    - **Hanya catatan yang GURU INI buat** (filter by `guru_id`)

    **Wali Kelas:**
    - Query: `catatan_header WHERE kelas_id = wali_kelas.kelas_id`
    - JOIN: `siswa`, `kelas`, `guru`, `catatan_detail` (first message)
    - **Semua catatan di kelasnya** (termasuk yang dibuat guru lain)
    - **Tambah field `nama_guru`** untuk tahu siapa pembuat catatan

    **Common:**
    - Order: `ORDER BY created_at DESC` (terbaru duluan)
    - Limit: Default 6 catatan (max: 50)
    - Truncate: Jika catatan > 60 karakter → `substring(0, 60) + '...'`
    - Tanggal: Format `DD/MM/YYYY`

    #### **Error Responses:**

    **400 Bad Request:**
    ```json
    {
    "status": "error",
    "message": "Limit harus antara 1-50",
    "data": null
    }
    ```

    **401 Unauthorized:**
    ```json
    {
    "status": "error",
    "message": "Guru ID tidak ditemukan. Pastikan Anda login sebagai guru.",
    "data": null
    }
    ```

    #### **Edge Cases:**
    - Belum ada catatan → `data: []`
    - Catatan tanpa mapel → Tetap tampil (catatan umum)

    #### **Notes:**
    ✅ **Response berbeda untuk Wali Kelas vs Guru Mapel:**
    - **Guru Mapel:** Hanya lihat catatan yang dia buat (no `nama_guru` field)
    - **Wali Kelas:** Lihat **semua catatan di kelasnya** + field `nama_guru` (tahu siapa pembuat)

    ---

## 📊 Comparison Table

| Feature | Wali Kelas | Guru Mapel |
|---------|------------|------------|
| **Statistik Siswa** | Count siswa di kelasnya | Count siswa dari semua kelas yang diajar |
| **Peringkat Siswa** | ✅ Bisa akses | ❌ 403 Forbidden |
| **Dropdown Mata Pelajaran** | Semua mapel di kelasnya | Mapel yang diajar + nama kelas (split per kelas: "MTK (5A)", "MTK (5B)") |
| **Nilai per Mapel** | Bisa lihat semua mapel di kelasnya | Hanya mapel yang dia ajar |
| **Kehadiran Kelas API** | Return `kelas_id` (no dropdown) | Return `kelas_list` (dropdown) |
| **Kehadiran Hari Ini** | Auto kelasnya (ignore `kelas_id` param) | Required `kelas_id` param + authorization |
| **Catatan Terbaru** | Catatan yang dia buat | **Semua catatan di kelasnya** (termasuk dari guru lain) + field `nama_guru` |

---

## 🧪 Testing Guide

### **Test as Wali Kelas:**

```bash
# 1. Statistik Siswa
GET /api/guru/dashboard/statistik-siswa
Expected: Count siswa di kelasnya saja

# 2. Peringkat Siswa
GET /api/guru/dashboard/peringkat-siswa?page=1&per_page=10
Expected: 200 OK, data ranking siswa

# 3. Mata Pelajaran
GET /api/guru/dashboard/mata-pelajaran
Expected: Semua mapel di kelasnya (tanpa nama kelas)

# 4. Nilai per Mapel
GET /api/guru/dashboard/nilai-per-mapel?mapel_id=1
Expected: Nilai siswa untuk mapel apapun di kelasnya

# 5. Kehadiran Kelas
GET /api/guru/dashboard/kehadiran-kelas
Expected: { is_wali_kelas: true, kelas_id: X, nama_kelas: "5A" }

# 6. Kehadiran Hari Ini
GET /api/guru/dashboard/kehadiran-hari-ini
Expected: Kehadiran siswa di kelasnya (tanpa kelas_id param)

# 7. Catatan Terbaru
GET /api/guru/dashboard/catatan-terbaru?limit=6
Expected: 6 catatan terbaru yang guru ini buat
```

---

### **Test as Guru Mapel:**

```bash
# 1. Statistik Siswa
GET /api/guru/dashboard/statistik-siswa
Expected: Count siswa dari semua kelas yang diajar

# 2. Peringkat Siswa
GET /api/guru/dashboard/peringkat-siswa
Expected: 403 Forbidden - "Fitur Peringkat Siswa hanya tersedia untuk Wali Kelas"

# 3. Mata Pelajaran
GET /api/guru/dashboard/mata-pelajaran
Expected: Mapel yang diajar DENGAN nama kelas (split per kelas: "Matematika (5A)", "Matematika (5B)")

# 4. Nilai per Mapel (mapel yang DIA ajar)
GET /api/guru/dashboard/nilai-per-mapel?mapel_id=1
Expected: 200 OK, nilai siswa

# 5. Nilai per Mapel (mapel yang TIDAK dia ajar)
GET /api/guru/dashboard/nilai-per-mapel?mapel_id=999
Expected: 403 Forbidden - "Anda tidak mengampu mata pelajaran ini"

# 6. Kehadiran Kelas
GET /api/guru/dashboard/kehadiran-kelas
Expected: { is_wali_kelas: false, kelas_list: [{kelas_id: 17, nama_kelas: "5A"}, ...] }

# 7. Kehadiran Hari Ini (TANPA kelas_id)
GET /api/guru/dashboard/kehadiran-hari-ini
Expected: 400 Bad Request - "Parameter kelas_id wajib diisi untuk Guru Mapel"

# 8. Kehadiran Hari Ini (DENGAN kelas_id yang dia ajar)
GET /api/guru/dashboard/kehadiran-hari-ini?kelas_id=17
Expected: 200 OK, kehadiran siswa di kelas 17

# 9. Kehadiran Hari Ini (DENGAN kelas_id yang TIDAK dia ajar)
GET /api/guru/dashboard/kehadiran-hari-ini?kelas_id=999
Expected: 403 Forbidden - "Anda tidak mengajar di kelas ini"

# 10. Catatan Terbaru
GET /api/guru/dashboard/catatan-terbaru
Expected: Catatan yang guru ini buat (no `nama_guru` field)
```

---

## 🔧 Implementation Notes

### **Database Schema Requirements:**

```sql
-- Check wali kelas
SELECT id, nama_kelas 
FROM kelas 
WHERE wali_kelas_id = ? AND tahun_ajaran_id = (aktif);

-- Check guru mapel mengajar di kelas
SELECT COUNT(*) 
FROM kelas_mapel 
WHERE guru_id = ? AND kelas_id = ? AND tahun_ajaran_id = (aktif);

-- Get kelas list guru mapel
SELECT DISTINCT kelas_id, nama_kelas 
FROM kelas_mapel JOIN kelas 
WHERE guru_id = ? AND tahun_ajaran_id = (aktif);
```

### **Key Helper Functions:**

1. `checkIsWaliKelas(guruId)` → Return `{ kelas_id, nama_kelas }` or `null`
2. `checkGuruMengajarDiKelas(guruId, kelasId)` → Return `boolean`
3. `getKelasListGuruMapel(guruId)` → Return array of kelas

---

## 📝 Changelog

### **Version 1.1 (Current)**
- ✅ Added role-based access control (Wali Kelas vs Guru Mapel)
- ✅ **NEW API:** `GET /api/guru/dashboard/kehadiran-kelas`
- ✅ Updated all APIs to handle different logic for Wali Kelas vs Guru Mapel
- ✅ Added `kelas_id` parameter to `kehadiran-hari-ini` API
- ✅ Peringkat Siswa: Now Wali Kelas only (403 for Guru Mapel)
- ✅ Mata Pelajaran Dropdown: Added kelas name for Guru Mapel
- ✅ Nilai per Mapel: Different authorization logic
- ✅ Using stored `nilai_akhir` from database (calculated by trigger)

### **Version 1.0 (Previous)**
- Basic dashboard APIs without role differentiation

---

## 📞 Support

Untuk pertanyaan atau issue, hubungi:
- Backend Team
- Email: [your-email@example.com]

---

**Last Updated:** November 3, 2025

