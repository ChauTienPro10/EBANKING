-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: DB_FCM_SERVICE
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
-- Table structure for table `fcm_tokens`
--

DROP TABLE IF EXISTS `fcm_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fcm_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `device_id` varchar(255) DEFAULT NULL,
  `token` varchar(512) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqopjyk0c1cho2ep0abxd9hi5q` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fcm_tokens`
--

LOCK TABLES `fcm_tokens` WRITE;
/*!40000 ALTER TABLE `fcm_tokens` DISABLE KEYS */;
INSERT INTO `fcm_tokens` VALUES (1,'2025-12-23 12:14:40.028820','01c4fd1346410cb7','f3hOF00oS8qUbC0iHomXk4:APA91bHzVHDa5tpll5N0nLB4AvAVjzDYsTRVp6C6PTXxcXWZcX8rM-8LSZbf_IYX1bXfEk38uKH8hjbzlqW0_9mKtlrCRrXYrduz0memckkGjM96qocvq4k','2025-12-29 13:47:13.371811',NULL,'test1@gmail.com'),(2,'2025-12-24 12:44:10.540892','845729b96ac917d4','dQ825Q8fSeGoRRsg2ORncI:APA91bHjAXZ78_hrSqPfy-3dr4N1KK9sf6iyetBK4Lnziq8ZYTXDT8UxmK8Nj2PzlLMdCf0m4WJGoJ2PYLVjIIdIeKz9oPpC6jps0h5oV2qCFPyW3nMz82I','2025-12-24 12:44:45.906367',NULL,'test2@gmail.com'),(3,'2025-12-25 03:04:46.233741','9a02932b8415ef1c','coq1-7UeRoGLWymB0kbnq1:APA91bHfB7SpM0ig_qNKjjekZXeKIwgouESdP7HJDNc_IJnksOyOX3lah-hYh9-a0-XCo7eXUxvoPoafwq-Niztx0Mc51y0hpiN87zmFhw8Uvq1vqmVRuTY','2025-12-25 05:07:58.473301',NULL,'guest');
/*!40000 ALTER TABLE `fcm_tokens` ENABLE KEYS */;
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
-- Table structure for table `notify_transaction`
--

DROP TABLE IF EXISTS `notify_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notify_transaction` (
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notify_transaction`
--

LOCK TABLES `notify_transaction` WRITE;
/*!40000 ALTER TABLE `notify_transaction` DISABLE KEYS */;
INSERT INTO `notify_transaction` VALUES (1,'100000','[N01] bạn vừa nhận được 100000VND từ tài khoản 607074371586',1766582716539,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(2,'500000','[N01] bạn vừa nhận được 500000VND từ tài khoản 607074371586',1766582778500,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(3,'100000','[N01] bạn vừa nhận được 100000VND từ tài khoản 607074371586',1766583047471,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(4,'500000','[N01] bạn vừa nhận được 500000VND từ tài khoản 607074371586',1766583065003,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(5,'100000','[N01] bạn vừa nhận được 100000VND từ tài khoản 607074371586',1766639481741,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(6,'500000','[N01] bạn vừa nhận được 500000VND từ tài khoản 607074371586',1766642186401,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(7,'1000000','[N01] bạn vừa nhận được 1000000VND từ tài khoản 607074371586',1766642727414,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(8,'500000','[N01] bạn vừa nhận được 500000VND từ tài khoản 607074371586',1766681078629,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(9,'500000','[N01] bạn vừa nhận được 500000VND từ tài khoản 607074371586',1766810503571,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(10,'100000','[N01] bạn vừa nhận được 100000VND từ tài khoản 607074371586',1766810768811,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(11,'1000000','[N01] bạn vừa nhận được 1000000VND từ tài khoản 607074371586',1766810832760,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(12,'100000','[N01] bạn vừa nhận được 100000VND từ tài khoản 607074371586',1766811215678,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(13,'100000','[N01] bạn vừa nhận được 100000VND từ tài khoản 607074371586',1766811577235,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(14,'1000000','[N01] bạn vừa nhận được 1000000VND từ tài khoản 607074371586',1766812751036,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(15,'100000','[N01] bạn vừa nhận được 100000VND từ tài khoản 607074371586',1766814214512,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(16,'100000','[N01] bạn vừa nhận được 100000VND từ tài khoản 607074371586',1766926412987,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(17,'6000000','[N01] bạn vừa nhận được 6000000VND từ tài khoản 607074371586',1766926497212,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(18,'500000','[N01] bạn vừa nhận được 500000VND từ tài khoản 607074371586',1766995550782,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com'),(19,'5000000','[N01] bạn vừa nhận được 5000000VND từ tài khoản 607074371586',1767015763877,'Chuyển tiền','607074371586','SUCCESS','Thông báo nhận tiền',NULL,'test2@gmail.com');
/*!40000 ALTER TABLE `notify_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_noti`
--

DROP TABLE IF EXISTS `personal_noti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_noti` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `created_at` bigint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_noti`
--

LOCK TABLES `personal_noti` WRITE;
/*!40000 ALTER TABLE `personal_noti` DISABLE KEYS */;
INSERT INTO `personal_noti` VALUES (1,'bạn cần kiểm tra tài khoản',1766548923111,'Thông báo hệ thống','test1@gmail.com','test1@gmail.com');
/*!40000 ALTER TABLE `personal_noti` ENABLE KEYS */;
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
