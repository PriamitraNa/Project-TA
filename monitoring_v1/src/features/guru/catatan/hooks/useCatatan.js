import { useState, useEffect, useCallback } from 'react';
import { CatatanService } from '../../../../services/Guru/catatan/CatatanService';
import toast from 'react-hot-toast';

export const useCatatan = () => {
  // State untuk data
  const [catatanData, setCatatanData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // State untuk filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [jenisFilter, setJenisFilter] = useState('');
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load data catatan
  const loadCatatan = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };

      // Add filters if set
      if (searchQuery) params.search = searchQuery;
      if (kategoriFilter) params.kategori = kategoriFilter;
      if (jenisFilter) params.jenis = jenisFilter;

      const response = await CatatanService.getCatatan(params);
      
      setCatatanData(response.data.catatan);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading catatan:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data catatan');
      }
      setCatatanData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, kategoriFilter, jenisFilter]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadCatatan();
  }, [loadCatatan]);

  // Handler untuk search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handler untuk filter kategori
  const handleKategoriFilter = useCallback((kategori) => {
    setKategoriFilter(kategori);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handler untuk filter jenis
  const handleJenisFilter = useCallback((jenis) => {
    setJenisFilter(jenis);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handler untuk items per page
  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handler untuk refresh data
  const handleRefresh = useCallback(() => {
    loadCatatan();
  }, [loadCatatan]);

  return {
    // Data state
    catatanData,
    pagination,
    isLoading,

    // Filter & search state
    searchQuery,
    kategoriFilter,
    jenisFilter,

    // Pagination state
    currentPage,
    setCurrentPage,
    itemsPerPage,

    // Handlers
    handleSearch,
    handleKategoriFilter,
    handleJenisFilter,
    handleItemsPerPageChange,
    handleRefresh,
  };
};

