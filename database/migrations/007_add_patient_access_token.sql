ALTER TABLE patients
  ADD COLUMN access_token VARCHAR(64) NULL;

CREATE INDEX patients_access_token_idx ON patients (access_token);
