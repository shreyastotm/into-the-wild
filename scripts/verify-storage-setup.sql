-- Verification script for trek-assets storage bucket setup
-- Run this in Supabase SQL Editor to verify bucket and policies exist

-- 1. Check if trek-assets bucket exists
SELECT 
    id,
    name,
    public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id = 'trek-assets';

-- 2. List all storage buckets (for reference)
SELECT 
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets
ORDER BY id;

-- 3. Check storage policies for trek-assets bucket
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
WHERE tablename = 'objects'
  AND (
    qual::text LIKE '%trek-assets%' 
    OR with_check::text LIKE '%trek-assets%'
    OR policyname LIKE '%trek-assets%'
  )
ORDER BY policyname;

-- 4. Verify RLS is enabled on trek_event_images table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'trek_event_images';

-- 5. Check RLS policies on trek_event_images table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'trek_event_images'
ORDER BY policyname;

-- 6. Count images in trek_event_images table
SELECT 
    COUNT(*) as total_images,
    COUNT(DISTINCT trek_id) as treks_with_images,
    COUNT(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 END) as empty_urls
FROM public.trek_event_images;

-- 7. Sample image URLs to verify format
SELECT 
    trek_id,
    position,
    CASE 
        WHEN image_url LIKE 'http%' THEN 'Full URL'
        WHEN image_url LIKE 'treks/%' THEN 'Storage Path (treks/)'
        WHEN image_url LIKE 'trek-assets/%' THEN 'Storage Path (trek-assets/)'
        WHEN image_url LIKE 'trek-images/%' THEN 'Storage Path (trek-images/) - NEEDS MIGRATION'
        ELSE 'Unknown Format'
    END as url_format,
    LEFT(image_url, 80) as url_preview
FROM public.trek_event_images
ORDER BY trek_id, position
LIMIT 20;

-- Expected Results:
-- 1. trek-assets bucket should exist with public = true
-- 2. Storage policies should exist for SELECT, INSERT, UPDATE, DELETE
-- 3. trek_event_images table should have RLS enabled
-- 4. RLS policy "Everyone can view trek event images" should exist
-- 5. Image URLs should be in format: Full URL or Storage Path (treks/)

