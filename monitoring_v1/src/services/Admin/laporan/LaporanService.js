import axios from "axios";
import { API_URL } from "../../api";

export const LaporanService = {
  /**
   * GET /api/admin/laporan/siswa
   * Mengambil daftar siswa yang sudah memiliki data nilai untuk dropdown filter
   */
  getSiswaList: async () => {
    const res = await axios.get(`${API_URL}/admin/laporan/siswa`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  /**
   * GET /api/admin/laporan/transkrip/:siswa_id
   * Mengambil transkrip nilai lengkap siswa (semua semester)
   */
  getTranskripNilai: async (siswa_id) => {
    const res = await axios.get(`${API_URL}/admin/laporan/transkrip/${siswa_id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  /**
   * GET /api/admin/laporan/transkrip/:siswa_id/pdf
   * Download transkrip nilai dalam format PDF
   */
  downloadTranskripPDF: async (siswa_id) => {
    const res = await axios.get(`${API_URL}/admin/laporan/transkrip/${siswa_id}/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      responseType: 'blob', // Important for PDF download
    });
    return res;
  },
};
