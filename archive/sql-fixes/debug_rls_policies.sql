-- Debug script to check current RLS policies and identify recursion issues

-- Check all policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Check all policies on trek_registrations table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'trek_registrations'
ORDER BY policyname;

-- Check if there are any functions that might cause recursion
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%admin%'
OR routine_name LIKE '%user%';

-- Test the is_admin function directly
SELECT public.is_admin('00000000-0000-0000-0000-000000000000'::uuid) as test_admin;

-- Check if there are any circular dependencies in policies
-- Look for policies that reference the same table they're on
SELECT 
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies 
WHERE qual LIKE '%' || tablename || '%'
OR with_check LIKE '%' || tablename || '%';
