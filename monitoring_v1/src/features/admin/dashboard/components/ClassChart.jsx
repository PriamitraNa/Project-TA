import BarChartComponent from "../../../../components/charts/BarChartComponent";

const CHART_CONFIG = {
  title: "Jumlah Siswa per Kelas",
  height: "250px",
  backgroundColor: "#10B981",
  label: "Jumlah Siswa",
  yAxisStepSize: 5,
};

const LoadingState = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      {CHART_CONFIG.title}
    </h3>
    <div className="flex items-center justify-center h-[250px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Memuat data...</p>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      {CHART_CONFIG.title}
    </h3>
    <div className="flex items-center justify-center h-[250px]">
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-2">Tidak ada data untuk tahun ajaran aktif</p>
        <p className="text-gray-400 text-xs">Pastikan sudah ada tahun ajaran yang diaktifkan</p>
      </div>
    </div>
  </div>
);

export default function ClassChart({ data, isLoading }) {
  if (isLoading) return <LoadingState />;
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <BarChartComponent
      data={data}
      width="100%"
      height="100%"
      backgroundColor={CHART_CONFIG.backgroundColor}
      label={CHART_CONFIG.label}
      showLegend={false}
      yAxisStepSize={CHART_CONFIG.yAxisStepSize}
      showCard
      title={CHART_CONFIG.title}
      chartHeight={CHART_CONFIG.height}
    />
  );
}
