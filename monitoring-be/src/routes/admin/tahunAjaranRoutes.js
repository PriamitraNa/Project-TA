import express from "express";
import { 
  getAllTahunAjaran, 
  getTahunAjaranAktif, 
  getTahunAjaranById,
  createTahunAjaran,
  deleteTahunAjaran,
  toggleTahunAjaranStatus
} from "../../controllers/admin/tahunAjaranController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Semua route memerlukan authentication
router.use(authMiddleware);

// GET /api/admin/tahun-ajaran - Get all tahun ajaran dengan sorting
router.get("/", getAllTahunAjaran);

// GET /api/admin/tahun-ajaran/aktif - Get tahun ajaran aktif
router.get("/aktif", getTahunAjaranAktif);

// POST /api/admin/tahun-ajaran - Create tahun ajaran baru
router.post("/", createTahunAjaran);

// PATCH /api/admin/tahun-ajaran/:id/toggle-status - Toggle status tahun ajaran
router.patch("/:id/toggle-status", toggleTahunAjaranStatus);

// DELETE /api/admin/tahun-ajaran/:id - Delete tahun ajaran
router.delete("/:id", deleteTahunAjaran);

// GET /api/admin/tahun-ajaran/:id - Get tahun ajaran by ID (taruh paling bawah)
router.get("/:id", getTahunAjaranById);

export default router;
