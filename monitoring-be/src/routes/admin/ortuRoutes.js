import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
    getDataOrtu,
    getDetailOrtu,
    getDetailOrtuWithAnak,
    getAvailableStudents,
    getAvailableStudentsForEdit,
    checkExistingOrtuNik,
    checkExistingOrtuNikWithExclude,
    checkMultipleOrtuNik,
    bulkCreateOrtu,
    updateOrtu,
    deleteOrtu
} from "../../controllers/admin/ortuController.js";

const router = Router();

// Apply authentication middleware to all routes in this file
router.use(authMiddleware);

// Route to get all orangtua data and statistics
// Example: GET /api/admin/ortu?page=1&limit=10&search=john&relasi=Ayah&sort_by=nama_lengkap&sort_order=asc
router.get("/", getDataOrtu);

// Route to get available students (students without parents)
// Example: GET /api/admin/ortu/available-students?search=john&limit=50&exclude_ids=1,2,3
router.get("/available-students", getAvailableStudents);

// Route to get available students for edit modal (include students already related to current parent)
// Example: GET /api/admin/ortu/available-students-edit?search=john&limit=50&exclude_ids=1,2,3&include_ids=4,5,6
router.get("/available-students-edit", getAvailableStudentsForEdit);

// Route to get orangtua detail by ID (with complete children information for edit modal)
// Example: GET /api/admin/ortu/1
router.get("/:id", getDetailOrtuWithAnak);

// POST /api/admin/ortu/check - Check single NIK orangtua
router.post("/check", checkExistingOrtuNik);

// POST /api/admin/ortu/check-with-exclude - Check single NIK orangtua with exclude (for edit modal)
router.post("/check-with-exclude", checkExistingOrtuNikWithExclude);

// POST /api/admin/ortu/check-multiple - Check multiple NIK orangtua
router.post("/check-multiple", checkMultipleOrtuNik);

// POST /api/admin/ortu/bulk - Bulk create orangtua
router.post("/bulk", bulkCreateOrtu);

// PUT /api/admin/ortu/:id - Update orangtua with anak relationships
router.put("/:id", updateOrtu);

// DELETE /api/admin/ortu/:id - Delete orangtua with anak relationships
router.delete("/:id", deleteOrtu);

export default router;
