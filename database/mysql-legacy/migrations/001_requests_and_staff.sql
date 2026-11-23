-- Consolidated migration: request intake + staff table

CREATE TABLE IF NOT EXISTS medical_help_requests (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(320) NULL,
  description TEXT NOT NULL,
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
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX workers_email_idx (email)
);