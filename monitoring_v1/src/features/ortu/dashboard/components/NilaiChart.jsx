import BarChartComponent from "../../../../components/charts/BarChartComponent";
import ContentWrapper from "../../../../components/ui/ContentWrapper";
import { FaSpinner, FaChartBar } from "react-icons/fa";

export default function NilaiChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex flex-col items-center justify-center h-64">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Memuat data nilai...</p>
        </div>
      </ContentWrapper>
    );
  }

  if (data.length === 0) {
    return (
      <ContentWrapper>
        <div className="flex flex-col items-center justify-center h-64">
          <FaChartBar className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Belum Ada Data Nilai</p>
          <p className="text-slate-400 text-sm mt-1">
            Data nilai akan muncul setelah guru menginput nilai
          </p>
        </div>
      </ContentWrapper>
    );
  }

  return (
    <BarChartComponent
      data={data}
      title="Perbandingan Nilai per Mata Pelajaran"
      label="Nilai Akhir"
      horizontal={true}
      dataKey="mapel"
      valueKey="nilai"
      backgroundColor={["#3B82F6", "#60A5FA"]}
      chartHeight="200px"
    />
  );
}

