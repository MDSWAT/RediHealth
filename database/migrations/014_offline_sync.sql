-- Apply to each country database. Receipts contain no clinical data.
-- Retain receipts so a retried offline creation cannot create a duplicate patient.
CREATE TABLE IF NOT EXISTS offline_sync_receipts (
  worker_id BIGINT NOT NULL,
  operation_id CHAR(36) NOT NULL,
  entity_id VARCHAR(64) NULL,
  revision CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (worker_id, operation_id)
);
