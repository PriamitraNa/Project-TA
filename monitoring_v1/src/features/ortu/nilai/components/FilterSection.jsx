import FilterDropdown from "../../../../components/ui/FilterDropdown";

export default function FilterSection({
  tahunAjaranOptions,
  selectedTahun,
  onTahunChange,
  semesterOptions,
  selectedSemester,
  onSemesterChange,
  isLoadingTahun,
  isLoadingSemester,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <h3 className="text-lg font-bold text-slate-800">
        Detail Nilai per Mata Pelajaran
      </h3>
      <div className="flex gap-3">
        {/* Filter Tahun Ajaran */}
        <FilterDropdown
          options={tahunAjaranOptions}
          value={selectedTahun}
          onChange={onTahunChange}
          className="w-full sm:w-40"
          disabled={isLoadingTahun}
          showDefaultOption={false}
        />
        {/* Filter Semester */}
        <FilterDropdown
          options={semesterOptions}
          value={selectedSemester}
          onChange={onSemesterChange}
          className="w-full sm:w-48"
          disabled={isLoadingSemester || !selectedTahun}
          showDefaultOption={false}
        />
      </div>
    </div>
  );
}

