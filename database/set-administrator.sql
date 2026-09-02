-- Promote this account to an active administrator.
-- Safe to run repeatedly after the workers table has been created.

INSERT INTO workers (full_name, email, role, status)
VALUES ('Mihai Babinciuc', 'babinciucmihai4@gmail.com', 'Administrator', 'active')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status;
