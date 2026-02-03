-- Cleaned SQL seed (Stationery only)
-- This file intentionally keeps only product data related to Alat Tulis.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `genexmart`;
USE `genexmart`;

SET NAMES utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `genders`
-- --------------------------------------------------------
CREATE TABLE `genders` (
  `GENDER_ID` char(1) NOT NULL,
  `GENDER` char(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `genders` (`GENDER_ID`, `GENDER`) VALUES
('L', 'Laki-laki'),
('P', 'Perempuan');

-- --------------------------------------------------------
-- Table structure for table `cashiers`
-- --------------------------------------------------------
CREATE TABLE `cashiers` (
  `USER_ID` char(8) NOT NULL,
  `USERNAME` varchar(45) NOT NULL,
  `ADDRESS` varchar(100) NOT NULL,
  `PLACE_OF_BIRTH` varchar(25) NOT NULL,
  `DATE_OF_BIRTH` date NOT NULL,
  `CONTACT_NUMBER` varchar(14) NOT NULL,
  `EMAIL` varchar(40) NOT NULL,
  `GENDER_ID` char(1) NOT NULL,
  `CREATED_AT` date NOT NULL,
  `UPDATED_AT` date NOT NULL,
  `PASSWORD` varchar(35) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `cashiers` (`USER_ID`, `USERNAME`, `ADDRESS`, `PLACE_OF_BIRTH`, `DATE_OF_BIRTH`, `CONTACT_NUMBER`, `EMAIL`, `GENDER_ID`, `CREATED_AT`, `UPDATED_AT`, `PASSWORD`) VALUES
('12345678', 'admin', 'Alamat Toko', 'Tegal', '2000-01-01', '080000000000', 'admin@example.com', 'L', '2025-11-16', '2025-11-16', 'admin');

-- --------------------------------------------------------
-- Table structure for table `customers`
-- --------------------------------------------------------
CREATE TABLE `customers` (
  `CUST_ID` char(8) NOT NULL,
  `CUST_NAME` varchar(45) NOT NULL,
  `ADDRESS` varchar(100) NOT NULL,
  `PLACE_OF_BIRTH` varchar(25) NOT NULL,
  `DATE_OF_BIRTH` date NOT NULL,
  `CONTACT_NUMBER` varchar(14) NOT NULL,
  `EMAIL` varchar(40) NOT NULL,
  `GENDER_ID` char(1) NOT NULL,
  `CREATED_AT` date DEFAULT NULL,
  `CREATED_BY` varchar(35) DEFAULT NULL,
  `UPDATED_AT` date DEFAULT NULL,
  `UPDATED_BY` varchar(35) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `customers` (`CUST_ID`, `CUST_NAME`, `ADDRESS`, `PLACE_OF_BIRTH`, `DATE_OF_BIRTH`, `CONTACT_NUMBER`, `EMAIL`, `GENDER_ID`, `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`) VALUES
('-NoName-', '-Nama Tidak Terdaftar-', '-NoName-', '-NoName-', '1945-08-17', '-NoName-', 'guest@example.com', 'L', '2025-11-16', 'seed', '2025-11-16', 'seed');

-- --------------------------------------------------------
-- Table structure for table `payment_methods`
-- --------------------------------------------------------
CREATE TABLE `payment_methods` (
  `METHOD_ID` char(1) NOT NULL,
  `METHOD` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `payment_methods` (`METHOD_ID`, `METHOD`) VALUES
('1', 'Tunai'),
('2', 'Transfer'),
('3', 'QRIS');

-- --------------------------------------------------------
-- Table structure for table `product_categories`
-- --------------------------------------------------------
CREATE TABLE `product_categories` (
  `CATEGORY_ID` char(2) NOT NULL,
  `CATEGORY` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `product_categories` (`CATEGORY_ID`, `CATEGORY`) VALUES
('AT', 'Alat Tulis');

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------
CREATE TABLE `products` (
  `PRODUCT_ID` int(11) NOT NULL,
  `PRODUCT_NAME` varchar(40) NOT NULL,
  `PRICE` int(11) NOT NULL,
  `CATEGORY_ID` char(2) NOT NULL,
  `CREATED_AT` date NOT NULL,
  `CREATED_BY` varchar(40) NOT NULL,
  `UPDATED_AT` date NOT NULL,
  `UPDATED_BY` varchar(40) NOT NULL,
  `STOCK` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `products` (`PRODUCT_ID`, `PRODUCT_NAME`, `PRICE`, `CATEGORY_ID`, `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`, `STOCK`) VALUES
(1, 'Kenko Pulpen Gel 2 Pcs', 10000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 100),
(2, 'Joyko Ball Pen 1 Pack', 20300, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 80),
(3, 'Pensil 2B Faber-Castell 12pcs', 50000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 60),
(4, 'Pensil 2B (Satuan)', 5000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 200),
(5, 'Buku Tulis Sinar Dunia 58 Lembar', 6000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 150),
(6, 'Buku Tulis Sidu 38 Lembar', 4000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 140),
(7, 'Buku Gambar A4', 5000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 120),
(8, 'Spidol Whiteboard Snowman', 17000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 100),
(9, 'Spidol Snowman Hitam', 8000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 100),
(10, 'Snowman Drawing Pen 0.1', 15000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 90),
(11, 'Highlighter Marker Set 6 Warna', 18000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 70),
(12, 'Penghapus Joyko', 3000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 180),
(13, 'Rautan Pensil Putar', 20000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 40),
(14, 'Penggaris Besi 30 Cm', 15000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 80),
(15, 'Penggaris Plastik 30 Cm', 5000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 100),
(16, 'Tip Ex Correction Pen', 9000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 60),
(17, 'Stapler Joyko HD-10', 35000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 30),
(18, 'Isi Staples No.10', 7000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 120),
(19, 'Cutter Joyko L-500', 6000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 90),
(20, 'Gunting Kenko', 9000, 'AT', '2025-11-16', 'seed', '2025-11-16', 'seed', 70);

-- --------------------------------------------------------
-- Table structure for table `orders`
-- --------------------------------------------------------
CREATE TABLE `orders` (
  `ORDER_ID` int(11) NOT NULL,
  `ORDER_DATE` datetime NOT NULL,
  `CUST_ID` char(8) DEFAULT '-NoName-',
  `USER_ID` char(8) NOT NULL,
  `TOTAL` int(11) NOT NULL,
  `METHOD_ID` char(1) DEFAULT '1',
  `BANK_TRANS` varchar(25) DEFAULT NULL,
  `RECEIPT_NUMBER` char(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `order_details`
-- --------------------------------------------------------
CREATE TABLE `order_details` (
  `QTY` int(11) NOT NULL DEFAULT 1,
  `PRICE` int(11) NOT NULL,
  `ORDER_ID` int(11) NOT NULL,
  `PRODUCT_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Indexes
-- --------------------------------------------------------
ALTER TABLE `cashiers`
  ADD PRIMARY KEY (`USER_ID`),
  ADD UNIQUE KEY `EML_UN` (`EMAIL`),
  ADD UNIQUE KEY `CN_UN` (`CONTACT_NUMBER`),
  ADD KEY `GENDER_FK` (`GENDER_ID`);

ALTER TABLE `customers`
  ADD PRIMARY KEY (`CUST_ID`),
  ADD UNIQUE KEY `CONTACT_NUMBER_UN` (`CONTACT_NUMBER`),
  ADD UNIQUE KEY `EMAIL_UN` (`EMAIL`),
  ADD KEY `GENDER_ID_FK` (`GENDER_ID`);

ALTER TABLE `genders`
  ADD PRIMARY KEY (`GENDER_ID`);

ALTER TABLE `orders`
  ADD PRIMARY KEY (`ORDER_ID`),
  ADD UNIQUE KEY `RECEIPT_NUMBER_UN` (`RECEIPT_NUMBER`),
  ADD KEY `CUST_ID_FK` (`CUST_ID`),
  ADD KEY `METHOD_ID_FK` (`METHOD_ID`),
  ADD KEY `USER_ID_FK` (`USER_ID`);

ALTER TABLE `order_details`
  ADD PRIMARY KEY (`ORDER_ID`,`PRODUCT_ID`),
  ADD KEY `PRODUCT_ID_FK` (`PRODUCT_ID`);

ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`METHOD_ID`);

ALTER TABLE `products`
  ADD PRIMARY KEY (`PRODUCT_ID`),
  ADD UNIQUE KEY `PRODUCT_NAME_UN` (`PRODUCT_NAME`),
  ADD KEY `CATEGORY_ID_FK` (`CATEGORY_ID`);

ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`CATEGORY_ID`),
  ADD UNIQUE KEY `CATEGORY_UN` (`CATEGORY`);

-- --------------------------------------------------------
-- AUTO_INCREMENT
-- --------------------------------------------------------
ALTER TABLE `orders`
  MODIFY `ORDER_ID` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `products`
  MODIFY `PRODUCT_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

-- --------------------------------------------------------
-- Constraints
-- --------------------------------------------------------
ALTER TABLE `cashiers`
  ADD CONSTRAINT `GENDER_FK` FOREIGN KEY (`GENDER_ID`) REFERENCES `genders` (`GENDER_ID`);

ALTER TABLE `customers`
  ADD CONSTRAINT `GENDER_ID_FK` FOREIGN KEY (`GENDER_ID`) REFERENCES `genders` (`GENDER_ID`);

ALTER TABLE `orders`
  ADD CONSTRAINT `CUST_ID_FK` FOREIGN KEY (`CUST_ID`) REFERENCES `customers` (`CUST_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `METHOD_ID_FK` FOREIGN KEY (`METHOD_ID`) REFERENCES `payment_methods` (`METHOD_ID`),
  ADD CONSTRAINT `USER_ID_FK` FOREIGN KEY (`USER_ID`) REFERENCES `cashiers` (`USER_ID`);

ALTER TABLE `order_details`
  ADD CONSTRAINT `ORDER_ID_FK` FOREIGN KEY (`ORDER_ID`) REFERENCES `orders` (`ORDER_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `PRODUCT_ID_FK` FOREIGN KEY (`PRODUCT_ID`) REFERENCES `products` (`PRODUCT_ID`) ON DELETE CASCADE;

ALTER TABLE `products`
  ADD CONSTRAINT `CATEGORY_ID_FK` FOREIGN KEY (`CATEGORY_ID`) REFERENCES `product_categories` (`CATEGORY_ID`);

COMMIT;
