import axios from "axios";
import { API_URL } from "../../api";

export const TahunAjaranService = {
  // Get all tahun ajaran dengan sorting
  getAll: async (params = {}) => {
    const { sort = 'tahun', order = 'DESC' } = params;
    
    const res = await axios.get(`${API_URL}/admin/tahun-ajaran`, {
      params: { sort, order },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  // Get tahun ajaran aktif
  getAktif: async () => {
    const res = await axios.get(`${API_URL}/admin/tahun-ajaran/aktif`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  // Create tahun ajaran baru
  create: async (data) => {
    const res = await axios.post(`${API_URL}/admin/tahun-ajaran`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  // Delete tahun ajaran
  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/admin/tahun-ajaran/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },

  // Toggle status tahun ajaran (aktif ↔ tidak-aktif)
  toggleStatus: async (id) => {
    const res = await axios.patch(`${API_URL}/admin/tahun-ajaran/${id}/toggle-status`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return res.data;
  },
};
