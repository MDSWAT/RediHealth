-- Promote this account to an active administrator.
-- Safe to run repeatedly after the workers table has been created.

-- Update these values before running this script.
SET @admin_full_name = 'Administrator';
SET @admin_email = 'change-me@example.com';

INSERT INTO workers (full_name, email, role, status)
VALUES (@admin_full_name, @admin_email, 'Administrator', 'active')
ON DUPLICATE KEY UPDATE
  role = VALUES(role),
  status = VALUES(status);
