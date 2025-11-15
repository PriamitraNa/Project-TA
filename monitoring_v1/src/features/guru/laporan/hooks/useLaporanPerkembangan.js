import { useState, useEffect } from 'react';
import { LaporanService } from '../../../../services/Guru/laporan/LaporanService';
import toast from 'react-hot-toast';

// ==================== MOCK DATA ====================
const MOCK_KELAS = {
  kelas_id: 17,
  nama_kelas: "5A",
  tahun_ajaran: "2027/2028",
  semester: "Genap"
};

const MOCK_SISWA = [
  { siswa_id: 1, nama: "Ahmad Fauzi", nisn: "1234567890" },
  { siswa_id: 2, nama: "Siti Aminah", nisn: "0987654321" },
  { siswa_id: 3, nama: "Budi Santoso", nisn: "1122334455" },
  { siswa_id: 4, nama: "Dewi Lestari", nisn: "5544332211" },
  { siswa_id: 5, nama: "Eko Prasetyo", nisn: "9988776655" },
];

const MOCK_LAPORAN_DATA = {
  1: {
    siswa: {
      siswa_id: 1,
      nama: "Ahmad Fauzi",
      nisn: "1234567890",
      kelas: "5A",
      nama_ortu: "Bapak Fauzi bin Ahmad"
    },
    nilai_akademik: [
      { mapel_id: 1, nama_mapel: "Matematika", nilai_akhir: 88.5, grade: "B+" },
      { mapel_id: 2, nama_mapel: "Bahasa Indonesia", nilai_akhir: 92.0, grade: "A" },
      { mapel_id: 3, nama_mapel: "IPA", nilai_akhir: 85.0, grade: "B" },
      { mapel_id: 4, nama_mapel: "IPS", nilai_akhir: 90.0, grade: "A-" },
      { mapel_id: 5, nama_mapel: "Bahasa Inggris", nilai_akhir: 87.5, grade: "B+" },
      { mapel_id: 6, nama_mapel: "Pendidikan Agama", nilai_akhir: 95.0, grade: "A" },
      { mapel_id: 7, nama_mapel: "PJOK", nilai_akhir: 89.0, grade: "B+" },
    ],
    absensi: {
      hadir: 120,
      sakit: 2,
      izin: 1,
      alpha: 0
    },
    catatan_perkembangan: [
      {
        catatan_id: 15,
        guru_nama: "Pak Budi Santoso",
        jenis: "Akademik",
        mapel_nama: "Matematika",
        tanggal: "27/10/2025",
        isi_catatan: "Sangat aktif dalam diskusi kelompok. Menunjukkan pemahaman yang baik terhadap konsep pecahan dan desimal. Sering membantu teman yang kesulitan."
      },
      {
        catatan_id: 14,
        guru_nama: "Bu Siti Nurhaliza",
        jenis: "Akademik",
        mapel_nama: "Bahasa Indonesia",
        tanggal: "25/10/2025",
        isi_catatan: "Kemampuan menulis karangan narasi sangat baik. Perlu lebih fokus pada penggunaan tanda baca yang tepat."
      },
      {
        catatan_id: 13,
        guru_nama: "Pak Agus Setiawan",
        jenis: "Akademik",
        mapel_nama: "IPA",
        tanggal: "20/10/2025",
        isi_catatan: "Antusias saat praktikum percobaan sains. Menunjukkan rasa ingin tahu yang tinggi dan selalu bertanya hal-hal mendalam."
      },
      {
        catatan_id: 12,
        guru_nama: "Bu Rita Marlina",
        jenis: "Umum",
        mapel_nama: "Umum",
        tanggal: "15/10/2025",
        isi_catatan: "Siswa yang sopan dan bertanggung jawab. Sering membantu menjaga kebersihan kelas dan memimpin teman-temannya dengan baik."
      },
    ]
  },
  2: {
    siswa: {
      siswa_id: 2,
      nama: "Siti Aminah",
      nisn: "0987654321",
      kelas: "5A",
      nama_ortu: "Ibu Aminah binti Usman"
    },
    nilai_akademik: [
      { mapel_id: 1, nama_mapel: "Matematika", nilai_akhir: 95.0, grade: "A" },
      { mapel_id: 2, nama_mapel: "Bahasa Indonesia", nilai_akhir: 98.0, grade: "A" },
      { mapel_id: 3, nama_mapel: "IPA", nilai_akhir: 92.0, grade: "A" },
      { mapel_id: 4, nama_mapel: "IPS", nilai_akhir: 94.0, grade: "A" },
      { mapel_id: 5, nama_mapel: "Bahasa Inggris", nilai_akhir: 96.0, grade: "A" },
      { mapel_id: 6, nama_mapel: "Pendidikan Agama", nilai_akhir: 100.0, grade: "A" },
      { mapel_id: 7, nama_mapel: "PJOK", nilai_akhir: 88.0, grade: "B+" },
    ],
    absensi: {
      hadir: 122,
      sakit: 1,
      izin: 0,
      alpha: 0
    },
    catatan_perkembangan: [
      {
        catatan_id: 20,
        guru_nama: "Pak Budi Santoso",
        jenis: "Akademik",
        mapel_nama: "Matematika",
        tanggal: "28/10/2025",
        isi_catatan: "Siswa terbaik di kelas. Selalu mengerjakan tugas dengan sempurna dan tepat waktu. Prestasi akademik sangat memuaskan."
      },
      {
        catatan_id: 19,
        guru_nama: "Bu Siti Nurhaliza",
        jenis: "Prestasi",
        mapel_nama: "Bahasa Indonesia",
        tanggal: "26/10/2025",
        isi_catatan: "Kemampuan literasi luar biasa. Sering menjadi juara dalam lomba menulis dan membaca puisi."
      },
    ]
  },
  3: {
    siswa: {
      siswa_id: 3,
      nama: "Budi Santoso",
      nisn: "1122334455",
      kelas: "5A",
      nama_ortu: "Bapak Santoso bin Wibowo"
    },
    nilai_akademik: [
      { mapel_id: 1, nama_mapel: "Matematika", nilai_akhir: 75.0, grade: "B-" },
      { mapel_id: 2, nama_mapel: "Bahasa Indonesia", nilai_akhir: 78.0, grade: "B" },
      { mapel_id: 3, nama_mapel: "IPA", nilai_akhir: 72.0, grade: "B-" },
      { mapel_id: 4, nama_mapel: "IPS", nilai_akhir: 80.0, grade: "B+" },
      { mapel_id: 5, nama_mapel: "Bahasa Inggris", nilai_akhir: 70.0, grade: "B-" },
      { mapel_id: 6, nama_mapel: "Pendidikan Agama", nilai_akhir: 85.0, grade: "B" },
      { mapel_id: 7, nama_mapel: "PJOK", nilai_akhir: 95.0, grade: "A" },
    ],
    absensi: {
      hadir: 115,
      sakit: 5,
      izin: 2,
      alpha: 1
    },
    catatan_perkembangan: [
      {
        catatan_id: 25,
        guru_nama: "Pak Budi Santoso",
        jenis: "Akademik",
        mapel_nama: "Matematika",
        tanggal: "28/10/2025",
        isi_catatan: "Perlu bimbingan lebih dalam memahami konsep matematika. Disarankan untuk lebih sering latihan soal."
      },
      {
        catatan_id: 24,
        guru_nama: "Pak Ahmad Hidayat",
        jenis: "Prestasi",
        mapel_nama: "PJOK",
        tanggal: "22/10/2025",
        isi_catatan: "Sangat berbakat dalam olahraga, terutama sepak bola. Sering menjadi kapten tim dan menunjukkan jiwa kepemimpinan yang baik."
      },
    ]
  },
  4: {
    siswa: {
      siswa_id: 4,
      nama: "Dewi Lestari",
      nisn: "5544332211",
      kelas: "5A",
      nama_ortu: "Ibu Lestari binti Sukarno"
    },
    nilai_akademik: [
      { mapel_id: 1, nama_mapel: "Matematika", nilai_akhir: 82.0, grade: "B+" },
      { mapel_id: 2, nama_mapel: "Bahasa Indonesia", nilai_akhir: 88.0, grade: "B+" },
      { mapel_id: 3, nama_mapel: "IPA", nilai_akhir: 86.0, grade: "B+" },
      { mapel_id: 4, nama_mapel: "IPS", nilai_akhir: 91.0, grade: "A" },
      { mapel_id: 5, nama_mapel: "Bahasa Inggris", nilai_akhir: 84.0, grade: "B+" },
      { mapel_id: 6, nama_mapel: "Pendidikan Agama", nilai_akhir: 93.0, grade: "A" },
      { mapel_id: 7, nama_mapel: "PJOK", nilai_akhir: 80.0, grade: "B+" },
    ],
    absensi: {
      hadir: 118,
      sakit: 3,
      izin: 2,
      alpha: 0
    },
    catatan_perkembangan: [
      {
        catatan_id: 30,
        guru_nama: "Bu Siti Nurhaliza",
        jenis: "Prestasi",
        mapel_nama: "Bahasa Indonesia",
        tanggal: "29/10/2025",
        isi_catatan: "Memiliki kemampuan komunikasi yang baik. Sering menjadi MC dalam acara sekolah."
      },
      {
        catatan_id: 29,
        guru_nama: "Pak Andi Wijaya",
        jenis: "Akademik",
        mapel_nama: "IPS",
        tanggal: "24/10/2025",
        isi_catatan: "Tertarik dengan sejarah dan geografi. Aktif bertanya dan berdiskusi di kelas."
      },
    ]
  },
  5: {
    siswa: {
      siswa_id: 5,
      nama: "Eko Prasetyo",
      nisn: "9988776655",
      kelas: "5A",
      nama_ortu: "Bapak Prasetyo bin Susilo"
    },
    nilai_akademik: [
      { mapel_id: 1, nama_mapel: "Matematika", nilai_akhir: 65.0, grade: "C" },
      { mapel_id: 2, nama_mapel: "Bahasa Indonesia", nilai_akhir: 68.0, grade: "C+" },
      { mapel_id: 3, nama_mapel: "IPA", nilai_akhir: 70.0, grade: "B-" },
      { mapel_id: 4, nama_mapel: "IPS", nilai_akhir: 72.0, grade: "B-" },
      { mapel_id: 5, nama_mapel: "Bahasa Inggris", nilai_akhir: 62.0, grade: "C" },
      { mapel_id: 6, nama_mapel: "Pendidikan Agama", nilai_akhir: 75.0, grade: "B-" },
      { mapel_id: 7, nama_mapel: "PJOK", nilai_akhir: 78.0, grade: "B" },
    ],
    absensi: {
      hadir: 110,
      sakit: 8,
      izin: 3,
      alpha: 2
    },
    catatan_perkembangan: [
      {
        catatan_id: 35,
        guru_nama: "Pak Budi Santoso",
        jenis: "Akademik",
        mapel_nama: "Matematika",
        tanggal: "28/10/2025",
        isi_catatan: "Perlu perhatian khusus dalam pembelajaran. Disarankan untuk mengikuti les tambahan."
      },
      {
        catatan_id: 34,
        guru_nama: "Bu Rita Marlina",
        jenis: "Umum",
        mapel_nama: "Umum",
        tanggal: "23/10/2025",
        isi_catatan: "Siswa yang pendiam. Perlu didorong untuk lebih aktif bersosialisasi dengan teman-teman."
      },
      {
        catatan_id: 33,
        guru_nama: "Bu Siti Nurhaliza",
        jenis: "Akademik",
        mapel_nama: "Bahasa Indonesia",
        tanggal: "18/10/2025",
        isi_catatan: "Menunjukkan perkembangan dalam membaca. Perlu terus didampingi untuk meningkatkan kepercayaan diri."
      },
    ]
  },
};

export const useLaporanPerkembangan = () => {
  // Filter states
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState('');
  
  // Options
  const [kelasOptions, setKelasOptions] = useState([]);
  const [siswaOptions, setSiswaOptions] = useState([]);
  
  // Data states
  const [laporanData, setLaporanData] = useState(null);
  const [periodeInfo, setPeriodeInfo] = useState(null);
  const [catatanWaliKelas, setCatatanWaliKelas] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKelas, setIsLoadingKelas] = useState(false);
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);
  
  // Error states
  const [isNotWaliKelas, setIsNotWaliKelas] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load kelas on mount
  useEffect(() => {
    loadKelasOptions();
  }, []);

  // Load siswa when kelas changes
  useEffect(() => {
    if (selectedKelas) {
      loadSiswaOptions(selectedKelas);
    } else {
      setSiswaOptions([]);
      setSelectedSiswa('');
      setLaporanData(null);
    }
  }, [selectedKelas]);

  // Load laporan data when siswa selected
  useEffect(() => {
    if (selectedSiswa) {
      loadLaporanData(selectedSiswa);
    } else {
      setLaporanData(null);
      setCatatanWaliKelas('');
    }
  }, [selectedSiswa]);

  // Load kelas yang di-wali guru (REAL API)
  const loadKelasOptions = async () => {
    setIsLoadingKelas(true);
    
    try {
      const response = await LaporanService.getKelasWali();
      
      console.log('📡 API Response - Kelas Wali:', response);
      
      if (response.status === 'success' && response.data) {
        // Single kelas for wali kelas
        const kelas = response.data;
        const options = [{
          value: kelas.kelas_id.toString(),
          label: kelas.nama_kelas
        }];
        setKelasOptions(options);
        
        // Auto-select the kelas
        setSelectedKelas(kelas.kelas_id.toString());
        
        // Set periode info
        setPeriodeInfo({
          tahun_ajaran: kelas.tahun_ajaran,
          semester: kelas.semester
        });
        
        console.log('✅ Kelas Wali loaded:', kelas);
      } else {
        setKelasOptions([]);
        toast.error('Anda belum menjadi wali kelas');
      }
    } catch (error) {
      console.error('❌ Error loading kelas:', error);
      
      if (error.response?.status === 403) {
        setIsNotWaliKelas(true);
        setErrorMessage('Anda tidak memiliki akses sebagai wali kelas');
        toast.error('Anda tidak memiliki akses sebagai wali kelas', {
          duration: 5000,
          id: 'wali-kelas-403'
        });
      } else if (error.response?.status === 404) {
        setIsNotWaliKelas(true);
        setErrorMessage('Anda belum ditugaskan sebagai wali kelas');
        toast.error('Anda belum ditugaskan sebagai wali kelas', {
          duration: 5000,
          id: 'wali-kelas-404'
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data kelas');
      }
      
      setKelasOptions([]);
    } finally {
      setIsLoadingKelas(false);
    }
  };

  // Load daftar siswa di kelas (REAL API)
  const loadSiswaOptions = async (kelasId) => {
    setIsLoadingSiswa(true);
    
    try {
      const response = await LaporanService.getSiswaByKelas(kelasId);
      
      console.log('📡 API Response - Siswa List:', response);
      
      if (response.status === 'success' && response.data) {
        const options = response.data.map(siswa => ({
          value: siswa.siswa_id.toString(),
          label: `${siswa.nama} (${siswa.nisn})`
        }));
        setSiswaOptions(options);
        
        // Don't auto-select first siswa, let user choose
        setSelectedSiswa('');
        
        console.log('✅ Siswa loaded:', response.data.length, 'siswa');
      } else {
        setSiswaOptions([]);
      }
    } catch (error) {
      console.error('❌ Error loading siswa:', error);
      
      if (error.response?.status === 400) {
        toast.error('Parameter kelas tidak valid');
      } else if (error.response?.status === 403) {
        toast.error('Anda bukan wali kelas dari kelas ini');
      } else if (error.response?.status === 404) {
        toast.error('Tidak ada siswa di kelas ini', {
          duration: 4000,
          id: 'no-siswa-404'
        });
        setSiswaOptions([]); // Set empty array but don't show as error
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data siswa');
      }
      
      setSiswaOptions([]);
    } finally {
      setIsLoadingSiswa(false);
    }
  };

  // Load data lengkap perkembangan siswa (REAL API)
  const loadLaporanData = async (siswaId) => {
    setIsLoading(true);
    
    try {
      const response = await LaporanService.getPerkembanganSiswa(siswaId);
      
      console.log('📡 API Response - Perkembangan Siswa:', response);
      
      if (response.status === 'success' && response.data) {
        setLaporanData(response.data);
        
        // Reset catatan wali kelas
        setCatatanWaliKelas('');
        
        console.log('✅ Laporan data loaded for siswa:', siswaId);
        console.log('   - Siswa:', response.data.siswa?.nama);
        console.log('   - Nilai Akademik:', response.data.nilai_akademik?.length, 'mapel');
        console.log('   - Absensi:', response.data.absensi);
        console.log('   - Catatan:', response.data.catatan_perkembangan?.length, 'catatan');
      } else {
        setLaporanData(null);
      }
    } catch (error) {
      console.error('❌ Error loading laporan data:', error);
      
      if (error.response?.status === 400) {
        toast.error('Parameter siswa tidak valid');
      } else if (error.response?.status === 403) {
        toast.error('Anda bukan wali kelas dari siswa ini', {
          duration: 5000,
          id: 'laporan-403'
        });
      } else if (error.response?.status === 404) {
        toast.error('Data siswa tidak ditemukan', {
          duration: 5000,
          id: 'laporan-404'
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal memuat data laporan perkembangan');
      }
      
      setLaporanData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle download PDF (REAL API)
  const handleDownloadPDF = async () => {
    if (!selectedSiswa) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }

    if (!catatanWaliKelas.trim()) {
      toast.error('Catatan wali kelas wajib diisi sebelum download PDF');
      return;
    }

    try {
      toast.loading('Mengunduh laporan PDF...', { id: 'download-pdf' });
      
      console.log('📄 PDF Download Request:', {
        siswa_id: selectedSiswa,
        siswa_nama: laporanData?.siswa?.nama,
        catatan_wali_kelas_length: catatanWaliKelas.length
      });
      
      // Call API to download PDF
      await LaporanService.downloadLaporanPerkembangan(selectedSiswa, catatanWaliKelas);
      
      toast.success('Laporan PDF berhasil diunduh!', { id: 'download-pdf' });
      
      console.log('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Parameter tidak valid';
        toast.error(message, { id: 'download-pdf' });
      } else if (error.response?.status === 403) {
        toast.error('Anda bukan wali kelas dari siswa ini', { id: 'download-pdf' });
      } else if (error.response?.status === 404) {
        toast.error('Data siswa tidak ditemukan', { id: 'download-pdf' });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, { id: 'download-pdf' });
      } else {
        toast.error('Gagal mengunduh laporan PDF', { id: 'download-pdf' });
      }
    }
  };

  const canGenerateReport = selectedKelas && selectedSiswa && laporanData;

  return {
    // Filter states
    selectedKelas,
    setSelectedKelas,
    selectedSiswa,
    setSelectedSiswa,
    
    // Options
    kelasOptions,
    siswaOptions,
    
    // Data
    laporanData,
    periodeInfo,
    catatanWaliKelas,
    setCatatanWaliKelas,
    
    // Loading states
    isLoading,
    isLoadingKelas,
    isLoadingSiswa,
    
    // Error states
    isNotWaliKelas,
    errorMessage,
    
    // Actions
    canGenerateReport,
    handleDownloadPDF,
  };
};

