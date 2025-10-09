-- Forum Rate Limiting and Content Moderation
-- Migration: 20250120000005_forum_rate_limiting.sql

BEGIN;

-- ==============================
--       RATE LIMITING
-- ==============================

-- Table to track user actions for rate limiting
CREATE TABLE IF NOT EXISTS public.user_actions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'forum_post', 'forum_thread'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_user_actions_user_type_created ON public.user_actions(user_id, action_type, created_at DESC);

-- Function to check and enforce rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_limit_per_hour INT DEFAULT 10,
  p_window_minutes INT DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  action_count INT;
  window_start TIMESTAMPTZ;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;

  SELECT COUNT(*) INTO action_count
  FROM public.user_actions
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at >= window_start;

  RETURN action_count < p_limit_per_hour;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record user action
CREATE OR REPLACE FUNCTION public.record_user_action(
  p_user_id UUID,
  p_action_type TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_actions (user_id, action_type)
  VALUES (p_user_id, p_action_type);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================
--       UPDATED FORUM FUNCTIONS WITH RATE LIMITING
-- ==============================

-- Create forum thread with rate limiting
CREATE OR REPLACE FUNCTION public.create_forum_thread(
  p_category_id BIGINT,
  p_title TEXT,
  p_content TEXT DEFAULT NULL
)
RETURNS public.forum_threads AS $$
DECLARE
  v_thread public.forum_threads;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  -- Check if user exists and is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check rate limit for thread creation (max 5 threads per hour)
  IF NOT public.check_rate_limit(v_user_id, 'forum_thread', 5, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded. You can create up to 5 threads per hour.';
  END IF;

  -- Validate category exists and user has access
  IF NOT EXISTS (
    SELECT 1 FROM public.forum_categories fc
    WHERE fc.id = p_category_id
  ) THEN
    RAISE EXCEPTION 'Invalid category';
  END IF;

  -- Create the thread
  INSERT INTO public.forum_threads (category_id, author_id, title)
  VALUES (p_category_id, v_user_id, p_title)
  RETURNING * INTO v_thread;

  -- Record the action
  PERFORM public.record_user_action(v_user_id, 'forum_thread');

  -- Create first post if content provided
  IF p_content IS NOT NULL AND p_content != '' THEN
    -- Check rate limit for posting (max 20 posts per hour)
    IF NOT public.check_rate_limit(v_user_id, 'forum_post', 20, 60) THEN
      RAISE EXCEPTION 'Rate limit exceeded. You can create up to 20 posts per hour.';
    END IF;

    INSERT INTO public.forum_posts (thread_id, author_id, content)
    VALUES (v_thread.id, v_user_id, p_content);

    -- Record the post action
    PERFORM public.record_user_action(v_user_id, 'forum_post');
  END IF;

  RETURN v_thread;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create forum post with rate limiting
CREATE OR REPLACE FUNCTION public.create_forum_post(
  p_thread_id BIGINT,
  p_content TEXT
)
RETURNS public.forum_posts AS $$
DECLARE
  v_post public.forum_posts;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  -- Check if user exists and is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if thread exists and is not locked
  IF NOT EXISTS (
    SELECT 1 FROM public.forum_threads ft
    WHERE ft.id = p_thread_id AND NOT ft.locked
  ) THEN
    RAISE EXCEPTION 'Thread not found or locked';
  END IF;

  -- Check rate limit for posting (max 20 posts per hour)
  IF NOT public.check_rate_limit(v_user_id, 'forum_post', 20, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded. You can create up to 20 posts per hour.';
  END IF;

  -- Create the post
  INSERT INTO public.forum_posts (thread_id, author_id, content)
  VALUES (p_thread_id, v_user_id, p_content)
  RETURNING * INTO v_post;

  -- Record the action
  PERFORM public.record_user_action(v_user_id, 'forum_post');

  RETURN v_post;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================
--       CONTENT MODERATION FUNCTIONS
-- ==============================

-- Admin function to delete posts
CREATE OR REPLACE FUNCTION public.admin_delete_post(p_post_id BIGINT, p_reason TEXT DEFAULT 'Violation of community guidelines')
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Soft delete the post
  UPDATE public.forum_posts
  SET deleted_at = now()
  WHERE id = p_post_id;

  -- Log the moderation action (could be extended to a moderation_log table)
  RAISE NOTICE 'Post % deleted by admin % for reason: %', p_post_id, auth.uid(), p_reason;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin function to delete threads (and all posts)
CREATE OR REPLACE FUNCTION public.admin_delete_thread(p_thread_id BIGINT, p_reason TEXT DEFAULT 'Violation of community guidelines')
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Delete all posts in the thread first
  UPDATE public.forum_posts
  SET deleted_at = now()
  WHERE thread_id = p_thread_id;

  -- Delete the thread
  DELETE FROM public.forum_threads WHERE id = p_thread_id;

  -- Log the moderation action
  RAISE NOTICE 'Thread % and all posts deleted by admin % for reason: %', p_thread_id, auth.uid(), p_reason;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================
--       CLEANUP OLD RATE LIMIT DATA
-- ==============================

-- Function to clean up old rate limit data (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_data()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_actions
  WHERE created_at < now() - INTERVAL '24 hours';
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
