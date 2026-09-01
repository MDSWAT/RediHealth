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