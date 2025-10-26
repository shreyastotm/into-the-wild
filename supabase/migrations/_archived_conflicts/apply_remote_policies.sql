-- Apply RLS policies directly to remote database
-- This will fix the ID proof upload issues

BEGIN;

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can manage own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Admins can manage all ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can manage own ID proofs storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all ID proofs storage" ON storage.objects;

-- Create corrected database policy for registration_id_proofs
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

-- Create corrected storage policies
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

-- Fix the spatial_ref_sys security vulnerability
-- First check if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spatial_ref_sys') THEN
        -- Enable RLS on spatial_ref_sys
        ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

        -- Create restrictive policy (only admins can access)
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
