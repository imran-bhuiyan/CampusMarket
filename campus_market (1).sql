-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 10, 2026 at 08:27 PM
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
-- Database: `campus_market`
--

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `contact_info` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `department` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'available',
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `title`, `price`, `description`, `contact_info`, `image_url`, `department`, `status`, `userId`) VALUES
(1, 'New item', 200.00, 'What is this?', '2397239723', NULL, 'Nada kure?', 'available', 0);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` enum('books','electronics','clothing','furniture','other') NOT NULL,
  `condition` enum('new','like_new','good','fair') NOT NULL,
  `department` varchar(255) NOT NULL,
  `images` text NOT NULL,
  `isAvailable` tinyint(4) NOT NULL DEFAULT 1,
  `sellerId` int(11) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `moderationStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `title`, `description`, `price`, `category`, `condition`, `department`, `images`, `isAvailable`, `sellerId`, `createdAt`, `updatedAt`, `moderationStatus`) VALUES
(1, 'Calculus Textbook - Stewart 8th Edition', 'Used for MATH 101. Great condition, some highlighting. Perfect for first-year students.', 45.00, 'books', 'good', 'CSE', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 1, 5, '2026-01-08 16:29:06.115173', '2026-01-08 16:29:06.115173', 'pending'),
(2, 'MacBook Pro 2021 - M1 Pro', '14-inch, 16GB RAM, 512GB SSD. Excellent condition, includes charger. Upgraded to new laptop.', 1200.00, 'electronics', 'like_new', 'CSE', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 1, 9, '2026-01-08 16:29:06.120427', '2026-01-08 16:29:06.120427', 'pending'),
(3, 'Physics Lab Manual', 'University Physics Lab Manual for PHYS 201. Barely used, no writing inside.', 25.00, 'books', 'like_new', 'EEE', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 1, 6, '2026-01-08 16:29:06.128416', '2026-01-08 16:29:06.128416', 'pending'),
(4, 'TI-84 Plus Calculator', 'Texas Instruments graphing calculator. Works perfectly, new batteries included.', 60.00, 'electronics', 'good', 'EEE', 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400', 1, 6, '2026-01-08 16:29:06.132463', '2026-01-08 16:29:06.132463', 'pending'),
(5, 'Organic Chemistry Textbook', 'McMurry Organic Chemistry 9th Edition. Required for CHEM 301. Minor wear on cover.', 55.00, 'books', 'good', 'BBA', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400', 1, 7, '2026-01-08 16:29:06.136691', '2026-01-08 16:29:06.136691', 'pending'),
(6, 'Desk Lamp - LED Study Light', 'Adjustable LED desk lamp with USB charging port. 3 brightness levels. Like new.', 20.00, 'furniture', 'like_new', 'ME', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', 1, 8, '2026-01-08 16:29:06.141572', '2026-01-08 16:29:06.141572', 'pending'),
(7, 'Arduino Starter Kit', 'Complete Arduino Uno starter kit with sensors, LEDs, breadboard. Great for ECE projects.', 35.00, 'electronics', 'new', 'EEE', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400', 1, 6, '2026-01-08 16:29:06.146059', '2026-01-08 16:29:06.146059', 'pending'),
(8, 'Business Statistics Textbook', 'Statistics for Business and Economics, 13th Edition. Good condition with some notes.', 40.00, 'books', 'fair', 'BBA', 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400', 1, 7, '2026-01-08 16:29:06.150663', '2026-01-08 16:29:06.150663', 'pending'),
(9, 'Mechanical Engineering Handbook', 'Shigley\'s Mechanical Engineering Design, 11th Edition. Essential for ME students.', 65.00, 'books', 'good', 'ME', 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400', 1, 8, '2026-01-08 16:29:06.154388', '2026-01-08 16:29:06.154388', 'pending'),
(10, 'Wireless Keyboard & Mouse Combo', 'Logitech MK270 wireless combo. Used for one semester, works great.', 25.00, 'electronics', 'good', 'CSE', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 1, 5, '2026-01-08 16:29:06.159104', '2026-01-08 16:29:06.159104', 'pending'),
(11, 'University Hoodie - Size M', 'Official campus hoodie in navy blue. Worn only a few times, perfect condition.', 35.00, 'clothing', 'like_new', 'CSE', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 1, 12, '2026-01-08 16:29:06.163158', '2026-01-08 16:29:06.163158', 'pending'),
(12, 'Lab Coat - White', 'Professional white lab coat, size L. Required for chemistry and biology labs.', 18.00, 'clothing', 'good', 'EEE', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 1, 6, '2026-01-08 16:29:06.167699', '2026-01-08 16:29:06.167699', 'pending'),
(13, 'Business Formal Blazer - Navy', 'Professional navy blazer, size S. Perfect for presentations and interviews.', 50.00, 'clothing', 'like_new', 'BBA', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 1, 13, '2026-01-08 16:29:06.172480', '2026-01-08 16:29:06.172480', 'pending'),
(14, 'Ergonomic Office Chair', 'Adjustable office chair with lumbar support. Great for long study sessions.', 85.00, 'furniture', 'good', 'CSE', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400', 1, 5, '2026-01-08 16:29:06.178648', '2026-01-08 16:29:06.178648', 'pending'),
(15, 'Portable Whiteboard', 'Double-sided magnetic whiteboard with stand. Includes markers and eraser.', 30.00, 'furniture', 'new', 'ME', 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=400', 1, 8, '2026-01-08 16:29:06.183348', '2026-01-08 16:29:06.183348', 'pending'),
(16, 'Gaming Monitor 27\" 144Hz', 'ASUS gaming monitor, 1440p resolution, 144Hz refresh rate. Minor scratch on stand.', 220.00, 'electronics', 'good', 'CSE', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', 1, 12, '2026-01-08 16:29:06.188086', '2026-01-08 16:29:06.188086', 'pending'),
(17, 'Python Programming Book', 'Learning Python, 5th Edition by Mark Lutz. Great for beginners.', 30.00, 'books', 'good', 'CSE', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400', 1, 9, '2026-01-08 16:29:06.192723', '2026-01-08 16:29:06.192723', 'pending'),
(18, 'Vintage Denim Jacket', 'Classic denim jacket, size M. Retro style, great condition.', 40.00, 'clothing', 'good', 'BBA', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400', 1, 13, '2026-01-08 16:29:06.196744', '2026-01-08 16:29:06.196744', 'pending'),
(19, 'iPad Air 4th Gen', '64GB, Space Gray with Apple Pencil 2. Used for note-taking.', 450.00, 'electronics', 'like_new', 'CSE', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 0, 5, '2026-01-08 16:29:06.201609', '2026-01-08 16:29:06.201609', 'pending'),
(20, 'Standing Desk Converter', 'Adjustable standing desk converter. Fits on any desk.', 120.00, 'furniture', 'good', 'ME', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', 0, 8, '2026-01-08 16:29:06.206543', '2026-01-08 16:29:06.206543', 'pending'),
(21, 'Backpack - Waterproof', 'Large capacity waterproof backpack with laptop compartment. 15.6\" laptop fits.', 45.00, 'other', 'like_new', 'CSE', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 1, 12, '2026-01-08 16:29:06.211585', '2026-01-08 16:29:06.211585', 'pending'),
(22, 'Noise Cancelling Headphones', 'Sony WH-1000XM4 headphones. Amazing sound quality and noise cancellation.', 180.00, 'electronics', 'like_new', 'EEE', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1, 6, '2026-01-08 16:29:06.216492', '2026-01-08 16:29:06.216492', 'pending'),
(23, 'Mini Fridge for Dorm', 'Compact mini fridge, perfect for dorm rooms. Works great, quiet operation.', 70.00, 'other', 'good', 'BBA', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400', 1, 7, '2026-01-08 16:29:06.222365', '2026-01-08 16:29:06.222365', 'pending'),
(24, 'Yoga Mat', 'Extra thick yoga mat with carrying strap. Non-slip surface.', 22.00, 'other', 'new', 'ME', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 1, 8, '2026-01-08 16:29:06.227737', '2026-01-08 16:29:06.227737', 'pending'),
(25, 'Test Book', 'A test book for sale', 25.99, 'books', 'good', 'Engineering', '/uploads/test.jpg', 1, 15, '2026-01-09 06:46:20.000000', '2026-01-09 06:46:20.000000', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `department` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `profilePicture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `department`, `createdAt`, `updatedAt`, `profilePicture`) VALUES
(1, 'imran@gmail.com', '$2b$10$dQCJ2tJetevQXqfPHhxRIOkXb.5ptHhRV10zE7ysfsFZ32qrBJ6XS', 'Imran', 'admin', 'CSE', '2025-12-06 11:38:28.107549', '2026-01-08 16:27:37.976429', '/uploads/profiles/profile-1-1765035048216-849604151.png'),
(2, 'imran1@gmail.com', '$2b$10$lsU/YNeT6oiIYDpPvScC/.QrGazNe/F3/0jmmCUYBSuwbMgBnZc6W', 'imran', 'user', 'CSE', '2025-12-06 11:46:59.177931', '2025-12-06 11:46:59.177931', NULL),
(3, 'demo@campus.edu', '$2b$10$kbGlaGuIIR8TamUBQUhLdOBeRi4iB.XewBpOZQpvGWd67TpSqnJGm', 'Montasir', 'user', 'Computer Science', '2025-12-06 11:49:03.640266', '2025-12-07 14:30:33.046527', NULL),
(4, 'Nahin@gmail.com', '$2b$10$jgQHB/4XFb/kIMN6/kgMW.Jnoe9YlLDl4ORrod1M7yth2b/QI5Yim', 'Nahin', 'user', 'Computer Science and Engineering (CSE)', '2025-12-06 12:48:13.423737', '2025-12-06 12:48:13.423737', NULL),
(5, 'sarah.chen@campus.edu', '$2b$10$5VeWv3ltZNeHryzWvs7Ywui99YO1UYSyANHxcqWYTE/Qkf.edXhAi', 'Sarah Chen', 'user', 'CSE', '2025-12-07 14:19:47.036428', '2025-12-07 14:19:47.036428', NULL),
(6, 'james.wilson@campus.edu', '$2b$10$5VeWv3ltZNeHryzWvs7Ywui99YO1UYSyANHxcqWYTE/Qkf.edXhAi', 'James Wilson', 'user', 'EEE', '2025-12-07 14:19:47.073178', '2025-12-07 14:19:47.073178', NULL),
(7, 'emily.rodriguez@campus.edu', '$2b$10$5VeWv3ltZNeHryzWvs7Ywui99YO1UYSyANHxcqWYTE/Qkf.edXhAi', 'Emily Rodriguez', 'user', 'BBA', '2025-12-07 14:19:47.105369', '2025-12-07 14:19:47.105369', NULL),
(8, 'michael.ahmed@campus.edu', '$2b$10$5VeWv3ltZNeHryzWvs7Ywui99YO1UYSyANHxcqWYTE/Qkf.edXhAi', 'Michael Ahmed', 'user', 'ME', '2025-12-07 14:19:47.147985', '2025-12-07 14:19:47.147985', NULL),
(9, 'priya.sharma@campus.edu', '$2b$10$5VeWv3ltZNeHryzWvs7Ywui99YO1UYSyANHxcqWYTE/Qkf.edXhAi', 'Priya Sharma', 'user', 'CSE', '2025-12-07 14:19:47.165824', '2025-12-07 14:19:47.165824', NULL),
(10, 'Nahin3@gmail.com', '$2b$10$9CL7qgyqGUhOgbJPbtmq9eNDIxvmP1FSqReaWzxRBqsDQo1MxQes2', 'Nahin', 'user', 'Computer Science and Engineering (CSE)', '2025-12-07 14:59:55.365154', '2025-12-07 14:59:55.365154', NULL),
(11, 'admin@campus.edu', '$2b$10$ucSz0bXp9wfHukPEIaO40uLLey87MK1d3BHhQEwC4Bv2WxYLCrxH2', 'Admin User', 'admin', 'Administration', '2026-01-08 16:29:06.028730', '2026-01-08 16:29:06.028730', NULL),
(12, 'david.kim@campus.edu', '$2b$10$ucSz0bXp9wfHukPEIaO40uLLey87MK1d3BHhQEwC4Bv2WxYLCrxH2', 'David Kim', 'user', 'CSE', '2026-01-08 16:29:06.051970', '2026-01-08 16:29:06.051970', NULL),
(13, 'lisa.johnson@campus.edu', '$2b$10$ucSz0bXp9wfHukPEIaO40uLLey87MK1d3BHhQEwC4Bv2WxYLCrxH2', 'Lisa Johnson', 'user', 'BBA', '2026-01-08 16:29:06.062783', '2026-01-08 16:29:06.062783', NULL),
(14, 'test@campus.edu', '$2b$10$gVQHNoBpNeItrpzsYdp2oOEypolGjVThMe8NPHGAAyQ37zGVzKGEO', 'Test User', 'user', 'CSE', '2026-01-08 19:35:13.000000', '2026-01-08 19:35:13.000000', NULL),
(15, 'newuser@campus.edu', '$2b$10$WfZxkaemzmVXOG1g8y/3qO00ZnNS.S9DeaXkYEaZxPihfWi0ofwsS', 'New User', 'user', 'Engineering', '2026-01-09 06:39:36.000000', '2026-01-09 06:39:36.000000', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_e40a1dd2909378f0da1f34f7bd6` (`sellerId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FK_e40a1dd2909378f0da1f34f7bd6` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
