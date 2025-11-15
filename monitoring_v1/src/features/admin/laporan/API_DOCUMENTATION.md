# API Documentation - Transkrip Nilai Siswa (Admin)

## 📋 Overview
Dokumentasi ini menjelaskan endpoint API yang diperlukan untuk fitur **Transkrip Nilai Siswa** pada role Admin.

## 🔗 Base URL
```
/api/admin/laporan
```

---

## 📍 Endpoints

### 1. Get Daftar Siswa
Mengambil daftar semua siswa untuk dropdown filter.

**Endpoint:**
```
GET /api/admin/laporan/siswa
```

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `kelas_id` | integer | No | Filter siswa berdasarkan kelas tertentu |
| `tahun_ajaran_id` | integer | No | Filter siswa berdasarkan tahun ajaran |
| `search` | string | No | Pencarian nama/NISN siswa |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Daftar siswa berhasil diambil",
  "data": [
    {
      "siswa_id": 1,
      "nama": "Ahmad Fauzi",
      "nisn": "1234567890",
      "kelas": "5A",
      "kelas_id": 17
    },
    {
      "siswa_id": 2,
      "nama": "Budi Santoso",
      "nisn": "0987654321",
      "kelas": "4B",
      "kelas_id": 15
    }
  ]
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized - Token invalid atau expired"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Terjadi kesalahan server",
  "error": "Error details..."
}
```

---

### 2. Get Transkrip Nilai Siswa
Mengambil transkrip nilai lengkap siswa (semua semester).

**Endpoint:**
```
GET /api/admin/laporan/transkrip/:siswa_id
```

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `siswa_id` | integer | Yes | ID siswa yang akan diambil transkripnya |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Transkrip nilai berhasil diambil",
  "data": {
    "siswa": {
      "siswa_id": 1,
      "nama": "Ahmad Fauzi",
      "nisn": "1234567890",
      "kelas": "5A",
      "tempat_lahir": "Jakarta",
      "tanggal_lahir": "2015-05-15",
      "nama_ortu": "Bapak Fauzi bin Ahmad"
    },
    "riwayat_nilai": [
      {
        "id": "ta3-ganjil",
        "tahun_ajaran": "2025/2026",
        "tahun_ajaran_id": 3,
        "semester": "Ganjil",
        "kelas": "5A",
        "absensi": {
          "hadir": 58,
          "sakit": 1,
          "izin": 0,
          "alpha": 0
        },
        "nilai": [
          {
            "mapel_id": 1,
            "nama_mapel": "Matematika",
            "nilai_akhir": 87.5,
            "grade": "B+"
          },
          {
            "mapel_id": 2,
            "nama_mapel": "Bahasa Indonesia",
            "nilai_akhir": 83.75,
            "grade": "B"
          }
        ]
      },
      {
        "id": "ta2-genap",
        "tahun_ajaran": "2024/2025",
        "tahun_ajaran_id": 2,
        "semester": "Genap",
        "kelas": "4A",
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
            "nilai_akhir": 85.25,
            "grade": "B"
          }
        ]
      }
    ]
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Siswa tidak ditemukan"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized - Token invalid atau expired"
}
```

---

### 3. Download Transkrip PDF
Mengunduh transkrip nilai dalam format PDF.

**Endpoint:**
```
GET /api/admin/laporan/transkrip/:siswa_id/pdf
```

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `siswa_id` | integer | Yes | ID siswa yang akan didownload transkripnya |

**Success Response (200 OK):**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="Transkrip_Ahmad_Fauzi_1234567890.pdf"`
- **Body:** PDF Binary Data

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Data transkrip tidak ditemukan"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Gagal generate PDF",
  "error": "Error details..."
}
```

---

## 🗄️ Database Schema

### Tabel yang Terlibat

#### 1. `siswa`
```sql
CREATE TABLE siswa (
    siswa_id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    nisn VARCHAR(10) UNIQUE NOT NULL,
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE,
    nama_ortu VARCHAR(100),
    -- kolom lainnya...
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. `kelas`
```sql
CREATE TABLE kelas (
    kelas_id INT PRIMARY KEY AUTO_INCREMENT,
    nama_kelas VARCHAR(10) NOT NULL,
    tahun_ajaran_id INT,
    -- kolom lainnya...
    FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(tahun_ajaran_id)
);
```

#### 3. `siswa_kelas` (relasi siswa dengan kelas per tahun ajaran)
```sql
CREATE TABLE siswa_kelas (
    siswa_kelas_id INT PRIMARY KEY AUTO_INCREMENT,
    siswa_id INT NOT NULL,
    kelas_id INT NOT NULL,
    tahun_ajaran_id INT NOT NULL,
    semester ENUM('Ganjil', 'Genap') NOT NULL,
    status ENUM('Aktif', 'Tidak Aktif') DEFAULT 'Aktif',
    FOREIGN KEY (siswa_id) REFERENCES siswa(siswa_id),
    FOREIGN KEY (kelas_id) REFERENCES kelas(kelas_id),
    FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(tahun_ajaran_id)
);
```

#### 4. `nilai`
```sql
CREATE TABLE nilai (
    nilai_id INT PRIMARY KEY AUTO_INCREMENT,
    siswa_id INT NOT NULL,
    mapel_id INT NOT NULL,
    tahun_ajaran_id INT NOT NULL,
    semester ENUM('Ganjil', 'Genap') NOT NULL,
    nilai_akhir DECIMAL(5,2),
    grade VARCHAR(3),
    -- kolom lainnya seperti tugas, UTS, UAS...
    FOREIGN KEY (siswa_id) REFERENCES siswa(siswa_id),
    FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(mapel_id),
    FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(tahun_ajaran_id)
);
```

#### 5. `absensi`
```sql
CREATE TABLE absensi (
    absensi_id INT PRIMARY KEY AUTO_INCREMENT,
    siswa_id INT NOT NULL,
    tanggal DATE NOT NULL,
    status ENUM('Hadir', 'Sakit', 'Izin', 'Alpha') NOT NULL,
    tahun_ajaran_id INT NOT NULL,
    semester ENUM('Ganjil', 'Genap') NOT NULL,
    -- kolom lainnya...
    FOREIGN KEY (siswa_id) REFERENCES siswa(siswa_id),
    FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(tahun_ajaran_id)
);
```

---

## 📊 Query SQL untuk Transkrip Nilai

### Query Utama untuk Mendapatkan Transkrip
```sql
-- 1. Get Data Siswa
SELECT 
    s.siswa_id,
    s.nama,
    s.nisn,
    s.tempat_lahir,
    s.tanggal_lahir,
    s.nama_ortu,
    k.nama_kelas as kelas
FROM siswa s
LEFT JOIN siswa_kelas sk ON s.siswa_id = sk.siswa_id 
    AND sk.status = 'Aktif'
LEFT JOIN kelas k ON sk.kelas_id = k.kelas_id
WHERE s.siswa_id = :siswa_id
LIMIT 1;

-- 2. Get Riwayat Nilai per Semester (Loop untuk setiap tahun ajaran & semester)
SELECT 
    n.nilai_id,
    mp.mapel_id,
    mp.nama_mapel,
    n.nilai_akhir,
    n.grade,
    ta.nama_tahun_ajaran,
    n.semester,
    k.nama_kelas
FROM nilai n
INNER JOIN mata_pelajaran mp ON n.mapel_id = mp.mapel_id
INNER JOIN tahun_ajaran ta ON n.tahun_ajaran_id = ta.tahun_ajaran_id
LEFT JOIN siswa_kelas sk ON n.siswa_id = sk.siswa_id 
    AND n.tahun_ajaran_id = sk.tahun_ajaran_id 
    AND n.semester = sk.semester
LEFT JOIN kelas k ON sk.kelas_id = k.kelas_id
WHERE n.siswa_id = :siswa_id
ORDER BY ta.tahun_ajaran_id DESC, 
         FIELD(n.semester, 'Ganjil', 'Genap') ASC,
         mp.nama_mapel ASC;

-- 3. Get Rekapitulasi Absensi per Semester
SELECT 
    ta.nama_tahun_ajaran,
    a.semester,
    SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
    SUM(CASE WHEN a.status = 'Sakit' THEN 1 ELSE 0 END) as sakit,
    SUM(CASE WHEN a.status = 'Izin' THEN 1 ELSE 0 END) as izin,
    SUM(CASE WHEN a.status = 'Alpha' THEN 1 ELSE 0 END) as alpha
FROM absensi a
INNER JOIN tahun_ajaran ta ON a.tahun_ajaran_id = ta.tahun_ajaran_id
WHERE a.siswa_id = :siswa_id
GROUP BY ta.tahun_ajaran_id, a.semester
ORDER BY ta.tahun_ajaran_id DESC, 
         FIELD(a.semester, 'Ganjil', 'Genap') ASC;
```

### Query Gabungan (Optimized)
```sql
-- Menggunakan Common Table Expression (CTE)
WITH nilai_per_semester AS (
    SELECT 
        n.siswa_id,
        ta.tahun_ajaran_id,
        ta.nama_tahun_ajaran,
        n.semester,
        k.nama_kelas,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'mapel_id', mp.mapel_id,
                'nama_mapel', mp.nama_mapel,
                'nilai_akhir', n.nilai_akhir,
                'grade', n.grade
            )
        ) as nilai
    FROM nilai n
    INNER JOIN mata_pelajaran mp ON n.mapel_id = mp.mapel_id
    INNER JOIN tahun_ajaran ta ON n.tahun_ajaran_id = ta.tahun_ajaran_id
    LEFT JOIN siswa_kelas sk ON n.siswa_id = sk.siswa_id 
        AND n.tahun_ajaran_id = sk.tahun_ajaran_id 
        AND n.semester = sk.semester
    LEFT JOIN kelas k ON sk.kelas_id = k.kelas_id
    WHERE n.siswa_id = :siswa_id
    GROUP BY n.siswa_id, ta.tahun_ajaran_id, ta.nama_tahun_ajaran, n.semester, k.nama_kelas
),
absensi_per_semester AS (
    SELECT 
        a.siswa_id,
        ta.tahun_ajaran_id,
        a.semester,
        SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
        SUM(CASE WHEN a.status = 'Sakit' THEN 1 ELSE 0 END) as sakit,
        SUM(CASE WHEN a.status = 'Izin' THEN 1 ELSE 0 END) as izin,
        SUM(CASE WHEN a.status = 'Alpha' THEN 1 ELSE 0 END) as alpha
    FROM absensi a
    INNER JOIN tahun_ajaran ta ON a.tahun_ajaran_id = ta.tahun_ajaran_id
    WHERE a.siswa_id = :siswa_id
    GROUP BY a.siswa_id, ta.tahun_ajaran_id, a.semester
)
SELECT 
    nps.*,
    JSON_OBJECT(
        'hadir', COALESCE(aps.hadir, 0),
        'sakit', COALESCE(aps.sakit, 0),
        'izin', COALESCE(aps.izin, 0),
        'alpha', COALESCE(aps.alpha, 0)
    ) as absensi
FROM nilai_per_semester nps
LEFT JOIN absensi_per_semester aps 
    ON nps.siswa_id = aps.siswa_id 
    AND nps.tahun_ajaran_id = aps.tahun_ajaran_id
    AND nps.semester = aps.semester
ORDER BY nps.tahun_ajaran_id DESC, 
         FIELD(nps.semester, 'Ganjil', 'Genap') ASC;
```

---

## 🔧 Backend Implementation (Node.js/Express Example)

### Controller Example

```javascript
// controllers/admin/laporanController.js
const LaporanService = require('../../services/admin/laporanService');

class LaporanController {
  // GET /api/admin/laporan/siswa
  async getSiswaList(req, res) {
    try {
      const { kelas_id, tahun_ajaran_id, search } = req.query;
      
      const siswaList = await LaporanService.getSiswaList({
        kelas_id,
        tahun_ajaran_id,
        search
      });
      
      return res.status(200).json({
        success: true,
        message: 'Daftar siswa berhasil diambil',
        data: siswaList
      });
    } catch (error) {
      console.error('Error getting siswa list:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error.message
      });
    }
  }

  // GET /api/admin/laporan/transkrip/:siswa_id
  async getTranskripNilai(req, res) {
    try {
      const { siswa_id } = req.params;
      
      // Validasi siswa_id
      if (!siswa_id || isNaN(siswa_id)) {
        return res.status(400).json({
          success: false,
          message: 'ID siswa tidak valid'
        });
      }
      
      const transkrip = await LaporanService.getTranskripNilai(siswa_id);
      
      if (!transkrip) {
        return res.status(404).json({
          success: false,
          message: 'Siswa tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Transkrip nilai berhasil diambil',
        data: transkrip
      });
    } catch (error) {
      console.error('Error getting transkrip:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error.message
      });
    }
  }

  // GET /api/admin/laporan/transkrip/:siswa_id/pdf
  async downloadTranskripPDF(req, res) {
    try {
      const { siswa_id } = req.params;
      
      // Validasi siswa_id
      if (!siswa_id || isNaN(siswa_id)) {
        return res.status(400).json({
          success: false,
          message: 'ID siswa tidak valid'
        });
      }
      
      // Generate PDF
      const pdfBuffer = await LaporanService.generateTranskripPDF(siswa_id);
      
      if (!pdfBuffer) {
        return res.status(404).json({
          success: false,
          message: 'Data transkrip tidak ditemukan'
        });
      }
      
      // Get siswa info for filename
      const siswa = await LaporanService.getSiswaInfo(siswa_id);
      const filename = `Transkrip_${siswa.nama.replace(/\s/g, '_')}_${siswa.nisn}.pdf`;
      
      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF
      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal generate PDF',
        error: error.message
      });
    }
  }
}

module.exports = new LaporanController();
```

### Service Example

```javascript
// services/admin/laporanService.js
const db = require('../../config/database');
const PDFDocument = require('pdfkit');

class LaporanService {
  async getSiswaList(filters = {}) {
    let query = `
      SELECT DISTINCT
        s.siswa_id,
        s.nama,
        s.nisn,
        k.nama_kelas as kelas,
        k.kelas_id
      FROM siswa s
      LEFT JOIN siswa_kelas sk ON s.siswa_id = sk.siswa_id
      LEFT JOIN kelas k ON sk.kelas_id = k.kelas_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.kelas_id) {
      query += ` AND k.kelas_id = ?`;
      params.push(filters.kelas_id);
    }
    
    if (filters.tahun_ajaran_id) {
      query += ` AND sk.tahun_ajaran_id = ?`;
      params.push(filters.tahun_ajaran_id);
    }
    
    if (filters.search) {
      query += ` AND (s.nama LIKE ? OR s.nisn LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    query += ` ORDER BY s.nama ASC`;
    
    const [rows] = await db.query(query, params);
    return rows;
  }

  async getTranskripNilai(siswa_id) {
    // Get siswa info
    const siswa = await this.getSiswaInfo(siswa_id);
    
    if (!siswa) {
      return null;
    }
    
    // Get riwayat nilai
    const riwayatNilai = await this.getRiwayatNilai(siswa_id);
    
    return {
      siswa,
      riwayat_nilai: riwayatNilai
    };
  }

  async getSiswaInfo(siswa_id) {
    const query = `
      SELECT 
        s.siswa_id,
        s.nama,
        s.nisn,
        s.tempat_lahir,
        s.tanggal_lahir,
        s.nama_ortu,
        k.nama_kelas as kelas
      FROM siswa s
      LEFT JOIN siswa_kelas sk ON s.siswa_id = sk.siswa_id AND sk.status = 'Aktif'
      LEFT JOIN kelas k ON sk.kelas_id = k.kelas_id
      WHERE s.siswa_id = ?
      LIMIT 1
    `;
    
    const [rows] = await db.query(query, [siswa_id]);
    return rows[0] || null;
  }

  async getRiwayatNilai(siswa_id) {
    // Get semua semester yang pernah diikuti
    const semesterQuery = `
      SELECT DISTINCT
        ta.tahun_ajaran_id,
        ta.nama_tahun_ajaran as tahun_ajaran,
        n.semester,
        k.nama_kelas as kelas
      FROM nilai n
      INNER JOIN tahun_ajaran ta ON n.tahun_ajaran_id = ta.tahun_ajaran_id
      LEFT JOIN siswa_kelas sk ON n.siswa_id = sk.siswa_id 
        AND n.tahun_ajaran_id = sk.tahun_ajaran_id 
        AND n.semester = sk.semester
      LEFT JOIN kelas k ON sk.kelas_id = k.kelas_id
      WHERE n.siswa_id = ?
      ORDER BY ta.tahun_ajaran_id DESC, 
               FIELD(n.semester, 'Ganjil', 'Genap') ASC
    `;
    
    const [semesters] = await db.query(semesterQuery, [siswa_id]);
    
    const riwayat = [];
    
    for (const sem of semesters) {
      // Get nilai untuk semester ini
      const nilaiQuery = `
        SELECT 
          mp.mapel_id,
          mp.nama_mapel,
          n.nilai_akhir,
          n.grade
        FROM nilai n
        INNER JOIN mata_pelajaran mp ON n.mapel_id = mp.mapel_id
        WHERE n.siswa_id = ? 
          AND n.tahun_ajaran_id = ? 
          AND n.semester = ?
        ORDER BY mp.nama_mapel ASC
      `;
      
      const [nilai] = await db.query(nilaiQuery, [
        siswa_id,
        sem.tahun_ajaran_id,
        sem.semester
      ]);
      
      // Get absensi untuk semester ini
      const absensiQuery = `
        SELECT 
          SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
          SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END) as sakit,
          SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as izin,
          SUM(CASE WHEN status = 'Alpha' THEN 1 ELSE 0 END) as alpha
        FROM absensi
        WHERE siswa_id = ? 
          AND tahun_ajaran_id = ? 
          AND semester = ?
      `;
      
      const [absensi] = await db.query(absensiQuery, [
        siswa_id,
        sem.tahun_ajaran_id,
        sem.semester
      ]);
      
      riwayat.push({
        id: `ta${sem.tahun_ajaran_id}-${sem.semester.toLowerCase()}`,
        tahun_ajaran: sem.tahun_ajaran,
        tahun_ajaran_id: sem.tahun_ajaran_id,
        semester: sem.semester,
        kelas: sem.kelas,
        absensi: absensi[0] || { hadir: 0, sakit: 0, izin: 0, alpha: 0 },
        nilai: nilai
      });
    }
    
    return riwayat;
  }

  async generateTranskripPDF(siswa_id) {
    const transkrip = await this.getTranskripNilai(siswa_id);
    
    if (!transkrip) {
      return null;
    }
    
    // Create PDF using pdfkit or similar library
    // This is a simplified example
    const doc = new PDFDocument();
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      doc.on('error', reject);
      
      // Add content to PDF
      doc.fontSize(20).text('TRANSKRIP NILAI SISWA', { align: 'center' });
      doc.moveDown();
      
      // Siswa info
      doc.fontSize(12).text(`Nama: ${transkrip.siswa.nama}`);
      doc.text(`NISN: ${transkrip.siswa.nisn}`);
      doc.text(`Kelas: ${transkrip.siswa.kelas}`);
      doc.moveDown();
      
      // Riwayat nilai
      transkrip.riwayat_nilai.forEach(semester => {
        doc.fontSize(14).text(`${semester.tahun_ajaran} - Semester ${semester.semester}`);
        doc.moveDown(0.5);
        
        // Table header
        doc.fontSize(10);
        // ... add table content
        
        doc.moveDown();
      });
      
      doc.end();
    });
  }
}

module.exports = new LaporanService();
```

### Routes Example

```javascript
// routes/admin/laporanRoutes.js
const express = require('express');
const router = express.Router();
const laporanController = require('../../controllers/admin/laporanController');
const { authenticateToken, isAdmin } = require('../../middleware/auth');

// Middleware untuk semua route
router.use(authenticateToken);
router.use(isAdmin);

// Routes
router.get('/siswa', laporanController.getSiswaList);
router.get('/transkrip/:siswa_id', laporanController.getTranskripNilai);
router.get('/transkrip/:siswa_id/pdf', laporanController.downloadTranskripPDF);

module.exports = router;
```

---

## 🔐 Authentication & Authorization

### Middleware yang Diperlukan

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

// Verify JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Token invalid atau expired'
      });
    }
    
    req.user = user;
    next();
  });
}

// Check if user is Admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak - Hanya untuk Admin'
    });
  }
  next();
}

module.exports = { authenticateToken, isAdmin };
```

---

## 📦 Required NPM Packages

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.2",
    "pdfkit": "^0.13.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  }
}
```

---

## 🧪 Testing dengan Postman/Thunder Client

### 1. Get Daftar Siswa
```
GET http://localhost:3000/api/admin/laporan/siswa
Headers:
  Authorization: Bearer your_token_here
```

### 2. Get Transkrip Nilai
```
GET http://localhost:3000/api/admin/laporan/transkrip/1
Headers:
  Authorization: Bearer your_token_here
```

### 3. Download PDF
```
GET http://localhost:3000/api/admin/laporan/transkrip/1/pdf
Headers:
  Authorization: Bearer your_token_here
```

---

## 📝 Notes & Best Practices

1. **Caching**: Implementasikan caching untuk data yang jarang berubah
2. **Pagination**: Tambahkan pagination untuk endpoint daftar siswa jika data banyak
3. **Rate Limiting**: Batasi jumlah request untuk mencegah abuse
4. **Validation**: Gunakan library seperti `joi` atau `express-validator` untuk validasi input
5. **Error Logging**: Gunakan library seperti `winston` untuk logging error
6. **PDF Generation**: Pertimbangkan menggunakan queue (Redis/Bull) untuk generate PDF di background
7. **File Storage**: Simpan PDF yang sudah di-generate untuk menghindari regenerasi berulang
8. **Compression**: Compress response JSON untuk menghemat bandwidth

---

## 🔄 Integration di Frontend

File service sudah ada di struktur project:
```
src/services/Admin/laporan/LaporanService.js
```

Contoh implementasi:
```javascript
import api from '../../api';

export const LaporanService = {
  // Get daftar siswa
  async getSiswaList(params = {}) {
    const response = await api.get('/admin/laporan/siswa', { params });
    return response.data;
  },

  // Get transkrip nilai
  async getTranskripNilai(siswaId) {
    const response = await api.get(`/admin/laporan/transkrip/${siswaId}`);
    return response.data;
  },

  // Download PDF
  async downloadTranskripPDF(siswaId) {
    const response = await api.get(`/admin/laporan/transkrip/${siswaId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
```

---

**Dokumentasi dibuat pada:** November 9, 2025  
**Versi:** 1.0  
**Author:** Development Team
