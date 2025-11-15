import axios from "axios";
import { API_URL } from "../../api";

const NilaiService = {
  /**
   * Get list of tahun ajaran yang pernah diikuti siswa
   * GET /api/ortu/nilai/tahun-ajaran
   */
  getTahunAjaran: async () => {
    const response = await axios.get(`${API_URL}/ortu/nilai/tahun-ajaran`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return response.data;
  },

  /**
   * Get list of semester untuk tahun ajaran tertentu
   * GET /api/ortu/nilai/semester?tahun_ajaran_id={id}
   */
  getSemester: async (tahunAjaranId) => {
    const response = await axios.get(`${API_URL}/ortu/nilai/semester`, {
      params: { tahun_ajaran_id: tahunAjaranId },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return response.data;
  },

  /**
   * Get detail nilai per mata pelajaran
   * GET /api/ortu/nilai?tahun_ajaran_id={id}&semester={semester}
   */
  getNilai: async (tahunAjaranId, semester) => {
    const response = await axios.get(`${API_URL}/ortu/nilai`, {
      params: {
        tahun_ajaran_id: tahunAjaranId,
        semester: semester,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return response.data;
  },
};

export default NilaiService;

