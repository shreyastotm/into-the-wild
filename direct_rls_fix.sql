-- DIRECT RLS FIX for ID Proof Upload Issues
-- Run this in Supabase Dashboard → SQL Editor → Your Project

BEGIN;

-- 1. Fix the registration_id_proofs table policies
DROP POLICY IF EXISTS "Users can manage own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can view own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Admins can manage all ID proofs" ON public.registration_id_proofs;

-- Create the most permissive policy first for testing
CREATE POLICY "Users can upload own ID proofs" ON public.registration_id_proofs FOR INSERT WITH CHECK (
  auth.uid()::text = uploaded_by
  AND registration_id IN (
    SELECT registration_id
    FROM public.trek_registrations
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view own ID proofs" ON public.registration_id_proofs FOR SELECT USING (
  auth.uid()::text = uploaded_by OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can manage all ID proofs" ON public.registration_id_proofs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  )
);

-- 2. Fix the storage policies
DROP POLICY IF EXISTS "Users can manage own ID proofs storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own ID proofs storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own ID proofs storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all ID proofs storage" ON storage.objects;

CREATE POLICY "Users can upload own ID proofs storage" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'id-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own ID proofs storage" ON storage.objects FOR SELECT USING (
  bucket_id = 'id-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all ID proofs storage" ON storage.objects FOR ALL USING (
  bucket_id = 'id-proofs'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  )
);

-- 3. Fix the spatial_ref_sys security vulnerability
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spatial_ref_sys') THEN
        ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Only admins can access spatial_ref_sys" ON public.spatial_ref_sys;
        CREATE POLICY "Only admins can access spatial_ref_sys" ON public.spatial_ref_sys FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = auth.uid()
            AND user_type = 'admin'
          )
        );
    END IF;
END $$;

COMMIT;

-- Verification queries (run these separately)
-- Check policies
SELECT
    'registration_id_proofs' as table_name,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'registration_id_proofs'
ORDER BY policyname;

-- Check storage policies
SELECT
    'storage.objects' as table_name,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects' AND qual LIKE '%id-proofs%'
ORDER BY policyname;
