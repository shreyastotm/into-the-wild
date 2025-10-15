-- Create storage bucket for ID proofs
-- Run this directly in your Supabase SQL Editor

-- Create storage bucket for ID proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-proofs', 'id-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ID proofs
CREATE POLICY "Users can upload own ID proofs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'id-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own ID proofs" ON storage.objects FOR SELECT USING (
  bucket_id = 'id-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all ID proofs" ON storage.objects FOR SELECT USING (
  bucket_id = 'id-proofs' AND
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
);
