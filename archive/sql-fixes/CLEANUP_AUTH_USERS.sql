-- CLEANUP AUTH USERS
-- This script will clean up the auth.users table, keeping only legitimate users
-- and ensuring they have corresponding records in public.users

-- First, let's see what we have
SELECT 'Current auth.users count:' as status;
SELECT COUNT(*) as auth_user_count FROM auth.users;

SELECT 'Current public.users count:' as status;
SELECT COUNT(*) as public_user_count FROM public.users;

-- Let's identify which auth users have corresponding public.users records
SELECT 'Auth users with public.users records:' as status;
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE WHEN pu.user_id IS NOT NULL THEN 'HAS_PUBLIC_RECORD' ELSE 'MISSING_PUBLIC_RECORD' END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.user_id
ORDER BY au.created_at;

-- Keep only these legitimate users (based on your requirements):
-- 1. shreyasmadhan82@gmail.com (admin)
-- 2. agarthaunderground@gmail.com (admin)
-- 3. charlyzion9@gmail.com (admin - from the data you showed)

-- Let's identify the users to keep
SELECT 'Users to keep:' as status;
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN (
    'shreyasmadhan82@gmail.com',
    'agarthaunderground@gmail.com', 
    'charlyzion9@gmail.com'
);

-- Now let's delete the test users (all others)
-- WARNING: This will permanently delete auth users and their data
-- Make sure you have backups if needed

-- Delete auth users that are NOT in the keep list
DELETE FROM auth.users 
WHERE email NOT IN (
    'shreyasmadhan82@gmail.com',
    'agarthaunderground@gmail.com', 
    'charlyzion9@gmail.com'
);

-- Verify the cleanup
SELECT 'After cleanup - auth.users count:' as status;
SELECT COUNT(*) as auth_user_count FROM auth.users;

SELECT 'After cleanup - remaining users:' as status;
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Now let's ensure the remaining users have proper public.users records
-- This will create/update the public.users records for the remaining auth users
INSERT INTO public.users (
    user_id,
    email,
    full_name,
    name,
    user_type,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        'Admin User'
    ),
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        'Admin User'
    ),
    COALESCE(
        (au.raw_user_meta_data->>'user_type')::public.user_type_enum,
        'admin'
    ),
    true,
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM public.users WHERE user_id IS NOT NULL)
ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    name = EXCLUDED.name,
    user_type = EXCLUDED.user_type,
    is_verified = EXCLUDED.is_verified,
    updated_at = EXCLUDED.updated_at;

-- Final verification
SELECT 'Final verification - public.users count:' as status;
SELECT COUNT(*) as public_user_count FROM public.users;

SELECT 'Final verification - all users:' as status;
SELECT 
    pu.user_id,
    pu.email,
    pu.full_name,
    pu.user_type,
    au.created_at as auth_created_at
FROM public.users pu
LEFT JOIN auth.users au ON pu.user_id = au.id
ORDER BY au.created_at;
