import { FaCheck, FaHeartPulse, FaFile, FaCircleXmark } from 'react-icons/fa6'

/**
 * SummaryCards Component
 * Menampilkan kartu ringkasan absensi dengan 4 status utama
 * Layout: Horizontal (icon di kiri, label/value di kanan)
 *
 * Props:
 * - data: Object dengan { total_hadir, total_sakit, total_izin, total_alpha }
 * - isLoading: Boolean untuk loading state
 */
export default function SummaryCards({ data = {}, isLoading = false }) {
  const defaultData = {
    total_hadir: 0,
    total_sakit: 0,
    total_izin: 0,
    total_alpha: 0,
  }

  const summaryData = { ...defaultData, ...data }

  const cards = [
    {
      id: 'hadir',
      label: 'Hadir',
      value: summaryData.total_hadir,
      icon: FaCheck,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueBg: 'text-emerald-600',
    },
    {
      id: 'sakit',
      label: 'Sakit',
      value: summaryData.total_sakit,
      icon: FaHeartPulse,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      valueBg: 'text-yellow-600',
    },
    {
      id: 'izin',
      label: 'Izin',
      value: summaryData.total_izin,
      icon: FaFile,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueBg: 'text-blue-600',
    },
    {
      id: 'alpha',
      label: 'Alpha',
      value: summaryData.total_alpha,
      icon: FaCircleXmark,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueBg: 'text-red-600',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-slate-100 rounded-lg p-3 sm:p-4 h-20 sm:h-24 animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 hover:shadow-md transition-shadow"
          >
            <div className={`${card.iconBg} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
              <Icon className={`${card.iconColor} text-lg sm:text-xl`} />
            </div>
            <div className="flex-grow">
              <div className="text-xs sm:text-sm text-slate-600">{card.label}</div>
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${card.valueBg}`}>
                {card.value}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
