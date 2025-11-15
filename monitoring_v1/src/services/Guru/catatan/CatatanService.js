import axios from "axios";
import { API_URL } from "../../api";

export const CatatanService = {
    // GET /api/guru/catatan - Get daftar catatan with pagination, filter, search
    getCatatan: async (params = {}) => {
        const res = await axios.get(`${API_URL}/guru/catatan`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/catatan/statistik - Get statistik catatan for summary cards
    getStatistik: async () => {
        const res = await axios.get(`${API_URL}/guru/catatan/statistik`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/catatan/kelas - Get daftar kelas yang diampu guru (untuk dropdown)
    getKelas: async () => {
        const res = await axios.get(`${API_URL}/guru/catatan/kelas`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/catatan/siswa - Get daftar siswa by kelas (untuk dropdown)
    getSiswa: async (kelasId) => {
        const res = await axios.get(`${API_URL}/guru/catatan/siswa`, {
            params: { kelas_id: kelasId },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/catatan/mata-pelajaran - Get daftar mata pelajaran yang diampu di kelas tertentu
    getMataPelajaran: async (kelasId) => {
        const res = await axios.get(`${API_URL}/guru/catatan/mata-pelajaran`, {
            params: { kelas_id: kelasId },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/guru/catatan - Create catatan baru
    create: async (data) => {
        const res = await axios.post(
            `${API_URL}/guru/catatan`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return res.data;
    },

    // GET /api/guru/catatan/{id} - Get detail catatan with replies
    getById: async (id) => {
        const res = await axios.get(`${API_URL}/guru/catatan/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/catatan/{id}/edit - Get catatan data untuk populate edit form
    getForEdit: async (id) => {
        const res = await axios.get(`${API_URL}/guru/catatan/${id}/edit`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/guru/catatan/{id}/reply - Add reply to catatan
    addReply: async (id, pesan) => {
        const res = await axios.post(
            `${API_URL}/guru/catatan/${id}/reply`,
            { pesan },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return res.data;
    },

    // PUT /api/guru/catatan/{id} - Update catatan (15 min time limit)
    update: async (id, data) => {
        const res = await axios.put(
            `${API_URL}/guru/catatan/${id}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return res.data;
    },

    // DELETE /api/guru/catatan/{id} - Delete catatan (15 min time limit)
    delete: async (id) => {
        const res = await axios.delete(`${API_URL}/guru/catatan/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    }
};

