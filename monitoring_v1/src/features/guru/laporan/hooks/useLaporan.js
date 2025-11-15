import { useState, useEffect } from 'react';
import { LaporanService } from '../../../../services/Guru/laporan/LaporanService';
import toast from 'react-hot-toast';

export const useLaporan = () => {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [laporanData, setLaporanData] = useState([]);
  const [laporanInfo, setLaporanInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKelas, setIsLoadingKelas] = useState(false);
  const [isLoadingMapel, setIsLoadingMapel] = useState(false);

  // Load kelas options on mount
  useEffect(() => {
    loadKelasOptions();
  }, []);

  // Load mapel options when kelas changes
  useEffect(() => {
    if (selectedKelas) {
      loadMapelOptions(selectedKelas);
    } else {
      setMapelOptions([]);
      setSelectedMapel('');
    }
  }, [selectedKelas]);

  // Load laporan data when both kelas and mapel are selected
  useEffect(() => {
    if (selectedKelas && selectedMapel) {
      loadLaporanData();
    } else {
      setLaporanData([]);
      setLaporanInfo(null);
    }
  }, [selectedKelas, selectedMapel]);

  const loadKelasOptions = async () => {
    setIsLoadingKelas(true);
    try {
      const response = await LaporanService.getKelas();
      const options = response.data.map(kelas => ({
        value: kelas.kelas_id.toString(),
        label: kelas.nama_kelas
      }));
      setKelasOptions(options);
      
      // Auto-select first kelas if available
      if (options.length > 0) {
        setSelectedKelas(options[0].value);
      }
    } catch (error) {
      console.error('Error loading kelas:', error);
      toast.error('Gagal memuat data kelas');
      setKelasOptions([]);
    } finally {
      setIsLoadingKelas(false);
    }
  };

  const loadMapelOptions = async (kelasId) => {
    setIsLoadingMapel(true);
    try {
      const response = await LaporanService.getMataPelajaran(kelasId);
      const options = response.data.map(mapel => ({
        value: mapel.mapel_id.toString(),
        label: mapel.nama_mapel
      }));
      setMapelOptions(options);
      
      // Auto-select first mapel if available
      if (options.length > 0) {
        setSelectedMapel(options[0].value);
      } else {
        setSelectedMapel('');
      }
    } catch (error) {
      console.error('Error loading mapel:', error);
      toast.error('Gagal memuat data mata pelajaran');
      setMapelOptions([]);
      setSelectedMapel('');
    } finally {
      setIsLoadingMapel(false);
    }
  };

  const loadLaporanData = async () => {
    setIsLoading(true);
    try {
      const response = await LaporanService.getNilai(selectedKelas, selectedMapel);
      
      // Map API response to match expected format
      const siswaData = response.data.siswa.map(siswa => ({
        id: siswa.siswa_id,
        nama: siswa.nama,
        nisn: siswa.nisn,
        rata_formatif: siswa.rata_formatif,
        rata_sumatif_lm: siswa.rata_sumatif_lm,
        uts: siswa.uts,
        uas: siswa.uas,
        nilai_akhir: siswa.nilai_akhir,
        grade: siswa.grade
      }));
      
      setLaporanData(siswaData);
      setLaporanInfo({
        kelas: response.data.kelas,
        mata_pelajaran: response.data.mata_pelajaran,
        tahun_ajaran: response.data.tahun_ajaran,
        semester: response.data.semester
      });
    } catch (error) {
      console.error('Error loading laporan data:', error);
      
      if (error.response?.status === 403) {
        toast.error('Anda tidak mengampu mata pelajaran ini di kelas tersebut');
      } else if (error.response?.status === 404) {
        toast.error('Tidak ada tahun ajaran aktif');
      } else {
        toast.error('Gagal memuat data laporan');
      }
      
      setLaporanData([]);
      setLaporanInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedKelas || !selectedMapel) {
      toast.error('Pilih kelas dan mata pelajaran terlebih dahulu');
      return;
    }

    try {
      toast.loading('Mengunduh laporan PDF...', { id: 'download-pdf' });
      await LaporanService.downloadPDF(selectedKelas, selectedMapel);
      toast.success('Laporan PDF berhasil diunduh', { id: 'download-pdf' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Gagal mengunduh laporan PDF', { id: 'download-pdf' });
    }
  };

  const canGenerateReport = selectedKelas && selectedMapel;

  return {
    selectedKelas,
    setSelectedKelas,
    selectedMapel,
    setSelectedMapel,
    kelasOptions,
    mapelOptions,
    laporanData,
    laporanInfo,
    isLoading,
    isLoadingKelas,
    isLoadingMapel,
    canGenerateReport,
    handleDownloadPDF,
  };
};

