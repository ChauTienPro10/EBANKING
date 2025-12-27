-- ============================================
-- Spending Category Management Migration
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
    icon VARCHAR(50) DEFAULT 'pricetag-outline' COMMENT 'Ionicon name for UI (e.g., restaurant-outline)',
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
-- STEP 2: Upgrade icon column if exists
-- ============================================

-- Check if table exists and icon column needs upgrade
SET @table_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'DB_TRANSACTION_SERVICE' 
    AND TABLE_NAME = 'spending_categories'
);

SET @icon_length = (
    SELECT CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'DB_TRANSACTION_SERVICE' 
    AND TABLE_NAME = 'spending_categories'
    AND COLUMN_NAME = 'icon'
);

-- Upgrade icon column if it's too small
SET @sql_upgrade_icon = IF(
    @table_exists = 1 AND @icon_length < 50,
    'ALTER TABLE spending_categories MODIFY COLUMN icon VARCHAR(50) DEFAULT ''pricetag-outline'' COMMENT ''Ionicon name for UI''',
    'SELECT ''Icon column already correct or table does not exist'' AS message'
);

PREPARE stmt FROM @sql_upgrade_icon;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- STEP 3: Add category_id to transaction table
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
-- STEP 4: Create stored procedure (4 minimal categories)
-- ============================================

DROP PROCEDURE IF EXISTS initialize_user_categories;

DELIMITER $$

CREATE PROCEDURE initialize_user_categories(IN p_user_id BIGINT)
BEGIN
    DECLARE category_count INT;
    
    -- Check if user already has active categories
    SELECT COUNT(*) INTO category_count
    FROM spending_categories
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Only initialize if user has no active categories
    IF category_count = 0 THEN
        -- Create 4 minimal default categories with Ionicon names
        INSERT INTO spending_categories (id, user_id, name, code, icon, color, is_active, is_default)
        VALUES
            (UUID(), p_user_id, 'Ăn uống', 'FOOD', 'restaurant-outline', '#4ECDC4', true, true),
            (UUID(), p_user_id, 'Mua sắm', 'SHOPPING', 'cart-outline', '#FF6B6B', true, true),
            (UUID(), p_user_id, 'Hóa đơn', 'BILLS', 'document-text-outline', '#FFD93D', true, true),
            (UUID(), p_user_id, 'Khác', 'OTHER', 'ellipsis-horizontal-outline', '#C7CEEA', true, true);
        
        SELECT CONCAT('✅ Initialized 4 default categories for user_id: ', p_user_id) AS result;
    ELSE
        SELECT CONCAT('ℹ️ User ', p_user_id, ' already has ', category_count, ' active categories. Skipping initialization.') AS result;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- STEP 5: Verification queries
-- ============================================

SELECT '=== MIGRATION VERIFICATION ===' AS info;

-- Verify table structure
SELECT 
    'Table Structure' AS check_type,
    'spending_categories' AS table_name,
    COUNT(*) AS column_count
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'DB_TRANSACTION_SERVICE' 
AND TABLE_NAME = 'spending_categories';

-- Verify icon column size
SELECT 
    'Icon Column' AS check_type,
    COLUMN_NAME AS column_name,
    COLUMN_TYPE AS column_type,
    CHARACTER_MAXIMUM_LENGTH AS max_length
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'DB_TRANSACTION_SERVICE' 
AND TABLE_NAME = 'spending_categories'
AND COLUMN_NAME = 'icon';

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
-- STEP 6: Test initialization (optional)
-- ============================================

/*
-- Test with user_id = 1
CALL initialize_user_categories(1);

-- Verify categories created
SELECT * FROM spending_categories WHERE user_id = 1 AND is_active = true;
*/

-- ============================================
-- STEP 7: Usage examples (commented out)
-- ============================================

/*
-- Example 1: Initialize categories for a new user
CALL initialize_user_categories(123);

-- Example 2: Check active categories for a user
SELECT * FROM spending_categories WHERE user_id = 123 AND is_active = true;

-- Example 3: Create a custom category
INSERT INTO spending_categories (id, user_id, name, code, icon, color, is_active, is_default)
VALUES (UUID(), 123, 'Cafe', 'CAFE', 'cafe-outline', '#8B4513', true, false);

-- Example 4: Soft delete a category (user-created only)
UPDATE spending_categories 
SET is_active = false 
WHERE id = 'category-uuid-here' AND is_default = false;

-- Example 5: Reactivate a deleted category
UPDATE spending_categories 
SET is_active = true, name = 'Updated Name', icon = 'new-icon-outline'
WHERE user_id = 123 AND code = 'CAFE';

-- Example 6: Update transaction with category
UPDATE transaction 
SET category_id = (
    SELECT id FROM spending_categories 
    WHERE user_id = 123 AND code = 'FOOD' AND is_active = true
    LIMIT 1
)
WHERE transaction_id = 456;

-- Example 7: Get spending statistics by category
SELECT 
    sc.name AS category_name,
    sc.icon AS category_icon,
    sc.color AS category_color,
    COUNT(t.transaction_id) AS transaction_count,
    SUM(t.amount) AS total_amount,
    ROUND(SUM(t.amount) / (SELECT SUM(amount) FROM transaction WHERE sender_account_number = 'account123' AND status = 'SUCCESS') * 100, 2) AS percentage
FROM spending_categories sc
LEFT JOIN transaction t ON t.category_id = sc.id AND t.status = 'SUCCESS'
WHERE sc.user_id = 123 AND sc.is_active = true
GROUP BY sc.id, sc.name, sc.icon, sc.color
ORDER BY total_amount DESC;
*/

-- ============================================
-- STEP 8: Rollback script (for reference)
-- ============================================

/*
-- ⚠️ WARNING: Only use this if you need to completely rollback the migration

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
    'v2.0' AS version,
    'spending_categories table created/upgraded' AS step1,
    'icon column upgraded to VARCHAR(50)' AS step2,
    'category_id added to transaction' AS step3,
    'initialize_user_categories procedure created (4 minimal categories)' AS step4,
    'Ready for production use' AS message;

SELECT '=== NEXT STEPS ===' AS info;
SELECT 'Run: CALL initialize_user_categories(YOUR_USER_ID);' AS instruction;
SELECT 'Then check: SELECT * FROM spending_categories WHERE user_id = YOUR_USER_ID;' AS verification;
