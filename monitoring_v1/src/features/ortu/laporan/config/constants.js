// Grade badge color configuration
export const GRADE_COLORS = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-red-100 text-red-800',
}

// Grade ranges (matches guru's grading system)
export const GRADE_RANGES = [
  { grade: 'A', range: '85-100', color: 'bg-green-100 text-green-800' },
  { grade: 'B', range: '70-84', color: 'bg-blue-100 text-blue-800' },
  { grade: 'C', range: '55-69', color: 'bg-yellow-100 text-yellow-800' },
  { grade: 'D', range: '0-54', color: 'bg-red-100 text-red-800' },
]

// Note: Semester options are now loaded dynamically from API #2
// Previously: SEMESTER_OPTIONS = [{ value: '1', label: 'Semester Ganjil' }, ...]
// Now: Fetched via GET /api/ortu/laporan/semester?tahun_ajaran_id=X
