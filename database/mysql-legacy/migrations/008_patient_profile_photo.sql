-- Store a separate staff-managed patient profile photo.
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'patients'
    AND COLUMN_NAME = 'profile_photo'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE patients ADD COLUMN profile_photo MEDIUMTEXT NULL AFTER medical_history',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
