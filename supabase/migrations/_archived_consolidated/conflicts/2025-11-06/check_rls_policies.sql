-- Check current RLS policies for registration_id_proofs table
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
WHERE tablename = 'registration_id_proofs'
ORDER BY policyname;

-- Check storage bucket policies
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
WHERE tablename = 'objects' AND (qual LIKE '%id-proofs%' OR with_check LIKE '%id-proofs%')
ORDER BY policyname;

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'id-proofs';
