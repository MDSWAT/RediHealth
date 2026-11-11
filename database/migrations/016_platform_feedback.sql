-- Migration 016: Anonymized platform feedback & demographic evaluation store
-- Holds zero personal identifiers (no IP address, email, phone, name, or session token).

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
