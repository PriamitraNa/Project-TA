-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 23, 2025 at 06:13 AM
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
-- Database: `a_dummy`
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

-- --------------------------------------------------------

--
-- Table structure for table `chat_conversations`
--

CREATE TABLE `chat_conversations` (
  `id` int(11) NOT NULL,
  `guru_id` int(11) NOT NULL COMMENT 'ID guru (from guru table)',
  `ortu_id` int(11) NOT NULL COMMENT 'ID orang tua (from orangtua table)',
  `siswa_id` int(11) NOT NULL COMMENT 'ID siswa (context untuk conversation)',
  `last_message` text DEFAULT NULL COMMENT 'Pesan terakhir (for preview)',
  `last_message_time` timestamp NULL DEFAULT NULL COMMENT 'Waktu pesan terakhir',
  `unread_count_guru` int(11) DEFAULT 0 COMMENT 'Jumlah pesan belum dibaca oleh guru',
  `unread_count_ortu` int(11) DEFAULT 0 COMMENT 'Jumlah pesan belum dibaca oleh ortu',
  `is_archived_guru` tinyint(1) DEFAULT 0 COMMENT 'Archived by guru?',
  `is_archived_ortu` tinyint(1) DEFAULT 0 COMMENT 'Archived by ortu?',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabel percakapan chat antara guru dan orangtua';

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL COMMENT 'ID conversation',
  `sender_id` int(11) NOT NULL COMMENT 'ID user yang kirim (from users table)',
  `sender_role` enum('guru','ortu') NOT NULL COMMENT 'Role pengirim',
  `message` text NOT NULL COMMENT 'Isi pesan',
  `is_read` tinyint(1) DEFAULT 0 COMMENT 'Sudah dibaca?',
  `read_at` timestamp NULL DEFAULT NULL COMMENT 'Waktu dibaca',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabel pesan chat';

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
(1, 64, 'Budi Santoso', '1980010112340001', 'aktif', '2025-11-23 04:24:09'),
(2, 65, 'Siti Nurhaliza', '1981020212340002', 'aktif', '2025-11-23 04:24:09'),
(3, 66, 'Dewi Anggraini', '1982030312340003', 'aktif', '2025-11-23 04:24:09'),
(4, 67, 'Eko Nugroho', '1983040412340004', 'aktif', '2025-11-23 04:24:09'),
(5, 68, 'Gilang Ramadhan', '1984050512340005', 'aktif', '2025-11-23 04:24:09'),
(6, 69, 'Hana Prameswari', '1985060612340006', 'aktif', '2025-11-23 04:24:09'),
(7, 70, 'Imam Prasetyo', '1986070712340007', 'aktif', '2025-11-23 04:24:09'),
(8, 71, 'Jasmine Putri', '1987080812340008', 'aktif', '2025-11-23 04:24:09'),
(9, 72, 'Kurniawan Sari', '1988090912340009', 'aktif', '2025-11-23 04:24:09');

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
(13, 'Kelas 1', 1, 1),
(14, 'Kelas 2', 2, 1),
(15, 'Kelas 3', 3, 1),
(16, 'Kelas 4', 4, 1),
(17, 'Kelas 5', 5, 1),
(18, 'Kelas 6', 6, 1);

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
(1, 13, 1, 1, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(2, 13, 2, 1, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(3, 13, 3, 1, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(4, 13, 4, 1, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(5, 13, 5, 1, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(6, 13, 6, 1, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(7, 13, 7, 7, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(8, 13, 8, 8, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(9, 13, 9, 9, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(10, 14, 1, 2, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(11, 14, 2, 2, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(12, 14, 3, 2, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(13, 14, 4, 2, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(14, 14, 5, 2, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(15, 14, 6, 2, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(16, 14, 7, 7, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(17, 14, 8, 8, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(18, 14, 9, 9, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(19, 15, 1, 3, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(20, 15, 2, 3, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(21, 15, 3, 3, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(22, 15, 4, 3, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(23, 15, 5, 3, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(24, 15, 6, 3, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(25, 15, 7, 7, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(26, 15, 8, 8, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(27, 15, 9, 9, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(28, 16, 1, 4, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(29, 16, 2, 4, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(30, 16, 3, 4, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(31, 16, 4, 4, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(32, 16, 5, 4, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(33, 16, 6, 4, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(34, 16, 7, 7, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(35, 16, 8, 8, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(36, 16, 9, 9, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(37, 17, 1, 5, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(38, 17, 2, 5, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(39, 17, 3, 5, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(40, 17, 4, 5, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(41, 17, 5, 5, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(42, 17, 6, 5, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(43, 17, 7, 7, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(44, 17, 8, 8, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(45, 17, 9, 9, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(46, 18, 1, 6, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(47, 18, 2, 6, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(48, 18, 3, 6, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(49, 18, 4, 6, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(50, 18, 5, 6, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(51, 18, 6, 6, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(52, 18, 7, 7, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(53, 18, 8, 8, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32'),
(54, 18, 9, 9, 1, '2025-11-23 04:48:32', '2025-11-23 04:48:32');

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
(1, 13, 1, 1),
(2, 13, 2, 1),
(3, 13, 3, 1),
(4, 13, 4, 1),
(5, 13, 5, 1),
(6, 13, 6, 1),
(7, 13, 7, 1),
(8, 13, 8, 1),
(9, 13, 9, 1),
(10, 13, 10, 1),
(11, 14, 11, 1),
(12, 14, 12, 1),
(13, 14, 13, 1),
(14, 14, 14, 1),
(15, 14, 15, 1),
(16, 14, 16, 1),
(17, 14, 17, 1),
(18, 14, 18, 1),
(19, 14, 19, 1),
(20, 14, 20, 1),
(21, 15, 21, 1),
(22, 15, 22, 1),
(23, 15, 23, 1),
(24, 15, 24, 1),
(25, 15, 25, 1),
(26, 15, 26, 1),
(27, 15, 27, 1),
(28, 15, 28, 1),
(29, 15, 29, 1),
(30, 15, 30, 1),
(31, 16, 31, 1),
(32, 16, 32, 1),
(33, 16, 33, 1),
(34, 16, 34, 1),
(35, 16, 35, 1),
(36, 16, 36, 1),
(37, 16, 37, 1),
(38, 16, 38, 1),
(39, 16, 39, 1),
(40, 16, 40, 1),
(41, 17, 41, 1),
(42, 17, 42, 1),
(43, 17, 43, 1),
(44, 17, 44, 1),
(45, 17, 45, 1),
(46, 17, 46, 1),
(47, 17, 47, 1),
(48, 17, 48, 1),
(49, 17, 49, 1),
(50, 17, 50, 1),
(51, 18, 51, 1),
(52, 18, 52, 1),
(53, 18, 53, 1),
(54, 18, 54, 1),
(55, 18, 55, 1),
(56, 18, 56, 1),
(57, 18, 57, 1),
(58, 18, 58, 1),
(59, 18, 59, 1),
(60, 18, 60, 1);

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
(1, 'Pendidikan Pancasila'),
(2, 'Bahasa Indonesia'),
(3, 'Matematika'),
(4, 'Ilmu Pengetahuan Alam (IPA)'),
(5, 'Ilmu Pengetahuan Sosial (IPS)'),
(6, 'Pendidikan Agama'),
(7, 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)'),
(8, 'Seni Budaya dan Prakarya (SBdP)'),
(9, 'Bahasa Inggris');

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
  `nilai_akhir` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'User ID yang create',
  `updated_by` int(11) DEFAULT NULL COMMENT 'User ID yang update'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabel nilai siswa dengan sistem Formatif, Sumatif LM, UTS, UAS';

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
(1, 'Ahmad Fauzi', '3201010101010001', '081200000001', 'Ayah', '2025-11-23 04:32:42'),
(2, 'Budi Santoso', '3201010101010002', '081200000002', 'Ibu', '2025-11-23 04:32:42'),
(3, 'Cici Maharani', '3201010101010003', '081200000003', 'Ayah', '2025-11-23 04:32:42'),
(4, 'Dedi Kurniawan', '3201010101010004', '081200000004', 'Ibu', '2025-11-23 04:32:42'),
(5, 'Evi Lestari', '3201010101010005', '081200000005', 'Ayah', '2025-11-23 04:32:42'),
(6, 'Fajar Pratama', '3201010101010006', '081200000006', 'Ibu', '2025-11-23 04:32:42'),
(7, 'Gina Rahmadani', '3201010101010007', '081200000007', 'Ayah', '2025-11-23 04:32:42'),
(8, 'Hendra Saputra', '3201010101010008', '081200000008', 'Ibu', '2025-11-23 04:32:42'),
(9, 'Intan Puspita', '3201010101010009', '081200000009', 'Ayah', '2025-11-23 04:32:42'),
(10, 'Joko Susilo', '3201010101010010', '081200000010', 'Ibu', '2025-11-23 04:32:42'),
(11, 'Kartini Ayu', '3201010101010011', '081200000011', 'Ayah', '2025-11-23 04:32:42'),
(12, 'Lukman Hakim', '3201010101010012', '081200000012', 'Ibu', '2025-11-23 04:32:42'),
(13, 'Maya Salsabila', '3201010101010013', '081200000013', 'Ayah', '2025-11-23 04:32:42'),
(14, 'Nanda Putri', '3201010101010014', '081200000014', 'Ibu', '2025-11-23 04:32:42'),
(15, 'Oman Firmansyah', '3201010101010015', '081200000015', 'Ayah', '2025-11-23 04:32:42'),
(16, 'Putri Aisyah', '3201010101010016', '081200000016', 'Ibu', '2025-11-23 04:32:42'),
(17, 'Qori Hidayah', '3201010101010017', '081200000017', 'Ayah', '2025-11-23 04:32:42'),
(18, 'Rizky Maulana', '3201010101010018', '081200000018', 'Ibu', '2025-11-23 04:32:42'),
(19, 'Sari Wulandari', '3201010101010019', '081200000019', 'Ayah', '2025-11-23 04:32:42'),
(20, 'Taufik Hidayat', '3201010101010020', '081200000020', 'Ibu', '2025-11-23 04:32:42'),
(21, 'Ummi Salma', '3201010101010021', '081200000021', 'Ayah', '2025-11-23 04:32:42'),
(22, 'Vina Oktaviani', '3201010101010022', '081200000022', 'Ibu', '2025-11-23 04:32:42'),
(23, 'Wawan Setiawan', '3201010101010023', '081200000023', 'Ayah', '2025-11-23 04:32:42'),
(24, 'Yulia Rahma', '3201010101010024', '081200000024', 'Ibu', '2025-11-23 04:32:42'),
(25, 'Zainal Abidin', '3201010101010025', '081200000025', 'Ayah', '2025-11-23 04:32:42'),
(26, 'Abdul Malik', '3201010101010026', '081200000026', 'Ibu', '2025-11-23 04:32:42'),
(27, 'Bella Kartika', '3201010101010027', '081200000027', 'Ayah', '2025-11-23 04:32:42'),
(28, 'Cahya Ramadhan', '3201010101010028', '081200000028', 'Ibu', '2025-11-23 04:32:42'),
(29, 'Dian Anggraini', '3201010101010029', '081200000029', 'Ayah', '2025-11-23 04:32:42'),
(30, 'Eko Julianto', '3201010101010030', '081200000030', 'Ibu', '2025-11-23 04:32:42'),
(31, 'Fitri Handayani', '3201010101010031', '081200000031', 'Ayah', '2025-11-23 04:32:42'),
(32, 'Galih Prakoso', '3201010101010032', '081200000032', 'Ibu', '2025-11-23 04:32:42'),
(33, 'Hariyanto', '3201010101010033', '081200000033', 'Ayah', '2025-11-23 04:32:42'),
(34, 'Indah Permata', '3201010101010034', '081200000034', 'Ibu', '2025-11-23 04:32:42'),
(35, 'Jamaludin', '3201010101010035', '081200000035', 'Ayah', '2025-11-23 04:32:42'),
(36, 'Kiki Amelia', '3201010101010036', '081200000036', 'Ibu', '2025-11-23 04:32:42'),
(37, 'Lilis Nursyah', '3201010101010037', '081200000037', 'Ayah', '2025-11-23 04:32:42'),
(38, 'Maman Suherman', '3201010101010038', '081200000038', 'Ibu', '2025-11-23 04:32:42'),
(39, 'Nia Safira', '3201010101010039', '081200000039', 'Ayah', '2025-11-23 04:32:42'),
(40, 'Opik Nugraha', '3201010101010040', '081200000040', 'Ibu', '2025-11-23 04:32:42'),
(41, 'Putra Aditya', '3201010101010041', '081200000041', 'Wali', '2025-11-23 04:32:42'),
(42, 'Qonita Zahra', '3201010101010042', '081200000042', 'Wali', '2025-11-23 04:32:42'),
(43, 'Rama Wijaya', '3201010101010043', '081200000043', 'Wali', '2025-11-23 04:32:42'),
(44, 'Sinta Marlina', '3201010101010044', '081200000044', 'Wali', '2025-11-23 04:32:42'),
(45, 'Tio Prasetyo', '3201010101010045', '081200000045', 'Wali', '2025-11-23 04:32:42'),
(46, 'Ujang Sulaeman', '3201010101010046', '081200000046', 'Wali', '2025-11-23 04:32:42'),
(47, 'Via Karlina', '3201010101010047', '081200000047', 'Wali', '2025-11-23 04:32:42'),
(48, 'Widi Hartati', '3201010101010048', '081200000048', 'Wali', '2025-11-23 04:32:42'),
(49, 'Yusuf Abdullah', '3201010101010049', '081200000049', 'Wali', '2025-11-23 04:32:42'),
(50, 'Zulfa Khairun', '3201010101010050', '081200000050', 'Wali', '2025-11-23 04:32:42');

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
(1, 1, 1, '2025-11-23 04:32:50'),
(2, 2, 2, '2025-11-23 04:32:50'),
(3, 3, 3, '2025-11-23 04:32:50'),
(4, 4, 4, '2025-11-23 04:32:50'),
(5, 5, 5, '2025-11-23 04:32:50'),
(6, 6, 6, '2025-11-23 04:32:50'),
(7, 7, 7, '2025-11-23 04:32:50'),
(8, 8, 8, '2025-11-23 04:32:50'),
(9, 9, 9, '2025-11-23 04:32:50'),
(10, 10, 10, '2025-11-23 04:32:50'),
(11, 11, 11, '2025-11-23 04:32:50'),
(12, 12, 12, '2025-11-23 04:32:50'),
(13, 13, 13, '2025-11-23 04:32:50'),
(14, 14, 14, '2025-11-23 04:32:50'),
(15, 15, 15, '2025-11-23 04:32:50'),
(16, 16, 16, '2025-11-23 04:32:50'),
(17, 17, 17, '2025-11-23 04:32:50'),
(18, 18, 18, '2025-11-23 04:32:50'),
(19, 19, 19, '2025-11-23 04:32:50'),
(20, 20, 20, '2025-11-23 04:32:50'),
(21, 21, 21, '2025-11-23 04:32:50'),
(22, 22, 22, '2025-11-23 04:32:50'),
(23, 23, 23, '2025-11-23 04:32:50'),
(24, 24, 24, '2025-11-23 04:32:50'),
(25, 25, 25, '2025-11-23 04:32:50'),
(26, 26, 26, '2025-11-23 04:32:50'),
(27, 27, 27, '2025-11-23 04:32:50'),
(28, 28, 28, '2025-11-23 04:32:50'),
(29, 29, 29, '2025-11-23 04:32:50'),
(30, 30, 30, '2025-11-23 04:32:50'),
(31, 31, 31, '2025-11-23 04:32:50'),
(32, 32, 32, '2025-11-23 04:32:50'),
(33, 33, 33, '2025-11-23 04:32:50'),
(34, 34, 34, '2025-11-23 04:32:50'),
(35, 35, 35, '2025-11-23 04:32:50'),
(36, 36, 36, '2025-11-23 04:32:50'),
(37, 37, 37, '2025-11-23 04:32:50'),
(38, 38, 38, '2025-11-23 04:32:50'),
(39, 39, 39, '2025-11-23 04:32:50'),
(40, 40, 40, '2025-11-23 04:32:50'),
(41, 41, 41, '2025-11-23 04:32:50'),
(42, 41, 42, '2025-11-23 04:32:50'),
(43, 42, 43, '2025-11-23 04:32:50'),
(44, 42, 44, '2025-11-23 04:32:50'),
(45, 43, 45, '2025-11-23 04:32:50'),
(46, 43, 46, '2025-11-23 04:32:50'),
(47, 44, 47, '2025-11-23 04:32:50'),
(48, 44, 48, '2025-11-23 04:32:50'),
(49, 45, 49, '2025-11-23 04:32:50'),
(50, 45, 50, '2025-11-23 04:32:50'),
(51, 46, 51, '2025-11-23 04:32:50'),
(52, 46, 52, '2025-11-23 04:32:50'),
(53, 47, 53, '2025-11-23 04:32:50'),
(54, 47, 54, '2025-11-23 04:32:50'),
(55, 48, 55, '2025-11-23 04:32:50'),
(56, 48, 56, '2025-11-23 04:32:50'),
(57, 49, 57, '2025-11-23 04:32:50'),
(58, 49, 58, '2025-11-23 04:32:50'),
(59, 50, 59, '2025-11-23 04:32:50'),
(60, 50, 60, '2025-11-23 04:32:50');

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
(1, 'Ahmad Fikri', '2025100001', '3201011503150001', 'Laki-laki', '2015-03-15', 'Bandung', '2025-11-23 04:25:24'),
(2, 'Bunga Melati', '2025100002', '3201012207150002', 'Perempuan', '2015-07-22', 'Bandung', '2025-11-23 04:25:24'),
(3, 'Cahyo Pratama', '2025100003', '3201010110140003', 'Laki-laki', '2014-10-01', 'Garut', '2025-11-23 04:25:24'),
(4, 'Dinda Lestari', '2025100004', '3201010505120004', 'Perempuan', '2014-05-05', 'Tasikmalaya', '2025-11-23 04:25:24'),
(5, 'Eka Nugraha', '2025100005', '3201012501160005', 'Laki-laki', '2016-01-25', 'Cimahi', '2025-11-23 04:25:24'),
(6, 'Farah Khairani', '2025100006', '3201011812180006', 'Perempuan', '2016-12-18', 'Bandung', '2025-11-23 04:25:24'),
(7, 'Gilang Saputra', '2025100007', '3201013004300007', 'Laki-laki', '2015-04-30', 'Sumedang', '2025-11-23 04:25:24'),
(8, 'Hana Putri', '2025100008', '3201011408140008', 'Perempuan', '2014-08-14', 'Bandung', '2025-11-23 04:25:24'),
(9, 'Ilham Prasetyo', '2025100009', '3201010706070009', 'Laki-laki', '2014-06-07', 'Cianjur', '2025-11-23 04:25:24'),
(10, 'Jasmine Rahma', '2025100010', '3201012910290010', 'Perempuan', '2015-10-29', 'Bandung', '2025-11-23 04:25:24'),
(11, 'Khalid Ramadhan', '2025100011', '3201011203120011', 'Laki-laki', '2013-03-12', 'Bandung', '2025-11-23 04:25:24'),
(12, 'Laila Nur Aisyah', '2025100012', '3201012506120012', 'Perempuan', '2013-06-25', 'Garut', '2025-11-23 04:25:24'),
(13, 'Miftah Ramadhan', '2025100013', '3201010101130013', 'Laki-laki', '2014-01-01', 'Bandung', '2025-11-23 04:30:08'),
(14, 'Nadia Safitri', '2025100014', '3201010202140014', 'Perempuan', '2014-02-02', 'Bandung', '2025-11-23 04:30:08'),
(15, 'Oki Pratama', '2025100015', '3201010303150015', 'Laki-laki', '2014-03-03', 'Cimahi', '2025-11-23 04:30:08'),
(16, 'Putri Aisyah', '2025100016', '3201010404160016', 'Perempuan', '2014-04-04', 'Garut', '2025-11-23 04:30:08'),
(17, 'Qori Hidayah', '2025100017', '3201010505170017', 'Perempuan', '2014-05-05', 'Tasikmalaya', '2025-11-23 04:30:08'),
(18, 'Raka Dwi Putra', '2025100018', '3201010606180018', 'Laki-laki', '2014-06-06', 'Sumedang', '2025-11-23 04:30:08'),
(19, 'Salsa Nurhaliza', '2025100019', '3201010707190019', 'Perempuan', '2014-07-07', 'Bandung', '2025-11-23 04:30:08'),
(20, 'Teguh Prakoso', '2025100020', '3201010808200020', 'Laki-laki', '2014-08-08', 'Cianjur', '2025-11-23 04:30:08'),
(21, 'Ulya Rahmadani', '2025100021', '3201010909210021', 'Perempuan', '2014-09-09', 'Bandung', '2025-11-23 04:30:08'),
(22, 'Vino Aditya', '2025100022', '3201011010220022', 'Laki-laki', '2014-10-10', 'Bandung', '2025-11-23 04:30:08'),
(23, 'Wulan Kartika', '2025100023', '3201011111230023', 'Perempuan', '2014-11-11', 'Bandung', '2025-11-23 04:30:08'),
(24, 'Yusuf Alfarizi', '2025100024', '3201011212240024', 'Laki-laki', '2014-12-12', 'Garut', '2025-11-23 04:30:08'),
(25, 'Zahra Khairunnisa', '2025100025', '3201010101150025', 'Perempuan', '2015-01-10', 'Bandung', '2025-11-23 04:30:08'),
(26, 'Agus Setiawan', '2025100026', '3201010202160026', 'Laki-laki', '2015-02-11', 'Cimahi', '2025-11-23 04:30:08'),
(27, 'Bella Maharani', '2025100027', '3201010303170027', 'Perempuan', '2015-03-12', 'Bandung', '2025-11-23 04:30:08'),
(28, 'Candra Wijaya', '2025100028', '3201010404180028', 'Laki-laki', '2015-04-13', 'Tasikmalaya', '2025-11-23 04:30:08'),
(29, 'Dinda Rahma', '2025100029', '3201010505190029', 'Perempuan', '2015-05-14', 'Bandung', '2025-11-23 04:30:08'),
(30, 'Erlangga Putra', '2025100030', '3201010606200030', 'Laki-laki', '2015-06-15', 'Sumedang', '2025-11-23 04:30:08'),
(31, 'Fauziah Lestari', '2025100031', '3201010707210031', 'Perempuan', '2015-07-16', 'Bandung', '2025-11-23 04:30:08'),
(32, 'Gerry Mahardika', '2025100032', '3201010808220032', 'Laki-laki', '2015-08-17', 'Cianjur', '2025-11-23 04:30:08'),
(33, 'Helmi Nur Fahri', '2025100033', '3201010909230033', 'Laki-laki', '2015-09-18', 'Bandung', '2025-11-23 04:30:08'),
(34, 'Indah Permatasari', '2025100034', '3201011010240034', 'Perempuan', '2015-10-19', 'Bandung', '2025-11-23 04:30:08'),
(35, 'Joko Satrio', '2025100035', '3201011111250035', 'Laki-laki', '2015-11-20', 'Garut', '2025-11-23 04:30:08'),
(36, 'Kartika Dewi', '2025100036', '3201011212260036', 'Perempuan', '2015-12-21', 'Bandung', '2025-11-23 04:30:08'),
(37, 'Lukman Hakim', '2025100037', '3201010101170037', 'Laki-laki', '2016-01-11', 'Cimahi', '2025-11-23 04:30:08'),
(38, 'Maya Salsabila', '2025100038', '3201010202180038', 'Perempuan', '2016-02-12', 'Bandung', '2025-11-23 04:30:08'),
(39, 'Naufal Rizky', '2025100039', '3201010303190039', 'Laki-laki', '2016-03-13', 'Bandung', '2025-11-23 04:30:08'),
(40, 'Oliviana Putri', '2025100040', '3201010404200040', 'Perempuan', '2016-04-14', 'Tasikmalaya', '2025-11-23 04:30:08'),
(41, 'Pandu Aditya', '2025100041', '3201010505210041', 'Laki-laki', '2016-05-15', 'Garut', '2025-11-23 04:30:08'),
(42, 'Qania Zahra', '2025100042', '3201010606220042', 'Perempuan', '2016-06-16', 'Bandung', '2025-11-23 04:30:08'),
(43, 'Rizky Maulana', '2025100043', '3201010707230043', 'Laki-laki', '2016-07-17', 'Bandung', '2025-11-23 04:30:08'),
(44, 'Siti Maryam', '2025100044', '3201010808240044', 'Perempuan', '2016-08-18', 'Cianjur', '2025-11-23 04:30:08'),
(45, 'Taufik Hidayat', '2025100045', '3201010909250045', 'Laki-laki', '2016-09-19', 'Bandung', '2025-11-23 04:30:08'),
(46, 'Ummi Salma', '2025100046', '3201011010260046', 'Perempuan', '2016-10-20', 'Bandung', '2025-11-23 04:30:08'),
(47, 'Vina Oktaviani', '2025100047', '3201011111270047', 'Perempuan', '2016-11-21', 'Sumedang', '2025-11-23 04:30:08'),
(48, 'Wahyu Pratama', '2025100048', '3201011212280048', 'Laki-laki', '2016-12-22', 'Bandung', '2025-11-23 04:30:08'),
(49, 'Yolanda Fitri', '2025100049', '3201010101190049', 'Perempuan', '2013-01-15', 'Bandung', '2025-11-23 04:30:08'),
(50, 'Zidan Alfaruq', '2025100050', '3201010202200050', 'Laki-laki', '2013-02-16', 'Garut', '2025-11-23 04:30:08'),
(51, 'Ahmad Junaedi', '2025100051', '3201010303210051', 'Laki-laki', '2013-03-17', 'Tasikmalaya', '2025-11-23 04:30:08'),
(52, 'Berlian Cahya', '2025100052', '3201010404220052', 'Perempuan', '2013-04-18', 'Bandung', '2025-11-23 04:30:08'),
(53, 'Cici Aprillia', '2025100053', '3201010505230053', 'Perempuan', '2013-05-19', 'Bandung', '2025-11-23 04:30:08'),
(54, 'Doni Prakoso', '2025100054', '3201010606240054', 'Laki-laki', '2013-06-20', 'Cimahi', '2025-11-23 04:30:08'),
(55, 'Elisa Maharani', '2025100055', '3201010707250055', 'Perempuan', '2013-07-21', 'Bandung', '2025-11-23 04:30:08'),
(56, 'Fikri Nurjaman', '2025100056', '3201010808260056', 'Laki-laki', '2013-08-22', 'Bandung', '2025-11-23 04:30:08'),
(57, 'Gracia Natalia', '2025100057', '3201010909270057', 'Perempuan', '2013-09-23', 'Bandung', '2025-11-23 04:30:08'),
(58, 'Haris Setiadi', '2025100058', '3201011010280058', 'Laki-laki', '2013-10-24', 'Garut', '2025-11-23 04:30:08'),
(59, 'Intan Puspita', '2025100059', '3201011111290059', 'Perempuan', '2013-11-25', 'Bandung', '2025-11-23 04:30:08'),
(60, 'Johan Kristiawan', '2025100060', '3201011212300060', 'Laki-laki', '2013-12-26', 'Bandung', '2025-11-23 04:30:08');

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
(1, '2025/2026', 'Ganjil', '2025-07-15', '2025-12-20', 'aktif'),
(2, '2025/2026', 'Genap', '2026-01-05', '2026-06-20', 'tidak-aktif');

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
(1, 'Isma', '00000001', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'admin', 'aktif', NULL, '2025-11-23 04:12:01', '2025-09-23 17:12:03'),
(64, 'Budi Santoso', '1980010112340001', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-11-23 04:35:10'),
(65, 'Siti Nurhaliza', '1981020212340002', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-11-23 04:35:10'),
(66, 'Dewi Anggraini', '1982030312340003', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-11-23 04:35:10'),
(67, 'Eko Nugroho', '1983040412340004', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-11-23 04:35:10'),
(68, 'Gilang Ramadhan', '1984050512340005', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-11-23 04:35:10'),
(69, 'Hana Prameswari', '1985060612340006', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-11-23 04:35:10'),
(70, 'Imam Prasetyo', '1986070712340007', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-11-23 04:35:10'),
(71, 'Jasmine Putri', '1987080812340008', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-11-23 04:35:10'),
(72, 'Kurniawan Sari', '1988090912340009', '$2b$10$f8Lln6goTnc3vNgcfFizyumb4OfXfl4hm4LjkRiHc1nJrmVLfd2Cq', 'guru', 'aktif', NULL, NULL, '2025-11-23 04:35:10');

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
-- Indexes for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_conversation` (`guru_id`,`ortu_id`,`siswa_id`),
  ADD KEY `idx_guru` (`guru_id`),
  ADD KEY `idx_ortu` (`ortu_id`),
  ADD KEY `idx_siswa` (`siswa_id`),
  ADD KEY `idx_last_message_time` (`last_message_time`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversation` (`conversation_id`,`created_at`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_is_read` (`is_read`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `catatan_detail`
--
ALTER TABLE `catatan_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `catatan_header`
--
ALTER TABLE `catatan_header`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guru`
--
ALTER TABLE `guru`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `kelas_mapel`
--
ALTER TABLE `kelas_mapel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `kelas_siswa`
--
ALTER TABLE `kelas_siswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `mapel`
--
ALTER TABLE `mapel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `nilai`
--
ALTER TABLE `nilai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orangtua`
--
ALTER TABLE `orangtua`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `orangtua_siswa`
--
ALTER TABLE `orangtua_siswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `siswa`
--
ALTER TABLE `siswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `tahun_ajaran`
--
ALTER TABLE `tahun_ajaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

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
-- Constraints for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  ADD CONSTRAINT `chat_conversations_ibfk_1` FOREIGN KEY (`guru_id`) REFERENCES `guru` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_conversations_ibfk_2` FOREIGN KEY (`ortu_id`) REFERENCES `orangtua` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_conversations_ibfk_3` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
