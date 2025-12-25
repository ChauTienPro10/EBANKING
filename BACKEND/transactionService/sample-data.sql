-- Dữ liệu mẫu cho bảng lãi suất
INSERT INTO interest_rate (term_months, min_amount, max_amount, annual_rate, status, effective_from) VALUES
(1, 1000000.00, NULL, 0.0350, 'ACTIVE', '2025-10-01 00:00:00'), 
(3, 1000000.00, NULL, 0.0420, 'ACTIVE', '2025-10-01 00:00:00'),
(6, 5000000.00, NULL, 0.0550, 'ACTIVE', '2025-10-01 00:00:00'),
(12, 10000000.00, NULL, 0.0600, 'ACTIVE', '2025-10-01 00:00:00'),
(24, 10000000.00, NULL, 0.0650, 'ACTIVE', '2025-10-01 00:00:00'),
(36, 10000000.00, NULL, 0.0700, 'ACTIVE', '2025-10-01 00:00:00');

-- Dữ liệu mẫu cho tài khoản tiết kiệm (giả sử đã có user_id = 1 và payment account)
-- INSERT INTO savings_account (account_number, user_id, payment_account_id, balance, currency, interest_rate_id, term_months, status, opened_date, maturity_date) VALUES
-- ('SAV123456789', 1, 1, 10000000.00, 'VND', 3, 6, 'ACTIVE', '2024-12-01 10:00:00', '2025-06-01 10:00:00'),
-- ('SAV987654321', 1, 1, 50000000.00, 'VND', 5, 24, 'ACTIVE', '2024-11-01 09:00:00', '2026-11-01 09:00:00');

-- Dữ liệu mẫu cho yêu cầu giao dịch
-- INSERT INTO transaction_request (request_number, user_id, savings_account_id, request_type, amount, currency, status, description, requested_at) VALUES
-- ('REQ123456789', 1, 1, 'CASH_DEPOSIT', 5000000.00, 'VND', 'PENDING', 'Nạp tiền mặt vào tài khoản tiết kiệm', '2024-12-21 14:30:00'),
-- ('REQ987654321', 1, 2, 'CASH_WITHDRAWAL', 10000000.00, 'VND', 'PENDING', 'Rút tiền mặt từ tài khoản tiết kiệm', '2024-12-21 15:00:00');