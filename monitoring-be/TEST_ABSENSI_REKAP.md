# 🧪 Test Scenarios - Tab Rekap Absensi

## 📋 **Test Configuration**

**Assume:**
- Tahun Ajaran Aktif: `2024-08-01` to `2025-01-31`
- Today: `2024-11-04`
- Guru Wali Kelas: `guru_id = 5`, `kelas_id = 17`
- Guru Mapel: `guru_id = 6`, mengajar di kelas `17, 18, 19`

---

## ✅ **Test Suite 1: Wali Kelas - Success Cases**

### **Test 1.1: Valid Periode (Dalam Semester)**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 200 OK**
```json
{
  "status": "success",
  "data": {
    "kelas": {
      "kelas_id": 17,
      "nama_kelas": "5A"
    },
    "periode": {
      "tanggal_mulai": "2024-10-01",
      "tanggal_akhir": "2024-10-31",
      "total_pertemuan": 22
    },
    "statistik": {
      "total_siswa": 30,
      "rata_rata_kehadiran": 95.5
    },
    "rekap": [...]
  }
}
```

### **Test 1.2: Periode Semester Mulai sampai Hari Ini**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-08-01&tanggal_akhir=2024-11-04
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 200 OK** (Full semester data)

### **Test 1.3: Periode 1 Hari Saja (Today)**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-11-04&tanggal_akhir=2024-11-04
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 200 OK** (Data untuk 1 hari)

---

## ❌ **Test Suite 2: Wali Kelas - Error Cases**

### **Test 2.1: Future Date**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-11-05&tanggal_akhir=2024-11-10
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 400 Bad Request**
```json
{
  "status": "error",
  "message": "Tidak bisa membuat rekap untuk tanggal yang akan datang",
  "data": null
}
```

### **Test 2.2: Before Semester Start**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-07-01&tanggal_akhir=2024-07-31
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 400 Bad Request**
```json
{
  "status": "error",
  "message": "Periode rekap harus dalam semester aktif (2024-08-01 sampai 2024-11-04)",
  "data": null
}
```

### **Test 2.3: After Semester End**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2025-02-01&tanggal_akhir=2025-02-28
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 400 Bad Request**
```json
{
  "status": "error",
  "message": "Periode rekap tidak boleh melebihi tanggal selesai semester (2025-01-31)",
  "data": null
}
```

### **Test 2.4: Mixed (Start Valid, End Future)**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-11-01&tanggal_akhir=2024-11-10
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 400 Bad Request** (Future date not allowed)

### **Test 2.5: Tanggal Mulai > Tanggal Akhir**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-31&tanggal_akhir=2024-10-01
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 400 Bad Request**
```json
{
  "status": "error",
  "message": "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
  "data": null
}
```

### **Test 2.6: Invalid Date Format**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=01-10-2024&tanggal_akhir=31-10-2024
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 400 Bad Request** (Format harus YYYY-MM-DD)

### **Test 2.7: Missing Parameters**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 400 Bad Request** (tanggal_akhir required)

---

## ✅ **Test Suite 3: Guru Mapel - Success Cases**

### **Test 3.1: Valid Periode dengan Kelas ID**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31&kelas_id=17
Authorization: Bearer {guru_mapel_token}
```

**Expected Result: 200 OK** (Rekap untuk kelas 17)

### **Test 3.2: Multiple Kelas (Sequential Requests)**
```http
# Request 1
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31&kelas_id=17

# Request 2
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31&kelas_id=18

# Request 3
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31&kelas_id=19
```

**Expected Result: 200 OK** (Each return different kelas data)

---

## ❌ **Test Suite 4: Guru Mapel - Error Cases**

### **Test 4.1: Missing kelas_id**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31
Authorization: Bearer {guru_mapel_token}
```

**Expected Result: 400 Bad Request**
```json
{
  "status": "error",
  "message": "Parameter kelas_id wajib untuk guru mapel",
  "data": null
}
```

### **Test 4.2: Kelas Not Taught by Guru**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31&kelas_id=99
Authorization: Bearer {guru_mapel_token}
```

**Expected Result: 403 Forbidden**
```json
{
  "status": "error",
  "message": "Anda tidak mengajar di kelas ini",
  "data": null
}
```

### **Test 4.3: Future Date (Same as Wali Kelas)**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-11-05&tanggal_akhir=2024-11-10&kelas_id=17
Authorization: Bearer {guru_mapel_token}
```

**Expected Result: 400 Bad Request** (Future date not allowed)

---

## 🕐 **Test Suite 5: Timezone & Date Format**

### **Test 5.1: ISO 8601 Date Format**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01T00:00:00.000Z&tanggal_akhir=2024-10-31T23:59:59.999Z
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 200 OK** (Backend converts to YYYY-MM-DD)

### **Test 5.2: Edge of Semester Start**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-08-01&tanggal_akhir=2024-08-01
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 200 OK** (First day of semester)

### **Test 5.3: Edge of Today**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-11-04&tanggal_akhir=2024-11-04
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 200 OK** (Today is allowed)

---

## 🎯 **Test Suite 6: Semester Status**

### **Test 6.1: Semester Not Started**
**Assume:**
- Today: `2024-07-15`
- Semester: `2024-08-01` to `2025-01-31`

```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-08-01&tanggal_akhir=2024-08-31
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 400 Bad Request**
```json
{
  "status": "error",
  "message": "Periode rekap harus dalam semester aktif (2024-08-01 sampai 2024-07-15)",
  "data": null
}
```
> Note: Even though date range is valid, today < semester start = error

### **Test 6.2: Semester Ended (Backdate Still Allowed)**
**Assume:**
- Today: `2025-02-15`
- Semester: `2024-08-01` to `2025-01-31`

```http
GET /api/guru/absensi/rekap?tanggal_mulai=2025-01-01&tanggal_akhir=2025-01-31
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 200 OK** (Backdate allowed, within semester range)

---

## 📊 **Test Suite 7: Data Integrity**

### **Test 7.1: Empty Data (No Absensi in Period)**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-08-01&tanggal_akhir=2024-08-07
Authorization: Bearer {wali_kelas_token}
```

**Expected Result: 200 OK**
```json
{
  "status": "success",
  "data": {
    "statistik": {
      "rata_rata_kehadiran": 0
    },
    "rekap": []  // Empty array
  }
}
```

### **Test 7.2: Partial Data (Some Students No Absensi)**
Should return all students with 0 values for students without absensi data.

---

## 🔒 **Test Suite 8: Authorization**

### **Test 8.1: No Token**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31
```

**Expected Result: 401 Unauthorized**

### **Test 8.2: Invalid Token**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31
Authorization: Bearer invalid_token_123
```

**Expected Result: 401 Unauthorized**

### **Test 8.3: Non-Guru Role (e.g., Ortu)**
```http
GET /api/guru/absensi/rekap?tanggal_mulai=2024-10-01&tanggal_akhir=2024-10-31
Authorization: Bearer {ortu_token}
```

**Expected Result: 403 Forbidden**

---

## 📋 **Test Checklist**

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| 1.1 | Wali Kelas - Valid periode | ⬜ | |
| 1.2 | Wali Kelas - Full semester | ⬜ | |
| 1.3 | Wali Kelas - 1 hari | ⬜ | |
| 2.1 | Wali Kelas - Future date | ⬜ | |
| 2.2 | Wali Kelas - Before semester | ⬜ | |
| 2.3 | Wali Kelas - After semester | ⬜ | |
| 2.4 | Wali Kelas - Mixed validity | ⬜ | |
| 2.5 | Wali Kelas - Invalid range | ⬜ | |
| 2.6 | Wali Kelas - Invalid format | ⬜ | |
| 2.7 | Wali Kelas - Missing params | ⬜ | |
| 3.1 | Guru Mapel - Valid with kelas | ⬜ | |
| 3.2 | Guru Mapel - Multiple kelas | ⬜ | |
| 4.1 | Guru Mapel - Missing kelas_id | ⬜ | |
| 4.2 | Guru Mapel - Unauthorized kelas | ⬜ | |
| 4.3 | Guru Mapel - Future date | ⬜ | |
| 5.1 | ISO 8601 format | ⬜ | |
| 5.2 | Edge - semester start | ⬜ | |
| 5.3 | Edge - today | ⬜ | |
| 6.1 | Semester not started | ⬜ | |
| 6.2 | Semester ended backdate | ⬜ | |
| 7.1 | Empty data | ⬜ | |
| 7.2 | Partial data | ⬜ | |
| 8.1 | No token | ⬜ | |
| 8.2 | Invalid token | ⬜ | |
| 8.3 | Wrong role | ⬜ | |

---

## 🎯 **Summary of Expected Behavior**

### **✅ Valid Scenarios:**
- Periode dalam semester aktif (tanggal_mulai_semester <= periode <= today)
- Wali kelas tanpa kelas_id (auto-detect)
- Guru mapel dengan kelas_id yang diampu
- ISO 8601 atau YYYY-MM-DD format
- Backdate dalam range semester

### **❌ Invalid Scenarios:**
- Future date (> today)
- Before semester start
- After semester end
- Tanggal mulai > tanggal akhir
- Guru mapel tanpa kelas_id
- Guru mapel akses kelas yang tidak diampu
- Invalid date format
- Missing required parameters
- Unauthorized access

---

**Last Updated:** November 4, 2025

