import Card from "../../../../components/ui/Card";
import { FaClipboardCheck } from "react-icons/fa6";

export default function AbsensiCard({ status, tanggal, isLoading }) {
  // Customize value size based on status length
  const valueElement = (
    <div className={`font-bold text-slate-900 ${
      status && status.length > 8 
        ? 'text-base sm:text-lg' 
        : 'text-lg sm:text-xl lg:text-2xl'
    }`}>
      {status}
    </div>
  );

  return (
    <Card
      icon={<FaClipboardCheck />}
      title="Absensi Hari Ini"
      value={valueElement}
      label={tanggal}
      allowMultiLine={true}
      loading={isLoading}
    />
  );
}

