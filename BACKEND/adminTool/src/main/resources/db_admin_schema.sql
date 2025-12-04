
-- ADMIN TOOL DATABASE SCHEMA

CREATE DATABASE IF NOT EXISTS DB_ADMIN CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE DB_ADMIN;

-- ========================================
-- 1. AUDIT LOGS - Nhật ký hoạt động admin
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_username VARCHAR(100) NOT NULL COMMENT 'Tên đăng nhập admin',
    action VARCHAR(100) NOT NULL COMMENT 'Hành động: VIEW_USER, LOCK_ACCOUNT, etc',
    target_type VARCHAR(50) COMMENT 'Loại đối tượng: USER, ACCOUNT, TRANSACTION',
    target_id VARCHAR(100) COMMENT 'ID của đối tượng',
    details TEXT COMMENT 'Chi tiết hành động',
    success BOOLEAN NOT NULL COMMENT 'Thành công hay thất bại',
    timestamp DATETIME NOT NULL COMMENT 'Thời điểm thực hiện',
    ip_address VARCHAR(50) COMMENT 'Địa chỉ IP',
    INDEX idx_staff_username (staff_username),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Nhật ký mọi hoạt động của admin';

-- ========================================
-- 2. USER STATUS - Trạng thái tài khoản user
-- ========================================
CREATE TABLE IF NOT EXISTS user_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE COMMENT 'ID user từ DB_USER',
    username VARCHAR(100) NOT NULL UNIQUE COMMENT 'Username',
    status ENUM('ACTIVE', 'LOCKED', 'BANNED', 'SUSPENDED') DEFAULT 'ACTIVE' COMMENT 'Trạng thái',
    status_reason TEXT COMMENT 'Lý do khóa/ban',
    locked_by VARCHAR(100) COMMENT 'Admin đã khóa',
    locked_at DATETIME COMMENT 'Thời điểm khóa',
    lock_expires_at DATETIME COMMENT 'Hết hạn khóa (NULL = vĩnh viễn)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Quản lý trạng thái tài khoản người dùng';

-- ========================================
-- 3. ACCOUNT STATUS - Trạng thái tài khoản ngân hàng
-- ========================================
CREATE TABLE IF NOT EXISTS account_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL UNIQUE COMMENT 'ID account từ DB_TRANSACTION',
    account_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'Số tài khoản',
    user_id BIGINT NOT NULL COMMENT 'ID user sở hữu',
    status ENUM('ACTIVE', 'LOCKED', 'FROZEN', 'CLOSED') DEFAULT 'ACTIVE' COMMENT 'Trạng thái',
    status_reason TEXT COMMENT 'Lý do khóa/đóng',
    transaction_limit_daily DECIMAL(15, 2) COMMENT 'Hạn mức giao dịch mỗi ngày',
    transaction_limit_per_transaction DECIMAL(15, 2) COMMENT 'Hạn mức mỗi giao dịch',
    locked_by VARCHAR(100) COMMENT 'Admin đã khóa',
    locked_at DATETIME COMMENT 'Thời điểm khóa',
    lock_expires_at DATETIME COMMENT 'Hết hạn khóa',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_account_id (account_id),
    INDEX idx_account_number (account_number),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Quản lý trạng thái tài khoản ngân hàng';

-- ========================================
-- 4. TRANSACTION FLAGS - Đánh dấu giao dịch
-- ========================================
CREATE TABLE IF NOT EXISTS transaction_flags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL COMMENT 'ID giao dịch từ DB_TRANSACTION',
    flag_type ENUM('SUSPICIOUS', 'FRAUD', 'REVIEW', 'APPROVED', 'REJECTED') NOT NULL COMMENT 'Loại cờ',
    flag_reason TEXT COMMENT 'Lý do đánh dấu',
    flagged_by VARCHAR(100) COMMENT 'Admin đánh dấu',
    flagged_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm đánh dấu',
    resolved_by VARCHAR(100) COMMENT 'Admin xử lý',
    resolved_at DATETIME COMMENT 'Thời điểm xử lý',
    resolution_notes TEXT COMMENT 'Ghi chú xử lý',
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_flag_type (flag_type),
    INDEX idx_flagged_at (flagged_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Đánh dấu giao dịch đáng ngờ/gian lận';

-- ========================================
-- 5. SYSTEM SETTINGS - Cấu hình hệ thống
-- ========================================
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Khóa cấu hình',
    setting_value TEXT NOT NULL COMMENT 'Giá trị',
    setting_type VARCHAR(50) NOT NULL COMMENT 'Loại: STRING, NUMBER, BOOLEAN, JSON',
    description TEXT COMMENT 'Mô tả',
    updated_by VARCHAR(100) COMMENT 'Admin cập nhật',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cấu hình hệ thống';

-- ========================================
-- 6. STAFF PERMISSIONS - Quyền của admin staff
-- ========================================
CREATE TABLE IF NOT EXISTS staff_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_username VARCHAR(100) NOT NULL COMMENT 'Username admin',
    permission VARCHAR(100) NOT NULL COMMENT 'Quyền: VIEW_USERS, LOCK_ACCOUNT, etc',
    granted_by VARCHAR(100) COMMENT 'Admin cấp quyền',
    granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm cấp',
    expires_at DATETIME COMMENT 'Thời điểm hết hạn',
    UNIQUE KEY unique_staff_permission (staff_username, permission),
    INDEX idx_staff_username (staff_username),
    INDEX idx_permission (permission)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Quản lý quyền của admin staff';

-- ========================================
-- 7. ADMIN LOGIN HISTORY - Lịch sử đăng nhập admin
-- ========================================
CREATE TABLE IF NOT EXISTS admin_login_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_username VARCHAR(100) NOT NULL COMMENT 'Username admin',
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm đăng nhập',
    logout_time DATETIME COMMENT 'Thời điểm đăng xuất',
    ip_address VARCHAR(50) COMMENT 'Địa chỉ IP',
    user_agent TEXT COMMENT 'Trình duyệt/thiết bị',
    login_status ENUM('SUCCESS', 'FAILED', 'LOCKED') NOT NULL COMMENT 'Trạng thái đăng nhập',
    failure_reason VARCHAR(255) COMMENT 'Lý do thất bại',
    INDEX idx_staff_username (staff_username),
    INDEX idx_login_time (login_time),
    INDEX idx_login_status (login_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lịch sử đăng nhập của admin';

-- ========================================
-- DỮ LIỆU MẪU
-- ========================================

-- System Settings mặc định
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, updated_by) VALUES
('max_failed_login_attempts', '5', 'NUMBER', 'Số lần đăng nhập sai tối đa', 'SYSTEM'),
('account_lock_duration_minutes', '30', 'NUMBER', 'Thời gian khóa tài khoản (phút)', 'SYSTEM'),
('transaction_limit_default', '50000000', 'NUMBER', 'Hạn mức giao dịch mặc định (VND)', 'SYSTEM'),
('fraud_detection_enabled', 'true', 'BOOLEAN', 'Bật/tắt phát hiện gian lận', 'SYSTEM'),
('maintenance_mode', 'false', 'BOOLEAN', 'Chế độ bảo trì', 'SYSTEM');

-- ========================================
-- HOÀN THÀNH
-- ========================================
SELECT 'Database DB_ADMIN created successfully!' AS message;

