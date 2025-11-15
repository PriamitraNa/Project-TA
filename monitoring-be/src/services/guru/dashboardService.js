import * as dashboardModel from '../../models/guru/dashboardModel.js';

/**
 * Get statistik siswa yang diampu guru (bedakan wali kelas vs guru mapel)
 */
export const getStatistikSiswaService = async (guruId) => {
  try {
    // Check if guru is wali kelas
    const waliKelasInfo = await dashboardModel.checkIsWaliKelas(guruId);
    
    if (waliKelasInfo) {
      // Wali Kelas: hanya siswa di kelasnya
      const statistik = await dashboardModel.getStatistikSiswaWaliKelas(waliKelasInfo.kelas_id);
      return statistik;
    } else {
      // Guru Mapel: siswa dari semua kelas yang diajar
      const statistik = await dashboardModel.getStatistikSiswaGuruMapel(guruId);
      return statistik;
    }
  } catch (error) {
    console.error('Error in getStatistikSiswaService:', error);
    throw error;
  }
};

/**
 * Get peringkat siswa berdasarkan rata-rata nilai (WALI KELAS ONLY)
 */
export const getPeringkatSiswaService = async (guruId, page, perPage) => {
  try {
    // Check if guru is wali kelas
    const waliKelasInfo = await dashboardModel.checkIsWaliKelas(guruId);
    
    if (!waliKelasInfo) {
      throw new Error('Fitur Peringkat Siswa hanya tersedia untuk Wali Kelas');
    }
    
    // Validation
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 10;
    
    if (pageNum < 1) {
      throw new Error('Page harus lebih besar dari 0');
    }
    
    if (perPageNum < 1 || perPageNum > 100) {
      throw new Error('Per page harus antara 1-100');
    }
    
    const peringkat = await dashboardModel.getPeringkatSiswa(waliKelasInfo.kelas_id, pageNum, perPageNum);
    return peringkat;
  } catch (error) {
    console.error('Error in getPeringkatSiswaService:', error);
    throw error;
  }
};

/**
 * Get mata pelajaran yang diampu guru (dengan kelas name untuk guru mapel)
 */
export const getMataPelajaranService = async (guruId) => {
  try {
    // Check if guru is wali kelas
    const waliKelasInfo = await dashboardModel.checkIsWaliKelas(guruId);
    
    let mapelList;
    
    if (waliKelasInfo) {
      // Wali Kelas: semua mapel di kelasnya
      mapelList = await dashboardModel.getMataPelajaranWaliKelas(waliKelasInfo.kelas_id);
    } else {
      // Guru Mapel: mapel yang dia ajar (split per kelas)
      const mapelListRaw = await dashboardModel.getMataPelajaranGuruMapel(guruId);
      
      // Format: "Matematika (5A)" sebagai item terpisah dari "Matematika (5B)"
      mapelList = mapelListRaw.map(item => ({
        mapel_id: item.mapel_id,
        kelas_id: item.kelas_id,
        nama_mapel: `${item.nama_mapel} (${item.nama_kelas})`
      }));
    }
    
    // Check if guru mengampu mata pelajaran
    if (mapelList.length === 0) {
      throw new Error('Anda tidak mengampu mata pelajaran apapun');
    }
    
    return mapelList;
  } catch (error) {
    console.error('Error in getMataPelajaranService:', error);
    throw error;
  }
};

/**
 * Get nilai siswa per mata pelajaran (dengan authorization check)
 */
export const getNilaiPerMapelService = async (guruId, mapelId, page, perPage) => {
  try {
    // Validation
    if (!mapelId) {
      throw new Error('Parameter mapel_id wajib diisi');
    }
    
    const mapelIdNum = parseInt(mapelId);
    if (isNaN(mapelIdNum) || mapelIdNum < 1) {
      throw new Error('Parameter mapel_id harus berupa angka positif');
    }
    
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 10;
    
    if (pageNum < 1) {
      throw new Error('Page harus lebih besar dari 0');
    }
    
    if (perPageNum < 1 || perPageNum > 100) {
      throw new Error('Per page harus antara 1-100');
    }
    
    // Check if mapel exists
    const mapelInfo = await dashboardModel.getMapelById(mapelIdNum);
    if (!mapelInfo) {
      throw new Error('Mata pelajaran tidak ditemukan');
    }
    
    // Check if guru is wali kelas
    const waliKelasInfo = await dashboardModel.checkIsWaliKelas(guruId);
    
    let nilaiData;
    
    if (waliKelasInfo) {
      // Wali Kelas: Check apakah mapel ada di kelasnya
      const hasMapel = await dashboardModel.checkWaliKelasHasMapel(waliKelasInfo.kelas_id, mapelIdNum);
      if (!hasMapel) {
        throw new Error('Mata pelajaran tidak ada di kelas Anda');
      }
      
      // Get nilai data untuk wali kelas
      nilaiData = await dashboardModel.getNilaiPerMapelWaliKelas(waliKelasInfo.kelas_id, mapelIdNum, pageNum, perPageNum);
    } else {
      // Guru Mapel: Check apakah guru mengampu mapel ini
      const mengampu = await dashboardModel.checkGuruMengampuMapel(guruId, mapelIdNum);
      if (!mengampu) {
        throw new Error('Anda tidak mengampu mata pelajaran ini');
      }
      
      // Get nilai data untuk guru mapel
      nilaiData = await dashboardModel.getNilaiPerMapelGuruMapel(guruId, mapelIdNum, pageNum, perPageNum);
    }
    
    return {
      siswa: nilaiData.siswa,
      mata_pelajaran: {
        id: mapelInfo.id,
        nama: mapelInfo.nama_mapel
      },
      pagination: nilaiData.pagination
    };
  } catch (error) {
    console.error('Error in getNilaiPerMapelService:', error);
    throw error;
  }
};

/**
 * Get kehadiran kelas dropdown (untuk guru mapel) atau info wali kelas
 */
export const getKehadiranKelasService = async (guruId) => {
  try {
    // Check if guru is wali kelas
    const waliKelasInfo = await dashboardModel.checkIsWaliKelas(guruId);
    
    if (waliKelasInfo) {
      // Wali Kelas: return info kelas
      return {
        is_wali_kelas: true,
        kelas_id: waliKelasInfo.kelas_id,
        nama_kelas: waliKelasInfo.nama_kelas
      };
    } else {
      // Guru Mapel: return daftar kelas
      const kelasList = await dashboardModel.getKelasListGuruMapel(guruId);
      return {
        is_wali_kelas: false,
        kelas_list: kelasList
      };
    }
  } catch (error) {
    console.error('Error in getKehadiranKelasService:', error);
    throw error;
  }
};

/**
 * Get kehadiran siswa hari ini (dengan kelas_id param untuk guru mapel)
 */
export const getKehadiranHariIniService = async (guruId, kelasId) => {
  try {
    // Check if guru is wali kelas
    const waliKelasInfo = await dashboardModel.checkIsWaliKelas(guruId);
    
    let kehadiranData;
    
    if (waliKelasInfo) {
      // Wali Kelas: Ignore kelasId parameter, use their class
      kehadiranData = await dashboardModel.getKehadiranHariIniWaliKelas(waliKelasInfo.kelas_id);
    } else {
      // Guru Mapel: kelas_id is REQUIRED
      if (!kelasId) {
        throw new Error('Parameter kelas_id wajib diisi untuk Guru Mapel');
      }
      
      const kelasIdNum = parseInt(kelasId);
      if (isNaN(kelasIdNum) || kelasIdNum < 1) {
        throw new Error('Parameter kelas_id harus berupa angka positif');
      }
      
      // Check authorization: Apakah guru mengajar di kelas ini?
      const mengajar = await dashboardModel.checkGuruMengajarDiKelas(guruId, kelasIdNum);
      if (!mengajar) {
        throw new Error('Anda tidak mengajar di kelas ini');
      }
      
      kehadiranData = await dashboardModel.getKehadiranHariIniGuruMapel(kelasIdNum);
    }
    
    // Format tanggal ke DD/MM/YYYY
    const tanggal = new Date(kehadiranData.tanggal);
    const day = String(tanggal.getDate()).padStart(2, '0');
    const month = String(tanggal.getMonth() + 1).padStart(2, '0');
    const year = tanggal.getFullYear();
    const tanggalFormatted = `${day}/${month}/${year}`;
    
    // Format response untuk pie chart
    return {
      tanggal: tanggalFormatted,
      kelas: kehadiranData.kelas,
      kehadiran: [
        {
          name: 'Hadir',
          value: parseInt(kehadiranData.hadir) || 0
        },
        {
          name: 'Sakit',
          value: parseInt(kehadiranData.sakit) || 0
        },
        {
          name: 'Izin',
          value: parseInt(kehadiranData.izin) || 0
        },
        {
          name: 'Alpha',
          value: parseInt(kehadiranData.alpha) || 0
        }
      ],
      total_siswa: parseInt(kehadiranData.total_siswa) || 0
    };
  } catch (error) {
    console.error('Error in getKehadiranHariIniService:', error);
    throw error;
  }
};

/**
 * Get catatan terbaru (berbeda untuk Guru Mapel vs Wali Kelas)
 */
export const getCatatanTerbaruService = async (guruId, limit) => {
  try {
    // Validation
    const limitNum = parseInt(limit) || 6;
    
    if (limitNum < 1 || limitNum > 50) {
      throw new Error('Limit harus antara 1-50');
    }
    
    // Check if guru is wali kelas
    const waliKelasInfo = await dashboardModel.checkIsWaliKelas(guruId);
    
    let catatanList;
    
    if (waliKelasInfo) {
      // Wali Kelas: Lihat SEMUA catatan di kelasnya (termasuk dari guru lain)
      catatanList = await dashboardModel.getCatatanTerbaruWaliKelas(waliKelasInfo.kelas_id, limitNum);
    } else {
      // Guru Mapel: Hanya lihat catatan yang dia buat
      catatanList = await dashboardModel.getCatatanTerbaruGuruMapel(guruId, limitNum);
    }
    
    // Format response
    const formattedCatatan = catatanList.map(catatan => {
      // Format tanggal ke DD/MM/YYYY
      const tanggal = new Date(catatan.created_at);
      const day = String(tanggal.getDate()).padStart(2, '0');
      const month = String(tanggal.getMonth() + 1).padStart(2, '0');
      const year = tanggal.getFullYear();
      const tanggalFormatted = `${day}/${month}/${year}`;
      
      // Truncate catatan jika > 60 karakter
      let catatanText = catatan.catatan || '';
      if (catatanText.length > 60) {
        catatanText = catatanText.substring(0, 60) + '...';
      }
      
      const result = {
        id: catatan.id,
        nama_siswa: catatan.nama_siswa,
        kelas: catatan.kelas,
        catatan: catatanText,
        tanggal: tanggalFormatted
      };
      
      // Wali Kelas: Tambah info guru pembuat catatan
      if (waliKelasInfo && catatan.nama_guru) {
        result.nama_guru = catatan.nama_guru;
      }
      
      return result;
    });
    
    return formattedCatatan;
  } catch (error) {
    console.error('Error in getCatatanTerbaruService:', error);
    throw error;
  }
};

export default {
  getStatistikSiswaService,
  getPeringkatSiswaService,
  getMataPelajaranService,
  getNilaiPerMapelService,
  getKehadiranKelasService,
  getKehadiranHariIniService,
  getCatatanTerbaruService
};

