-- Cleanup patient duplicates by normalized email and phone (MariaDB/MySQL)
-- Review SELECT outputs first. Run backup before DELETE in production.

-- 1) Inspect duplicates by email
SELECT LOWER(TRIM(email)) AS email_key, COUNT(*) AS duplicate_count,
       GROUP_CONCAT(id ORDER BY id ASC) AS patient_ids
FROM patients
WHERE email IS NOT NULL AND TRIM(email) <> ''
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;

-- 2) Inspect duplicates by phone
SELECT TRIM(phone) AS phone_key, COUNT(*) AS duplicate_count,
       GROUP_CONCAT(id ORDER BY id ASC) AS patient_ids
FROM patients
WHERE phone IS NOT NULL AND TRIM(phone) <> ''
GROUP BY TRIM(phone)
HAVING COUNT(*) > 1;

-- 3) Build duplicate -> keeper map (lowest id kept)
DROP TEMPORARY TABLE IF EXISTS tmp_patient_dedupe_map;
DROP TEMPORARY TABLE IF EXISTS tmp_patient_dedupe_candidates;

CREATE TEMPORARY TABLE tmp_patient_dedupe_candidates (
  duplicate_id BIGINT NOT NULL,
  keep_id BIGINT NOT NULL
);

INSERT INTO tmp_patient_dedupe_candidates (duplicate_id, keep_id)
SELECT p.id AS duplicate_id, k.keep_id
FROM patients p
JOIN (
  SELECT LOWER(TRIM(email)) AS email_key, MIN(id) AS keep_id
  FROM patients
  WHERE email IS NOT NULL AND TRIM(email) <> ''
  GROUP BY LOWER(TRIM(email))
  HAVING COUNT(*) > 1
) k ON LOWER(TRIM(p.email)) = k.email_key
WHERE p.id <> k.keep_id;

INSERT INTO tmp_patient_dedupe_candidates (duplicate_id, keep_id)
SELECT p.id AS duplicate_id, k.keep_id
FROM patients p
JOIN (
  SELECT TRIM(phone) AS phone_key, MIN(id) AS keep_id
  FROM patients
  WHERE phone IS NOT NULL AND TRIM(phone) <> ''
  GROUP BY TRIM(phone)
  HAVING COUNT(*) > 1
) k ON TRIM(p.phone) = k.phone_key
WHERE p.id <> k.keep_id;

CREATE TEMPORARY TABLE tmp_patient_dedupe_map AS
SELECT duplicate_id, MIN(keep_id) AS keep_id
FROM tmp_patient_dedupe_candidates
GROUP BY duplicate_id;

DROP TEMPORARY TABLE IF EXISTS tmp_patient_dedupe_candidates;

-- 4) Repoint meetings to keeper patient id
UPDATE meetings m
JOIN tmp_patient_dedupe_map d ON m.patient_id = d.duplicate_id
SET m.patient_id = d.keep_id;

-- 5) Delete duplicate patients
DELETE p
FROM patients p
JOIN tmp_patient_dedupe_map d ON p.id = d.duplicate_id;

-- 6) Verify email cleanup
SELECT LOWER(TRIM(email)) AS email_key, COUNT(*) AS duplicate_count
FROM patients
WHERE email IS NOT NULL AND TRIM(email) <> ''
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;

-- 7) Verify phone cleanup
SELECT TRIM(phone) AS phone_key, COUNT(*) AS duplicate_count
FROM patients
WHERE phone IS NOT NULL AND TRIM(phone) <> ''
GROUP BY TRIM(phone)
HAVING COUNT(*) > 1;
