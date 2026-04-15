-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Nov 23, 2025 at 12:47 AM
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
-- Database: `mytour`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `tour_id` int(11) DEFAULT NULL,
  `booking_date` datetime DEFAULT current_timestamp(),
  `num_people` int(11) DEFAULT NULL,
  `adults` int(11) DEFAULT 0,
  `children` int(11) DEFAULT 0,
  `small_children` int(11) DEFAULT 0,
  `infants` int(11) DEFAULT 0,
  `customer_name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `visa_option` tinyint(1) DEFAULT 0,
  `visa_count` int(11) DEFAULT 0,
  `single_room_option` tinyint(1) DEFAULT 0,
  `single_room_count` int(11) DEFAULT 0,
  `payment_method` enum('cash','bank','credit_card','momo','zalo','paypal') DEFAULT 'cash',
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `user_id`, `tour_id`, `booking_date`, `num_people`, `adults`, `children`, `small_children`, `infants`, `customer_name`, `email`, `phone`, `address`, `notes`, `visa_option`, `visa_count`, `single_room_option`, `single_room_count`, `payment_method`, `total_price`, `status`) VALUES
(2, 8, 38, '2025-11-22 06:38:32', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30.00, 'pending'),
(3, 9, 40, '2025-11-22 06:55:22', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 88.00, 'pending'),
(4, 8, 40, '2025-11-22 07:01:08', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 64.00, 'pending'),
(11, 22, 40, '2025-11-23 06:24:53', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 64.00, 'pending'),
(12, 22, 38, '2025-11-23 06:26:18', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30.00, 'pending'),
(13, 22, 14, '2025-11-23 06:35:00', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 72.00, 'pending'),
(14, 22, 40, '2025-11-23 06:37:37', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 40.00, 'pending'),
(15, 23, 14, '2025-11-23 06:40:06', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 86.00, 'pending'),
(16, 23, 38, '2025-11-23 06:41:03', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30.00, 'pending'),
(17, 23, 23, '2025-11-23 06:41:40', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60.00, 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `cart_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `tour_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `added_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`) VALUES
(1, 'Education');

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `partner_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `business_license` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `approved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`partner_id`, `user_id`, `company_name`, `business_license`, `address`, `description`, `approved`) VALUES
(1, NULL, NULL, NULL, 'string', 'string', 0);

-- --------------------------------------------------------

--
-- Table structure for table `regions`
--

CREATE TABLE `regions` (
  `region_id` int(11) NOT NULL,
  `region_name` enum('North','Central','South') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `regions`
--

INSERT INTO `regions` (`region_id`, `region_name`) VALUES
(1, 'North'),
(2, 'Central'),
(3, 'South');

-- --------------------------------------------------------

--
-- Table structure for table `tours`
--

CREATE TABLE `tours` (
  `tour_id` int(11) NOT NULL,
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
  `created_by` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tours`
--

INSERT INTO `tours` (`tour_id`, `tour_name`, `description`, `location`, `region_id`, `category_id`, `start_date`, `end_date`, `price`, `available_slots`, `image_url`, `created_by`, `status`, `created_at`) VALUES
(5, 'Ha Giang', '2', 'Ha Giang', 1, 1, '2025-11-21', '2025-11-23', 1.00, 1, '/uploads/tours/1763725612792-740623517.jpg', 7, 'rejected', '2025-11-21 18:46:52'),
(8, 'Ben Tre Tour', '', 'Ben Tre', 3, 1, '2025-11-21', '2025-11-25', 40.00, 30, '/uploads/tours/1763761355639-991169304.webp', 7, 'rejected', '2025-11-22 04:42:35'),
(9, 'Mekong Delta Tour', '', 'Bac Lieu', 3, 1, '2025-11-26', '2025-11-30', 50.00, 43, '/uploads/tours/1763761424901-427154603.jpg', 7, 'approved', '2025-11-22 04:43:44'),
(10, 'Can Tho City Tour', '', 'Can Tho', 3, 1, '2025-11-30', '2025-12-03', 30.00, 45, '/uploads/tours/1763761490569-796183986.jpg', 7, 'rejected', '2025-11-22 04:44:50'),
(11, 'Tra Su Cajuput', 'Forest', 'Ca Mau', 3, 1, '2025-11-29', '2025-11-01', 80.00, 79, '/uploads/tours/1763761548397-484070166.webp', 7, 'rejected', '2025-11-22 04:45:48'),
(14, 'Mekong Delta Fruit Garden Tour', '', 'Bac Lieu', 3, 1, '2025-11-25', '2025-11-28', 45.00, 40, '/uploads/tours/1763763449486-136925584.jpg', 7, 'approved', '2025-11-22 05:17:29'),
(15, 'Cai Be Fruit Picking & Rowing Boat Tour', '', 'Cai Be', 3, 1, '2025-11-20', '2025-11-24', 60.00, 38, '/uploads/tours/1763763558737-617409084.jpeg', 7, 'approved', '2025-11-22 05:19:18'),
(16, 'Mekong Garden Farming Experience Tour', 'Ca Mau', 'Ca Mau', 3, 1, '2025-11-22', '2025-11-25', 46.00, 50, '/uploads/tours/1763763656225-869983958.jpg', 7, 'approved', '2025-11-22 05:20:56'),
(17, 'Thai Nguyen Tea Picking Experience Tour', '', 'Thai Nguyen', 1, 1, '2025-11-27', '2025-11-30', 60.00, 45, '/uploads/tours/1763763842087-960999693.webp', 7, 'approved', '2025-11-22 05:24:02'),
(19, 'Ha Long Bay Night Squid Fishing Experience', '', 'Ha Long', 1, 1, '2025-12-17', '2025-12-20', 45.00, 45, '/uploads/tours/1763763977894-314006837.jpg', 7, 'approved', '2025-11-22 05:26:17'),
(20, 'Golden Rice Harvest Experience Tour', '', 'Sa Pa', 1, 1, '2025-11-26', '2025-11-30', 45.00, 60, '/uploads/tours/1763764062602-847237518.jpg', 7, 'approved', '2025-11-22 05:27:42'),
(21, 'Rice Harvesting & Countryside Cooking Tour', '', 'Sapa', 1, 1, '2025-11-05', '2025-11-08', 50.00, 45, '/uploads/tours/1763764109502-240667308.jpg', 7, 'approved', '2025-11-22 05:28:29'),
(22, 'Cam Thanh Rice Paper & Vegetable Farming Tour', '', 'Hoi An', 2, 1, '2025-11-28', '2025-11-30', 35.00, 35, '/uploads/tours/1763764336125-763724822.jpg', 7, 'approved', '2025-11-22 05:32:16'),
(23, 'Thanh Tien Paper Flower Craft & Village Tour', '', 'Hue', 2, 1, '2025-12-17', '2025-12-22', 60.00, 45, '/uploads/tours/1763764450518-401138258.jpg', 7, 'approved', '2025-11-22 05:34:10'),
(24, 'Hue Organic Farm – Gardening & Cooking Tour', '', 'Hue', 2, 1, '2025-11-11', '2025-11-15', 40.00, 34, '/uploads/tours/1763764514287-7141667.jpg', 7, 'approved', '2025-11-22 05:35:14'),
(25, 'Buon Ma Thuot Coffee Farm Discovery Tour', '', 'DakLak', 2, 1, '2025-12-02', '2025-12-05', 45.00, 45, '/uploads/tours/1763764660841-531754367.jpg', 7, 'approved', '2025-11-22 05:37:40'),
(26, 'Cam Thanh Vegetable Garden Experience', '', 'Tra Que', 1, 1, '2025-11-22', '2025-11-24', 45.00, 45, '/uploads/tours/1763764942365-870924394.jpg', 7, 'approved', '2025-11-22 05:42:22'),
(27, 'Thanh Dong Vegetable Farming Tour', '', 'Hoi An', 2, 1, '2025-11-26', '2025-11-30', 40.00, 45, '/uploads/tours/1763765066560-916270821.jpg', 7, 'approved', '2025-11-22 05:44:26'),
(28, 'Organic Vegetable Farm Tour', '', 'Ca Mau', 3, 1, '2025-11-23', '2025-11-27', 40.00, 45, '/uploads/tours/1763765422614-341258691.jpg', 7, 'approved', '2025-11-22 05:50:22'),
(29, 'Dak Lak Avocado Harvest Experience Tour', '', 'Daklak', 2, 1, '2025-11-28', '2025-11-30', 40.00, 34, '/uploads/tours/1763765767965-194982475.jpg', 7, 'approved', '2025-11-22 05:56:07'),
(30, 'Central Vietnam Cattle Herding Experience Tour', '', 'Quang Nam', 2, 1, '2025-11-30', '2025-12-03', 40.00, 35, '/uploads/tours/1763765834108-315323020.jpg', 7, 'approved', '2025-11-22 05:57:14'),
(31, 'Fishing with Local Fishermen Experience Tour', '', 'Quang Nam', 2, 1, '2025-11-18', '2025-11-21', 40.00, 34, '/uploads/tours/1763765903748-758432941.jpg', 7, 'approved', '2025-11-22 05:58:23'),
(32, 'Mekong Canal Mud Fishing Experience', '', 'Ca Mau', 3, 1, '2025-11-27', '2025-11-30', 40.00, 34, '/uploads/tours/1763766070227-284499389.jpg', 7, 'approved', '2025-11-22 06:01:10'),
(33, 'Northwest Terraced Rice Planting Tour', '', 'Sa Pa', 1, 1, '2025-12-24', '2025-12-28', 35.00, 34, '/uploads/tours/1763766106906-11458579.webp', 7, 'approved', '2025-11-22 06:01:46'),
(34, 'Northern Vietnam Rice Planting with Local Farmers Tour', '', 'Cao Bang', 1, 1, '2025-12-15', '2025-12-17', 40.00, 35, '/uploads/tours/1763766151696-200525817.jpg', 7, 'approved', '2025-11-22 06:02:31'),
(35, 'One Day as a Duck Farmer Tour', '', 'Ca Mau', 3, 1, '2025-11-23', '2025-11-25', 40.00, 39, '/uploads/tours/1763766873853-704255762.webp', 7, 'approved', '2025-11-22 06:14:33'),
(36, 'Ha Tien Shell Beach Rowing Experience', '', 'Ca Mau', 3, 1, '2025-11-30', '2025-12-03', 30.00, 15, '/uploads/tours/1763767414734-849379583.jpg', 7, 'approved', '2025-11-22 06:23:34'),
(37, 'Vinh Long Farm & Lotus Experience', '', 'Vinh Long', 3, 1, '2025-12-02', '2025-12-04', 30.00, 40, '/uploads/tours/1763767509769-25430491.jpg', 7, 'rejected', '2025-11-22 06:25:09'),
(38, 'Vinh Long Farm & Lotus Experience', '', 'Vinh Long', 3, 1, '2025-12-05', '2025-12-07', 30.00, 24, '/uploads/tours/1763767572721-174876565.jpg', 7, 'approved', '2025-11-22 06:26:12'),
(40, 'Dak Lak Mountain Adventure & Cultural Experience', '', 'Daklak', 2, 1, '2025-11-30', '2025-12-03', 40.00, 28, '/uploads/tours/1763768684857-17885406.jpg', 7, 'approved', '2025-11-22 06:44:44'),
(49, 'Agricultural tour 3', '', 'Ca Mau', 3, 1, '2025-11-24', '2025-11-26', 30.00, 20, '/uploads/tours/1763854949984-118355996.jpg', 7, 'pending', '2025-11-23 06:42:29'),
(50, 'Agricultural tour 4', '', 'Ca Mau', 3, 1, '2025-11-24', '2025-11-25', 35.00, 34, '/uploads/tours/1763854987582-6546305.jpg', 7, 'rejected', '2025-11-23 06:43:07');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('customer','admin','partner') DEFAULT 'customer',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `phone`, `role`, `created_at`) VALUES
(6, 'Admin', 'admin22@gmail.com', '$2b$10$UYoM76gsPiYpYFYIisFI7O1ODWlzl/CZik.icFa8ClcoYMEmv60wG', '0345845943', 'admin', '2025-11-21 18:16:39'),
(7, 'Ai Nu', 'partner@gmail.com', '$2b$10$8rjwKc9IbUeH1/uUsdG5CeYshfetcXSpNM2o6UmRn4Ld2/5dE6ze.', '0123456789', 'partner', '2025-11-21 18:22:57'),
(8, 'string', 'string', '$2b$10$3jij7Ts3oj2vjUIxtYr/x.538jUW8q9eRpAVT9DkjIvEWOHqbXIT2', 'string', 'customer', '2025-11-21 18:27:28'),
(9, 'Thien Y', 'admin@gmail.com', '$2b$10$cRYkFPH0IuWyhxG74AdTh.CuY/59tz/m9kdiwfK6J0JXJicvjEykW', '0818737098', 'admin', '2025-11-21 19:14:05'),
(22, 'Customer', 'customer@gmail.com', '$2b$10$tJnrf.Fkz57cbxdeCW5P7udO6KKld15eVQ5lPGE6eLF93w6d0WhtK', '067', 'customer', '2025-11-23 06:23:49'),
(23, 'customer1', 'customer1@gmail.com', '$2b$10$5Lj1zqEWm5lv/qdp4JKX6Oe4Y36GssKCUKxHn41oUukH9dtYrY5J6', '04567', 'customer', '2025-11-23 06:39:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `tour_id` (`tour_id`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`cart_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `tour_id` (`tour_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`partner_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `regions`
--
ALTER TABLE `regions`
  ADD PRIMARY KEY (`region_id`);

--
-- Indexes for table `tours`
--
ALTER TABLE `tours`
  ADD PRIMARY KEY (`tour_id`),
  ADD KEY `region_id` (`region_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `partner_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `regions`
--
ALTER TABLE `regions`
  MODIFY `region_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tours`
--
ALTER TABLE `tours`
  MODIFY `tour_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`tour_id`);

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`tour_id`);

--
-- Constraints for table `partners`
--
ALTER TABLE `partners`
  ADD CONSTRAINT `partners_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `tours`
--
ALTER TABLE `tours`
  ADD CONSTRAINT `tours_ibfk_1` FOREIGN KEY (`region_id`) REFERENCES `regions` (`region_id`),
  ADD CONSTRAINT `tours_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  ADD CONSTRAINT `tours_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
