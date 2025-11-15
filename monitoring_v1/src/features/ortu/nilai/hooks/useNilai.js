import { useState, useEffect } from 'react';
import NilaiService from '../../../../services/Ortu/nilai/NilaiService';
import { toast } from 'react-hot-toast';

export const useNilai = () => {
  // === State ===
  const [selectedTahun, setSelectedTahun] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  
  const [nilaiData, setNilaiData] = useState([]);
  
  const [isLoadingTahun, setIsLoadingTahun] = useState(false);
  const [isLoadingSemester, setIsLoadingSemester] = useState(false);
  const [isLoadingNilai, setIsLoadingNilai] = useState(false);

  // === Load Tahun Ajaran Options (API #1) ===
  useEffect(() => {
    const loadTahunAjaran = async () => {
      try {
        setIsLoadingTahun(true);
        
        // API #1 - ACTIVE
        const response = await NilaiService.getTahunAjaran();
        
        const options = response.data.map(tahun => ({
          value: tahun.tahun_ajaran_id.toString(),
          label: `T.A ${tahun.tahun_ajaran}`
        }));
        setTahunAjaranOptions(options);
        
        // Auto-select first option
        if (options.length > 0) {
          setSelectedTahun(options[0].value);
        }
      } catch (error) {
        console.error('Error loading tahun ajaran:', error);
        if (error.response?.status === 401) {
          toast.error('Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua siswa', { id: 'ortu-nilai-tahun-error' });
        } else {
          toast.error('Gagal memuat data tahun ajaran', { id: 'ortu-nilai-tahun-error' });
        }
        setTahunAjaranOptions([]);
      } finally {
        setIsLoadingTahun(false);
      }
    };

    loadTahunAjaran();
  }, []);

  // === Load Semester Options (API #2) ===
  useEffect(() => {
    const loadSemester = async () => {
      if (!selectedTahun) {
        setSemesterOptions([]);
        setSelectedSemester('');
        return;
      }

      try {
        setIsLoadingSemester(true);
        
        // API #2 - PENDING BACKEND (will be activated when ready)
        const response = await NilaiService.getSemester(selectedTahun);
        
        const options = response.data.map(sem => ({
          value: sem.semester,
          label: `Semester ${sem.semester}`
        }));
        setSemesterOptions(options);
        
        // Auto-select first option
        if (options.length > 0) {
          setSelectedSemester(options[0].value);
        } else {
          setSelectedSemester('');
        }
      } catch (error) {
        console.error('Error loading semester:', error);
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Parameter tidak valid', { id: 'ortu-nilai-semester-error' });
        } else if (error.response?.status === 401) {
          toast.error('Siswa ID tidak ditemukan. Pastikan Anda login sebagai orang tua siswa', { id: 'ortu-nilai-semester-error' });
        } else {
          toast.error('Gagal memuat data semester', { id: 'ortu-nilai-semester-error' });
        }
        setSemesterOptions([]);
        setSelectedSemester('');
      } finally {
        setIsLoadingSemester(false);
      }
    };

    loadSemester();
  }, [selectedTahun]);

  // === Load Nilai Data (API #3) ===
  useEffect(() => {
    const loadNilaiData = async () => {
      if (!selectedTahun || !selectedSemester) {
        setNilaiData([]);
        return;
      }

      try {
        setIsLoadingNilai(true);
        
        // API #3 - ACTIVE
        const response = await NilaiService.getNilai(selectedTahun, selectedSemester);
        
        // Map data untuk tabel (struktur sama dengan guru nilai)
        // Backend mengirim array langsung di response.data, bukan response.data.nilai
        const mappedData = response.data.map(item => ({
          id: item.mapel_id,
          nama_mapel: item.nama_mapel,
          
          // Formatif LM1 - TP1-4
          lm1_tp1: item.lm1_tp1,
          lm1_tp2: item.lm1_tp2,
          lm1_tp3: item.lm1_tp3,
          lm1_tp4: item.lm1_tp4,
          
          // Formatif LM2 - TP1-4
          lm2_tp1: item.lm2_tp1,
          lm2_tp2: item.lm2_tp2,
          lm2_tp3: item.lm2_tp3,
          lm2_tp4: item.lm2_tp4,
          
          // Formatif LM3 - TP1-4
          lm3_tp1: item.lm3_tp1,
          lm3_tp2: item.lm3_tp2,
          lm3_tp3: item.lm3_tp3,
          lm3_tp4: item.lm3_tp4,
          
          // Formatif LM4 - TP1-4
          lm4_tp1: item.lm4_tp1,
          lm4_tp2: item.lm4_tp2,
          lm4_tp3: item.lm4_tp3,
          lm4_tp4: item.lm4_tp4,
          
          // Formatif LM5 - TP1-4
          lm5_tp1: item.lm5_tp1,
          lm5_tp2: item.lm5_tp2,
          lm5_tp3: item.lm5_tp3,
          lm5_tp4: item.lm5_tp4,
          
          // Sumatif LM (Ulangan)
          lm1_ulangan: item.lm1_ulangan,
          lm2_ulangan: item.lm2_ulangan,
          lm3_ulangan: item.lm3_ulangan,
          lm4_ulangan: item.lm4_ulangan,
          lm5_ulangan: item.lm5_ulangan,
          
          // UTS & UAS
          uts: item.uts,
          uas: item.uas,
        }));
        
        setNilaiData(mappedData);
        
        // Statistik dihapus karena cards sudah dihapus
        // Backend tidak perlu kirim statistik lagi
      } catch (error) {
        console.error('Error loading nilai data:', error);
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Parameter tidak valid', { id: 'ortu-nilai-data-error' });
        } else if (error.response?.status === 404) {
          toast.error('Nilai tidak ditemukan', { id: 'ortu-nilai-data-error' });
        } else {
          toast.error('Gagal memuat data nilai', { id: 'ortu-nilai-data-error' });
        }
        setNilaiData([]);
      } finally {
        setIsLoadingNilai(false);
      }
    };

    loadNilaiData();
  }, [selectedTahun, selectedSemester]);

  return {
    selectedTahun,
    setSelectedTahun,
    selectedSemester,
    setSelectedSemester,
    tahunAjaranOptions,
    semesterOptions,
    nilaiData,
    isLoadingTahun,
    isLoadingSemester,
    isLoadingNilai,
  };
};

