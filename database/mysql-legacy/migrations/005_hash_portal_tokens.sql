-- Migration: Hash existing patient portal tokens and enforce new schema
-- Run this if the patients table already exists with plaintext access_token values.

-- 1. Add the new hash column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'patients'
    AND COLUMN_NAME = 'access_token_hash'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE patients ADD COLUMN access_token_hash CHAR(64) NULL AFTER assigned_worker_ids',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Migrate existing plaintext tokens to SHA-256 hashes
UPDATE patients
SET access_token_hash = SHA2(access_token, 256)
WHERE access_token IS NOT NULL AND access_token_hash IS NULL;

-- 3. Drop the old plaintext column and index, then add unique index on hash
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'patients'
    AND INDEX_NAME = 'patients_access_token_unique_idx'
);

SET @sql = IF(@idx_exists > 0,
  'ALTER TABLE patients DROP INDEX patients_access_token_unique_idx',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE patients DROP COLUMN access_token',
  'SELECT 1'
);
-- Note: If the column was just added in step 1, we only drop the old one if it exists.
SET @old_col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'patients'
    AND COLUMN_NAME = 'access_token'
);
SET @sql = IF(@old_col_exists > 0,
  'ALTER TABLE patients DROP COLUMN access_token',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add unique index on the hash column
SET @hash_idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'patients'
    AND INDEX_NAME = 'patients_access_token_hash_unique_idx'
);

SET @sql = IF(@hash_idx_exists = 0,
  'ALTER TABLE patients ADD UNIQUE INDEX patients_access_token_hash_unique_idx (access_token_hash)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
