import Card from '../../../../components/ui/Card'
import { FaStickyNote, FaSmile, FaFrown, FaMeh } from 'react-icons/fa'

/**
 * StatisticsCards Component
 * Menampilkan 4 cards: Total, Positif, Negatif, Netral
 */
export default function StatisticsCards({ statistics, isLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card
        icon={<FaStickyNote className="text-2xl" />}
        title="Total Catatan"
        value={isLoading ? '-' : statistics.total.toString()}
        label="Catatan"
        compact={true}
      />
      <Card
        icon={<FaSmile className="text-2xl text-green-600" />}
        title="Positif"
        value={isLoading ? '-' : statistics.positif.toString()}
        label="Catatan"
        compact={true}
      />
      <Card
        icon={<FaFrown className="text-2xl text-red-600" />}
        title="Negatif"
        value={isLoading ? '-' : statistics.negatif.toString()}
        label="Catatan"
        compact={true}
      />
      <Card
        icon={<FaMeh className="text-2xl text-gray-600" />}
        title="Netral"
        value={isLoading ? '-' : statistics.netral.toString()}
        label="Catatan"
        compact={true}
      />
    </div>
  )
}
