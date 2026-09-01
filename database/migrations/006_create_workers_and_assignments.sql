CREATE TABLE IF NOT EXISTS workers (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  phone VARCHAR(50) NULL,
  role VARCHAR(100) NOT NULL DEFAULT 'Healthcare Worker',
  department VARCHAR(100) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX workers_email_idx (email)
);

ALTER TABLE patients
  ADD COLUMN assigned_worker_id BIGINT NULL;

CREATE INDEX patients_assigned_worker_id_idx ON patients (assigned_worker_id);
