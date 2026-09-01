CREATE TABLE IF NOT EXISTS patients (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL,
  date_of_birth VARCHAR(50) NULL,
  gender VARCHAR(50) NULL,
  address VARCHAR(500) NULL,
  condition_notes TEXT NULL,
  medical_history TEXT NULL,
  status ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX patients_created_at_idx (created_at DESC),
  INDEX patients_email_idx (email)
);
