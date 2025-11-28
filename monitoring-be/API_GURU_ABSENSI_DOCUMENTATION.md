# 📚 API Documentation - Absensi Guru

**Base URL:** `/api/guru/absensi`  
**Authentication:** Required (JWT Token, role: `guru`)

---

## 🔐 **Business Rules**

### **Date Validation Rules:**

1. ✅ **Backdate Allowed:** Guru bisa input absensi untuk tanggal yang sudah lewat (dalam range semester)
2. ❌ **No Future Date:** Tidak bisa input absensi untuk tanggal yang akan datang (maksimal hari ini)
3. ✅ **Semester Range:** Tanggal harus dalam range `tanggal_mulai` sampai `tanggal_selesai` tahun ajaran aktif
4. ⚠️ **Semester Not Started:** Jika semester belum dimulai, tampilkan info card (no data, no input form)
5. ✅ **Semester Ended:** Jika semester sudah selesai, masih bisa input backdate dalam range

### **Example Scenarios:**

**Scenario 1: Semester Belum Dimulai**
- Today: `2025-11-04`
- Semester: `2027-12-12` to `2028-01-01`
- **Result:** Show info card, hide form ⚠️

**Scenario 2: Semester Active**
- Today: `2027-12-15`
- Semester: `2027-12-12` to `2028-01-01`
- **Result:** Can input for `2027-12-12` to `2027-12-15` ✅

**Scenario 3: Semester Ended**
- Today: `2028-01-05`
- Semester: `2027-12-12` to `2028-01-01`
- **Result:** Can input backdate for `2027-12-12` to `2028-01-01` ✅

---

## 📋 **API List**

| No | Method | Endpoint | Purpose | Wali Kelas | Guru Mapel |
|----|--------|----------|---------|------------|------------|
| **1** | `GET` | `/date-range` | Get date range + semester status | ✅ | ✅ |
| **2** | `GET` | `/kelas-saya` | Get daftar kelas yang diampu | ✅ | ✅ |
| **3** | `GET` | `/siswa` | Get daftar siswa + status absensi | ✅ | ✅ |
| **4** | `POST` | `/save` | Save/update absensi | ✅ | ❌ |
| **5** | `GET` | `/rekap` | Get rekap absensi periode | ✅ | ✅ |

---

## 📄 **API Details**

### **1. GET `/api/guru/absensi/date-range`**

Get valid date range untuk input absensi + semester status.

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)

#### **Query Parameters:**
None

#### **Response (200 - Success):**

**Case 1: Semester Belum Dimulai**
```json
{
  "status": "success",
  "data": {
    "tahun_ajaran_id": 17,
    "tahun_ajaran": "2027/2028",
    "semester": "Genap",
    "tanggal_mulai": "2027-12-12",
    "tanggal_selesai": "2028-01-01",
    "today": "2025-11-04",
    "semester_status": "not_started",
    "info_message": "Semester Genap 2027/2028 belum dimulai. Semester akan dimulai pada 12/12/2027."
  }
}
```

**Case 2: Semester Active**
```json
{
  "status": "success",
  "data": {
    "tahun_ajaran_id": 17,
    "tahun_ajaran": "2027/2028",
    "semester": "Genap",
    "tanggal_mulai": "2027-12-12",
    "tanggal_selesai": "2028-01-01",
    "today": "2027-12-15",
    "semester_status": "active",
    "info_message": null
  }
}
```

**Case 3: Semester Ended**
```json
{
  "status": "success",
  "data": {
    "tahun_ajaran_id": 17,
    "tahun_ajaran": "2027/2028",
    "semester": "Genap",
    "tanggal_mulai": "2027-12-12",
    "tanggal_selesai": "2028-01-01",
    "today": "2028-01-05",
    "semester_status": "ended",
    "info_message": "Semester Genap 2027/2028 telah berakhir pada 01/01/2028. Anda masih bisa input absensi untuk tanggal dalam periode semester."
  }
}
```

#### **Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `tahun_ajaran_id` | Number | ID tahun ajaran aktif |
| `tahun_ajaran` | String | Nama tahun ajaran (e.g., "2027/2028") |
| `semester` | String | Semester aktif ("Ganjil" / "Genap") |
| `tanggal_mulai` | String | Tanggal mulai semester (YYYY-MM-DD) |
| `tanggal_selesai` | String | Tanggal selesai semester (YYYY-MM-DD) |
| `today` | String | Tanggal hari ini (YYYY-MM-DD) |
| `semester_status` | String | Status semester: `"not_started"` / `"active"` / `"ended"` |
| `info_message` | String\|null | Pesan info untuk FE (null jika active) |

#### **Frontend Integration:**

```javascript
const { data } = await fetch('/api/guru/absensi/date-range');

if (data.semester_status === 'not_started') {
  // Show info card with data.info_message
  // Hide: date picker, table, radio buttons, save button
  return <InfoCard message={data.info_message} />;
}

if (data.semester_status === 'ended') {
  // Show info banner with data.info_message
  // Allow backdate input (date picker limited to range)
}

// Set date picker limits
<input 
  type="date" 
  min={data.tanggal_mulai}  // "2027-12-12"
  max={data.today}          // "2027-12-15" (no future)
/>
```

---

### **2. GET `/api/guru/absensi/kelas-saya`**

Get daftar kelas yang diampu guru (untuk dropdown).

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)

#### **Response (200 - Wali Kelas):**
```json
{
  "status": "success",
  "data": {
    "is_wali_kelas": true,
    "kelas_list": [
      {
        "kelas_id": 17,
        "nama_kelas": "5A",
        "role_guru": "Wali Kelas",
        "total_siswa": 30
      }
    ]
  }
}
```

#### **Response (200 - No Class Assigned):**
```json
{
  "status": "success",
  "data": {
    "is_wali_kelas": false,
    "kelas_list": [],
    "message": "Anda belum di-assign ke kelas manapun. Silakan hubungi admin."
  }
}
```

#### **Response (200 - Guru Mapel):**
```json
{
  "status": "success",
  "data": {
    "is_wali_kelas": false,
    "kelas_list": [
      {
        "kelas_id": 17,
        "nama_kelas": "5A",
        "role_guru": "Guru Mapel",
        "mata_pelajaran": "Matematika",
        "total_siswa": 30,
        "label": "5A - Matematika"
      },
      {
        "kelas_id": 18,
        "nama_kelas": "5B",
        "role_guru": "Guru Mapel",
        "mata_pelajaran": "Matematika",
        "total_siswa": 28,
        "label": "5B - Matematika"
      }
    ]
  }
}
```

---

### **3. GET `/api/guru/absensi/siswa`**

Get daftar siswa dengan status absensi untuk tanggal tertentu.

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)

#### **Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tanggal` | String | ✅ **Yes** | Format: YYYY-MM-DD atau ISO 8601 |
| `kelas_id` | Number | **Wali Kelas:** ❌ No<br>**Guru Mapel:** ✅ Yes | ID kelas |

#### **Response (200 - Success):**

**Case 1: Normal (Semester Active/Ended)**
```json
{
  "status": "success",
  "data": {
    "kelas": {
      "kelas_id": 17,
      "nama_kelas": "5A",
      "tahun_ajaran": "2027/2028",
      "semester": "Genap",
      "role_guru": "Wali Kelas"
    },
    "tanggal": "2027-12-15",
    "statistics": {
      "total": 30,
      "hadir": 25,
      "sakit": 2,
      "izin": 1,
      "alpha": 0,
      "belum_dipilih": 2
    },
    "siswa": [
      {
        "no": 1,
        "siswa_id": 1,
        "nisn": "0012345678",
        "nama_siswa": "Ahmad Fauzi",
        "absensi_id": 123,
        "status": "H",
        "sudah_absen": true,
        "input_by": 5
      },
      {
        "no": 2,
        "siswa_id": 2,
        "nisn": "0012345679",
        "nama_siswa": "Siti Aminah",
        "absensi_id": null,
        "status": null,
        "sudah_absen": false,
        "input_by": null
      }
    ]
  }
}
```

**Case 2: Semester Not Started**
```json
{
  "status": "success",
  "data": {
    "kelas": null,
    "tanggal": "2027-12-15",
    "semester_status": "not_started",
    "info_message": "Semester Genap 2027/2028 belum dimulai. Semester akan dimulai pada 12/12/2027.",
    "statistics": {
      "total": 0,
      "hadir": 0,
      "sakit": 0,
      "izin": 0,
      "alpha": 0,
      "belum_dipilih": 0
    },
    "siswa": []
  }
}
```

#### **Error Responses:**

**400 - Future Date:**
```json
{
  "status": "error",
  "message": "Tidak bisa input absensi untuk tanggal yang akan datang",
  "data": null
}
```

**400 - Out of Range:**
```json
{
  "status": "error",
  "message": "Tanggal harus antara 2027-12-12 sampai 2028-01-01",
  "data": null
}
```

#### **Frontend Integration:**

```javascript
const response = await fetch(`/api/guru/absensi/siswa?tanggal=${date}`);

if (response.data.semester_status === 'not_started') {
  // Show info card, hide form
  return <InfoCard message={response.data.info_message} />;
}

// Render card statistik
<StatsCard stats={response.data.statistics} />

// Render tabel siswa
<TableSiswa siswa={response.data.siswa} />
```

---

### **4. POST `/api/guru/absensi/save`**

Save/update absensi siswa.

⚠️ **WALI KELAS ONLY!**

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)
- ✅ User must be **Wali Kelas**

#### **Request Body:**
```json
{
  "tanggal": "2027-12-15",
  "absensi": [
    {
      "siswa_id": 1,
      "status": "H"
    },
    {
      "siswa_id": 2,
      "status": "S"
    }
  ]
}
```

#### **Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tanggal` | String | ✅ Yes | Format: YYYY-MM-DD atau ISO 8601 |
| `absensi` | Array | ✅ Yes | Array of {siswa_id, status} |
| `absensi[].siswa_id` | Number | ✅ Yes | ID siswa |
| `absensi[].status` | String | ✅ Yes | Status: `"H"`, `"S"`, `"I"`, `"A"` |

#### **Response (200 - Success):**
```json
{
  "status": "success",
  "message": "Absensi berhasil disimpan untuk 30 siswa",
  "data": {
    "total_siswa": 30,
    "inserted": 2,
    "updated": 28,
    "statistics": {
      "hadir": 25,
      "sakit": 2,
      "izin": 1,
      "alpha": 2
    },
    "kelas": {
      "kelas_id": 17,
      "nama_kelas": "5A"
    },
    "tanggal": "2027-12-15"
  }
}
```

#### **Error Responses:**

**400 - Semester Not Started:**
```json
{
  "status": "error",
  "message": "Semester Genap 2027/2028 belum dimulai. Semester akan dimulai pada 12/12/2027.",
  "data": null
}
```

**400 - Future Date:**
```json
{
  "status": "error",
  "message": "Tidak bisa menyimpan absensi untuk tanggal yang akan datang",
  "data": null
}
```

**403 - Not Wali Kelas:**
```json
{
  "status": "error",
  "message": "Hanya wali kelas yang dapat input absensi",
  "data": null
}
```

---

### **5. GET `/api/guru/absensi/rekap`**

Get rekap absensi untuk periode tertentu.

#### **Authorization:**
- ✅ JWT Token required (role: `guru`)

#### **Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tanggal_mulai` | String | ✅ **Yes** | Format: YYYY-MM-DD atau ISO 8601 |
| `tanggal_akhir` | String | ✅ **Yes** | Format: YYYY-MM-DD atau ISO 8601 |
| `kelas_id` | Number | **Wali Kelas:** ❌ No<br>**Guru Mapel:** ✅ Yes | ID kelas |

#### **Response (200 - Success):**
```json
{
  "status": "success",
  "data": {
    "kelas": {
      "kelas_id": 17,
      "nama_kelas": "5A",
      "tahun_ajaran": "2027/2028",
      "semester": "Genap",
      "role_guru": "Wali Kelas"
    },
    "periode": {
      "tanggal_mulai": "2027-12-12",
      "tanggal_akhir": "2027-12-20",
      "total_pertemuan": 7
    },
    "statistik": {
      "total_siswa": 30,
      "rata_rata_kehadiran": 93.33,
      "total_hadir": 196,
      "total_sakit": 8,
      "total_izin": 4,
      "total_alpha": 2
    },
    "rekap": [
      {
        "siswa_id": 1,
        "nisn": "0012345678",
        "nama_lengkap": "Ahmad Fauzi",
        "hadir": 7,
        "sakit": 0,
        "izin": 0,
        "alpha": 0,
        "persentase_hadir": 100
      }
    ]
  }
}
```

#### **Error Responses:**

**400 - Invalid Date Range:**
```json
{
  "status": "error",
  "message": "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
  "data": null
}
```

**400 - Out of Semester Range:**
```json
{
  "status": "error",
  "message": "Periode rekap harus dalam semester aktif (2024-08-01 sampai 2025-11-04)",
  "data": null
}
```

**400 - Exceeds Semester End:**
```json
{
  "status": "error",
  "message": "Periode rekap tidak boleh melebihi tanggal selesai semester (2025-01-31)",
  "data": null
}
```

**400 - Future Date:**
```json
{
  "status": "error",
  "message": "Tidak bisa membuat rekap untuk tanggal yang akan datang",
  "data": null
}
```

#### **Notes:**
- ✅ Rekap **dibatasi** oleh semester aktif saja
- ❌ Tidak bisa rekap untuk semester lama (data sudah reset/archived)
- ✅ Periode harus: `tanggal_mulai_semester <= periode <= today`
- ⚠️ **Reason:** Guru hanya handle 1 semester, siswa naik kelas = data baru

---

## 🎯 **Validation Summary**

### **Date Range Validation:**

| Condition | GET /siswa | POST /save | GET /rekap |
|-----------|------------|------------|------------|
| **Future date** | ❌ Error 400 | ❌ Error 400 | ❌ Error 400 |
| **Before semester start** | ❌ Error 400 | ❌ Error 400 | ❌ Error 400 |
| **After semester end** | ❌ Error 400 | ❌ Error 400 | ❌ Error 400 |
| **Today < semester start** | ⚠️ Return empty + info | ❌ Error 400 | ❌ Error 400 |
| **Backdate in range** | ✅ Allowed | ✅ Allowed | ✅ Allowed |

**Note:** Semua API dibatasi oleh semester aktif (guru hanya handle 1 semester)

### **Access Control:**

| Action | Wali Kelas | Guru Mapel |
|--------|------------|------------|
| View date range | ✅ | ✅ |
| View kelas list | ✅ (1 kelas) | ✅ (multiple) |
| View siswa absensi | ✅ (auto kelas) | ✅ (pilih kelas) |
| Save absensi | ✅ | ❌ (403 Forbidden) |
| View rekap | ✅ (auto kelas) | ✅ (pilih kelas) |

---

## 🧪 **Testing Guide**

### **Test 1: Semester Not Started**
```bash
# Current date: 2025-11-04
# Semester: 2027-12-12 to 2028-01-01

# 1. Get date range
GET /api/guru/absensi/date-range
Expected: semester_status = "not_started"

# 2. Try get siswa
GET /api/guru/absensi/siswa?tanggal=2027-12-15
Expected: Empty siswa array + info_message

# 3. Try save absensi
POST /api/guru/absensi/save
Body: { "tanggal": "2027-12-15", "absensi": [...] }
Expected: 400 Error "Semester belum dimulai"
```

### **Test 2: Future Date (During Semester)**
```bash
# Current date: 2027-12-15
# Semester: 2027-12-12 to 2028-01-01

# Try input for tomorrow
GET /api/guru/absensi/siswa?tanggal=2027-12-16
Expected: 400 Error "Tidak bisa input absensi untuk tanggal yang akan datang"

POST /api/guru/absensi/save
Body: { "tanggal": "2027-12-16", "absensi": [...] }
Expected: 400 Error "Tidak bisa menyimpan absensi untuk tanggal yang akan datang"
```

### **Test 3: Backdate (Semester Ended)**
```bash
# Current date: 2028-01-05
# Semester: 2027-12-12 to 2028-01-01

# Get date range
GET /api/guru/absensi/date-range
Expected: semester_status = "ended", info_message = "... masih bisa input absensi"

# Input backdate
POST /api/guru/absensi/save
Body: { "tanggal": "2027-12-31", "absensi": [...] }
Expected: 200 Success (backdate allowed)
```

---

## 📱 **Frontend Implementation Example**

### **Tab Rekap Absensi:**

#### **For Wali Kelas:**
```javascript
// 1. Get date range for semester limits
const dateRange = await fetch('/api/guru/absensi/date-range');

// 2. Check semester status
if (dateRange.semester_status === 'not_started') {
  return (
    <InfoCard 
      icon="⚠️" 
      title="Semester Belum Dimulai"
      message={dateRange.info_message}
    />
  );
}

// 3. Set date range picker limits
<DateRangePicker>
  <input 
    type="date"
    name="tanggal_mulai"
    min={dateRange.tanggal_mulai}  // Semester start
    max={dateRange.today}           // Today (no future)
    value={dateRange.tanggal_mulai} // Default: semester start
  />
  <input 
    type="date"
    name="tanggal_akhir"
    min={dateRange.tanggal_mulai}  // Semester start
    max={dateRange.today}           // Today (no future)
    value={dateRange.today}         // Default: today
  />
  <button onClick={handleTampilkan}>Tampilkan</button>
</DateRangePicker>

// 4. Get rekap data (no kelas_id needed for wali kelas)
const rekap = await fetch(
  `/api/guru/absensi/rekap?tanggal_mulai=${startDate}&tanggal_akhir=${endDate}`
);

// 5. Display results
<StatistikCard>
  <div>Total Pertemuan: {rekap.periode.total_pertemuan}</div>
  <div>Rata-rata Kehadiran: {rekap.statistik.rata_rata_kehadiran}%</div>
</StatistikCard>

<TableRekap data={rekap.rekap} />
```

#### **For Guru Mapel:**
```javascript
// 1. Get date range AND kelas list
const [dateRange, kelasList] = await Promise.all([
  fetch('/api/guru/absensi/date-range'),
  fetch('/api/guru/absensi/kelas-saya')
]);

// 2. Check semester status
if (dateRange.semester_status === 'not_started') {
  return <InfoCard message={dateRange.info_message} />;
}

// 3. Show kelas dropdown (required for guru mapel)
<select name="kelas_id" required>
  <option value="">-- Pilih Kelas --</option>
  {kelasList.kelas_list.map(kelas => (
    <option key={kelas.kelas_id} value={kelas.kelas_id}>
      {kelas.label || kelas.nama_kelas}
    </option>
  ))}
</select>

// 4. Date range picker (same as wali kelas)
<DateRangePicker>
  <input type="date" min={dateRange.tanggal_mulai} max={dateRange.today} />
  <input type="date" min={dateRange.tanggal_mulai} max={dateRange.today} />
  <button onClick={handleTampilkan}>Tampilkan</button>
</DateRangePicker>

// 5. Get rekap data (kelas_id required for guru mapel)
const rekap = await fetch(
  `/api/guru/absensi/rekap?tanggal_mulai=${startDate}&tanggal_akhir=${endDate}&kelas_id=${selectedKelasId}`
);
```

#### **Error Handling:**
```javascript
try {
  const rekap = await fetch('/api/guru/absensi/rekap?...');
  // Success
} catch (error) {
  if (error.message.includes('semester aktif')) {
    showError('Periode harus dalam semester aktif!');
  } else if (error.message.includes('tanggal yang akan datang')) {
    showError('Tidak bisa rekap untuk tanggal besok!');
  } else if (error.message.includes('melebihi tanggal selesai')) {
    showError('Periode melebihi batas semester!');
  }
}
```

---

### **Tab Input Absensi (Wali Kelas Only):**

```javascript
// 1. Get date range and check status
const dateRange = await fetch('/api/guru/absensi/date-range');

if (dateRange.semester_status === 'not_started') {
  return (
    <InfoCard 
      icon="⚠️" 
      title="Semester Belum Dimulai"
      message={dateRange.info_message}
    />
  );
}

// 2. Show form with date picker
<DatePicker 
  min={dateRange.tanggal_mulai}
  max={dateRange.today}  // No future
  value={selectedDate}
  onChange={handleDateChange}
/>

// 3. Get siswa when date changes
const siswaData = await fetch(`/api/guru/absensi/siswa?tanggal=${selectedDate}`);

// 4. Show statistics card
<StatsCard>
  <Stat label="Total Siswa" value={siswaData.statistics.total} />
  <Stat label="Hadir" value={siswaData.statistics.hadir} color="green" />
  <Stat label="Sakit" value={siswaData.statistics.sakit} color="yellow" />
  <Stat label="Izin" value={siswaData.statistics.izin} color="blue" />
  <Stat label="Belum Dipilih" value={siswaData.statistics.belum_dipilih} color="gray" />
</StatsCard>

// 5. Render table
<Table>
  {siswaData.siswa.map(s => (
    <tr key={s.siswa_id}>
      <td>{s.no}</td>
      <td>{s.nama_siswa}</td>
      <td>
        <Radio name={`status-${s.siswa_id}`} value="H" checked={s.status === 'H'}>H</Radio>
        <Radio name={`status-${s.siswa_id}`} value="S" checked={s.status === 'S'}>S</Radio>
        <Radio name={`status-${s.siswa_id}`} value="I" checked={s.status === 'I'}>I</Radio>
        <Radio name={`status-${s.siswa_id}`} value="A" checked={s.status === 'A'}>A</Radio>
      </td>
    </tr>
  ))}
</Table>

// 6. Save button
<Button onClick={handleSave}>Simpan Absensi</Button>
```

---

## 📌 **Notes**

1. ✅ **Date format support:** API accept both `YYYY-MM-DD` and ISO 8601 format
2. ✅ **Timezone handling:** All dates normalized to `YYYY-MM-DD` string for comparison
3. ✅ **Statistics auto-calculated:** FE get statistics directly from `/siswa` endpoint
4. ✅ **Semester status:** FE can show appropriate UI based on `semester_status`
5. ⚠️ **Wali Kelas only:** Only wali kelas can save absensi (guru mapel read-only)

---

**Last Updated:** November 4, 2025

