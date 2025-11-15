import * as dashboardModel from '../../models/ortu/dashboardModel.js';

/**
 * Get profile anak dan nilai rata-rata
 */
export const getProfileAnakService = async (siswaId) => {
  try {
    // Get profile anak
    const profileData = await dashboardModel.getProfileAnak(siswaId);
    
    // Get nilai rata-rata
    const nilaiRataRata = await dashboardModel.getNilaiRataRata(siswaId);
    
    return {
      nama: profileData.nama,
      nisn: profileData.nisn,
      kelas: profileData.kelas,
      nilai_rata_rata: nilaiRataRata,
      semester: profileData.semester,
      tahun_ajaran: profileData.tahun_ajaran
    };
  } catch (error) {
    console.error('Error in getProfileAnakService:', error);
    throw error;
  }
};

/**
 * Get absensi anak hari ini
 */
export const getAbsensiHariIniService = async (siswaId) => {
  try {
    // Get absensi hari ini
    const absensiData = await dashboardModel.getAbsensiHariIni(siswaId);
    
    // Format tanggal hari ini ke DD/MM/YYYY
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const tanggalFormatted = `${day}/${month}/${year}`;
    
    // Jika belum ada absensi
    if (!absensiData) {
      // Get kelas siswa
      const kelas = await dashboardModel.getKelasSiswa(siswaId);
      
      return {
        status_absensi: 'Belum Diabsen',
        tanggal: tanggalFormatted,
        kelas: kelas || '-'
      };
    }
    
    return {
      status_absensi: absensiData.status,
      tanggal: tanggalFormatted,
      kelas: absensiData.kelas
    };
  } catch (error) {
    console.error('Error in getAbsensiHariIniService:', error);
    throw error;
  }
};

/**
 * Get catatan terbaru dari guru
 */
export const getCatatanTerbaruService = async (siswaId, limit) => {
  try {
    // Validation
    const limitNum = parseInt(limit) || 5;
    
    if (limitNum < 1 || limitNum > 20) {
      throw new Error('Limit harus antara 1-20');
    }
    
    const catatanList = await dashboardModel.getCatatanTerbaru(siswaId, limitNum);
    
    // Format response
    const formattedCatatan = catatanList.map(catatan => {
      // Format tanggal ke DD/MM/YYYY
      const tanggal = new Date(catatan.created_at);
      const day = String(tanggal.getDate()).padStart(2, '0');
      const month = String(tanggal.getMonth() + 1).padStart(2, '0');
      const year = tanggal.getFullYear();
      const tanggalFormatted = `${day}/${month}/${year}`;
      
      // Truncate catatan jika > 100 karakter
      let catatanText = catatan.catatan || '';
      if (catatanText.length > 100) {
        catatanText = catatanText.substring(0, 97) + '...';
      }
      
      return {
        id: catatan.id,
        guru_nama: catatan.guru_nama,
        mata_pelajaran: catatan.mata_pelajaran || null,
        catatan: catatanText,
        tanggal: tanggalFormatted
      };
    });
    
    return formattedCatatan;
  } catch (error) {
    console.error('Error in getCatatanTerbaruService:', error);
    throw error;
  }
};

/**
 * Helper function to get singkatan mapel
 */
const getSingkatanMapel = (namaMapel) => {
  const singkatanMap = {
    'Matematika': 'MTK',
    'Bahasa Indonesia': 'B. Indo',
    'Ilmu Pengetahuan Alam': 'IPA',
    'Ilmu Pengetahuan Sosial': 'IPS',
    'Pendidikan Kewarganegaraan': 'PKN',
    'Pendidikan Jasmani Olahraga dan Kesehatan': 'PJOK',
    'Seni Budaya': 'Seni',
    'Prakarya': 'Prakarya',
    'Bahasa Inggris': 'B. Ing',
    'Bahasa Jawa': 'B. Jawa'
  };
  
  // Return singkatan if exists, otherwise truncate to 10 chars
  return singkatanMap[namaMapel] || namaMapel.substring(0, 10);
};

/**
 * Get nilai per mata pelajaran untuk bar chart
 */
export const getNilaiPerMapelService = async (siswaId) => {
  try {
    const nilaiList = await dashboardModel.getNilaiPerMapel(siswaId);
    
    if (nilaiList.length === 0) {
      return {
        data: [],
        semester: null,
        tahun_ajaran: null
      };
    }
    
    // Format response
    const formattedNilai = nilaiList.map(nilai => {
      return {
        mapel: getSingkatanMapel(nilai.nama_mapel),
        nama_lengkap: nilai.nama_mapel,
        nilai: parseFloat(nilai.nilai_akhir) || 0
      };
    });
    
    return {
      data: formattedNilai,
      semester: nilaiList[0].semester,
      tahun_ajaran: nilaiList[0].tahun
    };
  } catch (error) {
    console.error('Error in getNilaiPerMapelService:', error);
    throw error;
  }
};

export default {
  getProfileAnakService,
  getAbsensiHariIniService,
  getCatatanTerbaruService,
  getNilaiPerMapelService
};

