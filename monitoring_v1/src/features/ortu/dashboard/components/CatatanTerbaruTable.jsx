import ContentWrapper from "../../../../components/ui/ContentWrapper";
import DataTable from "../../../../components/ui/DataTable";
import { FaCommentDots, FaSpinner } from "react-icons/fa";
import { catatanColumns } from "../config";

export default function CatatanTerbaruTable({ data, isLoading }) {
  return (
    <ContentWrapper>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <FaCommentDots className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          Catatan Terbaru dari Guru
        </h3>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white">
          <FaSpinner className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Memuat catatan...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white">
          <FaCommentDots className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Belum Ada Catatan</p>
          <p className="text-slate-400 text-sm mt-1">
            Catatan dari guru akan muncul di sini
          </p>
        </div>
      ) : (
        <DataTable columns={catatanColumns} data={data} />
      )}
    </ContentWrapper>
  );
}

