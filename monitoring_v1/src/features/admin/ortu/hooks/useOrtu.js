import { useState, useEffect, useCallback, useRef } from "react";
import { OrtuService } from "../../../../services/Admin/ortu/OrtuService";
import toast from "react-hot-toast";

export function useOrtu() {
  // Ref untuk mencegah multiple calls
  const isLoadingRef = useRef(false);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [relasiFilter, setRelasiFilter] = useState("");

  // State untuk sorting - Default sort by nik asc
  const [sortBy, setSortBy] = useState("nik");
  const [sortOrder, setSortOrder] = useState("asc");

  // State untuk data orangtua
  const [ortuData, setOrtuData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_data: 0,
    per_page: 10,
    has_next: false,
    has_prev: false,
  });
  const [statistics, setStatistics] = useState({
    total_ortu: 0,
    jumlah_ayah: 0,
    jumlah_ibu: 0,
    jumlah_wali: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);

  // Load statistics (total orangtua keseluruhan) - tidak terpengaruh search/filter
  const loadStatistics = useCallback(async () => {
    setIsLoadingStatistics(true);
    try {
      const response = await OrtuService.getAll({
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

  // Load data orangtua dari API
  const loadOrtuData = useCallback(async () => {
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
      relasi: relasiFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    };

    try {
      const response = await OrtuService.getAll(params);

      if (response.status === "success") {
        setOrtuData(response.data.ortu);
        setPagination(response.data.pagination);
        // Statistics tidak diupdate di sini, tetap menggunakan data keseluruhan
      } else {
        toast.error(response.message || "Gagal mengambil data orangtua");
        setOrtuData([]);
        setPagination({
          current_page: 1,
          total_pages: 0,
          total_data: 0,
          per_page: 10,
          has_next: false,
          has_prev: false,
        });
        setStatistics({
          total_ortu: 0,
          jumlah_ayah: 0,
          jumlah_ibu: 0,
          jumlah_wali: 0,
        });
      }
    } catch (error) {
      console.error("Error loading ortu data:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Halaman harus berupa angka positif")) {
          toast.error("Halaman harus berupa angka positif");
        } else if (errorMessage.includes("Limit harus berupa angka positif")) {
          toast.error("Limit harus berupa angka positif");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal mengambil data orangtua");
      }

      setOrtuData([]);
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_data: 0,
        per_page: 10,
        has_next: false,
        has_prev: false,
      });
      setStatistics({
        total_ortu: 0,
        jumlah_ayah: 0,
        jumlah_ibu: 0,
        jumlah_wali: 0,
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, itemsPerPage, searchQuery, relasiFilter, sortBy, sortOrder]);

  // Load statistics saat component mount (hanya sekali)
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Load data saat component mount dan saat dependencies berubah
  useEffect(() => {
    loadOrtuData();
  }, [
    loadOrtuData,
    currentPage,
    itemsPerPage,
    searchQuery,
    relasiFilter,
    sortBy,
    sortOrder,
  ]);

  // Handler untuk search
  const handleSearch = (query) => {
    // Hanya update jika search value benar-benar berubah
    if (query !== searchQuery) {
      setSearchQuery(query);
      setCurrentPage(1); // Reset ke halaman 1 saat search
    }
  };

  // Handler untuk filter relasi
  const handleRelasiFilter = (relasi) => {
    // Hanya update jika filter value benar-benar berubah
    if (relasi !== relasiFilter) {
      setRelasiFilter(relasi);
      setCurrentPage(1); // Reset ke halaman 1 saat filter
    }
  };

  // Handler untuk clear filter
  const handleClearFilter = () => {
    setSearchQuery("");
    setRelasiFilter("");
    setCurrentPage(1);
  };

  // Handler untuk mengubah items per page
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset ke halaman 1 saat mengubah items per page
  };

  // Handler untuk refresh data
  const handleRefresh = () => {
    loadOrtuData();
    loadStatistics(); // Refresh statistics juga
  };

  // Handler untuk sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      // Jika field sama, toggle order
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Jika field berbeda, set field baru dengan order asc
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset ke halaman 1 saat sorting
  };

  // Function untuk convert date format dari yyyy-mm-dd ke dd/mm/yyyy
  const CONVERT_DATE_FORMAT = (dateString) => {
    if (!dateString) return "";
    // Convert from yyyy-mm-dd to dd/mm/yyyy
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Function untuk clean dan format data
  const formatOrtuData = (ortuData) => {
    return ortuData.map((ortu) => ({
      nama_lengkap: ortu.namaLengkap?.trim() || "",
      nik: ortu.nik?.trim() || "",
      kontak: ortu.kontak?.trim() || "",
      relasi: ortu.relasi || "",
      anak: ortu.anak || [],
    }));
  };

  // Function untuk check NIK unik di database (menggunakan API check-multiple)
  const checkNikUniqueness = async (nikList) => {
    try {
      // Gunakan API check-multiple untuk efisiensi
      const response = await OrtuService.checkMultiple(nikList);

      if (response.status === "success") {
        const existingNik = response.data.existing_nik || [];

        // Map hasil ke format yang diharapkan
        return nikList.map((nik) => ({
          nik,
          exists: existingNik.includes(nik),
          existingData: existingNik.includes(nik) ? { nik } : null,
        }));
      }

      // Fallback jika API gagal
      return nikList.map((nik) => ({
        nik,
        exists: false,
        existingData: null,
      }));
    } catch (error) {
      console.error("Error checking NIK uniqueness:", error);
      return nikList.map((nik) => ({
        nik,
        exists: false,
        existingData: null,
      }));
    }
  };

  // Function untuk validasi data
  const validateOrtuData = (ortuData) => {
    const errors = [];

    ortuData.forEach((ortu, index) => {
      const ortuErrors = [];

      // Validasi nama lengkap
      if (!ortu.nama_lengkap || ortu.nama_lengkap.trim() === "") {
        ortuErrors.push("Nama lengkap harus diisi");
      }

      // Validasi NIK
      if (!ortu.nik || ortu.nik.trim() === "") {
        ortuErrors.push("NIK harus diisi");
      } else if (!/^\d{16}$/.test(ortu.nik.trim())) {
        ortuErrors.push("NIK harus 16 digit angka");
      }

      // Validasi kontak
      if (!ortu.kontak || ortu.kontak.trim() === "") {
        ortuErrors.push("Kontak harus diisi");
      }

      // Validasi relasi
      if (!ortu.relasi || !["Ayah", "Ibu", "Wali"].includes(ortu.relasi)) {
        ortuErrors.push("Relasi harus Ayah, Ibu, atau Wali");
      }

      if (ortuErrors.length > 0) {
        errors.push({
          index: index + 1,
          nama_lengkap: ortu.nama_lengkap || "Tidak ada nama",
          errors: ortuErrors,
        });
      }
    });

    return errors;
  };

  // Function untuk validasi data dengan check NIK unik
  const validateOrtuDataWithUniqueness = async (ortuData) => {
    console.log("🔍 Starting validation with uniqueness check...");

    // 1. Validasi format data dulu
    const formatErrors = validateOrtuData(ortuData);
    if (formatErrors.length > 0) {
      console.log("❌ Format validation failed:", formatErrors);
      return { isValid: false, errors: formatErrors, uniquenessErrors: [] };
    }

    // 2. Check NIK uniqueness
    const nikList = ortuData
      .map((ortu) => ortu.nik.trim())
      .filter((nik) => nik);
    console.log("🔍 Checking NIK uniqueness for:", nikList);

    const uniquenessResults = await checkNikUniqueness(nikList);
    console.log("🔍 Uniqueness check results:", uniquenessResults);

    const uniquenessErrors = [];
    const duplicateNiks = [];

    // Check hasil uniqueness check
    uniquenessResults.forEach((result) => {
      if (result.exists) {
        const ortuIndex = ortuData.findIndex(
          (o) => o.nik.trim() === result.nik
        );
        if (ortuIndex !== -1) {
          uniquenessErrors.push({
            index: ortuIndex + 1,
            nama_lengkap: ortuData[ortuIndex].nama_lengkap || "Tidak ada nama",
            nik: result.nik,
            error: "NIK sudah ada di database",
          });
          duplicateNiks.push(result.nik);
        }
      }
    });

    // Check duplikasi dalam batch
    const nikCounts = {};
    ortuData.forEach((ortu, index) => {
      const nik = ortu.nik.trim();
      if (nik) {
        if (nikCounts[nik]) {
          nikCounts[nik].push(index + 1);
        } else {
          nikCounts[nik] = [index + 1];
        }
      }
    });

    // Add batch duplicate errors
    Object.entries(nikCounts).forEach(([nik, indices]) => {
      if (indices.length > 1) {
        indices.forEach((index) => {
          const ortuIndex = index - 1;
          uniquenessErrors.push({
            index,
            nama_lengkap: ortuData[ortuIndex].nama_lengkap || "Tidak ada nama",
            nik,
            error: "NIK duplikat dalam form",
          });
        });
      }
    });

    console.log("🔍 Final validation results:", {
      formatErrors: formatErrors.length,
      uniquenessErrors: uniquenessErrors.length,
      duplicateNiks,
    });

    return {
      isValid: formatErrors.length === 0 && uniquenessErrors.length === 0,
      errors: formatErrors,
      uniquenessErrors,
      duplicateNiks,
    };
  };

  // Handler untuk bulk create orangtua
  const handleBulkCreateOrtu = async (ortuData) => {
    console.log("🔍 Original data:", ortuData);

    // Format data
    const formattedData = formatOrtuData(ortuData);
    console.log("📤 Formatted data to send:", formattedData);

    // Validasi data dengan check NIK unik
    const validationResult = await validateOrtuDataWithUniqueness(
      formattedData
    );

    if (!validationResult.isValid) {
      console.error("❌ Validation failed:", validationResult);

      // Show format errors
      if (validationResult.errors.length > 0) {
        validationResult.errors.forEach((error) => {
          toast.error(`Form ${error.index}: ${error.errors.join(", ")}`);
        });
      }

      // Show uniqueness errors
      if (validationResult.uniquenessErrors.length > 0) {
        validationResult.uniquenessErrors.forEach((error) => {
          toast.error(
            `Form ${error.index} (${error.nama_lengkap}): ${error.error}`
          );
        });
      }

      return { success: false, error: "Validasi data gagal" };
    }

    console.log("✅ All validations passed!");
    console.log("📊 Data count:", formattedData.length);
    console.log(
      "📋 Data details:",
      formattedData.map((ortu, index) => ({
        index: index + 1,
        nama_lengkap: ortu.nama_lengkap,
        nik: ortu.nik,
        kontak: ortu.kontak,
        relasi: ortu.relasi,
      }))
    );

    try {
      const response = await OrtuService.bulkCreate(formattedData);
      console.log("📥 API Response received:", response);

      if (response.status === "success") {
        console.log("✅ Success response:", {
          inserted_count: response.data.inserted_count,
          inserted_data: response.data.inserted_data,
        });
        toast.success(
          `Berhasil menambah ${response.data.inserted_count} orangtua`
        );
        // Refresh data dan statistics
        loadOrtuData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        console.log("❌ Error response:", response.message);
        toast.error(response.message || "Gagal menambah orangtua");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error bulk creating ortu:", error);
      console.log("🔍 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        console.log("🚨 API Error message:", errorMessage);

        // Show specific error message based on API response
        if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data duplikat ditemukan")) {
          toast.error(
            "Data duplikat ditemukan. Periksa kembali form yang diisi."
          );
        } else if (errorMessage.includes("Data sudah ada di database")) {
          toast.error(
            "Data sudah ada di database. Periksa kembali form yang diisi."
          );
        } else if (errorMessage.includes("Data orangtua harus berupa array")) {
          toast.error("Format data tidak valid.");
        } else if (errorMessage.includes("Maksimal 50 orangtua per request")) {
          toast.error("Maksimal 50 orangtua per request.");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menambah orangtua");
      }

      return {
        success: false,
        error: error.response?.data?.message || "Gagal menambah orangtua",
      };
    }
  };

  // Handler untuk update orangtua
  const handleUpdateOrtu = async (id, ortuData) => {
    console.log("🔍 Updating ortu:", { id, ortuData });

    // Format data
    const formattedData = {
      nama_lengkap: ortuData.nama_lengkap?.trim() || "",
      nik: ortuData.nik?.trim() || "",
      kontak: ortuData.kontak?.trim() || "",
      relasi: ortuData.relasi || "",
      anak: ortuData.anak || [],
    };

    console.log("📤 Formatted data to send:", formattedData);

    try {
      const response = await OrtuService.update(id, formattedData);
      console.log("📥 API Response received:", response);

      if (response.status === "success") {
        console.log("✅ Success response:", response.data);
        toast.success("Data orangtua berhasil diperbarui");
        // Refresh data dan statistics
        loadOrtuData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        console.log("❌ Error response:", response.message);
        toast.error(response.message || "Gagal memperbarui data orangtua");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error updating ortu:", error);
      console.log("🔍 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        console.log("🚨 API Error message:", errorMessage);

        if (errorMessage.includes("NIK sudah digunakan")) {
          toast.error("NIK sudah digunakan oleh orangtua lain");
        } else if (errorMessage.includes("Orangtua tidak ditemukan")) {
          toast.error("Orangtua tidak ditemukan");
        } else if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal memperbarui data orangtua");
      }

      return {
        success: false,
        error:
          error.response?.data?.message || "Gagal memperbarui data orangtua",
      };
    }
  };

  // Handler untuk delete orangtua
  const handleDeleteOrtu = async (id) => {
    console.log("🔍 Deleting ortu:", id);

    try {
      const response = await OrtuService.delete(id);
      console.log("📥 API Response received:", response);

      if (response.status === "success") {
        console.log("✅ Success response:", response.data);
        toast.success("Data orangtua berhasil dihapus");
        // Refresh data dan statistics
        loadOrtuData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        console.log("❌ Error response:", response.message);
        toast.error(response.message || "Gagal menghapus data orangtua");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error deleting ortu:", error);
      console.log("🔍 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        console.log("🚨 API Error message:", errorMessage);

        if (errorMessage.includes("Orangtua tidak ditemukan")) {
          toast.error("Orangtua tidak ditemukan");
        } else if (errorMessage.includes("ID orangtua tidak valid")) {
          toast.error("ID orangtua tidak valid");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else if (errorMessage.includes("masih terhubung dengan data lain")) {
          toast.error(
            "Tidak dapat menghapus orangtua karena masih terhubung dengan data lain (siswa)"
          );
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menghapus data orangtua");
      }

      return {
        success: false,
        error: error.response?.data?.message || "Gagal menghapus data orangtua",
      };
    }
  };

  return {
    // Data state
    ortuData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,

    // Search dan filter state
    searchQuery,
    relasiFilter,

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
    handleRelasiFilter,
    handleClearFilter,
    handleItemsPerPageChange,
    handleRefresh,
    handleSort,
    handleBulkCreateOrtu,
    loadOrtuData,

    // CRUD handlers
    handleUpdateOrtu,
    handleDeleteOrtu,
  };
}
