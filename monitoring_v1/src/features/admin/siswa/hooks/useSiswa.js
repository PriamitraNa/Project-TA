import { useState, useEffect, useCallback, useRef } from "react";
import { SiswaService } from "../../../../services/Admin/siswa/SiswaService";
import toast from "react-hot-toast";

export function useSiswa() {
  // Ref untuk mencegah multiple calls
  const isLoadingRef = useRef(false);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk search dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [jenisKelaminFilter, setJenisKelaminFilter] = useState("");
  
  // State untuk sorting - Default sort by NISN
  const [sortBy, setSortBy] = useState("nisn");
  const [sortOrder, setSortOrder] = useState("asc");

  // State untuk data siswa
  const [siswaData, setSiswaData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_data: 0,
    per_page: 10,
    has_next: false,
    has_prev: false,
  });
  const [statistics, setStatistics] = useState({
    total_siswa: 0,
    jumlah_laki_laki: 0,
    jumlah_perempuan: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);

  // Load statistics (total siswa keseluruhan) - tidak terpengaruh search/filter
  const loadStatistics = useCallback(async () => {
    setIsLoadingStatistics(true);
    try {
      const response = await SiswaService.getAll({
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

  // Load data siswa dari API
  const loadSiswaData = useCallback(async () => {
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
      jenis_kelamin: jenisKelaminFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    try {
      const response = await SiswaService.getAll(params);

      if (response.status === "success") {
        setSiswaData(response.data.siswa);
        setPagination(response.data.pagination);
        // Statistics tidak diupdate di sini, tetap menggunakan data keseluruhan
      } else {
        toast.error(response.message || "Gagal mengambil data siswa");
        setSiswaData([]);
        setPagination({
          current_page: 1,
          total_pages: 0,
          total_data: 0,
          per_page: 10,
          has_next: false,
          has_prev: false,
        });
        setStatistics({
          total_siswa: 0,
          jumlah_laki_laki: 0,
          jumlah_perempuan: 0,
        });
      }
    } catch (error) {
      console.error("Error loading siswa data:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Nomor halaman tidak valid")) {
          toast.error("Nomor halaman tidak valid");
        } else if (errorMessage.includes("Batas limit tidak valid")) {
          toast.error("Batas limit tidak valid");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal mengambil data siswa");
      }

      setSiswaData([]);
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_data: 0,
        per_page: 10,
        has_next: false,
        has_prev: false,
      });
      setStatistics({
        total_siswa: 0,
        jumlah_laki_laki: 0,
        jumlah_perempuan: 0,
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, itemsPerPage, searchQuery, jenisKelaminFilter, sortBy, sortOrder]);

  // Load statistics saat component mount (hanya sekali)
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Load data saat component mount dan saat dependencies berubah
  useEffect(() => {
    loadSiswaData();
  }, [loadSiswaData, currentPage, itemsPerPage, searchQuery, jenisKelaminFilter, sortBy, sortOrder]);

  // Handler untuk search
  const handleSearch = (query) => {
    // Hanya update jika search value benar-benar berubah
    if (query !== searchQuery) {
      setSearchQuery(query);
      setCurrentPage(1); // Reset ke halaman 1 saat search
    }
  };

  // Handler untuk filter jenis kelamin
  const handleJenisKelaminFilter = (jenisKelamin) => {
    // Convert to API format: "Laki-laki" -> "L", "Perempuan" -> "P"
    let apiFilter = jenisKelamin;
    if (jenisKelamin === "Laki-laki") {
      apiFilter = "L";
    } else if (jenisKelamin === "Perempuan") {
      apiFilter = "P";
    }
    
    // Hanya update jika filter value benar-benar berubah
    if (apiFilter !== jenisKelaminFilter) {
      setJenisKelaminFilter(apiFilter);
      setCurrentPage(1); // Reset ke halaman 1 saat filter
    }
  };

  // Handler untuk clear filter
  const handleClearFilter = () => {
    setSearchQuery("");
    setJenisKelaminFilter("");
    setCurrentPage(1);
  };

  // Handler untuk mengubah items per page
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset ke halaman 1 saat mengubah items per page
  };

  // Handler untuk refresh data
  const handleRefresh = () => {
    loadSiswaData();
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
  const formatSiswaData = (siswaData) => {
    return siswaData.map(siswa => ({
      nama_lengkap: siswa.namaLengkap?.trim() || '',
      nisn: siswa.nisn?.trim() || '',
      nik: siswa.nik?.trim() || '',
      jenis_kelamin: siswa.jenisKelamin || '',
      tempat_lahir: siswa.tempatLahir?.trim() || '',
      tanggal_lahir: convertDateFormat(siswa.tanggalLahir)
    }));
  };

  // Function untuk check NIK unik di database (menggunakan API check-multiple)
  const checkNikUniqueness = async (nikList) => {
    try {
      // Gunakan API check-multiple untuk efisiensi
      const response = await SiswaService.checkMultiple([], nikList);
      
      if (response.status === "success") {
        const existingNik = response.data.existing_nik || [];
        
        // Map hasil ke format yang diharapkan
        return nikList.map(nik => ({
          nik,
          exists: existingNik.includes(nik),
          existingData: existingNik.includes(nik) ? { nik } : null
        }));
      }
      
      // Fallback jika API gagal
      return nikList.map(nik => ({
        nik,
        exists: false,
        existingData: null
      }));
    } catch (error) {
      console.error("Error checking NIK uniqueness:", error);
      return nikList.map(nik => ({
        nik,
        exists: false,
        existingData: null
      }));
    }
  };

  // Function untuk validasi data
  const validateSiswaData = (siswaData) => {
    const errors = [];
    
    siswaData.forEach((siswa, index) => {
      const studentErrors = [];
      
      // Validasi nama lengkap
      if (!siswa.nama_lengkap || siswa.nama_lengkap.trim() === '') {
        studentErrors.push('Nama lengkap harus diisi');
      }
      
      // Validasi NISN
      if (!siswa.nisn || siswa.nisn.trim() === '') {
        studentErrors.push('NISN harus diisi');
      } else if (!/^\d{10}$/.test(siswa.nisn.trim())) {
        studentErrors.push('NISN harus 10 digit angka');
      }
      
      // Validasi NIK
      if (!siswa.nik || siswa.nik.trim() === '') {
        studentErrors.push('NIK harus diisi');
      } else if (!/^\d{16}$/.test(siswa.nik.trim())) {
        studentErrors.push('NIK harus 16 digit angka');
      }
      
      // Validasi jenis kelamin
      if (!siswa.jenis_kelamin || !['Laki-laki', 'Perempuan'].includes(siswa.jenis_kelamin)) {
        studentErrors.push('Jenis kelamin harus Laki-laki atau Perempuan');
      }
      
      // Validasi tempat lahir
      if (!siswa.tempat_lahir || siswa.tempat_lahir.trim() === '') {
        studentErrors.push('Tempat lahir harus diisi');
      }
      
      // Validasi tanggal lahir
      if (!siswa.tanggal_lahir || siswa.tanggal_lahir.trim() === '') {
        studentErrors.push('Tanggal lahir harus diisi');
      } else {
        // Validasi format tanggal dd/mm/yyyy
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = siswa.tanggal_lahir.match(dateRegex);
        if (!match) {
          studentErrors.push('Format tanggal lahir harus dd/mm/yyyy');
        } else {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]);
          const year = parseInt(match[3]);
          
          const date = new Date(year, month - 1, day);
          if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
            studentErrors.push('Tanggal lahir tidak valid');
          } else if (date > new Date()) {
            studentErrors.push('Tanggal lahir tidak boleh di masa depan');
          }
        }
      }
      
      if (studentErrors.length > 0) {
        errors.push({
          index: index + 1,
          nama_lengkap: siswa.nama_lengkap || 'Tidak ada nama',
          errors: studentErrors
        });
      }
    });
    
    return errors;
  };

  // Function untuk validasi data dengan check NIK unik
  const validateSiswaDataWithUniqueness = async (siswaData) => {
    console.log("🔍 Starting validation with uniqueness check...");
    
    // 1. Validasi format data dulu
    const formatErrors = validateSiswaData(siswaData);
    if (formatErrors.length > 0) {
      console.log("❌ Format validation failed:", formatErrors);
      return { isValid: false, errors: formatErrors, uniquenessErrors: [] };
    }
    
    // 2. Check NIK uniqueness
    const nikList = siswaData.map(siswa => siswa.nik.trim()).filter(nik => nik);
    console.log("🔍 Checking NIK uniqueness for:", nikList);
    
    const uniquenessResults = await checkNikUniqueness(nikList);
    console.log("🔍 Uniqueness check results:", uniquenessResults);
    
    const uniquenessErrors = [];
    const duplicateNiks = [];
    
    // Check hasil uniqueness check
    uniquenessResults.forEach((result) => {
      if (result.exists) {
        const studentIndex = siswaData.findIndex(s => s.nik.trim() === result.nik);
        if (studentIndex !== -1) {
          uniquenessErrors.push({
            index: studentIndex + 1,
            nama_lengkap: siswaData[studentIndex].nama_lengkap || 'Tidak ada nama',
            nik: result.nik,
            error: 'NIK sudah ada di database'
          });
          duplicateNiks.push(result.nik);
        }
      }
    });
    
    // Check duplikasi dalam batch
    const nikCounts = {};
    siswaData.forEach((siswa, index) => {
      const nik = siswa.nik.trim();
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
        indices.forEach(index => {
          const studentIndex = index - 1;
          uniquenessErrors.push({
            index,
            nama_lengkap: siswaData[studentIndex].nama_lengkap || 'Tidak ada nama',
            nik,
            error: 'NIK duplikat dalam form'
          });
        });
      }
    });
    
    console.log("🔍 Final validation results:", {
      formatErrors: formatErrors.length,
      uniquenessErrors: uniquenessErrors.length,
      duplicateNiks
    });
    
    return {
      isValid: formatErrors.length === 0 && uniquenessErrors.length === 0,
      errors: formatErrors,
      uniquenessErrors,
      duplicateNiks
    };
  };

  // Handler untuk bulk create siswa
  const handleBulkCreateSiswa = async (siswaData) => {
    console.log("🔍 Original data:", siswaData);
    
    // Format data
    const formattedData = formatSiswaData(siswaData);
    console.log("📤 Formatted data to send:", formattedData);
    
    // Validasi data dengan check NIK unik
    const validationResult = await validateSiswaDataWithUniqueness(formattedData);
    
    if (!validationResult.isValid) {
      console.error("❌ Validation failed:", validationResult);
      
      // Show format errors
      if (validationResult.errors.length > 0) {
        validationResult.errors.forEach(error => {
          toast.error(`Form ${error.index}: ${error.errors.join(', ')}`);
        });
      }
      
      // Show uniqueness errors
      if (validationResult.uniquenessErrors.length > 0) {
        validationResult.uniquenessErrors.forEach(error => {
          toast.error(`Form ${error.index} (${error.nama_lengkap}): ${error.error}`);
        });
      }
      
      return { success: false, error: "Validasi data gagal" };
    }
    
    console.log("✅ All validations passed!");
    console.log("📊 Data count:", formattedData.length);
    console.log("📋 Data details:", formattedData.map((siswa, index) => ({
      index: index + 1,
      nama_lengkap: siswa.nama_lengkap,
      nisn: siswa.nisn,
      nik: siswa.nik,
      jenis_kelamin: siswa.jenis_kelamin,
      tempat_lahir: siswa.tempat_lahir,
      tanggal_lahir: siswa.tanggal_lahir
    })));
    
    try {
      const response = await SiswaService.bulkCreate(formattedData);
      console.log("📥 API Response received:", response);
      
      if (response.status === "success") {
        console.log("✅ Success response:", {
          inserted_count: response.data.inserted_count,
          inserted_data: response.data.inserted_data
        });
        toast.success(`Berhasil menambah ${response.data.inserted_count} siswa`);
        // Refresh data dan statistics
        loadSiswaData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        console.log("❌ Error response:", response.message);
        // Don't show toast here, let catch block handle it
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error bulk creating siswa:", error);
      console.log("🔍 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        console.log("🚨 API Error message:", errorMessage);
        
        // Show specific error message based on API response
        if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data duplikat ditemukan")) {
          toast.error("Data duplikat ditemukan. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data sudah ada di database")) {
          toast.error("Data sudah ada di database. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data siswa harus berupa array")) {
          toast.error("Format data tidak valid.");
        } else if (errorMessage.includes("Maksimal 50 siswa per request")) {
          toast.error("Maksimal 50 siswa per request.");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menambah siswa");
      }
      
      return { success: false, error: error.response?.data?.message || "Gagal menambah siswa" };
    }
  };

  // State untuk validation loading
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Debounced validation functions
  const debouncedNikValidation = useRef(null);
  const debouncedNisnValidation = useRef(null);

  // Function untuk check NIK unik (untuk real-time validation di form)
  const checkNikUnique = async (nik, showLoading = true) => {
    if (!nik || nik.trim() === '') {
      return { isUnique: true, message: '', isLoading: false };
    }
    
    if (!/^\d{16}$/.test(nik.trim())) {
      return { isUnique: false, message: 'NIK harus 16 digit angka', isLoading: false };
    }
    
    if (showLoading) {
      setIsValidating(true);
    }
    
    try {
      const response = await SiswaService.checkSingle(null, nik.trim());
      
      if (response.status === "success") {
        if (response.data.nik_exists) {
          return { 
            isUnique: false, 
            message: 'NIK sudah digunakan',
            isLoading: false
          };
        }
        
        return { isUnique: true, message: 'NIK tersedia', isLoading: false };
      }
      
      return { isUnique: true, message: 'NIK tersedia', isLoading: false };
    } catch (error) {
      console.error("Error checking NIK uniqueness:", error);
      return { isUnique: true, message: 'NIK tersedia', isLoading: false }; // Default to available if error
    } finally {
      if (showLoading) {
        setIsValidating(false);
      }
    }
  };

  // Function untuk check NISN unik (untuk real-time validation di form)
  const checkNisnUnique = async (nisn, showLoading = true) => {
    if (!nisn || nisn.trim() === '') {
      return { isUnique: true, message: '', isLoading: false };
    }
    
    if (!/^\d{10}$/.test(nisn.trim())) {
      return { isUnique: false, message: 'NISN harus 10 digit angka', isLoading: false };
    }
    
    if (showLoading) {
      setIsValidating(true);
    }
    
    try {
      const response = await SiswaService.checkSingle(nisn.trim(), null);
      
      if (response.status === "success") {
        if (response.data.nisn_exists) {
          return { 
            isUnique: false, 
            message: 'NISN sudah digunakan',
            isLoading: false
          };
        }
        
        return { isUnique: true, message: 'NISN tersedia', isLoading: false };
      }
      
      return { isUnique: true, message: 'NISN tersedia', isLoading: false };
    } catch (error) {
      console.error("Error checking NISN uniqueness:", error);
      return { isUnique: true, message: 'NISN tersedia', isLoading: false }; // Default to available if error
    } finally {
      if (showLoading) {
        setIsValidating(false);
      }
    }
  };

  // Debounced NIK validation (500ms delay)
  const debouncedCheckNik = useCallback((nik, formId) => {
    if (debouncedNikValidation.current) {
      clearTimeout(debouncedNikValidation.current);
    }
    
    debouncedNikValidation.current = setTimeout(async () => {
      if (nik && nik.trim().length === 16) {
        const result = await checkNikUnique(nik, false);
        setValidationErrors(prev => ({
          ...prev,
          [`${formId}_nik`]: result
        }));
      }
    }, 500);
  }, []);

  // Debounced NISN validation (500ms delay)
  const debouncedCheckNisn = useCallback((nisn, formId) => {
    if (debouncedNisnValidation.current) {
      clearTimeout(debouncedNisnValidation.current);
    }
    
    debouncedNisnValidation.current = setTimeout(async () => {
      if (nisn && nisn.trim().length === 10) {
        const result = await checkNisnUnique(nisn, false);
        setValidationErrors(prev => ({
          ...prev,
          [`${formId}_nisn`]: result
        }));
      }
    }, 500);
  }, []);

  // Function untuk real-time validation
  const validateField = async (field, value, formId) => {
    if (field === 'nik' && value && value.trim().length === 16) {
      debouncedCheckNik(value, formId);
    } else if (field === 'nisn' && value && value.trim().length === 10) {
      debouncedCheckNisn(value, formId);
    }
  };

  // Function untuk clear validation errors
  const clearValidationError = (formId, field) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${formId}_${field}`];
      return newErrors;
    });
  };

  // Function untuk get validation error
  const getValidationError = (formId, field) => {
    return validationErrors[`${formId}_${field}`] || null;
  };

  // Function untuk format tanggal ke dd/mm/yyyy
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    
    // Jika format sudah dd/mm/yyyy, return as is
    if (dateString.includes('/')) {
      return dateString;
    }
    
    // Jika format yyyy-mm-dd, convert ke dd/mm/yyyy
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  };

  // Handler untuk update siswa
  const handleUpdateSiswa = async (id, siswaData) => {
    console.log("🔍 Updating siswa:", { id, siswaData });
    
    // Format data
    const formattedData = {
      nama_lengkap: siswaData.namaLengkap?.trim() || '',
      nisn: siswaData.nisn?.trim() || '',
      nik: siswaData.nik?.trim() || '',
      jenis_kelamin: siswaData.jenisKelamin || '',
      tempat_lahir: siswaData.tempatLahir?.trim() || '',
      tanggal_lahir: formatDateForAPI(siswaData.tanggalLahir)
    };
    
    console.log("📤 Formatted data to send:", formattedData);
    
    try {
      const response = await SiswaService.update(id, formattedData);
      console.log("📥 API Response received:", response);
      
      if (response.status === "success") {
        console.log("✅ Success response:", response.data);
        toast.success("Data siswa berhasil diperbarui");
        // Refresh data dan statistics
        loadSiswaData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        console.log("❌ Error response:", response.message);
        toast.error(response.message || "Gagal memperbarui data siswa");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error updating siswa:", error);
      console.log("🔍 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        console.log("🚨 API Error message:", errorMessage);
        
        if (errorMessage.includes("NISN sudah digunakan")) {
          toast.error("NISN sudah digunakan oleh siswa lain");
        } else if (errorMessage.includes("NIK sudah digunakan")) {
          toast.error("NIK sudah digunakan oleh siswa lain");
        } else if (errorMessage.includes("Siswa tidak ditemukan")) {
          toast.error("Siswa tidak ditemukan");
        } else if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal memperbarui data siswa");
      }
      
      return { success: false, error: error.response?.data?.message || "Gagal memperbarui data siswa" };
    }
  };

  // Handler untuk delete siswa
  const handleDeleteSiswa = async (id) => {
    console.log("🔍 Deleting siswa:", id);
    
    try {
      const response = await SiswaService.delete(id);
      console.log("📥 API Response received:", response);
      
      if (response.status === "success") {
        console.log("✅ Success response:", response.data);
        toast.success("Data siswa berhasil dihapus");
        // Refresh data dan statistics
        loadSiswaData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        console.log("❌ Error response:", response.message);
        toast.error(response.message || "Gagal menghapus data siswa");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error deleting siswa:", error);
      console.log("🔍 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        console.log("🚨 API Error message:", errorMessage);
        
        if (errorMessage.includes("Siswa tidak ditemukan")) {
          toast.error("Siswa tidak ditemukan");
        } else if (errorMessage.includes("masih terhubung dengan data lain")) {
          toast.error("Tidak dapat menghapus siswa karena masih terhubung dengan data lain (kelas/nilai)");
        } else if (errorMessage.includes("ID siswa tidak valid")) {
          toast.error("ID siswa tidak valid");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menghapus data siswa");
      }
      
      return { success: false, error: error.response?.data?.message || "Gagal menghapus data siswa" };
    }
  };

  return {
    // Data state
    siswaData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,

    // Search dan filter state
    searchQuery,
    jenisKelaminFilter,

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
    handleJenisKelaminFilter,
    handleClearFilter,
    handleItemsPerPageChange,
    handleRefresh,
    handleSort,
    handleBulkCreateSiswa,
    loadSiswaData,
    
    // Validation functions
    checkNikUnique,
    checkNisnUnique,
    validateSiswaDataWithUniqueness,
    validateField,
    clearValidationError,
    getValidationError,
    
    // Validation state
    isValidating,
    validationErrors,
    
    // CRUD handlers
    handleUpdateSiswa,
    handleDeleteSiswa,
  };
}
