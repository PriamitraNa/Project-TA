import axios from "axios";
import { API_URL } from "../../api";

export const KelasService = {
    getDropdownTahunAjaran: async () => {
        const res = await axios.get(`${API_URL}/admin/kelas/dropdown/tahun-ajaran`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/kelas/daftar
    getDaftarKelas: async (params = {}) => {
        const { tahun_ajaran_id, page = 1, limit = 10 } = params;
        
        const res = await axios.get(`${API_URL}/admin/kelas/daftar`, {
            params: { tahun_ajaran_id, page, limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/kelas/dropdown/wali-kelas
    getDropdownWaliKelas: async (tahun_ajaran_id = null, exclude_kelas_id = null) => {
        const params = {};
        if (tahun_ajaran_id) params.tahun_ajaran_id = tahun_ajaran_id;
        if (exclude_kelas_id) params.exclude_kelas_id = exclude_kelas_id;
        
        const res = await axios.get(`${API_URL}/admin/kelas/dropdown/wali-kelas`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/kelas/dropdown/current-selection
    getCurrentSelection: async (tahun_ajaran_id = null) => {
        const params = tahun_ajaran_id ? { tahun_ajaran_id } : {};
        
        const res = await axios.get(`${API_URL}/admin/kelas/dropdown/current-selection`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/kelas/tambah
    tambahKelas: async (data) => {
        const res = await axios.post(`${API_URL}/admin/kelas/tambah`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
        });
        return res.data;
    },

    // PUT /api/kelas/edit/:id
    editKelas: async (id, data) => {
        const res = await axios.put(`${API_URL}/admin/kelas/edit/${id}`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
        });
        return res.data;
    },

    // PUT /api/kelas/:id/update
    updateKelas: async (id, data) => {
        const res = await axios.put(`${API_URL}/admin/kelas/${id}/update`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
        });
        return res.data;
    },

    // GET /api/kelas/:id/detail
    getDetailKelas: async (id) => {
        const res = await axios.get(`${API_URL}/admin/kelas/${id}/detail`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // DELETE /api/kelas/:id
    deleteKelas: async (id) => {
        const res = await axios.delete(`${API_URL}/admin/kelas/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // DELETE /api/kelas/:id/delete
    deleteKelasWithValidation: async (id) => {
        const res = await axios.delete(`${API_URL}/admin/kelas/${id}/delete`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/kelas/:id/info
    getInfoKelas: async (id) => {
        const res = await axios.get(`${API_URL}/admin/kelas/${id}/info`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/kelas/:id/siswa
    getDaftarSiswaKelas: async (id, tahunAjaranId = null, page = 1, limit = 20) => {
        const params = {};
        if (tahunAjaranId) params.tahun_ajaran_id = tahunAjaranId;
        if (page && page > 1) params.page = page;
        if (limit && limit !== 20) params.limit = limit;
        
        const res = await axios.get(`${API_URL}/admin/kelas/${id}/siswa`, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/siswa/search
    searchSiswa: async (query, tahunAjaranId, limit = 20, signal = null) => {
        const res = await axios.get(`${API_URL}/admin/kelas/siswa/search`, {
            params: { 
                q: query, 
                tahun_ajaran_id: tahunAjaranId, 
                limit 
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            signal: signal,
        });
        return res.data;
    },

    // GET /api/siswa/available
    getAvailableSiswa: async (tahunAjaranId, page = 1, limit = 50, signal = null) => {
        const res = await axios.get(`${API_URL}/admin/kelas/siswa/available`, {
            params: { 
                tahun_ajaran_id: tahunAjaranId, 
                page, 
                limit 
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            signal: signal,
        });
        return res.data;
    },

    // POST /api/kelas/:id/siswa/tambah-bulk
    bulkTambahSiswa: async (kelasId, siswaIds, tahunAjaranId) => {
        const res = await axios.post(`${API_URL}/admin/kelas/${kelasId}/siswa/tambah-bulk`, {
            siswa_ids: siswaIds,
            tahun_ajaran_id: tahunAjaranId
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    },

    // DELETE /api/kelas/:id/siswa/:siswa_id/hapus
    hapusSiswaDariKelas: async (kelasId, siswaId, tahunAjaranId) => {
        const res = await axios.delete(`${API_URL}/admin/kelas/${kelasId}/siswa/${siswaId}/hapus`, {
            params: {
                tahun_ajaran_id: tahunAjaranId
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        return res.data;
    },

    // GET /api/kelas/dropdown
    getDropdownKelas: async (params = {}) => {
        const { tahun_ajaran_id, exclude_kelas_id } = params;
        
        const queryParams = {};
        if (tahun_ajaran_id) queryParams.tahun_ajaran_id = tahun_ajaran_id;
        if (exclude_kelas_id) queryParams.exclude_kelas_id = exclude_kelas_id;
        
        const res = await axios.get(`${API_URL}/admin/kelas/dropdown`, {
            params: queryParams,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        return res.data;
    },

    // GET /api/kelas/:id/naik-kelas/info
    getNaikKelasInfo: async (kelasId) => {
        const res = await axios.get(`${API_URL}/admin/kelas/${kelasId}/naik-kelas/info`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        return res.data;
    },

    // POST /api/kelas/:id/naik-kelas/execute
    executeNaikKelas: async (kelasId, data) => {
        const res = await axios.post(`${API_URL}/admin/kelas/${kelasId}/naik-kelas/execute`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    },

    // GET /api/kelas/:id/mata-pelajaran
    getDaftarMataPelajaran: async (kelasId, params = {}) => {
        const { tahun_ajaran_id, page = 1, limit = 20 } = params;
        
        const queryParams = { page, limit };
        if (tahun_ajaran_id) queryParams.tahun_ajaran_id = tahun_ajaran_id;
        
        const res = await axios.get(`${API_URL}/admin/kelas/${kelasId}/mata-pelajaran`, {
            params: queryParams,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/kelas/mata-pelajaran/dropdown
    getDropdownMataPelajaran: async (params = {}) => {
        const { kelas_id, tahun_ajaran_id } = params;
        
        const queryParams = {};
        if (kelas_id) queryParams.kelas_id = kelas_id;
        if (tahun_ajaran_id) queryParams.tahun_ajaran_id = tahun_ajaran_id;
        
        const res = await axios.get(`${API_URL}/admin/kelas/mata-pelajaran/dropdown`, {
            params: queryParams,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/kelas/guru/dropdown
    getDropdownGuru: async () => {
        const res = await axios.get(`${API_URL}/admin/kelas/guru/dropdown`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/kelas/:id/mata-pelajaran/tambah
    tambahMataPelajaranKeKelas: async (kelasId, data) => {
        const { mapel_id, guru_id, tahun_ajaran_id } = data;
        
        const res = await axios.post(`${API_URL}/admin/kelas/${kelasId}/mata-pelajaran/tambah`, {
            mapel_id,
            guru_id,
            tahun_ajaran_id
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
        });
        return res.data;
    },

    // POST /api/kelas/mata-pelajaran/tambah
    tambahMataPelajaranBaru: async (data) => {
        const { nama_mapel } = data;
        
        const res = await axios.post(`${API_URL}/admin/kelas/mata-pelajaran/tambah`, {
            nama_mapel
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
        });
        return res.data;
    },

    // GET /api/guru/dropdown-edit
    getDropdownGuruEdit: async (excludeGuruId) => {
        const res = await axios.get(`${API_URL}/admin/kelas/guru/dropdown-edit`, {
            params: { exclude_guru_id: excludeGuruId },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/kelas/:id/mata-pelajaran/:mapel_id/detail
    getDetailMataPelajaran: async (kelasId, mapelId) => {
        const res = await axios.get(`${API_URL}/admin/kelas/${kelasId}/mata-pelajaran/${mapelId}/detail`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // GET /api/kelas/:id/mata-pelajaran/dropdown-edit
    getDropdownMataPelajaranEdit: async (kelasId, params = {}) => {
        const { tahun_ajaran_id, exclude_mapel_id } = params;
        const queryParams = {};
        if (tahun_ajaran_id) queryParams.tahun_ajaran_id = tahun_ajaran_id;
        if (exclude_mapel_id) queryParams.exclude_mapel_id = exclude_mapel_id;
        const res = await axios.get(`${API_URL}/admin/kelas/${kelasId}/mata-pelajaran/dropdown-edit`, {
            params: queryParams,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // PUT /api/kelas/:id/mata-pelajaran/:mapel_id/update
    updateMataPelajaran: async (kelasId, mapelId, data) => {
        const { mapel_id, guru_id, tahun_ajaran_id } = data;
        const res = await axios.put(`${API_URL}/admin/kelas/${kelasId}/mata-pelajaran/${mapelId}/update`, {
            mapel_id,
            guru_id,
            tahun_ajaran_id
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
        });
        return res.data;
    },

    // DELETE /api/kelas/:id/mata-pelajaran/:mapel_id/hapus
    hapusMataPelajaran: async (kelasId, mapelId) => {
        const res = await axios.delete(`${API_URL}/admin/kelas/${kelasId}/mata-pelajaran/${mapelId}/hapus`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },
};
