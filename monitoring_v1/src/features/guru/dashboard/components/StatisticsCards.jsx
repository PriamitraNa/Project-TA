import ContentWrapper from '../../../../components/ui/ContentWrapper';
import Card from '../../../../components/ui/Card';
import { FaUsers, FaChild, FaFemale } from 'react-icons/fa';

export default function StatisticsCards({ data, isLoading }) {
  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          icon={<FaUsers />}
          title="Total Siswa"
          value={data.total_siswa.toString()}
          label="Siswa yang Diampu"
        />
        <Card
          icon={<FaChild />}
          title="Siswa Laki-laki"
          value={data.laki_laki.toString()}
          label="Laki-laki"
        />
        <Card
          icon={<FaFemale />}
          title="Siswa Perempuan"
          value={data.perempuan.toString()}
          label="Perempuan"
        />
      </div>
    </ContentWrapper>
  );
}

