-- Tạo bảng lãi suất
CREATE TABLE interest_rate (
    interest_rate_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    term_months INT NOT NULL,
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2),
    annual_rate DECIMAL(5,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    effective_from DATETIME NOT NULL,
    effective_to DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng tài khoản tiết kiệm
CREATE TABLE savings_account (
    savings_account_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    payment_account_id BIGINT NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    interest_rate_id BIGINT NOT NULL,
    term_months INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    opened_date DATETIME NOT NULL,
    maturity_date DATETIME NOT NULL,
    closed_date DATETIME,
    last_interest_calculated_at DATETIME,
    total_interest_earned DECIMAL(15,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (interest_rate_id) REFERENCES interest_rate(interest_rate_id),
    FOREIGN KEY (payment_account_id) REFERENCES account(account_id)
);

-- Tạo bảng yêu cầu giao dịch
CREATE TABLE transaction_request (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    savings_account_id BIGINT NOT NULL,
    request_type VARCHAR(20) NOT NULL, -- CASH_DEPOSIT, CASH_WITHDRAWAL
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, COMPLETED
    description TEXT,
    rejection_reason TEXT,
    requested_at DATETIME NOT NULL,
    processed_at DATETIME,
    processed_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (savings_account_id) REFERENCES savings_account(savings_account_id)
);

-- Tạo indexes
CREATE INDEX idx_savings_account_user_id ON savings_account(user_id);
CREATE INDEX idx_savings_account_status ON savings_account(status);
CREATE INDEX idx_savings_account_maturity ON savings_account(maturity_date);
CREATE INDEX idx_transaction_request_user_id ON transaction_request(user_id);
CREATE INDEX idx_transaction_request_status ON transaction_request(status);
CREATE INDEX idx_transaction_request_savings_account ON transaction_request(savings_account_id);
CREATE INDEX idx_interest_rate_term ON interest_rate(term_months);
CREATE INDEX idx_interest_rate_status ON interest_rate(status);