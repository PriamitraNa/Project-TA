import ContentWrapper from '../../../../components/ui/ContentWrapper';
import BarChartComponent from '../../../../components/charts/BarChartComponent';
import { FaTrophy, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function PeringkatSiswaChart({
  data,
  isLoading,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <ContentWrapper>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <FaTrophy className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">
            Peringkat Siswa (Berdasarkan Nilai Rata-rata)
          </h3>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat peringkat siswa...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <FaTrophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada data peringkat siswa</p>
            </div>
          </div>
        ) : (
          /* Chart Bar Horizontal */
          <BarChartComponent
            data={data}
            title=""
            label="Nilai Rata-rata"
            horizontal={true}
            dataKey="nama"
            valueKey="nilai"
            backgroundColor="#3B82F6"
          />
        )}

        {/* Pagination Controls */}
        {!isLoading && data.length > 0 && (
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
    </ContentWrapper>
  );
}

