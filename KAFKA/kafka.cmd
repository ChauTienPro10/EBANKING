@echo off
echo Creating Kafka topics...

docker exec -it kafka kafka-topics --create --topic transaction --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker exec -it kafka kafka-topics --create --topic send-email --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker exec -it kafka kafka-topics --create --topic send-otp --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker exec -it kafka kafka-topics --create --topic transfer-send-email --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker exec -it kafka kafka-topics --create --topic transaction-notify --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker exec -it kafka kafka-topics --create --topic transaction-processer --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker exec -it kafka kafka-topics --create --topic send-email-change-password --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker exec -it kafka kafka-topics --create --topic otp-forgot-password --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
docker exec -it kafka kafka-topics --create --topic notify_transaction_socket --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

echo.
echo Listing all Kafka topics:
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

pause



@REM Xin chào {{userName}},

@REM Mã xác thực OTP của bạn là: {{otpValue}} 

@REM Thông tin chi tiết:
@REM Email: {{email}}
@REM Thời gian hiệu lực: {{expireTime}}

@REM Vui lòng không chia sẽ thông tin cho bất cứ ai để tránh gặp vấn đề về bảo mật thông tin.

@REM Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.

@REM Trân trọng,  
@REM Đội ngũ hỗ trợ

@REM EBANKING HO CHI MINH.
@REM Nền tảng giao dịch trực tuyến tiện lợi và tin cậy.

@REM Hot line : 0812788212.
@REM Email hổ trợ khách hàng: itchauduongphattien@gmail.com