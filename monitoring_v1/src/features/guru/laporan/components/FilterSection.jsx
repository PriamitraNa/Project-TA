import ContentWrapper from '../../../../components/ui/ContentWrapper';
import FilterDropdown from '../../../../components/ui/FilterDropdown';

export default function FilterSection({
  selectedKelas,
  onKelasChange,
  selectedMapel,
  onMapelChange,
  kelasOptions,
  mapelOptions,
}) {
  return (
    <ContentWrapper>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Laporan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Kelas <span className="text-red-500">*</span>
            </label>
            <FilterDropdown
              value={selectedKelas}
              onChange={onKelasChange}
              options={kelasOptions}
              showDefaultOption={false}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <FilterDropdown
              value={selectedMapel}
              onChange={onMapelChange}
              options={mapelOptions}
              showDefaultOption={false}
            />
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}

