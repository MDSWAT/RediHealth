-- Promote this account to an active super admin.
-- Safe to run repeatedly after the workers table has been created.

-- Update these values before running this script.
SET @super_admin_full_name = 'Super Administrator';
SET @super_admin_email = 'change-me@example.com';

INSERT INTO workers (full_name, email, role, status)
VALUES (@super_admin_full_name, @super_admin_email, 'Super Admin', 'active')
ON DUPLICATE KEY UPDATE
  role = VALUES(role),
  status = VALUES(status);
