import DataTable from '../../../../components/ui/DataTable'
import Button from '../../../../components/ui/Button'
import Pagination from '../../../../components/ui/Pagination'
import { FaStickyNote, FaEye, FaSmile, FaMeh, FaFrown } from 'react-icons/fa'
import { KATEGORI_COLORS } from '../config/constants'

/**
 * CatatanTable Component
 * Tabel daftar catatan dengan pagination
 */
export default function CatatanTable({
  data,
  pagination,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onDetailClick,
  isLoading,
}) {
  // Table columns definition
  const columns = [
    {
      key: 'no',
      label: 'No',
      width: '60px',
    },
    {
      key: 'tanggal',
      label: 'Tanggal',
      width: '100px',
    },
    {
      key: 'guru_nama',
      label: 'Guru',
      width: '150px',
    },
    {
      key: 'mata_pelajaran',
      label: 'Mata Pelajaran',
      width: '130px',
    },
    {
      key: 'kategori',
      label: 'Kategori',
      width: '110px',
      render: (value) => {
        const icons = {
          Positif: <FaSmile className="inline mr-1" />,
          Negatif: <FaFrown className="inline mr-1" />,
          Netral: <FaMeh className="inline mr-1" />,
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${KATEGORI_COLORS[value]}`}>
            {icons[value]}
            {value}
          </span>
        )
      },
    },
    {
      key: 'jenis',
      label: 'Jenis',
      width: '100px',
    },
    {
      key: 'isi_preview',
      label: 'Isi Catatan',
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (value) => {
        const isRead = value === 'Dibaca'
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isRead ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800 font-semibold'
            }`}
          >
            {value}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      width: '100px',
    },
  ]

  // Map data dengan nomor urut dan action button
  const tableData = data.map((item, index) => ({
    ...item,
    no: (currentPage - 1) * itemsPerPage + index + 1,
    mata_pelajaran: item.mapel || '-',
    actions: (
      <div className="flex gap-2">
        <Button variant="info" size="sm" icon={<FaEye />} onClick={() => onDetailClick(item)}>
          Detail
        </Button>
      </div>
    ),
  }))

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <FaStickyNote className="text-emerald-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Daftar Catatan Anak</h3>
            <p className="text-sm text-slate-600">
              {isLoading ? (
                'Memuat data...'
              ) : (
                <>
                  Menampilkan {data.length} dari {pagination.total_data} catatan
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-slate-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
          Memuat data catatan...
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">Tidak ada data catatan</div>
      ) : (
        <DataTable columns={columns} data={tableData} />
      )}

      {/* Pagination Controls */}
      {!isLoading && pagination.total_data > 0 && (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* Per halaman */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                Per halaman:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-0"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center sm:justify-end">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.total_pages}
                  onPageChange={onPageChange}
                  className="scale-90 sm:scale-100"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
