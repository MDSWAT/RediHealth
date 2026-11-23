-- Add anonymous engagement (time on page, scroll depth) and UI tap/click metadata columns
-- to analytics_events for journey, dwell-time, and interaction insights in /panel/analytics.
-- No personal data, no IP addresses, and no form input values are ever stored.
ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS duration_ms INT NULL CHECK (duration_ms >= 0 AND duration_ms <= 3600000),
  ADD COLUMN IF NOT EXISTS scroll_depth SMALLINT NULL CHECK (scroll_depth >= 0 AND scroll_depth <= 100),
  ADD COLUMN IF NOT EXISTS target_key VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS target_label VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS target_kind VARCHAR(24) NULL;

CREATE INDEX IF NOT EXISTS analytics_events_event_path_idx
  ON analytics_events (event_name, path, created_at)
  WHERE event_name IS NOT NULL;
