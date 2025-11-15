import axios from "axios";
import { API_URL } from "../../api";

export const DashboardService = {
    // GET /api/admin/dashboard/summary - Get summary statistics
    getSummary: async () => {
        const res = await axios.get(`${API_URL}/admin/dashboard/summary`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/admin/dashboard/siswa-gender - Get siswa gender distribution
    getSiswaGender: async () => {
        const res = await axios.get(`${API_URL}/admin/dashboard/siswa-gender`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/admin/dashboard/siswa-per-kelas - Get siswa per kelas
    getSiswaPerKelas: async () => {
        const res = await axios.get(`${API_URL}/admin/dashboard/siswa-per-kelas`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },
};
