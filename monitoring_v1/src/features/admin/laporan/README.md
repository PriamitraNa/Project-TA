# Transkrip Nilai Siswa - Admin

## 📋 Deskripsi

Halaman Transkrip Nilai Siswa untuk Admin telah diperbarui dengan struktur yang lebih terorganisir dan tampilan yang konsisten dengan halaman Laporan Guru.

## 🎯 Fitur Utama

### 1. Filter Berdasarkan Siswa

- Filter tunggal: **Nama Siswa**
- Menampilkan informasi NISN dan Kelas setelah siswa dipilih
- Loading state saat data siswa dimuat

### 2. Tampilan Transkrip Nilai

- **Header Informasi Siswa**: Nama, NISN, Kelas, Tempat/Tanggal Lahir, Nama Orang Tua
- **Riwayat Nilai per Semester**: Semua mata pelajaran dikelompokkan berdasarkan Tahun Ajaran dan Semester
- **Tabel Nilai** mencakup:
  - Nomor
  - Mata Pelajaran
  - Tugas 1
  - Tugas 2
  - UTS
  - UAS
  - Nilai Akhir
  - Grade (dengan badge berwarna)
- **Summary Keseluruhan**: Rata-rata dari semua semester yang telah ditempuh

### 3. Tombol Unduh PDF

- Hanya aktif ketika ada data siswa yang valid
- Download transkrip dalam format PDF

## 📁 Struktur File Baru

```
src/features/admin/laporan/
├── index.js
├── hooks/
│   ├── index.js
│   └── useTranskripNilai.js
└── components/
    ├── index.js
    ├── FilterSiswa.jsx
    └── PreviewTranskrip.jsx
```

## 🔧 Components

### 1. `useTranskripNilai` Hook

**Path**: `src/features/admin/laporan/hooks/useTranskripNilai.js`

**Fungsi**:

- Mengelola state untuk filter siswa
- Fetch daftar siswa dari API
- Fetch data transkrip nilai berdasarkan siswa yang dipilih
- Handle download PDF

**Return Values**:

```javascript
{
  // State
  selectedSiswa,
  setSelectedSiswa,
  siswaOptions,
  transkripData,
  isLoading,
  isLoadingSiswa,

  // Actions
  handleDownloadPDF,
  canDownloadPDF,
}
```

### 2. `FilterSiswa` Component

**Path**: `src/features/admin/laporan/components/FilterSiswa.jsx`

**Props**:

- `selectedSiswa`: ID siswa yang dipilih
- `onSiswaChange`: Handler untuk perubahan siswa
- `siswaOptions`: Array opsi siswa
- `isLoadingSiswa`: State loading untuk daftar siswa

**Fitur**:

- Dropdown filter siswa
- Menampilkan NISN dan Kelas setelah siswa dipilih
- Loading skeleton saat data dimuat

### 3. `PreviewTranskrip` Component

**Path**: `src/features/admin/laporan/components/PreviewTranskrip.jsx`

**Props**:

- `transkripData`: Data transkrip nilai siswa

**Fitur**:

- Header informasi siswa
- Tabel nilai per semester
- Badge grade dengan warna dinamis
- Summary rata-rata keseluruhan
- Responsive design

## 🎨 Styling & UI

### Grade Color Mapping

```javascript
A/A- → Emerald (hijau)
B/B+ → Blue (biru)
C/C+ → Yellow (kuning)
D/D+ → Orange (orange)
E/F  → Red (merah)
```

### Layout

- Menggunakan `ContentWrapper` untuk konsistensi
- Grid responsive untuk informasi siswa
- Card-based design untuk setiap semester
- Gradient background untuk summary

## 📊 Mock Data Structure

```javascript
{
  siswa: {
    siswa_id: 1,
    nama: "Ahmad Fauzi",
    nisn: "1234567890",
    kelas: "5A",
    tempat_lahir: "Jakarta",
    tanggal_lahir: "15/05/2015",
    nama_ortu: "Bapak Fauzi bin Ahmad"
  },
  riwayat_nilai: [
    {
      id: 'ta3-ganjil',
      tahun_ajaran: '2025/2026',
      semester: 'Ganjil',
      nilai: [
        {
          mapel_id: 1,
          nama_mapel: 'Matematika',
          tugas_1: 85,
          tugas_2: 90,
          uts: 88,
          uas: 87,
          nilai_akhir: 87.5,
          grade: 'B+'
        },
        // ... mata pelajaran lainnya
      ]
    },
    // ... semester lainnya
  ]
}
```

## 🔄 User Flow

1. **Halaman Dimuat**

   - Loading daftar siswa
   - Menampilkan empty state "Pilih Siswa"

2. **Siswa Dipilih**

   - Loading data transkrip
   - Menampilkan informasi siswa
   - Menampilkan riwayat nilai per semester
   - Tombol Download PDF aktif

3. **Download PDF**
   - Loading toast notification
   - Generate dan download PDF
   - Success notification

## 🚀 Integrasi API

### Endpoints yang Perlu Dibuat

1. **GET** `/api/admin/siswa` - Daftar semua siswa
2. **GET** `/api/admin/transkrip/:siswa_id` - Transkrip nilai siswa
3. **GET** `/api/admin/transkrip/:siswa_id/pdf` - Download PDF

### Implementasi

Uncomment bagian API call di `useTranskripNilai.js` dan sesuaikan dengan service yang ada.

## ⚠️ Catatan Implementasi

1. **Mock Data**: Saat ini menggunakan mock data. Ganti dengan API call yang sebenarnya.
2. **PDF Generation**: Implementasi PDF download perlu disesuaikan dengan backend.
3. **Permissions**: Pastikan hanya admin yang bisa mengakses halaman ini.
4. **Loading States**: Sudah diimplementasikan untuk UX yang lebih baik.
5. **Error Handling**: Toast notifications untuk error feedback.

## 🎯 Perbedaan dengan Laporan Guru

| Fitur              | Laporan Guru                             | Transkrip Nilai Admin  |
| ------------------ | ---------------------------------------- | ---------------------- |
| Filter             | Kelas + Siswa                            | Siswa only             |
| Data               | Perkembangan + Nilai + Absensi + Catatan | Riwayat Nilai Historis |
| Catatan Wali Kelas | ✅ Ada                                   | ❌ Tidak ada           |
| Scope              | Satu semester aktif                      | Semua semester         |
| User               | Wali Kelas                               | Admin                  |

## 📝 TODO untuk Production

- [ ] Integrasi dengan API backend
- [ ] Implementasi PDF generation yang sebenarnya
- [ ] Testing dengan data real
- [ ] Optimasi performance untuk siswa dengan banyak riwayat
- [ ] Export ke format lain (Excel, CSV)
- [ ] Print preview sebelum download
- [ ] Filter tambahan (Kelas, Tahun Ajaran) jika diperlukan
