-- Create Indexes for Performance
-- Migration: 20250120000006_create_indexes.sql

BEGIN;

-- ==============================
--       INDEXES
-- ==============================

-- Forum indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON public.forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON public.forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_pinned_created ON public.forum_threads(pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON public.forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON public.forum_posts(author_id);

-- Avatar catalog indexes
CREATE INDEX IF NOT EXISTS idx_avatar_catalog_category_active ON public.avatar_catalog(category, active);
CREATE INDEX IF NOT EXISTS idx_avatar_catalog_sort_order ON public.avatar_catalog(sort_order);
CREATE INDEX IF NOT EXISTS idx_avatar_catalog_category ON public.avatar_catalog(category);

-- Additional useful indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_updated_at ON public.forum_threads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at DESC);

COMMIT;
