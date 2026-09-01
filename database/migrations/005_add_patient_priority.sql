ALTER TABLE patients
  ADD COLUMN priority ENUM('critical', 'high', 'moderate', 'low') NOT NULL DEFAULT 'moderate';

CREATE INDEX patients_priority_idx ON patients (priority);
