-- Migration: Fix trek-assets storage bucket and policies
-- Context: Standardize all trek image storage to trek-assets bucket
-- This ensures consistent image handling across the application

-- Create trek-assets bucket if it doesn't exist (public bucket for trek images and videos)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('trek-assets', 'trek-assets', true, true, 10485760, '{"image/*","video/*"}')
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  avif_autodetection = true,
  file_size_limit = 10485760,
  allowed_mime_types = '{"image/*","video/*"}';

-- Drop existing policies for trek-assets bucket if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read trek-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload trek-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin update trek-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete trek-assets" ON storage.objects;
-- Drop generic policy names that might exist for trek-assets (by name only, no WHERE clause)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Create storage policies for trek-assets bucket

-- Public read access (anyone can view images)
CREATE POLICY "Public read trek-assets" ON storage.objects
FOR SELECT USING (bucket_id = 'trek-assets');

-- Admin upload access (only admins can upload)
CREATE POLICY "Admin upload trek-assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'trek-assets' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND user_type::text = 'admin'
  )
);

-- Admin update access (only admins can update)
CREATE POLICY "Admin update trek-assets" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'trek-assets' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND user_type::text = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'trek-assets' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND user_type::text = 'admin'
  )
);

-- Admin delete access (only admins can delete)
CREATE POLICY "Admin delete trek-assets" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'trek-assets' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND user_type::text = 'admin'
  )
);

-- Verify bucket was created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'trek-assets') THEN
    RAISE EXCEPTION 'Failed to create trek-assets bucket';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read trek-assets'
  ) THEN
    RAISE EXCEPTION 'Failed to create storage policies for trek-assets';
  END IF;
END $$;

