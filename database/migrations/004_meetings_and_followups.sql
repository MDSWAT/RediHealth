-- Consolidated migration: meetings and patient follow-up linkage

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
