-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 13, 2026 at 01:03 PM
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
-- Database: `meteran_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `action`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'login_success', 'User logged in', '::1', '2026-08-08 16:34:27'),
(2, 1, 'login_success', 'User logged in', '::1', '2026-08-11 09:02:07'),
(3, 1, 'login_success', 'User logged in', '::1', '2026-08-11 09:02:16'),
(4, 1, 'login_success', 'User logged in', '::1', '2026-08-11 09:09:15'),
(5, 1, 'login_success', 'User logged in', '::1', '2026-08-12 01:35:15'),
(6, 3, 'login_success', 'User logged in', '::1', '2026-08-12 01:41:20'),
(7, 1, 'login_success', 'User logged in', '::1', '2026-08-12 01:41:58'),
(8, 1, 'login_success', 'User logged in', '::1', '2026-08-12 01:46:34'),
(9, 3, 'login_success', 'User logged in', '::1', '2026-08-12 05:24:32'),
(10, 6, 'register_success', 'User baru mendaftar: asep', '::1', '2026-08-12 05:27:24'),
(11, 1, 'login_success', 'User logged in', '::1', '2026-08-12 05:32:01'),
(12, 3, 'login_success', 'User logged in', '::1', '2026-08-12 05:44:47'),
(13, 1, 'login_success', 'User logged in', '::1', '2026-08-12 06:02:03'),
(14, 1, 'admin_create_user', 'Admin admin menambahkan pengguna sepri', '::1', '2026-08-12 06:02:49'),
(15, 3, 'login_success', 'User logged in', '::1', '2026-08-12 14:10:23'),
(16, 1, 'login_success', 'User logged in', '::1', '2026-08-12 14:11:08'),
(17, 1, 'login_success', 'User logged in', '::1', '2026-08-12 14:11:45'),
(18, 3, 'login_success', 'User logged in', '::1', '2026-08-12 14:36:40'),
(19, 3, 'login_success', 'User logged in', '::1', '2026-08-13 05:24:20'),
(20, 1, 'login_success', 'User logged in', '::1', '2026-08-13 05:38:05'),
(21, 3, 'login_success', 'User logged in', '::1', '2026-08-13 05:38:53'),
(22, 3, 'login_success', 'User logged in', '::1', '2026-08-13 06:06:29'),
(23, 3, 'login_failed', 'Failed login for: user', '::1', '2026-08-13 06:23:18'),
(24, 3, 'login_failed', 'Failed login for: user', '::1', '2026-08-13 06:24:33'),
(25, 3, 'login_failed', 'Failed login for: user', '::1', '2026-08-13 06:26:48'),
(26, 3, 'login_failed', 'Failed login for: user', '::1', '2026-08-13 06:40:53'),
(27, 3, 'login_failed', 'Failed login for: user', '::1', '2026-08-13 06:44:55'),
(28, 3, 'login_success', 'User logged in', '::1', '2026-08-13 07:02:46'),
(29, 3, 'login_success', 'User logged in', '::1', '2026-08-13 08:51:05'),
(30, 3, 'login_success', 'User logged in', '::1', '2026-08-13 09:03:56'),
(31, 1, 'login_success', 'User logged in', '::1', '2026-08-13 09:05:12'),
(32, 3, 'login_success', 'User logged in', '::1', '2026-08-13 09:06:14'),
(33, 1, 'login_success', 'User logged in', '::1', '2026-08-13 09:13:25'),
(34, 1, 'admin_create_device', 'Admin admin menambahkan device 00099900', '::1', '2026-08-13 09:15:02'),
(35, 3, 'login_success', 'User logged in', '::1', '2026-08-13 10:24:26'),
(36, 1, 'login_success', 'User logged in', '::1', '2026-08-13 10:29:45'),
(37, 1, 'admin_create_user', 'Admin admin menambahkan pengguna admin1', '::1', '2026-08-13 10:33:12'),
(38, 1, 'admin_delete_user', 'Admin admin menghapus pengguna penjual', '::1', '2026-08-13 10:33:40'),
(39, 8, 'login_success', 'User logged in', '::1', '2026-08-13 10:33:55');

-- --------------------------------------------------------

--
-- Table structure for table `bill_pricing`
--

CREATE TABLE `bill_pricing` (
  `id` int(11) NOT NULL,
  `price_per_m3` decimal(10,2) NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bill_pricing`
--

INSERT INTO `bill_pricing` (`id`, `price_per_m3`, `effective_from`, `effective_to`, `is_active`, `notes`, `created_at`) VALUES
(1, 3000.00, '2024-01-01', NULL, 1, 'Tarif default Rp 3.000 per m3', '2026-08-08 16:12:46'),
(2, 3000.00, '2024-01-01', NULL, 1, 'Tarif default Rp 3.000 per m3', '2026-08-12 01:20:20'),
(3, 3000.00, '2024-01-01', NULL, 1, 'Tarif default Rp 3.000 per m3', '2026-08-12 01:22:30');

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `id` int(11) NOT NULL,
  `device_id` varchar(16) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `serial_number` varchar(64) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `owner_user_id` int(11) DEFAULT NULL,
  `api_key` varchar(64) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_seen` timestamp NULL DEFAULT NULL,
  `battery_voltage` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `devices`
--

INSERT INTO `devices` (`id`, `device_id`, `name`, `serial_number`, `location`, `latitude`, `longitude`, `owner_user_id`, `api_key`, `is_active`, `last_seen`, `battery_voltage`, `created_at`, `updated_at`) VALUES
(1, '0016181234567890', 'ESP32-CAM-Meter-01', 'SN-0016181234567890', 'Rumah Utama', -6.1738135, 106.7505167, NULL, 'esp32cam-001-aaaa-bbbb-cccc-dddd-eeee', 1, NULL, NULL, '2026-08-08 16:12:46', '2026-08-12 01:19:22'),
(4, '00099900', 'ESP32 S3', '1234', NULL, -6.1443000, 106.7944660, 7, 'c4879655baf1f34e05aa651d5e827536ecbacc9b2b34ecce', 1, NULL, NULL, '2026-08-13 09:15:02', '2026-08-13 09:15:02');

-- --------------------------------------------------------

--
-- Table structure for table `meter_readings`
--

CREATE TABLE `meter_readings` (
  `id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `reading` bigint(20) NOT NULL,
  `confidence` decimal(5,4) NOT NULL DEFAULT 0.9500,
  `reading_date` datetime NOT NULL,
  `daily_usage` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bill_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `battery_voltage` decimal(5,2) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `image_base64` longtext DEFAULT NULL,
  `ocr_method` varchar(20) DEFAULT 'TFLITE',
  `manual_corrected` tinyint(1) DEFAULT 0,
  `original_reading` bigint(20) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` enum('admin','user','penjual_pulsa') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `email`, `phone`, `address`, `role`, `is_active`, `created_at`, `last_login`) VALUES
(1, 'admin', '$2y$10$b/l8YV4Xno0TsUSuSmZdO.ZtbUIKV56pujbbLKfvhqrf2tVWp9uYO', 'admin', 'admin@gmail.com', NULL, NULL, 'admin', 1, '2026-08-08 16:34:00', '2026-08-13 10:29:45'),
(3, 'user', '$2y$10$XPMbVLA9r52EBErlzgtd4u1ncSvZ4lBRevTer4szt6TGwnOCkTVWm', 'Demo User', 'user@meteran.local', NULL, NULL, 'user', 1, '2026-08-12 01:23:47', '2026-08-13 10:24:26'),
(6, 'asep', '$2y$10$Rf8TCnhC/e4THuch/nH7bOmUB0FzKiDTzsnzjDwWRII63ttarcruG', 'asep', 'asep@gmail.com', NULL, NULL, 'user', 1, '2026-08-12 05:27:24', NULL),
(7, 'sepri', '$2y$10$19UG4umslTjwp7WntbSeW.qLkk3BaQHJDoTsKQDUf9Td/xiQYMw/y', 'sepri', 'ramadhansefrian@gmail.com', '894040', 'bjxjxhiixhxi', 'user', 1, '2026-08-12 06:02:49', NULL),
(8, 'admin1', '$2y$10$Wq.SYk6ZFE542hBBsNXaTeEJN5Hvmbos8a6IIan58hWHiMAwdsaWS', 'bbb', 'kkmm@gmai.com', '222', '33eedd', 'admin', 1, '2026-08-13 10:33:12', '2026-08-13 10:33:55');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(128) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `expires_at`, `created_at`) VALUES
(1, 1, '236af07f813d56da1d6928cb1b1aa14e447074dc678ec28468d43e49ba05f43922c8675adaf55db418cd1112735c550a9c0e7013cdd8e54296a29a991089cb26', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-09 11:34:27', '2026-08-08 16:34:27'),
(2, 1, '084dd3d4a981cdd4751c309b89d440803280596a9d46f7b25216587ac257c81ab6763e4eb45c388316f86d96fe3dfd02ef6ff50b49241ac0f1e9bfedc8513e1f', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-12 04:02:07', '2026-08-11 09:02:07'),
(3, 1, 'cabfae8df9dde64f46eabe024e80b7832ff3dfe3741dcebc988998821317525660c6de423d74b57940acc745bdefa6b3cb3c9d326bd5b0e54f92f1c039b95344', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-12 04:02:16', '2026-08-11 09:02:16'),
(4, 1, 'b832c4bfb7ff088e7734be0701ada421a87897991c4889d1a3d07557d4a2845feaebc13e86d8912fa563b34347e7b83f3f43cb0b38bd046878c75ce133cd27b7', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-12 04:09:15', '2026-08-11 09:09:15'),
(5, 1, '829d129d6e7d5410ce752f3bb55bf8afa052a3abb4d9a7438662e46ccfe0e216e0a9f2d101e930c135069fee884aa20dca05ca773e4b51e1f27e71fe3ed6158d', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-12 20:35:15', '2026-08-12 01:35:15'),
(6, 3, 'cdd85d6be52e86866e7e522d7f2165d4c93262b4427ea9c7ae3fbd6697c739295bf628acaba9410ed81a6ef9e5e6ef281c42f53bf8ce25ef6b90a3616fd35a32', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-12 20:41:20', '2026-08-12 01:41:20'),
(7, 1, '0e633ecc3c4e83f726ea9539b6bb945447a1831f10b018b14b1203e813a669bd0e8f4bd1afce62ae7d35fdfe4f776e2797589ba16fd1a0f7beab8561087e7b78', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-12 20:41:58', '2026-08-12 01:41:58'),
(8, 1, 'f3955f7a8a07eee83b5a870ec43e16da79a8705e824ac6301ecea9d3649ee06231b0406c4233028e5ae9fb6d459c997780f8bd8a952dc59295ae3afb76edcfac', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-12 20:46:34', '2026-08-12 01:46:34'),
(9, 3, '8ad82785c38c29028a86856b9d4632e2c96beb9bb436bddb9731e9b2007678ccc2899d71aec3cc92e52fcb5af26b72ab9da027d4b78051d7c42673206e539708', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-13 00:24:32', '2026-08-12 05:24:32'),
(10, 6, 'aab43aeca3ef72b8141d9a8742583af188d219f9093d06b008167efaeed696509b02da7bfa14edbc609072b13c2078065b9b28460880731cbdb34d10c755e73f', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-13 00:27:24', '2026-08-12 05:27:24'),
(11, 1, 'd382999548003e9155a25170f588df68aabbb0e7d0a2091aba6e9f3016f6101000612ef338ff479a23ea0d5e52a9ff31209b8335545d0f510fdc96005ab61ff0', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-13 00:32:01', '2026-08-12 05:32:01'),
(12, 3, '107f97407a2abd40acb6cf1b048b0b62181669fdced769c9e24f0910a6c41039bcd2ab538c1db3530239eaa07c88d3f426114095dc7714d17cda8dce180c450c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-13 00:44:47', '2026-08-12 05:44:47'),
(13, 1, '23236b4d7faffee618bd90b2a1c4d1bb27039ca22f6566e64849426ed3dc71a9ff55542ed496af21da7e68ff5174cdc26f94501467f5e7bf99b60ee70cb5b028', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-13 01:02:03', '2026-08-12 06:02:03'),
(14, 3, '5c467243229db1b00330dc920e45a842fbc98ba6c10342ea4e2a90a283e45a1382a69521c35eaabe5e01aaf578eee2b214354f63645859864a8a861ab1a9d9c8', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-13 09:10:23', '2026-08-12 14:10:23'),
(15, 1, '67f0eb4798b1e9ea493c56f048b5a870c754ce9f24f7f45ffab704b51721d8fe23b542475cf73072da76df8391873e13f1c51dd6d4bf59e362a7a86c1488c76e', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-13 09:11:08', '2026-08-12 14:11:08'),
(16, 1, '6d5d6b48f072c3697860c0f87447b0989acfa48ceb254c58282e985beea30b47da42e6bbd35f4fd4893b80c14bf5eacf43149d7b123b9ae05c925b4b66eed5ee', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-13 09:11:45', '2026-08-12 14:11:45'),
(17, 3, 'fb26b1929b6071dc8d91f9f6d5b5927fa3debba5f444d388a2bfe19dbf4a3e44f6322d4b16a15c7c5c9678542188f40877e1471281f538bab69cf1a99fb1b1ca', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-13 09:36:40', '2026-08-12 14:36:40'),
(18, 3, 'f3e8283515f31d6527cff6e605d5c3feb79bf208c8f594fb4c3a6c9f54a97bdc20fbdaff87582dc0b18ad6a6aaaba9902cf011d0dd1cff7b10a6ebe58ead8b83', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-14 00:24:20', '2026-08-13 05:24:20'),
(19, 1, '0c505b521893a53755bdd50bd7ccc6054a805634017db1a0c0d6f6d789b1482025351ad2cd338374e9755f3e34cafa45193c3df04a98af4b982d282c2b9f2bcd', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-14 00:38:05', '2026-08-13 05:38:05'),
(20, 3, '263fc23a46bd50f63290b012091ae5371c3cfcacf00c8b87e8924edc6f428e6f7553de28e084710bdb5aace62855ab11980281a133d8147f2c97353b9ccfcc72', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-14 00:38:53', '2026-08-13 05:38:53'),
(21, 3, 'eb53cd730dea82d0b3230d6c655c51f88ea7535b7e744b12946b9de25ce0944edc21f106de13c94a9a0dda2c6d30348abad5b877169b2e4ff5c635df54570ba7', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 01:06:29', '2026-08-13 06:06:29'),
(22, 3, 'b0aafcdc2ac47e8813dff2cf2e4d5e6618abe50a1d498029f54465cc64f227aa62572abdb84964a0db3f03fc47fce8753032bb70a6167bb8142d37c48275122e', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 02:02:46', '2026-08-13 07:02:46'),
(23, 3, '001dfd618bcd3fba8bd607e592255801c2220caa8c18a02892da0e91d9b443ca7ca47bb0418480a6f9759e2ec94fa8200b16878af099ff4600ce9145209cfb96', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 03:51:05', '2026-08-13 08:51:05'),
(24, 3, '09081c548e54bd936843c927ad9873512274be4c161542fd964651476aa616d76355c5231aa63a9276927b5fcf63b895fccf2eaf8b402ecbe6d4f20be7b2bb86', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 04:03:56', '2026-08-13 09:03:56'),
(25, 1, '6afb086e1e9eabb4a2805c3c0bb217747a29937be9455fa1662f0a882c7a2dfe0b46d1f2d62b784d8de707ff5567b271cb342d722a08357fcfa9f8cbb8f341bf', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 04:05:12', '2026-08-13 09:05:12'),
(26, 3, 'b25337d7d92b55e825db076059cfc62932b12c77c5b7e1bc85346eb2927a49d3694d27daeb130556c55502f875119511d2bd7fac0709d9ec4e6502e213c73b3f', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 04:06:14', '2026-08-13 09:06:14'),
(27, 1, 'ccf64c4710a8645c5185057ce4634a16bea94565fef6ed93423d03123fe7abd98018ef4518c500696eff9ade3605ea6f13091d725ce3a67795937401c87230fc', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 04:13:25', '2026-08-13 09:13:25'),
(28, 3, '9a74b3d51602b8d87db305c08bb016f755eab3f6bffd5a630580e570923638ea8fa352061fbb66466add616a99e749d4f9e5e0c39452f70b08fdf55b4a398272', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 05:24:26', '2026-08-13 10:24:26'),
(29, 1, 'c1fb2c2f0ffa2b3c2438f831fc39732010da597663ebda245aea4ac512ac5a0d2ad364fd3e9aaacec6fe1438cb9a1334f3575948c0cb3809bf19ead504a6c37c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 05:29:45', '2026-08-13 10:29:45'),
(30, 8, '235604495f23c365076422eeabe65493b10de26425597a4665c95854b4a51d89ed4cf883d45dc643cfa07438688ee13e22253698db382c6a57f16c08704d5342', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '2026-08-14 05:33:55', '2026-08-13 10:33:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_action` (`user_id`,`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `bill_pricing`
--
ALTER TABLE `bill_pricing`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_id` (`device_id`),
  ADD UNIQUE KEY `api_key` (`api_key`),
  ADD KEY `idx_device_id` (`device_id`),
  ADD KEY `fk_devices_owner` (`owner_user_id`);

--
-- Indexes for table `meter_readings`
--
ALTER TABLE `meter_readings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reading_date` (`reading_date`),
  ADD KEY `idx_device_id` (`device_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_token` (`session_token`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `bill_pricing`
--
ALTER TABLE `bill_pricing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `meter_readings`
--
ALTER TABLE `meter_readings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `devices`
--
ALTER TABLE `devices`
  ADD CONSTRAINT `fk_devices_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `meter_readings`
--
ALTER TABLE `meter_readings`
  ADD CONSTRAINT `meter_readings_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
