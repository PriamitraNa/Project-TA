import Card from "../../../../components/ui/Card";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiStudentFill } from "react-icons/pi";
import { RiParentFill } from "react-icons/ri";

const CARDS_CONFIG = [
  {
    icon: <FaChalkboardTeacher />,
    title: "Total Guru",
    label: "Guru",
    key: "total_guru",
  },
  {
    icon: <PiStudentFill />,
    title: "Total Siswa",
    label: "Siswa",
    key: "total_siswa",
  },
  {
    icon: <RiParentFill />,
    title: "Total Orangtua",
    label: "Orangtua",
    key: "total_ortu",
  },
];

const getCardValue = (statistics, key, isLoading) => {
  if (isLoading) return "...";
  return statistics[key]?.toString() || "0";
};

export default function StatisticsCards({ statistics, isLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {CARDS_CONFIG.map((card) => (
        <Card
          key={card.key}
          icon={card.icon}
          title={card.title}
          value={getCardValue(statistics, card.key, isLoading)}
          label={card.label}
        />
      ))}
    </div>
  );
}
