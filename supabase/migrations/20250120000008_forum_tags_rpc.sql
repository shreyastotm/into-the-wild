-- Migration: Forum Tags RPC Functions
-- Description: Update RPC functions to support tags instead of categories

-- Function to get all available tags
CREATE OR REPLACE FUNCTION public.get_forum_tags()
RETURNS TABLE (
  id BIGINT,
  name VARCHAR(50),
  slug VARCHAR(50),
  color VARCHAR(7),
  sort_order INT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, name, slug, color, sort_order
  FROM public.forum_tags
  ORDER BY sort_order ASC, name ASC;
$$;

-- Drop existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS public.create_forum_thread_with_tags(bigint,text,text,bigint[]);

-- Updated function to create forum thread with tags (fixed ambiguity)
CREATE FUNCTION public.create_forum_thread_with_tags(
  p_category_id BIGINT,
  p_title TEXT,
  p_content TEXT,
  p_tag_ids BIGINT[] DEFAULT ARRAY[]::BIGINT[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_thread_id BIGINT;
  v_post_id BIGINT;
  v_tag_id BIGINT;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check rate limit (5 threads per hour)
  IF NOT public.check_rate_limit(v_user_id, 'create_thread', 5, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before creating another thread.';
  END IF;

  -- Validate category exists
  IF NOT EXISTS (
    SELECT 1 FROM public.forum_categories fc
    WHERE fc.id = p_category_id
  ) THEN
    RAISE EXCEPTION 'Invalid category';
  END IF;

  -- Validate at least one tag is provided
  IF array_length(p_tag_ids, 1) IS NULL OR array_length(p_tag_ids, 1) = 0 THEN
    RAISE EXCEPTION 'At least one tag is required';
  END IF;

  -- Validate all tags exist
  IF EXISTS (
    SELECT 1 FROM unnest(p_tag_ids) AS tag_id
    WHERE NOT EXISTS (SELECT 1 FROM public.forum_tags WHERE id = tag_id)
  ) THEN
    RAISE EXCEPTION 'One or more invalid tags';
  END IF;

  -- Create thread
  INSERT INTO public.forum_threads (category_id, author_id, title)
  VALUES (p_category_id, v_user_id, p_title)
  RETURNING id INTO v_thread_id;

  -- Create initial post
  INSERT INTO public.forum_posts (thread_id, author_id, content)
  VALUES (v_thread_id, v_user_id, p_content)
  RETURNING id INTO v_post_id;

  -- Add tags to thread
  FOREACH v_tag_id IN ARRAY p_tag_ids
  LOOP
    INSERT INTO public.forum_thread_tags (thread_id, tag_id)
    VALUES (v_thread_id, v_tag_id)
    ON CONFLICT (thread_id, tag_id) DO NOTHING;
  END LOOP;

  -- Record action for rate limiting
  PERFORM public.record_user_action(v_user_id, 'create_thread');

  -- Return JSON object with IDs
  RETURN json_build_object('id', v_thread_id, 'post_id', v_post_id);
END;
$$;

-- Function to add tags to existing thread
CREATE OR REPLACE FUNCTION public.add_thread_tags(
  p_thread_id BIGINT,
  p_tag_ids BIGINT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_tag_id BIGINT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user owns the thread or is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.forum_threads ft
    WHERE ft.id = p_thread_id 
    AND (ft.author_id = v_user_id OR EXISTS (
      SELECT 1 FROM public.users WHERE user_id = v_user_id AND user_type = 'admin'
    ))
  ) THEN
    RAISE EXCEPTION 'Not authorized to modify this thread';
  END IF;

  -- Add tags
  FOREACH v_tag_id IN ARRAY p_tag_ids
  LOOP
    INSERT INTO public.forum_thread_tags (thread_id, tag_id)
    VALUES (p_thread_id, v_tag_id)
    ON CONFLICT (thread_id, tag_id) DO NOTHING;
  END LOOP;

  RETURN TRUE;
END;
$$;

-- Function to remove tags from thread
CREATE OR REPLACE FUNCTION public.remove_thread_tags(
  p_thread_id BIGINT,
  p_tag_ids BIGINT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user owns the thread or is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.forum_threads ft
    WHERE ft.id = p_thread_id 
    AND (ft.author_id = v_user_id OR EXISTS (
      SELECT 1 FROM public.users WHERE user_id = v_user_id AND user_type = 'admin'
    ))
  ) THEN
    RAISE EXCEPTION 'Not authorized to modify this thread';
  END IF;

  -- Remove tags
  DELETE FROM public.forum_thread_tags
  WHERE thread_id = p_thread_id
  AND tag_id = ANY(p_tag_ids);

  RETURN TRUE;
END;
$$;

-- Function to get threads by tag
CREATE OR REPLACE FUNCTION public.get_threads_by_tag(
  p_tag_slug VARCHAR(50),
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  category_id BIGINT,
  author_id UUID,
  title TEXT,
  locked BOOLEAN,
  pinned BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT ft.id, ft.category_id, ft.author_id, ft.title, 
         ft.locked, ft.pinned, ft.created_at, ft.updated_at
  FROM public.forum_threads ft
  INNER JOIN public.forum_thread_tags ftt ON ft.id = ftt.thread_id
  INNER JOIN public.forum_tags ftag ON ftt.tag_id = ftag.id
  WHERE ftag.slug = p_tag_slug
  ORDER BY ft.pinned DESC, ft.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

