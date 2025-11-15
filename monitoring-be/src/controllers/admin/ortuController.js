import {
    fetchDataOrtu,
    fetchDetailOrtu,
    fetchDetailOrtuWithAnak,
    fetchAvailableStudents,
    fetchAvailableStudentsForEdit,
    checkSingleOrtuNikService,
    checkSingleOrtuNikWithExcludeService,
    checkMultipleOrtuNikService,
    bulkCreateOrtuService,
    updateOrtuWithAnakService,
    deleteOrtuWithAnakService
} from "../../services/admin/ortuService.js";

// Controller to get all orangtua data
export const getDataOrtu = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = "", 
        relasi = "",
        sort_by = "nik",
        sort_order = "asc"
      } = req.query;
  
      const result = await fetchDataOrtu(page, limit, search, relasi, sort_by, sort_order);
      
      if (result.status === "error") {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getDataOrtu controller:", error);
      res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan server",
        data: null
      });
    }
  };
  
  export const getDetailOrtu = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id || isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID orangtua tidak valid",
          data: null
        });
      }
  
      const result = await fetchDetailOrtu(parseInt(id));
      
      if (result.status === "error") {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getDetailOrtu controller:", error);
      res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan server",
        data: null
      });
    }
  };

  // Controller to get orangtua detail with complete children information (for edit modal)
  export const getDetailOrtuWithAnak = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id || isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "ID orangtua tidak valid",
          data: null
        });
      }
  
      const result = await fetchDetailOrtuWithAnak(parseInt(id));
      
      if (result.status === "error") {
        return res.status(404).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in getDetailOrtuWithAnak controller:", error);
      res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan server",
        data: null
      });
    }
  };

// Controller to get available students (students without parents)
export const getAvailableStudents = async (req, res) => {
  try {
    const { 
      search = "", 
      limit = 50, 
      exclude_ids = "" 
    } = req.query;

    const result = await fetchAvailableStudents(search, limit, exclude_ids);
    
    if (result.status === "error") {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAvailableStudents controller:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      data: null
    });
  }
};

// Controller to get available students for edit modal (include students already related to current parent)
export const getAvailableStudentsForEdit = async (req, res) => {
  try {
    const { 
      search = "", 
      limit = 50, 
      exclude_ids = "",
      include_ids = ""
    } = req.query;

    const result = await fetchAvailableStudentsForEdit(search, limit, exclude_ids, include_ids);
    
    if (result.status === "error") {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAvailableStudentsForEdit controller:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      data: null
    });
  }
};

// Controller to check single NIK orangtua
export const checkExistingOrtuNik = async (req, res) => {
  try {
    const { nik } = req.body;
    const result = await checkSingleOrtuNikService(nik);
    res.status(result.status === "success" ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in checkExistingOrtuNik controller:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      data: null
    });
  }
};

// Controller to check single NIK orangtua with exclude (for edit modal)
export const checkExistingOrtuNikWithExclude = async (req, res) => {
  try {
    const { nik, exclude_id } = req.body;
    const result = await checkSingleOrtuNikWithExcludeService(nik, exclude_id);
    res.status(result.status === "success" ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in checkExistingOrtuNikWithExclude controller:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      data: null
    });
  }
};

// Controller to check multiple NIK orangtua
export const checkMultipleOrtuNik = async (req, res) => {
  try {
    const { nik_list } = req.body;
    const result = await checkMultipleOrtuNikService(nik_list);
    res.status(result.status === "success" ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in checkMultipleOrtuNik controller:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      data: null
    });
  }
};

// Controller to bulk create orangtua
export const bulkCreateOrtu = async (req, res) => {
  try {
    const { ortu } = req.body;
    const result = await bulkCreateOrtuService(ortu);
    
    if (result.status === "success") {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in bulkCreateOrtu controller:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      data: null
    });
  }
};

// Controller to update orangtua with anak relationships
export const updateOrtu = async (req, res) => {
  try {
    const ortuId = parseInt(req.params.id);
    const { nama_lengkap, nik, kontak, relasi, anak } = req.body;


    // Validate ortuId
    if (!ortuId || isNaN(ortuId)) {
      return res.status(400).json({
        status: "error",
        message: "ID orangtua tidak valid",
        data: null
      });
    }

    const ortuData = { nama_lengkap, nik, kontak, relasi };
    const result = await updateOrtuWithAnakService(ortuId, ortuData, anak);
    
    if (result.status === "success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in updateOrtu controller:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      data: null
    });
  }
};

// Controller to delete orangtua with anak relationships
export const deleteOrtu = async (req, res) => {
  try {
    const ortuId = parseInt(req.params.id);

    // Validate ortuId
    if (!ortuId || isNaN(ortuId)) {
      return res.status(400).json({
        status: "error",
        message: "ID orangtua tidak valid",
        data: null
      });
    }

    const result = await deleteOrtuWithAnakService(ortuId);
    
    if (result.status === "success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in deleteOrtu controller:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      data: null
    });
  }
};
