import { useParams, useSearchParams } from 'react-router-dom';
import ContentWrapper from '../../components/ui/ContentWrapper';
import { TambahSiswaModal, NaikKelasModal, TambahMapelModal, EditMapelModal, DeleteMapelModal, DeleteSiswaModal } from '../../components/modals';
import { 
    useKelasDetail, 
    TabNavigation, 
    KelasInfoHeader, 
    SiswaSection, 
    MapelSection 
} from '../../features/admin/kelas-detail';

export default function KelolaKelasDetail() {
    const { kelasId } = useParams();
    const [searchParams] = useSearchParams();
    
    // Get tahun_ajaran_id from query parameters
    const tahunAjaranId = searchParams.get('tahun_ajaran_id');
    
    // Menggunakan custom hook untuk semua business logic
    const {
        // Kelas info state
        kelasInfo,
        isLoadingKelasInfo,
        
        // Tab state
        activeTab,
        
        // Pagination state
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        
        // Siswa state
        siswaData,
        siswaPagination,
        isLoadingSiswa,
        
        // Mapel state
        mapelData,
        mapelPagination,
        isLoadingMapel,
        
        // Modal states
        isTambahSiswaModalOpen,
        isNaikKelasModalOpen,
        isTambahMapelModalOpen,
        isEditMapelModalOpen,
        isDeleteMapelModalOpen,
        selectedMapelData,
        isDeleteSiswaModalOpen,
        selectedSiswaData,
        
        // Handlers
        handleBack,
        handleTabChange,
        handleOpenTambahSiswaModal,
        handleCloseTambahSiswaModal,
        handleOpenNaikKelasModal,
        handleCloseNaikKelasModal,
        handleOpenTambahMapelModal,
        handleCloseTambahMapelModal,
        handleOpenEditMapelModal,
        handleCloseEditMapelModal,
        handleOpenDeleteMapelModal,
        handleCloseDeleteMapelModal,
        handleSaveMapel,
        handleDeleteMapel,
        handleOpenDeleteSiswaModal,
        handleCloseDeleteSiswaModal,
        handleSaveSiswa,
        handleSaveNaikKelas,
        handleHapusSiswa,
        loadSiswaData,
        loadMapelData
    } = useKelasDetail(kelasId, tahunAjaranId);

    return (
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            <KelasInfoHeader 
                kelasInfo={kelasInfo}
                isLoadingKelasInfo={isLoadingKelasInfo}
                onBack={handleBack}
            />

            <ContentWrapper>
                <TabNavigation
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
                
                {activeTab === 'siswa' && (
                    <SiswaSection
                        siswaData={siswaData}
                        siswaPagination={siswaPagination}
                        isLoadingSiswa={isLoadingSiswa}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            loadSiswaData(page, itemsPerPage);
                        }}
                        onItemsPerPageChange={(value) => {
                            setItemsPerPage(value);
                            setCurrentPage(1);
                            loadSiswaData(1, value);
                        }}
                        onTambahSiswa={handleOpenTambahSiswaModal}
                        onNaikKelas={handleOpenNaikKelasModal}
                        onDeleteSiswa={handleOpenDeleteSiswaModal}
                    />
                )}
                
                {activeTab === 'mapel' && (
                    <MapelSection
                        mapelData={mapelData}
                        mapelPagination={mapelPagination}
                        isLoadingMapel={isLoadingMapel}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            loadMapelData(page, itemsPerPage);
                        }}
                        onItemsPerPageChange={(value) => {
                            setItemsPerPage(value);
                            setCurrentPage(1);
                            loadMapelData(1, value);
                        }}
                        onTambahMapel={handleOpenTambahMapelModal}
                        onEditMapel={handleOpenEditMapelModal}
                        onDeleteMapel={handleOpenDeleteMapelModal}
                    />
                )}
            </ContentWrapper>

            {/* Modal Tambah Siswa */}
            <TambahSiswaModal
                isOpen={isTambahSiswaModalOpen}
                onClose={handleCloseTambahSiswaModal}
                onSave={handleSaveSiswa}
                kelasInfo={kelasInfo}
                tahunAjaranId={tahunAjaranId}
            />

            {/* Modal Naik Kelas */}
            <NaikKelasModal
                isOpen={isNaikKelasModalOpen}
                onClose={handleCloseNaikKelasModal}
                onSave={handleSaveNaikKelas}
                kelasId={kelasId}
            />

            {/* Modal Tambah Mapel */}
            <TambahMapelModal
                isOpen={isTambahMapelModalOpen}
                onClose={handleCloseTambahMapelModal}
                onSave={handleSaveMapel}
                kelasId={kelasId}
                tahunAjaranId={tahunAjaranId}
            />

            {/* Modal Edit Mapel */}
            <EditMapelModal
                isOpen={isEditMapelModalOpen}
                onClose={handleCloseEditMapelModal}
                onSave={handleSaveMapel}
                mapelData={selectedMapelData}
                kelasId={kelasId}
                tahunAjaranId={tahunAjaranId}
            />

            {/* Modal Delete Mapel */}
            <DeleteMapelModal
                isOpen={isDeleteMapelModalOpen}
                onClose={handleCloseDeleteMapelModal}
                onDelete={handleDeleteMapel}
                mapelData={selectedMapelData}
                kelasId={kelasId}
            />

            {/* Modal Delete Siswa */}
            <DeleteSiswaModal
                isOpen={isDeleteSiswaModalOpen}
                onClose={handleCloseDeleteSiswaModal}
                onDelete={handleHapusSiswa}
                siswaData={selectedSiswaData}
            />
        </div>
    );
}
