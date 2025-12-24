-- Create transfer_purposes table
CREATE TABLE transfer_purposes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    icon VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add purpose_code column to transaction table
ALTER TABLE transaction 
ADD COLUMN purpose_code VARCHAR(20),
ADD FOREIGN KEY (purpose_code) REFERENCES transfer_purposes(code);

-- Insert sample transfer purposes data
INSERT INTO transfer_purposes (id, name, code, icon) VALUES
('1', 'Đi chợ', 'MARKET', '🛒'),
('2', 'Mua sắm', 'SHOPPING', '🛍️'),
('3', 'Hóa đơn', 'BILL', '📄'),
('4', 'Học phí', 'TUITION', '🎓'),
('5', 'Ăn uống', 'FOOD', '🍽️'),
('6', 'Khác', 'OTHER', '📝');

-- Create indexes for better performance
CREATE INDEX idx_transfer_purposes_code ON transfer_purposes(code);
CREATE INDEX idx_transfer_purposes_active ON transfer_purposes(is_active);
CREATE INDEX idx_transaction_purpose_code ON transaction(purpose_code);