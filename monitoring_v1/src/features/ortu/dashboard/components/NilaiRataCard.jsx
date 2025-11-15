import Card from "../../../../components/ui/Card";
import { FaBookOpen } from "react-icons/fa6";

export default function NilaiRataCard({ nilai, semester, tahunAjaran, isLoading }) {
  // Split label into 2 lines for better readability
  const semesterLabel = semester ? `Semester ${semester}` : "Semester Ganjil";
  const tahunLabel = tahunAjaran || "";

  return (
    <Card
      icon={<FaBookOpen />}
      title="Nilai Rata-rata"
      value={nilai ?? 0}
      label={
        <div className="text-xs sm:text-sm text-slate-600">
          <div>{semesterLabel}</div>
          {tahunLabel && <div>{tahunLabel}</div>}
        </div>
      }
      loading={isLoading}
      allowMultiLine={true}
    />
  );
}

