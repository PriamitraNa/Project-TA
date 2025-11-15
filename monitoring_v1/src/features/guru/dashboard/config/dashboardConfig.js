/**
 * Dashboard Configuration - Mock Data & Options
 */

// === Mock Data Siswa (20 siswa) ===
export const allSiswaData = [
  { nama: "Ahmad", nilai: 92, kelas: "4A" },
  { nama: "Budi", nilai: 89, kelas: "4A" },
  { nama: "Citra", nilai: 88, kelas: "4A" },
  { nama: "Dewi", nilai: 85, kelas: "4A" },
  { nama: "Eka", nilai: 84, kelas: "4A" },
  { nama: "Fajar", nilai: 83, kelas: "4A" },
  { nama: "Gita", nilai: 82, kelas: "4A" },
  { nama: "Hadi", nilai: 81, kelas: "4A" },
  { nama: "Indra", nilai: 80, kelas: "4A" },
  { nama: "Jihan", nilai: 79, kelas: "4A" },
  { nama: "Kiki", nilai: 78, kelas: "4A" },
  { nama: "Lina", nilai: 77, kelas: "4A" },
  { nama: "Mira", nilai: 76, kelas: "4A" },
  { nama: "Nina", nilai: 75, kelas: "4A" },
  { nama: "Omar", nilai: 74, kelas: "4A" },
  { nama: "Putri", nilai: 73, kelas: "4A" },
  { nama: "Qori", nilai: 72, kelas: "4A" },
  { nama: "Rina", nilai: 71, kelas: "4A" },
  { nama: "Sari", nilai: 70, kelas: "4A" },
  { nama: "Tina", nilai: 69, kelas: "4A" },
].sort((a, b) => b.nilai - a.nilai);

// === Mock Data Nilai Siswa per Mata Pelajaran ===
export const nilaiSiswaPerMapel = {
  matematika: [
    { nama: "Ahmad", nilai: 95 },
    { nama: "Budi", nilai: 88 },
    { nama: "Citra", nilai: 92 },
    { nama: "Dewi", nilai: 85 },
    { nama: "Eka", nilai: 90 },
    { nama: "Fajar", nilai: 87 },
    { nama: "Gita", nilai: 93 },
    { nama: "Hadi", nilai: 89 },
    { nama: "Indra", nilai: 91 },
    { nama: "Jihan", nilai: 86 },
    { nama: "Kiki", nilai: 86 },
  ],
  bindo: [
    { nama: "Ahmad", nilai: 88 },
    { nama: "Budi", nilai: 92 },
    { nama: "Citra", nilai: 85 },
    { nama: "Dewi", nilai: 90 },
    { nama: "Eka", nilai: 87 },
    { nama: "Fajar", nilai: 94 },
    { nama: "Gita", nilai: 89 },
    { nama: "Hadi", nilai: 91 },
    { nama: "Indra", nilai: 86 },
    { nama: "Jihan", nilai: 93 },
    { nama: "Kiki", nilai: 86 },
  ],
  ipa: [
    { nama: "Ahmad", nilai: 90 },
    { nama: "Budi", nilai: 85 },
    { nama: "Citra", nilai: 88 },
    { nama: "Dewi", nilai: 92 },
    { nama: "Eka", nilai: 87 },
    { nama: "Fajar", nilai: 89 },
    { nama: "Gita", nilai: 91 },
    { nama: "Hadi", nilai: 86 },
    { nama: "Indra", nilai: 94 },
    { nama: "Jihan", nilai: 88 },
    { nama: "Kiki", nilai: 86 },
  ],
  ips: [
    { nama: "Ahmad", nilai: 87 },
    { nama: "Budi", nilai: 91 },
    { nama: "Citra", nilai: 89 },
    { nama: "Dewi", nilai: 85 },
    { nama: "Eka", nilai: 93 },
    { nama: "Fajar", nilai: 88 },
    { nama: "Gita", nilai: 90 },
    { nama: "Hadi", nilai: 92 },
    { nama: "Indra", nilai: 86 },
    { nama: "Jihan", nilai: 89 },
    { nama: "Kiki", nilai: 86 },
  ],
  pkn: [
    { nama: "Ahmad", nilai: 92 },
    { nama: "Budi", nilai: 88 },
    { nama: "Citra", nilai: 90 },
    { nama: "Dewi", nilai: 94 },
    { nama: "Eka", nilai: 87 },
    { nama: "Fajar", nilai: 91 },
    { nama: "Gita", nilai: 85 },
    { nama: "Hadi", nilai: 89 },
    { nama: "Indra", nilai: 93 },
    { nama: "Jihan", nilai: 88 },
    { nama: "Kiki", nilai: 86 },
  ],
  pjok: [
    { nama: "Ahmad", nilai: 89 },
    { nama: "Budi", nilai: 93 },
    { nama: "Citra", nilai: 87 },
    { nama: "Dewi", nilai: 91 },
    { nama: "Eka", nilai: 88 },
    { nama: "Fajar", nilai: 90 },
    { nama: "Gita", nilai: 92 },
    { nama: "Hadi", nilai: 86 },
    { nama: "Indra", nilai: 89 },
    { nama: "Jihan", nilai: 94 },
    { nama: "Kiki", nilai: 86 },
  ],
  seni: [
    { nama: "Ahmad", nilai: 85 },
    { nama: "Budi", nilai: 88 },
    { nama: "Citra", nilai: 92 },
    { nama: "Dewi", nilai: 89 },
    { nama: "Eka", nilai: 91 },
    { nama: "Fajar", nilai: 87 },
    { nama: "Gita", nilai: 94 },
    { nama: "Hadi", nilai: 90 },
    { nama: "Indra", nilai: 86 },
    { nama: "Jihan", nilai: 93 },
    { nama: "Kiki", nilai: 86 },
  ],
  prakarya: [
    { nama: "Ahmad", nilai: 88 },
    { nama: "Budi", nilai: 85 },
    { nama: "Citra", nilai: 91 },
    { nama: "Dewi", nilai: 87 },
    { nama: "Eka", nilai: 89 },
    { nama: "Fajar", nilai: 92 },
    { nama: "Gita", nilai: 86 },
    { nama: "Hadi", nilai: 90 },
    { nama: "Indra", nilai: 88 },
    { nama: "Jihan", nilai: 93 },
    { nama: "Kiki", nilai: 86 },
  ],
};

// === Mock Data Kehadiran ===
export const kehadiranData = [
  { name: "Hadir", value: 28 },
  { name: "Sakit", value: 1 },
  { name: "Izin", value: 1 },
  { name: "Alpha", value: 0 },
];

// === Mock Data Catatan Terbaru ===
export const catatanTerbaru = [
  {
    id: 1,
    nama: "Ahmad",
    kelas: "4A",
    catatan: "Sangat aktif dalam diskusi kelompok.",
    tanggal: "2025-09-20",
  },
  {
    id: 2,
    nama: "Citra",
    kelas: "4A",
    catatan: "Perlu lebih teliti dalam mengerjakan soal esai.",
    tanggal: "2025-09-20",
  },
  {
    id: 3,
    nama: "Budi",
    kelas: "4A",
    catatan: "Menunjukkan peningkatan dalam pelajaran Matematika.",
    tanggal: "2025-09-19",
  },
  {
    id: 4,
    nama: "Dewi",
    kelas: "4A",
    catatan: "Sering membantu teman yang kesulitan.",
    tanggal: "2025-09-18",
  },
  {
    id: 5,
    nama: "Eka",
    kelas: "4A",
    catatan: "Sangat aktif dalam diskusi kelompok.",
    tanggal: "2025-09-18",
  },
  {
    id: 6,
    nama: "Fajar",
    kelas: "4A",
    catatan: "Sangat giat dalam mengerjakan tugas.",
    tanggal: "2025-09-18",
  },
];

// === Options untuk dropdown ===
export const mapelOptions = [
  { value: "all", label: "Pilih Mata Pelajaran" },
  { value: "matematika", label: "Matematika" },
  { value: "bindo", label: "B. Indonesia" },
  { value: "ipa", label: "IPA" },
  { value: "ips", label: "IPS" },
  { value: "pkn", label: "PKN" },
  { value: "pjok", label: "PJOK" },
  { value: "seni", label: "Seni Budaya" },
  { value: "prakarya", label: "Prakarya" },
];

// === Table Columns ===
export const catatanColumns = [
  { key: "nama_siswa", label: "Nama Siswa" },
  { key: "kelas", label: "Kelas" },
  { key: "nama_guru", label: "Guru", optional: true }, // Only for Wali Kelas
  { key: "catatan", label: "Catatan" },
  { key: "tanggal", label: "Tanggal" },
];

// === Pagination Config ===
export const ITEMS_PER_PAGE = 10;
export const MAX_CATATAN_DISPLAY = 6;

