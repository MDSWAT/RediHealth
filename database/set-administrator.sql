-- Promote this account to an active administrator (PostgreSQL).
-- Safe to run repeatedly after "npm run migrate". Run it on the country database the account works in.
-- Change the name and email below before running it.

INSERT INTO workers (full_name, email, role, status)
VALUES ('Administrator', LOWER('change-me@example.com'), 'Administrator', 'active')
ON CONFLICT ((LOWER(email))) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status;
