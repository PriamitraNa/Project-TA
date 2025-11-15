import axios from "axios";
import { API_URL } from "../../api";

export const SiswaService = {
    // GET /api/admin/siswa - Get all students with pagination, search, filter, and sorting
    getAll: async (params = {}) => {
        const { page = 1, limit = 10, search = '', jenis_kelamin = '', sort_by = 'nisn', sort_order = 'asc' } = params;
        
        const queryParams = { page, limit, sort_by, sort_order };
        if (search) queryParams.search = search;
        if (jenis_kelamin) queryParams.jenis_kelamin = jenis_kelamin;
        
        const res = await axios.get(`${API_URL}/admin/siswa`, {
            params: queryParams,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

        // POST /api/admin/siswa/bulk - Create multiple students at once
        bulkCreate: async (siswaData) => {
            const res = await axios.post(`${API_URL}/admin/siswa/bulk`, {
                siswa: siswaData
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
            });
            return res.data;
        },

        // POST /api/admin/siswa/check - Check if NISN or NIK exists
        checkSingle: async (nisn, nik) => {
            const res = await axios.post(`${API_URL}/admin/siswa/check`, {
                nisn: nisn || null,
                nik: nik || null
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
            });
            return res.data;
        },

        // POST /api/admin/siswa/check-multiple - Check multiple NISN and NIK
        checkMultiple: async (nisnList, nikList) => {
            const res = await axios.post(`${API_URL}/admin/siswa/check-multiple`, {
                nisn_list: nisnList,
                nik_list: nikList
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
            });
            return res.data;
        },

        // PUT /api/admin/siswa/:id - Update student data
        update: async (id, siswaData) => {
            const res = await axios.put(`${API_URL}/admin/siswa/${id}`, siswaData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
            });
            return res.data;
        },

        // DELETE /api/admin/siswa/:id - Delete student data
        delete: async (id) => {
            const res = await axios.delete(`${API_URL}/admin/siswa/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            return res.data;
        },

        // GET /api/admin/siswa/:id - Get single student detail
        getById: async (id) => {
            const res = await axios.get(`${API_URL}/admin/siswa/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            return res.data;
        },

        // POST /api/admin/siswa/check-with-exclude - Check NISN/NIK with exclude (for edit)
        checkWithExclude: async (nisn, nik, excludeId) => {
            const res = await axios.post(`${API_URL}/admin/siswa/check-with-exclude`, {
                nisn: nisn || null,
                nik: nik || null,
                exclude_id: excludeId
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
            });
            return res.data;
        },
};
