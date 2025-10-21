-- Migration: Create image tags system for trek media
-- Context: India deployment; adds tagging functionality for better organization and filtering

-- 1) Image tags table for tag definitions
CREATE TABLE IF NOT EXISTS public.image_tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color code
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2) Image tag assignments table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.image_tag_assignments (
    id BIGSERIAL PRIMARY KEY,
    image_id BIGINT NOT NULL,
    image_type VARCHAR(20) NOT NULL CHECK (image_type IN ('official_image', 'official_video', 'user_image')),
    tag_id BIGINT NOT NULL REFERENCES public.image_tags(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(image_id, image_type, tag_id)
);

-- 3) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_image_tags_name ON public.image_tags(name);
CREATE INDEX IF NOT EXISTS idx_image_tag_assignments_image ON public.image_tag_assignments(image_id, image_type);
CREATE INDEX IF NOT EXISTS idx_image_tag_assignments_tag ON public.image_tag_assignments(tag_id);

-- 4) Comments for documentation
COMMENT ON TABLE public.image_tags IS 'Tag definitions for organizing trek media';
COMMENT ON TABLE public.image_tag_assignments IS 'Links images/videos to tags for categorization and filtering';
COMMENT ON COLUMN public.image_tag_assignments.image_type IS 'official_image, official_video, or user_image';

-- 5) RLS Policies for image_tags

-- Everyone can view tags (public read access for gallery filtering)
CREATE POLICY "Everyone can view image tags" ON public.image_tags
FOR SELECT USING (true);

-- Only admins can manage tags
CREATE POLICY "Admins can manage image tags" ON public.image_tags
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- 6) RLS Policies for image_tag_assignments

-- Everyone can view tag assignments (needed for gallery filtering)
CREATE POLICY "Everyone can view tag assignments" ON public.image_tag_assignments
FOR SELECT USING (true);

-- Users can assign tags to their own images
CREATE POLICY "Users can assign tags to own images" ON public.image_tag_assignments
FOR INSERT TO authenticated
WITH CHECK (
    (image_type = 'user_image' AND assigned_by = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- Users can update tag assignments for their own images
CREATE POLICY "Users can update own tag assignments" ON public.image_tag_assignments
FOR UPDATE TO authenticated
USING (
    (image_type = 'user_image' AND assigned_by = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- Users can delete tag assignments for their own images
CREATE POLICY "Users can delete own tag assignments" ON public.image_tag_assignments
FOR DELETE TO authenticated
USING (
    (image_type = 'user_image' AND assigned_by = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- 7) Enable RLS
ALTER TABLE public.image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_tag_assignments ENABLE ROW LEVEL SECURITY;

-- 8) Grant permissions
GRANT ALL ON TABLE public.image_tags TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.image_tag_assignments TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.image_tags_id_seq TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.image_tag_assignments_id_seq TO anon, authenticated, service_role;

-- 9) Function to get tags for a specific image
CREATE OR REPLACE FUNCTION public.get_image_tags(p_image_id BIGINT, p_image_type TEXT)
RETURNS TABLE(
    tag_id BIGINT,
    tag_name VARCHAR(50),
    tag_description TEXT,
    tag_color VARCHAR(7)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        it.id,
        it.name,
        it.description,
        it.color
    FROM public.image_tag_assignments ita
    JOIN public.image_tags it ON ita.tag_id = it.id
    WHERE ita.image_id = p_image_id
    AND ita.image_type = p_image_type
    ORDER BY it.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10) Function to assign tags to an image
CREATE OR REPLACE FUNCTION public.assign_image_tags(
    p_image_id BIGINT,
    p_image_type TEXT,
    p_tag_ids BIGINT[]
)
RETURNS TEXT AS $$
DECLARE
    tag_id BIGINT;
BEGIN
    -- Remove existing tag assignments for this image
    DELETE FROM public.image_tag_assignments
    WHERE image_id = p_image_id AND image_type = p_image_type;

    -- Add new tag assignments
    FOREACH tag_id IN ARRAY p_tag_ids
    LOOP
        INSERT INTO public.image_tag_assignments (image_id, image_type, tag_id, assigned_by)
        VALUES (p_image_id, p_image_type, tag_id, auth.uid());
    END LOOP;

    RETURN 'Tags assigned successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11) Function to get all available tags
CREATE OR REPLACE FUNCTION public.get_all_image_tags()
RETURNS TABLE(
    id BIGINT,
    name VARCHAR(50),
    description TEXT,
    color VARCHAR(7),
    usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        it.id,
        it.name,
        it.description,
        it.color,
        COUNT(ita.id) as usage_count
    FROM public.image_tags it
    LEFT JOIN public.image_tag_assignments ita ON it.id = ita.tag_id
    GROUP BY it.id, it.name, it.description, it.color
    ORDER BY usage_count DESC, it.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12) Function to search images by tags
CREATE OR REPLACE FUNCTION public.search_images_by_tags(p_tag_ids BIGINT[])
RETURNS TABLE(
    image_id BIGINT,
    image_type TEXT,
    image_url TEXT,
    trek_id INTEGER,
    trek_name TEXT,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN ita.image_type = 'official_image' THEN tei.id
            WHEN ita.image_type = 'official_video' THEN tev.id
            ELSE uti.id
        END as image_id,
        ita.image_type,
        CASE
            WHEN ita.image_type = 'official_image' THEN tei.image_url
            WHEN ita.image_type = 'official_video' THEN tev.video_url
            ELSE uti.image_url
        END as image_url,
        CASE
            WHEN ita.image_type IN ('official_image', 'official_video') THEN te.trek_id
            ELSE uti.trek_id
        END as trek_id,
        CASE
            WHEN ita.image_type IN ('official_image', 'official_video') THEN te.name
            ELSE te2.name
        END as trek_name,
        jsonb_agg(
            jsonb_build_object(
                'id', it.id,
                'name', it.name,
                'color', it.color
            )
        ) as tags
    FROM public.image_tag_assignments ita
    JOIN public.image_tags it ON ita.tag_id = it.id
    LEFT JOIN public.trek_event_images tei ON (
        ita.image_type = 'official_image' AND ita.image_id = tei.id
    )
    LEFT JOIN public.trek_event_videos tev ON (
        ita.image_type = 'official_video' AND ita.image_id = tev.id
    )
    LEFT JOIN public.user_trek_images uti ON (
        ita.image_type = 'user_image' AND ita.image_id = uti.id
    )
    LEFT JOIN public.trek_events te ON (
        (ita.image_type IN ('official_image', 'official_video') AND te.trek_id = COALESCE(tei.trek_id, tev.trek_id)) OR
        (ita.image_type = 'user_image' AND te.trek_id = uti.trek_id)
    )
    WHERE ita.tag_id = ANY(p_tag_ids)
    GROUP BY
        CASE
            WHEN ita.image_type = 'official_image' THEN tei.id
            WHEN ita.image_type = 'official_video' THEN tev.id
            ELSE uti.id
        END,
        ita.image_type,
        CASE
            WHEN ita.image_type = 'official_image' THEN tei.image_url
            WHEN ita.image_type = 'official_video' THEN tev.video_url
            ELSE uti.image_url
        END,
        CASE
            WHEN ita.image_type IN ('official_image', 'official_video') THEN te.trek_id
            ELSE uti.trek_id
        END,
        CASE
            WHEN ita.image_type IN ('official_image', 'official_video') THEN te.name
            ELSE te2.name
        END
    ORDER BY COUNT(*) DESC; -- Prioritize images with more matching tags
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13) Insert some default tags for common trekking scenarios
INSERT INTO public.image_tags (name, description, color) VALUES
('Landscape', 'Beautiful landscape and scenery shots', '#10B981'),
('Wildlife', 'Animals and wildlife photography', '#F59E0B'),
('Group', 'Group photos and team shots', '#3B82F6'),
('Summit', 'Summit and peak achievement photos', '#8B5CF6'),
('Camping', 'Camping and tent setups', '#EF4444'),
('Adventure', 'Action and adventure shots', '#EC4899'),
('Nature', 'Nature and environmental photography', '#06B6D4'),
('Food', 'Food and cooking during treks', '#84CC16')
ON CONFLICT (name) DO NOTHING;

-- 14) Verification query - check that tables were created correctly
SELECT
    n.nspname as schemaname,
    c.relname as tablename,
    a.attname,
    format_type(a.atttypid, a.atttypmod) as data_type,
    a.attnotnull as not_null
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname IN ('image_tags', 'image_tag_assignments')
AND n.nspname = 'public'
AND a.attnum > 0
ORDER BY c.relname, a.attnum;
