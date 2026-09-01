CREATE TABLE medical_help_requests (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX medical_help_requests_created_at_idx
  ON medical_help_requests (created_at DESC);
