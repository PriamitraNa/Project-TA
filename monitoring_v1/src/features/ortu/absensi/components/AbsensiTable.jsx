import DataTable from '../../../../components/ui/DataTable'
import moment from 'moment'

/**
 * AbsensiTable Component
 * Tampilan tabel detail absensi harian
 */
export default function AbsensiTable({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4 md:p-6 shadow-sm">
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 sm:h-12 bg-slate-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // Format data untuk tabel
  const tableData = data.map((item, index) => ({
    no: index + 1,
    tanggal: moment(item.tanggal, 'YYYY-MM-DD').format('DD MMM YYYY (dddd)'),
    status: (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          item.status === 'hadir'
            ? 'bg-emerald-100 text-emerald-800'
            : item.status === 'sakit'
            ? 'bg-yellow-100 text-yellow-800'
            : item.status === 'izin'
            ? 'bg-blue-100 text-blue-800'
            : item.status === 'alpha'
            ? 'bg-red-100 text-red-800'
            : 'bg-slate-100 text-slate-800'
        }`}
      >
        {item.status
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
          : 'N/A'}
      </span>
    ),
    keterangan: item.keterangan || '-',
  }))

  const columns = [
    { label: 'No', key: 'no', className: 'w-12 text-center' },
    { label: 'Tanggal', key: 'tanggal', className: 'text-left' },
    { label: 'Status', key: 'status', className: 'w-32 text-center' },
    { label: 'Keterangan', key: 'keterangan', className: 'text-left' },
  ]

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-6 sm:p-8 md:p-12 shadow-sm">
        <div className="text-center">
          <div className="text-slate-400 text-3xl sm:text-4xl mb-3">📋</div>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Tidak ada data absensi</p>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Pilih periode lain untuk melihat data
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={tableData}
        className="shadow-sm rounded-lg sm:rounded-xl"
      />
    </div>
  )
}
