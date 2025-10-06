-- DEBUG SIGNUP ISSUE
-- Let's check what's happening with the handle_new_user function

-- Check if the function exists and what it looks like
SELECT 'Function definition:' as status;
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if the trigger exists
SELECT 'Trigger check:' as status;
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';

-- Check current users count
SELECT 'Current users count:' as status;
SELECT COUNT(*) as auth_count FROM auth.users;
SELECT COUNT(*) as public_count FROM public.users;

-- Test the function manually (this will help us see what's wrong)
-- First, let's see what happens when we try to create a test user
SELECT 'Testing function logic:' as status;

-- Let's check if there are any constraints or issues
SELECT 'Table constraints:' as status;
SELECT conname, contype, confrelid::regclass as foreign_table
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- Check if there are any issues with the user_type_enum
SELECT 'User type enum values:' as status;
SELECT unnest(enum_range(NULL::public.user_type_enum)) as enum_values;
