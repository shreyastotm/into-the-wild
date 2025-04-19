-- Entire migration commented out as roles_assignments no longer exists.
-- Drop all dependent constraints and then drop roles_assignments

-- 1. Drop all foreign key constraints referencing roles_assignments
-- DO $$
-- DECLARE
--   r RECORD;
-- BEGIN
--   FOR r IN (
--     SELECT conname, conrelid::regclass AS tablename
--     FROM pg_constraint
--     WHERE confrelid = 'public.roles_assignments'::regclass
--   ) LOOP
--     EXECUTE 'ALTER TABLE ' || r.tablename || ' DROP CONSTRAINT ' || r.conname || ';';
--   END LOOP;
-- END $$;

-- 2. Drop the roles_assignments table
-- DROP TABLE IF EXISTS public.roles_assignments;
