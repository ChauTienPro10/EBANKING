-- Data 4G Schema for Transaction Service

-- Create data_package table
CREATE TABLE IF NOT EXISTS data_package (
    package_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT NOT NULL,
    package_code VARCHAR(50) NOT NULL UNIQUE,
    package_name VARCHAR(200) NOT NULL,
    data_amount BIGINT NOT NULL COMMENT 'Data amount in MB',
    validity_days INT NOT NULL COMMENT 'Package validity in days',
    price DECIMAL(19,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES telecom_provider(provider_id),
    INDEX idx_provider_active (provider_id, is_active),
    INDEX idx_package_code (package_code),
    INDEX idx_sort_price (sort_order, price)
);

-- Create data_top_up table
CREATE TABLE IF NOT EXISTS data_top_up (
    data_top_up_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    username VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    package_id BIGINT NOT NULL,
    telecom_provider VARCHAR(50) NOT NULL,
    package_name VARCHAR(200) NOT NULL,
    data_amount BIGINT NOT NULL COMMENT 'Data amount in MB',
    validity_days INT NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    provider_transaction_id VARCHAR(100),
    provider_response TEXT,
    failure_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Face authentication fields
    requires_face_auth BOOLEAN DEFAULT FALSE,
    face_auth_session_id VARCHAR(36),
    face_auth_verified BOOLEAN DEFAULT FALSE,
    face_auth_at TIMESTAMP NULL,
    
    FOREIGN KEY (package_id) REFERENCES data_package(package_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_phone_number (phone_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_user_created (user_id, created_at)
);

-- Insert sample data packages for Viettel
INSERT INTO data_package (provider_id, package_code, package_name, data_amount, validity_days, price, description, sort_order) VALUES
-- Assuming provider_id 1 is Viettel
(1, 'VT_D1GB_1D', 'Gói 4G 1GB/ngày', 1024, 1, 15000, 'Gói data 4G 1GB sử dụng trong 1 ngày', 1),
(1, 'VT_D3GB_3D', 'Gói 4G 3GB/3 ngày', 3072, 3, 35000, 'Gói data 4G 3GB sử dụng trong 3 ngày', 2),
(1, 'VT_D6GB_7D', 'Gói 4G 6GB/tuần', 6144, 7, 60000, 'Gói data 4G 6GB sử dụng trong 7 ngày', 3),
(1, 'VT_D12GB_30D', 'Gói 4G 12GB/tháng', 12288, 30, 120000, 'Gói data 4G 12GB sử dụng trong 30 ngày', 4),
(1, 'VT_D25GB_30D', 'Gói 4G 25GB/tháng', 25600, 30, 200000, 'Gói data 4G 25GB sử dụng trong 30 ngày', 5);

-- Insert sample data packages for Vinaphone (assuming provider_id 2)
INSERT INTO data_package (provider_id, package_code, package_name, data_amount, validity_days, price, description, sort_order) VALUES
(2, 'VNP_D1GB_1D', 'Gói 4G 1GB/ngày', 1024, 1, 15000, 'Gói data 4G 1GB sử dụng trong 1 ngày', 1),
(2, 'VNP_D2GB_3D', 'Gói 4G 2GB/3 ngày', 2048, 3, 30000, 'Gói data 4G 2GB sử dụng trong 3 ngày', 2),
(2, 'VNP_D5GB_7D', 'Gói 4G 5GB/tuần', 5120, 7, 55000, 'Gói data 4G 5GB sử dụng trong 7 ngày', 3),
(2, 'VNP_D10GB_30D', 'Gói 4G 10GB/tháng', 10240, 30, 100000, 'Gói data 4G 10GB sử dụng trong 30 ngày', 4),
(2, 'VNP_D20GB_30D', 'Gói 4G 20GB/tháng', 20480, 30, 180000, 'Gói data 4G 20GB sử dụng trong 30 ngày', 5);

-- Insert sample data packages for Mobifone (assuming provider_id 3)
INSERT INTO data_package (provider_id, package_code, package_name, data_amount, validity_days, price, description, sort_order) VALUES
(3, 'MBF_D500MB_1D', 'Gói 4G 500MB/ngày', 512, 1, 12000, 'Gói data 4G 500MB sử dụng trong 1 ngày', 1),
(3, 'MBF_D1_5GB_3D', 'Gói 4G 1.5GB/3 ngày', 1536, 3, 25000, 'Gói data 4G 1.5GB sử dụng trong 3 ngày', 2),
(3, 'MBF_D4GB_7D', 'Gói 4G 4GB/tuần', 4096, 7, 50000, 'Gói data 4G 4GB sử dụng trong 7 ngày', 3),
(3, 'MBF_D8GB_30D', 'Gói 4G 8GB/tháng', 8192, 30, 90000, 'Gói data 4G 8GB sử dụng trong 30 ngày', 4),
(3, 'MBF_D15GB_30D', 'Gói 4G 15GB/tháng', 15360, 30, 150000, 'Gói data 4G 15GB sử dụng trong 30 ngày', 5);