import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
    getDataGuru,
    getDetailGuru,
    checkExistingGuru,
    checkMultipleGuru,
    bulkCreateGuru,
    checkExistingGuruWithExclude,
    updateGuru,
    deleteGuru
} from "../../controllers/admin/guruController.js";

const router = Router();

// Apply authentication middleware to all routes in this file
router.use(authMiddleware);

// Route to get all teachers data and statistics
// Example: GET /api/admin/guru?page=1&limit=10&search=ahmad&status=aktif&sort_by=nip&sort_order=asc
router.get("/", getDataGuru);

// Route to get teacher detail by ID
// Example: GET /api/admin/guru/1
router.get("/:id", getDetailGuru);

// POST routes for validation and bulk operations
// Route to check single NIP for real-time validation
// Example: POST /api/admin/guru/check
router.post("/check", checkExistingGuru);

// Route to check multiple NIPs for batch validation
// Example: POST /api/admin/guru/check-multiple
router.post("/check-multiple", checkMultipleGuru);

// Route to bulk create multiple teachers
// Example: POST /api/admin/guru/bulk
router.post("/bulk", bulkCreateGuru);

// PUT and DELETE routes for edit operations
// Route to check NIP with exclude (for edit validation)
// Example: POST /api/admin/guru/check-with-exclude
router.post("/check-with-exclude", checkExistingGuruWithExclude);

// Route to update teacher data
// Example: PUT /api/admin/guru/1
router.put("/:id", updateGuru);

// Route to delete teacher data
// Example: DELETE /api/admin/guru/1
router.delete("/:id", deleteGuru);

export default router;