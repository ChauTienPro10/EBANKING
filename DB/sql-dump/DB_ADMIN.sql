-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: DB_ADMIN
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
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_active` (`active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin','$2a$10$k5Lxb0RAei65JgSEmzyknuDQGlXjVmYI3Sh51xVE68dsHwDnKDK/2','Default Admin','ROLE_ADMIN',1,'2025-12-19 04:21:40','2025-12-19 04:28:27');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `staff_username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `success` tinyint(1) NOT NULL,
  `timestamp` timestamp NOT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_staff_username` (`staff_username`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_action` (`action`),
  KEY `idx_target` (`target_type`,`target_id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'admin','LOGIN','ADMIN_SYSTEM',NULL,'Test login - system initialized',1,'2025-12-19 04:21:43','127.0.0.1'),(2,'admin','LOGIN','ADMIN_SYSTEM',NULL,'Invalid password',0,'2025-12-19 04:26:33','0:0:0:0:0:0:0:1'),(3,'admin','LOGIN','ADMIN_SYSTEM',NULL,'Admin login successful',1,'2025-12-19 04:28:54','0:0:0:0:0:0:0:1'),(4,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:28:54',NULL),(5,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:28:54',NULL),(6,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:30:05',NULL),(7,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:30:05',NULL),(8,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:30:17',NULL),(9,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:30:17',NULL),(10,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:30:28',NULL),(11,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:30:28',NULL),(12,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:30:54',NULL),(13,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:30:54',NULL),(14,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-19 04:43:11',NULL),(15,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-19 04:43:11',NULL),(16,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:43:18',NULL),(17,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 04:43:18',NULL),(18,'admin','LOGIN','ADMIN_SYSTEM',NULL,'Admin login successful',1,'2025-12-19 06:15:44','0:0:0:0:0:0:0:1'),(19,'admin','LOGIN','ADMIN_SYSTEM',NULL,'Admin login successful',1,'2025-12-19 07:02:58','0:0:0:0:0:0:0:1'),(20,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 07:02:58',NULL),(21,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 07:02:58',NULL),(22,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-19 07:03:21',NULL),(23,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-19 07:03:21',NULL),(24,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 07:03:36',NULL),(25,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 07:03:36',NULL),(26,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 07:05:30',NULL),(27,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 07:05:30',NULL),(28,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-19 07:18:38',NULL),(29,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-19 07:18:38',NULL),(30,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 07:21:15',NULL),(31,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-19 07:21:15',NULL),(32,'admin','LOGIN','ADMIN_SYSTEM',NULL,'Admin login successful',1,'2025-12-22 02:23:08','0:0:0:0:0:0:0:1'),(33,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-22 02:30:34',NULL),(34,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-22 02:30:34',NULL),(35,'admin','LOGIN','ADMIN_SYSTEM',NULL,'Admin login successful',1,'2025-12-24 03:59:43','0:0:0:0:0:0:0:1'),(36,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-24 03:59:44',NULL),(37,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-24 03:59:44',NULL),(38,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=null, status=null',1,'2025-12-24 04:00:02',NULL),(39,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=null, status=null',1,'2025-12-24 04:00:03',NULL),(40,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=TRANSFER, status=null',1,'2025-12-24 04:00:14',NULL),(41,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=TRANSFER, status=null',1,'2025-12-24 04:00:19',NULL),(42,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=TRANSFER, status=null',1,'2025-12-24 04:00:25',NULL),(43,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=TRANSFER, status=null',1,'2025-12-24 04:00:31',NULL),(44,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=TRANSFER, status=null',1,'2025-12-24 04:00:33',NULL),(45,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 04:00:37',NULL),(46,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 04:00:37',NULL),(47,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 04:01:20',NULL),(48,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 04:01:20',NULL),(49,'admin','PUSH_NOTIFICATION','NOTIFICATION','test1@gmail.com','PUSH_USER title=Thông báo hệ thống',1,'2025-12-24 04:02:04',NULL),(50,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=TRANSFER, status=null',1,'2025-12-24 04:09:06',NULL),(51,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=TRANSFER, status=null',1,'2025-12-24 04:09:06',NULL),(52,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-24 04:09:13',NULL),(53,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-24 04:09:13',NULL),(54,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 04:09:27',NULL),(55,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 04:09:27',NULL),(56,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=TRANSFER, status=null',1,'2025-12-24 04:09:46',NULL),(57,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=TRANSFER, status=null',1,'2025-12-24 04:09:46',NULL),(58,'admin','LOGIN','ADMIN_SYSTEM',NULL,'Admin login successful',1,'2025-12-24 10:03:00','0:0:0:0:0:0:0:1'),(59,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-24 10:03:01',NULL),(60,'admin','VIEW_DASHBOARD','SYSTEM',NULL,'Viewed dashboard statistics',1,'2025-12-24 10:03:01',NULL),(61,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=null, status=null',1,'2025-12-24 10:04:39',NULL),(62,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=null, status=null',1,'2025-12-24 10:04:40',NULL),(63,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 10:05:20',NULL),(64,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 10:05:20',NULL),(65,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 10:06:18',NULL),(66,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 10:06:18',NULL),(67,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 10:06:43',NULL),(68,'admin','VIEW_USERS','USER',NULL,'GET_ALL_USERS count=2',1,'2025-12-24 10:06:43',NULL),(69,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=null, status=null',1,'2025-12-24 10:06:45',NULL),(70,'ADMIN_CONSOLE','VIEW_TRANSACTIONS','TRANSACTION',NULL,'page=0, size=10, search=null, type=null, status=null',1,'2025-12-24 10:06:45',NULL),(71,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-24 10:07:53',NULL),(72,'admin','LIST_ADMINS','ADMIN',NULL,'page=0, size=10, q=null,  role=null, active=null',1,'2025-12-24 10:07:53',NULL);
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','Initial Schema','SQL','V1__Initial_Schema.sql',1346247734,'root','2025-12-19 04:21:40',158,1),(2,'2','Insert Default Data','SQL','V2__Insert_Default_Data.sql',-41469235,'root','2025-12-19 04:21:40',7,1),(3,'3','create notification history','SQL','V3__create_notification_history.sql',-1574264968,'root','2025-12-19 06:00:39',174,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attempt_count` int DEFAULT '1',
  `last_attempt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `locked_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_last_attempt` (`last_attempt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_history`
--

DROP TABLE IF EXISTS `notification_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NOT NULL,
  `mode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SINGLE, MULTI, BROADCAST',
  `receiver_count` int NOT NULL DEFAULT '0',
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL' COMMENT 'LOW, NORMAL, HIGH',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUCCESS' COMMENT 'SUCCESS, FAILED, SCHEDULED',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sent_by` (`sent_by`),
  KEY `idx_sent_at` (`sent_at`),
  KEY `idx_status` (`status`),
  KEY `idx_mode` (`mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_history`
--

LOCK TABLES `notification_history` WRITE;
/*!40000 ALTER TABLE `notification_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_receiver`
--

DROP TABLE IF EXISTS `notification_receiver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_receiver` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `notification_history_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT 'DELIVERED, FAILED, PENDING',
  `delivered_at` timestamp NULL DEFAULT NULL,
  `failure_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notification_id` (`notification_history_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `notification_receiver_ibfk_1` FOREIGN KEY (`notification_history_id`) REFERENCES `notification_history` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_receiver`
--

LOCK TABLES `notification_receiver` WRITE;
/*!40000 ALTER TABLE `notification_receiver` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_receiver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_refresh_token` (`token`),
  KEY `idx_refresh_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (6,'admin','7985cb1d-11fe-40e8-b1d1-03ecf3e1ca17','2025-12-31 10:03:00',0,'2025-12-24 10:03:00');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 14:04:07
