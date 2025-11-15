/**
 * Dashboard Service - API calls for Guru Dashboard
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// GET /api/guru/dashboard/statistik-siswa
const getStatistikSiswa = async () => {
    const res = await axios.get(
        `${API_URL}/guru/dashboard/statistik-siswa`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

// GET /api/guru/dashboard/peringkat-siswa
const getPeringkatSiswa = async (page = 1, perPage = 10) => {
    const res = await axios.get(
        `${API_URL}/guru/dashboard/peringkat-siswa`,
        {
            params: { page, per_page: perPage },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

// GET /api/guru/dashboard/mata-pelajaran
const getMataPelajaran = async () => {
    const res = await axios.get(
        `${API_URL}/guru/dashboard/mata-pelajaran`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

// GET /api/guru/dashboard/nilai-per-mapel
const getNilaiPerMapel = async (mapelId, page = 1, perPage = 10, kelasId = null) => {
    const params = { 
        mapel_id: mapelId, 
        page, 
        per_page: perPage 
    };
    
    // Add kelas_id only if provided (for Guru Mapel with multiple kelas)
    if (kelasId !== null) {
        params.kelas_id = kelasId;
    }
    
    const res = await axios.get(
        `${API_URL}/guru/dashboard/nilai-per-mapel`,
        {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

// GET /api/guru/dashboard/kehadiran-kelas
const getKehadiranKelas = async () => {
    const res = await axios.get(
        `${API_URL}/guru/dashboard/kehadiran-kelas`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

// GET /api/guru/dashboard/kehadiran-hari-ini
const getKehadiranHariIni = async (kelasId = null) => {
    const params = kelasId ? { kelas_id: kelasId } : {};
    const res = await axios.get(
        `${API_URL}/guru/dashboard/kehadiran-hari-ini`,
        {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

// GET /api/guru/dashboard/catatan-terbaru
const getCatatanTerbaru = async (limit = 6) => {
    const res = await axios.get(
        `${API_URL}/guru/dashboard/catatan-terbaru`,
        {
            params: { limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        }
    );
    return res.data;
};

const DashboardService = {
    getStatistikSiswa,
    getPeringkatSiswa,
    getMataPelajaran,
    getNilaiPerMapel,
    getKehadiranKelas,
    getKehadiranHariIni,
    getCatatanTerbaru,
};

export default DashboardService;

