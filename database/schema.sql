-- Fresh-install schema for RediHealth (MySQL 8+).

CREATE TABLE IF NOT EXISTS offline_sync_receipts (
  worker_id BIGINT NOT NULL,
  operation_id CHAR(36) NOT NULL,
  entity_id VARCHAR(64) NULL,
  revision CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (worker_id, operation_id)
);

CREATE TABLE IF NOT EXISTS medical_help_requests (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(320) NULL,
  description TEXT NOT NULL,
  county VARCHAR(100) NULL,
  privacy_consent_at TIMESTAMP NULL,
  status ENUM('pending', 'in_progress', 'resolved', 'archived') NOT NULL DEFAULT 'pending',
  status_updated_by_name VARCHAR(200) NULL,
  status_updated_by_email VARCHAR(320) NULL,
  status_updated_at TIMESTAMP NULL,
  priority ENUM('normal', 'urgent') NOT NULL DEFAULT 'normal',
  internal_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX medical_help_requests_created_at_idx (created_at),
  INDEX medical_help_requests_status_idx (status, created_at)
);

CREATE TABLE IF NOT EXISTS workers (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  phone VARCHAR(50) NULL,
  role VARCHAR(100) NOT NULL DEFAULT 'Healthcare Worker',
  department VARCHAR(100) NULL,
  county VARCHAR(100) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX workers_email_idx (email)
);

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
  county VARCHAR(100) NULL,
  condition_notes TEXT NULL,
  medical_history TEXT NULL,
  profile_photo MEDIUMTEXT NULL,
  treatment_plan TEXT NULL,
  followups LONGTEXT NULL,
  photos LONGTEXT NULL,
  intake LONGTEXT NULL,
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

CREATE TABLE IF NOT EXISTS mediator_cases (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mediator_worker_id BIGINT NOT NULL,
  county VARCHAR(100) NOT NULL,
  locality VARCHAR(200) NULL,
  uat VARCHAR(200) NULL,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth VARCHAR(50) NULL,
  phone VARCHAR(50) NULL,
  address VARCHAR(500) NULL,
  care_category VARCHAR(100) NOT NULL,
  urgency ENUM('low', 'moderate', 'high', 'urgent') NOT NULL DEFAULT 'moderate',
  barriers JSON NOT NULL,
  target_date DATE NULL,
  home_visit_date DATE NULL,
  map_lat DECIMAL(9, 6) NULL,
  map_lng DECIMAL(9, 6) NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  closed_at TIMESTAMP NULL,
  closed_by_worker_id BIGINT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX mediator_cases_worker_idx (mediator_worker_id),
  INDEX mediator_cases_county_idx (county),
  INDEX mediator_cases_target_date_idx (target_date),
  CONSTRAINT mediator_cases_worker_fk
    FOREIGN KEY (mediator_worker_id) REFERENCES workers(id)
);

CREATE TABLE IF NOT EXISTS meetings (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  organizer_worker_id BIGINT NOT NULL,
  patient_id BIGINT NULL,
  followup_id VARCHAR(64) NULL,
  title VARCHAR(200) NOT NULL,
  meeting_url VARCHAR(2048) NOT NULL,
  transcript LONGTEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX meetings_created_at_idx (created_at),
  INDEX meetings_patient_followup_idx (patient_id, followup_id),
  CONSTRAINT meetings_organizer_worker_fk
    FOREIGN KEY (organizer_worker_id) REFERENCES workers(id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_worker_id BIGINT NULL,
  actor_name VARCHAR(200) NULL,
  actor_email VARCHAR(320) NULL,
  actor_role VARCHAR(120) NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(120) NOT NULL,
  entity_id VARCHAR(120) NULL,
  details_json LONGTEXT NULL,
  ip_address VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX activity_logs_created_at_idx (created_at),
  INDEX activity_logs_action_idx (action),
  INDEX activity_logs_entity_idx (entity_type, entity_id),
  INDEX activity_logs_actor_email_idx (actor_email),
  CONSTRAINT activity_logs_actor_worker_fk
    FOREIGN KEY (actor_worker_id) REFERENCES workers(id)
    ON DELETE SET NULL
);

-- Medical institutes for the public Find help map (managed from /panel/institutes).
CREATE TABLE IF NOT EXISTS medical_institutes (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  country_code CHAR(2) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'clinic',
  address VARCHAR(500) NULL,
  city VARCHAR(160) NULL,
  phone VARCHAR(120) NULL,
  website VARCHAR(500) NULL,
  hours VARCHAR(255) NULL,
  emergency TINYINT(1) NOT NULL DEFAULT 0,
  lat DECIMAL(9, 6) NOT NULL,
  lng DECIMAL(9, 6) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  source VARCHAR(16) NOT NULL DEFAULT 'manual',
  osm_ref VARCHAR(40) NULL,
  manually_edited TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY medical_institutes_osm_ref_uq (osm_ref),
  INDEX medical_institutes_geo_idx (is_active, lat, lng),
  INDEX medical_institutes_country_idx (country_code, is_active, category),
  INDEX medical_institutes_name_idx (name)
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Shared rate limiting (works across server instances).
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key CHAR(64) NOT NULL PRIMARY KEY,
  hits INT NOT NULL,
  reset_at BIGINT NOT NULL,
  INDEX rate_limits_reset_at_idx (reset_at)
);

-- Runtime settings editable by super admins (e.g. the operational alert recipient).
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
  setting_value TEXT NULL,
  updated_by VARCHAR(320) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Anonymized platform feedback and optional demographic evaluation store.
CREATE TABLE IF NOT EXISTS platform_feedback (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  country_code CHAR(2) NOT NULL DEFAULT 'RO',
  lang VARCHAR(8) NOT NULL DEFAULT 'ro',
  page_path VARCHAR(255) NULL,
  rating_usefulness TINYINT UNSIGNED NOT NULL,
  rating_ease_of_use TINYINT UNSIGNED NOT NULL,
  rating_visual_design TINYINT UNSIGNED NOT NULL,
  rating_content_clarity TINYINT UNSIGNED NOT NULL,
  rating_future_use TINYINT UNSIGNED NOT NULL,
  open_feedback TEXT NULL,
  gender VARCHAR(32) NULL,
  age_group VARCHAR(24) NULL,
  locality VARCHAR(120) NULL,
  occupation VARCHAR(120) NULL,
  marital_status VARCHAR(32) NULL,
  anonymized_redactions TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX platform_feedback_created_idx (created_at),
  INDEX platform_feedback_country_idx (country_code, created_at),
  INDEX platform_feedback_lang_idx (lang, created_at)
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
