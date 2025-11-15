import Card from "../../../../components/ui/Card";
import { FaTrophy, FaArrowUp, FaArrowDown, FaMedal } from "react-icons/fa6";

export default function StatistikCards({ statistik, isLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card
        icon={<FaTrophy />}
        title="Nilai Rata-rata"
        value={statistik.rata_rata || 0}
        loading={isLoading}
        allowMultiLine={true}
      />
      <Card
        icon={<FaArrowUp />}
        title="Nilai Tertinggi"
        value={statistik.nilai_tertinggi || 0}
        label={statistik.mapel_tertinggi || '-'}
        loading={isLoading}
        allowMultiLine={true}
      />
      <Card
        icon={<FaArrowDown />}
        title="Nilai Terendah"
        value={statistik.nilai_terendah || 0}
        label={statistik.mapel_terendah || '-'}
        loading={isLoading}
        allowMultiLine={true}
      />
      <Card
        icon={<FaMedal />}
        title="Peringkat di Kelas"
        value={statistik.peringkat ? `#${statistik.peringkat}` : "-"}
        loading={isLoading}
        allowMultiLine={true}
      />
    </div>
  );
}

