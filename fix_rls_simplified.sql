-- Simplified RLS policy fix for ID proof uploads
-- This is a more permissive version for testing

BEGIN;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can view own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Admins can verify ID proofs" ON public.registration_id_proofs;

-- Create simplified policies for testing (more flexible)
CREATE POLICY "Users can manage own ID proofs" ON public.registration_id_proofs FOR ALL USING (
  auth.uid()::text = uploaded_by OR
  auth.uid() = uploaded_by::uuid
);

CREATE POLICY "Admins can manage all ID proofs" ON public.registration_id_proofs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Also simplify storage policies
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own ID proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all ID proofs" ON storage.objects;

CREATE POLICY "Users can manage own ID proofs storage" ON storage.objects FOR ALL USING (
  bucket_id = 'id-proofs'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR
       auth.uid() = (storage.foldername(name))[1]::uuid)
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
