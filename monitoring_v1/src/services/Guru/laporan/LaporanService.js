import axios from "axios";
import { API_URL } from "../../api";

export const LaporanService = {
    // ==================== NEW: Laporan Perkembangan Siswa ====================
    
    // GET /api/guru/laporan/kelas-wali - Get kelas yang di-wali guru (untuk filter)
    getKelasWali: async () => {
        const res = await axios.get(`${API_URL}/guru/laporan/kelas-wali`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/laporan/siswa - Get daftar siswa di kelas wali
    getSiswaByKelas: async (kelasId) => {
        const res = await axios.get(`${API_URL}/guru/laporan/siswa`, {
            params: { kelas_id: kelasId },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/laporan/perkembangan - Get data lengkap perkembangan siswa
    getPerkembanganSiswa: async (siswaId) => {
        const res = await axios.get(`${API_URL}/guru/laporan/perkembangan`, {
            params: { siswa_id: siswaId },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/guru/laporan/download-perkembangan - Download PDF Laporan Perkembangan
    downloadLaporanPerkembangan: async (siswaId, catatanWaliKelas) => {
        const res = await axios.post(
            `${API_URL}/guru/laporan/download-perkembangan`,
            {
                siswa_id: siswaId,
                catatan_wali_kelas: catatanWaliKelas,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'blob',
            }
        );

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Extract filename from content-disposition header or use default
        const contentDisposition = res.headers['content-disposition'];
        let filename = 'Laporan_Perkembangan_Siswa.pdf';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return res.data;
    },

    // ==================== OLD: Legacy Endpoints (Keep for compatibility) ====================
    
    // GET /api/guru/laporan/kelas - Get daftar kelas yang diampu guru
    getKelas: async () => {
        const res = await axios.get(`${API_URL}/guru/laporan/kelas`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/laporan/mata-pelajaran - Get daftar mata pelajaran yang diampu guru
    getMataPelajaran: async (kelasId = null) => {
        const params = {};
        if (kelasId) {
            params.kelas_id = kelasId;
        }

        const res = await axios.get(`${API_URL}/guru/laporan/mata-pelajaran`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/guru/laporan/nilai - Get data rekapitulasi nilai siswa
    getNilai: async (kelasId, mapelId) => {
        const res = await axios.get(`${API_URL}/guru/laporan/nilai`, {
            params: {
                kelas_id: kelasId,
                mapel_id: mapelId,
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/guru/laporan/download-pdf - Download PDF report
    downloadPDF: async (kelasId, mapelId) => {
        const res = await axios.post(
            `${API_URL}/guru/laporan/download-pdf`,
            {
                kelas_id: kelasId,
                mapel_id: mapelId,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'blob',
            }
        );

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Extract filename from content-disposition header or use default
        const contentDisposition = res.headers['content-disposition'];
        let filename = 'Laporan_Nilai.pdf';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return res.data;
    }
};

