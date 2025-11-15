import { useState, useEffect, useCallback } from 'react';
import { KelasService } from '../../../../services/Admin/kelas/KelasService';
import toast from 'react-hot-toast';

export function useKelas() {
    // State untuk filter
    const [selectedTahun, setSelectedTahun] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState(null);
    
    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // State untuk modal
    const [isTambahKelasModalOpen, setIsTambahKelasModalOpen] = useState(false);
    const [isEditKelasModalOpen, setIsEditKelasModalOpen] = useState(false);
    const [isDeleteKelasModalOpen, setIsDeleteKelasModalOpen] = useState(false);
    const [selectedKelasData, setSelectedKelasData] = useState(null);
    const [selectedKelasForDelete, setSelectedKelasForDelete] = useState(null);
    
    // State untuk API data
    const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [isLoadingTahunAjaran, setIsLoadingTahunAjaran] = useState(false);
    
    // State untuk data kelas
    const [kelasData, setKelasData] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 0,
        total_data: 0,
        per_page: 10,
        has_next: false,
        has_prev: false
    });
    const [isLoadingKelas, setIsLoadingKelas] = useState(false);

    // Load dropdown tahun ajaran dari API
    const loadTahunAjaranOptions = useCallback(async () => {
        setIsLoadingTahunAjaran(true);
        try {
            const response = await KelasService.getDropdownTahunAjaran();
            
            if (response.status === 'success') {
                setTahunAjaranOptions(response.data.tahunAjaranList);
                
                // Auto-select tahun ajaran aktif jika ada
                if (response.data.tahunAjaranAktif && !selectedTahun) {
                    setSelectedTahun(response.data.tahunAjaranAktif.tahun);
                    setSelectedSemester(response.data.tahunAjaranAktif.semester);
                    
                    // Set available semesters untuk tahun ajaran aktif
                    const semestersForYear = response.data.tahunAjaranList
                        .filter(item => item.tahun === response.data.tahunAjaranAktif.tahun)
                        .map(item => item.semester);
                    setAvailableSemesters(semestersForYear);
                }
            }
        } catch (error) {
            console.error('Error loading tahun ajaran options:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal memuat data tahun ajaran');
            }
            setTahunAjaranOptions([]);
        } finally {
            setIsLoadingTahunAjaran(false);
        }
    }, [selectedTahun]);

    // Load data kelas dari API
    const loadKelasData = useCallback(async () => {
        if (!selectedTahun || !selectedSemester) {
            setKelasData([]);
            setPagination({
                current_page: 1,
                total_pages: 0,
                total_data: 0,
                per_page: 10,
                has_next: false,
                has_prev: false
            });
            return;
        }

        setIsLoadingKelas(true);
        try {
            // Cari tahun_ajaran_id berdasarkan tahun dan semester yang dipilih
            const selectedTahunAjaran = tahunAjaranOptions.find(option => 
                option.tahun === selectedTahun && option.semester === selectedSemester
            );

            if (!selectedTahunAjaran) {
                console.error('Tahun ajaran tidak ditemukan');
                return;
            }

            const response = await KelasService.getDaftarKelas({
                tahun_ajaran_id: selectedTahunAjaran.id,
                page: currentPage,
                limit: itemsPerPage
            });

            if (response.status === 'success') {
                setKelasData(response.data.kelas);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error loading kelas data:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal memuat data kelas');
            }
            setKelasData([]);
            setPagination({
                current_page: 1,
                total_pages: 0,
                total_data: 0,
                per_page: 10,
                has_next: false,
                has_prev: false
            });
        } finally {
            setIsLoadingKelas(false);
        }
    }, [selectedTahun, selectedSemester, currentPage, itemsPerPage, tahunAjaranOptions]);

    // Load data saat component mount
    useEffect(() => {
        loadTahunAjaranOptions();
    }, [loadTahunAjaranOptions]);

    // Load data kelas saat dependencies berubah
    useEffect(() => {
        loadKelasData();
    }, [loadKelasData]);

    // Handler untuk filter tahun ajaran
    const handleTahunChange = (tahun) => {
        setSelectedTahun(tahun);
        setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
        
        // Update available semesters berdasarkan tahun yang dipilih
        if (tahun) {
            const semestersForYear = tahunAjaranOptions
                .filter(item => item.tahun === tahun)
                .map(item => item.semester);
            setAvailableSemesters(semestersForYear);
            
            // Auto-select semester pertama jika ada
            if (semestersForYear.length > 0) {
                setSelectedSemester(semestersForYear[0]);
                
                // Set selectedTahunAjaranId untuk modal
                const selectedTahunAjaran = tahunAjaranOptions.find(option => 
                    option.tahun === tahun && option.semester === semestersForYear[0]
                );
                if (selectedTahunAjaran) {
                    setSelectedTahunAjaranId(selectedTahunAjaran.id);
                }
            }
        } else {
            setAvailableSemesters([]);
            setSelectedSemester('');
            setSelectedTahunAjaranId(null);
        }
    };

    const handleSemesterChange = (semester) => {
        setSelectedSemester(semester);
        setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
        
        // Update selectedTahunAjaranId berdasarkan semester yang dipilih
        if (selectedTahun && semester) {
            const selectedTahunAjaran = tahunAjaranOptions.find(option => 
                option.tahun === selectedTahun && option.semester === semester
            );
            if (selectedTahunAjaran) {
                setSelectedTahunAjaranId(selectedTahunAjaran.id);
            }
        }
    };

    // Handler untuk buka modal tambah kelas
    const handleTambah = () => {
        setIsTambahKelasModalOpen(true);
    };

    // Handler untuk tutup modal tambah kelas
    const handleCloseTambahKelasModal = () => {
        setIsTambahKelasModalOpen(false);
    };

    // Handler untuk simpan data kelas baru
    const handleSaveKelas = (kelasData) => {
        console.log('Data kelas baru:', kelasData);
        
        // Refresh data kelas setelah berhasil menambah
        loadKelasData();
        
        // Tutup modal
        handleCloseTambahKelasModal();
    };

    // Handler untuk buka modal edit
    const handleOpenEditKelasModal = (kelasData) => {
        setSelectedKelasData(kelasData.id);
        setIsEditKelasModalOpen(true);
    };

    // Handler untuk tutup modal edit
    const handleCloseEditKelasModal = () => {
        setIsEditKelasModalOpen(false);
        setSelectedKelasData(null);
    };

    // Handler untuk simpan data kelas yang diedit
    const handleSaveEditKelas = (kelasData) => {
        console.log('Data kelas yang diedit:', kelasData);
        
        // Refresh data kelas setelah berhasil edit
        loadKelasData();
        
        // Tutup modal
        handleCloseEditKelasModal();
    };

    // Handler untuk buka modal delete
    const handleDelete = (kelasData) => {
        setSelectedKelasForDelete(kelasData);
        setIsDeleteKelasModalOpen(true);
    };

    // Handler untuk tutup modal delete
    const handleCloseDeleteKelasModal = () => {
        setIsDeleteKelasModalOpen(false);
        setSelectedKelasForDelete(null);
    };

    // Handler untuk success delete
    const handleDeleteSuccess = () => {
        // Refresh data kelas setelah berhasil delete
        loadKelasData();
        
        // Tutup modal
        handleCloseDeleteKelasModal();
    };

    // Handler untuk mengubah items per page
    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1); // Reset ke halaman 1 saat mengubah items per page
    };

    return {
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
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        
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
        handleItemsPerPageChange,
        loadKelasData
    };
}
