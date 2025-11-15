import ContentWrapper from '../../../../components/ui/ContentWrapper';
import BarChartComponent from '../../../../components/charts/BarChartComponent';
import { FaChartLine, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function NilaiSiswaChart({
  mapelOptions,
  isLoadingMapel,
  selectedMapel,
  onMapelChange,
  data,
  isLoadingNilai,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <ContentWrapper>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaChartLine className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              {!selectedMapel || mapelOptions.length === 0
                ? "Nilai Siswa per Mata Pelajaran"
                : `Nilai Siswa - ${mapelOptions.find(opt => {
                    // Support both formats: "mapel_id" or "mapel_id-kelas_id"
                    const key = opt.kelas_id ? `${opt.mapel_id}-${opt.kelas_id}` : opt.mapel_id.toString();
                    return key === selectedMapel;
                  })?.nama_mapel || "Mata Pelajaran"}`
              }
            </h3>
          </div>

          {/* Dropdown Filter Mata Pelajaran */}
          <div className="w-48">
            {isLoadingMapel ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : (
              <select
                value={selectedMapel}
                onChange={(e) => onMapelChange(e.target.value)}
                disabled={mapelOptions.length === 0}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {mapelOptions.length === 0 ? (
                  <option value="">Tidak Ada Mata Pelajaran</option>
                ) : (
                  mapelOptions.map((option) => {
                    // Support both formats:
                    // - Wali Kelas: mapel_id only
                    // - Guru Mapel: mapel_id-kelas_id combination
                    const key = option.kelas_id 
                      ? `${option.mapel_id}-${option.kelas_id}` 
                      : option.mapel_id.toString();
                    const uniqueKey = option.kelas_id 
                      ? `${option.mapel_id}-${option.kelas_id}` 
                      : `${option.mapel_id}`;
                    
                    return (
                      <option key={uniqueKey} value={key}>
                        {option.nama_mapel}
                      </option>
                    );
                  })
                )}
              </select>
            )}
          </div>
        </div>

        {mapelOptions.length === 0 && !isLoadingMapel ? (
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center">
              <FaChartLine className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 text-lg font-medium">Tidak Mengampu Mata Pelajaran</p>
              <p className="text-slate-400 text-sm">Anda hanya wali kelas</p>
            </div>
          </div>
        ) : isLoadingNilai ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat data nilai siswa...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center">
              <FaChartLine className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 text-lg font-medium">Belum Ada Data Nilai</p>
              <p className="text-slate-400 text-sm">Siswa belum memiliki nilai untuk mata pelajaran ini</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <BarChartComponent
              data={data}
              title=""
              label="Nilai"
              horizontal={true}
              dataKey="nama"
              valueKey="nilai"
              backgroundColor="#10B981"
            />

            {/* Pagination Controls */}
            {!isLoadingNilai && data.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={onPrevious}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="w-3 h-3" />
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <button
                  onClick={onNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <FaChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}

