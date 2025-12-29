-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: DB_AUTH
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
-- Table structure for table `db_pin_code`
--

DROP TABLE IF EXISTS `db_pin_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `db_pin_code` (
  `id` bigint NOT NULL,
  `created_at` bigint NOT NULL,
  `pin_code` varchar(255) DEFAULT NULL,
  `updated_at` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `db_pin_code`
--

LOCK TABLES `db_pin_code` WRITE;
/*!40000 ALTER TABLE `db_pin_code` DISABLE KEYS */;
INSERT INTO `db_pin_code` VALUES (402,1765855653881,'$2a$10$djYcqBkrJQCTVS8zM8PVX.hihpiAc5Y.SihUP7IPXWrTgoSKUQ4.S',0,2),(403,1765856425470,'$2a$10$d0nDuv0or1L5/i3AM4V9FuM3N1QMKfOxAt/t0Isi0aAnTLmscbyHy',0,52),(452,1766338373225,'$2a$10$PfxY6ff6F2kvJdv4LNCccuNlQCdb0gUiokVLq8tTIBRXH1Q0T8in6',0,1);
/*!40000 ALTER TABLE `db_pin_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `db_pin_code_seq`
--

DROP TABLE IF EXISTS `db_pin_code_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `db_pin_code_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `db_pin_code_seq`
--

LOCK TABLES `db_pin_code_seq` WRITE;
/*!40000 ALTER TABLE `db_pin_code_seq` DISABLE KEYS */;
INSERT INTO `db_pin_code_seq` VALUES (551);
/*!40000 ALTER TABLE `db_pin_code_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invalid_token`
--

DROP TABLE IF EXISTS `invalid_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invalid_token` (
  `id` bigint NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invalid_token`
--

LOCK TABLES `invalid_token` WRITE;
/*!40000 ALTER TABLE `invalid_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `invalid_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invalid_token_seq`
--

DROP TABLE IF EXISTS `invalid_token_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invalid_token_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invalid_token_seq`
--

LOCK TABLES `invalid_token_seq` WRITE;
/*!40000 ALTER TABLE `invalid_token_seq` DISABLE KEYS */;
INSERT INTO `invalid_token_seq` VALUES (1);
/*!40000 ALTER TABLE `invalid_token_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lock_account`
--

DROP TABLE IF EXISTS `lock_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lock_account` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_id` bigint DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `lock_type` varchar(20) NOT NULL,
  `locked_at` datetime(6) NOT NULL,
  `locked_by` varchar(255) NOT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `reason` varchar(500) NOT NULL,
  `unlocked_at` datetime(6) DEFAULT NULL,
  `unlocked_by` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lock_account`
--

LOCK TABLES `lock_account` WRITE;
/*!40000 ALTER TABLE `lock_account` DISABLE KEYS */;
/*!40000 ALTER TABLE `lock_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `noti-transaction`
--

DROP TABLE IF EXISTS `noti-transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `noti-transaction` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` varchar(255) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `created_at` bigint DEFAULT NULL,
  `noi_dung_giao_dich` varchar(255) DEFAULT NULL,
  `sender` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_username` (`username`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `noti-transaction`
--

LOCK TABLES `noti-transaction` WRITE;
/*!40000 ALTER TABLE `noti-transaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `noti-transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `noti_system`
--

DROP TABLE IF EXISTS `noti_system`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `noti_system` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `created_at` bigint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `noti_system`
--

LOCK TABLES `noti_system` WRITE;
/*!40000 ALTER TABLE `noti_system` DISABLE KEYS */;
/*!40000 ALTER TABLE `noti_system` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notify_status`
--

DROP TABLE IF EXISTS `notify_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notify_status` (
  `id` bigint NOT NULL,
  `notify_id` bigint DEFAULT NULL,
  `seen` bit(1) NOT NULL,
  `seen_at` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notify_status`
--

LOCK TABLES `notify_status` WRITE;
/*!40000 ALTER TABLE `notify_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `notify_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notify_status_seq`
--

DROP TABLE IF EXISTS `notify_status_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notify_status_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notify_status_seq`
--

LOCK TABLES `notify_status_seq` WRITE;
/*!40000 ALTER TABLE `notify_status_seq` DISABLE KEYS */;
INSERT INTO `notify_status_seq` VALUES (1);
/*!40000 ALTER TABLE `notify_status_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `public_key`
--

DROP TABLE IF EXISTS `public_key`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_key` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `created_at` bigint DEFAULT NULL,
  `updated_at` bigint DEFAULT NULL,
  `public_key` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `public_key`
--

LOCK TABLES `public_key` WRITE;
/*!40000 ALTER TABLE `public_key` DISABLE KEYS */;
INSERT INTO `public_key` VALUES (152,'test1@gmail.com',1766926287705,1767016032073,'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2Pck+YlMoiIW3nNWCHbMA15JkuwPo8PMUSukXJDNLJzltI5vtRv9s+jhQalYwhP+0cAV/e5+iLV0u05jQwY7zCXozzv5NVC8+SiQgiD7h+VLaYT8BVliKJHnGDTnJgsGcNU4x1fokKB++4WJ7athYFfLy3nHpMGq+Ld/5O0nNdUd/aoOywhpbN2g95ZwOsUi3+BPbQxl4pi0gsVucMaM439tz7BYPqxVxvHUOr2mzw5H09iXekcQvggR31sI7IJ46EUhp4KNO6gpB95lfx91M6kcsw9v9Vyj06CEZy7tErkl3mw7qMBtoZ+0zUjD8byy5NkIhhAHR1SVPK92WeaRhQIDAQAB'),(153,'test2@gmail.com',1766926636689,1766926636689,'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtnnl8PkhbdHN0XzT31JpACRLLgC4prIOLMCRKYTlIlawRQySUWs/oHWBB2yiJ+vwEGVo//B5fqm585qyRWdF52Fhoy6Yo2YNPo6eRQ/7nc0zk8v43A8gL77HtIUmCQVXQJLl2piEOt1hS0T1Fz7Lf5ZOKA3JsTkiRH0K/l/1UD89piOH+BNXY0l+Vp1bdI0RzIitwnDiHyzbuWhYesaLHzRfe5sj0p3KWxArncVX+Do92MBvoNJjMuRiWruVqw7etC1SuDS+CGnH703C4ntuyHk4dyB8/vpyVj2hUwSwTcsjE4K914GNdJRXFF7ARz7Sqpa+UG5LdCFLTFndvkInrQIDAQAB');
/*!40000 ALTER TABLE `public_key` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `public_key_seq`
--

DROP TABLE IF EXISTS `public_key_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_key_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `public_key_seq`
--

LOCK TABLES `public_key_seq` WRITE;
/*!40000 ALTER TABLE `public_key_seq` DISABLE KEYS */;
INSERT INTO `public_key_seq` VALUES (251);
/*!40000 ALTER TABLE `public_key_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_payload`
--

DROP TABLE IF EXISTS `transaction_payload`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_payload` (
  `id` bigint NOT NULL,
  `create_at` bigint NOT NULL,
  `payload` varchar(255) DEFAULT NULL,
  `updated_at` bigint NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_payload`
--

LOCK TABLES `transaction_payload` WRITE;
/*!40000 ALTER TABLE `transaction_payload` DISABLE KEYS */;
INSERT INTO `transaction_payload` VALUES (1,1766926405595,'FROM=607074371586|TO=689406757320|AMOUNT=5000000|CCY=VND',1767015759426,'test1@gmail.com');
/*!40000 ALTER TABLE `transaction_payload` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_payload_seq`
--

DROP TABLE IF EXISTS `transaction_payload_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_payload_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_payload_seq`
--

LOCK TABLES `transaction_payload_seq` WRITE;
/*!40000 ALTER TABLE `transaction_payload_seq` DISABLE KEYS */;
INSERT INTO `transaction_payload_seq` VALUES (51);
/*!40000 ALTER TABLE `transaction_payload_seq` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 14:04:08
