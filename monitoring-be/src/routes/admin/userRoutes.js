import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
    getDataUsers,
    getAvailableGuru,
    getAvailableOrtu,
    getChildrenByParent,
    validateField,
    createUser,
    createBulkUsers,
    resetPassword,
    deleteUser
} from "../../controllers/admin/userController.js";

const router = Router();

// Apply authentication middleware to all routes in this file
router.use(authMiddleware);

// Route to get all users data and statistics
// Example: GET /api/admin/users?page=1&limit=10&search=admin&role=admin&status=aktif&sort_by=nama_lengkap&sort_order=asc
router.get("/", getDataUsers);

// Route to get available guru for dropdown
// Example: GET /api/admin/users/available-guru?search=budi&limit=50
router.get("/available-guru", getAvailableGuru);

// Route to get available orangtua for dropdown
// Example: GET /api/admin/users/available-ortu?search=budi&limit=50
router.get("/available-ortu", getAvailableOrtu);

// Route to get children by parent ID
// Example: GET /api/admin/users/children-by-parent/1?search=anak&limit=50
router.get("/children-by-parent/:ortu_id", getChildrenByParent);

// Validate field (real-time)
// Example: POST /api/admin/users/validate-field
router.post("/validate-field", validateField);

// Create single user account
// Example: POST /api/admin/users
router.post("/", createUser);

// Create multiple user accounts (bulk)
// Example: POST /api/admin/users/bulk
router.post("/bulk", createBulkUsers);

// Reset password user
// Example: POST /api/admin/users/:id/reset-password
router.post("/:id/reset-password", resetPassword);

// Delete user
// Example: DELETE /api/admin/users/:id
router.delete("/:id", deleteUser);

export default router;
