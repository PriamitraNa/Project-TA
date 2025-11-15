import { useState, useEffect, useMemo, createElement } from 'react';
import DashboardService from '../../../../services/Ortu/dashboard/DashboardService';
import { toast } from 'react-hot-toast';

export const useDashboard = () => {
  // === State untuk data anak (API #1) ===
  const [dataAnak, setDataAnak] = useState({
    nama: '',
    nisn: '',
    kelas: '',
    nilai_rata_rata: null,
    semester: '',
    tahun_ajaran: '',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // === State untuk absensi hari ini (API #2) ===
  const [absensiData, setAbsensiData] = useState({
    status_absensi: 'Belum Diabsen',
    tanggal: '',
    kelas: '',
  });
  const [isLoadingAbsensi, setIsLoadingAbsensi] = useState(true);

  // === State untuk catatan terbaru ===
  const [catatanTerbaru, setCatatanTerbaru] = useState([]);
  const [isLoadingCatatan, setIsLoadingCatatan] = useState(false);

  // === State untuk nilai per mapel ===
  const [nilaiPerMapel, setNilaiPerMapel] = useState([]);
  const [isLoadingNilai, setIsLoadingNilai] = useState(false);

  // === Load Profile Anak (API #1) ===
  useEffect(() => {
    const loadProfileAnak = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await DashboardService.getProfileAnak();
        setDataAnak(response.data);
      } catch (error) {
        console.error('Error loading profile anak:', error);
        toast.error('Gagal memuat profil anak');
        // Set default empty data on error
        setDataAnak({
          nama: 'Nama tidak tersedia',
          nisn: '-',
          kelas: '-',
          nilai_rata_rata: null,
          semester: '-',
          tahun_ajaran: '-',
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileAnak();
  }, []);

  // === Load Absensi Hari Ini (API #2) ===
  useEffect(() => {
    const loadAbsensiHariIni = async () => {
      try {
        setIsLoadingAbsensi(true);
        const response = await DashboardService.getAbsensiHariIni();
        setAbsensiData(response.data);
      } catch (error) {
        console.error('Error loading absensi hari ini:', error);
        toast.error('Gagal memuat data absensi');
        // Set default "Belum Diabsen" on error
        setAbsensiData({
          status_absensi: 'Belum Diabsen',
          tanggal: new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          kelas: dataAnak.kelas || '-',
        });
      } finally {
        setIsLoadingAbsensi(false);
      }
    };

    loadAbsensiHariIni();
  }, [dataAnak.kelas]);

  // === Load Catatan Terbaru (API #3) ===
  useEffect(() => {
    const loadCatatanTerbaru = async () => {
      try {
        setIsLoadingCatatan(true);
        const response = await DashboardService.getCatatanTerbaru(5); // limit 5 for dashboard
        setCatatanTerbaru(response.data);
      } catch (error) {
        console.error('Error loading catatan terbaru:', error);
        toast.error('Gagal memuat catatan terbaru');
        setCatatanTerbaru([]);
      } finally {
        setIsLoadingCatatan(false);
      }
    };

    loadCatatanTerbaru();
  }, []);

  // === Load Nilai per Mapel (API #4) ===
  useEffect(() => {
    const loadNilaiPerMapel = async () => {
      try {
        setIsLoadingNilai(true);
        const response = await DashboardService.getNilaiPerMapel();
        setNilaiPerMapel(response.data);
      } catch (error) {
        console.error('Error loading nilai per mapel:', error);
        toast.error('Gagal memuat data nilai');
        setNilaiPerMapel([]);
      } finally {
        setIsLoadingNilai(false);
      }
    };

    loadNilaiPerMapel();
  }, []);

  // === Format catatan data untuk tabel ===
  const formattedCatatanData = useMemo(() => {
    return catatanTerbaru.map((item) => ({
      ...item,
      guru: createElement(
        'div',
        null,
        createElement(
          'div',
          { className: 'font-semibold text-slate-800' },
          item.guru_nama
        ),
        createElement(
          'div',
          { className: 'text-xs text-slate-500' },
          item.mata_pelajaran || 'Catatan Umum'
        )
      ),
    }));
  }, [catatanTerbaru]);

  // === Format data anak untuk display ===
  const formattedDataAnak = useMemo(() => {
    return {
      nama: dataAnak.nama,
      nisn: dataAnak.nisn,
      kelas: dataAnak.kelas,
      nilaiRataRata: dataAnak.nilai_rata_rata ?? 0, // null → 0 for display
      semester: dataAnak.semester,
      tahunAjaran: dataAnak.tahun_ajaran,
    };
  }, [dataAnak]);

  // === Format absensi data untuk display ===
  const formattedAbsensiData = useMemo(() => {
    return {
      status: absensiData.status_absensi,
      tanggal: absensiData.tanggal,
      kelas: absensiData.kelas,
    };
  }, [absensiData]);

  return {
    // Data Anak
    dataAnak: formattedDataAnak,
    isLoadingProfile,

    // Absensi Hari Ini (API #2)
    absensiData: formattedAbsensiData,
    isLoadingAbsensi,

    // Catatan Terbaru
    catatanTerbaru: formattedCatatanData,
    isLoadingCatatan,

    // Nilai per Mapel
    nilaiPerMapel,
    isLoadingNilai,
  };
};

