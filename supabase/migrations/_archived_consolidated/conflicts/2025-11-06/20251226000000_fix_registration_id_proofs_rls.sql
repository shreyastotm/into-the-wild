BEGIN;

-- Fix ID proof upload RLS policy for registration_id_proofs
-- The issue is that users need to be able to insert ID proofs for registrations they own

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON public.registration_id_proofs;

-- Create corrected policy that ensures users can only upload for their own registrations
CREATE POLICY "Users can upload own ID proofs" ON public.registration_id_proofs FOR INSERT WITH CHECK (
  auth.uid()::text = uploaded_by
  AND registration_id IN (
    SELECT registration_id
    FROM public.trek_registrations
    WHERE user_id = auth.uid()
  )
);

-- Also ensure the policy allows users to view their own ID proofs
DROP POLICY IF EXISTS "Users can view own ID proofs" ON public.registration_id_proofs;
CREATE POLICY "Users can view own ID proofs" ON public.registration_id_proofs FOR SELECT USING (
  auth.uid()::text = uploaded_by OR
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
);

COMMIT;
