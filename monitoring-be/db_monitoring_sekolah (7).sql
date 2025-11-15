-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 25, 2025 at 12:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_monitoring_sekolah`
--

-- --------------------------------------------------------

--
-- Table structure for table `absensi`
--

CREATE TABLE `absensi` (
  `id` int(11) NOT NULL,
  `siswa_id` int(11) NOT NULL,
  `kelas_id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `status` enum('Hadir','Sakit','Izin','Alpha') NOT NULL,
  `guru_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `absensi`
--

INSERT INTO `absensi` (`id`, `siswa_id`, `kelas_id`, `tanggal`, `status`, `guru_id`) VALUES
(21, 19, 17, '2025-10-23', 'Alpha', 12),
(22, 23, 17, '2025-10-23', 'Izin', 12),
(23, 12, 17, '2025-10-23', 'Hadir', 12),
(24, 16, 17, '2025-10-23', 'Hadir', 12),
(37, 19, 17, '2025-10-22', 'Hadir', 12),
(38, 12, 17, '2025-10-22', 'Sakit', 12),
(39, 23, 17, '2025-10-22', 'Izin', 12),
(40, 16, 17, '2025-10-22', 'Alpha', 12),
(45, 19, 17, '2025-10-21', 'Hadir', 12),
(46, 12, 17, '2025-10-21', 'Hadir', 12),
(47, 23, 17, '2025-10-21', 'Hadir', 12),
(48, 16, 17, '2025-10-21', 'Hadir', 12),
(49, 19, 17, '2025-10-20', 'Alpha', 12),
(50, 12, 17, '2025-10-20', 'Izin', 12),
(51, 23, 17, '2025-10-20', 'Izin', 12),
(52, 16, 17, '2025-10-20', 'Alpha', 12),
(53, 19, 17, '2025-10-19', 'Sakit', 12),
(54, 12, 17, '2025-10-19', 'Sakit', 12),
(55, 23, 17, '2025-10-19', 'Sakit', 12),
(56, 16, 17, '2025-10-19', 'Sakit', 12);

-- --------------------------------------------------------

--
-- Table structure for table `catatan_detail`
--

CREATE TABLE `catatan_detail` (
  `id` int(11) NOT NULL,
  `header_id` int(11) NOT NULL,
  `pengirim_id` int(11) NOT NULL,
  `pesan` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `catatan_detail`
--

INSERT INTO `catatan_detail` (`id`, `header_id`, `pengirim_id`, `pesan`, `created_at`) VALUES
(1, 1, 12, 'Ahmad sangat aktif dalam diskusi kelas matematika hari ini. Dia memberikan pendapat yang kritis dan membantu teman-temannya memahami materi dengan lebih baik. Pertahankan semangat belajarnya!', '2025-10-23 02:00:00'),
(2, 1, 17, 'Terima kasih atas informasinya Bu Guru. Saya akan terus mendukung Ahmad di rumah.', '2025-10-23 07:20:00'),
(3, 2, 12, 'Selamat kepada Ahmad Rizki yang berhasil menjuarai lomba pidato tingkat kecamatan. Prestasi yang membanggakan!', '2025-10-23 03:30:00'),
(4, 3, 12, 'Ahmad Rizki sering terlambat masuk kelas dalam 3 hari terakhir. Mohon perhatian orangtua untuk memastikan anak berangkat lebih pagi.', '2025-10-23 04:00:00'),
(5, 4, 12, 'Asep izin tidak masuk hari ini karena sakit. Semoga cepat sembuh.', '2025-10-23 06:00:00'),
(6, 4, 38, 'Terima kasih Bu. Asep sedang demam, besok InsyaAllah sudah bisa masuk.', '2025-10-23 08:00:00'),
(7, 4, 12, 'Baik Bu, semoga lekas pulih. Jangan lupa istirahat yang cukup.', '2025-10-23 08:30:00'),
(8, 5, 12, 'Pronunciation Ahmad dalam Bahasa Inggris sangat bagus. Keep up the good work!', '2025-10-24 08:49:29'),
(9, 6, 12, 'Ahmad Rizki menunjukkan peningkatan yang signifikan dalam mengerjakan soal-soal matematika. Terus berlatih!', '2025-10-22 02:00:00'),
(10, 7, 12, 'Ahmad Rizki tidak hadir tanpa keterangan hari ini. Mohon konfirmasi dari orangtua.', '2025-10-22 03:00:00'),
(11, 8, 12, 'Asep menunjukkan antusiasme tinggi dalam kegiatan ekstrakurikuler pramuka.', '2025-10-22 04:00:00'),
(12, 9, 12, '131231231 berhasil menyelesaikan proyek sains dengan baik. Hasil presentasinya sangat menarik!', '2025-10-21 07:00:00'),
(13, 10, 12, 'Ahmad Rizki mengganggu teman saat pelajaran berlangsung. Sudah ditegur beberapa kali.', '2025-10-21 08:00:00'),
(14, 11, 37, 'Andi Pratama sangat aktif dalam pelajaran Bahasa Indonesia. Kemampuan menulis karangannya bagus sekali.', '2025-10-23 01:00:00'),
(15, 12, 37, 'Jasmine Putri meraih juara 1 lomba puisi. Selamat!', '2025-10-23 02:30:00'),
(16, 13, 37, 'Siti Nurhaliza hadir tepat waktu setiap hari. Disiplin yang baik!', '2025-10-23 03:00:00'),
(17, 14, 37, 'Udin Sedunia menunjukkan pemahaman yang baik terhadap materi teks deskriptif.', '2025-10-22 07:00:00'),
(18, 15, 37, 'Andi Pratama kurang fokus saat pelajaran. Perlu bimbingan ekstra.', '2025-10-22 08:00:00'),
(20, 17, 37, 'ddseewwsss', '2025-10-24 09:56:41'),
(21, 17, 37, 'okeeee', '2025-10-24 10:53:56'),
(22, 17, 37, 'a', '2025-10-24 10:56:20'),
(24, 19, 37, 'sadasdadasdasd', '2025-10-24 11:07:10'),
(26, 21, 37, 'sdasdasdasda11', '2025-10-24 11:43:14'),
(27, 21, 37, 'Test', '2025-10-25 04:14:28');

-- --------------------------------------------------------

--
-- Table structure for table `catatan_header`
--

CREATE TABLE `catatan_header` (
  `id` int(11) NOT NULL,
  `guru_id` int(11) NOT NULL,
  `orangtua_id` int(11) DEFAULT NULL,
  `siswa_id` int(11) NOT NULL,
  `kategori` enum('Positif','Negatif','Netral') NOT NULL,
  `jenis` enum('Akademik','Perilaku','Kehadiran','Prestasi','Lainnya') NOT NULL,
  `kelas_id` int(11) NOT NULL,
  `mapel_id` int(11) DEFAULT NULL,
  `status` enum('Terkirim','Dibaca') NOT NULL DEFAULT 'Terkirim',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `catatan_header`
--

INSERT INTO `catatan_header` (`id`, `guru_id`, `orangtua_id`, `siswa_id`, `kategori`, `jenis`, `kelas_id`, `mapel_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 12, 1, 19, 'Positif', 'Akademik', 17, 1, 'Dibaca', '2025-10-23 02:00:00', '2025-10-23 02:00:00'),
(2, 12, 2, 23, 'Positif', 'Prestasi', 17, NULL, 'Terkirim', '2025-10-23 03:30:00', '2025-10-23 03:30:00'),
(3, 12, 3, 12, 'Negatif', 'Perilaku', 17, NULL, 'Terkirim', '2025-10-23 04:00:00', '2025-10-23 04:00:00'),
(4, 12, 6, 16, 'Netral', 'Kehadiran', 17, NULL, 'Dibaca', '2025-10-23 06:00:00', '2025-10-23 06:00:00'),
(5, 12, 1, 19, 'Positif', 'Akademik', 17, 5, 'Terkirim', '2025-10-24 08:49:29', '2025-10-24 08:49:29'),
(6, 12, 2, 23, 'Positif', 'Akademik', 17, 1, 'Dibaca', '2025-10-22 02:00:00', '2025-10-22 02:00:00'),
(7, 12, 3, 12, 'Negatif', 'Kehadiran', 17, NULL, 'Terkirim', '2025-10-22 03:00:00', '2025-10-22 03:00:00'),
(8, 12, 6, 16, 'Netral', 'Lainnya', 17, NULL, 'Dibaca', '2025-10-22 04:00:00', '2025-10-22 04:00:00'),
(9, 12, 1, 19, 'Positif', 'Prestasi', 17, NULL, 'Terkirim', '2025-10-21 07:00:00', '2025-10-21 07:00:00'),
(10, 12, 2, 23, 'Negatif', 'Perilaku', 17, NULL, 'Dibaca', '2025-10-21 08:00:00', '2025-10-21 08:00:00'),
(11, 4, 4, 2, 'Positif', 'Akademik', 18, 4, 'Terkirim', '2025-10-23 01:00:00', '2025-10-23 01:00:00'),
(12, 4, 4, 11, 'Positif', 'Prestasi', 18, NULL, 'Dibaca', '2025-10-23 02:30:00', '2025-10-23 02:30:00'),
(13, 4, 4, 24, 'Netral', 'Kehadiran', 18, NULL, 'Terkirim', '2025-10-23 03:00:00', '2025-10-23 03:00:00'),
(14, 4, 4, 1, 'Positif', 'Akademik', 18, 4, 'Dibaca', '2025-10-22 07:00:00', '2025-10-22 07:00:00'),
(15, 4, 4, 2, 'Negatif', 'Perilaku', 18, NULL, 'Terkirim', '2025-10-22 08:00:00', '2025-10-22 08:00:00'),
(17, 4, 3, 12, 'Positif', 'Akademik', 17, 5, 'Terkirim', '2025-10-24 09:56:41', '2025-10-24 10:56:20'),
(19, 4, 1, 19, 'Positif', 'Akademik', 17, NULL, 'Terkirim', '2025-10-24 11:07:10', '2025-10-24 11:07:10'),
(21, 4, 2, 23, 'Positif', 'Akademik', 17, NULL, 'Terkirim', '2025-10-24 11:43:14', '2025-10-25 04:14:28');

-- --------------------------------------------------------

--
-- Table structure for table `guru`
--

CREATE TABLE `guru` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `nip` varchar(20) DEFAULT NULL,
  `status` enum('aktif','tidak-aktif') DEFAULT 'tidak-aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guru`
--

INSERT INTO `guru` (`id`, `user_id`, `nama_lengkap`, `nip`, `status`, `created_at`) VALUES
(1, 1, 'BD', '123232123123', 'aktif', '2025-10-03 11:49:13'),
(2, NULL, 'Asep', '111111111111', 'tidak-aktif', '2025-10-03 11:49:25'),
(4, 37, 'Siti Nurhaliza', '198002021234567891', 'aktif', '2025-10-17 04:08:50'),
(5, 5, 'Budi Santoso', '198003031234567892', 'aktif', '2025-10-17 04:08:50'),
(6, 6, 'Dewi Anggraini', '198004041234567893', 'aktif', '2025-10-17 04:08:50'),
(7, 7, 'Eko Nugroho', '198005051234567894', 'aktif', '2025-10-17 04:08:50'),
(9, 9, 'Gilang Ramadhan', '198007071234567896', 'aktif', '2025-10-17 04:08:50'),
(10, 10, 'Hana Prameswari', '198008081234567897', 'aktif', '2025-10-17 04:08:50'),
(11, 11, 'Imam Prasetyo', '198009091234567898', 'aktif', '2025-10-17 04:08:50'),
(12, 12, 'Jasmine Putri', '198010101234567899', 'aktif', '2025-10-17 04:08:50');

--
-- Triggers `guru`
--
DELIMITER $$
CREATE TRIGGER `set_guru_status_on_insert` BEFORE INSERT ON `guru` FOR EACH ROW BEGIN
    -- Set status berdasarkan user_id
    IF NEW.user_id IS NOT NULL THEN
        SET NEW.status = 'aktif';
    ELSE
        SET NEW.status = 'tidak-aktif';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_guru_status_on_user_id_change` BEFORE UPDATE ON `guru` FOR EACH ROW BEGIN
    -- Jika user_id berubah dari NULL ke ada nilai, set status = 'aktif'
    IF OLD.user_id IS NULL AND NEW.user_id IS NOT NULL THEN
        SET NEW.status = 'aktif';
    END IF;
    
    -- Jika user_id berubah dari ada nilai ke NULL, set status = 'tidak-aktif'
    IF OLD.user_id IS NOT NULL AND NEW.user_id IS NULL THEN
        SET NEW.status = 'tidak-aktif';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `id` int(11) NOT NULL,
  `nama_kelas` varchar(20) NOT NULL,
  `wali_kelas_id` int(11) DEFAULT NULL,
  `tahun_ajaran_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelas`
--

INSERT INTO `kelas` (`id`, `nama_kelas`, `wali_kelas_id`, `tahun_ajaran_id`) VALUES
(17, 'Kelas 1', 12, 17),
(18, 'Kelas 2', 1, 17),
(19, 'Kelas 3', 5, 17);

-- --------------------------------------------------------

--
-- Table structure for table `kelas_mapel`
--

CREATE TABLE `kelas_mapel` (
  `id` int(11) NOT NULL,
  `kelas_id` int(11) NOT NULL,
  `mapel_id` int(11) NOT NULL,
  `guru_id` int(11) NOT NULL,
  `tahun_ajaran_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelas_mapel`
--

INSERT INTO `kelas_mapel` (`id`, `kelas_id`, `mapel_id`, `guru_id`, `tahun_ajaran_id`, `created_at`, `updated_at`) VALUES
(29, 17, 5, 4, 17, '2025-10-23 09:36:11', '2025-10-23 09:36:11'),
(30, 18, 4, 4, 17, '2025-10-23 09:38:45', '2025-10-23 09:38:45'),
(31, 19, 4, 4, 17, '2025-10-23 09:40:27', '2025-10-23 09:40:27');

-- --------------------------------------------------------

--
-- Table structure for table `kelas_siswa`
--

CREATE TABLE `kelas_siswa` (
  `id` int(11) NOT NULL,
  `kelas_id` int(11) NOT NULL,
  `siswa_id` int(11) NOT NULL,
  `tahun_ajaran_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelas_siswa`
--

INSERT INTO `kelas_siswa` (`id`, `kelas_id`, `siswa_id`, `tahun_ajaran_id`) VALUES
(68, 17, 12, 17),
(67, 17, 16, 17),
(65, 17, 19, 17),
(66, 17, 23, 17);

-- --------------------------------------------------------

--
-- Table structure for table `mapel`
--

CREATE TABLE `mapel` (
  `id` int(11) NOT NULL,
  `nama_mapel` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mapel`
--

INSERT INTO `mapel` (`id`, `nama_mapel`) VALUES
(1, 'MTK'),
(2, 'Indo'),
(3, 'Matematika'),
(4, 'Bahasa Indonesia'),
(5, 'Bahasa Inggris'),
(6, 'Ilmu Pengetahuan Alam'),
(7, 'Ilmu Pengetahuan Sosial'),
(8, 'Pendidikan Pancasila'),
(9, 'Pendidikan Agama'),
(10, 'PJOK'),
(11, 'Seni Budaya'),
(12, 'Prakarya'),
(13, 'Coba Aja dlu'),
(14, 'Proyek'),
(15, 'coc');

-- --------------------------------------------------------

--
-- Table structure for table `nilai`
--

CREATE TABLE `nilai` (
  `id` int(11) NOT NULL,
  `siswa_id` int(11) NOT NULL,
  `kelas_id` int(11) NOT NULL,
  `mapel_id` int(11) NOT NULL,
  `tahun_ajaran_id` int(11) NOT NULL,
  `semester` enum('Ganjil','Genap') NOT NULL,
  `lm1_tp1` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM1 TP1',
  `lm1_tp2` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM1 TP2',
  `lm1_tp3` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM1 TP3',
  `lm1_tp4` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM1 TP4',
  `lm2_tp1` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM2 TP1',
  `lm2_tp2` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM2 TP2',
  `lm2_tp3` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM2 TP3',
  `lm2_tp4` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM2 TP4',
  `lm3_tp1` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM3 TP1',
  `lm3_tp2` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM3 TP2',
  `lm3_tp3` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM3 TP3',
  `lm3_tp4` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM3 TP4',
  `lm4_tp1` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM4 TP1',
  `lm4_tp2` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM4 TP2',
  `lm4_tp3` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM4 TP3',
  `lm4_tp4` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM4 TP4',
  `lm5_tp1` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM5 TP1',
  `lm5_tp2` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM5 TP2',
  `lm5_tp3` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM5 TP3',
  `lm5_tp4` decimal(5,2) DEFAULT NULL COMMENT 'Formatif LM5 TP4',
  `lm1_ulangan` decimal(5,2) DEFAULT NULL COMMENT 'Sumatif LM1 (Ulangan)',
  `lm2_ulangan` decimal(5,2) DEFAULT NULL COMMENT 'Sumatif LM2 (Ulangan)',
  `lm3_ulangan` decimal(5,2) DEFAULT NULL COMMENT 'Sumatif LM3 (Ulangan)',
  `lm4_ulangan` decimal(5,2) DEFAULT NULL COMMENT 'Sumatif LM4 (Ulangan)',
  `lm5_ulangan` decimal(5,2) DEFAULT NULL COMMENT 'Sumatif LM5 (Ulangan)',
  `uts` decimal(5,2) DEFAULT NULL COMMENT 'Ujian Tengah Semester',
  `uas` decimal(5,2) DEFAULT NULL COMMENT 'Ujian Akhir Semester',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'User ID yang create',
  `updated_by` int(11) DEFAULT NULL COMMENT 'User ID yang update'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabel nilai siswa dengan sistem Formatif, Sumatif LM, UTS, UAS';

--
-- Dumping data for table `nilai`
--

INSERT INTO `nilai` (`id`, `siswa_id`, `kelas_id`, `mapel_id`, `tahun_ajaran_id`, `semester`, `lm1_tp1`, `lm1_tp2`, `lm1_tp3`, `lm1_tp4`, `lm2_tp1`, `lm2_tp2`, `lm2_tp3`, `lm2_tp4`, `lm3_tp1`, `lm3_tp2`, `lm3_tp3`, `lm3_tp4`, `lm4_tp1`, `lm4_tp2`, `lm4_tp3`, `lm4_tp4`, `lm5_tp1`, `lm5_tp2`, `lm5_tp3`, `lm5_tp4`, `lm1_ulangan`, `lm2_ulangan`, `lm3_ulangan`, `lm4_ulangan`, `lm5_ulangan`, `uts`, `uas`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(5, 19, 17, 1, 17, 'Genap', 85.00, 90.00, 88.00, 92.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 88.00, NULL, NULL, NULL, NULL, 85.00, 90.00, '2025-10-25 10:22:52', '2025-10-25 10:22:52', 12, 12),
(6, 23, 17, 1, 17, 'Genap', 78.00, 82.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-25 10:22:52', '2025-10-25 10:22:52', 12, NULL),
(7, 16, 17, 1, 17, 'Genap', 85.00, 88.00, 90.00, 87.00, 82.00, 85.00, 83.00, 86.00, 90.00, 92.00, 89.00, 91.00, 78.00, 80.00, 82.00, 79.00, 88.00, 90.00, 87.00, 89.00, 88.00, 84.00, 90.00, 80.00, 88.00, 86.00, 89.00, '2025-10-25 10:22:52', '2025-10-25 10:22:52', 12, 12);

-- --------------------------------------------------------

--
-- Table structure for table `orangtua`
--

CREATE TABLE `orangtua` (
  `id` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `nik` varchar(16) DEFAULT NULL,
  `kontak` varchar(20) DEFAULT NULL,
  `relasi` enum('Ayah','Ibu','Wali') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orangtua`
--

INSERT INTO `orangtua` (`id`, `nama_lengkap`, `nik`, `kontak`, `relasi`, `created_at`) VALUES
(1, 'Budi Santoso', '3201010101010001', '081234567890', 'Ayah', '2025-10-18 01:14:15'),
(2, 'Siti Nurhaliza', '3201010101010002', '081234567891', 'Ibu', '2025-10-18 01:14:15'),
(3, 'Ahmad Rizki', '3201010101010003', '081234567892', 'Ayah', '2025-10-18 01:14:15'),
(4, 'Dewi Anggraini', '3201010101010004', '081234567893', 'Ibu', '2025-10-18 01:14:15'),
(5, 'Eko Nugroho', '3201010101010005', '081234567894', 'Ayah', '2025-10-18 01:14:15'),
(6, 'Farah Khairunnisa', '3201010101010006', '081234567895', 'Ibu', '2025-10-18 01:14:15'),
(7, 'Gilang Ramadhan', '3201010101010007', '081234567896', 'Ayah', '2025-10-18 01:14:15'),
(8, 'Hana Prameswari', '3201010101010008', '081234567897', 'Ibu', '2025-10-18 01:14:15'),
(9, 'Imam Prasetyo', '3201010101010009', '081234567898', 'Ayah', '2025-10-18 01:14:15'),
(10, 'Jasmine Putri', '3201010101010010', '081234567899', 'Ibu', '2025-10-18 01:14:15'),
(11, 'Kurniawan Sari', '3201010101010011', '081234567800', 'Wali', '2025-10-18 01:14:15'),
(12, 'Lina Marlina', '3201010101010012', '081234567801', 'Wali', '2025-10-18 01:14:15'),
(13, 'Muhammad Ali', '3201010101010013', '081234567802', 'Ayah', '2025-10-18 01:14:15'),
(14, 'Nurul Hidayah', '3201010101010014', '081234567803', 'Ibu', '2025-10-18 01:14:15'),
(15, 'Oscar Wijaya', '3201010101010015', '081234567804', 'Ayah', '2025-10-18 01:14:15'),
(17, 'Udin', '1344444444444444', '14333333333', 'Ayah', '2025-10-18 03:21:59'),
(18, 'Asuuuu', '1422222222222222', '081236123132', 'Ayah', '2025-10-18 03:21:59'),
(20, 'dgfchg', '1234354576435424', '123435465676', 'Ayah', '2025-10-18 03:29:45');

-- --------------------------------------------------------

--
-- Table structure for table `orangtua_siswa`
--

CREATE TABLE `orangtua_siswa` (
  `id` int(11) NOT NULL,
  `orangtua_id` int(11) NOT NULL,
  `siswa_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orangtua_siswa`
--

INSERT INTO `orangtua_siswa` (`id`, `orangtua_id`, `siswa_id`, `created_at`) VALUES
(1, 1, 19, '2025-10-18 01:14:15'),
(2, 2, 23, '2025-10-18 01:14:15'),
(3, 3, 12, '2025-10-18 01:14:15'),
(5, 5, 27, '2025-10-18 01:14:15'),
(6, 6, 16, '2025-10-18 01:14:15'),
(7, 7, 15, '2025-10-18 01:14:15'),
(8, 8, 25, '2025-10-18 01:14:15'),
(9, 9, 3, '2025-10-18 01:14:15'),
(10, 10, 4, '2025-10-18 01:14:15'),
(11, 11, 17, '2025-10-18 01:14:15'),
(12, 12, 5, '2025-10-18 01:14:15'),
(13, 13, 6, '2025-10-18 01:14:15'),
(14, 14, 20, '2025-10-18 01:14:15'),
(15, 15, 7, '2025-10-18 01:14:15'),
(21, 17, 9, '2025-10-18 03:21:59'),
(22, 17, 10, '2025-10-18 03:21:59'),
(24, 20, 13, '2025-10-18 03:29:45'),
(32, 18, 8, '2025-10-18 21:59:53'),
(33, 4, 2, '2025-10-20 01:20:03'),
(34, 4, 11, '2025-10-20 01:20:03'),
(35, 4, 24, '2025-10-20 01:20:03'),
(36, 4, 1, '2025-10-20 01:20:03');

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

CREATE TABLE `siswa` (
  `id` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `nisn` varchar(20) NOT NULL,
  `nik` varchar(20) DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') NOT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `siswa`
--

INSERT INTO `siswa` (`id`, `nama_lengkap`, `nisn`, `nik`, `jenis_kelamin`, `tanggal_lahir`, `tempat_lahir`, `created_at`) VALUES
(1, 'Udin Sedunia', '100000000122', '3201010101010001', 'Laki-laki', '2015-03-15', 'Jakarta', '2025-10-06 04:49:48'),
(2, 'Andi Pratama', '0012345671', '3201010100000001', 'Laki-laki', '2015-07-22', 'Bandung', '2025-10-07 09:39:21'),
(3, 'Budi Santoso', '0012345672', '3201010100000002', 'Perempuan', '2015-11-08', 'Surabaya', '2025-10-07 09:39:21'),
(4, 'Citra Lestari', '0012345673', '3201010100000003', 'Perempuan', '2015-05-12', 'Yogyakarta', '2025-10-07 09:39:21'),
(5, 'Dewi Anggraini', '0012345674', '3201010100000004', 'Perempuan', '2015-09-03', 'Medan', '2025-10-07 09:39:21'),
(6, 'Eko Nugroho', '0012345675', '3201010100000005', 'Laki-laki', '2015-01-25', 'Semarang', '2025-10-07 09:39:21'),
(7, 'Farah Khairunnisa', '0012345676', '3201010100000006', 'Perempuan', '2015-12-18', 'Makassar', '2025-10-07 09:39:21'),
(8, 'Gilang Ramadhan', '0012345677', '3201010100000007', 'Laki-laki', '2015-04-30', 'Palembang', '2025-10-07 09:39:21'),
(9, 'Hana Prameswari', '0012345678', '3201010100000008', 'Perempuan', '2015-08-14', 'Denpasar', '2025-10-07 09:39:21'),
(10, 'Imam Prasetyo', '0012345679', '3201010100000009', 'Laki-laki', '2015-06-07', 'Bogor', '2025-10-07 09:39:21'),
(11, 'Jasmine Putri', '0012345680', '3201010100000010', 'Perempuan', '2015-10-29', 'Malang', '2025-10-07 09:39:21'),
(12, 'Ahmad Rizki', '9876543210', '3201010101010003', 'Laki-laki', '2025-10-16', 'Surabaya', '2025-10-16 00:40:32'),
(13, 'Siti Nurhaliza', '9876543211', '3201010101010004', 'Perempuan', '2005-12-25', 'Yogyakarta', '2025-10-16 00:40:32'),
(15, 'asep', '2222222223', '2222222222222222', 'Laki-laki', '1111-11-10', 'Garut', '2025-10-16 01:08:15'),
(16, 'Asep', '2222222222', '1112322312313123', 'Laki-laki', '2000-02-10', 'adasdas', '2025-10-16 02:06:52'),
(17, 'Coba tanggal', '1122334455', '1233333333333222', 'Laki-laki', '2010-10-10', 'adfsdf', '2025-10-16 03:03:25'),
(19, '131231231', '1231323231', '2212123313131331', 'Laki-laki', '2012-12-12', '13213212312', '2025-10-16 03:04:52'),
(20, 'eqweqweqwe', '2131231312', '1231312321312131', 'Laki-laki', '2010-03-12', 'asdasdada', '2025-10-16 03:04:52'),
(23, 'Ahmad Rizki', '1111111111', '1111111111111111', 'Laki-laki', '2005-05-05', 'Jakarta', '2025-10-16 04:44:26'),
(24, 'Siti Nurhaliza', '3333333333', '3333333333333333', 'Perempuan', '2003-03-03', 'Bandung', '2025-10-16 04:46:27'),
(25, 'Budi Santoso', '4444444444', '4444444444444444', 'Laki-laki', '2004-04-04', 'Tangerang', '2025-10-16 04:46:27'),
(27, 'Asep', '1203994999', '9089098989998898', 'Laki-laki', '2002-12-12', 'GArut', '2025-10-16 23:03:21');

-- --------------------------------------------------------

--
-- Table structure for table `tahun_ajaran`
--

CREATE TABLE `tahun_ajaran` (
  `id` int(11) NOT NULL,
  `tahun` varchar(20) NOT NULL,
  `semester` enum('Ganjil','Genap') NOT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `status` enum('aktif','tidak-aktif') NOT NULL DEFAULT 'tidak-aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tahun_ajaran`
--

INSERT INTO `tahun_ajaran` (`id`, `tahun`, `semester`, `tanggal_mulai`, `tanggal_selesai`, `status`) VALUES
(16, '2027/2028', 'Ganjil', '2027-10-10', '2027-11-11', 'tidak-aktif'),
(17, '2027/2028', 'Genap', '2027-12-12', '2028-01-01', 'aktif');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','guru','ortu') NOT NULL,
  `status` enum('aktif','tidak-aktif') NOT NULL DEFAULT 'aktif',
  `ortu_id` int(11) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama_lengkap`, `username`, `password`, `role`, `status`, `ortu_id`, `last_login`, `created_at`) VALUES
(1, 'Isma', '00000001', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'admin', 'aktif', NULL, '2025-10-25 03:59:53', '2025-09-23 17:12:03'),
(2, 'BD', '123123123', '$2b$10$Dty2.vEBr9qlMCMErKuG3u/tGIISJ5BS1IJ1y13.sLs0i.UVabQcW', 'guru', 'aktif', NULL, '2025-10-23 09:46:51', '2025-10-03 13:01:45'),
(5, 'Budi Santoso', '198003031234567892', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-10-17 04:08:50'),
(6, 'Dewi Anggraini', '198004041234567893', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-10-17 04:08:50'),
(7, 'Eko Nugroho', '198005051234567894', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-10-17 04:08:50'),
(9, 'Gilang Ramadhan', '198007071234567896', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-10-17 04:08:50'),
(10, 'Hana Prameswari', '198008081234567897', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-10-17 04:08:50'),
(11, 'Imam Prasetyo', '198009091234567898', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-10-17 04:08:50'),
(12, 'Jasmine Putri', '198010101234567899', '$2b$10$HLx6g.V9tPDwqJY9A0T3P.8upgkvNaUV8gnkQpD2D3sKaKVFTvlWu', 'guru', 'aktif', NULL, '2025-10-23 10:50:56', '2025-10-17 04:08:50'),
(17, 'Udin', '0012345678', 'Sekolah20102025', 'ortu', 'aktif', 17, NULL, '2025-10-20 01:25:31'),
(20, 'asdasd', '12312312312', '$2b$10$.PAVrRFewWGGGPf1udk9GOsjF2B567FApico4qDb7NPQF5MPKQG5W', 'admin', 'aktif', NULL, NULL, '2025-10-20 17:58:50'),
(21, 'asep1', '1232213131', '$2b$10$ZWKSknq7pRmYbMQd58YmGeMnM3T1eNAYupCTUWLd6geaq.NaNJdR6', 'admin', 'aktif', NULL, NULL, '2025-10-20 18:02:47'),
(22, 'asep1', '1232123', '$2b$10$xjdR5UQdEPww3X5/qB2LO.YhCvmmdsQxAHAHednQQ7ejOHODUZCLW', 'admin', 'aktif', NULL, NULL, '2025-10-20 18:05:45'),
(23, 'asep1', '1231231', '$2b$10$8DX5zwfzT/iICnDfwLzmaugU3RHd1fJM03eW.zi/MArM9KfOpd.NW', 'admin', 'aktif', NULL, NULL, '2025-10-20 18:07:02'),
(24, 'asep1', '123123121', '$2b$10$LsKdRzoIKH5fY1rksTQv3.E3sOPvrIg3s9JdVPrYLYBJYF5sLljZK', 'admin', 'aktif', NULL, NULL, '2025-10-20 18:08:54'),
(25, 'aseppppppppp', '111111111111', '$2b$10$lx0xjTY0OqytX7SAZ8WxSukjs3eDecdG7PqO7bE/aJBCQxSW0HMnW', 'admin', 'aktif', NULL, NULL, '2025-10-20 18:11:21'),
(27, 'Kurniawan Sari', '1122334455', '$2b$10$MtrXJql6akDp6cwZoptXpOcN.H68ygxRLufdWos/G.s3jdpk8SufW', 'ortu', 'aktif', 11, NULL, '2025-10-20 18:12:10'),
(36, 'Admin V1', '12345678', '$2b$10$.O7Lar9YsE2GldD5BaXop.kjm/aBsShjR5qt.7wrBkiSsYDnMmfxG', 'admin', 'aktif', NULL, NULL, '2025-10-21 09:26:53'),
(37, 'Siti Nurhaliza', '198002021234567891', '$2b$10$06s893mq0mrf48hg3aiP/O7k46Lt0hStDiy4e4LlytP6MgeMb1xuu', 'guru', 'aktif', NULL, '2025-10-25 10:10:34', '2025-10-21 09:31:53'),
(38, 'Dewi Anggraini', '0012345671', '$2b$10$EivM0bfa6uwkbaTezWNDr.0FvpSzzcg9ny/h8ywC/lP8LL6MmpMva', 'ortu', 'aktif', 4, NULL, '2025-10-21 09:33:12'),
(40, 'Coba V2', '111222334', '$2b$10$WfQODiEY8Y2n5DpoacTSJO16T0spWVOvd75uiJGPavx6qXivymS8W', 'admin', 'aktif', NULL, NULL, '2025-10-21 09:35:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `absensi`
--
ALTER TABLE `absensi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_siswa_kelas_tanggal` (`siswa_id`,`kelas_id`,`tanggal`),
  ADD KEY `guru_id` (`guru_id`),
  ADD KEY `idx_absensi_kelas_id` (`kelas_id`);

--
-- Indexes for table `catatan_detail`
--
ALTER TABLE `catatan_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `header_id` (`header_id`),
  ADD KEY `pengirim_id` (`pengirim_id`);

--
-- Indexes for table `catatan_header`
--
ALTER TABLE `catatan_header`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guru_id` (`guru_id`),
  ADD KEY `orangtua_id` (`orangtua_id`),
  ADD KEY `siswa_id` (`siswa_id`),
  ADD KEY `idx_catatan_kelas_id` (`kelas_id`),
  ADD KEY `idx_catatan_mapel_id` (`mapel_id`),
  ADD KEY `idx_catatan_kategori` (`kategori`),
  ADD KEY `idx_catatan_jenis` (`jenis`),
  ADD KEY `idx_catatan_status` (`status`);

--
-- Indexes for table `guru`
--
ALTER TABLE `guru`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`),
  ADD KEY `idx_guru_status` (`status`),
  ADD KEY `idx_guru_user_id` (`user_id`);

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wali_kelas_id` (`wali_kelas_id`),
  ADD KEY `tahun_ajaran_id` (`tahun_ajaran_id`);

--
-- Indexes for table `kelas_mapel`
--
ALTER TABLE `kelas_mapel`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_kelas_mapel_tahun` (`kelas_id`,`mapel_id`,`tahun_ajaran_id`),
  ADD KEY `idx_kelas_mapel_kelas_id` (`kelas_id`),
  ADD KEY `idx_kelas_mapel_mapel_id` (`mapel_id`),
  ADD KEY `idx_kelas_mapel_guru_id` (`guru_id`),
  ADD KEY `idx_kelas_mapel_tahun_ajaran_id` (`tahun_ajaran_id`);

--
-- Indexes for table `kelas_siswa`
--
ALTER TABLE `kelas_siswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_siswa_kelas_tahun` (`siswa_id`,`kelas_id`,`tahun_ajaran_id`),
  ADD KEY `kelas_id` (`kelas_id`),
  ADD KEY `idx_kelas_siswa_tahun_ajaran_id` (`tahun_ajaran_id`);

--
-- Indexes for table `mapel`
--
ALTER TABLE `mapel`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nilai`
--
ALTER TABLE `nilai`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nilai` (`siswa_id`,`kelas_id`,`mapel_id`,`tahun_ajaran_id`,`semester`),
  ADD KEY `idx_siswa` (`siswa_id`),
  ADD KEY `idx_kelas` (`kelas_id`),
  ADD KEY `idx_mapel` (`mapel_id`),
  ADD KEY `idx_tahun_ajaran` (`tahun_ajaran_id`),
  ADD KEY `idx_semester` (`semester`),
  ADD KEY `nilai_ibfk_5` (`created_by`),
  ADD KEY `nilai_ibfk_6` (`updated_by`);

--
-- Indexes for table `orangtua`
--
ALTER TABLE `orangtua`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `idx_ortu_nik` (`nik`);

--
-- Indexes for table `orangtua_siswa`
--
ALTER TABLE `orangtua_siswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ortu_siswa` (`orangtua_id`,`siswa_id`),
  ADD KEY `idx_ortu_siswa_ortu_id` (`orangtua_id`),
  ADD KEY `idx_ortu_siswa_siswa_id` (`siswa_id`);

--
-- Indexes for table `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nisn` (`nisn`),
  ADD UNIQUE KEY `nik` (`nik`);

--
-- Indexes for table `tahun_ajaran`
--
ALTER TABLE `tahun_ajaran`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_users_ortu_id` (`ortu_id`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `absensi`
--
ALTER TABLE `absensi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `catatan_detail`
--
ALTER TABLE `catatan_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `catatan_header`
--
ALTER TABLE `catatan_header`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `guru`
--
ALTER TABLE `guru`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `kelas_mapel`
--
ALTER TABLE `kelas_mapel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `kelas_siswa`
--
ALTER TABLE `kelas_siswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `mapel`
--
ALTER TABLE `mapel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `nilai`
--
ALTER TABLE `nilai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `orangtua`
--
ALTER TABLE `orangtua`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `orangtua_siswa`
--
ALTER TABLE `orangtua_siswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `siswa`
--
ALTER TABLE `siswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `tahun_ajaran`
--
ALTER TABLE `tahun_ajaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `absensi`
--
ALTER TABLE `absensi`
  ADD CONSTRAINT `absensi_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`),
  ADD CONSTRAINT `absensi_ibfk_2` FOREIGN KEY (`guru_id`) REFERENCES `guru` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `absensi_ibfk_3` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `catatan_detail`
--
ALTER TABLE `catatan_detail`
  ADD CONSTRAINT `catatan_detail_ibfk_1` FOREIGN KEY (`header_id`) REFERENCES `catatan_header` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `catatan_detail_ibfk_2` FOREIGN KEY (`pengirim_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `catatan_header`
--
ALTER TABLE `catatan_header`
  ADD CONSTRAINT `catatan_header_ibfk_1` FOREIGN KEY (`guru_id`) REFERENCES `guru` (`id`),
  ADD CONSTRAINT `catatan_header_ibfk_2` FOREIGN KEY (`orangtua_id`) REFERENCES `orangtua` (`id`),
  ADD CONSTRAINT `catatan_header_ibfk_3` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`),
  ADD CONSTRAINT `fk_catatan_kelas` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_catatan_mapel` FOREIGN KEY (`mapel_id`) REFERENCES `mapel` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `guru`
--
ALTER TABLE `guru`
  ADD CONSTRAINT `guru_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `kelas`
--
ALTER TABLE `kelas`
  ADD CONSTRAINT `kelas_ibfk_1` FOREIGN KEY (`wali_kelas_id`) REFERENCES `guru` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `kelas_ibfk_2` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kelas_mapel`
--
ALTER TABLE `kelas_mapel`
  ADD CONSTRAINT `kelas_mapel_ibfk_1` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kelas_mapel_ibfk_2` FOREIGN KEY (`mapel_id`) REFERENCES `mapel` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kelas_mapel_ibfk_3` FOREIGN KEY (`guru_id`) REFERENCES `guru` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kelas_mapel_ibfk_4` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kelas_siswa`
--
ALTER TABLE `kelas_siswa`
  ADD CONSTRAINT `kelas_siswa_ibfk_1` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kelas_siswa_ibfk_2` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kelas_siswa_ibfk_3` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `nilai`
--
ALTER TABLE `nilai`
  ADD CONSTRAINT `nilai_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nilai_ibfk_2` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nilai_ibfk_3` FOREIGN KEY (`mapel_id`) REFERENCES `mapel` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nilai_ibfk_4` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nilai_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `nilai_ibfk_6` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orangtua_siswa`
--
ALTER TABLE `orangtua_siswa`
  ADD CONSTRAINT `orangtua_siswa_ibfk_1` FOREIGN KEY (`orangtua_id`) REFERENCES `orangtua` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orangtua_siswa_ibfk_2` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_ortu` FOREIGN KEY (`ortu_id`) REFERENCES `orangtua` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
