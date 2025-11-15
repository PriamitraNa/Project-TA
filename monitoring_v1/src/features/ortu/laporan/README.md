# Feature: Laporan Anak (Ortu)

Feature untuk menampilkan laporan akademik anak yang bisa diakses oleh orang tua.

## 📁 Struktur Folder

```
src/features/ortu/laporan/
├── components/
│   ├── FilterSection.jsx      # Filter tahun ajaran & semester + tombol download
│   ├── LaporanTable.jsx        # Tabel detail nilai mata pelajaran
│   └── GradeInfo.jsx           # Keterangan predikat (A, B, C, D)
├── config/
│   ├── constants.js            # Konfigurasi warna grade, options filter
│   └── mockData.js             # Mock data untuk development
├── hooks/
│   └── useLaporan.js           # Custom hook untuk state management
└── index.js                    # Barrel export
```

## 🎯 Features

1. **Filter Laporan**

   - Filter berdasarkan tahun ajaran
   - Filter berdasarkan semester (ganjil/genap)
   - Dropdown dengan label yang jelas

2. **Tabel Nilai**

   - Nomor urut
   - Nama mata pelajaran
   - Nilai akhir
   - Predikat (A/B/C/D) dengan color badge

3. **Keterangan Predikat**

   - A: 85-100 (hijau)
   - B: 70-84 (biru)
   - C: 55-69 (kuning)
   - D: 0-54 (merah)
   - **Sesuai dengan standar guru** (85/70/55)

4. **Download PDF**

   - Tombol untuk unduh laporan dalam format PDF
   - Loading state saat proses download

5. **Empty State**
   - Tampilan ketika belum ada data
   - Icon dan pesan yang informatif

## 🔧 Penggunaan

### Di Page Component

```jsx
import PageHeader from '../../components/ui/PageHeader'
import { FaFileArrowDown } from 'react-icons/fa6'
import { useLaporan, FilterSection, LaporanTable } from '../../features/ortu/laporan'

export default function LaporanAnak() {
  const {
    selectedTahun,
    selectedSemester,
    dataTampil,
    isLoading,
    setSelectedTahun,
    setSelectedSemester,
    getPredikatBadge,
    handleDownloadPDF,
  } = useLaporan()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FaFileArrowDown />}
        title="Laporan Akademik Anak"
        description="Lihat hasil belajar dan unduh rapor anak Anda"
      />

      <FilterSection
        selectedTahun={selectedTahun}
        selectedSemester={selectedSemester}
        onTahunChange={setSelectedTahun}
        onSemesterChange={setSelectedSemester}
        onDownloadPDF={handleDownloadPDF}
        isLoading={isLoading}
      />

      <LaporanTable
        data={dataTampil}
        selectedTahun={selectedTahun}
        selectedSemester={selectedSemester}
        getPredikatBadge={getPredikatBadge}
      />
    </div>
  )
}
```

## 📊 Data Structure

```javascript
{
  '2025/2026': {
    ganjil: [
      {
        id: 1,
        mapel: 'Matematika',
        kkm: 75,
        nilaiAkhir: 78,
        predikat: 'C',
        deskripsi: 'Perlu meningkatkan pemahaman konsep dasar.'
      },
      // ... more items
    ],
    genap: [...]
  },
  '2024/2025': {...}
}
```

## 🎨 Styling

- Menggunakan Tailwind CSS
- Responsive design (mobile-first)
- Hover effects pada table rows
- Color-coded grade badges
- Consistent spacing dengan design system

## 🔄 State Management

Custom hook `useLaporan()` mengelola:

- ✅ Filter selection (tahun & semester)
- ✅ Data filtering berdasarkan selection
- ✅ Grade badge color logic
- ✅ Download PDF handler (ready untuk API integration)
- ✅ Loading states

## 🚀 Next Steps (API Integration)

1. **Create Service**: `src/services/Ortu/LaporanService.js`

```javascript
export const LaporanService = {
  getLaporan: async (tahunId, semester) => {
    const url = `${API_URL}/ortu/laporan`
    const params = { tahun_ajaran_id: tahunId, semester }
    // ... axios call
  },
  downloadPDF: async (tahunId, semester) => {
    const url = `${API_URL}/ortu/laporan/pdf`
    // ... axios call untuk download
  },
}
```

2. **Update Hook**: Replace mock data dengan API calls

```javascript
// In useLaporan.js
useEffect(() => {
  const fetchLaporan = async () => {
    try {
      setIsLoading(true)
      const data = await LaporanService.getLaporan(selectedTahun, selectedSemester)
      // ... handle response
    } catch (error) {
      // ... error handling
    } finally {
      setIsLoading(false)
    }
  }
  fetchLaporan()
}, [selectedTahun, selectedSemester])
```

3. **Implement PDF Download**

```javascript
const handleDownloadPDF = async () => {
  try {
    setIsLoading(true)
    const blob = await LaporanService.downloadPDF(selectedTahun, selectedSemester)
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Laporan_${selectedTahun}_${selectedSemester}.pdf`
    link.click()
  } catch (error) {
    toast.error('Gagal mengunduh PDF')
  } finally {
    setIsLoading(false)
  }
}
```

## ✨ Keunggulan Refactoring

### Sebelum (Monolithic)

- ❌ Semua logic di 1 file (284 baris)
- ❌ Hard to test
- ❌ Hard to maintain
- ❌ Tidak reusable
- ❌ Mock data tercampur dengan logic

### Sesudah (Feature Module)

- ✅ Separation of concerns (7 files terpisah)
- ✅ Easy to test (isolated components)
- ✅ Easy to maintain (clear structure)
- ✅ Reusable components
- ✅ Mock data terpisah (mudah diganti API)
- ✅ Consistent dengan feature lain (chat, nilai, dll)
- ✅ Page component jadi super clean (43 baris)

## 📝 Notes

- Grade ranges (85/70/55) sudah **sama dengan sistem guru**
- Color scheme mengikuti design system yang ada
- Components fully responsive
- Ready untuk API integration (tinggal ganti mock data)
- Barrel export pattern untuk clean imports
