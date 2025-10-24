-- TEMPORARY DISABLE RLS
-- This will temporarily disable RLS to test if that's causing the signup issue

-- Disable RLS temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Check current status
SELECT 'RLS disabled for testing' as status;
SELECT relrowsecurity FROM pg_class WHERE oid = 'public.users'::regclass;
