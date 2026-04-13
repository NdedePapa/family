-- ═══════════════════════════════════════════════════════════════
-- FAMILY TREE DATABASE MIGRATION SCRIPT
-- Version: 1.0 → 2.0
-- Description: Adds missing columns and tables for enhanced features
-- ═══════════════════════════════════════════════════════════════
-- 
-- IMPORTANT: This script is SAFE to run multiple times (idempotent)
-- It will only add missing columns/tables without affecting existing data
-- 
-- HOW TO RUN:
-- mysql -u root -p family_tree < database-migration.sql
-- 
-- ═══════════════════════════════════════════════════════════════

USE family_tree;

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

-- ═══════════════════════════════════════════════════════════════
-- STEP 1: ADD MISSING COLUMNS TO MEMBERS TABLE
-- ═══════════════════════════════════════════════════════════════

SELECT '→ Adding missing columns to members table...' AS status;

-- Add birth_date column (full date, not just year)
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'family_tree' 
  AND TABLE_NAME = 'members' 
  AND COLUMN_NAME = 'birth_date'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE members ADD COLUMN birth_date DATE DEFAULT NULL AFTER birth_year',
  'SELECT "Column birth_date already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add death_date column (full date, not just year)
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'family_tree' 
  AND TABLE_NAME = 'members' 
  AND COLUMN_NAME = 'death_date'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE members ADD COLUMN death_date DATE DEFAULT NULL AFTER death_year',
  'SELECT "Column death_date already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_living column
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'family_tree' 
  AND TABLE_NAME = 'members' 
  AND COLUMN_NAME = 'is_living'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE members ADD COLUMN is_living BOOLEAN DEFAULT TRUE AFTER death_date',
  'SELECT "Column is_living already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add photo_url column
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'family_tree' 
  AND TABLE_NAME = 'members' 
  AND COLUMN_NAME = 'photo_url'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE members ADD COLUMN photo_url VARCHAR(500) DEFAULT NULL AFTER is_living',
  'SELECT "Column photo_url already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add privacy_level column
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'family_tree' 
  AND TABLE_NAME = 'members' 
  AND COLUMN_NAME = 'privacy_level'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE members ADD COLUMN privacy_level ENUM(\'public\', \'family\', \'private\') DEFAULT \'family\' AFTER photo_url',
  'SELECT "Column privacy_level already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add email column
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'family_tree' 
  AND TABLE_NAME = 'members' 
  AND COLUMN_NAME = 'email'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE members ADD COLUMN email VARCHAR(255) DEFAULT NULL AFTER privacy_level',
  'SELECT "Column email already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add phone column
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'family_tree' 
  AND TABLE_NAME = 'members' 
  AND COLUMN_NAME = 'phone'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE members ADD COLUMN phone VARCHAR(50) DEFAULT NULL AFTER email',
  'SELECT "Column phone already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: CREATE PHOTOS TABLE
-- ═══════════════════════════════════════════════════════════════

SELECT '→ Creating photos table...' AS status;

CREATE TABLE IF NOT EXISTS photos (
  id INT NOT NULL AUTO_INCREMENT,
  member_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  caption TEXT,
  year VARCHAR(10) DEFAULT NULL,
  is_profile_photo BOOLEAN DEFAULT FALSE,
  uploaded_by VARCHAR(255) NOT NULL DEFAULT 'User',
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member(member_id),
  INDEX idx_profile(is_profile_photo),
  INDEX idx_uploaded(uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════
-- STEP 3: ADD INDEXES FOR BETTER PERFORMANCE
-- ═══════════════════════════════════════════════════════════════

SELECT '→ Adding performance indexes...' AS status;

-- Add index for common search patterns
SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'family_tree' 
  AND TABLE_NAME = 'members' 
  AND INDEX_NAME = 'idx_name_search'
);

SET @sql = IF(@index_exists = 0,
  'ALTER TABLE members ADD INDEX idx_name_search (name(50))',
  'SELECT "Index idx_name_search already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for living status queries
SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'family_tree' 
  AND TABLE_NAME = 'members' 
  AND INDEX_NAME = 'idx_living'
);

SET @sql = IF(@index_exists = 0,
  'ALTER TABLE members ADD INDEX idx_living (is_living)',
  'SELECT "Index idx_living already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ═══════════════════════════════════════════════════════════════
-- STEP 4: UPDATE EXISTING DATA
-- ═══════════════════════════════════════════════════════════════

SELECT '→ Updating existing member records...' AS status;

-- Set is_living based on death_year
UPDATE members 
SET is_living = (death_year = '' OR death_year IS NULL)
WHERE is_living IS NULL OR is_living = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- STEP 5: VERIFICATION
-- ═══════════════════════════════════════════════════════════════

SELECT '═══════════════════════════════════════════════════════════════' AS '';
SELECT '  ✅ MIGRATION COMPLETED SUCCESSFULLY' AS '';
SELECT '═══════════════════════════════════════════════════════════════' AS '';

-- Show table structure
SELECT '' AS '';
SELECT '→ Current members table structure:' AS '';
DESCRIBE members;

SELECT '' AS '';
SELECT '→ Database statistics:' AS '';
SELECT 
  (SELECT COUNT(*) FROM members) AS total_members,
  (SELECT COUNT(*) FROM change_requests) AS total_change_requests,
  (SELECT COUNT(*) FROM photos) AS total_photos;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

SELECT '' AS '';
SELECT '═══════════════════════════════════════════════════════════════' AS '';
SELECT '  🎉 Your database is now ready for v2.0!' AS '';
SELECT '  Next step: Install dependencies with: npm install' AS '';
SELECT '  Then start server with: npm start' AS '';
SELECT '═══════════════════════════════════════════════════════════════' AS '';
