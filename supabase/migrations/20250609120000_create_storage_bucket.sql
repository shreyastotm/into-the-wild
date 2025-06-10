-- Create the 'trek_assets' storage bucket if it doesn't exist
-- This is idempotent, so it can be run multiple times without error.
INSERT INTO storage.buckets (id, name, public)
VALUES ('trek_assets', 'trek_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public access to all objects in the bucket
-- This is necessary for the application to be able to display images.
-- Note: You might want to tighten these policies in a production environment.
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'trek_assets' );

-- Allow authenticated users to upload to the bucket
-- This is necessary for features like uploading payment proofs.
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'trek_assets' ); 