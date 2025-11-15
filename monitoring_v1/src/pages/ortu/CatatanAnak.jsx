import ContentWrapper from '../../components/ui/ContentWrapper'
import PageHeader from '../../components/ui/PageHeader'
import { FaStickyNote } from 'react-icons/fa'
import { DetailCatatanOrtuModal } from '../../components/modals'
import {
  useCatatanAnak,
  StatisticsCards,
  FilterSection,
  CatatanTable,
} from '../../features/ortu/catatan'

export default function CatatanAnak() {
  const {
    // State
    search,
    kategoriFilter,
    jenisFilter,
    currentPage,
    itemsPerPage,
    isDetailModalOpen,
    selectedCatatan,
    catatanData,
    pagination,
    statistics,
    isLoadingStats,
    isLoadingList,

    // Handlers
    handleSearchChange,
    handleKategoriFilterChange,
    handleJenisFilterChange,
    handleItemsPerPageChange,
    handlePageChange,
    handleOpenDetail,
    handleCloseDetail,
    handleRefresh,
  } = useCatatanAnak()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FaStickyNote />}
        title="Catatan dari Guru"
        description="Lihat catatan perkembangan anak dari guru dan berikan tanggapan"
      />

      {/* Statistics Cards */}
      <ContentWrapper>
        <StatisticsCards statistics={statistics} isLoading={isLoadingStats} />
      </ContentWrapper>

      {/* Search and Filter */}
      <div className="space-y-4">
        <FilterSection
          search={search}
          kategoriFilter={kategoriFilter}
          jenisFilter={jenisFilter}
          onSearchChange={handleSearchChange}
          onKategoriChange={handleKategoriFilterChange}
          onJenisChange={handleJenisFilterChange}
        />
      </div>

      {/* Data Table */}
      <ContentWrapper>
        <CatatanTable
          data={catatanData}
          pagination={pagination}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          onDetailClick={handleOpenDetail}
          isLoading={isLoadingList}
        />
      </ContentWrapper>

      {/* Detail Modal */}
      <DetailCatatanOrtuModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        catatanId={selectedCatatan?.id}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
