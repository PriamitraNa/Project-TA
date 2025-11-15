import { useState, useEffect, useCallback, useRef } from "react";
import { AkunPenggunaService } from "../../../../services/Admin/akun-pengguna/AkunPenggunaService";
import toast from "react-hot-toast";

const INITIAL_PAGINATION = {
  current_page: 1,
  total_pages: 0,
  total_data: 0,
  per_page: 10,
  has_next: false,
  has_prev: false,
};

const INITIAL_STATISTICS = {
  total_akun: 0,
  akun_aktif: 0,
  akun_tidak_aktif: 0,
  admin: 0,
  guru: 0,
  orangtua: 0,
};

const ERROR_MESSAGES = {
  LOAD_STATISTICS: "Gagal memuat statistik akun pengguna",
  LOAD_DATA: "Gagal mengambil data akun pengguna",
  ADD_AKUN: "Gagal menambahkan akun pengguna",
  DELETE_AKUN: "Gagal menghapus akun pengguna",
  RESET_PASSWORD: "Gagal mereset password",
  SESSION_EXPIRED: "Sesi Anda telah berakhir. Silakan login kembali.",
  ACCESS_DENIED: "Anda tidak memiliki akses untuk melihat data akun pengguna.",
  NOT_FOUND: "Akun tidak ditemukan",
  INVALID_ID: "ID akun tidak valid",
  CANNOT_DELETE_SELF: "Tidak dapat menghapus akun Anda sendiri",
  SERVER_ERROR: "Terjadi kesalahan server",
  HAS_RELATIONS: "Tidak dapat menghapus akun karena masih terhubung dengan data lain",
};

export function useAkunPengguna() {
  const isLoadingRef = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [akunData, setAkunData] = useState([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [statistics, setStatistics] = useState(INITIAL_STATISTICS);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);


  const loadStatistics = useCallback(async () => {
    setIsLoadingStatistics(true);
    try {
      const response = await AkunPenggunaService.getAll({
        page: 1,
        limit: 1,
      });

      if (response.status === "success") {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
      toast.error(ERROR_MESSAGES.LOAD_STATISTICS);
    } finally {
      setIsLoadingStatistics(false);
    }
  }, []);

  const loadAkunData = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      role: roleFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    
    try {
      const response = await AkunPenggunaService.getAll(params);

      if (response.status === "success") {
        setAkunData(response.data.users);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || ERROR_MESSAGES.LOAD_DATA);
        setAkunData([]);
        setPagination(INITIAL_PAGINATION);
        setStatistics(INITIAL_STATISTICS);
      }
    } catch (error) {
      console.error("Error loading akun data:", error);
      
      const errorMessage = error.response?.data?.message;
      if (errorMessage?.includes("Token")) {
        toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
      } else if (errorMessage?.includes("Akses ditolak")) {
        toast.error(ERROR_MESSAGES.ACCESS_DENIED);
      } else {
        toast.error(errorMessage || error.message || ERROR_MESSAGES.LOAD_DATA);
      }
      
      setAkunData([]);
      setPagination(INITIAL_PAGINATION);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, itemsPerPage, searchQuery, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadAkunData();
  }, [loadAkunData]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleRoleFilter = useCallback((role) => {
    if (role === roleFilter) return;
    setRoleFilter(role);
    setCurrentPage(1);
  }, [roleFilter]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    loadAkunData();
    loadStatistics();
  }, [loadAkunData, loadStatistics]);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  }, [sortBy]);

  const handleAddAkun = useCallback(async (akunData) => {
    try {
      const response = await AkunPenggunaService.createSingle(akunData);
      
      if (response.status === "success") {
        toast.success("Akun pengguna berhasil ditambahkan");
        loadAkunData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || ERROR_MESSAGES.ADD_AKUN);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Error adding akun:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage || ERROR_MESSAGES.ADD_AKUN);
      return { success: false, error: error.message };
    }
  }, [loadAkunData, loadStatistics]);


  const getDeleteErrorMessage = (errorMessage) => {
    if (errorMessage.includes("tidak ditemukan")) return ERROR_MESSAGES.NOT_FOUND;
    if (errorMessage.includes("tidak valid")) return ERROR_MESSAGES.INVALID_ID;
    if (errorMessage.includes("akun Anda sendiri")) return ERROR_MESSAGES.CANNOT_DELETE_SELF;
    if (errorMessage.includes("kesalahan server")) return ERROR_MESSAGES.SERVER_ERROR;
    if (errorMessage.includes("terhubung dengan data")) return ERROR_MESSAGES.HAS_RELATIONS;
    return errorMessage;
  };

  const handleDeleteAkun = useCallback(async (id) => {
    try {
      const response = await AkunPenggunaService.delete(id);
      
      if (response.status === "success") {
        const deletedUserName = response.data?.deleted_user?.nama_lengkap || "Akun";
        toast.success(`${deletedUserName} berhasil dihapus`);
        loadAkunData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || ERROR_MESSAGES.DELETE_AKUN);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Error deleting akun:", error);
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage ? getDeleteErrorMessage(errorMessage) : ERROR_MESSAGES.DELETE_AKUN);
      return { success: false, error: error.message };
    }
  }, [loadAkunData, loadStatistics]);

  const handleResetPassword = useCallback(async (id) => {
    try {
      const response = await AkunPenggunaService.resetPassword(id);
      
      if (response.status === "success") {
        toast.success("Password berhasil direset ke default");
        loadAkunData();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || ERROR_MESSAGES.RESET_PASSWORD);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage || ERROR_MESSAGES.RESET_PASSWORD);
      return { success: false, error: error.message };
    }
  }, [loadAkunData]);

  return {
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
    handleRefresh,
    handleSort,
    loadAkunData,
    loadStatistics,
    handleAddAkun,
    handleDeleteAkun,
    handleResetPassword,
  };
}
