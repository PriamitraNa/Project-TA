import express from "express";
import { getTahunajaranKelasGuru, getDaftarKelas, getDropdownKelas, getDropdownWaliKelas, getCurrentSelection, tambahKelas, getDetailKelas, updateKelas, deleteKelas, getInfoKelas, getDaftarSiswaKelas, tambahSiswaKeKelas, searchSiswa, getAvailableSiswa, bulkTambahSiswaKeKelas, hapusSiswaDariKelas, getNaikKelasInfo, executeNaikKelas, getDaftarMataPelajaranKelas, getDropdownMataPelajaran, getDropdownGuru, getDropdownGuruEdit, tambahMataPelajaranKeKelas, tambahMataPelajaranBaru, getDetailMataPelajaranKelas, getDropdownMataPelajaranEdit, updateMataPelajaranKelas, hapusMataPelajaranKelas } from "../../controllers/admin/kelasController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/admin/kelas/dropdown/tahun-ajaran - Dropdown tahun ajaran lengkap (gabungan)
router.get("/dropdown/tahun-ajaran", authMiddleware, getTahunajaranKelasGuru);

// GET /api/admin/kelas/daftar - Daftar kelas dengan filter dan pagination
router.get("/daftar", authMiddleware, getDaftarKelas);

// GET /api/admin/kelas/dropdown - Dropdown kelas dengan filter
router.get("/dropdown", authMiddleware, getDropdownKelas);

// GET /api/admin/kelas/dropdown/wali-kelas - Dropdown wali kelas (guru aktif)
router.get("/dropdown/wali-kelas", authMiddleware, getDropdownWaliKelas);

// GET /api/admin/kelas/dropdown/current-selection - Current selection tahun ajaran dan semester (autofill)
router.get("/dropdown/current-selection", authMiddleware, getCurrentSelection);

// POST /api/admin/kelas/tambah - Tambah kelas baru
router.post("/tambah", authMiddleware, tambahKelas);

// GET /api/admin/kelas/:id/detail - Detail kelas untuk edit
router.get("/:id/detail", authMiddleware, getDetailKelas);

// GET /api/admin/kelas/:id/info - Info kelas untuk header
router.get("/:id/info", authMiddleware, getInfoKelas);

// GET /api/admin/kelas/:id/naik-kelas/info - Info naik kelas (kelas asal + tahun ajaran tujuan)
router.get("/:id/naik-kelas/info", authMiddleware, getNaikKelasInfo);

// POST /api/admin/kelas/:id/naik-kelas/execute - Execute naik kelas siswa
router.post("/:id/naik-kelas/execute", authMiddleware, executeNaikKelas);

// GET /api/admin/kelas/:id/siswa - Daftar siswa dalam kelas
router.get("/:id/siswa", authMiddleware, getDaftarSiswaKelas);

// POST /api/admin/kelas/:id/siswa/tambah - Tambah siswa ke kelas
router.post("/:id/siswa/tambah", authMiddleware, tambahSiswaKeKelas);

// POST /api/admin/kelas/:id/siswa/tambah-bulk - Bulk tambah siswa ke kelas
router.post("/:id/siswa/tambah-bulk", authMiddleware, bulkTambahSiswaKeKelas);

// DELETE /api/admin/kelas/:id/siswa/:siswa_id/hapus - Hapus siswa dari kelas
router.delete("/:id/siswa/:siswa_id/hapus", authMiddleware, hapusSiswaDariKelas);

// GET /api/admin/kelas/:id/mata-pelajaran - Daftar mata pelajaran dalam kelas
router.get("/:id/mata-pelajaran", authMiddleware, getDaftarMataPelajaranKelas);

// GET /api/admin/mata-pelajaran/dropdown - Dropdown mata pelajaran (exclude yang sudah ada di kelas)
router.get("/mata-pelajaran/dropdown", authMiddleware, getDropdownMataPelajaran);

// GET /api/admin/guru/dropdown - Dropdown guru aktif
router.get("/guru/dropdown", authMiddleware, getDropdownGuru);

// GET /api/admin/guru/dropdown-edit - Dropdown guru untuk edit (include guru yang sedang diedit)
router.get("/guru/dropdown-edit", authMiddleware, getDropdownGuruEdit);

// POST /api/admin/kelas/:id/mata-pelajaran/tambah - Tambah mata pelajaran ke kelas
router.post("/:id/mata-pelajaran/tambah", authMiddleware, tambahMataPelajaranKeKelas);

// POST /api/admin/mata-pelajaran/tambah - Tambah mata pelajaran baru ke master
router.post("/mata-pelajaran/tambah", authMiddleware, tambahMataPelajaranBaru);

// GET /api/admin/siswa/search - Search siswa yang belum terdaftar
router.get("/siswa/search", authMiddleware, searchSiswa);

// GET /api/admin/siswa/available - Get available siswa yang belum terdaftar
router.get("/siswa/available", authMiddleware, getAvailableSiswa);

// PUT /api/admin/kelas/:id/update - Update kelas
router.put("/:id/update", authMiddleware, updateKelas);

// DELETE /api/admin/kelas/:id/delete - Delete kelas
router.delete("/:id/delete", authMiddleware, deleteKelas);

// GET /api/admin/kelas/:id/mata-pelajaran/:mapel_id/detail - Detail mata pelajaran untuk edit
router.get("/:id/mata-pelajaran/:mapel_id/detail", authMiddleware, getDetailMataPelajaranKelas);

// GET /api/admin/kelas/:id/mata-pelajaran/dropdown-edit - Dropdown mata pelajaran untuk edit
router.get("/:id/mata-pelajaran/dropdown-edit", authMiddleware, getDropdownMataPelajaranEdit);

// PUT /api/admin/kelas/:id/mata-pelajaran/:mapel_id/update - Update mata pelajaran di kelas
router.put("/:id/mata-pelajaran/:mapel_id/update", authMiddleware, updateMataPelajaranKelas);

// DELETE /api/admin/kelas/:id/mata-pelajaran/:mapel_id/hapus - Hapus mata pelajaran dari kelas
router.delete("/:id/mata-pelajaran/:mapel_id/hapus", authMiddleware, hapusMataPelajaranKelas);

export default router;
