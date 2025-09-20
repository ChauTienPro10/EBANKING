kafka-topics --create --topic transacton --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
kafka-topics --create --topic send-email --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
kafka-topics --create --topic send-otp --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

kafka-topics --list --bootstrap-server localhost:9092




Xin chào {{userName}},

Mã xác thực OTP của bạn là: {{otpValue}} 

Thông tin chi tiết:
Email: {{email}}
Thời gian hiệu lực: {{expireTime}}

Vui lòng không chia sẽ thông tin cho bất cứ ai để tránh gặp vấn đề về bảo mật thông tin.

Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.

Trân trọng,  
Đội ngũ hỗ trợ

EBANKING HO CHI MINH.
Nền tảng giao dịch trực tuyến tiện lợi và tin cậy.

Hot line : 0812788212.
Email hổ trợ khách hàng: itchauduongphattien@gmail.com