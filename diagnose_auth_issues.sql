-- Comprehensive diagnosis of authentication issues
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check if the handle_new_user function exists and its definition
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'handle_new_user';

-- 2. Check if the trigger exists on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
OR event_object_table = 'users';

-- 3. Check the users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check for NOT NULL constraints that might be causing issues
SELECT 
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.columns c
WHERE c.table_name = 'users' 
AND c.table_schema = 'public'
AND c.is_nullable = 'NO'
AND c.column_default IS NULL
ORDER BY c.ordinal_position;

-- 5. Test if we can manually insert a user (to see which constraint fails)
-- This is just a SELECT to show what would be inserted
SELECT 
    'test-user-id-123'::uuid as user_id,
    'test@example.com' as email,
    'Test User' as full_name,
    'community'::public.subscription_type as subscription_type,
    'active'::public.subscription_renewal_status as subscription_status,
    true as is_verified,
    NOW() as created_at,
    NOW() as updated_at;
