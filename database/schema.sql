-- Fresh-install schema for RediHealth.
-- Existing deployments should continue applying the numbered migrations.

CREATE TABLE IF NOT EXISTS medical_help_requests (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'in_progress', 'resolved', 'archived') NOT NULL DEFAULT 'pending',
  priority ENUM('normal', 'urgent') NOT NULL DEFAULT 'normal',
  internal_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX medical_help_requests_created_at_idx (created_at DESC),
  INDEX medical_help_requests_status_idx (status, created_at DESC)
);

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

CREATE TABLE IF NOT EXISTS patients (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NULL,
  assigned_worker_id BIGINT NULL,
  access_token VARCHAR(64) NULL,
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
  INDEX patients_created_at_idx (created_at DESC),
  INDEX patients_email_idx (email),
  INDEX patients_priority_idx (priority),
  INDEX patients_assigned_worker_id_idx (assigned_worker_id),
  INDEX patients_access_token_idx (access_token)
);

CREATE TABLE IF NOT EXISTS mediator_cases (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mediator_worker_id BIGINT NOT NULL,
  county VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50) NULL,
  address VARCHAR(500) NULL,
  care_category VARCHAR(100) NOT NULL,
  urgency ENUM('low', 'moderate', 'high', 'urgent') NOT NULL DEFAULT 'moderate',
  barriers JSON NOT NULL,
  target_date DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX mediator_cases_worker_idx (mediator_worker_id),
  INDEX mediator_cases_county_idx (county),
  INDEX mediator_cases_target_date_idx (target_date),
  CONSTRAINT mediator_cases_worker_fk
    FOREIGN KEY (mediator_worker_id) REFERENCES workers(id)
);
