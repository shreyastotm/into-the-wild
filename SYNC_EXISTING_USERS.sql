-- SYNC EXISTING USERS
-- This will create public.users records for all existing auth.users
-- without deleting anything

-- Create public.users records for all auth users that don't have them
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
        'User'
    ),
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        'User'
    ),
    COALESCE(
        (au.raw_user_meta_data->>'user_type')::public.user_type_enum,
        'trekker'
    ),
    COALESCE(au.email_confirmed_at IS NOT NULL, false),
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

-- Verify the sync
SELECT 'After sync - auth.users count:' as status;
SELECT COUNT(*) as auth_user_count FROM auth.users;

SELECT 'After sync - public.users count:' as status;
SELECT COUNT(*) as public_user_count FROM public.users;

SELECT 'All users now synced:' as status;
SELECT 
    pu.user_id,
    pu.email,
    pu.full_name,
    pu.user_type,
    au.created_at as auth_created_at
FROM public.users pu
LEFT JOIN auth.users au ON pu.user_id = au.id
ORDER BY au.created_at;
