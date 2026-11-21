-- Shared rate limiting (works across server instances) and runtime settings editable by super admins.

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
