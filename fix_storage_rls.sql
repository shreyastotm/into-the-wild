-- Fix storage bucket policies for ID proof uploads
-- Run this directly in Supabase SQL Editor or via psql

BEGIN;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own ID proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all ID proofs" ON storage.objects;

-- Create corrected storage policies with proper authentication
CREATE POLICY "Users can upload own ID proofs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'id-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[1] IS NOT NULL
);

CREATE POLICY "Users can view own ID proofs" ON storage.objects FOR SELECT USING (
  bucket_id = 'id-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all ID proofs" ON storage.objects FOR SELECT USING (
  bucket_id = 'id-proofs'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Update bucket configuration if needed
UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10MB in bytes
    allowed_mime_types = ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ]
WHERE id = 'id-proofs';

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

COMMIT;
