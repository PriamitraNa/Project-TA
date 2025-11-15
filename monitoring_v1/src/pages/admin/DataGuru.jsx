import ContentWrapper from "../../components/ui/ContentWrapper";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import { TambahGuruModal, EditGuruModal, DeleteGuruModal } from "../../components/modals";
import {
  useGuru,
  guruColumns,
  createTableData,
} from "../../features/admin/guru";
import Card from "../../components/ui/Card";
import SearchBar from "../../components/ui/SearchBar";
import { FaUsers } from "react-icons/fa";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import { useState } from "react";


export default function DataGuru() {
    // State untuk modal
  const [isTambahGuruModalOpen, setIsTambahGuruModalOpen] = useState(false);
  const [isEditGuruModalOpen, setIsEditGuruModalOpen] = useState(false);
  const [isDeleteGuruModalOpen, setIsDeleteGuruModalOpen] = useState(false);
    const [selectedGuru, setSelectedGuru] = useState(null);

  // Menggunakan custom hook untuk semua business logic
  const {
    // Data state
    guruData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,

    // Search dan filter state
    searchQuery,
    statusFilter,

    // Sorting state
    sortBy,
    sortOrder,

    // Pagination state
    setCurrentPage,
    itemsPerPage,

    // Handlers
    handleSearch,
    handleStatusFilter,
    handleItemsPerPageChange,
    handleRefresh,
    handleSort,
    handleUpdateGuru,
    handleDeleteGuru,
  } = useGuru();

  // Event handlers
  const handleView = (guru) => {
    console.log("View guru:", guru);
  };

  const handleEdit = (guru) => {
    setSelectedGuru(guru);
    setIsEditGuruModalOpen(true);
  };

  const handleDelete = (guru) => {
    setSelectedGuru(guru);
    setIsDeleteGuruModalOpen(true);
  };

  const handleEditSave = async (updatedGuru) => {
    try {
      await handleUpdateGuru(selectedGuru.id, updatedGuru);
      handleRefresh(); // Refresh data setelah update
      setIsEditGuruModalOpen(false);
      setSelectedGuru(null);
    } catch (error) {
      console.error("Error updating guru:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await handleDeleteGuru(selectedGuru.id);
      handleRefresh(); // Refresh data setelah delete
      setIsDeleteGuruModalOpen(false);
      setSelectedGuru(null);
    } catch (error) {
      console.error("Error deleting guru:", error);
    }
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    };

    const handleAddClick = () => {
    setIsTambahGuruModalOpen(true);
  };

  const handleCloseTambahGuruModal = () => {
    setIsTambahGuruModalOpen(false);
  };

  const handleSaveGuru = (insertedData) => {
    // Modal already handles bulk create, just refresh data here
    console.log("✅ Guru saved:", insertedData);
    handleRefresh();
    setIsTambahGuruModalOpen(false);
  };

  // Create table data
  const tableData = createTableData(guruData, pagination, {
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

    return (
        <>
      <ContentWrapper>
        <div className="space-y-6">
          {/* Judul Halaman */}
          <PageHeader
            icon={<PiChalkboardTeacherFill />}
            title="Data Guru"
            description="Kelola semua data guru"
          />

          {/* Statistics Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}
          >
            <Card
              icon={<FaUsers />}
              title="Total Guru"
              value={isLoadingStatistics ? "..." : (statistics?.total_guru?.toString() || "0")}
              label="Guru"
            />
            <Card
              icon={<FaUsers />}
              title="Aktif"
              value={isLoadingStatistics ? "..." : (statistics?.jumlah_aktif?.toString() || "0")}
              label="Aktif"
            />
            <Card
              icon={<FaUsers />}
              title="Tidak Aktif"
              value={isLoadingStatistics ? "..." : (statistics?.jumlah_tidak_aktif?.toString() || "0")}
              label="Guru Tidak Aktif"
            />
          </div>
        </div>
      </ContentWrapper>

      {/* Search Section */}
      <div className="mt-6 sm:mt-8">
        <div className="space-y-3 sm:space-y-4">
          <SearchBar
            search={searchQuery}
            setSearch={handleSearch}
            filter={statusFilter}
            setFilter={handleStatusFilter}
            filters={[
              { value: "", label: "Semua" },
              { value: "aktif", label: "Aktif" },
              { value: "tidak-aktif", label: "Tidak Aktif" },
            ]}
            placeholder="Cari berdasarkan nama atau NIP..."
            filterPlaceholder="Pilih Status"
                showFilter={true}
                showAddButton={true}
                addButtonText="Tambah Guru"
                onAddClick={handleAddClick}
          />
        </div>
      </div>

      {/* Data Table Section */}
      <div className="mt-6 sm:mt-8">
        <ContentWrapper>
          <div className="space-y-4 sm:space-y-6">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                  <PiChalkboardTeacherFill className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                    Daftar Guru
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-slate-600 truncate">
                      Menampilkan {guruData.length} dari{" "}
                      {pagination.total_data} data
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={guruColumns}
              data={tableData}
              className="mt-6"
              isLoading={isLoading}
              emptyMessage="Tidak ada data guru"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              forceScroll={true}
            />

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
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
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
                       currentPage={pagination.current_page}
                       totalPages={pagination.total_pages}
                       onPageChange={handlePageChange}
                       className="scale-90 sm:scale-100"
                     />
                  </div>
                )}
              </div>
            </div>
          </div>
        </ContentWrapper>
      </div>

      {/* Modal Tambah Guru */}
      <TambahGuruModal
        isOpen={isTambahGuruModalOpen}
        onClose={handleCloseTambahGuruModal}
        onSave={handleSaveGuru}
      />

      {/* Modal Edit Guru */}
            <EditGuruModal
        isOpen={isEditGuruModalOpen}
        onClose={() => {
          setIsEditGuruModalOpen(false);
          setSelectedGuru(null);
        }}
        onSave={handleEditSave}
                guruData={selectedGuru}
            />

      {/* Modal Delete Guru */}
      <DeleteGuruModal
        isOpen={isDeleteGuruModalOpen}
        onClose={() => {
          setIsDeleteGuruModalOpen(false);
          setSelectedGuru(null);
        }}
                onConfirm={handleDeleteConfirm}
        guruData={selectedGuru}
            />
        </>
    );
}
  