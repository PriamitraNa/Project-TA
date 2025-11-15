import catatanModel from '../../models/guru/catatanModel.js';

/**
 * Helper function to generate preview (50-60 chars)
 */
const generatePreview = (isiCatatan) => {
  if (!isiCatatan) return '';
  if (isiCatatan.length <= 60) {
    return isiCatatan;
  }
  return isiCatatan.substring(0, 57) + '...';
};

/**
 * Helper function to check if can edit/delete (15 minutes time limit)
 */
const canEditOrDelete = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMinutes = (now - created) / (1000 * 60);
  
  return diffInMinutes <= 15;
};

/**
 * Get daftar catatan dengan pagination, filter, dan search
 */
export const getCatatanListService = async (guruId, filters) => {
  try {
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan');
    }

    // Validate pagination params
    const page = parseInt(filters.page) || 1;
    const per_page = parseInt(filters.per_page) || 10;

    if (page < 1) {
      throw new Error('Page harus lebih besar dari 0');
    }

    if (per_page < 1 || per_page > 100) {
      throw new Error('Per page harus antara 1 dan 100');
    }

    // Validate kategori if provided
    if (filters.kategori) {
      const validKategori = ['Positif', 'Negatif', 'Netral'];
      if (!validKategori.includes(filters.kategori)) {
        throw new Error('Kategori tidak valid');
      }
    }

    // Validate jenis if provided
    if (filters.jenis) {
      const validJenis = ['Akademik', 'Perilaku', 'Kehadiran', 'Prestasi', 'Lainnya'];
      if (!validJenis.includes(filters.jenis)) {
        throw new Error('Jenis tidak valid');
      }
    }

    // Validate sort_order if provided
    if (filters.sort_order) {
      const validSortOrder = ['asc', 'desc'];
      if (!validSortOrder.includes(filters.sort_order.toLowerCase())) {
        throw new Error('Sort order harus asc atau desc');
      }
    }

    // Get catatan from database
    const result = await catatanModel.getCatatanList(guruId, {
      page,
      per_page,
      search: filters.search || '',
      kategori: filters.kategori || '',
      jenis: filters.jenis || '',
      sort_by: filters.sort_by || 'created_at',
      sort_order: filters.sort_order || 'desc'
    });

    // Format response
    const formattedCatatan = result.data.map(catatan => ({
      id: catatan.id,
      tanggal: catatan.tanggal,
      siswa_id: catatan.siswa_id,
      siswa_nama: catatan.siswa_nama,
      kelas_id: catatan.kelas_id,
      kelas: catatan.kelas,
      kategori: catatan.kategori,
      jenis: catatan.jenis,
      mata_pelajaran: catatan.mata_pelajaran || null,
      isi_preview: generatePreview(catatan.isi_catatan),
      status: catatan.status,
      created_at: catatan.created_at,
      can_edit: canEditOrDelete(catatan.created_at),
      can_delete: canEditOrDelete(catatan.created_at)
    }));

    // Calculate pagination
    const total = result.total;
    const total_pages = Math.ceil(total / per_page);

    return {
      catatan: formattedCatatan,
      pagination: {
        current_page: page,
        per_page: per_page,
        total: total,
        total_pages: total_pages
      }
    };
  } catch (error) {
    console.error('Error in getCatatanListService:', error);
    throw error;
  }
};

/**
 * Get daftar kelas yang diampu guru (untuk dropdown)
 */
export const getKelasDropdownService = async (guruId) => {
  try {
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan');
    }

    const kelasList = await catatanModel.getKelasByGuru(guruId);

    if (!kelasList || kelasList.length === 0) {
      throw new Error('Anda tidak mengampu kelas apapun');
    }

    // Format response
    const formattedKelas = kelasList.map(kelas => ({
      kelas_id: kelas.kelas_id,
      nama_kelas: kelas.nama_kelas,
      total_siswa: Number(kelas.total_siswa) || 0
    }));

    return formattedKelas;
  } catch (error) {
    console.error('Error in getKelasDropdownService:', error);
    throw error;
  }
};

/**
 * Get daftar siswa berdasarkan kelas (untuk dropdown)
 */
export const getSiswaDropdownService = async (kelasId) => {
  try {
    // Validate kelas_id
    if (!kelasId) {
      throw new Error('Parameter kelas_id wajib diisi');
    }

    const kelasIdNum = parseInt(kelasId);
    if (isNaN(kelasIdNum) || kelasIdNum < 1) {
      throw new Error('Parameter kelas_id tidak valid');
    }

    const siswaList = await catatanModel.getSiswaByKelas(kelasIdNum);

    if (!siswaList || siswaList.length === 0) {
      throw new Error('Tidak ada siswa di kelas ini');
    }

    // Format response
    const formattedSiswa = siswaList.map(siswa => ({
      siswa_id: siswa.siswa_id,
      nama_lengkap: siswa.nama_lengkap,
      nisn: siswa.nisn,
      kelas: siswa.kelas
    }));

    return formattedSiswa;
  } catch (error) {
    console.error('Error in getSiswaDropdownService:', error);
    throw error;
  }
};

/**
 * Get daftar mata pelajaran yang diampu guru di kelas tertentu (untuk dropdown)
 * UPDATED: Cascading dropdown - filter by kelas_id
 */
export const getMapelDropdownService = async (guruId, kelasId) => {
  try {
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan');
    }

    // Validate kelas_id
    if (!kelasId) {
      throw new Error('Parameter kelas_id wajib diisi');
    }

    const kelasIdNum = parseInt(kelasId);
    if (isNaN(kelasIdNum) || kelasIdNum < 1) {
      throw new Error('Parameter kelas_id tidak valid');
    }

    const mapelList = await catatanModel.getMapelByGuruAndKelas(guruId, kelasIdNum);

    if (!mapelList || mapelList.length === 0) {
      throw new Error('Anda tidak mengampu mata pelajaran di kelas ini');
    }

    // Format response
    const formattedMapel = mapelList.map(mapel => ({
      mapel_id: mapel.mapel_id,
      nama_mapel: mapel.nama_mapel
    }));

    return formattedMapel;
  } catch (error) {
    console.error('Error in getMapelDropdownService:', error);
    throw error;
  }
};

/**
 * Create catatan baru
 */
export const createCatatanService = async (guruId, userId, catatanData) => {
  try {
    // Validate required fields
    const { siswa_id, kelas_id, kategori, jenis, isi_catatan } = catatanData;

    if (!siswa_id) {
      throw new Error('Siswa harus dipilih');
    }
    if (!kelas_id) {
      throw new Error('Kelas harus dipilih');
    }
    if (!kategori) {
      throw new Error('Kategori harus dipilih');
    }
    if (!jenis) {
      throw new Error('Jenis catatan harus dipilih');
    }
    if (!isi_catatan || isi_catatan.trim().length < 10) {
      throw new Error('Isi catatan minimal 10 karakter');
    }

    // Validate kategori
    const validKategori = ['Positif', 'Negatif', 'Netral'];
    if (!validKategori.includes(kategori)) {
      throw new Error('Kategori tidak valid');
    }

    // Validate jenis
    const validJenis = ['Akademik', 'Perilaku', 'Kehadiran', 'Prestasi', 'Lainnya'];
    if (!validJenis.includes(jenis)) {
      throw new Error('Jenis catatan tidak valid');
    }

    // Get orangtua_id dari siswa
    const orangtuaId = await catatanModel.getOrangtuaBySiswa(siswa_id);
    if (!orangtuaId) {
      throw new Error('Orangtua siswa tidak ditemukan');
    }

    // Prepare data for insert
    const insertData = {
      guru_id: guruId,
      user_id: userId, // User ID untuk pengirim_id di catatan_detail
      orangtua_id: orangtuaId,
      siswa_id,
      kategori,
      jenis,
      kelas_id,
      mapel_id: catatanData.mapel_id || null, // Optional
      isi_catatan: isi_catatan.trim()
    };

    // Create catatan (transaction-based)
    const result = await catatanModel.createCatatan(insertData);

    // Get created catatan details for response
    const createdCatatan = await catatanModel.getCatatanById(result.header_id);

    return {
      id: result.header_id,
      siswa_id: createdCatatan.siswa_id,
      siswa_nama: createdCatatan.siswa_nama,
      tanggal: createdCatatan.tanggal,
      kategori: createdCatatan.kategori,
      jenis: createdCatatan.jenis,
      isi_catatan: createdCatatan.isi_catatan,
      status: createdCatatan.status
    };
  } catch (error) {
    console.error('Error in createCatatanService:', error);
    throw error;
  }
};

/**
 * Get statistik catatan guru
 */
export const getCatatanStatistikService = async (guruId) => {
  try {
    if (!guruId) {
      throw new Error('Guru ID tidak ditemukan');
    }

    const statistik = await catatanModel.getCatatanStatistik(guruId);

    return {
      total: Number(statistik.total) || 0,
      positif: Number(statistik.positif) || 0,
      negatif: Number(statistik.negatif) || 0,
      netral: Number(statistik.netral) || 0
    };
  } catch (error) {
    console.error('Error in getCatatanStatistikService:', error);
    throw error;
  }
};

/**
 * Get catatan detail by ID dengan semua replies
 */
export const getCatatanDetailService = async (catatanId, userId, userRole) => {
  try {
    // Get catatan header
    const catatan = await catatanModel.getCatatanDetail(catatanId);
    
    if (!catatan) {
      throw new Error('Catatan tidak ditemukan');
    }

    // Get all replies
    const replies = await catatanModel.getCatatanReplies(catatanId);

    // Auto-update status jika diakses oleh orangtua
    if (userRole === 'ortu' && catatan.status === 'Terkirim') {
      await catatanModel.updateCatatanStatus(catatanId);
      catatan.status = 'Dibaca';
    }

    // Format replies
    const formattedReplies = replies.map((reply) => ({
      id: reply.id,
      pengirim: {
        id: reply.pengirim_id,
        nama: reply.pengirim_nama,
        role: reply.pengirim_role === 'guru' ? 'Guru' : 'Orangtua'
      },
      pesan: reply.pesan,
      tanggal: reply.tanggal,
      timestamp: reply.raw_created_at
    }));

    return {
      id: catatan.id,
      siswa: {
        id: catatan.siswa_id,
        nama: catatan.siswa_nama,
        nisn: catatan.nisn
      },
      kelas: {
        id: catatan.kelas_id,
        nama: catatan.nama_kelas
      },
      mata_pelajaran: catatan.mapel_id ? {
        id: catatan.mapel_id,
        nama: catatan.nama_mapel
      } : null,
      kategori: catatan.kategori,
      jenis: catatan.jenis,
      status: catatan.status,
      tanggal: catatan.tanggal, // Format: DD/MM/YYYY HH:mm
      timestamp: catatan.raw_created_at, // ISO format untuk frontend parsing
      total_pesan: formattedReplies.length,
      diskusi: formattedReplies
    };
  } catch (error) {
    console.error('Error in getCatatanDetailService:', error);
    throw error;
  }
};

/**
 * Add reply to catatan
 */
export const addCatatanReplyService = async (catatanId, userId, replyData) => {
  try {
    const { pesan } = replyData;

    // Validate pesan
    if (!pesan || typeof pesan !== 'string') {
      throw new Error('Pesan harus diisi');
    }

    const trimmedPesan = pesan.trim();
    if (trimmedPesan.length === 0) {
      throw new Error('Pesan tidak boleh kosong');
    }

    // Verify catatan exists
    const catatan = await catatanModel.verifyCatatanExists(catatanId);
    if (!catatan) {
      throw new Error('Catatan tidak ditemukan');
    }

    // Add reply
    const result = await catatanModel.addCatatanReply(catatanId, userId, trimmedPesan);

    // Get updated catatan detail (with new reply)
    const updatedCatatan = await catatanModel.getCatatanDetail(catatanId);
    const updatedReplies = await catatanModel.getCatatanReplies(catatanId);

    // Format response
    const formattedReplies = updatedReplies.map((reply) => ({
      id: reply.id,
      pengirim: {
        id: reply.pengirim_id,
        nama: reply.pengirim_nama,
        role: reply.pengirim_role === 'guru' ? 'Guru' : 'Orangtua'
      },
      pesan: reply.pesan,
      tanggal: reply.tanggal,
      timestamp: reply.raw_created_at
    }));

    return {
      reply_id: result.reply_id,
      message: 'Balasan berhasil ditambahkan',
      catatan: {
        id: updatedCatatan.id,
        status: updatedCatatan.status,
        total_pesan: formattedReplies.length,
        diskusi: formattedReplies
      }
    };
  } catch (error) {
    console.error('Error in addCatatanReplyService:', error);
    throw error;
  }
};

/**
 * Get catatan for edit form
 */
export const getCatatanForEditService = async (catatanId, guruId) => {
  try {
    const catatan = await catatanModel.getCatatanForEdit(catatanId, guruId);
    
    if (!catatan) {
      throw new Error('Catatan tidak ditemukan atau Anda tidak memiliki akses');
    }

    return {
      id: catatan.id,
      siswa_id: catatan.siswa_id,
      kategori: catatan.kategori,
      jenis: catatan.jenis,
      kelas_id: catatan.kelas_id,
      mapel_id: catatan.mapel_id,
      isi_catatan: catatan.isi_catatan,
      can_edit: catatan.minutes_elapsed <= 15
    };
  } catch (error) {
    console.error('Error in getCatatanForEditService:', error);
    throw error;
  }
};

/**
 * Update catatan (with 15-minute time limit)
 */
export const updateCatatanService = async (catatanId, guruId, updateData) => {
  try {
    const { kategori, jenis, kelas_id, isi_catatan, mapel_id } = updateData;

    // Validate required fields
    if (!kategori || !jenis || !kelas_id || !isi_catatan) {
      throw new Error('Semua field harus diisi');
    }

    // Validate kategori
    const validKategori = ['Positif', 'Negatif', 'Netral'];
    if (!validKategori.includes(kategori)) {
      throw new Error('Kategori tidak valid');
    }

    // Validate jenis
    const validJenis = ['Akademik', 'Perilaku', 'Kehadiran', 'Prestasi', 'Lainnya'];
    if (!validJenis.includes(jenis)) {
      throw new Error('Jenis catatan tidak valid');
    }

    // Validate isi_catatan
    if (isi_catatan.trim().length < 10) {
      throw new Error('Isi catatan minimal 10 karakter');
    }

    // Get catatan with time check
    const catatan = await catatanModel.getCatatanForEdit(catatanId, guruId);
    
    if (!catatan) {
      throw new Error('Catatan tidak ditemukan atau Anda tidak memiliki akses');
    }

    // Check 15-minute time limit
    if (catatan.minutes_elapsed > 15) {
      throw new Error('Waktu edit sudah habis. Catatan hanya dapat diedit dalam 15 menit setelah dibuat');
    }

    // Update catatan
    await catatanModel.updateCatatan(catatanId, {
      kategori,
      jenis,
      kelas_id,
      mapel_id: mapel_id || null,
      isi_catatan: isi_catatan.trim()
    });

    // Get updated catatan
    const updatedCatatan = await catatanModel.getCatatanById(catatanId);

    return {
      id: updatedCatatan.id,
      siswa_id: updatedCatatan.siswa_id,
      siswa_nama: updatedCatatan.siswa_nama,
      kategori: updatedCatatan.kategori,
      jenis: updatedCatatan.jenis,
      isi_catatan: updatedCatatan.isi_catatan,
      status: updatedCatatan.status,
      tanggal: updatedCatatan.tanggal
    };
  } catch (error) {
    console.error('Error in updateCatatanService:', error);
    throw error;
  }
};

/**
 * Delete catatan (with 15-minute time limit)
 */
export const deleteCatatanService = async (catatanId, guruId) => {
  try {
    // Get catatan with time check
    const catatan = await catatanModel.getCatatanForEdit(catatanId, guruId);
    
    if (!catatan) {
      throw new Error('Catatan tidak ditemukan atau Anda tidak memiliki akses');
    }

    // Check 15-minute time limit
    if (catatan.minutes_elapsed > 15) {
      throw new Error('Waktu hapus sudah habis. Catatan hanya dapat dihapus dalam 15 menit setelah dibuat');
    }

    // Delete catatan
    const deleted = await catatanModel.deleteCatatan(catatanId);

    if (!deleted) {
      throw new Error('Gagal menghapus catatan');
    }

    return {
      message: 'Catatan berhasil dihapus',
      catatan_id: catatanId
    };
  } catch (error) {
    console.error('Error in deleteCatatanService:', error);
    throw error;
  }
};

export default {
  getCatatanListService,
  getCatatanStatistikService,
  getKelasDropdownService,
  getSiswaDropdownService,
  getMapelDropdownService,
  createCatatanService,
  getCatatanDetailService,
  addCatatanReplyService,
  getCatatanForEditService,
  updateCatatanService,
  deleteCatatanService
};

