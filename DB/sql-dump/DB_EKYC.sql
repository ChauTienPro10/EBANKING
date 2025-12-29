-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: DB_EKYC
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
-- Table structure for table `biometric_data`
--

DROP TABLE IF EXISTS `biometric_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biometric_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `face_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `face_match` bit(1) DEFAULT NULL,
  `face_match_score` double DEFAULT NULL,
  `is_live` bit(1) DEFAULT NULL,
  `liveness_confidence` double DEFAULT NULL,
  `video_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKg0dfx1mgu5yqi7wevdperl8to` (`session_id`),
  CONSTRAINT `FKpie7iitubqsppk5vdkqjm9se1` FOREIGN KEY (`session_id`) REFERENCES `ekyc_sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biometric_data`
--

LOCK TABLES `biometric_data` WRITE;
/*!40000 ALTER TABLE `biometric_data` DISABLE KEYS */;
INSERT INTO `biometric_data` VALUES (9,'images/bd2e56dd-1f26-4c02-a7fe-8e94a2ffd366/face_bd2e56dd-1f26-4c02-a7fe-8e94a2ffd366_20251229_204209.jpg',_binary '',99.71,_binary '',0.6,'videos/bd2e56dd-1f26-4c02-a7fe-8e94a2ffd366/liveness_bd2e56dd-1f26-4c02-a7fe-8e94a2ffd366_20251229_204208.mp4',_binary '½.V\Ý&L§þŽ”¢ÿ\Óf');
/*!40000 ALTER TABLE `biometric_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_info`
--

DROP TABLE IF EXISTS `document_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_info` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `back_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `front_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `session_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKbdk3m2cwsyu2k3n782qk60hbr` (`session_id`),
  CONSTRAINT `FKhifaew3k6r03cbmx5ppd9tfgu` FOREIGN KEY (`session_id`) REFERENCES `ekyc_sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_info`
--

LOCK TABLES `document_info` WRITE;
/*!40000 ALTER TABLE `document_info` DISABLE KEYS */;
INSERT INTO `document_info` VALUES (9,'Tá»” 6, PHÃš THá»ŠNH, PHÃš RIá»€NG, PHÃš RIá»€NG, BÃŒNH PHÆ¯á»šC','images/bd2e56dd-1f26-4c02-a7fe-8e94a2ffd366/back_bd2e56dd-1f26-4c02-a7fe-8e94a2ffd366_20251229_204157.jpg','2003-02-10','2028-02-10','images/bd2e56dd-1f26-4c02-a7fe-8e94a2ffd366/front_bd2e56dd-1f26-4c02-a7fe-8e94a2ffd366_20251229_204157.jpg','LÃŠ Táº¤T THáº®NG','NAM','070203008130','2023-06-11',_binary '½.V\Ý&L§þŽ”¢ÿ\Óf');
/*!40000 ALTER TABLE `document_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ekyc_sessions`
--

DROP TABLE IF EXISTS `ekyc_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ekyc_sessions` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` bigint DEFAULT NULL,
  `current_step` enum('COMPLETED','FACE_MATCH','LIVENESS','OCR','VERIFICATION') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expired_at` datetime(6) DEFAULT NULL,
  `status` enum('COMPLETED','FACE_MATCHED','FAILED','INITIATED','LIVENESS_COMPLETED','OCR_COMPLETED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ekyc_sessions`
--

LOCK TABLES `ekyc_sessions` WRITE;
/*!40000 ALTER TABLE `ekyc_sessions` DISABLE KEYS */;
INSERT INTO `ekyc_sessions` VALUES (_binary '½.V\Ý&L§þŽ”¢ÿ\Óf','2025-12-29 20:41:53.146302','SYSTEM','2025-12-29 20:42:12.385856','SYSTEM',3,'FACE_MATCH','2025-12-29 20:51:53.101940','COMPLETED',1);
/*!40000 ALTER TABLE `ekyc_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `face_auth_verification`
--

DROP TABLE IF EXISTS `face_auth_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `face_auth_verification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `face_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `face_match` bit(1) DEFAULT NULL,
  `face_match_score` double DEFAULT NULL,
  `is_live` bit(1) DEFAULT NULL,
  `liveness_confidence` double DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `verified` bit(1) NOT NULL,
  `verified_at` datetime(6) DEFAULT NULL,
  `video_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKntl83adntu67f4eanfj9ffna2` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `face_auth_verification`
--

LOCK TABLES `face_auth_verification` WRITE;
/*!40000 ALTER TABLE `face_auth_verification` DISABLE KEYS */;
INSERT INTO `face_auth_verification` VALUES (1,'2025-12-23 19:28:11.960871',NULL,_binary '',100,_binary '',0.6425000000000001,'7753da2d-088c-4cc6-af40-15af2c28038b',1,1,_binary '','2025-12-23 19:28:11.960871','videos/7753da2d-088c-4cc6-af40-15af2c28038b/liveness_7753da2d-088c-4cc6-af40-15af2c28038b_20251223_192809.mp4'),(2,'2025-12-23 19:36:03.964316',NULL,_binary '',100,_binary '',0.6428,'55b41a5d-1a4b-41d3-8e3e-4e0a0688c1c1',NULL,1,_binary '','2025-12-23 19:36:03.964316','videos/55b41a5d-1a4b-41d3-8e3e-4e0a0688c1c1/liveness_55b41a5d-1a4b-41d3-8e3e-4e0a0688c1c1_20251223_193600.mp4'),(3,'2025-12-23 19:37:16.909790',NULL,_binary '',100,_binary '',0.6416,'827ab457-447e-4717-be9d-abe3436c72e1',2,1,_binary '','2025-12-23 19:37:16.910489','videos/827ab457-447e-4717-be9d-abe3436c72e1/liveness_827ab457-447e-4717-be9d-abe3436c72e1_20251223_193714.mp4'),(4,'2025-12-28 19:54:48.839168',NULL,_binary '',99.99,_binary '',0.6312,'a70b9d18-ec89-4224-9896-31ca630e59f8',247,1,_binary '','2025-12-28 19:54:48.839168','videos/a70b9d18-ec89-4224-9896-31ca630e59f8/liveness_a70b9d18-ec89-4224-9896-31ca630e59f8_20251228_195446.mp4');
/*!40000 ALTER TABLE `face_auth_verification` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 14:04:09
