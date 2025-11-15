import ContentWrapper from '../../../../components/ui/ContentWrapper';
import PieChartComponent from '../../../../components/charts/PieChartComponent';
import { FaChartLine, FaCalendarDay } from 'react-icons/fa';

export default function KehadiranChart({ 
  data, 
  isLoading, 
  tanggal,
  kelasOptions,
  isLoadingKelas,
  selectedKelas,
  onKelasChange,
  showKelasDropdown 
}) {
  return (
    <div className="flex">
      <ContentWrapper className="w-full flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Header with Title and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarDay className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Kehadiran Siswa Hari Ini
              </h3>
            </div>
            {tanggal && (
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <FaCalendarDay className="w-4 h-4" />
                {tanggal}
              </div>
            )}
          </div>

          {/* Dropdown Filter Kelas - Only for Guru Mapel */}
          {showKelasDropdown && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Filter Kelas:
              </label>
              {isLoadingKelas ? (
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
              ) : (
              <select
                value={selectedKelas}
                onChange={(e) => onKelasChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {kelasOptions.map((option) => (
                  <option key={option.kelas_id} value={option.kelas_id}>
                    {option.nama_kelas}
                  </option>
                ))}
              </select>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Memuat data kehadiran...</p>
              </div>
            </div>
          ) : data.length === 0 || data.every(item => item.value === 0) ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FaChartLine className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Belum Ada Data Kehadiran</p>
                <p className="text-gray-400 text-sm mt-2">Absensi belum diinput untuk hari ini</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md">
                <PieChartComponent
                  data={data}
                  title=""
                  chartHeight="280px"
                />
              </div>
            </div>
          )}
        </div>
      </ContentWrapper>
    </div>
  );
}

