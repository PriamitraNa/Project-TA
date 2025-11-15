/**
 * Dashboard Ortu Service - API calls for Ortu Dashboard
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// GET /api/ortu/dashboard/profile-anak
const getProfileAnak = async () => {
    const res = await axios.get(
        `${API_URL}/ortu/dashboard/profile-anak`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

// GET /api/ortu/dashboard/absensi-hari-ini
const getAbsensiHariIni = async () => {
    const res = await axios.get(
        `${API_URL}/ortu/dashboard/absensi-hari-ini`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

// GET /api/ortu/dashboard/catatan-terbaru
const getCatatanTerbaru = async (limit = 5) => {
    const res = await axios.get(
        `${API_URL}/ortu/dashboard/catatan-terbaru`,
        {
            params: { limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

// GET /api/ortu/dashboard/nilai-per-mapel
const getNilaiPerMapel = async () => {
    const res = await axios.get(
        `${API_URL}/ortu/dashboard/nilai-per-mapel`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

const DashboardService = {
    getProfileAnak,
    getAbsensiHariIni,
    getCatatanTerbaru,
    getNilaiPerMapel,
};

export default DashboardService;

