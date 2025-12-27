-- ============================================
-- Spending Category Management Migration
-- ============================================
-- Version: 1.0
-- Description: Migrate to user-specific spending categories system
-- Database: DB_TRANSACTION_SERVICE
-- ============================================
USE DB_TRANSACTION_SERVICE;

-- ============================================
-- STEP 1: Create spending_categories table
-- ============================================

CREATE TABLE IF NOT EXISTS spending_categories (
    id VARCHAR(50) PRIMARY KEY COMMENT 'UUID primary key',
    user_id BIGINT NOT NULL COMMENT 'User ID (references user table in DB_USER_SERVICE)',
    name VARCHAR(100) NOT NULL COMMENT 'Category display name',
    code VARCHAR(20) NOT NULL COMMENT 'Unique category code (uppercase)',
    icon VARCHAR(10) DEFAULT '📝' COMMENT 'Emoji icon for UI',
    color VARCHAR(7) DEFAULT '#4ECDC4' COMMENT 'Hex color for charts and UI',
    is_active BOOLEAN DEFAULT true COMMENT 'Soft delete flag',
    is_default BOOLEAN DEFAULT false COMMENT 'System default category flag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    
    -- Constraints
    UNIQUE KEY unique_user_category (user_id, code) COMMENT 'Ensure unique category code per user',
    
    -- Indexes for performance
    INDEX idx_user_active (user_id, is_active) COMMENT 'Query active categories by user',
    INDEX idx_user_code (user_id, code) COMMENT 'Lookup category by code'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User-specific spending categories for transaction categorization';

-- ============================================
-- STEP 2: Add category_id to transaction table
-- ============================================

-- Check if column already exists
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'DB_TRANSACTION_SERVICE' 
    AND TABLE_NAME = 'transaction' 
    AND COLUMN_NAME = 'category_id'
);

-- Add column only if it doesn't exist
SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE transaction 
     ADD COLUMN category_id VARCHAR(50) NULL COMMENT ''Spending category reference'' AFTER purpose_code,
     ADD INDEX idx_transaction_category (category_id) COMMENT ''Query transactions by category''',
    'SELECT ''Column category_id already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- STEP 3: Create stored procedure for new users
-- ============================================

DROP PROCEDURE IF EXISTS initialize_user_categories;

DELIMITER $$

CREATE PROCEDURE initialize_user_categories(IN p_user_id BIGINT)
BEGIN
    DECLARE category_count INT;
    
    -- Check if user already has categories
    SELECT COUNT(*) INTO category_count
    FROM spending_categories
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Only initialize if user has no categories
    IF category_count = 0 THEN
        INSERT INTO spending_categories (id, user_id, name, code, icon, color, is_active, is_default)
        VALUES
            (UUID(), p_user_id, 'Mua sắm', 'SHOPPING', '🛍️', '#FF6B6B', true, true),
            (UUID(), p_user_id, 'Ăn uống', 'FOOD', '🍽️', '#4ECDC4', true, true),
            (UUID(), p_user_id, 'Đi chợ', 'GROCERIES', '🛒', '#95E1D3', true, true),
            (UUID(), p_user_id, 'Giải trí', 'ENTERTAINMENT', '🎬', '#F38181', true, true),
            (UUID(), p_user_id, 'Học phí', 'EDUCATION', '🎓', '#AA96DA', true, true),
            (UUID(), p_user_id, 'Y tế', 'HEALTHCARE', '⚕️', '#FCBAD3', true, true),
            (UUID(), p_user_id, 'Di chuyển', 'TRANSPORT', '🚗', '#A8D8EA', true, true),
            (UUID(), p_user_id, 'Hóa đơn', 'BILLS', '📄', '#FFD93D', true, true),
            (UUID(), p_user_id, 'Khác', 'OTHER', '📝', '#C7CEEA', true, true);
        
        SELECT CONCAT('Initialized 9 default categories for user_id: ', p_user_id) AS result;
    ELSE
        SELECT CONCAT('User ', p_user_id, ' already has ', category_count, ' categories. Skipping initialization.') AS result;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- STEP 4: Verification queries
-- ============================================

-- Verify table structure
SELECT 
    'Table Structure' AS check_type,
    'spending_categories' AS table_name,
    COUNT(*) AS column_count
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'DB_TRANSACTION_SERVICE' 
AND TABLE_NAME = 'spending_categories';

-- Verify indexes
SELECT 
    'Indexes' AS check_type,
    INDEX_NAME AS index_name,
    COLUMN_NAME AS column_name
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'DB_TRANSACTION_SERVICE' 
AND TABLE_NAME = 'spending_categories'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- Verify stored procedure
SELECT 
    'Stored Procedure' AS check_type,
    ROUTINE_NAME AS procedure_name,
    ROUTINE_TYPE AS type
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_SCHEMA = 'DB_TRANSACTION_SERVICE' 
AND ROUTINE_NAME = 'initialize_user_categories';

-- Verify transaction table column
SELECT 
    'Transaction Table' AS check_type,
    COLUMN_NAME AS column_name,
    DATA_TYPE AS data_type,
    IS_NULLABLE AS nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'DB_TRANSACTION_SERVICE' 
AND TABLE_NAME = 'transaction'
AND COLUMN_NAME = 'category_id';

-- ============================================
-- STEP 5: Usage examples (commented out)
-- ============================================

/*
-- Example 1: Initialize categories for a new user
CALL initialize_user_categories(1);

-- Example 2: Check categories for a user
SELECT * FROM spending_categories WHERE user_id = 1 AND is_active = true;

-- Example 3: Create a custom category
INSERT INTO spending_categories (id, user_id, name, code, icon, color, is_active, is_default)
VALUES (UUID(), 1, 'Cafe', 'CAFE', '☕', '#8B4513', true, false);

-- Example 4: Update transaction with category
UPDATE transaction 
SET category_id = (
    SELECT id FROM spending_categories 
    WHERE user_id = 1 AND code = 'FOOD' 
    LIMIT 1
)
WHERE transaction_id = 123;

-- Example 5: Get spending statistics by category
SELECT 
    sc.name AS category_name,
    sc.icon AS category_icon,
    sc.color AS category_color,
    COUNT(t.transaction_id) AS transaction_count,
    SUM(t.amount) AS total_amount
FROM spending_categories sc
LEFT JOIN transaction t ON t.category_id = sc.id AND t.status = 'SUCCESS'
WHERE sc.user_id = 1 AND sc.is_active = true
GROUP BY sc.id, sc.name, sc.icon, sc.color
ORDER BY total_amount DESC;
*/

-- ============================================
-- STEP 6: Rollback script (for reference)
-- ============================================

/*
-- WARNING: Only use this if you need to completely rollback the migration

-- Drop stored procedure
DROP PROCEDURE IF EXISTS initialize_user_categories;

-- Remove category_id from transaction table
ALTER TABLE transaction DROP COLUMN category_id;

-- Drop spending_categories table
DROP TABLE IF EXISTS spending_categories;

-- Verify rollback
SHOW TABLES LIKE 'spending%';
*/

-- ============================================
-- Migration completed successfully!
-- ============================================

SELECT 
    '✅ Migration Completed' AS status,
    NOW() AS completed_at,
    'spending_categories table created' AS step1,
    'category_id added to transaction' AS step2,
    'initialize_user_categories procedure created' AS step3,
    'Ready for production use' AS message;
