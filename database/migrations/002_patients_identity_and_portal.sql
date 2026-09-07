-- Consolidated migration: patient profile, assignment, and portal security

CREATE TABLE IF NOT EXISTS patients (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT,
  assigned_worker_id BIGINT NULL,
  assigned_worker_ids JSON NULL,
  access_token VARCHAR(64) NULL,
  access_token_expires_at DATETIME NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL,
  date_of_birth VARCHAR(50) NULL,
  gender VARCHAR(50) NULL,
  address VARCHAR(500) NULL,
  condition_notes TEXT NULL,
  medical_history TEXT NULL,
  treatment_plan TEXT NULL,
  followups LONGTEXT NULL,
  photos LONGTEXT NULL,
  status ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
  priority ENUM('critical', 'high', 'moderate', 'low') NOT NULL DEFAULT 'moderate',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX patients_created_at_idx (created_at),
  UNIQUE INDEX patients_email_unique_idx (email),
  INDEX patients_priority_idx (priority),
  INDEX patients_assigned_worker_id_idx (assigned_worker_id),
  UNIQUE INDEX patients_access_token_unique_idx (access_token),
  INDEX patients_access_token_expires_idx (access_token_expires_at),
  CONSTRAINT patients_assigned_worker_fk
    FOREIGN KEY (assigned_worker_id) REFERENCES workers(id)
);
