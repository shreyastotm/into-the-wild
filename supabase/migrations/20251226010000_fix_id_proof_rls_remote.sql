BEGIN;

-- Fix ID proof upload RLS policies for remote database
-- This migration ensures users can upload ID proofs for their own registrations

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can manage own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can view own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Admins can manage all ID proofs" ON public.registration_id_proofs;

-- Create corrected INSERT policy (most important for uploads)
CREATE POLICY "Users can upload own ID proofs" ON public.registration_id_proofs FOR INSERT WITH CHECK (
  auth.uid()::text = uploaded_by
  AND registration_id IN (
    SELECT registration_id
    FROM public.trek_registrations
    WHERE user_id = auth.uid()
  )
);

-- Create SELECT policy for viewing
CREATE POLICY "Users can view own ID proofs" ON public.registration_id_proofs FOR SELECT USING (
  auth.uid()::text = uploaded_by OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Create UPDATE policy for admins
CREATE POLICY "Admins can manage all ID proofs" ON public.registration_id_proofs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Also fix storage policies if needed
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

COMMIT;
