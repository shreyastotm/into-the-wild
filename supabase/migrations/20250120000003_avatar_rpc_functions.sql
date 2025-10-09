-- Avatar RPC Functions
-- Migration: 20250120000003_avatar_rpc_functions.sql

BEGIN;

-- ==============================
--       RPC FUNCTIONS
-- ==============================

-- Set curated avatar safely
CREATE OR REPLACE FUNCTION public.set_user_avatar(p_avatar_key TEXT)
RETURNS public.users AS $$
DECLARE v_user public.users;
BEGIN
  UPDATE public.users u
    SET avatar_key = p_avatar_key, updated_at = now()
    WHERE u.user_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.avatar_catalog a WHERE a.key = p_avatar_key AND a.active AND a.category IN ('animal', 'bird', 'insect'))
  RETURNING * INTO v_user;
  RETURN v_user;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get avatar catalog for frontend
CREATE OR REPLACE FUNCTION public.get_avatar_catalog()
RETURNS TABLE(
  key TEXT,
  name TEXT,
  category TEXT,
  image_url TEXT,
  sort_order INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.key,
    ac.name,
    ac.category,
    ac.image_url,
    ac.sort_order
  FROM public.avatar_catalog ac
  WHERE ac.active = TRUE AND ac.category IN ('animal', 'bird', 'insect')
  ORDER BY ac.category, ac.sort_order, ac.name;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================
--       FORUM RPC FUNCTIONS
-- ==============================

-- Create forum category (admin only)
CREATE OR REPLACE FUNCTION public.create_forum_category(
  p_name TEXT,
  p_slug TEXT,
  p_description TEXT DEFAULT NULL,
  p_sort_order INT DEFAULT 0
)
RETURNS public.forum_categories AS $$
DECLARE v_category public.forum_categories;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  INSERT INTO public.forum_categories (name, slug, description, sort_order)
  VALUES (p_name, p_slug, p_description, p_sort_order)
  RETURNING * INTO v_category;

  RETURN v_category;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update forum category (admin only)
CREATE OR REPLACE FUNCTION public.update_forum_category(
  p_id BIGINT,
  p_name TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_sort_order INT DEFAULT NULL
)
RETURNS public.forum_categories AS $$
DECLARE v_category public.forum_categories;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  UPDATE public.forum_categories
  SET
    name = COALESCE(p_name, name),
    slug = COALESCE(p_slug, slug),
    description = COALESCE(p_description, description),
    sort_order = COALESCE(p_sort_order, sort_order)
  WHERE id = p_id
  RETURNING * INTO v_category;

  RETURN v_category;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete forum category (admin only)
CREATE OR REPLACE FUNCTION public.delete_forum_category(p_id BIGINT)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  DELETE FROM public.forum_categories WHERE id = p_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toggle thread pin/lock (admin only)
CREATE OR REPLACE FUNCTION public.toggle_thread_pin(p_thread_id BIGINT, p_pin BOOLEAN DEFAULT TRUE)
RETURNS public.forum_threads AS $$
DECLARE v_thread public.forum_threads;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  UPDATE public.forum_threads
  SET pinned = p_pin, updated_at = now()
  WHERE id = p_thread_id
  RETURNING * INTO v_thread;

  RETURN v_thread;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.toggle_thread_lock(p_thread_id BIGINT, p_lock BOOLEAN DEFAULT TRUE)
RETURNS public.forum_threads AS $$
DECLARE v_thread public.forum_threads;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  UPDATE public.forum_threads
  SET locked = p_lock, updated_at = now()
  WHERE id = p_thread_id
  RETURNING * INTO v_thread;

  RETURN v_thread;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
