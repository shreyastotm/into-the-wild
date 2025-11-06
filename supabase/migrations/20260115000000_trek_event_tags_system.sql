-- Migration: Trek Event Tags System
-- Description: Create tags system for trek events with Karnataka/Western Ghats context
-- Created: 2025-01-15

-- Create trek_event_tags table (master list of available tags)
CREATE TABLE IF NOT EXISTS public.trek_event_tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- hex color for badge display
    category VARCHAR(50), -- e.g., 'location', 'activity', 'difficulty', 'event_type'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(user_id) ON DELETE SET NULL
);

COMMENT ON TABLE public.trek_event_tags IS 'Master list of tags that can be assigned to trek events';

-- Create junction table for trek-tag relationships
CREATE TABLE IF NOT EXISTS public.trek_event_tag_assignments (
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES public.trek_event_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (trek_id, tag_id)
);

COMMENT ON TABLE public.trek_event_tag_assignments IS 'Many-to-many relationship between treks and tags';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_trek_event_tags_slug ON public.trek_event_tags(slug);
CREATE INDEX IF NOT EXISTS idx_trek_event_tags_category ON public.trek_event_tags(category);
CREATE INDEX IF NOT EXISTS idx_trek_event_tags_active ON public.trek_event_tags(is_active);
CREATE INDEX IF NOT EXISTS idx_trek_event_tag_assignments_trek ON public.trek_event_tag_assignments(trek_id);
CREATE INDEX IF NOT EXISTS idx_trek_event_tag_assignments_tag ON public.trek_event_tag_assignments(tag_id);

-- Enable RLS
ALTER TABLE public.trek_event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_event_tag_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trek_event_tags
CREATE POLICY "Everyone can view active tags" ON public.trek_event_tags
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tags" ON public.trek_event_tags
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.user_id = auth.uid()
            AND users.user_type = 'admin'
        )
    );

-- RLS Policies for trek_event_tag_assignments
CREATE POLICY "Everyone can view tag assignments" ON public.trek_event_tag_assignments
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage tag assignments" ON public.trek_event_tag_assignments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.user_id = auth.uid()
            AND users.user_type = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.trek_event_tags TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.trek_event_tag_assignments TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.trek_event_tags_id_seq TO anon, authenticated, service_role;

-- Seed initial tags for Karnataka/Western Ghats context
INSERT INTO public.trek_event_tags (name, slug, description, color, category) VALUES
-- Location-based tags
('Western Ghats', 'western-ghats', 'Western Ghats mountain range', '#10B981', 'location'),
('Coorg', 'coorg', 'Coorg/Kodagu region', '#059669', 'location'),
('Chikmagalur', 'chikmagalur', 'Chikmagalur coffee hills', '#16A34A', 'location'),
('Kudremukh', 'kudremukh', 'Kudremukh peak and surrounding areas', '#15803D', 'location'),
('Gokarna', 'gokarna', 'Gokarna coastal region', '#2563EB', 'location'),
('Nandi Hills', 'nandi-hills', 'Nandi Hills near Bengaluru', '#0891B2', 'location'),
('Savandurga', 'savandurga', 'Savandurga monolith', '#7C2D12', 'location'),
('Anthargange', 'anthargange', 'Anthargange cave trek', '#92400E', 'location'),
('Skandagiri', 'skandagiri', 'Skandagiri sunrise trek', '#D97706', 'location'),
('Makalidurga', 'makalidurga', 'Makalidurga fort trek', '#EA580C', 'location'),

-- Activity-based tags
('Day Trek', 'day-trek', 'Single day trekking activity', '#3B82F6', 'activity'),
('Weekend Trek', 'weekend-trek', 'Multi-day weekend trek', '#6366F1', 'activity'),
('Camping', 'camping', 'Overnight camping experience', '#8B5CF6', 'activity'),
('Sunset View', 'sunset-view', 'Sunset viewing activity', '#EC4899', 'activity'),
('Sunrise Trek', 'sunrise-trek', 'Early morning sunrise trek', '#F59E0B', 'activity'),
('Coffee Plantation', 'coffee-plantation', 'Coffee plantation visit', '#10B981', 'activity'),
('Waterfall', 'waterfall', 'Waterfall exploration', '#06B6D4', 'activity'),
('Forest Trail', 'forest-trail', 'Forest trail walking', '#16A34A', 'activity'),
('Beach', 'beach', 'Beach activities', '#0EA5E9', 'activity'),

-- Event type tags
('Jam Yard', 'jam-yard', 'Jam Yard exclusive workshop/event', '#9333EA', 'event_type'),
('Stick Workshop', 'stick-workshop', 'Stick fighting/defense workshop', '#A855F7', 'event_type'),
('Parkour', 'parkour', 'Parkour training session', '#C084FC', 'event_type'),
('Breathwork', 'breathwork', 'Breathwork and meditation', '#E879F9', 'event_type'),
('Yoga', 'yoga', 'Yoga session', '#F0ABFC', 'event_type'),

-- Difficulty tags (complement difficulty field)
('Easy', 'easy', 'Easy difficulty level', '#10B981', 'difficulty'),
('Moderate', 'moderate', 'Moderate difficulty level', '#F59E0B', 'difficulty'),
('Hard', 'hard', 'Hard difficulty level', '#EF4444', 'difficulty'),

-- General tags
('Adventure', 'adventure', 'General adventure activity', '#6366F1', 'general'),
('Friends', 'friends', 'Friends-friendly activity', '#EC4899', 'general'),
('Nature', 'nature', 'Nature exploration', '#16A34A', 'general'),
('Photography', 'photography', 'Photography opportunities', '#7C2D12', 'general')
ON CONFLICT (slug) DO NOTHING;

-- Create function to get tags for a trek
CREATE OR REPLACE FUNCTION public.get_trek_tags(p_trek_id INTEGER)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR(100),
    slug VARCHAR(100),
    color VARCHAR(7),
    category VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tet.id,
        tet.name,
        tet.slug,
        tet.color,
        tet.category
    FROM public.trek_event_tags tet
    INNER JOIN public.trek_event_tag_assignments teta ON tet.id = teta.tag_id
    WHERE teta.trek_id = p_trek_id
    AND tet.is_active = true
    ORDER BY tet.category, tet.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_trek_tags IS 'Get all active tags for a specific trek';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_trek_tags(INTEGER) TO anon, authenticated, service_role;

