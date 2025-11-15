/**
 * Constants untuk Catatan Anak
 */

// Filter options untuk kategori
export const KATEGORI_FILTERS = [
  { value: '', label: 'Semua Kategori' },
  { value: 'Positif', label: 'Positif' },
  { value: 'Negatif', label: 'Negatif' },
  { value: 'Netral', label: 'Netral' },
]

// Filter options untuk jenis catatan
export const JENIS_FILTERS = [
  { value: '', label: 'Semua Jenis' },
  { value: 'Akademik', label: 'Akademik' },
  { value: 'Perilaku', label: 'Perilaku' },
  { value: 'Kehadiran', label: 'Kehadiran' },
  { value: 'Prestasi', label: 'Prestasi' },
  { value: 'Lainnya', label: 'Lainnya' },
]

// Color mapping untuk kategori badge
export const KATEGORI_COLORS = {
  Positif: 'bg-green-100 text-green-800',
  Negatif: 'bg-red-100 text-red-800',
  Netral: 'bg-gray-100 text-gray-800',
}

// Dummy data (akan diganti dengan API)
export const DUMMY_CATATAN_DATA = [
  {
    id: 1,
    tanggal: '22/10/2025',
    guru_nama: 'Bu Siti Nurhaliza',
    mata_pelajaran: 'Matematika',
    kategori: 'Positif',
    jenis: 'Akademik',
    isi_preview: 'Ahmad sangat aktif dalam diskusi...',
    status: 'Dibaca',
    unread: false,
  },
  {
    id: 2,
    tanggal: '21/10/2025',
    guru_nama: 'Pak Budi Santoso',
    mata_pelajaran: 'Bahasa Indonesia',
    kategori: 'Negatif',
    jenis: 'Perilaku',
    isi_preview: 'Ahmad perlu lebih fokus...',
    status: 'Belum Dibaca',
    unread: true,
  },
  {
    id: 3,
    tanggal: '20/10/2025',
    guru_nama: 'Bu Ani Wulandari',
    mata_pelajaran: 'IPA',
    kategori: 'Positif',
    jenis: 'Prestasi',
    isi_preview: 'Ahmad berhasil menyelesaikan...',
    status: 'Dibaca',
    unread: false,
  },
  {
    id: 4,
    tanggal: '19/10/2025',
    guru_nama: 'Bu Siti Nurhaliza',
    mata_pelajaran: '-',
    kategori: 'Netral',
    jenis: 'Kehadiran',
    isi_preview: 'Ahmad izin tidak masuk...',
    status: 'Dibaca',
    unread: false,
  },
]

// Dummy statistics
export const DUMMY_STATISTICS = {
  total: 15,
  positif: 10,
  negatif: 3,
  netral: 2,
}
