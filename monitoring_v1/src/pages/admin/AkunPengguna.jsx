import ContentWrapper from '../../components/ui/ContentWrapper'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import {
  TambahAkunPenggunaModal,
  DeleteGuruModal,
  ResetPasswordModal,
  ConfirmModal,
} from '../../components/modals'
import {
  useAkunPengguna,
  akunPenggunaColumns,
  createTableData,
} from '../../features/admin/akun-pengguna'
import Card from '../../components/ui/Card'
import SearchBar from '../../components/ui/SearchBar'
import { FaUsers, FaUserCog, FaChalkboardTeacher, FaUserFriends } from 'react-icons/fa'
import { useState } from 'react'

const ROLE_FILTERS = [
  { value: '', label: 'Semua Role' },
  { value: 'admin', label: 'Admin' },
  { value: 'guru', label: 'Guru' },
  { value: 'orangtua', label: 'Orangtua' },
]

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50]

export default function AkunPengguna() {
  const [isTambahAkunModalOpen, setIsTambahAkunModalOpen] = useState(false)
  const [isDeleteAkunModalOpen, setIsDeleteAkunModalOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [selectedAkun, setSelectedAkun] = useState(null)

  const {
    akunData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,
    searchQuery,
    roleFilter,
    sortBy,
    sortOrder,
    setCurrentPage,
    itemsPerPage,
    handleSearch,
    handleRoleFilter,
    handleItemsPerPageChange,
    handleSort,
    loadAkunData,
    loadStatistics,
    handleDeleteAkun,
  } = useAkunPengguna()

  const handleTambahAkun = () => setIsTambahAkunModalOpen(true)

  const handleDeleteAkunClick = (akun) => {
    setSelectedAkun(akun)
    setIsDeleteAkunModalOpen(true)
  }

  const handleResetPasswordClick = (akun) => {
    setSelectedAkun(akun)
    setIsResetPasswordModalOpen(true)
  }

  const handleCloseModal = (modalType) => {
    const modalActions = {
      tambah: () => setIsTambahAkunModalOpen(false),
      delete: () => {
        setIsDeleteAkunModalOpen(false)
        setSelectedAkun(null)
      },
      reset: () => {
        setIsResetPasswordModalOpen(false)
        setSelectedAkun(null)
      },
    }
    modalActions[modalType]?.()
  }

  const handleTambahSuccess = () => {
    loadAkunData()
    loadStatistics()
    handleCloseModal('tambah')
  }

  const handleDeleteConfirm = () => {
    if (selectedAkun) {
      handleDeleteAkun(selectedAkun.id)
      handleCloseModal('delete')
    }
  }

  const tableData = createTableData(akunData, pagination, {
    onDelete: handleDeleteAkunClick,
    onReset: handleResetPasswordClick,
  })

  const statisticsCards = [
    { icon: <FaUsers />, title: 'Total Akun', key: 'total_akun' },
    { icon: <FaUserCog />, title: 'Admin', key: 'admin' },
    { icon: <FaChalkboardTeacher />, title: 'Guru', key: 'guru' },
    { icon: <FaUserFriends />, title: 'Orangtua', key: 'orangtua' },
  ]

  return (
    <>
      <ContentWrapper>
        <div className="space-y-5 sm:space-y-6">
          <PageHeader
            icon={<FaUserCog />}
            title="Manajemen Akun Pengguna"
            description="Kelola semua akun pengguna sistem"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {statisticsCards.map((card) => (
              <Card
                key={card.key}
                icon={card.icon}
                title={card.title}
                value={statistics[card.key]}
                label={card.title}
                isLoading={isLoadingStatistics}
                compact
              />
            ))}
          </div>
        </div>
      </ContentWrapper>

      <div className="mt-5 sm:mt-6 lg:mt-8">
        <ContentWrapper>
          <div className="space-y-3 sm:space-y-4">
            <SearchBar
              search={searchQuery}
              setSearch={handleSearch}
              filter={roleFilter}
              setFilter={handleRoleFilter}
              filters={ROLE_FILTERS}
              filterPlaceholder="Pilih Role"
              placeholder="Cari nama atau username"
              onSearch={handleSearch}
              showFilter
              showAddButton
              addButtonText="Tambah Akun"
              onAddClick={handleTambahAkun}
            />
          </div>
        </ContentWrapper>
      </div>

      <div className="mt-5 sm:mt-6 lg:mt-8">
        <ContentWrapper>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                  <FaUserCog className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                    Daftar Akun Pengguna
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-slate-600 truncate">
                      Menampilkan {akunData.length} dari {pagination.total_data} akun
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DataTable
              columns={akunPenggunaColumns}
              data={tableData}
              className="mt-6"
              isLoading={isLoading}
              emptyMessage="Tidak ada data akun pengguna"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              forceScroll
            />

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                  Per halaman:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-0"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {pagination.total_pages > 1 && (
                <div className="flex justify-center sm:justify-end">
                  <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.total_pages}
                    onPageChange={setCurrentPage}
                    className="scale-90 sm:scale-100"
                  />
                </div>
              )}
            </div>
          </div>
        </ContentWrapper>
      </div>

      <TambahAkunPenggunaModal
        isOpen={isTambahAkunModalOpen}
        onClose={() => handleCloseModal('tambah')}
        onSave={handleTambahSuccess}
      />

      <ConfirmModal
        isOpen={isDeleteAkunModalOpen}
        onClose={() => handleCloseModal('delete')}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus Akun"
        message="Data akun akan DIHAPUS PERMANEN dari database. Apakah Anda yakin ingin menghapus akun ini?"
        itemName={selectedAkun?.nama_lengkap}
        confirmText="Hapus Akun"
        variant="danger"
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => handleCloseModal('reset')}
        userData={selectedAkun}
        onSuccess={loadAkunData}
      />
    </>
  )
}
