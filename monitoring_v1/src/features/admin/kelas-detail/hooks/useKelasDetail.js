import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { KelasService } from '../../../../services/Admin/kelas/KelasService';
import toast from 'react-hot-toast';

export function useKelasDetail(kelasId, tahunAjaranId) {
    const navigate = useNavigate();
    
    // State untuk informasi kelas
    const [kelasInfo, setKelasInfo] = useState(null);
    const [isLoadingKelasInfo, setIsLoadingKelasInfo] = useState(false);
    
    // State untuk tab aktif
    const [activeTab, setActiveTab] = useState('siswa');
    
    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State untuk data siswa
    const [siswaData, setSiswaData] = useState([]);
    const [siswaPagination, setSiswaPagination] = useState(null);
    const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);

    // State untuk data mata pelajaran
    const [mapelData, setMapelData] = useState([]);
    const [mapelPagination, setMapelPagination] = useState(null);
    const [isLoadingMapel, setIsLoadingMapel] = useState(false);

    // State untuk modal tambah siswa
    const [isTambahSiswaModalOpen, setIsTambahSiswaModalOpen] = useState(false);
    const [isNaikKelasModalOpen, setIsNaikKelasModalOpen] = useState(false);
    
    // State untuk modal mapel
    const [isTambahMapelModalOpen, setIsTambahMapelModalOpen] = useState(false);
    const [isEditMapelModalOpen, setIsEditMapelModalOpen] = useState(false);
    const [isDeleteMapelModalOpen, setIsDeleteMapelModalOpen] = useState(false);
    const [selectedMapelData, setSelectedMapelData] = useState(null);

    // State untuk modal delete siswa
    const [isDeleteSiswaModalOpen, setIsDeleteSiswaModalOpen] = useState(false);
    const [selectedSiswaData, setSelectedSiswaData] = useState(null);

    // Function untuk mengambil informasi kelas
    const loadKelasInfo = useCallback(async () => {
        if (!kelasId) return;
        
        setIsLoadingKelasInfo(true);
        try {
            const response = await KelasService.getInfoKelas(kelasId);
            
            if (response.status === 'success') {
                setKelasInfo(response.data);
            } else {
                toast.error(response.message || 'Gagal mengambil informasi kelas');
            }
        } catch (error) {
            console.error('Error loading kelas info:', error);
            
            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                
                if (errorMessage.includes('tidak ditemukan')) {
                    toast.error('Kelas tidak ditemukan');
                } else if (errorMessage.includes('harus berupa angka')) {
                    toast.error('ID kelas tidak valid');
                } else if (errorMessage.includes('Terjadi kesalahan server')) {
                    toast.error('Terjadi kesalahan server');
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Gagal mengambil informasi kelas');
            }
        } finally {
            setIsLoadingKelasInfo(false);
        }
    }, [kelasId]);

    // Function untuk mengambil data siswa
    const loadSiswaData = useCallback(async (page = 1, limit = 10) => {
        if (!kelasId) return;
        
        setIsLoadingSiswa(true);
        try {
            const response = await KelasService.getDaftarSiswaKelas(kelasId, tahunAjaranId, page, limit);
            
            if (response.status === 'success') {
                setSiswaData(response.data.data);
                setSiswaPagination({
                    total: response.data.total,
                    page: response.data.page,
                    limit: response.data.limit,
                    totalPages: response.data.totalPages
                });
            } else {
                toast.error(response.message || 'Gagal mengambil data siswa');
            }
        } catch (error) {
            console.error('Error loading siswa data:', error);
            
            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                
                if (errorMessage.includes('tidak ditemukan')) {
                    toast.error('Kelas tidak ditemukan');
                } else if (errorMessage.includes('harus berupa angka')) {
                    toast.error('ID kelas tidak valid');
                } else if (errorMessage.includes('Halaman harus lebih dari 0')) {
                    toast.error('Nomor halaman tidak valid');
                } else if (errorMessage.includes('Limit harus antara 1-100')) {
                    toast.error('Jumlah data per halaman tidak valid');
                } else if (errorMessage.includes('Terjadi kesalahan server')) {
                    toast.error('Terjadi kesalahan server');
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Gagal mengambil data siswa');
            }
        } finally {
            setIsLoadingSiswa(false);
        }
    }, [kelasId, tahunAjaranId]);

    // Function untuk mengambil data mata pelajaran
    const loadMapelData = useCallback(async (page = 1, limit = 10) => {
        if (!kelasId) return;
        
        setIsLoadingMapel(true);
        try {
            const response = await KelasService.getDaftarMataPelajaran(kelasId, {
                tahun_ajaran_id: tahunAjaranId,
                page,
                limit
            });
            
            if (response.status === 'success') {
                setMapelData(response.data.mata_pelajaran || []);
                setMapelPagination({
                    current_page: response.data.pagination.current_page,
                    per_page: response.data.pagination.per_page,
                    total: response.data.pagination.total,
                    total_pages: response.data.pagination.total_pages
                });
            } else {
                toast.error(response.message || 'Gagal mengambil data mata pelajaran');
            }
        } catch (error) {
            console.error('Error loading mapel data:', error);
            
            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                
                if (errorMessage.includes('tidak ditemukan')) {
                    toast.error('Kelas tidak ditemukan');
                } else if (errorMessage.includes('harus berupa angka')) {
                    toast.error('ID kelas tidak valid');
                } else {
                    toast.error(errorMessage);
                }
            } else if (error.message === 'Network Error') {
                toast.error('Tidak dapat terhubung ke server');
            } else {
                toast.error('Terjadi kesalahan saat mengambil data mata pelajaran');
            }
        } finally {
            setIsLoadingMapel(false);
        }
    }, [kelasId, tahunAjaranId]);

    // Load kelas info saat komponen dimount
    useEffect(() => {
        loadKelasInfo();
    }, [loadKelasInfo]);

    // Load siswa data saat tab siswa aktif
    useEffect(() => {
        if (activeTab === 'siswa') {
            loadSiswaData(currentPage, itemsPerPage);
        }
    }, [activeTab, loadSiswaData, currentPage, itemsPerPage]);

    // Handler untuk kembali
    const handleBack = () => {
        navigate('/admin/kelola-guru-kelas');
    };

    // Handler untuk ganti tab
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset ke halaman 1 saat ganti tab
        
        // Load data saat tab diubah
        if (tab === 'mapel') {
            loadMapelData(1, itemsPerPage);
        }
    };

    // Handler untuk modal tambah siswa
    const handleOpenTambahSiswaModal = () => {
        setIsTambahSiswaModalOpen(true);
    };

    const handleCloseTambahSiswaModal = () => {
        setIsTambahSiswaModalOpen(false);
    };

    // Handler untuk modal naik kelas
    const handleOpenNaikKelasModal = () => {
        setIsNaikKelasModalOpen(true);
    };

    const handleCloseNaikKelasModal = () => {
        setIsNaikKelasModalOpen(false);
    };

    // Handler untuk modal mapel
    const handleOpenTambahMapelModal = () => {
        setIsTambahMapelModalOpen(true);
    };

    const handleCloseTambahMapelModal = () => {
        setIsTambahMapelModalOpen(false);
    };

    const handleOpenEditMapelModal = (mapelData) => {
        setSelectedMapelData(mapelData);
        setIsEditMapelModalOpen(true);
    };

    const handleCloseEditMapelModal = () => {
        setIsEditMapelModalOpen(false);
        setSelectedMapelData(null);
    };

    const handleOpenDeleteMapelModal = (mapelData) => {
        setSelectedMapelData(mapelData);
        setIsDeleteMapelModalOpen(true);
    };

    const handleCloseDeleteMapelModal = () => {
        setIsDeleteMapelModalOpen(false);
        setSelectedMapelData(null);
    };

    // Handler untuk save mapel
    const handleSaveMapel = (mapelData) => {
        console.log('Mapel saved:', mapelData);
        // Reload data mata pelajaran setelah berhasil tambah
        loadMapelData(currentPage, itemsPerPage);
    };

    // Handler untuk delete mapel
    const handleDeleteMapel = (mapelId) => {
        console.log('Mapel deleted:', mapelId);
        // Reload data mata pelajaran setelah berhasil hapus
        loadMapelData(currentPage, itemsPerPage);
    };

    // Handler untuk modal delete siswa
    const handleOpenDeleteSiswaModal = (siswaData) => {
        setSelectedSiswaData(siswaData);
        setIsDeleteSiswaModalOpen(true);
    };

    const handleCloseDeleteSiswaModal = () => {
        setIsDeleteSiswaModalOpen(false);
        setSelectedSiswaData(null);
    };

    const handleSaveSiswa = (responseData) => {
        // Handle response from bulk tambah siswa API
        if (responseData && responseData.summary) {
            // Reload data siswa setelah berhasil ditambahkan
            loadSiswaData(currentPage, itemsPerPage);
            
            // Reload kelas info untuk update jumlah siswa
            loadKelasInfo();
        }
    };

    const handleSaveNaikKelas = (responseData) => {
        // Handle response from naik kelas API
        if (responseData && responseData.summary) {
            // Reload data siswa setelah berhasil naik kelas
            loadSiswaData(currentPage, itemsPerPage);
            
            // Reload kelas info untuk update jumlah siswa
            loadKelasInfo();
        }
    };

    // Handler untuk hapus siswa dari kelas
    const handleHapusSiswa = async (siswaId) => {
        try {
            const response = await KelasService.hapusSiswaDariKelas(
                kelasId, 
                siswaId, 
                tahunAjaranId
            );
            
            if (response.status === 'success') {
                toast.success(response.message || 'Siswa berhasil dihapus dari kelas');
                
                // Reload data siswa setelah berhasil dihapus
                loadSiswaData(currentPage, itemsPerPage);
                
                // Reload kelas info untuk update jumlah siswa
                loadKelasInfo();
            } else {
                toast.error(response.message || 'Gagal menghapus siswa dari kelas');
            }
        } catch (error) {
            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                
                // Handle specific error messages
                if (errorMessage.includes('tidak ditemukan')) {
                    toast.error('Siswa tidak ditemukan di kelas ini');
                } else if (errorMessage.includes('tidak ada di kelas')) {
                    toast.error('Siswa tidak ditemukan di kelas ini');
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Terjadi kesalahan saat menghapus siswa dari kelas');
            }
        }
    };

    return {
        // Kelas info state
        kelasInfo,
        isLoadingKelasInfo,
        
        // Tab state
        activeTab,
        setActiveTab,
        
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
        loadKelasInfo,
        loadSiswaData,
        loadMapelData
    };
}
