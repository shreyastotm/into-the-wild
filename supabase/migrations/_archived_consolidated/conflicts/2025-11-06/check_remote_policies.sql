-- Check current RLS policies on remote database
-- This will help identify what's actually applied vs what we expect

-- Check registration_id_proofs policies
SELECT
    'registration_id_proofs' as table_name,
    schemaname,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'registration_id_proofs'
ORDER BY policyname;

-- Check storage objects policies for id-proofs
SELECT
    'storage.objects' as table_name,
    schemaname,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects' AND (qual LIKE '%id-proofs%' OR with_check LIKE '%id-proofs%')
ORDER BY policyname;

-- Check if spatial_ref_sys has RLS
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'spatial_ref_sys';

-- Check current user context
SELECT
    auth.uid() as current_auth_uid,
    auth.jwt() ->> 'email' as current_user_email,
    auth.jwt() ->> 'user_metadata' as user_metadata;
