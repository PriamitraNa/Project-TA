import ContentWrapper from '../../../../components/ui/ContentWrapper';
import DataTable from '../../../../components/ui/DataTable';
import { FaCommentDots, FaSpinner } from 'react-icons/fa';
import { catatanColumns } from '../config';
import { useMemo } from 'react';

export default function CatatanTerbaruTable({ data, isLoading }) {
  // Filter columns based on data availability
  // Hide optional columns (nama_guru) if not present in data
  const visibleColumns = useMemo(() => {
    if (data.length === 0) return catatanColumns;
    
    const firstRow = data[0];
    return catatanColumns.filter(col => {
      // Always show non-optional columns
      if (!col.optional) return true;
      // Show optional columns only if data has it
      return firstRow[col.key] !== undefined && firstRow[col.key] !== null;
    });
  }, [data]);

  return (
    <div className="flex">
      <ContentWrapper className="w-full flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FaCommentDots className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Catatan Siswa Terbaru
            </h3>
          </div>
          <div className="flex-1 overflow-hidden rounded-lg border border-slate-200">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white">
                <FaSpinner className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                <p className="text-slate-500 text-sm">Memuat catatan terbaru...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white">
                <FaCommentDots className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Belum Ada Catatan</p>
                <p className="text-slate-400 text-sm mt-1">
                  Catatan siswa yang Anda buat akan muncul di sini
                </p>
              </div>
            ) : (
              <DataTable
                columns={visibleColumns}
                data={data}
                className="border-0 h-full"
              />
            )}
          </div>
        </div>
      </ContentWrapper>
    </div>
  );
}

