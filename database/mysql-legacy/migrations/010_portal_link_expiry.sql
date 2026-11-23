-- Patient portal links now expire. Links created before this migration get a fresh 90-day window;
-- patients can always request a new link from the sign-in page.

UPDATE patients
SET access_token_expires_at = DATE_ADD(NOW(), INTERVAL 90 DAY)
WHERE access_token_hash IS NOT NULL
  AND access_token_expires_at IS NULL;
