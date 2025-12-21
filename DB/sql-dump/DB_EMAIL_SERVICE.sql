-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: DB_EMAIL_SERVICE
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
-- Table structure for table `email_template`
--

DROP TABLE IF EXISTS `email_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_template` (
  `id` bigint NOT NULL,
  `content` text,
  `create_at` bigint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `updated_at` bigint DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_template`
--

LOCK TABLES `email_template` WRITE;
/*!40000 ALTER TABLE `email_template` DISABLE KEYS */;
INSERT INTO `email_template` VALUES (1,'Xin chào ${userName},\n\nChúng tôi xin thông báo rằng email: ${email} bạn đã đăng ký tài khoản EBANKING của chúng tôi vào lúc lúc ${createdAt}.\n\nThông tin chi tiết:\nEmail: ${email}\nTên người đăng ký: ${fullName}\nSố định danh cá nhân: ${citizenId}\n\nVui lòng vào ứng dụng EBANKING để cập nhật thông tin cá nhân và tiếp tục sử dụng \ndịch vụ của chúng tôi.\n\nCảm ơn bạn đã sử dụng dịch vụ của chúng tôi.\n\nTrân trọng,  \nĐội ngũ hỗ trợ\n\nEBANKING HO CHI MINH.\nNền tảng giao dịch trực tuyến tiện lợi và tin cậy.\n\nHot line : 0812788212.\nEmail hổ trợ khách hàng: itchauduongphattien@gmail.com',1692278400000,'Thông báo: Tài khoản của bạn đã được tạo thành công!',NULL,'create_user'),(2,'Xin chào ${userName},\n\nMã xác thực OTP của bạn là: ${otpValue} \n\nThông tin chi tiết:\nEmail: ${email}\nThời gian hiệu lực: ${expireTime}s\n\nVui lòng không chia sẽ thông tin cho bất cứ ai để tránh gặp vấn đề về bảo mật thông tin.\n\nCảm ơn bạn đã sử dụng dịch vụ của chúng tôi.\n\nTrân trọng,  \nĐội ngũ hỗ trợ\n\nEBANKING HO CHI MINH.\nNền tảng giao dịch trực tuyến tiện lợi và tin cậy.\n\nHot line : 0812788212.\nEmail hổ trợ khách hàng: itchauduongphattien@gmail.com',1692278400000,'Xác thực OTP',NULL,'gen_otp'),(3,'Xin chào ${userName},\n\nThông tin về giao dịch bạn đã thực hiện:\n\nThông tin chi tiết:\nTài khoản: ${account_sender}\nTài khoản thụ hưởng: ${account_recever}\nSố tiền giao dịch: ${amount}\nNgày thực hiện: ${transactionAt}\nGhi chú: ${transaction_note}\n\nCảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi, hy vọng bạn có những trải nghiệm tốt nhất\n\nTrân trọng,  \nĐội ngũ hỗ trợ\n\nEBANKING HO CHI MINH.\nNền tảng giao dịch trực tuyến tiện lợi và tin cậy.\n\nHot line : 0812788212.\nEmail hổ trợ khách hàng: itchauduongphattien@gmail.com',1692278400000,'Thông báo phát sinh giao dịch',NULL,'transfer_send_email'),(4,'Xin chào ${userName},\n\nTài khoản của bạn vừa thực hiện thay đổi mật khẩu vào lúc ${timeUpdate}\n\nCảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi, hy vọng bạn có những trải nghiệm tốt nhất\n\nTrân trọng,  \nĐội ngũ hỗ trợ\n\nEBANKING HO CHI MINH.\nNền tảng giao dịch trực tuyến tiện lợi và tin cậy.\n\nHot line : 0812788212.\nEmail hổ trợ khách hàng: itchauduongphattien@gmail.com',1692278400000,'Thông báo tài khoản thực hiện ĐỔI MẬT KHẨU',NULL,'change_password');
/*!40000 ALTER TABLE `email_template` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-02 10:15:00
