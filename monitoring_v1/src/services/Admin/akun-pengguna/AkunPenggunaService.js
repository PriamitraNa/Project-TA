import axios from "axios";
import { API_URL } from "../../api";

export const AkunPenggunaService = {
    // GET /api/admin/users - Get all user accounts with pagination, search, filter, and sorting
    getAll: async (params = {}) => {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            role = '', 
            status = '', 
            sort_by = 'created_at', 
            sort_order = 'desc' 
        } = params;
        
        const queryParams = { page, limit, sort_by, sort_order };
        if (search) queryParams.search = search;
        if (role) queryParams.role = role;
        if (status) queryParams.status = status;
        
        try {
            const res = await axios.get(`${API_URL}/admin/users`, {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            return res.data;
        } catch (error) {
            console.error("❌ Error in AkunPenggunaService.getAll:", error);
            throw error;
        }
    },

    // DELETE /api/admin/users/:id - Delete user account
    delete: async (id) => {
        try {
            const res = await axios.delete(`${API_URL}/admin/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            return res.data;
        } catch (error) {
            console.error("❌ Error in AkunPenggunaService.delete:", error);
            throw error;
        }
    },

    // POST /api/admin/users/:id/reset-password - Reset user password
    resetPassword: async (id) => {
        try {
            const res = await axios.post(`${API_URL}/admin/users/${id}/reset-password`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
            });
            return res.data;
        } catch (error) {
            console.error("❌ Error in AkunPenggunaService.resetPassword:", error);
            throw error;
        }
    },

    // GET /api/admin/users/available-guru - Get available teachers for account creation
    getAvailableGuru: async (params = {}) => {
        const { search = '', limit = 50 } = params;
        
        try {
            const res = await axios.get(`${API_URL}/admin/users/available-guru`, {
                params: { search, limit },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            return res.data;
        } catch (error) {
            console.error("❌ Error in AkunPenggunaService.getAvailableGuru:", error);
            throw error;
        }
    },

    // GET /api/admin/users/available-ortu - Get available parents for account creation
    getAvailableOrtu: async (params = {}) => {
        const { search = '', limit = 50 } = params;
        
        try {
            const res = await axios.get(`${API_URL}/admin/users/available-ortu`, {
                params: { search, limit },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            return res.data;
        } catch (error) {
            console.error("❌ Error in AkunPenggunaService.getAvailableOrtu:", error);
            throw error;
        }
    },

    // GET /api/admin/users/children-by-parent/:ortu_id - Get children by parent ID
    getChildrenByParent: async (ortuId, params = {}) => {
        const { search = '', limit = 50 } = params;
        
        try {
            const res = await axios.get(`${API_URL}/admin/users/children-by-parent/${ortuId}`, {
                params: { search, limit },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            return res.data;
        } catch (error) {
            console.error("❌ Error in AkunPenggunaService.getChildrenByParent:", error);
            throw error;
        }
    },

    // POST /api/admin/users/validate-field - Real-time field validation
    validateField: async (payload) => {
        try {
            const res = await axios.post(`${API_URL}/admin/users/validate-field`, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
            });
            return res.data;
        } catch (error) {
            console.error("❌ Error in AkunPenggunaService.validateField:", error);
            throw error;
        }
    },

    // POST /api/admin/users - Create single user account
    createSingle: async (userData) => {
        try {
            const res = await axios.post(`${API_URL}/admin/users`, userData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
            });
            return res.data;
        } catch (error) {
            console.error("❌ Error in AkunPenggunaService.createSingle:", error);
            throw error;
        }
    },

    // POST /api/admin/users/bulk - Create multiple user accounts
    createBulk: async (usersData) => {
        try {
            const res = await axios.post(`${API_URL}/admin/users/bulk`, usersData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
            });
            return res.data;
        } catch (error) {
            console.error("❌ Error in AkunPenggunaService.createBulk:", error);
            throw error;
        }
    }
};
