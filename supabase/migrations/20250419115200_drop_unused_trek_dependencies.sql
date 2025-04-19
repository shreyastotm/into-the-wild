-- Drop all unused trek dependencies that block cascade deletes

-- 1. Drop foreign key constraints (if not automatically dropped with table)
ALTER TABLE IF EXISTS public.registrations DROP CONSTRAINT IF EXISTS registrations_trek_id_fkey;
ALTER TABLE IF EXISTS public.expense_sharing DROP CONSTRAINT IF EXISTS expense_sharing_trek_id_fkey;
-- ALTER TABLE IF EXISTS public.roles_assignments DROP CONSTRAINT IF EXISTS roles_assignments_trek_id_fkey;
ALTER TABLE IF EXISTS public.logistics DROP CONSTRAINT IF EXISTS logistics_trek_id_fkey;
ALTER TABLE IF EXISTS public.user_expense_penalties DROP CONSTRAINT IF EXISTS user_expense_penalties_trek_id_fkey;

-- 2. Drop the tables themselves
DROP TABLE IF EXISTS public.registrations;
DROP TABLE IF EXISTS public.expense_sharing;
-- DROP TABLE IF EXISTS public.roles_assignments;
DROP TABLE IF EXISTS public.logistics;
DROP TABLE IF EXISTS public.user_expense_penalties;
