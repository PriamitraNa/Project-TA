import { useState, useEffect } from "react";
import { TahunAjaranService } from "../../../../services/Admin/tahunajaran/TahunAjaranService";
import toast from "react-hot-toast";

export function useTahunAjaran() {
    // State untuk data dan pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [tahunAjaranData, setTahunAjaranData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);
    const [sortConfig] = useState({
        sort: 'tahun',
        order: 'DESC'
    });

    // Load data tahun ajaran
    const loadTahunAjaran = async () => {
        setIsLoading(true);
        try {
            const response = await TahunAjaranService.getAll(sortConfig);
            if (response.status === 'success') {
                setTahunAjaranData(response.data);
            }
        } catch (error) {
            console.error('Error loading tahun ajaran:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal memuat data tahun ajaran');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Load data saat hook pertama kali digunakan
    useEffect(() => {
        loadTahunAjaran();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle toggle status (aktif ↔ tidak-aktif)
    const handleToggleStatus = async (id) => {
        try {
            const response = await TahunAjaranService.toggleStatus(id);
            if (response.status === 'success') {
                toast.success(response.message || 'Status tahun ajaran berhasil diubah');
                loadTahunAjaran(); // Reload data
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes('Sudah ada tahun ajaran aktif')) {
                    toast.error(errorMessage);
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Gagal mengubah status tahun ajaran');
            }
        }
    };

    // Handle delete - open confirmation modal
    const handleDelete = (id) => {
        const tahunData = tahunAjaranData.find(item => item.id === id);
        if (tahunData) {
            setSelectedTahunAjaran(tahunData);
            setIsDeleteModalOpen(true);
        }
    };

    // Handle close delete modal
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedTahunAjaran(null);
    };

    // Handle success delete
    const handleDeleteSuccess = () => {
        loadTahunAjaran(); // Reload data
    };

    // Handle tambah tahun ajaran
    const handleTambah = () => {
        setIsModalOpen(true);
    };

    // Handle modal close
    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    // Handle modal success (after create)
    const handleModalSuccess = () => {
        loadTahunAjaran(); // Reload data
    };

    // Pagination logic
    const totalPages = Math.ceil(tahunAjaranData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = tahunAjaranData.slice(startIndex, endIndex);

    return {
        // State
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        tahunAjaranData,
        isLoading,
        isModalOpen,
        isDeleteModalOpen,
        selectedTahunAjaran,
        currentData,
        totalPages,
        startIndex,
        
        // Handlers
        handleToggleStatus,
        handleDelete,
        handleCloseDeleteModal,
        handleDeleteSuccess,
        handleTambah,
        handleModalClose,
        handleModalSuccess,
        loadTahunAjaran
    };
}