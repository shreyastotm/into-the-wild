-- Update existing RLS policies to be more flexible with user ID formats

BEGIN;

-- Update the database policy to handle different UUID formats
DROP POLICY "Users can manage own ID proofs" ON public.registration_id_proofs;
CREATE POLICY "Users can manage own ID proofs" ON public.registration_id_proofs FOR ALL USING (
  auth.uid()::text = uploaded_by OR
  auth.uid() = uploaded_by::uuid
) WITH CHECK (
  auth.uid()::text = uploaded_by OR
  auth.uid() = uploaded_by::uuid
);

-- Update the storage policy to handle different UUID formats
DROP POLICY "Users can manage own ID proofs storage" ON storage.objects;
CREATE POLICY "Users can manage own ID proofs storage" ON storage.objects FOR ALL USING (
  bucket_id = 'id-proofs'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR
       auth.uid() = (storage.foldername(name))[1]::uuid)
) WITH CHECK (
  bucket_id = 'id-proofs'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR
       auth.uid() = (storage.foldername(name))[1]::uuid)
);

COMMIT;
