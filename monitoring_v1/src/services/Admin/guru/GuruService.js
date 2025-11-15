import axios from "axios";
import { API_URL } from "../../api";

export const GuruService = {
    // GET /api/admin/guru - Get all teachers with pagination, search, filter, and sorting
    getAll: async (params = {}) => {
        const { page = 1, limit = 10, search = '', status = '', sort_by = 'created_at', sort_order = 'desc' } = params;
        
        const queryParams = { page, limit, sort_by, sort_order };
        if (search) queryParams.search = search;
        if (status) queryParams.status = status;
        
        const res = await axios.get(`${API_URL}/admin/guru`, {
            params: queryParams,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },

    // POST /api/admin/guru/bulk - Create multiple teachers at once
    bulkCreate: async (guruData) => {
        const res = await axios.post(`${API_URL}/admin/guru/bulk`, {
            guru: guruData
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
        });
        return res.data;
    },

    // POST /api/admin/guru/check - Check if NIP exists
    checkSingle: async (nip) => {
        const res = await axios.post(`${API_URL}/admin/guru/check`, {
            nip: nip
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
        });
        return res.data;
    },

    // POST /api/admin/guru/check-multiple - Check multiple NIP
    checkMultiple: async (nipList) => {
        const res = await axios.post(`${API_URL}/admin/guru/check-multiple`, {
            nip_list: nipList
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
        });
        return res.data;
    },

    // POST /api/admin/guru/check-with-exclude - Check NIP uniqueness excluding current guru
    checkWithExclude: async (nip, excludeId) => {
        const res = await axios.post(`${API_URL}/admin/guru/check-with-exclude`, {
            nip: nip,
            exclude_id: excludeId
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
        });
        return res.data;
    },

    // PUT /api/admin/guru/:id - Update teacher data
    update: async (id, guruData) => {
        const res = await axios.put(`${API_URL}/admin/guru/${id}`, guruData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
        });
        return res.data;
    },

    // DELETE /api/admin/guru/:id - Delete teacher data
    delete: async (id) => {
        const res = await axios.delete(`${API_URL}/admin/guru/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return res.data;
    },
};
