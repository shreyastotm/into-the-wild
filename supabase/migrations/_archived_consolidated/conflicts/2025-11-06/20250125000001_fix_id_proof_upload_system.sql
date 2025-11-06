-- Fix ID proof upload system - storage and database RLS policies
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Create the id-proofs storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-proofs', 'id-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing storage policies for id-proofs bucket (if any)
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own ID proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all ID proofs" ON storage.objects;

-- 3. Create correct storage policies for ID proofs
-- Allow users to upload files to their own folder (id-proofs/{user_id}/filename)
CREATE POLICY "Users can upload own ID proofs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'id-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own uploaded files
CREATE POLICY "Users can view own ID proofs" ON storage.objects FOR SELECT USING (
  bucket_id = 'id-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all ID proof files
CREATE POLICY "Admins can view all ID proofs" ON storage.objects FOR SELECT USING (
  bucket_id = 'id-proofs' AND
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
);

-- 4. Ensure RLS is enabled on registration_id_proofs table
ALTER TABLE public.registration_id_proofs ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing RLS policies for registration_id_proofs (if any)
DROP POLICY IF EXISTS "Users can view own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Admins can verify ID proofs" ON public.registration_id_proofs;

-- 6. Create correct RLS policies for registration_id_proofs table
-- Users can read their own ID proofs, admins can read all
CREATE POLICY "Users can view own ID proofs" ON public.registration_id_proofs FOR SELECT USING (
  auth.uid()::text = uploaded_by OR
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
);

-- Users can upload their own ID proofs
CREATE POLICY "Users can upload own ID proofs" ON public.registration_id_proofs FOR INSERT WITH CHECK (
  auth.uid()::text = uploaded_by
);

-- Admins can verify/update ID proofs
CREATE POLICY "Admins can verify ID proofs" ON public.registration_id_proofs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
);

-- 7. Ensure proper grants are in place
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.id_types TO anon, authenticated;
GRANT SELECT ON public.trek_id_requirements TO anon, authenticated;
GRANT SELECT, INSERT ON public.registration_id_proofs TO authenticated;
GRANT UPDATE ON public.registration_id_proofs TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_trek_required_id_types(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_approved_id_proofs(UUID, INTEGER) TO anon, authenticated;

COMMIT;

-- Verification queries (run these separately to check the setup)
-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'id-proofs';

-- Check RLS policies for registration_id_proofs
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

-- Check storage policies
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
WHERE tablename = 'objects' AND qual LIKE '%id-proofs%'
ORDER BY policyname;
