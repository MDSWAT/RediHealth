-- Fresh-install schema for RediHealth (PostgreSQL / Supabase).
-- Existing deployments should continue applying the numbered migrations.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS medical_help_requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(200),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'resolved', 'archived')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal', 'urgent')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS medical_help_requests_created_at_idx ON medical_help_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS medical_help_requests_status_idx ON medical_help_requests (status, created_at DESC);
DROP TRIGGER IF EXISTS medical_help_requests_set_updated_at ON medical_help_requests;
CREATE TRIGGER medical_help_requests_set_updated_at
  BEFORE UPDATE ON medical_help_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS workers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(100) NOT NULL DEFAULT 'Healthcare Worker',
  department VARCHAR(100),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS workers_email_idx ON workers (email);
DROP TRIGGER IF EXISTS workers_set_updated_at ON workers;
CREATE TRIGGER workers_set_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS patients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id BIGINT,
  assigned_worker_id BIGINT REFERENCES workers(id),
  access_token VARCHAR(64),
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL,
  date_of_birth VARCHAR(50),
  gender VARCHAR(50),
  address VARCHAR(500),
  condition_notes TEXT,
  medical_history TEXT,
  treatment_plan TEXT,
  followups TEXT,
  photos TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),
  priority TEXT NOT NULL DEFAULT 'moderate'
    CHECK (priority IN ('critical', 'high', 'moderate', 'low')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS patients_created_at_idx ON patients (created_at DESC);
CREATE INDEX IF NOT EXISTS patients_email_idx ON patients (email);
CREATE INDEX IF NOT EXISTS patients_priority_idx ON patients (priority);
CREATE INDEX IF NOT EXISTS patients_assigned_worker_id_idx ON patients (assigned_worker_id);
CREATE INDEX IF NOT EXISTS patients_access_token_idx ON patients (access_token);
DROP TRIGGER IF EXISTS patients_set_updated_at ON patients;
CREATE TRIGGER patients_set_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS mediator_cases (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mediator_worker_id BIGINT NOT NULL REFERENCES workers(id),
  county VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  address VARCHAR(500),
  care_category VARCHAR(100) NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'moderate'
    CHECK (urgency IN ('low', 'moderate', 'high', 'urgent')),
  barriers JSONB NOT NULL,
  target_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mediator_cases_worker_idx ON mediator_cases (mediator_worker_id);
CREATE INDEX IF NOT EXISTS mediator_cases_county_idx ON mediator_cases (county);
CREATE INDEX IF NOT EXISTS mediator_cases_target_date_idx ON mediator_cases (target_date);
DROP TRIGGER IF EXISTS mediator_cases_set_updated_at ON mediator_cases;
CREATE TRIGGER mediator_cases_set_updated_at
  BEFORE UPDATE ON mediator_cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
