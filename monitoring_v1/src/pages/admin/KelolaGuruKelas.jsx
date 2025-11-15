import { useNavigate } from 'react-router-dom';
import ContentWrapper from '../../components/ui/ContentWrapper';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import { TambahKelasModal, EditKelasModal, DeleteKelasModal } from '../../components/modals';
import { useKelas, FilterSection, ItemsPerPageSelector, kelasColumns, createTableData } from '../../features/admin/kelas';
import { FaBook } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function KelolaGuruKelas() {
    const navigate = useNavigate();
    
    // Menggunakan custom hook untuk semua business logic
    const {
        // Filter state
        selectedTahun,
        selectedSemester,
        selectedTahunAjaranId,
        tahunAjaranOptions,
        availableSemesters,
        isLoadingTahunAjaran,
        
        // Data state
        kelasData,
        pagination,
        isLoadingKelas,
        
        // Modal state
        isTambahKelasModalOpen,
        isEditKelasModalOpen,
        isDeleteKelasModalOpen,
        selectedKelasData,
        selectedKelasForDelete,
        
        // Pagination state
        setCurrentPage,
        itemsPerPage,
        
        // Handlers
        handleTahunChange,
        handleSemesterChange,
        handleTambah,
        handleCloseTambahKelasModal,
        handleSaveKelas,
        handleOpenEditKelasModal,
        handleCloseEditKelasModal,
        handleSaveEditKelas,
        handleDelete,
        handleCloseDeleteKelasModal,
        handleDeleteSuccess,
        handleItemsPerPageChange
    } = useKelas();

    // Handler untuk navigasi ke detail kelas
    const handleKelolaKelas = (kelasData) => {
        // Cari tahun ajaran ID dari data kelas atau dari selectedTahunAjaranId
        const tahunAjaranId = kelasData.tahun_ajaran_id || selectedTahunAjaranId;
        
        if (!tahunAjaranId) {
            toast.error('Tahun ajaran tidak ditemukan');
            return;
        }
        
        // Navigate dengan query parameters
        navigate(`/admin/kelola-guru-kelas/${kelasData.id}?tahun_ajaran_id=${tahunAjaranId}`);
    };

    // Create table data using configuration
    const tableData = createTableData(kelasData, pagination, {
        handleKelolaKelas,
        handleOpenEditKelasModal,
        handleDelete
    });

    return (
        <>
            <ContentWrapper>
                <div className="space-y-6">
                    {/* Judul Halaman */}
                    <PageHeader
                        icon={<FaBook />}
                        title="Kelola Guru & Kelas"
                        description="Manajemen data kelas dalam tahun ajaran & semester"
                    />
                </div>
            </ContentWrapper>

            {/* Data Table Section */}
            <div className="mt-6 sm:mt-8">
                <ContentWrapper>
                <div className="space-y-6">
                    {/* Filter Section */}
                    <FilterSection
                        selectedTahun={selectedTahun}
                        selectedSemester={selectedSemester}
                        tahunAjaranOptions={tahunAjaranOptions}
                        availableSemesters={availableSemesters}
                        isLoadingTahunAjaran={isLoadingTahunAjaran}
                        onTahunChange={handleTahunChange}
                        onSemesterChange={handleSemesterChange}
                        onTambahKelas={handleTambah}
                    />

                {/* Tabel Kelas */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Daftar Kelas
                            </h3>
                        </div>
                        
                        <DataTable
                            columns={kelasColumns}
                            data={tableData}
                            isLoading={isLoadingKelas}
                            emptyMessage="Belum ada data kelas untuk tahun ajaran dan semester yang dipilih"
                        />
                        
                        {/* Pagination Controls */}
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
                            <ItemsPerPageSelector 
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                isLoading={isLoadingKelas}
                            />
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
                </div>
                </div>
                </ContentWrapper>
            </div>

            {/* Modal Tambah Kelas */}
            <TambahKelasModal
                isOpen={isTambahKelasModalOpen}
                onClose={handleCloseTambahKelasModal}
                onSave={handleSaveKelas}
                selectedTahunAjaranId={selectedTahunAjaranId}
            />

            {/* Modal Edit Kelas */}
            <EditKelasModal
                isOpen={isEditKelasModalOpen}
                onClose={handleCloseEditKelasModal}
                onSave={handleSaveEditKelas}
                kelasId={selectedKelasData}
            />

            {/* Modal Delete Kelas */}
            <DeleteKelasModal
                isOpen={isDeleteKelasModalOpen}
                onClose={handleCloseDeleteKelasModal}
                onSuccess={handleDeleteSuccess}
                kelasData={selectedKelasForDelete}
            />
        </>
    );
}
