import { Router } from "express";
import {
  getDataSiswa,
  getDetailSiswa,
  checkExistingSiswa,
  checkExistingSiswaWithExclude,
  checkMultipleSiswa,
  bulkCreateSiswa,
  updateSiswa,
  deleteSiswa,
} from "../../controllers/admin/siswaController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

// Apply authentication middleware to all routes in this file
router.use(authMiddleware);

// Route to get all students data
// Example: GET /api/admin/siswa?page=1&limit=10&search=ahmad&jenis_kelamin=L
router.get("/", getDataSiswa);

// Route to get student detail by ID
// Example: GET /api/admin/siswa/1
router.get("/:id", getDetailSiswa);

// Route to check single NISN or NIK
// Example: POST /api/admin/siswa/check
router.post("/check", checkExistingSiswa);

// Route to check single NISN or NIK with exclude (for edit)
// Example: POST /api/admin/siswa/check-with-exclude
router.post("/check-with-exclude", checkExistingSiswaWithExclude);

// Route to check multiple NISN and NIK
// Example: POST /api/admin/siswa/check-multiple
router.post("/check-multiple", checkMultipleSiswa);

// Route to bulk create students
// Example: POST /api/admin/siswa/bulk
router.post("/bulk", bulkCreateSiswa);

// Route to update student
// Example: PUT /api/admin/siswa/1
router.put("/:id", updateSiswa);

// Route to delete student
// Example: DELETE /api/admin/siswa/1
router.delete("/:id", deleteSiswa);

export default router;