import axios from "axios";
import { API_URL } from "../../api";

/**
 * Service untuk API Guru - Nilai (Input Nilai Siswa)
 * Base URL: /api/guru/nilai
 */
export const NilaiService = {
  /**
   * 1. Get daftar kelas yang diampu guru
   * GET /api/guru/nilai/kelas
   */
  getKelas: async () => {
    const res = await axios.get(`${API_URL}/guru/nilai/kelas`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  /**
   * 2. Get daftar mata pelajaran yang diampu guru di kelas tertentu (cascading)
   * GET /api/guru/nilai/mata-pelajaran?kelas_id=X
   */
  getMataPelajaran: async (kelasId) => {
    const res = await axios.get(`${API_URL}/guru/nilai/mata-pelajaran`, {
      params: { kelas_id: kelasId },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  /**
   * 3. Get info tahun ajaran dan semester aktif
   * GET /api/guru/nilai/tahun-ajaran-aktif
   */
  getTahunAjaranAktif: async () => {
    const res = await axios.get(`${API_URL}/guru/nilai/tahun-ajaran-aktif`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  /**
   * 4. Get daftar siswa beserta nilai-nilai mereka
   * GET /api/guru/nilai/siswa?kelas_id=X&mapel_id=Y
   */
  getSiswa: async (kelasId, mapelId, tahunAjaranId = null, semester = null) => {
    const params = {
      kelas_id: kelasId,
      mapel_id: mapelId,
    };

    // Optional parameters
    if (tahunAjaranId) params.tahun_ajaran_id = tahunAjaranId;
    if (semester) params.semester = semester;

    const res = await axios.get(`${API_URL}/guru/nilai/siswa`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  /**
   * 5. Save single cell nilai (auto-save)
   * POST /api/guru/nilai/simpan-cell
   */
  saveSingleCell: async (data) => {
    const res = await axios.post(`${API_URL}/guru/nilai/simpan-cell`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

};

