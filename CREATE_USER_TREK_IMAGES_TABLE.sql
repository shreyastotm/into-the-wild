-- Migration: Create user_trek_images table for user photo contributions
-- Context: India deployment; allows users to contribute photos with admin moderation
-- This enables the hybrid approach for trek image management

-- 1) User-contributed images table with moderation
CREATE TABLE IF NOT EXISTS public.user_trek_images (
    id BIGSERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT
);

-- 2) Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_trek_images_status ON public.user_trek_images(status);
CREATE INDEX IF NOT EXISTS idx_user_trek_images_trek_id ON public.user_trek_images(trek_id);
CREATE INDEX IF NOT EXISTS idx_user_trek_images_uploaded_by ON public.user_trek_images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_user_trek_images_created_at ON public.user_trek_images(created_at DESC);

-- 3) Comments for documentation
COMMENT ON TABLE public.user_trek_images IS 'User-contributed images for treks with admin moderation workflow';
COMMENT ON COLUMN public.user_trek_images.status IS 'pending: awaiting review, approved: shown in gallery, rejected: not shown';
COMMENT ON COLUMN public.user_trek_images.caption IS 'Optional user description of the image';
COMMENT ON COLUMN public.user_trek_images.rejection_reason IS 'Reason for rejection (for user feedback)';

-- 4) RLS Policies for security

-- Users can view approved images and their own pending/rejected images
CREATE POLICY "Users can view approved images and own contributions" ON public.user_trek_images
FOR SELECT TO authenticated
USING (
    status = 'approved' OR
    uploaded_by = auth.uid()
);

-- Users can insert their own images (pending status)
CREATE POLICY "Users can contribute images" ON public.user_trek_images
FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- Users can update their own pending images (e.g., change caption)
CREATE POLICY "Users can update own pending images" ON public.user_trek_images
FOR UPDATE TO authenticated
USING (uploaded_by = auth.uid() AND status = 'pending');

-- Users can delete their own pending images
CREATE POLICY "Users can delete own pending images" ON public.user_trek_images
FOR DELETE TO authenticated
USING (uploaded_by = auth.uid() AND status = 'pending');

-- Admins can view all images for moderation
CREATE POLICY "Admins can view all images for moderation" ON public.user_trek_images
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- Admins can update image status (approve/reject)
CREATE POLICY "Admins can moderate image status" ON public.user_trek_images
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- Admins can delete any image
CREATE POLICY "Admins can delete any image" ON public.user_trek_images
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- 5) Storage bucket policies (reuse existing trek-images bucket)
-- The existing trek-images bucket already has policies for authenticated uploads

-- 6) Function to promote user image to official trek_event_images
CREATE OR REPLACE FUNCTION public.promote_user_image_to_official(p_user_image_id BIGINT)
RETURNS TEXT AS $$
DECLARE
    user_img RECORD;
    position_available INTEGER;
BEGIN
    -- Get the user image details
    SELECT * INTO user_img
    FROM public.user_trek_images
    WHERE id = p_user_image_id AND status = 'approved';

    IF NOT FOUND THEN
        RETURN 'User image not found or not approved';
    END IF;

    -- Find next available position (1-3)
    SELECT COALESCE(MAX(position), 0) + 1 INTO position_available
    FROM public.trek_event_images
    WHERE trek_id = user_img.trek_id;

    IF position_available > 3 THEN
        RETURN 'Maximum of 3 official images already exists for this trek';
    END IF;

    -- Insert into official images table
    INSERT INTO public.trek_event_images (trek_id, image_url, position)
    VALUES (user_img.trek_id, user_img.image_url, position_available);

    RETURN 'Image promoted successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7) Function to get user contribution stats for a trek
CREATE OR REPLACE FUNCTION public.get_user_contribution_stats(p_trek_id INTEGER)
RETURNS TABLE(
    total_contributions BIGINT,
    pending_count BIGINT,
    approved_count BIGINT,
    rejected_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_contributions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
    FROM public.user_trek_images
    WHERE trek_id = p_trek_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8) Enable RLS
ALTER TABLE public.user_trek_images ENABLE ROW LEVEL SECURITY;

-- 9) Grant permissions
GRANT ALL ON TABLE public.user_trek_images TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.user_trek_images_id_seq TO anon, authenticated, service_role;

-- 10) Verification query - run this to check the table was created correctly
SELECT
    schemaname,
    tablename,
    attname,
    format_type(atttypid, atttypmod) as data_type,
    attnotnull as not_null,
    adsrc as default_value
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum
WHERE c.relname = 'user_trek_images'
AND n.nspname = 'public'
AND a.attnum > 0
ORDER BY a.attnum;
