-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: DB_TRANSACTION_SERVICE
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `account_id` bigint NOT NULL AUTO_INCREMENT,
  `account_number` varchar(255) NOT NULL,
  `account_type` varchar(255) NOT NULL,
  `balance` decimal(38,2) NOT NULL,
  `closed_date` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `currency` varchar(3) NOT NULL,
  `is_primary` bit(1) DEFAULT NULL,
  `last_transaction_at` datetime(6) DEFAULT NULL,
  `opened_date` datetime(6) NOT NULL,
  `status` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `UK66gkcp94endmotfwb8r4ocxm9` (`account_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'607074371586','SAVINGS',46606310.00,NULL,'2025-12-23 12:17:54.716314','VND',_binary '','2025-12-28 13:42:58.569643','2025-12-23 12:17:54.716314','ACTIVE',NULL,1),(2,'689406757320','SAVINGS',61162140.00,NULL,'2025-12-23 12:21:57.343754','VND',_binary '',NULL,'2025-12-23 12:21:57.343754','ACTIVE',NULL,2);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_package`
--

DROP TABLE IF EXISTS `data_package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_package` (
  `package_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `data_amount` bigint NOT NULL,
  `description` text,
  `is_active` bit(1) NOT NULL,
  `package_code` varchar(50) NOT NULL,
  `package_name` varchar(200) NOT NULL,
  `price` decimal(19,2) NOT NULL,
  `provider_id` bigint NOT NULL,
  `sort_order` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `validity_days` int NOT NULL,
  PRIMARY KEY (`package_id`),
  UNIQUE KEY `UKf1dulvh7srub7pg8b1y210ijv` (`package_code`),
  KEY `FK47qgw99jva3sdq2fk0l650f9v` (`provider_id`),
  CONSTRAINT `FK47qgw99jva3sdq2fk0l650f9v` FOREIGN KEY (`provider_id`) REFERENCES `telecom_provider` (`provider_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_package`
--

LOCK TABLES `data_package` WRITE;
/*!40000 ALTER TABLE `data_package` DISABLE KEYS */;
INSERT INTO `data_package` VALUES (1,'2025-12-24 01:20:41.526437',1024,'Gói data 4G 1GB sử dụng trong 1 ngày',_binary '','VT_D1GB_1D','Gói 4G 1GB/ngày',15000.00,1,1,NULL,1),(2,'2025-12-24 01:20:41.528542',3072,'Gói data 4G 3GB sử dụng trong 3 ngày',_binary '','VT_D3GB_3D','Gói 4G 3GB/3 ngày',35000.00,1,2,NULL,3),(3,'2025-12-24 01:20:41.531048',6144,'Gói data 4G 6GB sử dụng trong 7 ngày',_binary '','VT_D6GB_7D','Gói 4G 6GB/tuần',60000.00,1,3,NULL,7),(4,'2025-12-24 01:20:41.532685',12288,'Gói data 4G 12GB sử dụng trong 30 ngày',_binary '','VT_D12GB_30D','Gói 4G 12GB/tháng',120000.00,1,4,NULL,30),(5,'2025-12-24 01:20:41.534253',25600,'Gói data 4G 25GB sử dụng trong 30 ngày',_binary '','VT_D25GB_30D','Gói 4G 25GB/tháng',200000.00,1,5,NULL,30),(6,'2025-12-24 01:20:41.535921',1024,'Gói data 4G 1GB sử dụng trong 1 ngày',_binary '','MBF_D1GB_1D','Gói 4G 1GB/ngày',15000.00,2,1,NULL,1),(7,'2025-12-24 01:20:41.537558',3072,'Gói data 4G 3GB sử dụng trong 3 ngày',_binary '','MBF_D3GB_3D','Gói 4G 3GB/3 ngày',35000.00,2,2,NULL,3),(8,'2025-12-24 01:20:41.539662',6144,'Gói data 4G 6GB sử dụng trong 7 ngày',_binary '','MBF_D6GB_7D','Gói 4G 6GB/tuần',60000.00,2,3,NULL,7),(9,'2025-12-24 01:20:41.541262',12288,'Gói data 4G 12GB sử dụng trong 30 ngày',_binary '','MBF_D12GB_30D','Gói 4G 12GB/tháng',120000.00,2,4,NULL,30),(10,'2025-12-24 01:20:41.543002',25600,'Gói data 4G 25GB sử dụng trong 30 ngày',_binary '','MBF_D25GB_30D','Gói 4G 25GB/tháng',200000.00,2,5,NULL,30),(11,'2025-12-24 01:20:41.544654',1024,'Gói data 4G 1GB sử dụng trong 1 ngày',_binary '','VNP_D1GB_1D','Gói 4G 1GB/ngày',15000.00,3,1,NULL,1),(12,'2025-12-24 01:20:41.546416',3072,'Gói data 4G 3GB sử dụng trong 3 ngày',_binary '','VNP_D3GB_3D','Gói 4G 3GB/3 ngày',35000.00,3,2,NULL,3),(13,'2025-12-24 01:20:41.548100',6144,'Gói data 4G 6GB sử dụng trong 7 ngày',_binary '','VNP_D6GB_7D','Gói 4G 6GB/tuần',60000.00,3,3,NULL,7),(14,'2025-12-24 01:20:41.549703',12288,'Gói data 4G 12GB sử dụng trong 30 ngày',_binary '','VNP_D12GB_30D','Gói 4G 12GB/tháng',120000.00,3,4,NULL,30),(15,'2025-12-24 01:20:41.551285',25600,'Gói data 4G 25GB sử dụng trong 30 ngày',_binary '','VNP_D25GB_30D','Gói 4G 25GB/tháng',200000.00,3,5,NULL,30),(16,'2025-12-24 01:20:41.552850',1024,'Gói data 4G 1GB sử dụng trong 1 ngày',_binary '','VNM_D1GB_1D','Gói 4G 1GB/ngày',15000.00,4,1,NULL,1),(17,'2025-12-24 01:20:41.554464',3072,'Gói data 4G 3GB sử dụng trong 3 ngày',_binary '','VNM_D3GB_3D','Gói 4G 3GB/3 ngày',35000.00,4,2,NULL,3),(18,'2025-12-24 01:20:41.555527',6144,'Gói data 4G 6GB sử dụng trong 7 ngày',_binary '','VNM_D6GB_7D','Gói 4G 6GB/tuần',60000.00,4,3,NULL,7),(19,'2025-12-24 01:20:41.557096',12288,'Gói data 4G 12GB sử dụng trong 30 ngày',_binary '','VNM_D12GB_30D','Gói 4G 12GB/tháng',120000.00,4,4,NULL,30),(20,'2025-12-24 01:20:41.559260',25600,'Gói data 4G 25GB sử dụng trong 30 ngày',_binary '','VNM_D25GB_30D','Gói 4G 25GB/tháng',200000.00,4,5,NULL,30);
/*!40000 ALTER TABLE `data_package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_top_up`
--

DROP TABLE IF EXISTS `data_top_up`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_top_up` (
  `data_top_up_id` bigint NOT NULL AUTO_INCREMENT,
  `account_number` varchar(255) NOT NULL,
  `amount` decimal(19,2) NOT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `data_amount` bigint NOT NULL,
  `face_auth_at` datetime(6) DEFAULT NULL,
  `face_auth_session_id` varchar(36) DEFAULT NULL,
  `face_auth_verified` bit(1) DEFAULT NULL,
  `failure_reason` varchar(500) DEFAULT NULL,
  `package_id` bigint NOT NULL,
  `package_name` varchar(200) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `provider_response` text,
  `provider_transaction_id` varchar(100) DEFAULT NULL,
  `requires_face_auth` bit(1) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `telecom_provider` varchar(50) NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `username` varchar(255) NOT NULL,
  `validity_days` int NOT NULL,
  PRIMARY KEY (`data_top_up_id`),
  UNIQUE KEY `UK7mhvj914ihak3ssbqhoik7ae8` (`transaction_id`),
  KEY `FKtcis4yctbf6lu8wl9c5483ogn` (`package_id`),
  CONSTRAINT `FKtcis4yctbf6lu8wl9c5483ogn` FOREIGN KEY (`package_id`) REFERENCES `data_package` (`package_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_top_up`
--

LOCK TABLES `data_top_up` WRITE;
/*!40000 ALTER TABLE `data_top_up` DISABLE KEYS */;
INSERT INTO `data_top_up` VALUES (1,'607074371586',15000.00,'2025-12-24 04:43:18.476809','2025-12-24 04:43:18.445332','VND',1024,NULL,NULL,NULL,NULL,1,'Gói 4G 1GB/ngày','0987654321','Data package activated successfully','PROVIDER_1766551398473',_binary '\0','COMPLETED','Viettel','DATA_1766551398435_A209AF19','2025-12-24 04:43:18.476809',1,'test1@gmail.com',1),(2,'607074371586',15000.00,'2025-12-24 05:01:53.548175','2025-12-24 05:01:53.537472','VND',1024,NULL,NULL,NULL,NULL,1,'Gói 4G 1GB/ngày','0987654321','Data package activated successfully','PROVIDER_1766552513548',_binary '\0','COMPLETED','Viettel','DATA_1766552513535_0B29D7A2','2025-12-24 05:01:53.548175',1,'test1@gmail.com',1),(3,'607074371586',35000.00,'2025-12-24 09:43:45.881958','2025-12-24 09:43:45.867902','VND',3072,NULL,NULL,NULL,NULL,2,'Gói 4G 3GB/3 ngày','0987654321','Data package activated successfully','PROVIDER_1766569425878',_binary '\0','COMPLETED','Viettel','DATA_1766569425865_D65DBC18','2025-12-24 09:43:45.881958',1,'test1@gmail.com',3),(4,'607074371586',15000.00,'2025-12-26 16:17:00.928039','2025-12-26 16:17:00.909169','VND',1024,NULL,NULL,NULL,NULL,11,'Gói 4G 1GB/ngày','0912345678','Data package activated successfully','PROVIDER_1766765820926',_binary '\0','COMPLETED','Vinaphone','DATA_1766765820906_056D6069','2025-12-26 16:17:00.928039',1,'test1@gmail.com',1),(5,'607074371586',15000.00,'2025-12-26 16:20:53.028316','2025-12-26 16:20:53.023007','VND',1024,NULL,NULL,NULL,NULL,11,'Gói 4G 1GB/ngày','0912345678','Data package activated successfully','PROVIDER_1766766053027',_binary '\0','COMPLETED','Vinaphone','DATA_1766766053021_F8EC396B','2025-12-26 16:20:53.028316',1,'test1@gmail.com',1),(6,'607074371586',35000.00,'2025-12-26 16:29:20.400644','2025-12-26 16:29:20.396138','VND',3072,NULL,NULL,NULL,NULL,12,'Gói 4G 3GB/3 ngày','0912345678','Data package activated successfully','PROVIDER_1766766560400',_binary '\0','COMPLETED','Vinaphone','DATA_1766766560395_BE8192C0','2025-12-26 16:29:20.400644',1,'test1@gmail.com',3),(7,'607074371586',35000.00,'2025-12-26 16:32:12.182247','2025-12-26 16:32:12.178499','VND',3072,NULL,NULL,NULL,NULL,12,'Gói 4G 3GB/3 ngày','0912345678','Data package activated successfully','PROVIDER_1766766732182',_binary '\0','COMPLETED','Vinaphone','DATA_1766766732176_65B3E807','2025-12-26 16:32:12.182247',1,'test1@gmail.com',3);
/*!40000 ALTER TABLE `data_top_up` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interest_rate`
--

DROP TABLE IF EXISTS `interest_rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interest_rate` (
  `interest_rate_id` bigint NOT NULL AUTO_INCREMENT,
  `annual_rate` decimal(5,4) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `effective_from` datetime(6) NOT NULL,
  `effective_to` datetime(6) DEFAULT NULL,
  `max_amount` decimal(38,2) DEFAULT NULL,
  `min_amount` decimal(38,2) NOT NULL,
  `status` varchar(255) NOT NULL,
  `term_months` int NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`interest_rate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interest_rate`
--

LOCK TABLES `interest_rate` WRITE;
/*!40000 ALTER TABLE `interest_rate` DISABLE KEYS */;
INSERT INTO `interest_rate` VALUES (19,0.0350,NULL,'2025-10-01 00:00:00.000000',NULL,NULL,1000000.00,'ACTIVE',1,NULL),(20,0.0420,NULL,'2025-10-01 00:00:00.000000',NULL,NULL,1000000.00,'ACTIVE',3,NULL),(21,0.0550,NULL,'2025-10-01 00:00:00.000000',NULL,NULL,5000000.00,'ACTIVE',6,NULL),(22,0.0600,NULL,'2025-10-01 00:00:00.000000',NULL,NULL,10000000.00,'ACTIVE',12,NULL),(23,0.0650,NULL,'2025-10-01 00:00:00.000000',NULL,NULL,10000000.00,'ACTIVE',24,NULL),(24,0.0700,NULL,'2025-10-01 00:00:00.000000',NULL,NULL,10000000.00,'ACTIVE',36,NULL);
/*!40000 ALTER TABLE `interest_rate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phone_top_up`
--

DROP TABLE IF EXISTS `phone_top_up`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phone_top_up` (
  `top_up_id` bigint NOT NULL AUTO_INCREMENT,
  `account_number` varchar(255) NOT NULL,
  `amount` decimal(19,2) NOT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `face_auth_at` datetime(6) DEFAULT NULL,
  `face_auth_session_id` varchar(36) DEFAULT NULL,
  `face_auth_verified` bit(1) DEFAULT NULL,
  `failure_reason` varchar(500) DEFAULT NULL,
  `phone_number` varchar(15) NOT NULL,
  `provider_response` text,
  `provider_transaction_id` varchar(100) DEFAULT NULL,
  `requires_face_auth` bit(1) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `telecom_provider` varchar(50) NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`top_up_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phone_top_up`
--

LOCK TABLES `phone_top_up` WRITE;
/*!40000 ALTER TABLE `phone_top_up` DISABLE KEYS */;
INSERT INTO `phone_top_up` VALUES (1,'607074371586',10000.00,'2025-12-24 04:59:36.470604','2025-12-24 04:59:35.407045','VND',NULL,NULL,_binary '',NULL,'0987654321','Success','VIETTEL_1766552376469',_binary '\0','COMPLETED','VIETTEL','TOPUP_1766552375404_FB02ABBC','2025-12-24 04:59:36.472947',1,'test1@gmail.com'),(2,'607074371586',20000.00,'2025-12-24 05:10:09.898561','2025-12-24 05:10:08.874531','VND',NULL,NULL,_binary '',NULL,'0987654321','Success','VIETTEL_1766553009898',_binary '\0','COMPLETED','VIETTEL','TOPUP_1766553008873_4E45B28D','2025-12-24 05:10:09.899218',1,'test1@gmail.com'),(3,'607074371586',20000.00,'2025-12-24 09:39:15.067154','2025-12-24 09:39:14.041272','VND',NULL,NULL,_binary '',NULL,'0912345678','Success','VINAPHONE_1766569155066',_binary '\0','COMPLETED','VINAPHONE','TOPUP_1766569154038_C6CB7F54','2025-12-24 09:39:15.070367',1,'test1@gmail.com'),(4,'607074371586',20000.00,'2025-12-26 15:50:42.612186','2025-12-26 15:50:41.579427','VND',NULL,NULL,_binary '',NULL,'0987654321','Success','VIETTEL_1766764242610',_binary '\0','COMPLETED','VIETTEL','TOPUP_1766764241574_CC3A5EFC','2025-12-26 15:50:42.614785',1,'test1@gmail.com'),(5,'607074371586',20000.00,'2025-12-26 16:01:43.607036','2025-12-26 16:01:42.595204','VND',NULL,NULL,_binary '',NULL,'0912345678','Success','VINAPHONE_1766764903607',_binary '\0','COMPLETED','VINAPHONE','TOPUP_1766764902594_5B2C58ED','2025-12-26 16:01:43.607618',1,'test1@gmail.com'),(6,'607074371586',20000.00,'2025-12-26 16:04:17.249599','2025-12-26 16:04:16.240681','VND',NULL,NULL,_binary '',NULL,'0912345678','Success','VINAPHONE_1766765057249',_binary '\0','COMPLETED','VINAPHONE','TOPUP_1766765056240_D79C3300','2025-12-26 16:04:17.250216',1,'test1@gmail.com');
/*!40000 ALTER TABLE `phone_top_up` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `savings_account`
--

DROP TABLE IF EXISTS `savings_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `savings_account` (
  `savings_account_id` bigint NOT NULL AUTO_INCREMENT,
  `account_number` varchar(255) NOT NULL,
  `balance` decimal(38,2) NOT NULL,
  `closed_date` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `currency` varchar(3) NOT NULL,
  `interest_rate_id` bigint NOT NULL,
  `last_interest_calculated_at` datetime(6) DEFAULT NULL,
  `maturity_date` datetime(6) NOT NULL,
  `opened_date` datetime(6) NOT NULL,
  `payment_account_id` bigint NOT NULL,
  `status` varchar(255) NOT NULL,
  `term_months` int NOT NULL,
  `total_interest_earned` decimal(38,2) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`savings_account_id`),
  UNIQUE KEY `UKdnk4oyufduard783qam68p2sb` (`account_number`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `savings_account`
--

LOCK TABLES `savings_account` WRITE;
/*!40000 ALTER TABLE `savings_account` DISABLE KEYS */;
INSERT INTO `savings_account` VALUES (1,'SAV540545710',0.00,NULL,'2025-12-24 01:42:25.727106','VND',21,NULL,'2026-06-24 01:42:25.723381','2025-12-24 01:42:25.723381',1,'ACTIVE',6,0.00,'2025-12-25 17:21:28.663923',1),(2,'SAV568671770',20000000.00,NULL,'2025-12-24 09:31:11.795195','VND',22,NULL,'2026-12-24 09:31:11.789945','2025-12-24 09:31:11.790462',1,'ACTIVE',12,0.00,'2025-12-24 09:31:11.795195',1),(3,'SAV582514877',10000000.00,NULL,'2025-12-24 13:21:54.898683','VND',21,NULL,'2026-06-24 13:21:54.893234','2025-12-24 13:21:54.893234',1,'ACTIVE',6,0.00,'2025-12-24 13:21:54.898683',1),(4,'SAV686800163',0.00,NULL,'2025-12-25 18:20:00.191942','VND',20,NULL,'2026-03-25 18:20:00.188200','2025-12-25 18:20:00.188736',1,'ACTIVE',3,0.00,'2025-12-26 03:30:58.581828',1),(5,'SAV929378497',2000000.00,NULL,'2025-12-28 13:42:58.539733','VND',19,NULL,'2026-01-28 13:42:58.521905','2025-12-28 13:42:58.523542',1,'ACTIVE',1,0.00,'2025-12-28 13:42:58.539733',1);
/*!40000 ALTER TABLE `savings_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spending_categories`
--

DROP TABLE IF EXISTS `spending_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spending_categories` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID primary key',
  `user_id` bigint NOT NULL COMMENT 'User ID (references user table in DB_USER_SERVICE)',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Category display name',
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique category code (uppercase)',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#4ECDC4' COMMENT 'Hex color for charts and UI',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Soft delete flag',
  `is_default` tinyint(1) DEFAULT '0' COMMENT 'System default category flag',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_category` (`user_id`,`code`) COMMENT 'Ensure unique category code per user',
  KEY `idx_user_active` (`user_id`,`is_active`) COMMENT 'Query active categories by user',
  KEY `idx_user_code` (`user_id`,`code`) COMMENT 'Lookup category by code'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User-specific spending categories for transaction categorization';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spending_categories`
--

LOCK TABLES `spending_categories` WRITE;
/*!40000 ALTER TABLE `spending_categories` DISABLE KEYS */;
INSERT INTO `spending_categories` VALUES ('16e6a640-02dc-4e0b-a56e-da0345e9cc04',1,'Salary','SALARY','cash-outline','#5D5D81',0,0,'2025-12-29 08:07:37','2025-12-29 08:15:05'),('1a976a1c-e2dc-11f0-8280-3ad61fddc4ba',1,'Ăn uống','FOOD','restaurant-outline','#4ECDC4',1,1,'2025-12-27 04:25:41','2025-12-27 04:30:15'),('1a9779e6-e2dc-11f0-8280-3ad61fddc4ba',1,'Mua sắm','SHOPPING','cart-outline','#FF6B6B',1,1,'2025-12-27 04:25:41','2025-12-27 04:30:15'),('1a977ad1-e2dc-11f0-8280-3ad61fddc4ba',1,'Hóa đơn','BILLS','document-text-outline','#FFD93D',1,1,'2025-12-27 04:25:41','2025-12-27 04:30:15'),('1a977c0e-e2dc-11f0-8280-3ad61fddc4ba',1,'Khác','OTHER','ellipsis-horizontal-outline','#C7CEEA',1,1,'2025-12-27 04:25:41','2025-12-27 04:30:15'),('a2a18768-781b-4131-8e63-486d4c69d0ad',1,'Cafe','CAFE','cafe-outline','#FF8C42',1,0,'2025-12-27 04:28:14','2025-12-29 08:09:07'),('de6e7045-bfb1-4171-a31e-62be341f07b6',1,'Đi lại','DI_LAI','car-outline','#6BCF7F',1,0,'2025-12-27 04:30:37','2025-12-29 08:09:15');
/*!40000 ALTER TABLE `spending_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telecom_provider`
--

DROP TABLE IF EXISTS `telecom_provider`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `telecom_provider` (
  `provider_id` bigint NOT NULL AUTO_INCREMENT,
  `api_endpoint` varchar(500) DEFAULT NULL,
  `api_key` varchar(200) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `fee_percentage` decimal(5,4) DEFAULT NULL,
  `fixed_fee` decimal(19,2) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `max_amount` decimal(19,2) DEFAULT NULL,
  `min_amount` decimal(19,2) DEFAULT NULL,
  `provider_code` varchar(20) NOT NULL,
  `provider_name` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`provider_id`),
  UNIQUE KEY `UK9p001iopd3y6jnyetvao4e8lq` (`provider_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telecom_provider`
--

LOCK TABLES `telecom_provider` WRITE;
/*!40000 ALTER TABLE `telecom_provider` DISABLE KEYS */;
INSERT INTO `telecom_provider` VALUES (1,'https://api.viettel.com/topup','API_KEY_VIETTEL','2025-12-24 01:20:41.382553',0.5000,1000.00,_binary '','https://example.com/logos/viettel.png',500000.00,10000.00,'VIETTEL','Viettel',NULL),(2,'https://api.mobifone.com/topup','API_KEY_MOBIFONE','2025-12-24 01:20:41.419404',0.5000,1000.00,_binary '','https://example.com/logos/mobifone.png',500000.00,10000.00,'MOBIFONE','Mobifone',NULL),(3,'https://api.vinaphone.com/topup','API_KEY_VINAPHONE','2025-12-24 01:20:41.422028',0.5000,1000.00,_binary '','https://example.com/logos/vinaphone.png',500000.00,10000.00,'VINAPHONE','Vinaphone',NULL),(4,'https://api.vietnamobile.com/topup','API_KEY_VIETNAMOBILE','2025-12-24 01:20:41.423816',0.5000,1000.00,_binary '','https://example.com/logos/vietnamobile.png',300000.00,10000.00,'VIETNAMOBILE','Vietnamobile',NULL);
/*!40000 ALTER TABLE `telecom_provider` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `top_up_denomination`
--

DROP TABLE IF EXISTS `top_up_denomination`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `top_up_denomination` (
  `denomination_id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(19,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `provider_id` bigint NOT NULL,
  `sort_order` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`denomination_id`),
  KEY `FKguvix26p395fcf2ih1p7eqjjx` (`provider_id`),
  CONSTRAINT `FKguvix26p395fcf2ih1p7eqjjx` FOREIGN KEY (`provider_id`) REFERENCES `telecom_provider` (`provider_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `top_up_denomination`
--

LOCK TABLES `top_up_denomination` WRITE;
/*!40000 ALTER TABLE `top_up_denomination` DISABLE KEYS */;
INSERT INTO `top_up_denomination` VALUES (1,10000.00,'2025-12-24 01:20:41.426136','10,000 VND',_binary '',1,1,NULL),(2,20000.00,'2025-12-24 01:20:41.428232','20,000 VND',_binary '',1,2,NULL),(3,30000.00,'2025-12-24 01:20:41.429796','30,000 VND',_binary '',1,3,NULL),(4,50000.00,'2025-12-24 01:20:41.431366','50,000 VND',_binary '',1,4,NULL),(5,100000.00,'2025-12-24 01:20:41.432945','100,000 VND',_binary '',1,5,NULL),(6,200000.00,'2025-12-24 01:20:41.434600','200,000 VND',_binary '',1,6,NULL),(7,300000.00,'2025-12-24 01:20:41.435656','300,000 VND',_binary '',1,7,NULL),(8,500000.00,'2025-12-24 01:20:41.437229','500,000 VND',_binary '',1,8,NULL),(9,10000.00,'2025-12-24 01:20:41.438813','10,000 VND',_binary '',2,1,NULL),(10,20000.00,'2025-12-24 01:20:41.440404','20,000 VND',_binary '',2,2,NULL),(11,30000.00,'2025-12-24 01:20:41.441998','30,000 VND',_binary '',2,3,NULL),(12,50000.00,'2025-12-24 01:20:41.443688','50,000 VND',_binary '',2,4,NULL),(13,100000.00,'2025-12-24 01:20:41.445290','100,000 VND',_binary '',2,5,NULL),(14,200000.00,'2025-12-24 01:20:41.446902','200,000 VND',_binary '',2,6,NULL),(15,300000.00,'2025-12-24 01:20:41.447959','300,000 VND',_binary '',2,7,NULL),(16,500000.00,'2025-12-24 01:20:41.450073','500,000 VND',_binary '',2,8,NULL),(17,10000.00,'2025-12-24 01:20:41.451148','10,000 VND',_binary '',3,1,NULL),(18,20000.00,'2025-12-24 01:20:41.452725','20,000 VND',_binary '',3,2,NULL),(19,30000.00,'2025-12-24 01:20:41.453810','30,000 VND',_binary '',3,3,NULL),(20,50000.00,'2025-12-24 01:20:41.455993','50,000 VND',_binary '',3,4,NULL),(21,100000.00,'2025-12-24 01:20:41.457597','100,000 VND',_binary '',3,5,NULL),(22,200000.00,'2025-12-24 01:20:41.459844','200,000 VND',_binary '',3,6,NULL),(23,300000.00,'2025-12-24 01:20:41.460897','300,000 VND',_binary '',3,7,NULL),(24,500000.00,'2025-12-24 01:20:41.462494','500,000 VND',_binary '',3,8,NULL),(25,10000.00,'2025-12-24 01:20:41.464101','10,000 VND',_binary '',4,1,NULL),(26,20000.00,'2025-12-24 01:20:41.465153','20,000 VND',_binary '',4,2,NULL),(27,30000.00,'2025-12-24 01:20:41.467282','30,000 VND',_binary '',4,3,NULL),(28,50000.00,'2025-12-24 01:20:41.468870','50,000 VND',_binary '',4,4,NULL),(29,100000.00,'2025-12-24 01:20:41.470533','100,000 VND',_binary '',4,5,NULL),(30,200000.00,'2025-12-24 01:20:41.472309','200,000 VND',_binary '',4,6,NULL),(31,300000.00,'2025-12-24 01:20:41.473383','300,000 VND',_binary '',4,7,NULL),(32,500000.00,'2025-12-24 01:20:41.475563','500,000 VND',_binary '',4,8,NULL);
/*!40000 ALTER TABLE `top_up_denomination` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `transaction_id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `face_auth_at` datetime(6) DEFAULT NULL,
  `face_auth_session_id` varchar(36) DEFAULT NULL,
  `face_auth_verified` bit(1) DEFAULT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `receiver_account_number` varchar(255) NOT NULL,
  `requires_face_auth` bit(1) DEFAULT NULL,
  `sender_account_number` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `transaction_at` datetime(6) DEFAULT NULL,
  `transaction_type` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `purpose_code` varchar(20) DEFAULT NULL,
  `category_id` varchar(50) DEFAULT NULL COMMENT 'Spending category reference',
  PRIMARY KEY (`transaction_id`),
  KEY `idx_transaction_purpose_code` (`purpose_code`),
  KEY `idx_transaction_category` (`category_id`) COMMENT 'Query transactions by category'
) ENGINE=InnoDB AUTO_INCREMENT=251 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES (50,500000.00,'VND','Chuyển tiền mua sắm',NULL,NULL,_binary '\0',NULL,'9876543210',_binary '\0','607074371586','SUCCESS','2025-12-23 09:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(51,200000.00,'VND','Thanh toán tiền điện',NULL,NULL,_binary '\0',NULL,'9876543211',_binary '\0','607074371586','SUCCESS','2025-12-23 14:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(52,1500000.00,'VND','Mua hàng online',NULL,NULL,_binary '\0',NULL,'9876543210',_binary '\0','607074371586','SUCCESS','2025-12-24 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(53,300000.00,'VND','Tiền ăn uống',NULL,NULL,_binary '\0',NULL,'9876543212',_binary '\0','607074371586','SUCCESS','2025-12-24 18:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(54,2000000.00,'VND','Mua điện thoại',NULL,NULL,_binary '\0',NULL,'9876543210',_binary '\0','607074371586','SUCCESS','2025-12-25 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(55,450000.00,'VND','Tiền xăng xe',NULL,NULL,_binary '\0',NULL,'9876543213',_binary '\0','607074371586','SUCCESS','2025-12-25 15:00:00.000000','TRANSFER','test1@gmail.com','TRANSPORTATION',NULL),(56,1000000.00,'VND','Nhận tiền từ bạn',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543215','SUCCESS','2025-12-25 16:00:00.000000','TRANSFER','test1@gmail.com','PERSONAL',NULL),(57,800000.00,'VND','Mua quần áo',NULL,NULL,_binary '\0',NULL,'9876543210',_binary '\0','607074371586','SUCCESS','2025-12-26 13:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(58,150000.00,'VND','Cafe',NULL,NULL,_binary '\0',NULL,'9876543214',_binary '\0','607074371586','SUCCESS','2025-12-26 17:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(59,600000.00,'VND','Mua sách',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-02 10:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(60,1200000.00,'VND','Tiền thuê nhà',NULL,NULL,_binary '\0',NULL,'9876543221',_binary '\0','607074371586','SUCCESS','2025-12-03 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(61,350000.00,'VND','Mua đồ ăn',NULL,NULL,_binary '\0',NULL,'9876543222',_binary '\0','607074371586','SUCCESS','2025-12-04 18:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(62,2000000.00,'VND','Nhận lương part-time',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543225','SUCCESS','2025-12-05 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(63,750000.00,'VND','Mua giày',NULL,NULL,_binary '\0',NULL,'9876543223',_binary '\0','607074371586','SUCCESS','2025-12-06 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(64,450000.00,'VND','Tiền internet',NULL,NULL,_binary '\0',NULL,'9876543224',_binary '\0','607074371586','SUCCESS','2025-12-08 10:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(65,900000.00,'VND','Mua đồ điện tử',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-09 15:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(66,250000.00,'VND','Ăn nhà hàng',NULL,NULL,_binary '\0',NULL,'9876543226',_binary '\0','607074371586','SUCCESS','2025-12-10 19:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(67,1800000.00,'VND','Mua đồ nội thất',NULL,NULL,_binary '\0',NULL,'9876543227',_binary '\0','607074371586','SUCCESS','2025-12-11 13:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(68,500000.00,'VND','Nhận tiền hoàn',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543228','SUCCESS','2025-12-12 16:00:00.000000','TRANSFER','test1@gmail.com','REFUND',NULL),(69,320000.00,'VND','Tiền điện thoại',NULL,NULL,_binary '\0',NULL,'9876543229',_binary '\0','607074371586','SUCCESS','2025-12-15 11:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(70,1100000.00,'VND','Mua đồ công nghệ',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-16 14:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(71,680000.00,'VND','Mua quà tặng',NULL,NULL,_binary '\0',NULL,'9876543230',_binary '\0','607074371586','SUCCESS','2025-12-17 17:00:00.000000','TRANSFER','test1@gmail.com','GIFT',NULL),(72,420000.00,'VND','Đi xem phim',NULL,NULL,_binary '\0',NULL,'9876543231',_binary '\0','607074371586','SUCCESS','2025-12-18 20:00:00.000000','TRANSFER','test1@gmail.com','ENTERTAINMENT',NULL),(73,950000.00,'VND','Mua mỹ phẩm',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-19 12:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(74,600000.00,'VND','Mua sách',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-02 10:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(75,1200000.00,'VND','Tiền thuê nhà',NULL,NULL,_binary '\0',NULL,'9876543221',_binary '\0','607074371586','SUCCESS','2025-12-03 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(76,350000.00,'VND','Mua đồ ăn',NULL,NULL,_binary '\0',NULL,'9876543222',_binary '\0','607074371586','SUCCESS','2025-12-04 18:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(77,2000000.00,'VND','Nhận lương part-time',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543225','SUCCESS','2025-12-05 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(78,750000.00,'VND','Mua giày',NULL,NULL,_binary '\0',NULL,'9876543223',_binary '\0','607074371586','SUCCESS','2025-12-06 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(79,600000.00,'VND','Mua sách',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-02 10:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(80,1200000.00,'VND','Tiền thuê nhà',NULL,NULL,_binary '\0',NULL,'9876543221',_binary '\0','607074371586','SUCCESS','2025-12-03 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(81,350000.00,'VND','Mua đồ ăn',NULL,NULL,_binary '\0',NULL,'9876543222',_binary '\0','607074371586','SUCCESS','2025-12-04 18:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(82,2000000.00,'VND','Nhận lương part-time',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543225','SUCCESS','2025-12-05 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(83,750000.00,'VND','Mua giày',NULL,NULL,_binary '\0',NULL,'9876543223',_binary '\0','607074371586','SUCCESS','2025-12-06 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(84,450000.00,'VND','Tiền internet',NULL,NULL,_binary '\0',NULL,'9876543224',_binary '\0','607074371586','SUCCESS','2025-12-08 10:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(85,900000.00,'VND','Mua đồ điện tử',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-09 15:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(86,250000.00,'VND','Ăn nhà hàng',NULL,NULL,_binary '\0',NULL,'9876543226',_binary '\0','607074371586','SUCCESS','2025-12-10 19:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(87,1800000.00,'VND','Mua đồ nội thất',NULL,NULL,_binary '\0',NULL,'9876543227',_binary '\0','607074371586','SUCCESS','2025-12-11 13:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(88,500000.00,'VND','Nhận tiền hoàn',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543228','SUCCESS','2025-12-12 16:00:00.000000','TRANSFER','test1@gmail.com','REFUND',NULL),(89,320000.00,'VND','Tiền điện thoại',NULL,NULL,_binary '\0',NULL,'9876543229',_binary '\0','607074371586','SUCCESS','2025-12-15 11:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(90,1100000.00,'VND','Mua đồ công nghệ',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-16 14:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(91,680000.00,'VND','Mua quà tặng',NULL,NULL,_binary '\0',NULL,'9876543230',_binary '\0','607074371586','SUCCESS','2025-12-17 17:00:00.000000','TRANSFER','test1@gmail.com','GIFT',NULL),(92,420000.00,'VND','Đi xem phim',NULL,NULL,_binary '\0',NULL,'9876543231',_binary '\0','607074371586','SUCCESS','2025-12-18 20:00:00.000000','TRANSFER','test1@gmail.com','ENTERTAINMENT',NULL),(93,950000.00,'VND','Mua mỹ phẩm',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-19 12:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(95,550000.00,'VND','Mua đồ ăn',NULL,NULL,_binary '\0',NULL,'9876543240',_binary '\0','607074371586','SUCCESS','2025-11-02 10:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(96,1300000.00,'VND','Tiền thuê nhà',NULL,NULL,_binary '\0',NULL,'9876543241',_binary '\0','607074371586','SUCCESS','2025-11-03 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(97,400000.00,'VND','Mua sách',NULL,NULL,_binary '\0',NULL,'9876543242',_binary '\0','607074371586','SUCCESS','2025-11-04 11:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(98,850000.00,'VND','Mua quần áo',NULL,NULL,_binary '\0',NULL,'9876543243',_binary '\0','607074371586','SUCCESS','2025-11-05 15:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(99,1500000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543250','SUCCESS','2025-11-06 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(100,380000.00,'VND','Tiền điện',NULL,NULL,_binary '\0',NULL,'9876543244',_binary '\0','607074371586','SUCCESS','2025-11-09 10:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(101,720000.00,'VND','Mua giày dép',NULL,NULL,_binary '\0',NULL,'9876543245',_binary '\0','607074371586','SUCCESS','2025-11-10 13:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(102,290000.00,'VND','Ăn nhà hàng',NULL,NULL,_binary '\0',NULL,'9876543246',_binary '\0','607074371586','SUCCESS','2025-11-11 19:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(103,1600000.00,'VND','Mua điện thoại',NULL,NULL,_binary '\0',NULL,'9876543247',_binary '\0','607074371586','SUCCESS','2025-11-12 14:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(104,520000.00,'VND','Tiền xăng',NULL,NULL,_binary '\0',NULL,'9876543248',_binary '\0','607074371586','SUCCESS','2025-11-13 16:00:00.000000','TRANSFER','test1@gmail.com','TRANSPORTATION',NULL),(105,340000.00,'VND','Tiền internet',NULL,NULL,_binary '\0',NULL,'9876543249',_binary '\0','607074371586','SUCCESS','2025-11-16 11:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(106,980000.00,'VND','Mua đồ điện tử',NULL,NULL,_binary '\0',NULL,'9876543240',_binary '\0','607074371586','SUCCESS','2025-11-17 15:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(107,450000.00,'VND','Mua quà',NULL,NULL,_binary '\0',NULL,'9876543251',_binary '\0','607074371586','SUCCESS','2025-11-18 17:00:00.000000','TRANSFER','test1@gmail.com','GIFT',NULL),(108,610000.00,'VND','Đi du lịch',NULL,NULL,_binary '\0',NULL,'9876543252',_binary '\0','607074371586','SUCCESS','2025-11-19 12:00:00.000000','TRANSFER','test1@gmail.com','TRAVEL',NULL),(109,800000.00,'VND','Nhận tiền hoàn',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543253','SUCCESS','2025-11-20 10:00:00.000000','TRANSFER','test1@gmail.com','REFUND',NULL),(110,370000.00,'VND','Cafe',NULL,NULL,_binary '\0',NULL,'9876543254',_binary '\0','607074371586','SUCCESS','2025-11-23 14:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(111,1200000.00,'VND','Mua laptop',NULL,NULL,_binary '\0',NULL,'9876543240',_binary '\0','607074371586','SUCCESS','2025-11-24 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(112,490000.00,'VND','Xem phim',NULL,NULL,_binary '\0',NULL,'9876543255',_binary '\0','607074371586','SUCCESS','2025-11-25 20:00:00.000000','TRANSFER','test1@gmail.com','ENTERTAINMENT',NULL),(113,760000.00,'VND','Mua đồ thể thao',NULL,NULL,_binary '\0',NULL,'9876543256',_binary '\0','607074371586','SUCCESS','2025-11-26 13:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(114,280000.00,'VND','Tiền điện thoại',NULL,NULL,_binary '\0',NULL,'9876543257',_binary '\0','607074371586','SUCCESS','2025-11-27 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(116,500000.00,'VND','Mua sắm siêu thị',NULL,NULL,_binary '\0',NULL,'9876543210',_binary '\0','607074371586','SUCCESS','2025-12-23 09:30:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(117,200000.00,'VND','Thanh toán tiền điện',NULL,NULL,_binary '\0',NULL,'9876543211',_binary '\0','607074371586','SUCCESS','2025-12-23 14:15:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(118,800000.00,'VND','Nhận tiền từ bạn',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543215','SUCCESS','2025-12-23 18:00:00.000000','TRANSFER','test1@gmail.com','PERSONAL',NULL),(119,1500000.00,'VND','Mua hàng online',NULL,NULL,_binary '\0',NULL,'9876543210',_binary '\0','607074371586','SUCCESS','2025-12-24 10:20:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(120,300000.00,'VND','Tiền ăn uống',NULL,NULL,_binary '\0',NULL,'9876543212',_binary '\0','607074371586','SUCCESS','2025-12-24 12:30:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(121,450000.00,'VND','Mua quà Giáng sinh',NULL,NULL,_binary '\0',NULL,'9876543210',_binary '\0','607074371586','SUCCESS','2025-12-24 16:00:00.000000','TRANSFER','test1@gmail.com','GIFT',NULL),(122,1200000.00,'VND','Nhận lương part-time',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543216','SUCCESS','2025-12-24 20:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(123,2000000.00,'VND','Mua điện thoại',NULL,NULL,_binary '\0',NULL,'9876543210',_binary '\0','607074371586','SUCCESS','2025-12-25 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(124,450000.00,'VND','Tiền xăng xe',NULL,NULL,_binary '\0',NULL,'9876543213',_binary '\0','607074371586','SUCCESS','2025-12-25 15:30:00.000000','TRANSFER','test1@gmail.com','TRANSPORTATION',NULL),(125,1500000.00,'VND','Nhận tiền từ gia đình',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543217','COMPLETED','2025-12-25 19:00:00.000000','TRANSFER','test1@gmail.com','FAMILY',NULL),(126,400000.00,'VND','Mua sách',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-16 09:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(127,250000.00,'VND','Tiền internet',NULL,NULL,_binary '\0',NULL,'9876543221',_binary '\0','607074371586','SUCCESS','2025-12-16 14:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(128,1100000.00,'VND','Mua đồ công nghệ',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-17 10:30:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(129,350000.00,'VND','Mua đồ ăn',NULL,NULL,_binary '\0',NULL,'9876543222',_binary '\0','607074371586','SUCCESS','2025-12-17 12:45:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(130,900000.00,'VND','Nhận tiền hoàn',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543225','SUCCESS','2025-12-17 18:00:00.000000','TRANSFER','test1@gmail.com','REFUND',NULL),(131,680000.00,'VND','Mua quà tặng',NULL,NULL,_binary '\0',NULL,'9876543223',_binary '\0','607074371586','SUCCESS','2025-12-18 11:00:00.000000','TRANSFER','test1@gmail.com','GIFT',NULL),(132,420000.00,'VND','Đi xem phim',NULL,NULL,_binary '\0',NULL,'9876543224',_binary '\0','607074371586','SUCCESS','2025-12-18 20:00:00.000000','TRANSFER','test1@gmail.com','ENTERTAINMENT',NULL),(133,950000.00,'VND','Xổ số',NULL,NULL,_binary '\0',NULL,'9876543220',_binary '\0','607074371586','SUCCESS','2025-12-19 12:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(134,180000.00,'VND','Cafe sáng',NULL,NULL,_binary '\0',NULL,'9876543226',_binary '\0','607074371586','SUCCESS','2025-12-19 08:30:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(135,1500000.00,'VND','Mua đồ nội thất',NULL,NULL,_binary '\0',NULL,'9876543227',_binary '\0','607074371586','SUCCESS','2025-12-20 13:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(136,320000.00,'VND','Tiền điện thoại',NULL,NULL,_binary '\0',NULL,'9876543228',_binary '\0','607074371586','SUCCESS','2025-12-20 15:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(137,1100000.00,'VND','Nhận tiền bán đồ',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543229','SUCCESS','2025-12-20 17:00:00.000000','TRANSFER','test1@gmail.com','PERSONAL',NULL),(138,550000.00,'VND','Mua đồ thể thao',NULL,NULL,_binary '\0',NULL,'9876543230',_binary '\0','607074371586','SUCCESS','2025-12-21 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(139,280000.00,'VND','Ăn trưa',NULL,NULL,_binary '\0',NULL,'9876543231',_binary '\0','607074371586','SUCCESS','2025-12-21 12:30:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(140,800000.00,'VND','Đi chơi cuối tuần',NULL,NULL,_binary '\0',NULL,'9876543232',_binary '\0','607074371586','SUCCESS','2025-12-22 14:00:00.000000','TRANSFER','test1@gmail.com','ENTERTAINMENT',NULL),(141,600000.00,'VND','Mua sách giáo khoa',NULL,NULL,_binary '\0',NULL,'9876543240',_binary '\0','607074371586','SUCCESS','2025-12-02 10:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(142,1200000.00,'VND','Tiền thuê nhà tháng 12',NULL,NULL,_binary '\0',NULL,'9876543241',_binary '\0','607074371586','SUCCESS','2025-12-03 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(143,350000.00,'VND','Mua đồ ăn',NULL,NULL,_binary '\0',NULL,'9876543242',_binary '\0','607074371586','SUCCESS','2025-12-04 18:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(144,2500000.00,'VND','Nhận lương part-time',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543250','SUCCESS','2025-12-05 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(145,750000.00,'VND','Mua giày',NULL,NULL,_binary '\0',NULL,'9876543243',_binary '\0','607074371586','SUCCESS','2025-12-06 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(146,280000.00,'VND','Tiền điện',NULL,NULL,_binary '\0',NULL,'9876543244',_binary '\0','607074371586','SUCCESS','2025-12-07 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(147,450000.00,'VND','Tiền internet',NULL,NULL,_binary '\0',NULL,'9876543245',_binary '\0','607074371586','SUCCESS','2025-12-08 10:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(148,900000.00,'VND','Mua đồ điện tử',NULL,NULL,_binary '\0',NULL,'9876543240',_binary '\0','607074371586','SUCCESS','2025-12-09 15:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(149,250000.00,'VND','Ăn nhà hàng',NULL,NULL,_binary '\0',NULL,'9876543246',_binary '\0','607074371586','SUCCESS','2025-12-10 19:00:00.000000','TRANSFER','test1@gmail.com','FOOD','1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(150,1800000.00,'VND','Mua đồ nội thất',NULL,NULL,_binary '\0',NULL,'9876543247',_binary '\0','607074371586','SUCCESS','2025-12-11 13:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(151,650000.00,'VND','Nhận tiền hoàn',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543251','SUCCESS','2025-12-12 16:00:00.000000','TRANSFER','test1@gmail.com','REFUND',NULL),(152,380000.00,'VND','Mua đồ ăn vặt',NULL,NULL,_binary '\0',NULL,'9876543248',_binary '\0','607074371586','SUCCESS','2025-12-13 11:30:00.000000','TRANSFER','test1@gmail.com','FOOD',NULL),(153,520000.00,'VND','Tiền xăng',NULL,NULL,_binary '\0',NULL,'9876543249',_binary '\0','607074371586','SUCCESS','2025-12-14 17:00:00.000000','TRANSFER','test1@gmail.com','TRANSPORTATION',NULL),(154,550000.00,'VND','Mua đồ ăn',NULL,NULL,_binary '\0',NULL,'9876543260',_binary '\0','607074371586','SUCCESS','2025-11-02 10:00:00.000000','TRANSFER','test1@gmail.com','FOOD',NULL),(155,1300000.00,'VND','Tiền thuê nhà tháng 11',NULL,NULL,_binary '\0',NULL,'9876543261',_binary '\0','607074371586','SUCCESS','2025-11-03 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(156,400000.00,'VND','Mua sách',NULL,NULL,_binary '\0',NULL,'9876543262',_binary '\0','607074371586','SUCCESS','2025-11-04 11:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(157,850000.00,'VND','Mua quần áo',NULL,NULL,_binary '\0',NULL,'9876543263',_binary '\0','607074371586','SUCCESS','2025-11-05 15:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(158,2000000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543270','SUCCESS','2025-11-06 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(159,380000.00,'VND','Tiền điện',NULL,NULL,_binary '\0',NULL,'9876543264',_binary '\0','607074371586','SUCCESS','2025-11-09 10:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(160,720000.00,'VND','Mua giày dép',NULL,NULL,_binary '\0',NULL,'9876543265',_binary '\0','607074371586','SUCCESS','2025-11-10 13:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(161,290000.00,'VND','Ăn nhà hàng',NULL,NULL,_binary '\0',NULL,'9876543266',_binary '\0','607074371586','SUCCESS','2025-11-11 19:00:00.000000','TRANSFER','test1@gmail.com','FOOD',NULL),(162,1600000.00,'VND','Mua điện thoại',NULL,NULL,_binary '\0',NULL,'9876543267',_binary '\0','607074371586','SUCCESS','2025-11-12 14:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(163,520000.00,'VND','Tiền xăng',NULL,NULL,_binary '\0',NULL,'9876543268',_binary '\0','607074371586','SUCCESS','2025-11-13 16:00:00.000000','TRANSFER','test1@gmail.com','TRANSPORTATION',NULL),(164,340000.00,'VND','Tiền internet',NULL,NULL,_binary '\0',NULL,'9876543269',_binary '\0','607074371586','SUCCESS','2025-11-16 11:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(165,980000.00,'VND','Mua đồ điện tử',NULL,NULL,_binary '\0',NULL,'9876543260',_binary '\0','607074371586','SUCCESS','2025-11-17 15:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(166,450000.00,'VND','Mua quà',NULL,NULL,_binary '\0',NULL,'9876543271',_binary '\0','607074371586','SUCCESS','2025-11-18 17:00:00.000000','TRANSFER','test1@gmail.com','GIFT',NULL),(167,610000.00,'VND','Đi du lịch',NULL,NULL,_binary '\0',NULL,'9876543272',_binary '\0','607074371586','SUCCESS','2025-11-19 12:00:00.000000','TRANSFER','test1@gmail.com','TRAVEL',NULL),(168,1200000.00,'VND','Nhận tiền hoàn',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543273','SUCCESS','2025-11-20 10:00:00.000000','TRANSFER','test1@gmail.com','REFUND',NULL),(169,370000.00,'VND','Cafe',NULL,NULL,_binary '\0',NULL,'9876543274',_binary '\0','607074371586','SUCCESS','2025-11-23 14:00:00.000000','TRANSFER','test1@gmail.com','FOOD',NULL),(170,1200000.00,'VND','Mua laptop',NULL,NULL,_binary '\0',NULL,'9876543260',_binary '\0','607074371586','SUCCESS','2025-11-24 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(171,490000.00,'VND','Xem phim',NULL,NULL,_binary '\0',NULL,'9876543275',_binary '\0','607074371586','SUCCESS','2025-11-25 20:00:00.000000','TRANSFER','test1@gmail.com','ENTERTAINMENT',NULL),(172,760000.00,'VND','Mua đồ thể thao',NULL,NULL,_binary '\0',NULL,'9876543276',_binary '\0','607074371586','SUCCESS','2025-11-26 13:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(173,280000.00,'VND','Tiền điện thoại',NULL,NULL,_binary '\0',NULL,'9876543277',_binary '\0','607074371586','SUCCESS','2025-11-27 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(174,1500000.00,'VND','Tiền thuê nhà tháng 1',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-01-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(175,800000.00,'VND','Mua sắm Tết',NULL,NULL,_binary '\0',NULL,'9876543302',_binary '\0','607074371586','SUCCESS','2025-01-10 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(176,1200000.00,'VND','Mua quà Tết',NULL,NULL,_binary '\0',NULL,'9876543303',_binary '\0','607074371586','SUCCESS','2025-01-15 11:00:00.000000','TRANSFER','test1@gmail.com','GIFT',NULL),(177,3000000.00,'VND','Nhận lì xì Tết',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543310','SUCCESS','2025-01-20 09:00:00.000000','TRANSFER','test1@gmail.com','GIFT',NULL),(178,500000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543304',_binary '\0','607074371586','SUCCESS','2025-01-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(179,1500000.00,'VND','Tiền thuê nhà tháng 2',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-02-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(180,600000.00,'VND','Mua sách học',NULL,NULL,_binary '\0',NULL,'9876543305',_binary '\0','607074371586','SUCCESS','2025-02-10 10:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(181,2500000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543311','SUCCESS','2025-02-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(182,450000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543306',_binary '\0','607074371586','SUCCESS','2025-02-20 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(183,1500000.00,'VND','Tiền thuê nhà tháng 2',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-02-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(184,600000.00,'VND','Mua sách học',NULL,NULL,_binary '\0',NULL,'9876543305',_binary '\0','607074371586','SUCCESS','2025-02-10 10:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(185,2500000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543311','SUCCESS','2025-02-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(186,450000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543306',_binary '\0','607074371586','SUCCESS','2025-02-20 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(187,1500000.00,'VND','Tiền thuê nhà tháng 3',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-03-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(188,1800000.00,'VND','Mua laptop',NULL,NULL,_binary '\0',NULL,'9876543307',_binary '\0','607074371586','SUCCESS','2025-03-10 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(189,2800000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543312','SUCCESS','2025-03-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(190,700000.00,'VND','Mua quần áo',NULL,NULL,_binary '\0',NULL,'9876543308',_binary '\0','607074371586','SUCCESS','2025-03-20 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(191,400000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543309',_binary '\0','607074371586','SUCCESS','2025-03-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(192,1500000.00,'VND','Tiền thuê nhà tháng 3',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-03-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(193,1800000.00,'VND','Mua laptop',NULL,NULL,_binary '\0',NULL,'9876543307',_binary '\0','607074371586','SUCCESS','2025-03-10 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(194,2800000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543312','SUCCESS','2025-03-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(195,700000.00,'VND','Mua quần áo',NULL,NULL,_binary '\0',NULL,'9876543308',_binary '\0','607074371586','SUCCESS','2025-03-20 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(196,400000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543309',_binary '\0','607074371586','SUCCESS','2025-03-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(197,1500000.00,'VND','Tiền thuê nhà tháng 4',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-04-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(198,900000.00,'VND','Mua giày',NULL,NULL,_binary '\0',NULL,'9876543320',_binary '\0','607074371586','SUCCESS','2025-04-10 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(199,2600000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543313','SUCCESS','2025-04-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(200,550000.00,'VND','Đi du lịch',NULL,NULL,_binary '\0',NULL,'9876543321',_binary '\0','607074371586','SUCCESS','2025-04-20 11:00:00.000000','TRANSFER','test1@gmail.com','TRAVEL',NULL),(201,380000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543322',_binary '\0','607074371586','SUCCESS','2025-04-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(202,1500000.00,'VND','Tiền thuê nhà tháng 5',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-05-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(203,1100000.00,'VND','Mua điện thoại',NULL,NULL,_binary '\0',NULL,'9876543323',_binary '\0','607074371586','SUCCESS','2025-05-10 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(204,2700000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543314','SUCCESS','2025-05-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(205,650000.00,'VND','Mua đồ điện tử',NULL,NULL,_binary '\0',NULL,'9876543324',_binary '\0','607074371586','SUCCESS','2025-05-20 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(206,420000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543325',_binary '\0','607074371586','SUCCESS','2025-05-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(207,1500000.00,'VND','Tiền thuê nhà tháng 6',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-06-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(208,800000.00,'VND','Mua quần áo hè',NULL,NULL,_binary '\0',NULL,'9876543326',_binary '\0','607074371586','SUCCESS','2025-06-10 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(209,2900000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543315','SUCCESS','2025-06-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(210,1200000.00,'VND','Đi du lịch hè',NULL,NULL,_binary '\0',NULL,'9876543327',_binary '\0','607074371586','SUCCESS','2025-06-20 11:00:00.000000','TRANSFER','test1@gmail.com','TRAVEL',NULL),(211,450000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543328',_binary '\0','607074371586','SUCCESS','2025-06-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(212,1500000.00,'VND','Tiền thuê nhà tháng 7',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-07-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(213,950000.00,'VND','Mua sách',NULL,NULL,_binary '\0',NULL,'9876543329',_binary '\0','607074371586','SUCCESS','2025-07-10 10:00:00.000000','TRANSFER','test1@gmail.com','EDUCATION',NULL),(214,3100000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543316','SUCCESS','2025-07-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(215,720000.00,'VND','Mua đồ thể thao',NULL,NULL,_binary '\0',NULL,'9876543330',_binary '\0','607074371586','SUCCESS','2025-07-20 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(216,480000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543331',_binary '\0','607074371586','SUCCESS','2025-07-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(217,1500000.00,'VND','Tiền thuê nhà tháng 8',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-08-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(218,1300000.00,'VND','Mua laptop',NULL,NULL,_binary '\0',NULL,'9876543332',_binary '\0','607074371586','SUCCESS','2025-08-10 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(219,2800000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543317','SUCCESS','2025-08-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(220,850000.00,'VND','Mua đồ điện tử',NULL,NULL,_binary '\0',NULL,'9876543333',_binary '\0','607074371586','SUCCESS','2025-08-20 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(221,420000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543334',_binary '\0','607074371586','SUCCESS','2025-08-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(222,1500000.00,'VND','Tiền thuê nhà tháng 9',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-09-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(223,700000.00,'VND','Mua quần áo',NULL,NULL,_binary '\0',NULL,'9876543335',_binary '\0','607074371586','SUCCESS','2025-09-10 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(224,2900000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543318','SUCCESS','2025-09-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(225,600000.00,'VND','Mua giày',NULL,NULL,_binary '\0',NULL,'9876543336',_binary '\0','607074371586','SUCCESS','2025-09-20 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(226,390000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543337',_binary '\0','607074371586','SUCCESS','2025-09-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(227,1500000.00,'VND','Tiền thuê nhà tháng 10',NULL,NULL,_binary '\0',NULL,'9876543301',_binary '\0','607074371586','SUCCESS','2025-10-05 14:00:00.000000','TRANSFER','test1@gmail.com','RENT',NULL),(228,1100000.00,'VND','Mua điện thoại',NULL,NULL,_binary '\0',NULL,'9876543338',_binary '\0','607074371586','SUCCESS','2025-10-10 10:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(229,3000000.00,'VND','Nhận lương',NULL,NULL,_binary '\0',NULL,'607074371586',_binary '\0','9876543319','SUCCESS','2025-10-15 09:00:00.000000','TRANSFER','test1@gmail.com','SALARY',NULL),(230,750000.00,'VND','Mua đồ nội thất',NULL,NULL,_binary '\0',NULL,'9876543339',_binary '\0','607074371586','SUCCESS','2025-10-20 11:00:00.000000','TRANSFER','test1@gmail.com','SHOPPING',NULL),(231,460000.00,'VND','Tiền điện nước',NULL,NULL,_binary '\0',NULL,'9876543340',_binary '\0','607074371586','SUCCESS','2025-10-25 16:00:00.000000','TRANSFER','test1@gmail.com','BILL_PAYMENT',NULL),(232,500000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-25 16:44:37.880856','TRANSFER','test1@gmail.com',NULL,NULL),(233,40000000.00,'VND','Xổ số',NULL,NULL,NULL,NULL,'607074371586',NULL,'SAV540545710','COMPLETED','2025-12-25 17:21:28.656613','SAVINGS_TO_PAYMENT','SYSTEM',NULL,NULL),(234,10000000.00,'VND','Initial deposit to savings account',NULL,NULL,NULL,NULL,'SAV686800163',NULL,'607074371586','COMPLETED','2025-12-25 18:20:00.201214','SAVINGS_DEPOSIT','SYSTEM',NULL,NULL),(235,10000000.00,'VND','Rút tiền',NULL,NULL,NULL,NULL,'607074371586',NULL,'SAV686800163','COMPLETED','2025-12-26 03:30:58.539660','SAVINGS_TO_PAYMENT','SYSTEM',NULL,NULL),(236,21100.00,'VND','Phone top-up 0987654321 - VIETTEL',NULL,NULL,_binary '',NULL,'PHONE_TOPUP_0987654321',_binary '\0','607074371586','COMPLETED','2025-12-26 15:50:41.597003','PHONE_TOPUP','test1@gmail.com',NULL,NULL),(237,21100.00,'VND','Phone top-up 0912345678 - VINAPHONE',NULL,NULL,_binary '',NULL,'PHONE_TOPUP_0912345678',_binary '\0','607074371586','COMPLETED','2025-12-26 16:01:42.599951','PHONE_TOPUP','test1@gmail.com',NULL,NULL),(238,21100.00,'VND','Phone top-up 0912345678 - VINAPHONE',NULL,NULL,_binary '',NULL,'PHONE_TOPUP_0912345678',_binary '\0','607074371586','COMPLETED','2025-12-26 16:04:16.245919','PHONE_TOPUP','test1@gmail.com',NULL,NULL),(239,500000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-27 04:41:42.801114','TRANSFER','test1@gmail.com',NULL,NULL),(240,100000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-27 04:46:08.697010','TRANSFER','test1@gmail.com',NULL,NULL),(241,1000000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-27 04:47:12.718433','TRANSFER','test1@gmail.com',NULL,NULL),(242,100000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-27 04:53:35.532885','TRANSFER','test1@gmail.com',NULL,NULL),(243,100000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-27 04:59:37.096573','TRANSFER','test1@gmail.com',NULL,'1a977ad1-e2dc-11f0-8280-3ad61fddc4ba'),(244,1000000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-27 05:19:10.800993','TRANSFER','test1@gmail.com',NULL,'1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(245,100000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-27 05:43:34.388542','TRANSFER','test1@gmail.com',NULL,'de6e7045-bfb1-4171-a31e-62be341f07b6'),(246,100000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-28 12:53:31.938994','TRANSFER','test1@gmail.com',NULL,'1a977c0e-e2dc-11f0-8280-3ad61fddc4ba'),(247,6000000.00,'VND','Chuyển tiền','2025-12-28 12:54:57.154259','a70b9d18-ec89-4224-9896-31ca630e59f8',_binary '',NULL,'689406757320',_binary '','607074371586','SUCCESS','2025-12-28 12:54:57.154259','TRANSFER','test1@gmail.com',NULL,'1a9779e6-e2dc-11f0-8280-3ad61fddc4ba'),(248,2000000.00,'VND','Initial deposit to savings account',NULL,NULL,NULL,NULL,'SAV929378497',NULL,'607074371586','COMPLETED','2025-12-28 13:42:58.570715','SAVINGS_DEPOSIT','SYSTEM',NULL,NULL),(249,500000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-29 08:05:50.143320','TRANSFER','test1@gmail.com',NULL,'1a976a1c-e2dc-11f0-8280-3ad61fddc4ba'),(250,5000000.00,'VND','Chuyển tiền',NULL,'',_binary '\0',NULL,'689406757320',_binary '\0','607074371586','SUCCESS','2025-12-29 13:42:43.162852','TRANSFER','test1@gmail.com',NULL,'1a977ad1-e2dc-11f0-8280-3ad61fddc4ba');
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_limit`
--

DROP TABLE IF EXISTS `transaction_limit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_limit` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_at` datetime(6) DEFAULT NULL,
  `daily_limit` decimal(19,2) NOT NULL,
  `limit_date` date NOT NULL,
  `single_transaction_limit` decimal(19,2) NOT NULL,
  `update_at` datetime(6) DEFAULT NULL,
  `used_amount` decimal(19,2) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKimubuqpb1e0inbvmh27jy47m8` (`user_id`,`limit_date`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_limit`
--

LOCK TABLES `transaction_limit` WRITE;
/*!40000 ALTER TABLE `transaction_limit` DISABLE KEYS */;
INSERT INTO `transaction_limit` VALUES (1,'2025-12-23 12:17:54.757697',50000000.00,'2025-12-23',10000000.00,'2025-12-23 16:08:49.771143',31100000.00,1),(2,'2025-12-23 12:21:57.347951',50000000.00,'2025-12-23',10000000.00,'2025-12-23 12:21:57.347951',0.00,2),(3,'2025-12-23 17:52:38.544155',50000000.00,'2025-12-24',5000000.00,'2025-12-24 13:31:04.925551',13412140.00,1),(4,'2025-12-25 05:11:14.557562',50000000.00,'2025-12-25',5000000.00,'2025-12-25 16:44:38.213124',2100000.00,1),(5,'2025-12-26 15:50:41.520228',50000000.00,'2025-12-26',5000000.00,'2025-12-26 15:50:41.520228',0.00,1),(6,'2025-12-27 04:41:39.199522',50000000.00,'2025-12-27',5000000.00,'2025-12-27 05:43:34.465418',2900000.00,1),(7,'2025-12-28 12:53:25.475921',50000000.00,'2025-12-28',5000000.00,'2025-12-28 12:54:57.182012',6100000.00,1),(8,'2025-12-29 08:05:45.049778',50000000.00,'2025-12-29',5000000.00,'2025-12-29 13:42:43.740138',5500000.00,1);
/*!40000 ALTER TABLE `transaction_limit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_request`
--

DROP TABLE IF EXISTS `transaction_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_request` (
  `request_id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `currency` varchar(3) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `processed_at` datetime(6) DEFAULT NULL,
  `processed_by` varchar(255) DEFAULT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `request_number` varchar(255) NOT NULL,
  `request_type` varchar(255) NOT NULL,
  `requested_at` datetime(6) NOT NULL,
  `savings_account_id` bigint NOT NULL,
  `status` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`request_id`),
  UNIQUE KEY `UKkkaupdjavgwslrvqfyuubqj7d` (`request_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_request`
--

LOCK TABLES `transaction_request` WRITE;
/*!40000 ALTER TABLE `transaction_request` DISABLE KEYS */;
INSERT INTO `transaction_request` VALUES (1,10000000.00,'2025-12-24 01:43:31.613656','VND',NULL,'2025-12-24 04:01:00.000000','tiến',NULL,'REQ540611606','CASH_WITHDRAWAL','2025-12-24 01:43:31.613656',1,'APPROVED','2025-12-24 04:01:00.000000',1),(2,10000000.00,'2025-12-24 13:24:17.274503','VND','Rút tiền',NULL,NULL,NULL,'REQ582657270','CASH_WITHDRAWAL','2025-12-24 13:24:17.274503',1,'PENDING','2025-12-24 13:24:17.274503',1);
/*!40000 ALTER TABLE `transaction_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfer_purposes`
--

DROP TABLE IF EXISTS `transfer_purposes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer_purposes` (
  `id` varchar(50) NOT NULL,
  `code` varchar(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `icon` varchar(10) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfl0hurdhv0xmjd29qxr5mvoqx` (`code`),
  KEY `idx_transfer_purposes_code` (`code`),
  KEY `idx_transfer_purposes_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfer_purposes`
--

LOCK TABLES `transfer_purposes` WRITE;
/*!40000 ALTER TABLE `transfer_purposes` DISABLE KEYS */;
INSERT INTO `transfer_purposes` VALUES ('1','MARKET',NULL,'🛒',_binary '','Đi chợ',NULL),('2','SHOPPING',NULL,'🛍️',_binary '','Mua sắm',NULL),('3','BILL',NULL,'📄',_binary '','Hóa đơn',NULL),('4','TUITION',NULL,'🎓',_binary '','Học phí',NULL),('5','FOOD',NULL,'🍽️',_binary '','Ăn uống',NULL),('6','OTHER',NULL,'📝',_binary '','Khác',NULL);
/*!40000 ALTER TABLE `transfer_purposes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 14:04:10
