import FilterDropdown from '../../../../components/ui/FilterDropdown'
import ContentWrapper from '../../../../components/ui/ContentWrapper'
import { FaFilter, FaCalendarAlt, FaSchool, FaUser, FaUsers } from 'react-icons/fa'

export default function FilterSiswa({
  // Cascade State
  tahunAjaranList,
  kelasList,
  siswaList,

  // Selected Values
  selectedTahunAjaran,
  selectedKelas,
  selectedSiswa,
  downloadMode,

  // Handlers
  onTahunAjaranChange,
  onKelasChange,
  onSiswaChange,
  onModeChange,

  // Loading States
  isLoadingTahunAjaran,
  isLoadingKelas,
  isLoadingSiswa,
}) {
  return (
    <ContentWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaFilter className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Transkrip Nilai Siswa</h3>
            <p className="text-sm text-gray-600">
              Pilih tahun ajaran, kelas, dan siswa untuk generate transkrip
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1️⃣ Tahun Ajaran */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              Tahun Ajaran <span className="text-red-500">*</span>
            </label>
            {isLoadingTahunAjaran ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : (
              <FilterDropdown
                value={selectedTahunAjaran}
                onChange={onTahunAjaranChange}
                placeholder="Pilih Tahun Ajaran..."
                showDefaultOption={true}
                options={tahunAjaranList.map((ta) => ({
                  value: ta.id.toString(),
                  label: ta.label,
                }))}
              />
            )}
          </div>

          {/* 2️⃣ Kelas */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaSchool className="text-gray-500" />
              Kelas <span className="text-red-500">*</span>
            </label>
            {isLoadingKelas ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : !selectedTahunAjaran || selectedTahunAjaran === '' ? (
              <div className="h-10 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 flex items-center cursor-not-allowed">
                Pilih Kelas...
              </div>
            ) : (
              <FilterDropdown
                value={selectedKelas}
                onChange={onKelasChange}
                placeholder="Pilih Kelas..."
                showDefaultOption={true}
                options={kelasList.map((kelas) => ({
                  value: kelas.id.toString(),
                  label: kelas.nama_kelas,
                }))}
                disabled={kelasList.length === 0}
              />
            )}
          </div>

          {/* 3️⃣ Pilih Siswa */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaUser className="text-gray-500" />
              Pilih Siswa <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {/* Dropdown Siswa */}
              {isLoadingSiswa ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              ) : !selectedKelas || selectedKelas === '' ? (
                <div className="h-10 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 flex items-center cursor-not-allowed">
                  Pilih Siswa...
                </div>
              ) : (
                <FilterDropdown
                  value={selectedSiswa}
                  onChange={onSiswaChange}
                  placeholder="Pilih Siswa..."
                  showDefaultOption={true}
                  options={siswaList.map((siswa) => ({
                    value: siswa.id.toString(),
                    label: siswa.label || `${siswa.nama} - ${siswa.nisn}`,
                  }))}
                  disabled={downloadMode === 'bulk' || siswaList.length === 0}
                />
              )}

              {/* Checkbox: Gunakan semua siswa */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={downloadMode === 'bulk'}
                  onChange={(e) => onModeChange(e.target.checked ? 'bulk' : 'individual')}
                  disabled={
                    !selectedKelas ||
                    selectedKelas === '' ||
                    isLoadingSiswa ||
                    siswaList.length === 0
                  }
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded disabled:opacity-50 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Gunakan semua siswa di kelas ini
                  {downloadMode === 'bulk' && siswaList.length > 0 && (
                    <span className="ml-1 text-emerald-600 font-medium">
                      ({siswaList.length} siswa)
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </ContentWrapper>
  )
}
