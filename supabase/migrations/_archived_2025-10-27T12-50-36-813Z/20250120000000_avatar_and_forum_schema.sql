-- Avatar Presets and Forum POC Schema
-- Migration: 20250120000000_avatar_and_forum_schema.sql

BEGIN;

-- ==============================
--       ENUMS
-- ==============================

-- Note: Using TEXT with CHECK constraint instead of enum for category field

-- ==============================
--       TABLES
-- ==============================

-- Curated preset avatars
CREATE TABLE IF NOT EXISTS public.avatar_catalog (
  key TEXT PRIMARY KEY,            -- e.g., "red_panda"
  name TEXT NOT NULL,              -- Human label
  category TEXT NOT NULL CHECK (category IN ('animal', 'bird', 'insect')),
  image_url TEXT NOT NULL,         -- hosted under /public/avatars/* or CDN
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all required columns exist (for cases where table exists but columns are missing)
DO $$
BEGIN
  -- Add category column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avatar_catalog' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.avatar_catalog ADD COLUMN category TEXT NOT NULL DEFAULT 'animal' CHECK (category IN ('animal', 'bird', 'insect'));
  END IF;

  -- Add active column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avatar_catalog' AND column_name = 'active'
  ) THEN
    ALTER TABLE public.avatar_catalog ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;

  -- Add sort_order column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avatar_catalog' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.avatar_catalog ADD COLUMN sort_order INT DEFAULT 0;
  END IF;

  -- Add created_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avatar_catalog' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.avatar_catalog ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

COMMENT ON TABLE public.avatar_catalog IS 'Curated avatar presets for users (animals, birds, insects only)';

-- Ensure forum tables have all required columns
DO $$
BEGIN
  -- Forum categories columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'sort_order') THEN
    ALTER TABLE public.forum_categories ADD COLUMN sort_order INT DEFAULT 0;
  END IF;

  -- Forum threads columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_threads' AND column_name = 'locked') THEN
    ALTER TABLE public.forum_threads ADD COLUMN locked BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_threads' AND column_name = 'pinned') THEN
    ALTER TABLE public.forum_threads ADD COLUMN pinned BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_threads' AND column_name = 'updated_at') THEN
    ALTER TABLE public.forum_threads ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;

  -- Forum posts columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_posts' AND column_name = 'updated_at') THEN
    ALTER TABLE public.forum_posts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_posts' AND column_name = 'deleted_at') THEN
    ALTER TABLE public.forum_posts ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Forum categories
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.forum_categories IS 'Forum categories for organizing threads';

-- Forum threads
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  locked BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.forum_threads IS 'Forum threads/discussions';

-- Forum posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.forum_posts IS 'Posts within forum threads';

-- Note: Indexes will be created in a separate migration after all tables and constraints are established

COMMIT;
