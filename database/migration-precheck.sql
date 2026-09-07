-- RediHealth migration precheck (MySQL/MariaDB)
-- Run this before consolidated migrations to understand current DB state.

SELECT DATABASE() AS current_database;

SELECT 'medical_help_requests' AS table_name, COUNT(*) > 0 AS exists_flag
FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name = 'medical_help_requests'
UNION ALL
SELECT 'workers' AS table_name, COUNT(*) > 0 AS exists_flag
FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name = 'workers'
UNION ALL
SELECT 'patients' AS table_name, COUNT(*) > 0 AS exists_flag
FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name = 'patients'
UNION ALL
SELECT 'mediator_cases' AS table_name, COUNT(*) > 0 AS exists_flag
FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name = 'mediator_cases'
UNION ALL
SELECT 'meetings' AS table_name, COUNT(*) > 0 AS exists_flag
FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name = 'meetings';

SELECT 'patients.assigned_worker_ids' AS column_name, COUNT(*) > 0 AS exists_flag
FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'patients' AND column_name = 'assigned_worker_ids'
UNION ALL
SELECT 'patients.access_token' AS column_name, COUNT(*) > 0 AS exists_flag
FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'patients' AND column_name = 'access_token'
UNION ALL
SELECT 'patients.access_token_expires_at' AS column_name, COUNT(*) > 0 AS exists_flag
FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'patients' AND column_name = 'access_token_expires_at'
UNION ALL
SELECT 'medical_help_requests.status_updated_by_name' AS column_name, COUNT(*) > 0 AS exists_flag
FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'medical_help_requests' AND column_name = 'status_updated_by_name'
UNION ALL
SELECT 'medical_help_requests.email nullable' AS column_name,
       COUNT(*) > 0 AS exists_flag
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'medical_help_requests'
  AND column_name = 'email'
  AND is_nullable = 'YES';

SELECT index_name,
       table_name,
       GROUP_CONCAT(column_name ORDER BY seq_in_index) AS index_columns,
       non_unique
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND table_name IN ('patients', 'medical_help_requests', 'meetings', 'workers')
  AND index_name IN (
    'patients_email_unique_idx',
    'patients_access_token_unique_idx',
    'patients_access_token_expires_idx',
    'meetings_patient_followup_idx',
    'medical_help_requests_status_idx',
    'workers_email_idx'
  )
GROUP BY index_name, table_name, non_unique
ORDER BY table_name, index_name;

-- Duplicate checks to run before enabling patient unique constraints.
SELECT LOWER(TRIM(email)) AS email_key, COUNT(*) AS duplicate_count
FROM patients
WHERE email IS NOT NULL AND TRIM(email) <> ''
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;

SELECT TRIM(phone) AS phone_key, COUNT(*) AS duplicate_count
FROM patients
WHERE phone IS NOT NULL AND TRIM(phone) <> ''
GROUP BY TRIM(phone)
HAVING COUNT(*) > 1;
