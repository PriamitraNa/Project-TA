import axios from "axios";
import { API_URL } from "../../api";

export const AbsensiService = {
    // GET /api/guru/absensi/kelas-saya - Get daftar kelas yang diampu guru
    getKelasSaya: async () => {
        const res = await axios.get(`${API_URL}/guru/absensi/kelas-saya`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/absensi/siswa - Get siswa with absensi status for specific date
    getSiswaForAbsensi: async (tanggal, kelasId = null) => {
        const params = { tanggal };
        if (kelasId) {
            params.kelas_id = kelasId;
        }

        const res = await axios.get(`${API_URL}/guru/absensi/siswa`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/guru/absensi/save - Save absensi for specific date
    saveAbsensi: async (tanggal, absensiData) => {
        const res = await axios.post(
            `${API_URL}/guru/absensi/save`,
            {
                tanggal,
                absensi: absensiData,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return res.data;
    },

    // GET /api/guru/absensi/rekap - Get rekap absensi for date range
    getRekapAbsensi: async (kelasId, startDate, endDate) => {
        const params = {
            tanggal_mulai: startDate,
            tanggal_akhir: endDate
        };
        
        // Guru Mapel harus include kelas_id
        if (kelasId) {
            params.kelas_id = kelasId;
        }

        const res = await axios.get(`${API_URL}/guru/absensi/rekap`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/absensi/date-range - Get valid date range for active tahun ajaran
    getDateRange: async () => {
        const res = await axios.get(`${API_URL}/guru/absensi/date-range`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    }
};

