-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: DB_USER_SERVICE
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
-- Table structure for table `interest_rate`
--

DROP TABLE IF EXISTS `interest_rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interest_rate` (
  `interest_rate_id` bigint NOT NULL AUTO_INCREMENT,
  `term_months` int NOT NULL,
  `min_amount` decimal(15,2) NOT NULL,
  `max_amount` decimal(15,2) DEFAULT NULL,
  `annual_rate` decimal(5,4) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `effective_from` datetime NOT NULL,
  `effective_to` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`interest_rate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interest_rate`
--

LOCK TABLES `interest_rate` WRITE;
/*!40000 ALTER TABLE `interest_rate` DISABLE KEYS */;
/*!40000 ALTER TABLE `interest_rate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8sewwnpamngi6b1dwaa88askk` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (2,'ROLE_ADMIN'),(1,'ROLE_USER');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL,
  `create_at` bigint DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `updated_at` bigint DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `info_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8cr1cnssov8yndrdop7hmlbpt` (`info_id`),
  CONSTRAINT `FKi36jgqhfm6cbngbaw77o3ob42` FOREIGN KEY (`info_id`) REFERENCES `user_info` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,1766492141726,'$2a$10$sGM7sOy3v7GQ10artEnF7uOlSOj9fXB9rnPsEGm4HSdhmXX422awm',NULL,'test1@gmail.com',1),(2,1766492340235,'$2a$10$UJEvvLfFW.S4oig0R/YWzeF27IjulUm43zX.WshUVGF1V.61kngfW',NULL,'test2@gmail.com',2),(52,1766646119883,'$2a$10$BBhs21fV7DIllXHLriw17OWfwaFxUrlSO3AjnF5flW8v47aSVmhfa',NULL,'test@3gmail.com',52),(102,1766805495960,'$2a$10$bZxxsSDxEI9nU.BxLc7XHuqvj7iy4qmpNAsgGUtP6dApPO9d5Xnvi',NULL,'test4@gmail.com',102);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_info`
--

DROP TABLE IF EXISTS `user_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_info` (
  `id` bigint NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `avatar_path` varchar(255) DEFAULT NULL,
  `birthday` bigint DEFAULT NULL,
  `citizen_id` varchar(255) NOT NULL,
  `create_at` bigint DEFAULT NULL,
  `daily_transaction_limit` decimal(19,2) DEFAULT NULL,
  `ekyc_session_id` binary(16) DEFAULT NULL,
  `ekyc_status` varchar(255) DEFAULT NULL,
  `ekyc_verified_at` bigint DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `face_auth_enabled` bit(1) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `is_male` bit(1) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `updated_at` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK2o2qipakstu2s752di94rt2l3` (`citizen_id`),
  UNIQUE KEY `UKgnu0k8vv6ptioedbxbfsnan9g` (`email`),
  UNIQUE KEY `UK5m9cb1vslu82sm2y4nd2xaj4f` (`phone`),
  UNIQUE KEY `UKhixwjgx0ynne0cq4tqvoawoda` (`user_id`),
  CONSTRAINT `FKn8pl63y4abe7n0ls6topbqjh2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_info`
--

LOCK TABLES `user_info` WRITE;
/*!40000 ALTER TABLE `user_info` DISABLE KEYS */;
INSERT INTO `user_info` VALUES (1,'Tá»” 6, PHÃš THá»ŠNH, PHÃš RIá»€NG, PHÃš RIá»€NG, BÃŒNH PHÆ¯á»šC','avatars/1/avatar_1_20251225_144858.jpg',1044810000000,'070203008130',1766492141783,50000000.00,_binary '½.V\Ý&L§þŽ”¢ÿ\Óf','VERIFIED',1767015732522,'test1@gmail.com',_binary '\0','LÃŠ Táº¤T THáº®NG',_binary '','0912222511',1767015732522,1),(2,NULL,'avatars/2/avatar_2_20251228_200045.jpg',NULL,'070203008131',1766492340253,50000000.00,NULL,NULL,NULL,'test2@gmail.com',_binary '\0','Tiáº¿n',_binary '',NULL,1766492385421,2),(52,NULL,NULL,NULL,'070203008133',1766646120178,50000000.00,NULL,NULL,NULL,'test@3gmail.com',_binary '\0',NULL,NULL,NULL,NULL,52),(102,NULL,NULL,NULL,'070203008134',1766805496033,50000000.00,NULL,NULL,NULL,'test4@gmail.com',_binary '\0',NULL,NULL,NULL,NULL,102);
/*!40000 ALTER TABLE `user_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_info_seq`
--

DROP TABLE IF EXISTS `user_info_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_info_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_info_seq`
--

LOCK TABLES `user_info_seq` WRITE;
/*!40000 ALTER TABLE `user_info_seq` DISABLE KEYS */;
INSERT INTO `user_info_seq` VALUES (201);
/*!40000 ALTER TABLE `user_info_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKrhfovtciq1l558cw6udg0h0d3` (`role_id`),
  CONSTRAINT `FK55itppkw3i07do3h7qoclqd4k` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKrhfovtciq1l558cw6udg0h0d3` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1),(2,1),(52,1),(102,1);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_seq`
--

DROP TABLE IF EXISTS `user_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_seq`
--

LOCK TABLES `user_seq` WRITE;
/*!40000 ALTER TABLE `user_seq` DISABLE KEYS */;
INSERT INTO `user_seq` VALUES (201);
/*!40000 ALTER TABLE `user_seq` ENABLE KEYS */;
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
