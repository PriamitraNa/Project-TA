import Button from '../../../../components/ui/Button'
import { FaPlus } from 'react-icons/fa'

const FilterSection = ({
  selectedTahun,
  selectedSemester,
  tahunAjaranOptions,
  availableSemesters,
  isLoadingTahunAjaran,
  onTahunChange,
  onSemesterChange,
  onTambahKelas,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tahun Ajaran</label>
          <select
            value={selectedTahun}
            onChange={(e) => onTahunChange(e.target.value)}
            disabled={isLoadingTahunAjaran}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm disabled:bg-slate-50"
          >
            {isLoadingTahunAjaran ? (
              <option value="">Memuat...</option>
            ) : (
              Array.from(new Set(tahunAjaranOptions.map((option) => option.tahun))).map((tahun) => (
                <option key={tahun} value={tahun}>
                  {tahun}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            disabled={!selectedTahun || isLoadingTahunAjaran}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm disabled:bg-slate-50"
          >
            {!selectedTahun ? (
              <option value="">Pilih Tahun Ajaran terlebih dahulu</option>
            ) : (
              availableSemesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <Button
            variant="primary"
            size="lg"
            icon={<FaPlus />}
            className="w-full"
            onClick={onTambahKelas}
          >
            Tambah Kelas
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FilterSection
