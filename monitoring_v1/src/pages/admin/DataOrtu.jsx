import ContentWrapper from "../../components/ui/ContentWrapper";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import {
  TambahOrtuModal,
  EditOrtuModal,
  DeleteOrtuModal,
} from "../../components/modals";
import {
  useOrtu,
  ortuColumns,
  createTableData,
} from "../../features/admin/ortu";
import Card from "../../components/ui/Card";
import SearchBar from "../../components/ui/SearchBar";
import { FaUsers, FaPlus } from "react-icons/fa";
import { RiParentFill } from "react-icons/ri";
import { IoWomanOutline } from "react-icons/io5";
import { FaUserShield } from "react-icons/fa6";
import { useState } from "react";

export default function DataOrtu() {
  // State untuk modal
  const [isTambahOrtuModalOpen, setIsTambahOrtuModalOpen] = useState(false);
  const [isEditOrtuModalOpen, setIsEditOrtuModalOpen] = useState(false);
  const [isDeleteOrtuModalOpen, setIsDeleteOrtuModalOpen] = useState(false);
  const [selectedOrtu, setSelectedOrtu] = useState(null);

  // Menggunakan custom hook untuk semua business logic
  const {
    // Data state
    ortuData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,

    // Search dan filter state
    searchQuery,
    relasiFilter,

    // Sorting state
    sortBy,
    sortOrder,

    // Pagination state
    setCurrentPage,
    itemsPerPage,

    // Handlers
    handleSearch,
    handleRelasiFilter,
    handleItemsPerPageChange,
    handleRefresh,
    handleSort,
    handleUpdateOrtu,
    handleDeleteOrtu,
  } = useOrtu();

  // Event handlers
  const handleView = (ortu) => {
    console.log("View ortu:", ortu);
  };

  const handleEdit = (ortu) => {
    setSelectedOrtu(ortu);
    setIsEditOrtuModalOpen(true);
  };

  const handleDelete = (ortu) => {
    setSelectedOrtu(ortu);
    setIsDeleteOrtuModalOpen(true);
  };

  const handleEditSave = async (updatedOrtu) => {
    try {
      await handleUpdateOrtu(selectedOrtu.id, updatedOrtu);
      handleRefresh(); // Refresh data setelah update
      setIsEditOrtuModalOpen(false);
      setSelectedOrtu(null);
    } catch (error) {
      console.error("Error updating ortu:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await handleDeleteOrtu(selectedOrtu.id);
      handleRefresh(); // Refresh data setelah delete
      setIsDeleteOrtuModalOpen(false);
      setSelectedOrtu(null);
    } catch (error) {
      console.error("Error deleting ortu:", error);
    }
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleAddClick = () => {
    setIsTambahOrtuModalOpen(true);
  };

  const handleCloseTambahOrtuModal = () => {
    setIsTambahOrtuModalOpen(false);
  };

  const handleSaveOrtu = (insertedData) => {
    // Modal already handles bulk create, just refresh data here
    console.log("✅ Ortu saved:", insertedData);
    handleRefresh();
    setIsTambahOrtuModalOpen(false);
  };

  // Create table data using configuration
  const tableData = createTableData(ortuData, pagination, {
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
            icon={<RiParentFill />}
            title="Data Orangtua"
            description="Kelola semua data orangtua"
          />

          {/* Statistics Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`}
          >
            <Card
              icon={<FaUsers />}
              title="Total Orangtua"
              value={
                isLoadingStatistics
                  ? "..."
                  : statistics?.total_ortu?.toString() || "0"
              }
              label="Orangtua"
              compact={true}
            />
            <Card
              icon={<FaUserShield />}
              title="Jumlah Ayah"
              value={
                isLoadingStatistics
                  ? "..."
                  : statistics?.jumlah_ayah?.toString() || "0"
              }
              label="Ayah"
              compact={true}
            />
            <Card
              icon={<IoWomanOutline />}
              title="Jumlah Ibu"
              value={
                isLoadingStatistics
                  ? "..."
                  : statistics?.jumlah_ibu?.toString() || "0"
              }
              label="Ibu"
              compact={true}
            />
            <Card
              icon={<FaUserShield />}
              title="Jumlah Wali"
              value={
                isLoadingStatistics
                  ? "..."
                  : statistics?.jumlah_wali?.toString() || "0"
              }
              label="Wali"
              compact={true}
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
            filter={relasiFilter}
            setFilter={handleRelasiFilter}
            filters={[
              { value: "", label: "Semua" },
              { value: "Ayah", label: "Ayah" },
              { value: "Ibu", label: "Ibu" },
              { value: "Wali", label: "Wali" },
            ]}
            placeholder="Cari berdasarkan nama atau NIK..."
            filterPlaceholder="Pilih Relasi"
            showFilter={true}
            showAddButton={true}
            addButtonText="Tambah Orangtua"
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
                  <RiParentFill className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                    Daftar Orangtua
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-slate-600 truncate">
                      Menampilkan {ortuData.length} dari {pagination.total_data}{" "}
                      data
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={ortuColumns}
              data={tableData}
              className="mt-6"
              isLoading={isLoading}
              emptyMessage="Tidak ada data orangtua"
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

      {/* Modal Tambah Ortu */}
      <TambahOrtuModal
        isOpen={isTambahOrtuModalOpen}
        onClose={handleCloseTambahOrtuModal}
        onSave={handleSaveOrtu}
      />

      {/* Modal Edit Ortu */}
      <EditOrtuModal
        isOpen={isEditOrtuModalOpen}
        onClose={() => {
          setIsEditOrtuModalOpen(false);
          setSelectedOrtu(null);
        }}
        onSave={handleEditSave}
        ortuData={selectedOrtu}
      />

      {/* Modal Delete Ortu */}
      <DeleteOrtuModal
        isOpen={isDeleteOrtuModalOpen}
        onClose={() => {
          setIsDeleteOrtuModalOpen(false);
          setSelectedOrtu(null);
        }}
        onConfirm={handleDeleteConfirm}
        ortuData={selectedOrtu}
      />
    </>
  );
}
