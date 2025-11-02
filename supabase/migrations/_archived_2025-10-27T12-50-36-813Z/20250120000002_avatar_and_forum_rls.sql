-- Avatar and Forum RLS Policies
-- Migration: 20250120000002_avatar_and_forum_rls.sql

BEGIN;

-- ==============================
--       AVATAR CATALOG RLS
-- ==============================

-- Enable RLS on avatar_catalog
ALTER TABLE public.avatar_catalog ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "avatar_catalog_read_active" ON public.avatar_catalog;
DROP POLICY IF EXISTS "avatar_catalog_admin_all" ON public.avatar_catalog;

-- Allow everyone to read active avatars
CREATE POLICY "avatar_catalog_read_active" ON public.avatar_catalog
  FOR SELECT USING (active = TRUE);

-- Only admins can modify avatar catalog (for now, we'll use service role or admin check)
-- In a real implementation, you'd add an admin check here
CREATE POLICY "avatar_catalog_admin_all" ON public.avatar_catalog
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- ==============================
--       USERS TABLE AVATAR RLS
-- ==============================

-- Enable RLS on users table if not already enabled
-- (Assuming it's already enabled from previous migrations)

-- Users can update their own profile including avatar_key
DROP POLICY IF EXISTS "user_own_profile_update" ON public.users;
CREATE POLICY "user_own_profile_update" ON public.users
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own profile (existing policy)
-- Users can insert their own profile (existing policy)

-- ==============================
--       FORUM CATEGORIES RLS
-- ==============================

-- Enable RLS on forum_categories
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "forum_categories_read_auth" ON public.forum_categories;
DROP POLICY IF EXISTS "forum_categories_admin_all" ON public.forum_categories;

-- Authenticated users can read all categories
CREATE POLICY "forum_categories_read_auth" ON public.forum_categories
  FOR SELECT TO authenticated USING (TRUE);

-- Only admins can modify categories
CREATE POLICY "forum_categories_admin_all" ON public.forum_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- ==============================
--       FORUM THREADS RLS
-- ==============================

-- Enable RLS on forum_threads
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "forum_threads_read_auth" ON public.forum_threads;
DROP POLICY IF EXISTS "forum_threads_insert_auth" ON public.forum_threads;
DROP POLICY IF EXISTS "forum_threads_update_own" ON public.forum_threads;
DROP POLICY IF EXISTS "forum_threads_admin_update" ON public.forum_threads;

-- Authenticated users can read all threads
CREATE POLICY "forum_threads_read_auth" ON public.forum_threads
  FOR SELECT TO authenticated USING (TRUE);

-- Users can create threads
CREATE POLICY "forum_threads_insert_auth" ON public.forum_threads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Users can update their own threads (for title editing)
CREATE POLICY "forum_threads_update_own" ON public.forum_threads
  FOR UPDATE TO authenticated USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Admins can update any thread (for pinning/locking)
CREATE POLICY "forum_threads_admin_update" ON public.forum_threads
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- ==============================
--       FORUM POSTS RLS
-- ==============================

-- Enable RLS on forum_posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "forum_posts_read_auth" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_insert_auth" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_update_own" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_delete_own" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_admin_all" ON public.forum_posts;

-- Authenticated users can read all non-deleted posts
CREATE POLICY "forum_posts_read_auth" ON public.forum_posts
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

-- Users can create posts
CREATE POLICY "forum_posts_insert_auth" ON public.forum_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts (for editing)
CREATE POLICY "forum_posts_update_own" ON public.forum_posts
  FOR UPDATE TO authenticated USING (auth.uid() = author_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = author_id AND deleted_at IS NULL);

-- Users can soft-delete their own posts
CREATE POLICY "forum_posts_delete_own" ON public.forum_posts
  FOR UPDATE TO authenticated USING (auth.uid() = author_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = author_id);

-- Admins can moderate posts
CREATE POLICY "forum_posts_admin_all" ON public.forum_posts
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

COMMIT;
