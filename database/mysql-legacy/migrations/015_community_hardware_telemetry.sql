-- Migration 015: Community Hardware Telemetry, Recommendations & Mediator Requests

CREATE TABLE IF NOT EXISTS patient_vitals_telemetry (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT NULL,
  meeting_id BIGINT NULL,
  recorded_by_worker_id BIGINT NULL,
  device_kit_id VARCHAR(64) NOT NULL DEFAULT 'kit-standard',
  blood_pressure_systolic INT NULL,
  blood_pressure_diastolic INT NULL,
  pulse_bpm INT NULL,
  oxygen_saturation_pct INT NULL,
  blood_glucose_mg_dl DECIMAL(5,1) NULL,
  glucose_context ENUM('fasting', 'postprandial', 'random') DEFAULT 'random',
  body_temperature_c DECIMAL(4,1) NULL,
  notes TEXT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX vitals_patient_idx (patient_id),
  INDEX vitals_meeting_idx (meeting_id),
  INDEX vitals_worker_idx (recorded_by_worker_id),
  INDEX vitals_recorded_at_idx (recorded_at)
);

CREATE TABLE IF NOT EXISTS patient_care_recommendations (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT NULL,
  meeting_id BIGINT NULL,
  doctor_worker_id BIGINT NULL,
  doctor_name VARCHAR(200) NOT NULL,
  doctor_specialty VARCHAR(100) NOT NULL DEFAULT 'Medicină de familie',
  primary_diagnosis VARCHAR(500) NOT NULL,
  action_steps JSON NOT NULL,
  warning_signs JSON NOT NULL,
  control_date DATE NULL,
  additional_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX rec_patient_idx (patient_id),
  INDEX rec_meeting_idx (meeting_id)
);

CREATE TABLE IF NOT EXISTS mediator_requests (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  county VARCHAR(100) NOT NULL,
  locality VARCHAR(200) NOT NULL,
  requester_name VARCHAR(200) NOT NULL,
  requester_phone VARCHAR(50) NOT NULL,
  beneficiary_name VARCHAR(200) NULL,
  help_category VARCHAR(100) NOT NULL,
  notes TEXT NULL,
  status ENUM('pending', 'assigned', 'resolved') NOT NULL DEFAULT 'pending',
  tracking_code VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX med_req_county_idx (county),
  INDEX med_req_code_idx (tracking_code)
);
