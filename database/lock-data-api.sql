-- Keeps the tables out of reach of PostgREST-style APIs (Supabase's Data API).
-- Run by "npm run migrate" after every run; safe to run again.
--
-- Supabase exposes the public schema over REST to anyone holding the publishable key (role "anon")
-- or a signed-in Supabase user (role "authenticated") unless tables are locked. RediHealth never
-- uses that API: the server connects as the table owner, which row-level security does not limit.
-- On a plain PostgreSQL server the two roles do not exist and only RLS is switched on.

DO $$
DECLARE
  item record;
  role_name text;
BEGIN
  FOR item IN
    SELECT c.oid::regclass AS name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', item.name);
  END LOOP;

  -- Functions are executable by PUBLIC by default; the owner (the app) keeps its access.
  REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', role_name);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', role_name);
      EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM %I', role_name);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', role_name);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', role_name);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I', role_name);
    END IF;
  END LOOP;
END $$;
