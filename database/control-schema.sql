-- Control database: holds nothing personal. Rate-limit counters, runtime settings and the public
-- medical-institute directory. Country databases (patients, requests, staff, audit log) use
-- schema.sql / migrations 001-006, 008 and 010 instead.

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key CHAR(64) NOT NULL PRIMARY KEY,
  hits INT NOT NULL,
  reset_at BIGINT NOT NULL,
  INDEX rate_limits_reset_at_idx (reset_at)
);

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
  setting_value TEXT NULL,
  updated_by VARCHAR(320) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
