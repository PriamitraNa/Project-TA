# 🚀 Quick Start - Backend Developer Guide

## 📋 3 Endpoints to Implement

### 1️⃣ GET /api/ortu/laporan/tahun-ajaran

```javascript
// Controller
export async function getTahunAjaran(req, res) {
  try {
    // 1. Check auth & role
    if (req.user.role !== 'ortu') {
      return res.status(403).json({
        status: 'error',
        message: 'Akses ditolak. Hanya orang tua yang dapat mengakses endpoint ini.',
      })
    }

    // 2. Query tahun ajaran
    const tahunAjaran = await db.query(`
      SELECT 
        id,
        tahun_ajaran,
        CASE 
          WHEN status='aktif' THEN CONCAT(tahun_ajaran, ' (Aktif)')
          ELSE tahun_ajaran
        END AS label,
        status='aktif' AS is_active
      FROM tahun_ajaran
      ORDER BY tahun_ajaran DESC
    `)

    // 3. Return response
    res.json({
      status: 'success',
      data: tahunAjaran.rows,
    })
  } catch (error) {
    console.error('getTahunAjaran error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    })
  }
}
```

**✅ Success Response:**

```json
{
  "status": "success",
  "data": [
    { "id": 1, "tahun_ajaran": "2024/2025", "label": "2024/2025 (Aktif)", "is_active": true }
  ]
}
```

---

### 2️⃣ GET /api/ortu/laporan/nilai

```javascript
// Controller
export async function getLaporanNilai(req, res) {
  try {
    const { tahun_ajaran_id, semester } = req.query

    // 1. Validation
    if (!tahun_ajaran_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter tahun_ajaran_id wajib diisi',
      })
    }

    if (!semester || !['1', '2'].includes(semester)) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameter semester wajib diisi (1 atau 2)',
      })
    }

    // 2. Check auth & role
    if (req.user.role !== 'ortu') {
      return res.status(403).json({
        status: 'error',
        message: 'Akses ditolak. Hanya orang tua yang dapat mengakses endpoint ini.',
      })
    }

    // 3. CRITICAL: Get NISN from JWT token
    const nisnAnak = req.user.siswa_nisn

    if (!nisnAnak) {
      return res.status(401).json({
        status: 'error',
        message: 'NISN anak tidak ditemukan dalam token. Silakan login ulang.',
      })
    }

    // 4. Query siswa info
    const siswaResult = await db.query(
      `
      SELECT 
        s.id AS siswa_id,
        s.nama_lengkap AS siswa_nama,
        s.nisn,
        k.nama_kelas AS kelas_nama,
        ta.tahun_ajaran,
        ks.semester
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      JOIN kelas k ON ks.kelas_id = k.id
      JOIN tahun_ajaran ta ON ks.tahun_ajaran_id = ta.id
      WHERE s.nisn = $1 
        AND ks.tahun_ajaran_id = $2
      LIMIT 1
    `,
      [nisnAnak, tahun_ajaran_id]
    )

    if (siswaResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data nilai tidak ditemukan untuk siswa ini',
      })
    }

    // 5. Query nilai with 7-table JOIN
    const nilaiResult = await db.query(
      `
      SELECT
        n.id AS nilai_id,
        m.nama_mapel,
        m.kode_mapel,
        n.nilai_tugas,
        n.nilai_uts,
        n.nilai_uas,
        n.nilai_akhir,
        n.keterangan,
        u.nama_lengkap AS guru_nama
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      LEFT JOIN nilai n ON (s.id = n.siswa_id 
        AND n.tahun_ajaran_id = $2 
        AND n.semester = $3)
      LEFT JOIN kelas_mapel km ON n.kelas_mapel_id = km.id
      LEFT JOIN mapel m ON km.mapel_id = m.id
      LEFT JOIN guru g ON km.guru_id = g.id
      LEFT JOIN users u ON g.user_id = u.id
      WHERE s.nisn = $1
        AND ks.tahun_ajaran_id = $2
      ORDER BY m.nama_mapel ASC
    `,
      [nisnAnak, tahun_ajaran_id, semester]
    )

    // 6. Query statistik
    const statistikResult = await db.query(
      `
      SELECT
        COUNT(*) AS total_mapel,
        COUNT(CASE WHEN n.nilai_akhir IS NOT NULL THEN 1 END) AS mapel_dengan_nilai,
        ROUND(AVG(n.nilai_akhir), 2) AS rata_rata,
        MAX(n.nilai_akhir) AS nilai_tertinggi,
        MIN(n.nilai_akhir) AS nilai_terendah,
        COUNT(CASE WHEN n.nilai_akhir >= 75 THEN 1 END) AS tuntas,
        COUNT(CASE WHEN n.nilai_akhir < 75 THEN 1 END) AS belum_tuntas
      FROM siswa s
      JOIN kelas_siswa ks ON s.id = ks.siswa_id
      LEFT JOIN nilai n ON (s.id = n.siswa_id 
        AND n.tahun_ajaran_id = $2 
        AND n.semester = $3)
      WHERE s.nisw = $1
        AND ks.tahun_ajaran_id = $2
    `,
      [nisnAnak, tahun_ajaran_id, semester]
    )

    // 7. Format response
    res.json({
      status: 'success',
      data: {
        siswa: siswaResult.rows[0],
        nilai: nilaiResult.rows.filter((row) => row.nilai_id !== null),
        statistik: statistikResult.rows[0],
      },
    })
  } catch (error) {
    console.error('getLaporanNilai error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    })
  }
}
```

**✅ Success Response:**

```json
{
  "status": "success",
  "data": {
    "siswa": {
      "siswa_id": 19,
      "siswa_nama": "Ahmad Rizki",
      "nisn": "1234567890",
      "kelas_nama": "7A",
      "tahun_ajaran": "2024/2025",
      "semester": "1"
    },
    "nilai": [
      {
        "nilai_id": 101,
        "nama_mapel": "Matematika",
        "nilai_akhir": 85,
        ...
      }
    ],
    "statistik": {
      "total_mapel": 10,
      "rata_rata": "83.25",
      ...
    }
  }
}
```

---

### 3️⃣ POST /api/ortu/laporan/download-pdf

```javascript
// Controller
export async function downloadPDF(req, res) {
  try {
    const { tahun_ajaran_id, semester } = req.body

    // 1. Validation (same as API #2)
    // 2. Check auth & role (same as API #2)
    // 3. Get NISN from token (same as API #2)

    const nisnAnak = req.user.siswa_nisn

    // 4. Get data (reuse service from API #2)
    const data = await getLaporanNilaiService(nisnAnak, tahun_ajaran_id, semester)

    if (!data || data.nilai.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data nilai tidak ditemukan untuk siswa ini',
      })
    }

    // 5. Generate PDF
    const PDFDocument = require('pdfkit')
    const doc = new PDFDocument({ size: 'A4', margin: 50 })

    // 6. Set response headers
    const filename = `Laporan_Nilai_${data.siswa.siswa_nama.replace(
      / /g,
      '_'
    )}_${data.siswa.tahun_ajaran.replace('/', '-')}_Semester_${semester}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    // 7. Pipe PDF to response
    doc.pipe(res)

    // 8. Add content to PDF
    // Header
    doc.fontSize(16).text('LAPORAN NILAI SISWA', { align: 'center' })
    doc.moveDown()

    // Student info
    doc.fontSize(10)
    doc.text(`Nama: ${data.siswa.siswa_nama}`)
    doc.text(`NISN: ${data.siswa.nisn}`)
    doc.text(`Kelas: ${data.siswa.kelas_nama}`)
    doc.moveDown()

    // Table header
    doc.fontSize(8)
    let y = doc.y
    doc.text('No', 50, y, { width: 30 })
    doc.text('Mata Pelajaran', 80, y, { width: 150 })
    doc.text('Nilai Akhir', 230, y, { width: 80, align: 'center' })
    doc.text('Keterangan', 310, y, { width: 200 })

    doc
      .moveTo(50, y + 15)
      .lineTo(545, y + 15)
      .stroke()
    y += 20

    // Table rows
    data.nilai.forEach((item, index) => {
      if (y > 720) {
        doc.addPage()
        y = 50
      }

      doc.text(index + 1, 50, y, { width: 30 })
      doc.text(item.nama_mapel, 80, y, { width: 150 })
      doc.text(item.nilai_akhir, 230, y, { width: 80, align: 'center' })
      doc.text(item.keterangan || '-', 310, y, { width: 200 })

      y += 20
    })

    // Statistik
    doc.moveDown(2)
    doc.fontSize(10)
    doc.text(`Rata-rata: ${data.statistik.rata_rata}`)
    doc.text(`Tuntas: ${data.statistik.tuntas} / ${data.statistik.total_mapel}`)

    // Footer
    doc.fontSize(8)
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, { align: 'right' })

    // 9. Finalize PDF
    doc.end()
  } catch (error) {
    console.error('downloadPDF error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    })
  }
}
```

**✅ Success Response:**

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Laporan_Nilai_Ahmad_Rizki_2024-2025_Semester_1.pdf"`
- Body: Binary PDF data

---

## 🔐 Critical Security Checklist

### ✅ **MUST DO:**

1. **JWT Token Must Include:**

```javascript
{
  user_id: 10,
  role: 'ortu',
  siswa_nisn: '1234567890',  // ← CRITICAL!
  ...
}
```

2. **All Queries MUST Filter by NISN:**

```sql
WHERE siswa.nisn = ?  -- From req.user.siswa_nisn
```

3. **Authorization Middleware:**

```javascript
function checkOrtuRole(req, res, next) {
  if (req.user.role !== 'ortu') {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden',
    })
  }
  next()
}
```

4. **NISN Validation:**

```javascript
if (!req.user.siswa_nisn) {
  return res.status(401).json({
    status: 'error',
    message: 'NISN anak tidak ditemukan dalam token',
  })
}
```

### ❌ **NEVER DO:**

- ❌ Trust NISN from query params or body
- ❌ Allow cross-account data access
- ❌ Skip role validation
- ❌ Expose sensitive data in errors

---

## 📊 Database Schema Required

```sql
-- Users table (ortu)
ALTER TABLE users ADD COLUMN siswa_nisn VARCHAR(10);
ALTER TABLE users ADD FOREIGN KEY (siswa_nisn) REFERENCES siswa(nisn);

-- Indexes for performance
CREATE INDEX idx_siswa_nisn ON siswa(nisn);
CREATE INDEX idx_kelas_siswa_lookup ON kelas_siswa(siswa_id, tahun_ajaran_id);
CREATE INDEX idx_nilai_lookup ON nilai(siswa_id, tahun_ajaran_id, semester);
```

---

## 🧪 Testing Commands

```bash
# API #1: Tahun Ajaran
curl -X GET http://localhost:3000/api/ortu/laporan/tahun-ajaran \
  -H "Authorization: Bearer {token}"

# API #2: Laporan Nilai
curl -X GET "http://localhost:3000/api/ortu/laporan/nilai?tahun_ajaran_id=1&semester=1" \
  -H "Authorization: Bearer {token}"

# API #3: Download PDF
curl -X POST http://localhost:3000/api/ortu/laporan/download-pdf \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"tahun_ajaran_id":1,"semester":"1"}' \
  --output laporan.pdf
```

---

## ⚡ Performance Tips

1. **Use Indexes:**

```sql
CREATE INDEX idx_siswa_nisn ON siswa(nisn);
CREATE INDEX idx_nilai_lookup ON nilai(siswa_id, tahun_ajaran_id, semester);
```

2. **Cache Tahun Ajaran:**

```javascript
// Cache for 1 hour (rarely changes)
const CACHE_TTL = 3600
```

3. **Optimize JOIN Query:**

```sql
-- Use LEFT JOIN for optional relations (nilai may not exist)
LEFT JOIN nilai n ON (...)

-- Use INNER JOIN for required relations
INNER JOIN kelas_siswa ks ON s.id = ks.siswa_id
```

4. **Limit Results:**

```sql
-- Add reasonable limits
LIMIT 50  -- Max 50 mapel per semester
```

---

## 📞 Questions? Contact Frontend Team

Frontend is ready and waiting! Just implement these 3 endpoints and we can test immediately.

**Status:** 🟢 Frontend 100% Complete  
**Waiting:** Backend implementation  
**ETA:** 2-3 days for backend + testing

---

**Happy Coding! 🚀**
