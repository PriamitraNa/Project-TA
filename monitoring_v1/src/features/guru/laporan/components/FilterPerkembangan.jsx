import ContentWrapper from '../../../../components/ui/ContentWrapper'
import FilterDropdown from '../../../../components/ui/FilterDropdown'
import { FaFilter, FaUser, FaCalendarAlt } from 'react-icons/fa'

export default function FilterPerkembangan({
  selectedKelas,
  selectedSiswa,
  onSiswaChange,
  kelasOptions,
  siswaOptions,
  periodeInfo,
  isLoadingSiswa,
}) {
  return (
    <ContentWrapper>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaFilter className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Laporan</h3>
            <p className="text-sm text-gray-600">Pilih siswa untuk melihat laporan perkembangan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kelas (Read-only) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaUser className="text-gray-500" />
              Kelas Wali
            </label>
            <div className="px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
              {kelasOptions.find((k) => k.value === selectedKelas)?.label || 'Loading...'}
            </div>
          </div>

          {/* Periode (Read-only) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              Periode Aktif
            </label>
            <div className="px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
              {periodeInfo
                ? `${periodeInfo.tahun_ajaran} • Sem. ${periodeInfo.semester}`
                : 'Loading...'}
            </div>
          </div>

          {/* Siswa (Dropdown) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Pilih Siswa <span className="text-red-500">*</span>
            </label>
            <FilterDropdown
              value={selectedSiswa}
              onChange={onSiswaChange}
              options={siswaOptions}
              showDefaultOption={true}
              placeholder="Pilih Siswa"
              disabled={isLoadingSiswa || siswaOptions.length === 0}
            />
          </div>
        </div>
      </div>
    </ContentWrapper>
  )
}
