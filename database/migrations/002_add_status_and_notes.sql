ALTER TABLE medical_help_requests
  ADD COLUMN status ENUM('pending', 'in_progress', 'resolved', 'archived') NOT NULL DEFAULT 'pending',
  ADD COLUMN priority ENUM('normal', 'urgent') NOT NULL DEFAULT 'normal',
  ADD COLUMN internal_notes TEXT NULL,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE INDEX medical_help_requests_status_idx
  ON medical_help_requests (status, created_at DESC);
