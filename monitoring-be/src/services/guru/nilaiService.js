import * as nilaiModel from '../../models/guru/nilaiModel.js';

/**
 * Get daftar kelas yang diampu guru
 */
export const getKelasDropdownService = async (guruId) => {
  try {
    const kelasList = await nilaiModel.getKelasByGuru(guruId);
    
    return kelasList;
  } catch (error) {
    console.error('Error in getKelasDropdownService:', error);
    throw error;
  }
};

/**
 * Get daftar mata pelajaran yang diampu guru di kelas tertentu
 */
export const getMapelDropdownService = async (guruId, kelasId) => {
  try {
    // Validate kelas_id
    if (!kelasId) {
      throw new Error('Parameter kelas_id wajib diisi');
    }

    const mapelList = await nilaiModel.getMapelByGuruAndKelas(guruId, kelasId);
    
    // Check if guru mengajar di kelas ini
    if (mapelList.length === 0) {
      throw new Error('Anda tidak mengampu mata pelajaran di kelas ini');
    }

    return mapelList;
  } catch (error) {
    console.error('Error in getMapelDropdownService:', error);
    throw error;
  }
};

/**
 * Get tahun ajaran dan semester aktif
 */
export const getTahunAjaranAktifService = async () => {
  try {
    const tahunAjaran = await nilaiModel.getTahunAjaranAktif();
    
    if (!tahunAjaran) {
      throw new Error('Tidak ada tahun ajaran aktif');
    }

    return tahunAjaran;
  } catch (error) {
    console.error('Error in getTahunAjaranAktifService:', error);
    throw error;
  }
};

/**
 * Get daftar siswa beserta nilai-nilai mereka
 */
export const getSiswaWithNilaiService = async (guruId, kelasId, mapelId, tahunAjaranId, semester) => {
  try {
    // Validate required parameters
    if (!kelasId || !mapelId) {
      throw new Error('Parameter kelas_id dan mapel_id wajib diisi');
    }

    // Get tahun ajaran aktif if not provided
    let finalTahunAjaranId = tahunAjaranId;
    let finalSemester = semester;
    
    if (!finalTahunAjaranId || !finalSemester) {
      const tahunAjaran = await nilaiModel.getTahunAjaranAktif();
      if (!tahunAjaran) {
        throw new Error('Tidak ada tahun ajaran aktif');
      }
      finalTahunAjaranId = tahunAjaran.tahun_ajaran_id;
      finalSemester = tahunAjaran.semester;
    }

    // Verify guru mengajar di kelas & mapel ini
    const mapelList = await nilaiModel.getMapelByGuruAndKelas(guruId, kelasId);
    const isAuthorized = mapelList.some(m => m.mapel_id == mapelId);
    
    if (!isAuthorized) {
      throw new Error('Anda tidak memiliki akses untuk kelas/mapel ini');
    }

    // Get kelas info
    const kelasInfo = await nilaiModel.getKelasById(kelasId);
    if (!kelasInfo) {
      throw new Error('Kelas tidak ditemukan');
    }

    // Get mapel info
    const mapelInfo = await nilaiModel.getMapelById(mapelId);
    if (!mapelInfo) {
      throw new Error('Mata pelajaran tidak ditemukan');
    }

    // Get tahun ajaran info
    const tahunAjaranInfo = await nilaiModel.getTahunAjaranAktif();

    // Get siswa with nilai
    const siswaList = await nilaiModel.getSiswaWithNilai(
      kelasId, 
      mapelId, 
      finalTahunAjaranId, 
      finalSemester
    );

    if (siswaList.length === 0) {
      throw new Error('Tidak ada siswa di kelas ini');
    }

    // Format response
    return {
      kelas: kelasInfo,
      mapel: mapelInfo,
      tahun_ajaran: {
        tahun_ajaran_id: tahunAjaranInfo.tahun_ajaran_id,
        nama_tahun_ajaran: tahunAjaranInfo.nama_tahun_ajaran,
        semester: tahunAjaranInfo.semester
      },
      siswa: siswaList
    };
  } catch (error) {
    console.error('Error in getSiswaWithNilaiService:', error);
    throw error;
  }
};

/**
 * Whitelist of valid nilai field names (SECURITY: Prevent SQL injection)
 */
const VALID_NILAI_FIELDS = [
  // Formatif (20 fields)
  'lm1_tp1', 'lm1_tp2', 'lm1_tp3', 'lm1_tp4',
  'lm2_tp1', 'lm2_tp2', 'lm2_tp3', 'lm2_tp4',
  'lm3_tp1', 'lm3_tp2', 'lm3_tp3', 'lm3_tp4',
  'lm4_tp1', 'lm4_tp2', 'lm4_tp3', 'lm4_tp4',
  'lm5_tp1', 'lm5_tp2', 'lm5_tp3', 'lm5_tp4',
  // Sumatif LM (5 fields)
  'lm1_ulangan', 'lm2_ulangan', 'lm3_ulangan', 'lm4_ulangan', 'lm5_ulangan',
  // UTS & UAS (2 fields)
  'uts', 'uas'
];

/**
 * Save single nilai cell (auto-save)
 */
export const simpanCellService = async (guruId, userId, data) => {
  try {
    const { siswa_id, kelas_id, mapel_id, tahun_ajaran_id, semester, field, nilai } = data;

    // 1. Validate required fields
    if (!siswa_id || !kelas_id || !mapel_id || !tahun_ajaran_id || !semester || !field) {
      throw new Error('Semua field wajib diisi');
    }

    // 2. Validate field name (whitelist - SECURITY)
    if (!VALID_NILAI_FIELDS.includes(field)) {
      throw new Error('Field tidak valid');
    }

    // 3. Validate semester
    if (!['Ganjil', 'Genap'].includes(semester)) {
      throw new Error("Semester harus 'Ganjil' atau 'Genap'");
    }

    // 4. Validate nilai (0-100 or null)
    if (nilai !== null && nilai !== '') {
      const nilaiNum = Number(nilai);
      if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
        throw new Error('Nilai harus antara 0-100');
      }
    }

    // Convert empty string to null
    const finalNilai = (nilai === '' || nilai === null) ? null : Number(nilai);

    // 5. Authorization: Verify guru mengajar di kelas & mapel ini
    const mapelList = await nilaiModel.getMapelByGuruAndKelas(guruId, kelas_id);
    const isAuthorized = mapelList.some(m => m.mapel_id == mapel_id);
    
    if (!isAuthorized) {
      throw new Error('Anda tidak memiliki akses untuk kelas/mapel ini');
    }

    // 6. Save to database (UPSERT)
    const result = await nilaiModel.simpanCell({
      siswa_id,
      kelas_id,
      mapel_id,
      tahun_ajaran_id,
      semester,
      field,
      nilai: finalNilai,
      updated_by: userId
    });

    return {
      siswa_id,
      field,
      nilai: finalNilai,
      action: result.action,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in simpanCellService:', error);
    throw error;
  }
};

export default {
  getKelasDropdownService,
  getMapelDropdownService,
  getTahunAjaranAktifService,
  getSiswaWithNilaiService,
  simpanCellService
};

