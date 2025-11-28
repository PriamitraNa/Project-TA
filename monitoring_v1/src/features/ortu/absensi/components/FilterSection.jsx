import { FaFilter } from 'react-icons/fa6'

/**
 * FilterSection Component
 * Filter berdasarkan Tahun Ajaran, Semester, dan Bulan
 */
export default function FilterSection({
  isLoading,
  tahunAjaranList,
  semesterList,
  bulanList, // Tambah prop bulanList dari API
  selectedTahunAjaran,
  selectedSemester,
  selectedBulan,
  onTahunAjaranChange,
  onSemesterChange,
  onBulanChange,
}) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="text-emerald-600 text-lg" />
        <h3 className="text-base sm:text-lg font-semibold text-slate-800">Filter Kehadiran</h3>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tahun Ajaran */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedTahunAjaran}
            onChange={(e) => onTahunAjaranChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
          >
            {tahunAjaranList.map((ta) => (
              <option key={ta.value} value={ta.value}>
                {ta.label}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Semester <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            disabled={isLoading || !selectedTahunAjaran}
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
          >
            {semesterList.map((semester) => (
              <option key={semester.value} value={semester.value}>
                {semester.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bulan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Bulan</label>
          <select
            value={selectedBulan}
            onChange={(e) => onBulanChange(e.target.value)}
            disabled={isLoading || !selectedSemester}
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">Semua Bulan</option>
            {bulanList.map((bulan) => (
              <option key={bulan.value} value={bulan.value}>
                {bulan.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Text */}
      <p className="mt-3 text-xs text-slate-500">
        <span className="text-red-500">*</span> Pilih tahun ajaran dan semester untuk melihat data
        kehadiran
      </p>
    </div>
  )
}
