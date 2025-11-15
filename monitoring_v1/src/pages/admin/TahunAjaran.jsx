import ContentWrapper from "../../components/ui/ContentWrapper";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import { AddTahunAjaranModal, DeleteTahunAjaranModal } from "../../components/modals";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";
import { useTahunAjaran, tableColumns, createTableData } from "../../features/admin/tahun-ajaran";

export default function TahunAjaran() {
    // Menggunakan custom hook untuk semua business logic
    const {
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        tahunAjaranData,
        isLoading,
        isModalOpen,
        isDeleteModalOpen,
        selectedTahunAjaran,
        currentData,
        totalPages,
        startIndex,
        handleToggleStatus,
        handleDelete,
        handleCloseDeleteModal,
        handleDeleteSuccess,
        handleTambah,
        handleModalClose,
        handleModalSuccess
    } = useTahunAjaran();

    // Create table data using configuration
    const tableData = createTableData(currentData, startIndex, {
        handleToggleStatus,
        handleDelete
    });

    return (
        <>
        <ContentWrapper>
        <div className="space-y-6">
          {/* Judul Halaman */}
          <PageHeader
            icon={<FaCalendarAlt  />}
            title="Manajemen Tahun Ajaran"
            description="Kelola tahun ajaran"
          />
        </div>
      </ContentWrapper>


{/* Data Table Section */}
<div className="mt-6 sm:mt-8">
<ContentWrapper>
  <div className="space-y-4 sm:space-y-6">
           {/* Table Header - Responsive */}
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
               <div className="flex items-center gap-2 sm:gap-3">
                 <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                   <FaCalendarAlt className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                 </div>
                 <div className="min-w-0 flex-1">
                   <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">Daftar Tahun Ajaran</h3>
                   <div className="flex items-center gap-2 mt-1">
                   <p className="text-xs sm:text-sm text-slate-600 truncate">
                     Menampilkan {currentData.length} dari {tahunAjaranData.length} tahun ajaran
                   </p>
                   </div>
                 </div>
               </div>
               
               {/* Tombol Tambah Tahun Ajaran */}
               <div className="flex-shrink-0">
                 <Button
                   variant="primary"
                   size="sm"
                   icon={<FaPlus />}
                   onClick={handleTambah}
                   title="Tambah tahun ajaran baru"
                 >
                   Tambah Tahun Ajaran
                 </Button>
               </div>
           </div>

    {/* Data Table */}
    <DataTable
      columns={tableColumns}
      data={tableData}
      className="mt-6"
      isLoading={isLoading}
      emptyMessage="Tidak ada data tahun ajaran"
    />

    {/* Pagination Controls - Responsive */}
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
      {/* Per halaman - Bawah Kiri */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">Per halaman:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          disabled={isLoading}
          className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-0"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Pagination - Bawah Kanan */}
      {totalPages > 1 && (
        <div className="flex justify-center sm:justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="scale-90 sm:scale-100"
          />
        </div>
      )}
    </div>
  </div>
</ContentWrapper>
</div>
      
      {/* Add Tahun Ajaran Modal */}
      <AddTahunAjaranModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteTahunAjaranModal 
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        tahunAjaran={selectedTahunAjaran}
        onSuccess={handleDeleteSuccess}
      />
      </>
    );
  }
  