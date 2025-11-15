import ContentWrapper from "../../components/ui/ContentWrapper";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import { TambahSiswaDataModal } from "../../components/modals";
import EditSiswaModal from "../../components/modals/Admin/Siswa/EditSiswaModal";
import DeleteSiswaModal from "../../components/modals/Admin/Siswa/DeleteSiswaModal";
import {
  useSiswa,
  siswaColumns,
  createTableData,
} from "../../features/admin/siswa";
import Card from "../../components/ui/Card";
import SearchBar from "../../components/ui/SearchBar";
import { FaUsers, FaPlus } from "react-icons/fa";
import { IoSchoolOutline } from "react-icons/io5";
import { useState } from "react";

export default function DataSiswa() {
  // State untuk modal
  const [isTambahSiswaModalOpen, setIsTambahSiswaModalOpen] = useState(false);
  const [isEditSiswaModalOpen, setIsEditSiswaModalOpen] = useState(false);
  const [isDeleteSiswaModalOpen, setIsDeleteSiswaModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);

  // Menggunakan custom hook untuk semua business logic
  const {
    // Data state
    siswaData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,

    // Search dan filter state
    searchQuery,
    jenisKelaminFilter,

    // Sorting state
    sortBy,
    sortOrder,

    // Pagination state
    setCurrentPage,
    itemsPerPage,

    // Handlers
    handleSearch,
    handleJenisKelaminFilter,
    handleItemsPerPageChange,
    handleRefresh,
    handleSort,
  } = useSiswa();

    // Event handlers
  const handleView = (siswa) => {
    console.log("View siswa:", siswa);
  };

  const handleEdit = (siswa) => {
    setSelectedSiswa(siswa);
    setIsEditSiswaModalOpen(true);
  };

  const handleDelete = (siswa) => {
    setSelectedSiswa(siswa);
    setIsDeleteSiswaModalOpen(true);
  };

  const handleEditSave = (updatedSiswa) => {
    console.log("✅ Siswa updated:", updatedSiswa);
    handleRefresh(); // Refresh data setelah update
    setIsEditSiswaModalOpen(false);
    setSelectedSiswa(null);
  };

  const handleDeleteConfirm = (deletedSiswa) => {
    console.log("✅ Siswa deleted:", deletedSiswa);
    handleRefresh(); // Refresh data setelah delete
    setIsDeleteSiswaModalOpen(false);
    setSelectedSiswa(null);
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    };

    const handleAddClick = () => {
    setIsTambahSiswaModalOpen(true);
  };

  const handleCloseTambahSiswaModal = () => {
    setIsTambahSiswaModalOpen(false);
  };

  const handleSaveSiswa = (insertedData) => {
    // Modal already handles bulk create, just refresh data here
    console.log("✅ Siswa saved:", insertedData);
    handleRefresh();
    setIsTambahSiswaModalOpen(false);
  };

  // Create table data using configuration
  const tableData = createTableData(siswaData, pagination, {
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
            icon={<IoSchoolOutline />}
            title="Data Siswa"
            description="Kelola semua data siswa"
          />

          {/* Statistics Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}
          >
            <Card
              icon={<FaUsers />}
              title="Total Siswa"
              value={isLoadingStatistics ? "..." : (statistics?.total_siswa?.toString() || "0")}
              label="Siswa"
            />
            <Card
              icon={<FaUsers />}
              title="Laki-laki"
              value={isLoadingStatistics ? "..." : (statistics?.jumlah_laki_laki?.toString() || "0")}
              label="Laki-laki"
            />
            <Card
              icon={<FaUsers />}
              title="Perempuan"
              value={isLoadingStatistics ? "..." : (statistics?.jumlah_perempuan?.toString() || "0")}
              label="Perempuan"
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
            filter={jenisKelaminFilter}
            setFilter={handleJenisKelaminFilter}
            filters={[
              { value: "", label: "Semua" },
              { value: "L", label: "Laki-laki" },
              { value: "P", label: "Perempuan" },
            ]}
            placeholder="Cari berdasarkan nama atau NISN..."
            filterPlaceholder="Pilih Jenis Kelamin"
            showFilter={true}
            showAddButton={true}
            addButtonText="Tambah Siswa"
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
                  <IoSchoolOutline className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                    Daftar Siswa
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-slate-600 truncate">
                      Menampilkan {siswaData.length} dari{" "}
                      {pagination.total_data} data
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={siswaColumns}
              data={tableData}
              className="mt-6"
              isLoading={isLoading}
              emptyMessage="Tidak ada data siswa"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
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

      {/* Modal Tambah Siswa */}
      <TambahSiswaDataModal
        isOpen={isTambahSiswaModalOpen}
        onClose={handleCloseTambahSiswaModal}
        onSave={handleSaveSiswa}
      />

      {/* Modal Edit Siswa */}
      <EditSiswaModal
        isOpen={isEditSiswaModalOpen}
        onClose={() => {
          setIsEditSiswaModalOpen(false);
          setSelectedSiswa(null);
        }}
        onSave={handleEditSave}
        siswaData={selectedSiswa}
      />

      {/* Modal Delete Siswa */}
      <DeleteSiswaModal
        isOpen={isDeleteSiswaModalOpen}
        onClose={() => {
          setIsDeleteSiswaModalOpen(false);
          setSelectedSiswa(null);
        }}
        onConfirm={handleDeleteConfirm}
        siswaData={selectedSiswa}
      />
    </>
    );
}
  