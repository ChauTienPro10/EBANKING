-- =====================================================
-- COMPLETE FAKE TRANSACTIONS FOR STATISTICS DEMO
-- User: test1@gmail.com (username = 'test1@gmail.com')
-- Account Number: 607074371586
-- Generated for: 2025-12-25
-- =====================================================

-- ============================================================
-- BƯỚC 1: XÓA DATA CŨ (Clean up old fake data)
-- ============================================================

-- Xóa tất cả giao dịch fake của user test1@gmail.com
-- Chỉ xóa giao dịch có username = 'test1@gmail.com'
DELETE FROM transaction 
WHERE username = 'test1@gmail.com';

-- Kiểm tra xem đã xóa hết chưa
SELECT COUNT(*) as remaining_transactions 
FROM transaction 
WHERE username = 'test1@gmail.com';

-- Nếu kết quả = 0 thì đã xóa sạch, có thể tiếp tục insert data mới

-- ============================================================
-- BƯỚC 2: INSERT DATA MỚI
-- ============================================================

-- ============================================================
-- TUẦN HIỆN TẠI (Current Week: 23-29 Dec 2025)
-- Thứ 2 (Monday) = 23/12, Chủ nhật (Sunday) = 29/12
-- ============================================================

-- Thứ 2 (23/12) - 3 giao dịch
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543210', 500000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua sắm siêu thị', 'SHOPPING', '2025-12-23 09:30:00', false, false),
('test1@gmail.com', '607074371586', '9876543211', 200000, 'VND', 'TRANSFER', 'SUCCESS', 'Thanh toán tiền điện', 'BILL_PAYMENT', '2025-12-23 14:15:00', false, false),
('test1@gmail.com', '9876543215', '607074371586', 800000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận tiền từ bạn', 'PERSONAL', '2025-12-23 18:00:00', false, false);

-- Thứ 3 (24/12) - 4 giao dịch
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543210', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua hàng online', 'SHOPPING', '2025-12-24 10:20:00', false, false),
('test1@gmail.com', '607074371586', '9876543212', 300000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền ăn uống', 'FOOD', '2025-12-24 12:30:00', false, false),
('test1@gmail.com', '607074371586', '9876543210', 450000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua quà Giáng sinh', 'GIFT', '2025-12-24 16:00:00', false, false),
('test1@gmail.com', '9876543216', '607074371586', 1200000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương part-time', 'SALARY', '2025-12-24 20:00:00', false, false);

-- Thứ 4 (25/12) - 3 giao dịch (hôm nay)
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543210', 2000000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua điện thoại', 'SHOPPING', '2025-12-25 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543213', 450000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền xăng xe', 'TRANSPORTATION', '2025-12-25 15:30:00', false, false),
('test1@gmail.com', '9876543217', '607074371586', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận tiền từ gia đình', 'FAMILY', '2025-12-25 19:00:00', false, false);

-- Thứ 5 (26/12) - 2 giao dịch (tương lai - có thể bỏ nếu không muốn)
-- INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
-- VALUES 
-- ('test1@gmail.com', '607074371586', '9876543210', 800000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua quần áo', 'SHOPPING', '2025-12-26 13:00:00', false, false),
-- ('test1@gmail.com', '607074371586', '9876543214', 150000, 'VND', 'TRANSFER', 'SUCCESS', 'Cafe', 'FOOD', '2025-12-26 17:00:00', false, false);


-- ============================================================
-- TUẦN TRƯỚC (Previous Week: 16-22 Dec 2025)
-- Thứ 2 (Monday) = 16/12, Chủ nhật (Sunday) = 22/12
-- ============================================================

-- Thứ 2 (16/12) - 2 giao dịch
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543220', 400000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua sách', 'EDUCATION', '2025-12-16 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543221', 250000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền internet', 'BILL_PAYMENT', '2025-12-16 14:00:00', false, false);

-- Thứ 3 (17/12) - 3 giao dịch
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543220', 1100000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ công nghệ', 'SHOPPING', '2025-12-17 10:30:00', false, false),
('test1@gmail.com', '607074371586', '9876543222', 350000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ ăn', 'FOOD', '2025-12-17 12:45:00', false, false),
('test1@gmail.com', '9876543225', '607074371586', 900000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận tiền hoàn', 'REFUND', '2025-12-17 18:00:00', false, false);

-- Thứ 4 (18/12) - 2 giao dịch
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543223', 680000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua quà tặng', 'GIFT', '2025-12-18 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543224', 420000, 'VND', 'TRANSFER', 'SUCCESS', 'Đi xem phim', 'ENTERTAINMENT', '2025-12-18 20:00:00', false, false);

-- Thứ 5 (19/12) - 2 giao dịch
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543220', 950000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua mỹ phẩm', 'SHOPPING', '2025-12-19 12:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543226', 180000, 'VND', 'TRANSFER', 'SUCCESS', 'Cafe sáng', 'FOOD', '2025-12-19 08:30:00', false, false);

-- Thứ 6 (20/12) - 3 giao dịch
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543227', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ nội thất', 'SHOPPING', '2025-12-20 13:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543228', 320000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện thoại', 'BILL_PAYMENT', '2025-12-20 15:00:00', false, false),
('test1@gmail.com', '9876543229', '607074371586', 1100000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận tiền bán đồ', 'PERSONAL', '2025-12-20 17:00:00', false, false);

-- Thứ 7 (21/12) - 2 giao dịch
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543230', 550000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ thể thao', 'SHOPPING', '2025-12-21 10:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543231', 280000, 'VND', 'TRANSFER', 'SUCCESS', 'Ăn trưa', 'FOOD', '2025-12-21 12:30:00', false, false);

-- Chủ nhật (22/12) - 1 giao dịch
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543232', 800000, 'VND', 'TRANSFER', 'SUCCESS', 'Đi chơi cuối tuần', 'ENTERTAINMENT', '2025-12-22 14:00:00', false, false);


-- ============================================================
-- THÁNG HIỆN TẠI (Current Month: December 2025)
-- Các tuần đầu tháng (1-15/12)
-- ============================================================

-- Tuần 1 (1-7/12)
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543240', 600000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua sách giáo khoa', 'EDUCATION', '2025-12-02 10:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543241', 1200000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 12', 'RENT', '2025-12-03 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543242', 350000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ ăn', 'FOOD', '2025-12-04 18:00:00', false, false),
('test1@gmail.com', '9876543250', '607074371586', 2500000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương part-time', 'SALARY', '2025-12-05 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543243', 750000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua giày', 'SHOPPING', '2025-12-06 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543244', 280000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện', 'BILL_PAYMENT', '2025-12-07 16:00:00', false, false);

-- Tuần 2 (8-14/12)
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543245', 450000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền internet', 'BILL_PAYMENT', '2025-12-08 10:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543240', 900000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ điện tử', 'SHOPPING', '2025-12-09 15:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543246', 250000, 'VND', 'TRANSFER', 'SUCCESS', 'Ăn nhà hàng', 'FOOD', '2025-12-10 19:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543247', 1800000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ nội thất', 'SHOPPING', '2025-12-11 13:00:00', false, false),
('test1@gmail.com', '9876543251', '607074371586', 650000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận tiền hoàn', 'REFUND', '2025-12-12 16:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543248', 380000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ ăn vặt', 'FOOD', '2025-12-13 11:30:00', false, false),
('test1@gmail.com', '607074371586', '9876543249', 520000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền xăng', 'TRANSPORTATION', '2025-12-14 17:00:00', false, false);


-- ============================================================
-- THÁNG TRƯỚC (Previous Month: November 2025)
-- ============================================================

-- Tuần 1 tháng 11
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543260', 550000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ ăn', 'FOOD', '2025-11-02 10:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543261', 1300000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 11', 'RENT', '2025-11-03 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543262', 400000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua sách', 'EDUCATION', '2025-11-04 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543263', 850000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua quần áo', 'SHOPPING', '2025-11-05 15:00:00', false, false),
('test1@gmail.com', '9876543270', '607074371586', 2000000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-11-06 09:00:00', false, false);

-- Tuần 2 tháng 11
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543264', 380000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện', 'BILL_PAYMENT', '2025-11-09 10:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543265', 720000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua giày dép', 'SHOPPING', '2025-11-10 13:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543266', 290000, 'VND', 'TRANSFER', 'SUCCESS', 'Ăn nhà hàng', 'FOOD', '2025-11-11 19:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543267', 1600000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua điện thoại', 'SHOPPING', '2025-11-12 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543268', 520000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền xăng', 'TRANSPORTATION', '2025-11-13 16:00:00', false, false);

-- Tuần 3 tháng 11
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543269', 340000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền internet', 'BILL_PAYMENT', '2025-11-16 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543260', 980000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ điện tử', 'SHOPPING', '2025-11-17 15:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543271', 450000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua quà', 'GIFT', '2025-11-18 17:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543272', 610000, 'VND', 'TRANSFER', 'SUCCESS', 'Đi du lịch', 'TRAVEL', '2025-11-19 12:00:00', false, false),
('test1@gmail.com', '9876543273', '607074371586', 1200000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận tiền hoàn', 'REFUND', '2025-11-20 10:00:00', false, false);

-- Tuần 4 tháng 11
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543274', 370000, 'VND', 'TRANSFER', 'SUCCESS', 'Cafe', 'FOOD', '2025-11-23 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543260', 1200000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua laptop', 'SHOPPING', '2025-11-24 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543275', 490000, 'VND', 'TRANSFER', 'SUCCESS', 'Xem phim', 'ENTERTAINMENT', '2025-11-25 20:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543276', 760000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ thể thao', 'SHOPPING', '2025-11-26 13:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543277', 280000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện thoại', 'BILL_PAYMENT', '2025-11-27 16:00:00', false, false);


-- ============================================================
-- NĂM HIỆN TẠI (Year 2025) - Các tháng trước
-- Tạo data cho từng tháng để biểu đồ năm có đủ 12 tháng
-- ============================================================

-- THÁNG 1/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 1', 'RENT', '2025-01-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543302', 800000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua sắm Tết', 'SHOPPING', '2025-01-10 10:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543303', 1200000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua quà Tết', 'GIFT', '2025-01-15 11:00:00', false, false),
('test1@gmail.com', '9876543310', '607074371586', 3000000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lì xì Tết', 'GIFT', '2025-01-20 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543304', 500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-01-25 16:00:00', false, false);

-- THÁNG 2/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 2', 'RENT', '2025-02-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543305', 600000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua sách học', 'EDUCATION', '2025-02-10 10:00:00', false, false),
('test1@gmail.com', '9876543311', '607074371586', 2500000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-02-15 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543306', 450000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-02-20 16:00:00', false, false);

-- THÁNG 3/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 3', 'RENT', '2025-03-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543307', 1800000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua laptop', 'SHOPPING', '2025-03-10 10:00:00', false, false),
('test1@gmail.com', '9876543312', '607074371586', 2800000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-03-15 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543308', 700000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua quần áo', 'SHOPPING', '2025-03-20 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543309', 400000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-03-25 16:00:00', false, false);

-- THÁNG 4/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 4', 'RENT', '2025-04-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543320', 900000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua giày', 'SHOPPING', '2025-04-10 10:00:00', false, false),
('test1@gmail.com', '9876543313', '607074371586', 2600000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-04-15 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543321', 550000, 'VND', 'TRANSFER', 'SUCCESS', 'Đi du lịch', 'TRAVEL', '2025-04-20 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543322', 380000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-04-25 16:00:00', false, false);

-- THÁNG 5/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 5', 'RENT', '2025-05-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543323', 1100000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua điện thoại', 'SHOPPING', '2025-05-10 10:00:00', false, false),
('test1@gmail.com', '9876543314', '607074371586', 2700000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-05-15 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543324', 650000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ điện tử', 'SHOPPING', '2025-05-20 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543325', 420000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-05-25 16:00:00', false, false);

-- THÁNG 6/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 6', 'RENT', '2025-06-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543326', 800000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua quần áo hè', 'SHOPPING', '2025-06-10 10:00:00', false, false),
('test1@gmail.com', '9876543315', '607074371586', 2900000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-06-15 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543327', 1200000, 'VND', 'TRANSFER', 'SUCCESS', 'Đi du lịch hè', 'TRAVEL', '2025-06-20 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543328', 450000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-06-25 16:00:00', false, false);

-- THÁNG 7/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 7', 'RENT', '2025-07-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543329', 950000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua sách', 'EDUCATION', '2025-07-10 10:00:00', false, false),
('test1@gmail.com', '9876543316', '607074371586', 3100000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-07-15 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543330', 720000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ thể thao', 'SHOPPING', '2025-07-20 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543331', 480000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-07-25 16:00:00', false, false);

-- THÁNG 8/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 8', 'RENT', '2025-08-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543332', 1300000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua laptop', 'SHOPPING', '2025-08-10 10:00:00', false, false),
('test1@gmail.com', '9876543317', '607074371586', 2800000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-08-15 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543333', 850000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ điện tử', 'SHOPPING', '2025-08-20 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543334', 420000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-08-25 16:00:00', false, false);

-- THÁNG 9/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 9', 'RENT', '2025-09-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543335', 700000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua quần áo', 'SHOPPING', '2025-09-10 10:00:00', false, false),
('test1@gmail.com', '9876543318', '607074371586', 2900000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-09-15 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543336', 600000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua giày', 'SHOPPING', '2025-09-20 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543337', 390000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-09-25 16:00:00', false, false);

-- THÁNG 10/2025
INSERT INTO transaction (username, sender_account_number, receiver_account_number, amount, currency, transaction_type, status, description, purpose_code, transaction_at, requires_face_auth, face_auth_verified)
VALUES 
('test1@gmail.com', '607074371586', '9876543301', 1500000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền thuê nhà tháng 10', 'RENT', '2025-10-05 14:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543338', 1100000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua điện thoại', 'SHOPPING', '2025-10-10 10:00:00', false, false),
('test1@gmail.com', '9876543319', '607074371586', 3000000, 'VND', 'TRANSFER', 'SUCCESS', 'Nhận lương', 'SALARY', '2025-10-15 09:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543339', 750000, 'VND', 'TRANSFER', 'SUCCESS', 'Mua đồ nội thất', 'SHOPPING', '2025-10-20 11:00:00', false, false),
('test1@gmail.com', '607074371586', '9876543340', 460000, 'VND', 'TRANSFER', 'SUCCESS', 'Tiền điện nước', 'BILL_PAYMENT', '2025-10-25 16:00:00', false, false);


-- ============================================================
-- KIỂM TRA KẾT QUẢ
-- ============================================================

-- 1. Xem tổng số giao dịch theo tháng trong năm 2025
SELECT 
    MONTH(transaction_at) as month,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN sender_account_number = '607074371586' THEN amount ELSE 0 END) as total_outgoing,
    SUM(CASE WHEN receiver_account_number = '607074371586' THEN amount ELSE 0 END) as total_incoming
FROM transaction 
WHERE username = 'test1@gmail.com' 
AND YEAR(transaction_at) = 2025
GROUP BY MONTH(transaction_at)
ORDER BY MONTH(transaction_at);

-- 2. Xem giao dịch tuần hiện tại (23-29/12/2025)
SELECT * FROM transaction 
WHERE username = 'test1@gmail.com' 
AND transaction_at BETWEEN '2025-12-23 00:00:00' AND '2025-12-29 23:59:59'
ORDER BY transaction_at DESC;

-- 3. Xem giao dịch tuần trước (16-22/12/2025)
SELECT * FROM transaction 
WHERE username = 'test1@gmail.com' 
AND transaction_at BETWEEN '2025-12-16 00:00:00' AND '2025-12-22 23:59:59'
ORDER BY transaction_at DESC;

-- 4. Xem người nhận thường xuyên nhất trong tháng 12
SELECT 
    receiver_account_number,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM transaction 
WHERE username = 'test1@gmail.com' 
AND sender_account_number = '607074371586'
AND MONTH(transaction_at) = 12
AND YEAR(transaction_at) = 2025
GROUP BY receiver_account_number
ORDER BY transaction_count DESC
LIMIT 1;
