import { useState, useEffect, useCallback, useRef } from "react";
import { GuruService } from "../../../../services/Admin/guru/GuruService";
import toast from "react-hot-toast";

export function useGuru() {
  // Ref untuk mencegah multiple calls
  const isLoadingRef = useRef(false);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // State untuk sorting - Default sort by created_at desc
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // State untuk data guru
  const [guruData, setGuruData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_data: 0,
    per_page: 10,
    has_next: false,
    has_prev: false,
  });
  const [statistics, setStatistics] = useState({
    total_guru: 0,
    jumlah_aktif: 0,
    jumlah_tidak_aktif: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);

  // Load statistics (total guru keseluruhan) - tidak terpengaruh search/filter
  const loadStatistics = useCallback(async () => {
    setIsLoadingStatistics(true);
    try {
      const response = await GuruService.getAll({
        page: 1,
        limit: 1, // Hanya butuh statistics, tidak butuh data
      });

      if (response.status === "success") {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setIsLoadingStatistics(false);
    }
  }, []);

  // Load data guru dari API
  const loadGuruData = useCallback(async () => {
    // Prevent multiple calls
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: statusFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    
    try {
      const response = await GuruService.getAll(params);

      if (response.status === "success") {
        setGuruData(response.data.guru);
        setPagination(response.data.pagination);
        // Statistics tidak diupdate di sini, tetap menggunakan data keseluruhan
      } else {
        toast.error(response.message || "Gagal mengambil data guru");
        setGuruData([]);
        setPagination({
          current_page: 1,
          total_pages: 0,
          total_data: 0,
          per_page: 10,
          has_next: false,
          has_prev: false,
        });
        setStatistics({
          total_guru: 0,
          jumlah_laki_laki: 0,
          jumlah_perempuan: 0,
        });
      }
    } catch (error) {
      console.error("Error loading guru data:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Nomor halaman tidak valid")) {
          toast.error("Nomor halaman tidak valid");
        } else if (errorMessage.includes("Batas limit tidak valid")) {
          toast.error("Batas limit tidak valid");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal mengambil data guru");
      }

      setGuruData([]);
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_data: 0,
        per_page: 10,
        has_next: false,
        has_prev: false,
      });
      setStatistics({
        total_guru: 0,
        jumlah_laki_laki: 0,
        jumlah_perempuan: 0,
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, sortBy, sortOrder]);

  // Load statistics saat component mount (hanya sekali)
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Load data saat component mount dan saat dependencies berubah
  useEffect(() => {
    loadGuruData();
  }, [loadGuruData, currentPage, itemsPerPage, searchQuery, statusFilter, sortBy, sortOrder]);

  // Handler untuk search
  const handleSearch = (query) => {
    // Hanya update jika search value benar-benar berubah
    if (query !== searchQuery) {
      setSearchQuery(query);
      setCurrentPage(1); // Reset ke halaman 1 saat search
    }
  };

  // Handler untuk filter status
  const handleStatusFilter = (status) => {
    if (status === statusFilter) return; // Guard clause
    
    setStatusFilter(status);
    setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
  };

  // Handler untuk clear filter
  const handleClearFilter = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // Handler untuk mengubah items per page
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset ke halaman 1 saat mengubah items per page
  };

  // Handler untuk refresh data
  const handleRefresh = () => {
    loadGuruData();
    loadStatistics(); // Refresh statistics juga
  };

  // Handler untuk sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      // Jika field sama, toggle order
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      // Jika field berbeda, set field baru dengan order asc
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset ke halaman 1 saat sorting
  };

  // Function untuk convert date format dari yyyy-mm-dd ke dd/mm/yyyy
  const convertDateFormat = (dateString) => {
    if (!dateString) return '';
    // Convert from yyyy-mm-dd to dd/mm/yyyy
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Function untuk clean dan format data
  const formatGuruData = (guruData) => {
    return guruData.map(guru => ({
      nama_lengkap: guru.namaLengkap?.trim() || '',
      nip: guru.nip?.trim() || '',
      nik: guru.nik?.trim() || '',
      jenis_kelamin: guru.jenisKelamin || '',
      tempat_lahir: guru.tempatLahir?.trim() || '',
      tanggal_lahir: guru.tanggalLahir ? convertDateFormat(guru.tanggalLahir) : '',
    }));
  };

  // Handler untuk bulk create guru
  const handleBulkCreateGuru = async (guruData) => {
    try {
      const formattedData = formatGuruData(guruData);
      const response = await GuruService.bulkCreate(formattedData);
      
      if (response.status === "success") {
        toast.success(`Berhasil menambah ${response.data.inserted_count} guru`);
        loadGuruData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal menambah guru");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Error creating guru:", error);
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data duplikat ditemukan")) {
          toast.error("Data duplikat ditemukan. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data sudah ada")) {
          toast.error("Data sudah ada. Periksa kembali form yang diisi.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menambah guru");
      }
      
      return { success: false, error: error.response?.data?.message || "Gagal menambah guru" };
    }
  };

  // Handler untuk update guru
  const handleUpdateGuru = async (id, guruData) => {
    try {
      const response = await GuruService.update(id, guruData);
      
      if (response.status === "success") {
        toast.success("Data guru berhasil diperbarui");
        loadGuruData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal memperbarui data guru");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Error updating guru:", error);
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes("NIP sudah digunakan")) {
          toast.error("NIP sudah digunakan guru lain");
        } else if (errorMessage.includes("NIK sudah digunakan")) {
          toast.error("NIK sudah digunakan guru lain");
        } else if (errorMessage.includes("Guru tidak ditemukan")) {
          toast.error("Guru tidak ditemukan");
        } else if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal memperbarui data guru");
      }
      
      return { success: false, error: error.response?.data?.message || "Gagal memperbarui data guru" };
    }
  };

  // Handler untuk delete guru
  const handleDeleteGuru = async (id) => {
    try {
      const response = await GuruService.delete(id);
      
      if (response.status === "success") {
        toast.success("Data guru berhasil dihapus");
        loadGuruData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal menghapus data guru");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Error deleting guru:", error);
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes("Guru tidak ditemukan")) {
          toast.error("Guru tidak ditemukan");
        } else if (errorMessage.includes("masih terhubung dengan mata pelajaran kelas")) {
          toast.error("Guru tidak dapat dihapus karena masih terhubung dengan mata pelajaran kelas");
        } else if (errorMessage.includes("ID guru tidak valid")) {
          toast.error("ID guru tidak valid");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menghapus data guru");
      }
      
      return { success: false, error: error.response?.data?.message || "Gagal menghapus data guru" };
    }
  };

  return {
    // Data state
    guruData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,

    // Search dan filter state
    searchQuery,
    statusFilter,

    // Sorting state
    sortBy,
    sortOrder,

    // Pagination state
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,

    // Handlers
    handleSearch,
    handleStatusFilter,
    handleClearFilter,
    handleItemsPerPageChange,
    handleRefresh,
    handleSort,
    handleBulkCreateGuru,
    loadGuruData,
    
    // CRUD handlers
    handleUpdateGuru,
    handleDeleteGuru,
  };
}
