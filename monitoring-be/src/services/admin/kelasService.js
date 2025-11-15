import { getTahunajaranKelasGuru, getDaftarKelas, getDropdownKelas, getDropdownWaliKelas, getCurrentSelection, tambahKelas, getDetailKelas, updateKelas, deleteKelas, getInfoKelas, getDaftarSiswaKelas, tambahSiswaKeKelas, searchSiswa, getAvailableSiswa, bulkTambahSiswaKeKelas, hapusSiswaDariKelas, getNaikKelasInfo, executeNaikKelas, getDaftarMataPelajaranKelas, getDropdownMataPelajaran, getDropdownGuru, getDropdownGuruEdit, tambahMataPelajaranKeKelas, tambahMataPelajaranBaru, getDetailMataPelajaranKelas, getDropdownMataPelajaranEdit, updateMataPelajaranKelas, hapusMataPelajaranKelas } from "../../models/admin/kelasModel.js";

// Service untuk dropdown tahun ajaran lengkap (gabungan)
export const getTahunajaranKelasGuruService = async () => {
  try {
    const result = await getTahunajaranKelasGuru();
    
    if (!result.tahunAjaranList || result.tahunAjaranList.length === 0) {
      return {
        status: "error",
        message: "Data tahun ajaran tidak ditemukan",
        data: null
      };
    }

    return {
      status: "success",
      message: "Data dropdown tahun ajaran berhasil diambil",
      data: {
        tahunAjaranList: result.tahunAjaranList,
        tahunAjaranAktif: result.tahunAjaranAktif
      }
    };
  } catch (error) {
    console.error("Error in getTahunajaranKelasGuruService:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data tahun ajaran",
      data: null
    };
  }
};

// Service untuk daftar kelas dengan filter dan pagination
export const getDaftarKelasService = async (tahunAjaranId, page = 1, limit = 5) => {
  try {
    // Validasi input
    if (!tahunAjaranId) {
      return {
        status: "error",
        message: "tahun_ajaran_id diperlukan",
        data: null
      };
    }

    if (page < 1) {
      return {
        status: "error",
        message: "Halaman harus lebih dari 0",
        data: null
      };
    }

    if (limit < 1 || limit > 100) {
      return {
        status: "error",
        message: "Limit harus antara 1-100",
        data: null
      };
    }

    const result = await getDaftarKelas(tahunAjaranId, page, limit);
    
    if (!result.kelas || result.kelas.length === 0) {
      return {
        status: "success",
        message: "Data kelas tidak ditemukan",
        data: {
          kelas: [],
          pagination: result.pagination
        }
      };
    }

    return {
      status: "success",
      message: "Data daftar kelas berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getDaftarKelasService:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data kelas",
      data: null
    };
  }
};

// Service untuk dropdown kelas
export const getDropdownKelasService = async (tahunAjaranId = null, excludeKelasId = null) => {
  try {
    const kelasList = await getDropdownKelas(tahunAjaranId, excludeKelasId);
    
    if (!kelasList || kelasList.length === 0) {
      let message;
      if (tahunAjaranId && excludeKelasId) {
        message = "Tidak ada kelas yang tersedia untuk tahun ajaran ini";
      } else if (tahunAjaranId) {
        message = "Tidak ada kelas untuk tahun ajaran ini";
      } else {
        message = "Data kelas tidak ditemukan";
      }
      
      return {
        status: "success",
        message: message,
        data: []
      };
    }

    return {
      status: "success",
      message: "Data dropdown kelas berhasil diambil",
      data: kelasList
    };
  } catch (error) {
    console.error("Error in getDropdownKelasService:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data kelas",
      data: null
    };
  }
};

// Service untuk dropdown wali kelas
export const getDropdownWaliKelasService = async (tahunAjaranId = null, excludeKelasId = null) => {
  try {
    const waliKelasList = await getDropdownWaliKelas(tahunAjaranId, excludeKelasId);
    
    if (!waliKelasList || waliKelasList.length === 0) {
      let message;
      if (tahunAjaranId && excludeKelasId) {
        message = "Tidak ada guru aktif yang tersedia untuk tahun ajaran ini";
      } else if (tahunAjaranId) {
        message = "Tidak ada guru aktif yang tersedia untuk tahun ajaran ini (semua guru sudah menjadi wali kelas)";
      } else {
        message = "Tidak ada guru aktif yang tersedia";
      }
      
      return {
        status: "success",
        message: message,
        data: []
      };
    }

    return {
      status: "success",
      message: "Data dropdown wali kelas berhasil diambil",
      data: waliKelasList
    };
  } catch (error) {
    console.error("Error in getDropdownWaliKelasService:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data wali kelas",
      data: null
    };
  }
};

// Service untuk current selection tahun ajaran dan semester (autofill)
export const getCurrentSelectionService = async (tahunAjaranId = null) => {
  try {
    const currentSelection = await getCurrentSelection(tahunAjaranId);
    
    if (!currentSelection) {
      const message = tahunAjaranId 
        ? "Tahun ajaran yang dipilih tidak ditemukan"
        : "Tidak ada tahun ajaran aktif";
      
      return {
        status: "error",
        message: message,
        data: null
      };
    }

    return {
      status: "success",
      message: "Data current selection berhasil diambil",
      data: currentSelection
    };
  } catch (error) {
    console.error("Error in getCurrentSelectionService:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil current selection",
      data: null
    };
  }
};

// Service untuk tambah kelas baru
export const tambahKelasService = async (namaKelas, waliKelasId, tahunAjaranId) => {
  try {
    // Validasi input
    if (!namaKelas || !waliKelasId || !tahunAjaranId) {
      return {
        status: "error",
        message: "Semua field harus diisi (nama_kelas, wali_kelas_id, tahun_ajaran_id)",
        data: null
      };
    }

    // Validasi nama kelas tidak kosong
    if (namaKelas.trim().length === 0) {
      return {
        status: "error",
        message: "Nama kelas tidak boleh kosong",
        data: null
      };
    }

    // Validasi wali_kelas_id dan tahun_ajaran_id adalah angka
    if (isNaN(waliKelasId) || isNaN(tahunAjaranId)) {
      return {
        status: "error",
        message: "wali_kelas_id dan tahun_ajaran_id harus berupa angka",
        data: null
      };
    }

    // Panggil model untuk tambah kelas
    const kelasBaru = await tambahKelas(namaKelas.trim(), parseInt(waliKelasId), parseInt(tahunAjaranId));

    return {
      status: "success",
      message: "Kelas berhasil ditambahkan",
      data: kelasBaru
    };
  } catch (error) {
    console.error("Error in tambahKelasService:", error);
    
    // Handle error khusus untuk nama kelas duplikat
    if (error.message === 'Nama kelas sudah ada untuk tahun ajaran ini') {
      return {
        status: "error",
        message: "Nama kelas sudah ada untuk tahun ajaran ini",
        data: null
      };
    }
    
    // Handle error khusus untuk wali kelas duplikat
    if (error.message.includes('Guru ini sudah menjadi wali kelas untuk kelas')) {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat menambahkan kelas",
      data: null
    };
  }
};

// Service untuk detail kelas (untuk edit)
export const getDetailKelasService = async (kelasId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "ID kelas harus berupa angka",
        data: null
      };
    }

    // Panggil model untuk get detail kelas
    const detailKelas = await getDetailKelas(parseInt(kelasId));

    if (!detailKelas) {
      return {
        status: "error",
        message: "Kelas tidak ditemukan",
        data: null
      };
    }

    return {
      status: "success",
      message: "Data detail kelas berhasil diambil",
      data: detailKelas
    };
  } catch (error) {
    console.error("Error in getDetailKelasService:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil detail kelas",
      data: null
    };
  }
};

// Service untuk update kelas
export const updateKelasService = async (kelasId, namaKelas, waliKelasId, tahunAjaranId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "ID kelas harus berupa angka",
        data: null
      };
    }

    if (!namaKelas || !waliKelasId || !tahunAjaranId) {
      return {
        status: "error",
        message: "Semua field harus diisi (nama_kelas, wali_kelas_id, tahun_ajaran_id)",
        data: null
      };
    }

    // Validasi nama kelas tidak kosong
    if (namaKelas.trim().length === 0) {
      return {
        status: "error",
        message: "Nama kelas tidak boleh kosong",
        data: null
      };
    }

    // Validasi wali_kelas_id dan tahun_ajaran_id adalah angka
    if (isNaN(waliKelasId) || isNaN(tahunAjaranId)) {
      return {
        status: "error",
        message: "wali_kelas_id dan tahun_ajaran_id harus berupa angka",
        data: null
      };
    }

    // Panggil model untuk update kelas
    const kelasUpdated = await updateKelas(parseInt(kelasId), namaKelas.trim(), parseInt(waliKelasId), parseInt(tahunAjaranId));

    return {
      status: "success",
      message: "Kelas berhasil diupdate",
      data: kelasUpdated
    };
  } catch (error) {
    console.error("Error in updateKelasService:", error);
    
    // Handle error khusus untuk nama kelas duplikat
    if (error.message === 'Nama kelas sudah ada untuk tahun ajaran ini') {
      return {
        status: "error",
        message: "Nama kelas sudah ada untuk tahun ajaran ini",
        data: null
      };
    }
    
    // Handle error khusus untuk wali kelas duplikat
    if (error.message.includes('Guru ini sudah menjadi wali kelas untuk kelas')) {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    // Handle error khusus untuk kelas tidak ditemukan
    if (error.message === 'Kelas tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas tidak ditemukan",
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat mengupdate kelas",
      data: null
    };
  }
};

// Service untuk delete kelas
export const deleteKelasService = async (kelasId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "ID kelas harus berupa angka",
        data: null
      };
    }

    // Panggil model untuk delete kelas
    const kelasDeleted = await deleteKelas(parseInt(kelasId));

    return {
      status: "success",
      message: "Kelas berhasil dihapus",
      data: kelasDeleted
    };
  } catch (error) {
    console.error("Error in deleteKelasService:", error);
    
    // Handle error khusus untuk kelas memiliki siswa
    if (error.message.includes('Kelas tidak dapat dihapus karena masih memiliki') && error.message.includes('siswa')) {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }
    
    // Handle error khusus untuk kelas memiliki mata pelajaran
    if (error.message.includes('Kelas tidak dapat dihapus karena masih memiliki') && error.message.includes('mata pelajaran')) {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    // Handle error khusus untuk kelas tidak ditemukan
    if (error.message === 'Kelas tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas tidak ditemukan",
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat menghapus kelas",
      data: null
    };
  }
};

// Service untuk info kelas (header)
export const getInfoKelasService = async (kelasId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "ID kelas harus berupa angka",
        data: null
      };
    }

    // Panggil model untuk get info kelas
    const infoKelas = await getInfoKelas(parseInt(kelasId));

    if (!infoKelas) {
      return {
        status: "error",
        message: "Kelas tidak ditemukan",
        data: null
      };
    }

    return {
      status: "success",
      message: "Data info kelas berhasil diambil",
      data: infoKelas
    };
  } catch (error) {
    console.error("Error in getInfoKelasService:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil info kelas",
      data: null
    };
  }
};

// Service untuk daftar siswa dalam kelas
export const getDaftarSiswaKelasService = async (kelasId, tahunAjaranId = null, page = 1, limit = 20) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "ID kelas harus berupa angka",
        data: null
      };
    }

    // Validasi page dan limit
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    
    if (pageNum < 1) {
      return {
        status: "error",
        message: "Halaman harus lebih dari 0",
        data: null
      };
    }
    
    if (limitNum < 1 || limitNum > 100) {
      return {
        status: "error",
        message: "Limit harus antara 1-100",
        data: null
      };
    }

    // Validasi tahun_ajaran_id jika disediakan
    let tahunAjaranIdNum = null;
    if (tahunAjaranId) {
      if (isNaN(tahunAjaranId)) {
        return {
          status: "error",
          message: "tahun_ajaran_id harus berupa angka",
          data: null
        };
      }
      tahunAjaranIdNum = parseInt(tahunAjaranId);
    }

    // Panggil model untuk get daftar siswa
    const result = await getDaftarSiswaKelas(parseInt(kelasId), tahunAjaranIdNum, pageNum, limitNum);

    return {
      status: "success",
      message: "Data daftar siswa berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getDaftarSiswaKelasService:", error);
    
    // Handle error khusus untuk kelas tidak ditemukan
    if (error.message === 'Kelas tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas tidak ditemukan",
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil daftar siswa",
      data: null
    };
  }
};

// Service untuk tambah siswa ke kelas
export const tambahSiswaKeKelasService = async (kelasId, siswaId, tahunAjaranId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "ID kelas harus berupa angka",
        data: null
      };
    }

    if (!siswaId || isNaN(siswaId)) {
      return {
        status: "error",
        message: "ID siswa harus berupa angka",
        data: null
      };
    }

    if (!tahunAjaranId || isNaN(tahunAjaranId)) {
      return {
        status: "error",
        message: "ID tahun ajaran harus berupa angka",
        data: null
      };
    }

    // Panggil model untuk tambah siswa ke kelas
    const result = await tambahSiswaKeKelas(parseInt(kelasId), parseInt(siswaId), parseInt(tahunAjaranId));

    return {
      status: "success",
      message: "Siswa berhasil ditambahkan ke kelas",
      data: result
    };
  } catch (error) {
    console.error("Error in tambahSiswaKeKelasService:", error);
    
    // Handle error khusus
    if (error.message === 'Siswa tidak ditemukan') {
      return {
        status: "error",
        message: "Siswa tidak ditemukan",
        data: null
      };
    }
    
    if (error.message === 'Kelas atau tahun ajaran tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas atau tahun ajaran tidak ditemukan",
        data: null
      };
    }
    
    if (error.message.includes('Siswa sudah terdaftar di kelas')) {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat menambahkan siswa ke kelas",
      data: null
    };
  }
};

// Service untuk search siswa
export const searchSiswaService = async (query, tahunAjaranId, limit = 20) => {
  try {
    // Validasi input
    if (!query || query.trim().length === 0) {
      return {
        status: "error",
        message: "Query pencarian tidak boleh kosong",
        data: null
      };
    }

    if (!tahunAjaranId || isNaN(tahunAjaranId)) {
      return {
        status: "error",
        message: "ID tahun ajaran harus berupa angka",
        data: null
      };
    }

    const limitNum = parseInt(limit) || 20;
    if (limitNum < 1 || limitNum > 100) {
      return {
        status: "error",
        message: "Limit harus antara 1-100",
        data: null
      };
    }

    // Panggil model untuk search siswa
    const result = await searchSiswa(query.trim(), parseInt(tahunAjaranId), limitNum);

    return {
      status: "success",
      message: "Data pencarian siswa berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in searchSiswaService:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mencari siswa",
      data: null
    };
  }
};

// Service untuk get available siswa
export const getAvailableSiswaService = async (tahunAjaranId, page = 1, limit = 50) => {
  try {
    // Validasi input
    if (!tahunAjaranId || isNaN(tahunAjaranId)) {
      return {
        status: "error",
        message: "ID tahun ajaran harus berupa angka",
        data: null
      };
    }

    // Validasi page dan limit
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    
    if (pageNum < 1) {
      return {
        status: "error",
        message: "Halaman harus lebih dari 0",
        data: null
      };
    }
    
    if (limitNum < 1 || limitNum > 100) {
      return {
        status: "error",
        message: "Limit harus antara 1-100",
        data: null
      };
    }

    // Panggil model untuk get available siswa
    const result = await getAvailableSiswa(parseInt(tahunAjaranId), pageNum, limitNum);

    return {
      status: "success",
      message: "Data siswa tersedia berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getAvailableSiswaService:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data siswa tersedia",
      data: null
    };
  }
};

// Service untuk bulk tambah siswa ke kelas
export const bulkTambahSiswaKeKelasService = async (kelasId, siswaIds, tahunAjaranId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "ID kelas harus berupa angka",
        data: null
      };
    }

    if (!siswaIds || !Array.isArray(siswaIds) || siswaIds.length === 0) {
      return {
        status: "error",
        message: "Daftar ID siswa harus berupa array dan tidak boleh kosong",
        data: null
      };
    }

    if (!tahunAjaranId || isNaN(tahunAjaranId)) {
      return {
        status: "error",
        message: "ID tahun ajaran harus berupa angka",
        data: null
      };
    }

    // Validasi setiap ID siswa
    const invalidIds = siswaIds.filter(id => !id || isNaN(id));
    if (invalidIds.length > 0) {
      return {
        status: "error",
        message: `ID siswa berikut tidak valid: ${invalidIds.join(', ')}`,
        data: null
      };
    }

    // Validasi jumlah siswa (max 50 untuk performa)
    if (siswaIds.length > 50) {
      return {
        status: "error",
        message: "Maksimal 50 siswa dapat ditambahkan sekaligus",
        data: null
      };
    }

    // Konversi ke integer
    const kelasIdNum = parseInt(kelasId);
    const tahunAjaranIdNum = parseInt(tahunAjaranId);
    const siswaIdsNum = siswaIds.map(id => parseInt(id));

    // Panggil model untuk bulk tambah siswa
    const result = await bulkTambahSiswaKeKelas(kelasIdNum, siswaIdsNum, tahunAjaranIdNum);

    return {
      status: "success",
      message: `Berhasil menambahkan ${result.summary.success} dari ${result.summary.total} siswa ke kelas`,
      data: result
    };
  } catch (error) {
    console.error("Error in bulkTambahSiswaKeKelasService:", error);
    
    // Handle error khusus
    if (error.message === 'Kelas atau tahun ajaran tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas atau tahun ajaran tidak ditemukan",
        data: null
      };
    }
    
    if (error.message.includes('Siswa dengan ID') && error.message.includes('tidak ditemukan')) {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }
    
    if (error.message.includes('Siswa berikut sudah terdaftar')) {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat menambahkan siswa ke kelas",
      data: null
    };
  }
};

// Service untuk hapus siswa dari kelas
export const hapusSiswaDariKelasService = async (kelasId, siswaId, tahunAjaranId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "ID kelas harus berupa angka",
        data: null
      };
    }

    if (!siswaId || isNaN(siswaId)) {
      return {
        status: "error",
        message: "ID siswa harus berupa angka",
        data: null
      };
    }

    if (!tahunAjaranId || isNaN(tahunAjaranId)) {
      return {
        status: "error",
        message: "ID tahun ajaran harus berupa angka",
        data: null
      };
    }

    // Konversi ke integer
    const kelasIdNum = parseInt(kelasId);
    const siswaIdNum = parseInt(siswaId);
    const tahunAjaranIdNum = parseInt(tahunAjaranId);

    // Panggil model untuk hapus siswa dari kelas
    const result = await hapusSiswaDariKelas(kelasIdNum, siswaIdNum, tahunAjaranIdNum);

    return {
      status: "success",
      message: result.message,
      data: result
    };
  } catch (error) {
    console.error("Error in hapusSiswaDariKelasService:", error);
    
    // Handle error khusus
    if (error.message === 'Siswa tidak ditemukan') {
      return {
        status: "error",
        message: "Siswa tidak ditemukan",
        data: null
      };
    }
    
    if (error.message === 'Kelas atau tahun ajaran tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas atau tahun ajaran tidak ditemukan",
        data: null
      };
    }
    
    if (error.message === 'Siswa tidak ditemukan di kelas ini') {
      return {
        status: "error",
        message: "Siswa tidak ditemukan di kelas ini",
        data: null
      };
    }
    
    if (error.message === 'Gagal menghapus siswa dari kelas') {
      return {
        status: "error",
        message: "Gagal menghapus siswa dari kelas",
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat menghapus siswa dari kelas",
      data: null
    };
  }
};

// Service untuk get info naik kelas
export const getNaikKelasInfoService = async (kelasId) => {
  try {
    // Validasi input
    if (!kelasId) {
      return {
        status: "error",
        message: "kelas_id diperlukan",
        data: null
      };
    }

    const kelasIdNum = parseInt(kelasId);

    if (isNaN(kelasIdNum)) {
      return {
        status: "error",
        message: "kelas_id harus berupa angka",
        data: null
      };
    }

    // Panggil model untuk get info naik kelas
    const result = await getNaikKelasInfo(kelasIdNum);

    // Validasi apakah tahun ajaran tujuan ditemukan
    if (!result.tahun_ajaran_tujuan) {
      return {
        status: "error",
        message: `Tahun ajaran tujuan tidak ditemukan. Silakan buat tahun ajaran ${result.kelas_asal.semester === 'Ganjil' ? result.kelas_asal.tahun + ' - Genap' : 'berikutnya - Ganjil'} terlebih dahulu.`,
        data: result
      };
    }

    return {
      status: "success",
      message: "Data info naik kelas berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getNaikKelasInfoService:", error);
    
    // Handle error khusus
    if (error.message === 'Kelas tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas tidak ditemukan",
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil info naik kelas",
      data: null
    };
  }
};

// Service untuk execute naik kelas
export const executeNaikKelasService = async (kelasAsalId, kelasTujuanId, tahunAjaranTujuanId, siswaIds) => {
  try {
    // Validasi input
    if (!kelasAsalId) {
      return {
        status: "error",
        message: "kelas_asal_id diperlukan",
        data: null
      };
    }

    if (!kelasTujuanId) {
      return {
        status: "error",
        message: "kelas_tujuan_id diperlukan",
        data: null
      };
    }

    if (!tahunAjaranTujuanId) {
      return {
        status: "error",
        message: "tahun_ajaran_tujuan_id diperlukan",
        data: null
      };
    }

    if (!siswaIds || !Array.isArray(siswaIds) || siswaIds.length === 0) {
      return {
        status: "error",
        message: "siswa_ids harus berupa array dan tidak boleh kosong",
        data: null
      };
    }

    // Validasi maksimal siswa per request
    if (siswaIds.length > 100) {
      return {
        status: "error",
        message: "Maksimal 100 siswa per request",
        data: null
      };
    }

    // Validasi semua siswa_ids adalah number
    const invalidIds = siswaIds.filter(id => isNaN(parseInt(id)));
    if (invalidIds.length > 0) {
      return {
        status: "error",
        message: "Semua siswa_ids harus berupa angka",
        data: null
      };
    }

    // Convert ke integer
    const kelasAsalIdNum = parseInt(kelasAsalId);
    const kelasTujuanIdNum = parseInt(kelasTujuanId);
    const tahunAjaranTujuanIdNum = parseInt(tahunAjaranTujuanId);
    const siswaIdsNum = siswaIds.map(id => parseInt(id));

    // Panggil model untuk execute naik kelas
    const result = await executeNaikKelas(kelasAsalIdNum, kelasTujuanIdNum, tahunAjaranTujuanIdNum, siswaIdsNum);

    return {
      status: "success",
      message: `Berhasil menaikkan ${result.summary.berhasil} siswa dari ${result.summary.kelas_asal} ke ${result.summary.kelas_tujuan}`,
      data: result
    };
  } catch (error) {
    console.error("Error in executeNaikKelasService:", error);
    
    // Handle error khusus
    if (error.message === 'Kelas asal tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas asal tidak ditemukan",
        data: null
      };
    }
    
    if (error.message === 'Kelas tujuan atau tahun ajaran tujuan tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas tujuan atau tahun ajaran tujuan tidak ditemukan",
        data: null
      };
    }
    
    if (error.message === 'Beberapa siswa tidak ditemukan') {
      return {
        status: "error",
        message: "Beberapa siswa tidak ditemukan",
        data: null
      };
    }
    
    if (error.message.includes('tidak terdaftar di kelas asal')) {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }
    
    if (error.message.includes('sudah terdaftar di kelas')) {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat menaikkan siswa ke kelas baru",
      data: null
    };
  }
};

// Service untuk get daftar mata pelajaran kelas
export const getDaftarMataPelajaranKelasService = async (kelasId, tahunAjaranId = null, page = 1, limit = 20) => {
  try {
    // Validasi input
    if (!kelasId) {
      return {
        status: "error",
        message: "kelas_id diperlukan",
        data: null
      };
    }

    // Validasi kelas_id adalah number
    if (isNaN(parseInt(kelasId))) {
      return {
        status: "error",
        message: "kelas_id harus berupa angka",
        data: null
      };
    }

    // Validasi tahun_ajaran_id jika ada
    if (tahunAjaranId && isNaN(parseInt(tahunAjaranId))) {
      return {
        status: "error",
        message: "tahun_ajaran_id harus berupa angka",
        data: null
      };
    }

    // Validasi page
    if (isNaN(parseInt(page)) || parseInt(page) < 1) {
      return {
        status: "error",
        message: "page harus berupa angka positif",
        data: null
      };
    }

    // Validasi limit
    if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100) {
      return {
        status: "error",
        message: "limit harus berupa angka antara 1-100",
        data: null
      };
    }

    // Convert ke integer
    const kelasIdNum = parseInt(kelasId);
    const tahunAjaranIdNum = tahunAjaranId ? parseInt(tahunAjaranId) : null;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Panggil model
    const result = await getDaftarMataPelajaranKelas(kelasIdNum, tahunAjaranIdNum, pageNum, limitNum);

    return {
      status: "success",
      message: "Data mata pelajaran berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getDaftarMataPelajaranKelasService:", error);
    
    // Handle error khusus
    if (error.message === 'Kelas tidak ditemukan') {
      return {
        status: "error",
        message: "Kelas tidak ditemukan",
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data mata pelajaran",
      data: null
    };
  }
};

// Service untuk get dropdown mata pelajaran
export const getDropdownMataPelajaranService = async (kelasId = null, tahunAjaranId = null) => {
  try {
    // Validasi input jika ada
    if (kelasId && isNaN(parseInt(kelasId))) {
      return {
        status: "error",
        message: "kelas_id harus berupa angka",
        data: null
      };
    }

    if (tahunAjaranId && isNaN(parseInt(tahunAjaranId))) {
      return {
        status: "error",
        message: "tahun_ajaran_id harus berupa angka",
        data: null
      };
    }

    // Convert ke integer jika ada
    const kelasIdNum = kelasId ? parseInt(kelasId) : null;
    const tahunAjaranIdNum = tahunAjaranId ? parseInt(tahunAjaranId) : null;

    // Panggil model
    const result = await getDropdownMataPelajaran(kelasIdNum, tahunAjaranIdNum);

    return {
      status: "success",
      message: "Data dropdown mata pelajaran berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getDropdownMataPelajaranService:", error);
    
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data dropdown mata pelajaran",
      data: null
    };
  }
};

// Service untuk get dropdown guru
export const getDropdownGuruService = async () => {
  try {
    // Panggil model
    const result = await getDropdownGuru();

    return {
      status: "success",
      message: "Data dropdown guru berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getDropdownGuruService:", error);
    
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data dropdown guru",
      data: null
    };
  }
};

// Service untuk get dropdown guru untuk edit (include guru yang sedang diedit)
export const getDropdownGuruEditService = async (excludeGuruId) => {
  try {
    // Validasi input
    if (!excludeGuruId || isNaN(excludeGuruId)) {
      return {
        status: "error",
        message: "exclude_guru_id harus berupa angka",
        data: null
      };
    }

    // Panggil model
    const result = await getDropdownGuruEdit(excludeGuruId);

    return {
      status: "success",
      message: "Data dropdown guru untuk edit berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getDropdownGuruEditService:", error);
    
    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil data dropdown guru untuk edit",
      data: null
    };
  }
};

// Service untuk tambah mata pelajaran ke kelas
export const tambahMataPelajaranKeKelasService = async (kelasId, mapelId, guruId, tahunAjaranId) => {
  try {
    // Validasi input
    if (!kelasId) {
      return {
        status: "error",
        message: "kelas_id diperlukan",
        data: null
      };
    }

    if (!mapelId) {
      return {
        status: "error",
        message: "mapel_id diperlukan",
        data: null
      };
    }

    if (!guruId) {
      return {
        status: "error",
        message: "guru_id diperlukan",
        data: null
      };
    }

    if (!tahunAjaranId) {
      return {
        status: "error",
        message: "tahun_ajaran_id diperlukan",
        data: null
      };
    }

    // Validasi semua input adalah number
    if (isNaN(parseInt(kelasId)) || isNaN(parseInt(mapelId)) || isNaN(parseInt(guruId)) || isNaN(parseInt(tahunAjaranId))) {
      return {
        status: "error",
        message: "Semua ID harus berupa angka",
        data: null
      };
    }

    // Convert ke integer
    const kelasIdNum = parseInt(kelasId);
    const mapelIdNum = parseInt(mapelId);
    const guruIdNum = parseInt(guruId);
    const tahunAjaranIdNum = parseInt(tahunAjaranId);

    // Panggil model
    const result = await tambahMataPelajaranKeKelas(kelasIdNum, mapelIdNum, guruIdNum, tahunAjaranIdNum);

    return {
      status: "success",
      message: "Mata pelajaran berhasil ditambahkan ke kelas",
      data: result
    };
  } catch (error) {
    console.error("Error in tambahMataPelajaranKeKelasService:", error);
    
    // Handle error khusus
    if (error.message === 'Mata pelajaran sudah terdaftar di kelas ini untuk tahun ajaran yang sama') {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat menambahkan mata pelajaran ke kelas",
      data: null
    };
  }
};

// Service untuk tambah mata pelajaran baru ke master
export const tambahMataPelajaranBaruService = async (namaMapel) => {
  try {
    // Validasi input
    if (!namaMapel) {
      return {
        status: "error",
        message: "nama_mapel diperlukan",
        data: null
      };
    }

    if (typeof namaMapel !== 'string' || namaMapel.trim().length === 0) {
      return {
        status: "error",
        message: "nama_mapel harus berupa string dan tidak boleh kosong",
        data: null
      };
    }

    // Trim dan validasi panjang
    const namaMapelTrimmed = namaMapel.trim();
    if (namaMapelTrimmed.length < 2) {
      return {
        status: "error",
        message: "nama_mapel minimal 2 karakter",
        data: null
      };
    }

    if (namaMapelTrimmed.length > 50) {
      return {
        status: "error",
        message: "nama_mapel maksimal 50 karakter",
        data: null
      };
    }

    // Panggil model
    const result = await tambahMataPelajaranBaru(namaMapelTrimmed);

    return {
      status: "success",
      message: "Mata pelajaran baru berhasil ditambahkan ke data master",
      data: result
    };
  } catch (error) {
    console.error("Error in tambahMataPelajaranBaruService:", error);
    
    // Handle error khusus
    if (error.message === 'Mata pelajaran dengan nama ini sudah ada') {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat menambahkan mata pelajaran baru",
      data: null
    };
  }
};

// Service untuk get detail mata pelajaran untuk edit
export const getDetailMataPelajaranKelasService = async (kelasId, mapelId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "kelas_id harus berupa angka",
        data: null
      };
    }

    if (!mapelId || isNaN(mapelId)) {
      return {
        status: "error",
        message: "mapel_id harus berupa angka",
        data: null
      };
    }

    // Panggil model
    const result = await getDetailMataPelajaranKelas(kelasId, mapelId);

    return {
      status: "success",
      message: "Detail mata pelajaran berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getDetailMataPelajaranKelasService:", error);
    
    // Handle error khusus
    if (error.message === 'Mata pelajaran tidak ditemukan di kelas ini') {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil detail mata pelajaran",
      data: null
    };
  }
};

// Service untuk get dropdown mata pelajaran untuk edit
export const getDropdownMataPelajaranEditService = async (kelasId, tahunAjaranId, excludeMapelId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "kelas_id harus berupa angka",
        data: null
      };
    }

    if (!tahunAjaranId || isNaN(tahunAjaranId)) {
      return {
        status: "error",
        message: "tahun_ajaran_id harus berupa angka",
        data: null
      };
    }

    if (!excludeMapelId || isNaN(excludeMapelId)) {
      return {
        status: "error",
        message: "exclude_mapel_id harus berupa angka",
        data: null
      };
    }

    // Panggil model
    const result = await getDropdownMataPelajaranEdit(kelasId, tahunAjaranId, excludeMapelId);

    return {
      status: "success",
      message: "Dropdown mata pelajaran untuk edit berhasil diambil",
      data: result
    };
  } catch (error) {
    console.error("Error in getDropdownMataPelajaranEditService:", error);

    return {
      status: "error",
      message: "Terjadi kesalahan saat mengambil dropdown mata pelajaran untuk edit",
      data: null
    };
  }
};

// Service untuk update mata pelajaran di kelas
export const updateMataPelajaranKelasService = async (kelasId, mapelId, newMapelId, guruId, tahunAjaranId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "kelas_id harus berupa angka",
        data: null
      };
    }

    if (!mapelId || isNaN(mapelId)) {
      return {
        status: "error",
        message: "mapel_id harus berupa angka",
        data: null
      };
    }

    if (!newMapelId || isNaN(newMapelId)) {
      return {
        status: "error",
        message: "new_mapel_id harus berupa angka",
        data: null
      };
    }

    if (!guruId || isNaN(guruId)) {
      return {
        status: "error",
        message: "guru_id harus berupa angka",
        data: null
      };
    }

    if (!tahunAjaranId || isNaN(tahunAjaranId)) {
      return {
        status: "error",
        message: "tahun_ajaran_id harus berupa angka",
        data: null
      };
    }

    // Panggil model
    const result = await updateMataPelajaranKelas(kelasId, mapelId, newMapelId, guruId, tahunAjaranId);

    return {
      status: "success",
      message: "Mata pelajaran berhasil diperbarui",
      data: result
    };
  } catch (error) {
    console.error("Error in updateMataPelajaranKelasService:", error);
    
    // Handle error khusus
    if (error.message === 'Mata pelajaran ini sudah ada di kelas ini') {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    if (error.message === 'Mata pelajaran tidak ditemukan di kelas ini') {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat memperbarui mata pelajaran",
      data: null
    };
  }
};

// Service untuk hapus mata pelajaran dari kelas
export const hapusMataPelajaranKelasService = async (kelasId, mapelId) => {
  try {
    // Validasi input
    if (!kelasId || isNaN(kelasId)) {
      return {
        status: "error",
        message: "kelas_id harus berupa angka",
        data: null
      };
    }

    if (!mapelId || isNaN(mapelId)) {
      return {
        status: "error",
        message: "mapel_id harus berupa angka",
        data: null
      };
    }

    // Panggil model
    const result = await hapusMataPelajaranKelas(kelasId, mapelId);

    return {
      status: "success",
      message: result.message,
      data: result
    };
  } catch (error) {
    console.error("Error in hapusMataPelajaranKelasService:", error);
    
    // Handle error khusus
    if (error.message === 'Mata pelajaran tidak ditemukan di kelas ini') {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    if (error.message === 'Gagal menghapus mata pelajaran dari kelas') {
      return {
        status: "error",
        message: error.message,
        data: null
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan saat menghapus mata pelajaran",
      data: null
    };
  }
};
