import ContentWrapper from '../../../../components/ui/ContentWrapper'
import Card from '../../../../components/ui/Card'
import { FaStickyNote, FaSmile, FaFrown, FaMeh } from 'react-icons/fa'

/**
 * StatisticsCards Component
 * Display statistics cards for Catatan
 */
export default function StatisticsCards({ statistik, isLoading }) {
  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Memuat statistik...</div>
        </div>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          icon={<FaStickyNote className="text-2xl" />}
          title="Total Catatan"
          value={statistik.total.toString()}
          label="Catatan"
          compact={true}
        />
        <Card
          icon={<FaSmile className="text-2xl text-green-600" />}
          title="Positif"
          value={statistik.positif.toString()}
          label="Catatan"
          compact={true}
        />
        <Card
          icon={<FaFrown className="text-2xl text-red-600" />}
          title="Negatif"
          value={statistik.negatif.toString()}
          label="Catatan"
          compact={true}
        />
        <Card
          icon={<FaMeh className="text-2xl text-gray-600" />}
          title="Netral"
          value={statistik.netral.toString()}
          label="Catatan"
          compact={true}
        />
      </div>
    </ContentWrapper>
  )
}
