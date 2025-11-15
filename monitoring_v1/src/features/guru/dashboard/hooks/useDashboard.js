import { useState, useEffect, useMemo } from 'react';
import { MAX_CATATAN_DISPLAY } from '../config';
import DashboardService from '../../../../services/Guru/dashboard/DashboardService';
import { toast } from 'react-hot-toast';

export const useDashboard = () => {
  // === State untuk API #1: Statistik Siswa ===
  const [statistikSiswa, setStatistikSiswa] = useState({
    total_siswa: 0,
    laki_laki: 0,
    perempuan: 0,
  });
  const [isLoadingStatistik, setIsLoadingStatistik] = useState(true);

  // === State untuk API #2: Peringkat Siswa ===
  const [peringkatSiswaData, setPeringkatSiswaData] = useState([]);
  const [isLoadingPeringkat, setIsLoadingPeringkat] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasAccessPeringkat, setHasAccessPeringkat] = useState(true); // Track access permission
  const ITEMS_PER_PAGE_PERINGKAT = 10;

  // === State untuk API #3: Mata Pelajaran ===
  const [mapelOptions, setMapelOptions] = useState([]);
  const [isLoadingMapel, setIsLoadingMapel] = useState(true);
  const [selectedMapel, setSelectedMapel] = useState("");

  // === State untuk API #4: Nilai per Mapel ===
  const [nilaiSiswaData, setNilaiSiswaData] = useState([]);
  const [isLoadingNilai, setIsLoadingNilai] = useState(false);
  const [currentPageNilai, setCurrentPageNilai] = useState(1);
  const [totalPagesNilai, setTotalPagesNilai] = useState(1);
  const ITEMS_PER_PAGE_NILAI = 10;

  // === Handle mapel change dengan reset pagination ===
  const handleMapelChange = (newMapel) => {
    setSelectedMapel(newMapel);
    setCurrentPageNilai(1);
  };

  // === Load Statistik Siswa (API #1) ===
  useEffect(() => {
    const loadStatistikSiswa = async () => {
      try {
        setIsLoadingStatistik(true);
        const response = await DashboardService.getStatistikSiswa();
        setStatistikSiswa(response.data);
      } catch (error) {
        console.error('Error loading statistik siswa:', error);
        toast.error('Gagal memuat statistik siswa');
      } finally {
        setIsLoadingStatistik(false);
      }
    };

    loadStatistikSiswa();
  }, []);

  // === Load Peringkat Siswa (API #2) ===
  useEffect(() => {
    const loadPeringkatSiswa = async () => {
      try {
        setIsLoadingPeringkat(true);
        const response = await DashboardService.getPeringkatSiswa(currentPage, ITEMS_PER_PAGE_PERINGKAT);
        setPeringkatSiswaData(response.data.siswa);
        setTotalPages(response.data.pagination.total_pages);
        setHasAccessPeringkat(true); // Success = has access
      } catch (error) {
        console.error('Error loading peringkat siswa:', error);
        
        // Handle 403 Forbidden (Guru Mapel - bukan wali kelas)
        if (error.response?.status === 403) {
          setHasAccessPeringkat(false);
          setPeringkatSiswaData([]);
          // Don't show error toast for 403 - just hide component
          console.log('Guru Mapel: Fitur Peringkat Siswa tidak tersedia');
        } else if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Parameter tidak valid');
          setPeringkatSiswaData([]);
        } else {
          toast.error('Gagal memuat peringkat siswa');
          setPeringkatSiswaData([]);
        }
      } finally {
        setIsLoadingPeringkat(false);
      }
    };

    loadPeringkatSiswa();
  }, [currentPage, ITEMS_PER_PAGE_PERINGKAT]);

  // === Load Mata Pelajaran (API #3) ===
  useEffect(() => {
    const loadMataPelajaran = async () => {
      try {
        setIsLoadingMapel(true);
        const response = await DashboardService.getMataPelajaran();
        setMapelOptions(response.data);
        // Auto-select first mapel if available
        if (response.data.length > 0) {
          const firstOption = response.data[0];
          // Support both formats:
          // - Wali Kelas: mapel_id only
          // - Guru Mapel: mapel_id-kelas_id combination
          const firstValue = firstOption.kelas_id 
            ? `${firstOption.mapel_id}-${firstOption.kelas_id}` 
            : firstOption.mapel_id.toString();
          setSelectedMapel(firstValue);
        }
      } catch (error) {
        console.error('Error loading mata pelajaran:', error);
        // 404 = guru hanya wali kelas (tidak mengajar mapel)
        if (error.response?.status === 404) {
          setMapelOptions([]);
          setSelectedMapel("");
        } else {
          toast.error('Gagal memuat mata pelajaran');
        }
      } finally {
        setIsLoadingMapel(false);
      }
    };

    loadMataPelajaran();
  }, []);

  // === Load Nilai per Mapel (API #4) ===
  useEffect(() => {
    const loadNilaiPerMapel = async () => {
      // Only load if mapel is selected
      if (!selectedMapel) {
        setNilaiSiswaData([]);
        setTotalPagesNilai(1);
        return;
      }

      try {
        setIsLoadingNilai(true);
        
        // Parse selectedMapel:
        // - Wali Kelas format: "1" (mapel_id only)
        // - Guru Mapel format: "1-17" (mapel_id-kelas_id)
        let mapelId, kelasId;
        if (selectedMapel.includes('-')) {
          const parts = selectedMapel.split('-');
          mapelId = parseInt(parts[0]);
          kelasId = parseInt(parts[1]);
        } else {
          mapelId = parseInt(selectedMapel);
          kelasId = null;
        }
        
        const response = await DashboardService.getNilaiPerMapel(
          mapelId,
          currentPageNilai,
          ITEMS_PER_PAGE_NILAI,
          kelasId
        );
        setNilaiSiswaData(response.data.siswa);
        setTotalPagesNilai(response.data.pagination.total_pages);
      } catch (error) {
        console.error('Error loading nilai per mapel:', error);
        if (error.response?.status === 403) {
          toast.error('Anda tidak mengampu mata pelajaran ini');
        } else if (error.response?.status === 400) {
          toast.error('Parameter tidak valid');
        } else {
          toast.error('Gagal memuat nilai siswa');
        }
        setNilaiSiswaData([]);
      } finally {
        setIsLoadingNilai(false);
      }
    };

    loadNilaiPerMapel();
  }, [selectedMapel, currentPageNilai, ITEMS_PER_PAGE_NILAI]);

  // === State untuk Kelas Diampu (DECLARE BEFORE USE) ===
  const [kelasOptions, setKelasOptions] = useState([]);
  const [isLoadingKelas, setIsLoadingKelas] = useState(true);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [isWaliKelas, setIsWaliKelas] = useState(false); // Track if guru is wali kelas
  const [showKelasDropdown, setShowKelasDropdown] = useState(true); // Control dropdown visibility

  // === Load Kelas for Kehadiran ===
  useEffect(() => {
    const loadKehadiranKelas = async () => {
      try {
        setIsLoadingKelas(true);
        const response = await DashboardService.getKehadiranKelas();
        
        if (response.data.is_wali_kelas) {
          // Wali Kelas: Hide dropdown, auto-select their kelas
          setIsWaliKelas(true);
          setShowKelasDropdown(false);
          setSelectedKelas(response.data.kelas_id.toString());
          setKelasOptions([{
            kelas_id: response.data.kelas_id,
            nama_kelas: response.data.nama_kelas
          }]);
        } else {
          // Guru Mapel: Show dropdown, auto-select first kelas
          setIsWaliKelas(false);
          setShowKelasDropdown(true);
          const kelasList = response.data.kelas_list || [];
          setKelasOptions(kelasList);
          // Auto-select first kelas (no "Semua Kelas" option)
          if (kelasList.length > 0) {
            setSelectedKelas(kelasList[0].kelas_id.toString());
          }
        }
      } catch (error) {
        console.error('Error loading kehadiran kelas:', error);
        toast.error('Gagal memuat daftar kelas');
        setKelasOptions([]);
        setShowKelasDropdown(false);
      } finally {
        setIsLoadingKelas(false);
      }
    };

    loadKehadiranKelas();
  }, []);

  // === Handle kelas change ===
  const handleKelasChange = (newKelas) => {
    setSelectedKelas(newKelas);
  };

  // === Load Kehadiran Hari Ini (API #5) ===
  useEffect(() => {
    const loadKehadiranHariIni = async () => {
      try {
        setIsLoadingKehadiran(true);
        const kelasId = selectedKelas === "" ? null : parseInt(selectedKelas);
        const response = await DashboardService.getKehadiranHariIni(kelasId);
        setKehadiranData(response.data.kehadiran);
        setTanggalKehadiran(response.data.tanggal);
      } catch (error) {
        console.error('Error loading kehadiran hari ini:', error);
        toast.error('Gagal memuat data kehadiran');
        // Set default empty data
        setKehadiranData([
          { name: 'Hadir', value: 0 },
          { name: 'Sakit', value: 0 },
          { name: 'Izin', value: 0 },
          { name: 'Alpha', value: 0 },
        ]);
      } finally {
        setIsLoadingKehadiran(false);
      }
    };

    // Only load if kelas options are loaded
    if (!isLoadingKelas) {
      loadKehadiranHariIni();
    }
  }, [selectedKelas, isLoadingKelas]);

  // === Load Catatan Terbaru (API #6) ===
  useEffect(() => {
    const loadCatatanTerbaru = async () => {
      try {
        setIsLoadingCatatan(true);
        const response = await DashboardService.getCatatanTerbaru(MAX_CATATAN_DISPLAY);
        setCatatanTampil(response.data);
      } catch (error) {
        console.error('Error loading catatan terbaru:', error);
        toast.error('Gagal memuat catatan terbaru');
        setCatatanTampil([]);
      } finally {
        setIsLoadingCatatan(false);
      }
    };

    loadCatatanTerbaru();
  }, []);

  // === Format data peringkat untuk chart (tambahkan ranking number) ===
  const formattedPeringkatData = useMemo(() => {
    const startRank = (currentPage - 1) * ITEMS_PER_PAGE_PERINGKAT;
    return peringkatSiswaData.map((siswa, index) => ({
      ...siswa,
      nama: `#${startRank + index + 1} ${siswa.nama}`
    }));
  }, [peringkatSiswaData, currentPage, ITEMS_PER_PAGE_PERINGKAT]);

  // Mock data removed - now using API #4

  // === State untuk API #5: Kehadiran Hari Ini ===
  const [kehadiranData, setKehadiranData] = useState([]);
  const [isLoadingKehadiran, setIsLoadingKehadiran] = useState(true);
  const [tanggalKehadiran, setTanggalKehadiran] = useState('');

  // === State untuk API #6: Catatan Terbaru ===
  const [catatanTampil, setCatatanTampil] = useState([]);
  const [isLoadingCatatan, setIsLoadingCatatan] = useState(true);

  return {
    // Statistik Siswa (API #1)
    statistikSiswa,
    isLoadingStatistik,

    // Peringkat Siswa (API #2)
    peringkatSiswaData: formattedPeringkatData,
    isLoadingPeringkat,
    hasAccessPeringkat,
    currentPage,
    setCurrentPage,
    totalPages,

    // Mata Pelajaran (API #3)
    mapelOptions,
    isLoadingMapel,
    selectedMapel,
    handleMapelChange,

    // Nilai Siswa per Mapel (API #4)
    nilaiSiswaData,
    isLoadingNilai,
    currentPageNilai,
    setCurrentPageNilai,
    totalPagesNilai,

    // Kelas for Kehadiran
    kelasOptions,
    isLoadingKelas,
    selectedKelas,
    handleKelasChange,
    isWaliKelas,
    showKelasDropdown,

    // Kehadiran Hari Ini (API #5)
    kehadiranData,
    isLoadingKehadiran,
    tanggalKehadiran,

    // Catatan Terbaru (API #6)
    catatanTampil,
    isLoadingCatatan,
  };
};

