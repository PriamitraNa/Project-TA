import axios from "axios";
import { API_URL } from "../../api";

export const OrtuService = {
  // GET /api/admin/ortu - Get all parents with pagination, search, filter, and sorting
  getAll: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      relasi = "",
      sort_by = "nik",
      sort_order = "asc",
    } = params;

    const queryParams = { page, limit, sort_by, sort_order };
    if (search) queryParams.search = search;
    if (relasi) queryParams.relasi = relasi;

    try {
      const res = await axios.get(`${API_URL}/admin/ortu`, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching ortu data:", error);
      throw error;
    }
  },

  // POST /api/admin/ortu/bulk - Create multiple parents at once
  bulkCreate: async (ortuData) => {
    try {
      const res = await axios.post(
        `${API_URL}/admin/ortu/bulk`,
        {
          ortu: ortuData,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error bulk creating ortu:", error);
      throw error;
    }
  },

  // POST /api/admin/ortu/check - Check if NIK exists
  checkSingle: async (nik) => {
    try {
      const res = await axios.post(
        `${API_URL}/admin/ortu/check`,
        {
          nik: nik,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking NIK:", error);
      throw error;
    }
  },

  // POST /api/admin/ortu/check-multiple - Check multiple NIK
  checkMultiple: async (nikList) => {
    try {
      const res = await axios.post(
        `${API_URL}/admin/ortu/check-multiple`,
        {
          nik_list: nikList,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking multiple NIK:", error);
      throw error;
    }
  },

  // POST /api/admin/ortu/check-with-exclude - Check NIK uniqueness excluding current parent
  checkWithExclude: async (nik, excludeId) => {
    try {
      const res = await axios.post(
        `${API_URL}/admin/ortu/check-with-exclude`,
        {
          nik: nik,
          exclude_id: excludeId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking NIK with exclude:", error);
      throw error;
    }
  },

  // GET /api/admin/ortu/:id - Get single parent detail
  getById: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/admin/ortu/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching ortu detail:", error);
      throw error;
    }
  },

  // PUT /api/admin/ortu/:id - Update parent data
  update: async (id, ortuData) => {
    try {
      console.log("🔍 OrtuService.update - ID:", id);
      console.log("🔍 OrtuService.update - Data:", JSON.stringify(ortuData, null, 2));
      console.log("🔍 OrtuService.update - nama_lengkap:", ortuData.nama_lengkap);
      console.log("🔍 OrtuService.update - nama_lengkap type:", typeof ortuData.nama_lengkap);
      console.log("🔍 OrtuService.update - nama_lengkap length:", ortuData.nama_lengkap?.length);
      
      const res = await axios.put(`${API_URL}/admin/ortu/${id}`, ortuData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (error) {
      console.error("Error updating ortu:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  // DELETE /api/admin/ortu/:id - Delete parent data
  delete: async (id) => {
    try {
      console.log("🔍 OrtuService.delete - ID:", id);
      
      const res = await axios.delete(`${API_URL}/admin/ortu/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      
      console.log("🔍 OrtuService.delete - Response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error deleting ortu:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  // GET /api/admin/ortu/available-students - Get students without parents
  getAvailableStudents: async (params = {}) => {
    const {
      search = "",
      limit = 50,
      exclude_ids = [],
    } = params;

    const queryParams = { limit };
    if (search) queryParams.search = search;
    if (exclude_ids && exclude_ids.length > 0) {
      queryParams.exclude_ids = exclude_ids.join(',');
    }

    try {
      const res = await axios.get(`${API_URL}/admin/ortu/available-students`, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching available students:", error);
      throw error;
    }
  },

  // GET /api/admin/ortu/available-students-edit - Get students for edit modal (include current parent's children)
  getAvailableStudentsForEdit: async (params = {}) => {
    const {
      search = "",
      limit = 50,
      exclude_ids = [],
      include_ids = [],
    } = params;

    const queryParams = { limit };
    if (search) queryParams.search = search;
    if (exclude_ids && exclude_ids.length > 0) {
      queryParams.exclude_ids = exclude_ids.join(',');
    }
    if (include_ids && include_ids.length > 0) {
      queryParams.include_ids = include_ids.join(',');
    }

    try {
      const res = await axios.get(`${API_URL}/admin/ortu/available-students-edit`, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching available students for edit:", error);
      throw error;
    }
  },
};
