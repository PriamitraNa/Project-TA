/**
 * Dashboard Ortu Configuration - Mock Data & Options
 */

// === Mock Data Anak ===
export const mockDataAnak = {
  nama: "Ahmad Fauzi",
  nisn: "001",
  kelas: "4A",
  absensiHariIni: "Hadir",
  nilaiRataRata: 87.5,
};

// === Mock Data Catatan Terbaru ===
export const mockCatatanTerbaru = [
  {
    id: 1,
    guru: "Bu Tika",
    mapel: "Matematika",
    catatan: "Ahmad sangat aktif dalam diskusi kelompok hari ini.",
  },
  {
    id: 2,
    guru: "Pak Budi",
    mapel: "B. Indonesia",
    catatan: "Mohon bantuannya untuk mengingatkan ananda mengerjakan PR.",
  },
  {
    id: 3,
    guru: "Bu Tika",
    mapel: "Matematika",
    catatan: "Nilai ulangan harian ananda sangat baik, mendapat 95.",
  },
];

// === Mock Data Nilai per Mapel ===
export const mockNilaiPerMapel = [
  { mapel: "MTK", nilai: 78 },
  { mapel: "B. Indo", nilai: 88 },
  { mapel: "IPA", nilai: 87 },
  { mapel: "IPS", nilai: 88 },
  { mapel: "PKN", nilai: 95 },
].sort((a, b) => a.nilai - b.nilai);

// === Table Columns ===
export const catatanColumns = [
  { key: "guru", label: "Dari Guru" },
  { key: "catatan", label: "Isi Catatan" },
];

