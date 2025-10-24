-- FIX STORAGE BUCKETS
-- This will create all required storage buckets for the application

-- 1. Create trek_assets bucket (used for payment proofs and trek images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trek_assets', 'trek_assets', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Create payment-proofs bucket (private, for payment proofs)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false) 
ON CONFLICT (id) DO NOTHING;

-- 3. Create avatars bucket (public, for user avatars)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- 4. Create trek-images bucket (public, for trek images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trek-images', 'trek-images', true) 
ON CONFLICT (id) DO NOTHING;

-- 5. CREATE STORAGE POLICIES FOR trek_assets BUCKET

-- Public read access for trek_assets
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'trek_assets' );

-- Authenticated users can upload to trek_assets
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'trek_assets' );

-- Users can update their own files in trek_assets
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING ( bucket_id = 'trek_assets' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Users can delete their own files in trek_assets
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'trek_assets' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 6. CREATE STORAGE POLICIES FOR payment-proofs BUCKET (private)

-- Users can upload their own payment proofs
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
CREATE POLICY "Users can upload payment proofs" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( 
  bucket_id = 'payment-proofs' AND 
  auth.uid()::text = (storage.foldername(name))[1] 
);

-- Users can view their own payment proofs
DROP POLICY IF EXISTS "Users can view own payment proofs" ON storage.objects;
CREATE POLICY "Users can view own payment proofs" 
ON storage.objects FOR SELECT 
TO authenticated 
USING ( 
  bucket_id = 'payment-proofs' AND 
  auth.uid()::text = (storage.foldername(name))[1] 
);

-- Admins can view all payment proofs
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;
CREATE POLICY "Admins can view all payment proofs" 
ON storage.objects FOR SELECT 
TO authenticated 
USING ( 
  bucket_id = 'payment-proofs' AND 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);

-- 7. CREATE STORAGE POLICIES FOR avatars BUCKET (public)

-- Public read access for avatars
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Users can upload their own avatars
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( 
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] 
);

-- 8. CREATE STORAGE POLICIES FOR trek-images BUCKET (public)

-- Public read access for trek-images
DROP POLICY IF EXISTS "Public read trek-images" ON storage.objects;
CREATE POLICY "Public read trek-images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'trek-images' );

-- Authenticated users can upload trek images
DROP POLICY IF EXISTS "Authenticated upload trek-images" ON storage.objects;
CREATE POLICY "Authenticated upload trek-images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'trek-images' );

-- 9. VERIFY BUCKETS WERE CREATED

-- Check all buckets
SELECT id, name, public, created_at 
FROM storage.buckets 
ORDER BY created_at;

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
