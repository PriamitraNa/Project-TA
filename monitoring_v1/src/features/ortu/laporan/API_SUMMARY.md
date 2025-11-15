# 📊 API Summary - Laporan Anak (Quick Reference)

## 🎯 3 API yang Dibutuhkan

### 1️⃣ **GET Tahun Ajaran** (Simple)

```
GET /api/ortu/laporan/tahun-ajaran
Auth: Bearer Token
Role: ortu

Response:
{
  "data": [
    { "id": 1, "tahun_ajaran": "2025/2026", "label": "T.A 2025/2026", "is_active": true },
    { "id": 2, "tahun_ajaran": "2024/2025", "label": "T.A 2024/2025", "is_active": false }
  ]
}
```

### 2️⃣ **GET Laporan Nilai** (Core Feature)

```
GET /api/ortu/laporan/nilai?tahun_ajaran_id=1&semester=ganjil
Auth: Bearer Token
Role: ortu

Response:
{
  "data": {
    "siswa": { "nisn": "0012345678", "nama": "Ahmad", "kelas": "7A" },
    "nilai": [
      {
        "id": 1,
        "mapel": "Matematika",
        "nilai_akhir": 78,
        "predikat": "C",
        "kkm": 75,
        "deskripsi": "Perlu meningkatkan..."
      }
    ]
  }
}
```

### 3️⃣ **POST Download PDF** (Bonus Feature)

```
POST /api/ortu/laporan/download-pdf
Auth: Bearer Token
Role: ortu
Body: { "tahun_ajaran_id": 1, "semester": "ganjil" }

Response: Binary PDF file
```

---

## 🔐 Authorization Logic

```
Ortu Login → Token contains: user_id, role=ortu, nisn_anak

Backend Query:
1. Cek token valid ✓
2. Cek role = 'ortu' ✓
3. Cek nisn_anak dari token
4. Query nilai WHERE siswa.nisn = nisn_anak from token
5. Return data ONLY untuk anak tersebut

❌ Ortu A TIDAK BOLEH lihat data anak Ortu B
```

---

## 📊 Data Flow

```
┌─────────────┐
│ Ortu Login  │
│ (NISN Anak  │
│  di Token)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Halaman Laporan     │
│ Load Tahun Ajaran   │ ◄── API #1
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Pilih Filter:       │
│ - Tahun: 2025/2026  │
│ - Semester: Ganjil  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Load Laporan Nilai  │ ◄── API #2
│ (Filter by NISN     │     (dengan params)
│  from Token)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Tampil Tabel Nilai: │
│ • Matematika: 78 (C)│
│ • B.Indo: 88 (A)    │
│ • IPA: 87 (A)       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Klik "Unduh PDF"    │ ◄── API #3
└─────────────────────┘
```

---

## 🗄️ Database Schema

```sql
-- Table: users (untuk ortu)
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  role ENUM('admin','guru','ortu'),
  nisn_anak VARCHAR(10),  -- 👈 LINK KE SISWA
  FOREIGN KEY (nisn_anak) REFERENCES siswa(nisn)
);

-- Table: siswa
CREATE TABLE siswa (
  nisn VARCHAR(10) PRIMARY KEY,
  nama VARCHAR(100),
  kelas_id INT
);

-- Table: nilai
CREATE TABLE nilai (
  id INT PRIMARY KEY,
  siswa_nisn VARCHAR(10),
  mapel_id INT,
  tahun_ajaran_id INT,
  semester ENUM('ganjil','genap'),
  nilai_akhir DECIMAL(5,2),
  predikat ENUM('A','B','C','D'),
  deskripsi TEXT,
  FOREIGN KEY (siswa_nisn) REFERENCES siswa(nisn)
);
```

---

## 💡 Backend Logic

### Predikat Calculation

```php
function hitungPredikat($nilaiAkhir) {
    if ($nilaiAkhir >= 85) return 'A';
    if ($nilaiAkhir >= 70) return 'B';
    if ($nilaiAkhir >= 55) return 'C';
    return 'D';
}
```

### Authorization Middleware

```php
// Middleware untuk ortu/laporan/*
function checkOrtuAccess() {
    $user = auth()->user();

    // Cek role
    if ($user->role !== 'ortu') {
        abort(403, 'Forbidden');
    }

    // Cek punya nisn_anak
    if (!$user->nisn_anak) {
        abort(403, 'NISN anak tidak ditemukan');
    }

    return true;
}
```

### Query Example (API #2)

```php
public function getLaporanNilai(Request $request) {
    $user = auth()->user();
    $nisnAnak = $user->nisn_anak; // 👈 Dari token

    $data = Nilai::where('siswa_nisn', $nisnAnak)
        ->where('tahun_ajaran_id', $request->tahun_ajaran_id)
        ->where('semester', $request->semester)
        ->with(['siswa', 'mapel'])
        ->get();

    return response()->json([
        'status' => 'success',
        'data' => [
            'siswa' => Siswa::where('nisn', $nisnAnak)->first(),
            'nilai' => $data
        ]
    ]);
}
```

---

## ✅ Testing Scenarios

| Scenario                  | Expected Result                           |
| ------------------------- | ----------------------------------------- |
| Ortu login & buka laporan | ✅ Load tahun ajaran options              |
| Pilih tahun + semester    | ✅ Tampil nilai anak                      |
| Ortu A akses data ortu B  | ❌ Error 403 Forbidden                    |
| Token invalid             | ❌ Error 401 Unauthorized                 |
| Belum ada nilai           | ✅ Empty state "Belum ada data"           |
| Download PDF              | ✅ PDF terdownload dengan nama file benar |
| Predikat warna            | ✅ A=hijau, B=biru, C=kuning, D=merah     |

---

## 🚦 Implementation Steps

### Phase 1: Basic (API #1 + #2)

1. ✅ Buat endpoint tahun ajaran
2. ✅ Buat endpoint laporan nilai
3. ✅ Test authorization (nisn_anak filtering)
4. ✅ Frontend integration
5. ✅ Testing end-to-end

### Phase 2: PDF Feature (API #3)

1. ✅ Setup PDF library
2. ✅ Buat template PDF
3. ✅ Implement download endpoint
4. ✅ Test download

---

## 📞 Koordinasi dengan Backend

### Yang Perlu Dikonfirmasi:

1. ✅ Struktur table `users` sudah ada `nisn_anak`?
2. ✅ Table `nilai` ada `tahun_ajaran_id` & `semester`?
3. ✅ Library PDF apa yang akan dipakai?
4. ✅ Format response sesuai dokumentasi?
5. ✅ Expected response time?

### Dependency:

- ❗ **CRITICAL**: Column `users.nisn_anak` harus exist
- ❗ **CRITICAL**: Authorization based on NISN
- ⚠️ **IMPORTANT**: Predikat calculation consistent (85/70/55)
- ℹ️ **NICE TO HAVE**: PDF generation

---

## 🎯 Success Criteria

✅ Ortu bisa lihat nilai anak berdasarkan NISN mereka  
✅ Filter tahun ajaran & semester berfungsi  
✅ Data ditampilkan dengan predikat yang benar  
✅ Authorization ketat (tidak bisa lihat data anak lain)  
✅ Empty state jika belum ada data  
✅ PDF download (bonus feature)  
✅ Loading & error handling yang baik  
✅ Response time < 500ms

---

Untuk dokumentasi lengkap, lihat: **API_REQUIREMENTS.md**
