import FilterDropdown from '../../../../components/ui/FilterDropdown'
import ContentWrapper from '../../../../components/ui/ContentWrapper'

export default function FilterSiswa({
  selectedSiswa,
  onSiswaChange,
  siswaOptions,
  isLoadingSiswa,
}) {
  return (
    <ContentWrapper>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Siswa</h3>
            <p className="text-sm text-gray-600 mt-1">
              Pilih siswa untuk menampilkan transkrip nilai lengkap
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filter Siswa */}
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Nama Siswa <span className="text-red-500">*</span>
            </label>
            {isLoadingSiswa ? (
              <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
            ) : (
              <FilterDropdown
                value={selectedSiswa}
                onChange={onSiswaChange}
                placeholder="Pilih Siswa..."
                options={siswaOptions.map((siswa) => ({
                  value: siswa.siswa_id.toString(),
                  label: `${siswa.nama} - ${siswa.nisn} (${siswa.kelas})`,
                }))}
                className="w-full"
              />
            )}
          </div>

          {/* Info details (ditampilkan setelah siswa dipilih) */}
          {selectedSiswa && siswaOptions.find((s) => s.siswa_id.toString() === selectedSiswa) && (
            <>
              {/* Info NISN */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">NISN</label>
                <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 flex items-center">
                  {siswaOptions.find((s) => s.siswa_id.toString() === selectedSiswa)?.nisn || '-'}
                </div>
              </div>

              {/* Info Kelas */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Kelas</label>
                <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 flex items-center">
                  {siswaOptions.find((s) => s.siswa_id.toString() === selectedSiswa)?.kelas || '-'}
                </div>
              </div>

              {/* Info Tahun Ajaran & Semester */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tahun Ajaran & Semester
                </label>
                <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700 flex items-center">
                  {(() => {
                    const siswa = siswaOptions.find((s) => s.siswa_id.toString() === selectedSiswa)
                    return siswa ? `${siswa.tahun_ajaran} - ${siswa.semester}` : '-'
                  })()}
                </div>
              </div>

              {/* Info Jumlah Mapel Dinilai */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Jumlah Mata Pelajaran Dinilai
                </label>
                <div className="h-10 px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-md text-sm text-emerald-700 flex items-center font-medium">
                  {siswaOptions.find((s) => s.siswa_id.toString() === selectedSiswa)
                    ?.jumlah_mapel_dinilai || 0}{' '}
                  Mata Pelajaran
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ContentWrapper>
  )
}
