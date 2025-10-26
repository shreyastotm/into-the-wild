-- Fix ID proof upload RLS policy for registration_id_proofs
-- Run this directly in Supabase SQL Editor or via psql

BEGIN;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can view own ID proofs" ON public.registration_id_proofs;

-- Create corrected INSERT policy that ensures users can only upload for their own registrations
CREATE POLICY "Users can upload own ID proofs" ON public.registration_id_proofs FOR INSERT WITH CHECK (
  auth.uid()::text = uploaded_by
  AND registration_id IN (
    SELECT registration_id
    FROM public.trek_registrations
    WHERE user_id = auth.uid()
  )
);

-- Create corrected SELECT policy
CREATE POLICY "Users can view own ID proofs" ON public.registration_id_proofs FOR SELECT USING (
  auth.uid()::text = uploaded_by OR
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
);

COMMIT;
