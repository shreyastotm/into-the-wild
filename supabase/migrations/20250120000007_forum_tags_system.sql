-- Migration: Forum Tags System (Replace Categories with Tags)
-- Description: Create tags system for many-to-many relationship with threads

-- Create forum_tags table
CREATE TABLE IF NOT EXISTS public.forum_tags (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#6B7280', -- hex color for badge
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.forum_tags IS 'Tags for categorizing forum threads (many-to-many)';

-- Create junction table for thread-tag relationships
CREATE TABLE IF NOT EXISTS public.forum_thread_tags (
  thread_id BIGINT NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES public.forum_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (thread_id, tag_id)
);

COMMENT ON TABLE public.forum_thread_tags IS 'Junction table linking threads to tags';

-- Seed initial 25 nature & adventure tags
INSERT INTO public.forum_tags (name, slug, color, sort_order) VALUES
('Trek', 'trek', '#10B981', 1),
('Hike', 'hike', '#3B82F6', 2),
('Bird-watching', 'bird-watching', '#8B5CF6', 3),
('Road Trip', 'road-trip', '#F59E0B', 4),
('Camping', 'camping', '#EF4444', 5),
('Wildlife Safari', 'wildlife-safari', '#059669', 6),
('Mountain Climbing', 'mountain-climbing', '#7C3AED', 7),
('River Rafting', 'river-rafting', '#DC2626', 8),
('Beach Exploration', 'beach-exploration', '#2563EB', 9),
('Desert Trek', 'desert-trek', '#D97706', 10),
('Forest Bathing', 'forest-bathing', '#16A34A', 11),
('Photography', 'photography', '#7C2D12', 12),
('Star Gazing', 'star-gazing', '#4338CA', 13),
('Fishing', 'fishing', '#0891B2', 14),
('Cycling', 'cycling', '#CA8A04', 15),
('Horseback Riding', 'horseback-riding', '#BE123C', 16),
('Kayaking', 'kayaking', '#0369A1', 17),
('Rock Climbing', 'rock-climbing', '#7C3AED', 18),
('Meditation Retreat', 'meditation-retreat', '#059669', 19),
('Foraging', 'foraging', '#16A34A', 20),
('Geocaching', 'geocaching', '#DC2626', 21),
('Hot Air Balloon', 'hot-air-balloon', '#7C3AED', 22),
('Scuba Diving', 'scuba-diving', '#0891B2', 23),
('Archaeological', 'archaeological', '#D97706', 24),
('Eco-Tourism', 'eco-tourism', '#059669', 25)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_tags_slug ON public.forum_tags(slug);
CREATE INDEX IF NOT EXISTS idx_forum_tags_sort_order ON public.forum_tags(sort_order);
CREATE INDEX IF NOT EXISTS idx_forum_thread_tags_thread_id ON public.forum_thread_tags(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_thread_tags_tag_id ON public.forum_thread_tags(tag_id);

-- Enable RLS
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_thread_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_tags (read-only for all, admin can modify)
DROP POLICY IF EXISTS "forum_tags_read_all" ON public.forum_tags;
DROP POLICY IF EXISTS "forum_tags_admin_all" ON public.forum_tags;

CREATE POLICY "forum_tags_read_all" ON public.forum_tags 
  FOR SELECT 
  USING (true);

CREATE POLICY "forum_tags_admin_all" ON public.forum_tags 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
  );

-- RLS Policies for forum_thread_tags
DROP POLICY IF EXISTS "forum_thread_tags_read_all" ON public.forum_thread_tags;
DROP POLICY IF EXISTS "forum_thread_tags_insert_auth" ON public.forum_thread_tags;
DROP POLICY IF EXISTS "forum_thread_tags_delete_own" ON public.forum_thread_tags;
DROP POLICY IF EXISTS "forum_thread_tags_admin_all" ON public.forum_thread_tags;

CREATE POLICY "forum_thread_tags_read_all" ON public.forum_thread_tags 
  FOR SELECT 
  USING (true);

CREATE POLICY "forum_thread_tags_insert_auth" ON public.forum_thread_tags 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "forum_thread_tags_delete_own" ON public.forum_thread_tags 
  FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.forum_threads ft WHERE ft.id = thread_id AND ft.author_id = auth.uid())
  );

CREATE POLICY "forum_thread_tags_admin_all" ON public.forum_thread_tags 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
  );

