-- Activity log audit table for administrator visibility.

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_worker_id BIGINT NULL,
  actor_name VARCHAR(200) NULL,
  actor_email VARCHAR(320) NULL,
  actor_role VARCHAR(120) NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(120) NOT NULL,
  entity_id VARCHAR(120) NULL,
  details_json LONGTEXT NULL,
  ip_address VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX activity_logs_created_at_idx (created_at),
  INDEX activity_logs_action_idx (action),
  INDEX activity_logs_entity_idx (entity_type, entity_id),
  INDEX activity_logs_actor_email_idx (actor_email),
  CONSTRAINT activity_logs_actor_worker_fk
    FOREIGN KEY (actor_worker_id) REFERENCES workers(id)
    ON DELETE SET NULL
);
