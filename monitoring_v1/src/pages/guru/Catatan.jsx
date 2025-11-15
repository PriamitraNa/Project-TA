import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { FaStickyNote } from 'react-icons/fa';
import { DetailCatatanGuruModal, TambahCatatanModal, ConfirmModal } from '../../components/modals';
import { 
  useCatatan, 
  useStatistikCatatan,
  StatisticsCards,
  FilterSection,
  CatatanTable
} from '../../features/guru/catatan';
import { CatatanService } from '../../services/Guru/catatan/CatatanService';
import toast from 'react-hot-toast';

export default function Catatan() {
  // Use custom hook untuk data management
  const {
    catatanData,
    pagination,
    isLoading,
    searchQuery,
    kategoriFilter,
    jenisFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleSearch,
    handleKategoriFilter,
    handleJenisFilter,
    handleItemsPerPageChange,
    handleRefresh,
  } = useCatatan();

  // Use custom hook untuk statistik
  const {
    statistik,
    isLoadingStatistik,
    refreshStatistik
  } = useStatistikCatatan();

  // State untuk modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCatatan, setSelectedCatatan] = useState(null);
  const [catatanToDelete, setCatatanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler untuk page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handler untuk tambah catatan
  const handleTambahCatatan = () => {
    setSelectedCatatan(null); // Clear selected untuk mode tambah
    setIsTambahModalOpen(true);
  };

  // Handler untuk refresh data dan statistik
  const handleRefreshAll = () => {
    handleRefresh(); // Refresh table data
    refreshStatistik(); // Refresh statistics
  };

  // Handler untuk view detail
  const handleViewDetail = (item) => {
    setSelectedCatatan(item);
    setIsDetailModalOpen(true);
  };

  // Handler untuk edit
  const handleEdit = async (item) => {
    // Check if can edit (15 minute time limit)
    if (!item.can_edit) {
      toast.error('Waktu edit sudah habis. Catatan hanya dapat diedit dalam 15 menit setelah dibuat.');
      return;
    }

    try {
      // Fetch full data untuk populate form
      const response = await CatatanService.getForEdit(item.id);
      
      // Double check can_edit dari API
      if (!response.data.can_edit) {
        toast.error('Waktu edit sudah habis. Catatan hanya dapat diedit dalam 15 menit setelah dibuat.');
        return;
      }
      
      // Set selected catatan dengan data lengkap untuk edit
      setSelectedCatatan(response.data);
      setIsTambahModalOpen(true);
    } catch (error) {
      console.error('Error loading catatan for edit:', error);
      if (error.response?.status === 404) {
        toast.error('Catatan tidak ditemukan atau tidak bisa diakses');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data catatan');
      }
    }
  };

  // Handler untuk delete
  const handleDelete = (item) => {
    // Check if can delete (15 minute time limit)
    if (!item.can_delete) {
      return; // Button is already disabled, but double check
    }

    // Open confirmation modal
    setCatatanToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!catatanToDelete) return;

    setIsDeleting(true);
    try {
      await CatatanService.delete(catatanToDelete.id);
      handleRefreshAll(); // Refresh table and stats
      setIsDeleteModalOpen(false);
      setCatatanToDelete(null);
      
      // Show success message using browser alert (not toast)
      setTimeout(() => {
        alert('✓ Catatan berhasil dihapus');
      }, 100);
    } catch (error) {
      console.error('Error deleting catatan:', error);
      
      // Show error message using browser alert (not toast)
      let errorMessage = 'Gagal menghapus catatan';
      
      if (error.response?.status === 403) {
        errorMessage = 'Waktu hapus sudah habis. Catatan hanya dapat dihapus dalam 15 menit setelah dibuat.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Catatan tidak ditemukan';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert('✗ ' + errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FaStickyNote />}
        title="Catatan Siswa"
        description="Kelola catatan perkembangan dan perilaku siswa untuk nilai sikap"
      />

      {/* Statistics Cards */}
      <StatisticsCards 
        statistik={statistik} 
        isLoading={isLoadingStatistik} 
      />

      {/* Search and Filter */}
      <FilterSection
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        kategoriFilter={kategoriFilter}
        handleKategoriFilter={handleKategoriFilter}
        jenisFilter={jenisFilter}
        handleJenisFilter={handleJenisFilter}
        handleTambahCatatan={handleTambahCatatan}
      />

      {/* Data Table */}
      <CatatanTable
        catatanData={catatanData}
        pagination={pagination}
        isLoading={isLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        handlePageChange={handlePageChange}
        handleItemsPerPageChange={handleItemsPerPageChange}
        handleViewDetail={handleViewDetail}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {/* Detail Modal */}
      <DetailCatatanGuruModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCatatan(null);
        }}
        catatanId={selectedCatatan?.id}
        onRefresh={handleRefreshAll}
      />

      {/* Tambah/Edit Catatan Modal */}
      <TambahCatatanModal
        isOpen={isTambahModalOpen}
        onClose={() => {
          setIsTambahModalOpen(false);
          setSelectedCatatan(null);
        }}
        onSuccess={handleRefreshAll}
        editData={selectedCatatan}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCatatanToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus Catatan"
        message="Catatan ini akan dihapus permanen dan tidak dapat dikembalikan. Apakah Anda yakin ingin menghapus catatan ini?"
        itemName={catatanToDelete ? `Catatan untuk ${catatanToDelete.siswa_nama}` : ''}
        confirmText="Hapus Catatan"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
