-- ==========================================================
-- SQL TRÍCH XUẤT CHO SERVICE A: TOUR-CATALOG
-- Nguồn: mytour.sql
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Cấu trúc bảng `categories`
CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dữ liệu bảng `categories`
INSERT INTO `categories` (`category_id`, `category_name`) VALUES
(1, 'Education');


-- 2. Cấu trúc bảng `regions`
CREATE TABLE `regions` (
  `region_id` int(11) NOT NULL AUTO_INCREMENT,
  `region_name` varchar(100) NOT NULL,
  PRIMARY KEY (`region_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dữ liệu bảng `regions`
INSERT INTO `regions` (`region_id`, `region_name`) VALUES
(1, 'North'),
(2, 'Central'),
(3, 'South');


-- 3. Cấu trúc bảng `tours`
CREATE TABLE `tours` (
  `tour_id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `region_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `available_slots` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL, -- ID người tạo (liên kết logic với Service Identity)
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`tour_id`),
  KEY `region_id` (`region_id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `tours` (`tour_id`, `tour_name`, `description`, `location`, `region_id`, `category_id`, `start_date`, `end_date`, `price`, `available_slots`, `image_url`, `created_by`, `status`, `created_at`) VALUES
(9, 'Mekong Delta Tour', '', 'Bac Lieu', 3, 1, '2025-11-26', '2025-11-30', 50.00, 43, '/uploads/tours/1763761424901-427154603.jpg', 7, 'approved', '2025-11-22 04:43:44'),
(14, 'Mekong Delta Fruit Garden Tour', '', 'Bac Lieu', 3, 1, '2025-11-25', '2025-11-28', 45.00, 40, '/uploads/tours/1763763449486-136925584.jpg', 7, 'approved', '2025-11-22 05:17:29'),
(15, 'Cai Be Fruit Picking & Rowing Boat Tour', '', 'Cai Be', 3, 1, '2025-11-20', '2025-11-24', 60.00, 38, '/uploads/tours/1763763558737-617409084.jpeg', 7, 'approved', '2025-11-22 05:19:18'),
(16, 'Mekong Garden Farming Experience Tour', 'Ca Mau', 'Ca Mau', 3, 1, '2025-11-22', '2025-11-25', 46.00, 50, '/uploads/tours/1763763656225-869983958.jpg', 7, 'approved', '2025-11-22 05:20:56'),
(17, 'Thai Nguyen Tea Picking Experience Tour', '', 'Thai Nguyen', 1, 1, '2025-11-27', '2025-11-30', 60.00, 45, '/uploads/tours/1763763842087-960999693.webp', 7, 'approved', '2025-11-22 05:24:02'),
(20, 'Golden Rice Harvest Experience Tour', '', 'Sa Pa', 1, 1, '2025-11-26', '2025-11-30', 45.00, 60, '/uploads/tours/1763764062602-847237518.jpg', 7, 'approved', '2025-11-22 05:27:42');


ALTER TABLE `tours`
  ADD CONSTRAINT `tours_ibfk_1` FOREIGN KEY (`region_id`) REFERENCES `regions` (`region_id`),
  ADD CONSTRAINT `tours_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

COMMIT;