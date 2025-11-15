import PieChartComponent from "../../../../components/charts/PieChartComponent";

const CHART_CONFIG = {
  title: "Jumlah Siswa Laki-laki dan Perempuan",
  height: "250px",
};

const LoadingState = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      {CHART_CONFIG.title}
    </h3>
    <div className="flex items-center justify-center h-[250px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2" />
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
      <p className="text-gray-500 text-sm">Belum ada data siswa</p>
    </div>
  </div>
);

export default function GenderChart({ data, isLoading }) {
  if (isLoading) return <LoadingState />;

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  if (totalValue === 0) return <EmptyState />;

  return (
    <PieChartComponent
      data={data}
      width="100%"
      height="100%"
      showLegend
      legendPosition="bottom"
      showCard
      title={CHART_CONFIG.title}
      chartHeight={CHART_CONFIG.height}
    />
  );
}
