import ContentWrapper from '../../../../components/ui/ContentWrapper';
import DataTable from '../../../../components/ui/DataTable';
import Pagination from '../../../../components/ui/Pagination';
import Button from '../../../../components/ui/Button';
import { FaStickyNote, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { columns } from '../config';

/**
 * CatatanTable Component
 * Table with pagination and actions for Catatan
 */
export default function CatatanTable({
  catatanData,
  pagination,
  isLoading,
  currentPage,
  itemsPerPage,
  handlePageChange,
  handleItemsPerPageChange,
  handleViewDetail,
  handleEdit,
  handleDelete
}) {
  // Pagination calculation
  const totalPages = pagination.total_pages || 0;
  const startIndex = (pagination.current_page - 1) * pagination.per_page;
  const currentData = catatanData || [];

  // Table data with actions
  const tableData = currentData.map((item, index) => ({
    ...item,
    no: startIndex + index + 1,
    actions: (
      <div className="flex gap-1 justify-center">
        <Button
          variant="info"
          size="sm"
          icon={<FaEye />}
          ariaLabel="Detail"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => handleViewDetail(item)}
        >
          Detail
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<FaEdit />}
          ariaLabel="Edit"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => handleEdit(item)}
          disabled={!item.can_edit}
          title={!item.can_edit ? 'Waktu edit sudah habis (max 15 menit)' : 'Edit catatan'}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<FaTrash />}
          ariaLabel="Hapus"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => handleDelete(item)}
          disabled={!item.can_delete}
          title={!item.can_delete ? 'Waktu hapus sudah habis (max 15 menit)' : 'Hapus catatan'}
        >
          Hapus
        </Button>
      </div>
    )
  }));

  return (
    <ContentWrapper>
      <div className="space-y-4">
        {/* Table Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FaStickyNote className="text-emerald-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Daftar Catatan Siswa
              </h3>
              <p className="text-sm text-slate-600">
                Menampilkan {currentData.length} dari {pagination.total || 0} catatan
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Memuat data catatan...</div>
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Tidak ada data catatan</div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tableData}
          />
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* Per halaman */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                Per halaman:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-0"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center sm:justify-end">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="scale-90 sm:scale-100"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}

