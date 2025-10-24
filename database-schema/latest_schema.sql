

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."event_creator_type" AS ENUM (
    'internal',
    'external'
);


ALTER TYPE "public"."event_creator_type" OWNER TO "postgres";


CREATE TYPE "public"."notification_status_enum" AS ENUM (
    'unread',
    'read'
);


ALTER TYPE "public"."notification_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."notification_type_enum" AS ENUM (
    'registration_confirmed',
    'payment_verified',
    'trek_cancelled',
    'trek_status_changed',
    'general_info'
);


ALTER TYPE "public"."notification_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."post_type_enum" AS ENUM (
    'discussion',
    'gear_review',
    'trip_report'
);


ALTER TYPE "public"."post_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."subscription_renewal_status" AS ENUM (
    'active',
    'inactive',
    'cancelled'
);


ALTER TYPE "public"."subscription_renewal_status" OWNER TO "postgres";


CREATE TYPE "public"."transport_mode" AS ENUM (
    'cars',
    'mini_van',
    'bus',
    'self_drive'
);


ALTER TYPE "public"."transport_mode" OWNER TO "postgres";


CREATE TYPE "public"."user_type_enum" AS ENUM (
    'admin',
    'trekker',
    'micro_community'
);


ALTER TYPE "public"."user_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_verification_status" AS ENUM (
    'NOT_SUBMITTED',
    'PENDING_REVIEW',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE "public"."user_verification_status" OWNER TO "postgres";


CREATE TYPE "public"."visibility_enum" AS ENUM (
    'public',
    'private',
    'friends_only'
);


ALTER TYPE "public"."visibility_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."add_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_post"("p_post_id" bigint, "p_reason" "text" DEFAULT 'Violation of community guidelines'::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."admin_delete_post"("p_post_id" bigint, "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_thread"("p_thread_id" bigint, "p_reason" "text" DEFAULT 'Violation of community guidelines'::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."admin_delete_thread"("p_thread_id" bigint, "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."assign_image_tags"("p_image_id" bigint, "p_image_type" "text", "p_tag_ids" bigint[]) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."assign_image_tags"("p_image_id" bigint, "p_image_type" "text", "p_tag_ids" bigint[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_action_type" "text", "p_limit_per_hour" integer DEFAULT 10, "p_window_minutes" integer DEFAULT 60) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_action_type" "text", "p_limit_per_hour" integer, "p_window_minutes" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_rate_limit_data"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM public.user_actions
  WHERE created_at < now() - INTERVAL '24 hours';
END; $$;


ALTER FUNCTION "public"."cleanup_rate_limit_data"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."forum_categories" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "color" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."forum_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."forum_categories" IS 'Forum categories for organizing threads';



CREATE OR REPLACE FUNCTION "public"."create_forum_category"("p_name" "text", "p_slug" "text", "p_description" "text" DEFAULT NULL::"text", "p_sort_order" integer DEFAULT 0) RETURNS "public"."forum_categories"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."create_forum_category"("p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."forum_posts" (
    "id" integer NOT NULL,
    "thread_id" integer NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "parent_id" integer,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."forum_posts" OWNER TO "postgres";


COMMENT ON TABLE "public"."forum_posts" IS 'Posts within forum threads';



CREATE OR REPLACE FUNCTION "public"."create_forum_post"("p_thread_id" bigint, "p_content" "text") RETURNS "public"."forum_posts"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."create_forum_post"("p_thread_id" bigint, "p_content" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."forum_threads" (
    "id" integer NOT NULL,
    "category_id" integer NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "author_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_pinned" boolean DEFAULT false,
    "is_locked" boolean DEFAULT false,
    "locked" boolean DEFAULT false,
    "pinned" boolean DEFAULT false
);


ALTER TABLE "public"."forum_threads" OWNER TO "postgres";


COMMENT ON TABLE "public"."forum_threads" IS 'Forum threads/discussions';



CREATE OR REPLACE FUNCTION "public"."create_forum_thread"("p_category_id" bigint, "p_title" "text", "p_content" "text" DEFAULT NULL::"text") RETURNS "public"."forum_threads"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."create_forum_thread"("p_category_id" bigint, "p_title" "text", "p_content" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_forum_thread_with_tags"("p_category_id" bigint, "p_title" "text", "p_content" "text", "p_tag_ids" bigint[] DEFAULT ARRAY[]::bigint[]) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."create_forum_thread_with_tags"("p_category_id" bigint, "p_title" "text", "p_content" "text", "p_tag_ids" bigint[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_link" "text" DEFAULT NULL::"text", "p_type" "text" DEFAULT 'general_info'::"text", "p_trek_id" integer DEFAULT NULL::integer) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, message, link, type, trek_id)
  VALUES (p_user_id, p_message, p_link, p_type, p_trek_id)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;


ALTER FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_link" "text", "p_type" "text", "p_trek_id" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "link" "text",
    "status" "public"."notification_status_enum" DEFAULT 'unread'::"public"."notification_status_enum" NOT NULL,
    "type" "public"."notification_type_enum" DEFAULT 'general_info'::"public"."notification_type_enum" NOT NULL,
    "trek_id" integer,
    "related_entity_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_type" "public"."notification_type_enum", "p_link" "text" DEFAULT NULL::"text", "p_trek_id" integer DEFAULT NULL::integer, "p_related_entity_id" bigint DEFAULT NULL::bigint) RETURNS "public"."notifications"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    new_notification public.notifications;
BEGIN
    INSERT INTO public.notifications (user_id, message, type, link, trek_id, related_entity_id, status)
    VALUES (p_user_id, p_message, p_type, p_link, p_trek_id, p_related_entity_id, 'unread')
    RETURNING * INTO new_notification;
    RETURN new_notification;
END;
$$;


ALTER FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_type" "public"."notification_type_enum", "p_link" "text", "p_trek_id" integer, "p_related_entity_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_forum_category"("p_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid() AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  DELETE FROM public.forum_categories WHERE id = p_id;
END; $$;


ALTER FUNCTION "public"."delete_forum_category"("p_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_max_five_images"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    cnt INTEGER;
BEGIN
    SELECT COUNT(*) INTO cnt FROM public.trek_event_images WHERE trek_id = NEW.trek_id;
    IF TG_OP = 'INSERT' THEN
        IF cnt >= 5 THEN
            RAISE EXCEPTION 'At most 5 images allowed per trek_id=%', NEW.trek_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."enforce_max_five_images"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_max_one_video"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    cnt INTEGER;
BEGIN
    SELECT COUNT(*) INTO cnt FROM public.trek_event_videos WHERE trek_id = NEW.trek_id;
    IF TG_OP = 'INSERT' THEN
        IF cnt >= 1 THEN
            RAISE EXCEPTION 'At most 1 video allowed per trek_id=%', NEW.trek_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."enforce_max_one_video"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_image_tags"() RETURNS TABLE("id" bigint, "name" character varying, "description" "text", "color" character varying, "usage_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_all_image_tags"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_avatar_catalog"() RETURNS TABLE("key" "text", "name" "text", "category" "text", "image_url" "text", "sort_order" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."get_avatar_catalog"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_forum_tags"() RETURNS TABLE("id" bigint, "name" character varying, "slug" character varying, "color" character varying, "sort_order" integer)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT id, name, slug, color, sort_order
  FROM public.forum_tags
  ORDER BY sort_order ASC, name ASC;
$$;


ALTER FUNCTION "public"."get_forum_tags"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_image_tags"("p_image_id" bigint, "p_image_type" "text") RETURNS TABLE("tag_id" bigint, "tag_name" character varying, "tag_description" "text", "tag_color" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_image_tags"("p_image_id" bigint, "p_image_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_notifications"("limit_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "message" "text", "link" "text", "status" "text", "type" "text", "trek_id" integer, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.message,
    n.link,
    n.status::TEXT,
    n.type::TEXT,
    n.trek_id,
    n.created_at
  FROM public.notifications n
  WHERE n.user_id = auth.uid()
  ORDER BY n.created_at DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_my_notifications"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_notifications"("page_size" integer DEFAULT 20, "page_num" integer DEFAULT 1) RETURNS SETOF "public"."notifications"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT *
  FROM public.notifications
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT page_size
  OFFSET (page_num - 1) * page_size;
$$;


ALTER FUNCTION "public"."get_my_notifications"("page_size" integer, "page_num" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_my_notifications"("page_size" integer, "page_num" integer) IS 'Retrieves paginated notifications for the currently authenticated user.';



CREATE OR REPLACE FUNCTION "public"."get_tent_reserved_count"("trek_id_param" integer) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(reserved_quantity) 
     FROM public.tent_rentals 
     WHERE trek_id = trek_id_param), 
    0
  );
END;
$$;


ALTER FUNCTION "public"."get_tent_reserved_count"("trek_id_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_threads_by_tag"("p_tag_slug" character varying, "p_limit" integer DEFAULT 20, "p_offset" integer DEFAULT 0) RETURNS TABLE("id" bigint, "category_id" bigint, "author_id" "uuid", "title" "text", "locked" boolean, "pinned" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_threads_by_tag"("p_tag_slug" character varying, "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_trek_media"("p_trek_id" integer) RETURNS TABLE("type" "text", "id" bigint, "url" "text", "position" integer, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Return images first
    RETURN QUERY
    SELECT
        'image'::TEXT as type,
        tei.id,
        tei.image_url as url,
        tei."position",
        tei.created_at
    FROM public.trek_event_images tei
    WHERE tei.trek_id = p_trek_id
    ORDER BY tei."position";

    -- Then return video if exists
    RETURN QUERY
    SELECT
        'video'::TEXT as type,
        tev.id,
        tev.video_url as url,
        0 as "position", -- Videos don't have position
        tev.created_at
    FROM public.trek_event_videos tev
    WHERE tev.trek_id = p_trek_id;
END;
$$;


ALTER FUNCTION "public"."get_trek_media"("p_trek_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_trek_participant_count"("trek_id_param" integer) RETURNS integer
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT COUNT(user_id)::INTEGER
  FROM public.trek_registrations
  WHERE trek_id = trek_id_param
  AND payment_status IS DISTINCT FROM 'Cancelled';
$$;


ALTER FUNCTION "public"."get_trek_participant_count"("trek_id_param" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_trek_participant_count"("trek_id_param" integer) IS 'Safely retrieves the active participant count for a given trek_id, respecting RLS for the function executor but querying data broadly.';



CREATE OR REPLACE FUNCTION "public"."get_trek_required_id_types"("trek_id_param" integer) RETURNS TABLE("id_type_id" integer, "name" character varying, "display_name" character varying, "description" "text", "is_mandatory" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    it.id_type_id,
    it.name,
    it.display_name,
    it.description,
    tir.is_mandatory
  FROM public.trek_id_requirements tir
  JOIN public.id_types it ON tir.id_type_id = it.id_type_id
  WHERE tir.trek_id = trek_id_param AND it.is_active = true
  ORDER BY tir.is_mandatory DESC, it.display_name;
END;
$$;


ALTER FUNCTION "public"."get_trek_required_id_types"("trek_id_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_contribution_stats"("p_trek_id" integer) RETURNS TABLE("total_contributions" bigint, "pending_count" bigint, "approved_count" bigint, "rejected_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_user_contribution_stats"("p_trek_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_notifications"("p_user_id" "uuid", "p_limit" integer DEFAULT 10, "p_offset" integer DEFAULT 0) RETURNS TABLE("id" bigint, "user_id" "uuid", "message" "text", "link" "text", "status" "public"."notification_status_enum", "type" "public"."notification_type_enum", "trek_id" integer, "related_entity_id" bigint, "created_at" timestamp with time zone, "trek_name" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.user_id,
        n.message,
        n.link,
        n.status,
        n.type,
        n.trek_id,
        n.related_entity_id,
        n.created_at,
        t.name AS trek_name -- Changed from t.trek_name to t.name AS trek_name
    FROM public.notifications n
    LEFT JOIN public.trek_events t ON n.trek_id = t.trek_id
    WHERE n.user_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."get_user_notifications"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- We now directly upsert, as RLS is handled by grants.
  -- The function maps the 'name' from auth metadata to 'full_name' in the public users table.
  INSERT INTO public.users (user_id, email, full_name, avatar_url, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    true
  )
  ON CONFLICT (email) DO UPDATE 
  SET
    user_id = NEW.id,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW(),
    is_verified = true
  -- We add a condition to NOT update an existing admin's record, preserving their role.
  WHERE
    public.users.user_type IS DISTINCT FROM 'admin';

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id_param" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE user_id = user_id_param
    AND user_type = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_all_my_notifications_as_read"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.notifications
  SET 
    status = 'read',
    updated_at = timezone('utc'::text, now())
  WHERE 
    user_id = auth.uid() AND 
    status = 'unread';
END;
$$;


ALTER FUNCTION "public"."mark_all_my_notifications_as_read"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."mark_all_my_notifications_as_read"() IS 'Marks all unread notifications as read for the currently authenticated user.';



CREATE OR REPLACE FUNCTION "public"."mark_all_notifications_as_read"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET status = 'read'
  WHERE user_id = auth.uid() AND status = 'unread';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;


ALTER FUNCTION "public"."mark_all_notifications_as_read"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_all_notifications_as_read"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.notifications
    SET status = 'read'
    WHERE user_id = p_user_id AND status = 'unread';
END;
$$;


ALTER FUNCTION "public"."mark_all_notifications_as_read"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_notification_as_read"("notification_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.notifications
  SET status = 'read'
  WHERE id = notification_id AND user_id = auth.uid();

  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."mark_notification_as_read"("notification_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_notification_as_read"("p_notification_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.notifications
  SET 
    status = 'read',
    updated_at = timezone('utc'::text, now())
  WHERE 
    id = p_notification_id AND 
    user_id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."mark_notification_as_read"("p_notification_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" "uuid") IS 'Marks a specific notification as read for the currently authenticated user.';



CREATE OR REPLACE FUNCTION "public"."mark_notification_as_read"("p_notification_id" bigint, "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.notifications
    SET status = 'read'
    WHERE id = p_notification_id AND user_id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."mark_notification_as_read"("p_notification_id" bigint, "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."promote_user_image_to_official"("p_user_image_id" bigint) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."promote_user_image_to_official"("p_user_image_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_user_action"("p_user_id" "uuid", "p_action_type" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_actions (user_id, action_type)
  VALUES (p_user_id, p_action_type);
END; $$;


ALTER FUNCTION "public"."record_user_action"("p_user_id" "uuid", "p_action_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."remove_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_images_by_tags"("p_tag_ids" bigint[]) RETURNS TABLE("image_id" bigint, "image_type" "text", "image_url" "text", "trek_id" integer, "trek_name" "text", "tags" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
            WHEN ita.image_type IN ('official_image', 'official_video') THEN COALESCE(tei.trek_id, tev.trek_id)
            ELSE uti.trek_id
        END as trek_id,
        CASE
            WHEN ita.image_type IN ('official_image', 'official_video') THEN COALESCE(te1.name, te2.name)
            ELSE te3.name
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
    LEFT JOIN public.trek_events te1 ON tei.trek_id = te1.trek_id
    LEFT JOIN public.trek_events te2 ON tev.trek_id = te2.trek_id
    LEFT JOIN public.trek_events te3 ON uti.trek_id = te3.trek_id
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
            WHEN ita.image_type IN ('official_image', 'official_video') THEN COALESCE(tei.trek_id, tev.trek_id)
            ELSE uti.trek_id
        END,
        CASE
            WHEN ita.image_type IN ('official_image', 'official_video') THEN COALESCE(te1.name, te2.name)
            ELSE te3.name
        END
    ORDER BY COUNT(*) DESC; -- Prioritize images with more matching tags
END;
$$;


ALTER FUNCTION "public"."search_images_by_tags"("p_tag_ids" bigint[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255),
    "email" character varying(255),
    "user_type" "public"."user_type_enum" DEFAULT 'trekker'::"public"."user_type_enum",
    "phone_number" character varying(20),
    "bio" "text",
    "location" character varying(255),
    "avatar_url" "text",
    "indemnity_accepted" boolean DEFAULT false,
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "has_car" boolean DEFAULT false,
    "car_seating_capacity" integer,
    "vehicle_number" "text",
    "latitude" double precision,
    "longitude" double precision,
    "full_name" "text",
    "date_of_birth" "date",
    "trekking_experience" "text",
    "address" "text",
    "interests" "text",
    "pet_details" "text",
    "verification_status" "public"."user_verification_status" DEFAULT 'NOT_SUBMITTED'::"public"."user_verification_status",
    "verification_docs" "jsonb",
    "transport_volunteer_opt_in" boolean DEFAULT false,
    "avatar_key" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Stores public user profile information.';



COMMENT ON COLUMN "public"."users"."car_seating_capacity" IS 'How many passengers can the user''s car accommodate (excluding driver).';



COMMENT ON COLUMN "public"."users"."verification_status" IS 'User verification status: VERIFIED (auto/quick/full), PENDING_REVIEW, REJECTED';



CREATE OR REPLACE FUNCTION "public"."set_user_avatar"("p_avatar_key" "text") RETURNS "public"."users"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE v_user public.users;
BEGIN
  UPDATE public.users u
    SET avatar_key = p_avatar_key, updated_at = now()
    WHERE u.user_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.avatar_catalog a WHERE a.key = p_avatar_key AND a.active AND a.category IN ('animal', 'bird', 'insect'))
  RETURNING * INTO v_user;
  RETURN v_user;
END; $$;


ALTER FUNCTION "public"."set_user_avatar"("p_avatar_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_avatar_url_from_key"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  new_avatar_url TEXT;
BEGIN
  IF NEW.avatar_key IS NULL THEN
    NEW.avatar_url := NULL;
  ELSE
    -- Only update if avatar_catalog table exists and has the avatar
    BEGIN
      SELECT ac.image_url INTO new_avatar_url
      FROM public.avatar_catalog ac
      WHERE ac.key = NEW.avatar_key AND ac.active = TRUE AND ac.category IN ('animal', 'bird', 'insect');

      -- Only update if we found a matching avatar
      IF FOUND THEN
        NEW.avatar_url := new_avatar_url;
      END IF;
    EXCEPTION
      WHEN undefined_table THEN
        -- avatar_catalog doesn't exist yet, keep existing value
        NULL;
      WHEN OTHERS THEN
        -- Other error, keep existing value for safety
        NULL;
    END;
  END IF;
  RETURN NEW;
END; $$;


ALTER FUNCTION "public"."sync_avatar_url_from_key"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_body_to_comment_text"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.comment_text = NEW.body;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_body_to_comment_text"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_comment_text_to_body"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.body = NEW.comment_text;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_comment_text_to_body"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_thread_lock"("p_thread_id" bigint, "p_lock" boolean DEFAULT true) RETURNS "public"."forum_threads"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."toggle_thread_lock"("p_thread_id" bigint, "p_lock" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_thread_pin"("p_thread_id" bigint, "p_pin" boolean DEFAULT true) RETURNS "public"."forum_threads"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."toggle_thread_pin"("p_thread_id" bigint, "p_pin" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_forum_category"("p_id" bigint, "p_name" "text" DEFAULT NULL::"text", "p_slug" "text" DEFAULT NULL::"text", "p_description" "text" DEFAULT NULL::"text", "p_sort_order" integer DEFAULT NULL::integer) RETURNS "public"."forum_categories"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
END; $$;


ALTER FUNCTION "public"."update_forum_category"("p_id" bigint, "p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tent_reserved_count"("p_event_id" integer, "p_tent_type_id" integer, "p_quantity_change" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Update the reserved count
  UPDATE public.tent_inventory 
  SET reserved_count = GREATEST(0, reserved_count + p_quantity_change),
      updated_at = CURRENT_TIMESTAMP
  WHERE event_id = p_event_id 
    AND tent_type_id = p_tent_type_id;
  
  -- Check if the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tent inventory not found for event % and tent type %', p_event_id, p_tent_type_id;
  END IF;
  
  -- Verify that reserved count doesn't exceed total available
  IF EXISTS (
    SELECT 1 FROM public.tent_inventory 
    WHERE event_id = p_event_id 
      AND tent_type_id = p_tent_type_id 
      AND reserved_count > total_available
  ) THEN
    RAISE EXCEPTION 'Reserved count cannot exceed total available tents';
  END IF;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."update_tent_reserved_count"("p_event_id" integer, "p_tent_type_id" integer, "p_quantity_change" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_tent_reserved_count"("p_event_id" integer, "p_tent_type_id" integer, "p_quantity_change" integer) IS 'Updates the reserved count for tent inventory with validation';



CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_approved_id_proofs"("user_id_param" "uuid", "trek_id_param" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  required_count INTEGER;
  approved_count INTEGER;
BEGIN
  -- Get count of required ID types for this trek
  SELECT COUNT(*) INTO required_count
  FROM public.get_trek_required_id_types(trek_id_param);

  -- If no requirements, return true
  IF required_count = 0 THEN
    RETURN true;
  END IF;

  -- Count how many required ID types the user has approved proofs for
  SELECT COUNT(*) INTO approved_count
  FROM public.trek_registrations tr
  JOIN public.registration_id_proofs rip ON tr.registration_id = rip.registration_id
  JOIN public.trek_id_requirements tir ON rip.id_type_id = tir.id_type_id
  WHERE tr.user_id::uuid = user_id_param
    AND tr.trek_id = trek_id_param
    AND rip.verification_status = 'approved'
    AND tr.payment_status != 'Cancelled';

  -- User has all required approved proofs
  RETURN approved_count >= required_count;
END;
$$;


ALTER FUNCTION "public"."user_has_approved_id_proofs"("user_id_param" "uuid", "trek_id_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_cost_type"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Ensure cost_type is never null and is a valid value
  IF NEW.cost_type IS NULL THEN
    NEW.cost_type := 'OTHER';
  END IF;

  -- Validate that cost_type is one of the allowed values
  IF NEW.cost_type NOT IN ('ACCOMMODATION', 'TICKETS', 'LOCAL_VEHICLE', 'GUIDE', 'OTHER') THEN
    RAISE EXCEPTION 'Invalid cost_type: %. Must be one of: ACCOMMODATION, TICKETS, LOCAL_VEHICLE, GUIDE, OTHER', NEW.cost_type;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_cost_type"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."avatar_catalog" (
    "key" "text" NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "avatar_catalog_category_check" CHECK (("category" = ANY (ARRAY['animal'::"text", 'bird'::"text", 'insect'::"text"])))
);


ALTER TABLE "public"."avatar_catalog" OWNER TO "postgres";


COMMENT ON TABLE "public"."avatar_catalog" IS 'Curated avatar presets for users (animals, birds, insects only)';



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "comment_id" integer NOT NULL,
    "post_id" integer,
    "user_id" "uuid",
    "body" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comments_comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."comments_comment_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comments_comment_id_seq" OWNED BY "public"."comments"."comment_id";



CREATE TABLE IF NOT EXISTS "public"."community_posts" (
    "post_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "post_type" "public"."post_type_enum" DEFAULT 'discussion'::"public"."post_type_enum" NOT NULL,
    "visibility" "public"."visibility_enum" DEFAULT 'public'::"public"."visibility_enum" NOT NULL,
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."community_posts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."community_posts_post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."community_posts_post_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."community_posts_post_id_seq" OWNED BY "public"."community_posts"."post_id";



CREATE TABLE IF NOT EXISTS "public"."expense_shares" (
    "id" integer NOT NULL,
    "expense_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "payment_method" character varying(50),
    "payment_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_expense_share_status" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'rejected'::character varying])::"text"[])))
);


ALTER TABLE "public"."expense_shares" OWNER TO "postgres";


COMMENT ON TABLE "public"."expense_shares" IS 'Tracks how individual expenses are shared among participants.';



CREATE SEQUENCE IF NOT EXISTS "public"."expense_shares_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."expense_shares_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."expense_shares_id_seq" OWNED BY "public"."expense_shares"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."forum_categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."forum_categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."forum_categories_id_seq" OWNED BY "public"."forum_categories"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."forum_posts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."forum_posts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."forum_posts_id_seq" OWNED BY "public"."forum_posts"."id";



CREATE TABLE IF NOT EXISTS "public"."forum_tags" (
    "id" bigint NOT NULL,
    "name" character varying(50) NOT NULL,
    "slug" character varying(50) NOT NULL,
    "color" character varying(7) DEFAULT '#6B7280'::character varying,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."forum_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."forum_tags" IS 'Tags for categorizing forum threads (many-to-many)';



CREATE SEQUENCE IF NOT EXISTS "public"."forum_tags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."forum_tags_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."forum_tags_id_seq" OWNED BY "public"."forum_tags"."id";



CREATE TABLE IF NOT EXISTS "public"."forum_thread_tags" (
    "thread_id" bigint NOT NULL,
    "tag_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."forum_thread_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."forum_thread_tags" IS 'Junction table linking threads to tags';



CREATE SEQUENCE IF NOT EXISTS "public"."forum_threads_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."forum_threads_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."forum_threads_id_seq" OWNED BY "public"."forum_threads"."id";



CREATE TABLE IF NOT EXISTS "public"."id_types" (
    "id_type_id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "display_name" character varying(100) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."id_types" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."id_types_id_type_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."id_types_id_type_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."id_types_id_type_id_seq" OWNED BY "public"."id_types"."id_type_id";



CREATE TABLE IF NOT EXISTS "public"."image_tag_assignments" (
    "id" bigint NOT NULL,
    "image_id" bigint NOT NULL,
    "image_type" character varying(20) NOT NULL,
    "tag_id" bigint NOT NULL,
    "assigned_by" "uuid",
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "image_tag_assignments_image_type_check" CHECK ((("image_type")::"text" = ANY ((ARRAY['official_image'::character varying, 'official_video'::character varying, 'user_image'::character varying])::"text"[])))
);


ALTER TABLE "public"."image_tag_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."image_tag_assignments" IS 'Links images/videos to tags for categorization and filtering';



COMMENT ON COLUMN "public"."image_tag_assignments"."image_type" IS 'official_image, official_video, or user_image';



CREATE SEQUENCE IF NOT EXISTS "public"."image_tag_assignments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."image_tag_assignments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."image_tag_assignments_id_seq" OWNED BY "public"."image_tag_assignments"."id";



CREATE TABLE IF NOT EXISTS "public"."image_tags" (
    "id" bigint NOT NULL,
    "name" character varying(50) NOT NULL,
    "description" "text",
    "color" character varying(7) DEFAULT '#6B7280'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."image_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."image_tags" IS 'Tag definitions for organizing trek media';



CREATE SEQUENCE IF NOT EXISTS "public"."image_tags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."image_tags_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."image_tags_id_seq" OWNED BY "public"."image_tags"."id";



CREATE TABLE IF NOT EXISTS "public"."master_packing_items" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "category" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."master_packing_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."master_packing_items" IS 'Master list of reusable packing items for treks.';



CREATE SEQUENCE IF NOT EXISTS "public"."master_packing_items_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."master_packing_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."master_packing_items_id_seq" OWNED BY "public"."master_packing_items"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."notifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";



CREATE TABLE IF NOT EXISTS "public"."registration_id_proofs" (
    "proof_id" integer NOT NULL,
    "registration_id" integer NOT NULL,
    "id_type_id" integer NOT NULL,
    "proof_url" "text" NOT NULL,
    "uploaded_by" character varying(255) NOT NULL,
    "uploaded_at" timestamp without time zone DEFAULT "now"(),
    "verified_by" "uuid",
    "verified_at" timestamp without time zone,
    "verification_status" character varying(20) DEFAULT 'pending'::character varying,
    "admin_notes" "text"
);


ALTER TABLE "public"."registration_id_proofs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."registration_id_proofs_proof_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."registration_id_proofs_proof_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."registration_id_proofs_proof_id_seq" OWNED BY "public"."registration_id_proofs"."proof_id";



CREATE TABLE IF NOT EXISTS "public"."scheduled_notifications" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "notification_type" "text" NOT NULL,
    "channels" "text"[] DEFAULT '{}'::"text"[],
    "priority" integer DEFAULT 1,
    "trek_id" integer,
    "scheduled_for" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."scheduled_notifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."scheduled_notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."scheduled_notifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."scheduled_notifications_id_seq" OWNED BY "public"."scheduled_notifications"."id";



CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions_billing" (
    "id" integer NOT NULL,
    "subscription_id" integer,
    "user_id" "uuid",
    "amount" numeric,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "renewal_status" "public"."subscription_renewal_status",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions_billing" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."subscriptions_billing_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."subscriptions_billing_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."subscriptions_billing_id_seq" OWNED BY "public"."subscriptions_billing"."id";



CREATE TABLE IF NOT EXISTS "public"."tent_inventory" (
    "id" integer NOT NULL,
    "event_id" integer NOT NULL,
    "tent_type_id" integer NOT NULL,
    "total_available" integer DEFAULT 0 NOT NULL,
    "reserved_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tent_inventory_reserved_count_check" CHECK (("reserved_count" >= 0)),
    CONSTRAINT "tent_inventory_total_available_check" CHECK (("total_available" >= 0))
);


ALTER TABLE "public"."tent_inventory" OWNER TO "postgres";


COMMENT ON TABLE "public"."tent_inventory" IS 'Tracks tent availability per event';



CREATE SEQUENCE IF NOT EXISTS "public"."tent_inventory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."tent_inventory_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tent_inventory_id_seq" OWNED BY "public"."tent_inventory"."id";



CREATE TABLE IF NOT EXISTS "public"."tent_rentals" (
    "id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "tent_type" "text" NOT NULL,
    "price_per_tent" numeric(10,2) NOT NULL,
    "available_quantity" integer DEFAULT 0 NOT NULL,
    "reserved_quantity" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tent_rentals" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tent_rentals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."tent_rentals_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tent_rentals_id_seq" OWNED BY "public"."tent_rentals"."id";



CREATE TABLE IF NOT EXISTS "public"."tent_requests" (
    "id" integer NOT NULL,
    "event_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tent_type_id" integer NOT NULL,
    "quantity_requested" integer DEFAULT 1 NOT NULL,
    "nights" integer DEFAULT 1 NOT NULL,
    "total_cost" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "request_notes" "text",
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tent_requests_nights_check" CHECK (("nights" > 0)),
    CONSTRAINT "tent_requests_quantity_requested_check" CHECK (("quantity_requested" > 0)),
    CONSTRAINT "tent_requests_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."tent_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."tent_requests" IS 'User requests for tent rentals';



CREATE SEQUENCE IF NOT EXISTS "public"."tent_requests_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."tent_requests_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tent_requests_id_seq" OWNED BY "public"."tent_requests"."id";



CREATE TABLE IF NOT EXISTS "public"."tent_types" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "capacity" integer NOT NULL,
    "description" "text",
    "rental_price_per_night" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tent_types_capacity_check" CHECK (("capacity" > 0))
);


ALTER TABLE "public"."tent_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."tent_types" IS 'Defines available tent types for rental';



CREATE SEQUENCE IF NOT EXISTS "public"."tent_types_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."tent_types_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tent_types_id_seq" OWNED BY "public"."tent_types"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_comments" (
    "comment_id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_id" integer,
    "body" "text",
    "comment_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_comments" IS 'Stores comments related to specific treks.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_comments_comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_comments_comment_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_comments_comment_id_seq" OWNED BY "public"."trek_comments"."comment_id";



CREATE TABLE IF NOT EXISTS "public"."trek_costs" (
    "id" bigint NOT NULL,
    "trek_id" bigint NOT NULL,
    "cost_type" "text" NOT NULL,
    "description" "text",
    "amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "url" "text",
    "file_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "pay_by_date" "date",
    CONSTRAINT "trek_costs_cost_type_check" CHECK (("cost_type" = ANY (ARRAY['ACCOMMODATION'::"text", 'TICKETS'::"text", 'LOCAL_VEHICLE'::"text", 'GUIDE'::"text", 'OTHER'::"text"])))
);


ALTER TABLE "public"."trek_costs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."trek_costs"."pay_by_date" IS 'The date by which this fixed cost must be paid by participants.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_costs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_costs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_costs_id_seq" OWNED BY "public"."trek_costs"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_driver_assignments" (
    "id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "participant_id" "uuid" NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_assignment_status" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'picked_up'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."trek_driver_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_driver_assignments" IS 'Assigns participants to specific drivers for a trek.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_driver_assignments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_driver_assignments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_driver_assignments_id_seq" OWNED BY "public"."trek_driver_assignments"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_drivers" (
    "id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vehicle_type" character varying(50),
    "vehicle_name" character varying(100),
    "registration_number" character varying(50),
    "seats_available" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "vehicle_info" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."trek_drivers" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_drivers" IS 'Lists users acting as drivers for a specific trek.';



COMMENT ON COLUMN "public"."trek_drivers"."vehicle_type" IS 'Type of vehicle (e.g., Car 5-seater, SUV/MUV, Mini-van, MiniBus)';



COMMENT ON COLUMN "public"."trek_drivers"."vehicle_name" IS 'Vehicle model/name';



COMMENT ON COLUMN "public"."trek_drivers"."registration_number" IS 'Vehicle registration/license plate number';



COMMENT ON COLUMN "public"."trek_drivers"."seats_available" IS 'Number of passenger seats available (excluding driver)';



COMMENT ON COLUMN "public"."trek_drivers"."vehicle_info" IS 'JSON object containing vehicle details (for backward compatibility)';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_drivers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_drivers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_drivers_id_seq" OWNED BY "public"."trek_drivers"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_event_images" (
    "id" bigint NOT NULL,
    "trek_id" integer NOT NULL,
    "image_url" "text" NOT NULL,
    "position" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trek_event_images_position_check" CHECK ((("position" >= 1) AND ("position" <= 5)))
);


ALTER TABLE "public"."trek_event_images" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_event_images" IS 'Official images for treks (up to 5 per trek)';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_event_images_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_event_images_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_event_images_id_seq" OWNED BY "public"."trek_event_images"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_event_videos" (
    "id" bigint NOT NULL,
    "trek_id" integer NOT NULL,
    "video_url" "text" NOT NULL,
    "thumbnail_url" "text",
    "duration_seconds" integer,
    "file_size_mb" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_event_videos" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_event_videos" IS 'Official videos for treks (up to 1 per trek, max 10MB)';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_event_videos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_event_videos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_event_videos_id_seq" OWNED BY "public"."trek_event_videos"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_events" (
    "trek_id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100),
    "difficulty" character varying(50),
    "start_datetime" timestamp with time zone NOT NULL,
    "duration" interval,
    "base_price" numeric(10,2),
    "cancellation_policy" "text",
    "penalty_details" numeric(10,2),
    "max_participants" integer NOT NULL,
    "location" "text",
    "route_data" "jsonb",
    "transport_mode" "public"."transport_mode",
    "vendor_contacts" "jsonb",
    "pickup_time_window" "text",
    "event_creator_type" "public"."event_creator_type" DEFAULT 'internal'::"public"."event_creator_type",
    "partner_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "booking_amount" numeric(10,2),
    "collect_full_fee" boolean DEFAULT false,
    "image_url" "text",
    "gpx_file_url" "text",
    "is_finalized" boolean DEFAULT false,
    "created_by" "uuid",
    "end_datetime" timestamp with time zone,
    "status" character varying(50),
    "destination_latitude" double precision,
    "destination_longitude" double precision,
    "government_id_required" boolean DEFAULT false,
    "event_type" character varying(20) DEFAULT 'trek'::character varying,
    "itinerary" "jsonb",
    "activity_schedule" "jsonb",
    "volunteer_roles" "jsonb",
    CONSTRAINT "trek_events_event_type_check" CHECK ((("event_type")::"text" = ANY ((ARRAY['trek'::character varying, 'camping'::character varying])::"text"[])))
);


ALTER TABLE "public"."trek_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_events" IS 'Defines the details of both trek and camping events.';



COMMENT ON COLUMN "public"."trek_events"."partner_id" IS 'Null for internal events; set for micro-community (external) events';



COMMENT ON COLUMN "public"."trek_events"."is_finalized" IS 'True if trek event is fully detailed and registration requires payment/terms';



COMMENT ON COLUMN "public"."trek_events"."government_id_required" IS 'Whether this trek requires government ID verification for participants (for ticket booking, permits, etc.)';



COMMENT ON COLUMN "public"."trek_events"."event_type" IS 'Type of event: trek (traditional hiking/trekking) or camping (multi-activity camping event)';



COMMENT ON COLUMN "public"."trek_events"."itinerary" IS 'Detailed day-by-day itinerary for camping events (JSON format)';



COMMENT ON COLUMN "public"."trek_events"."activity_schedule" IS 'Scheduled activities with timing and requirements (JSON format)';



COMMENT ON COLUMN "public"."trek_events"."volunteer_roles" IS 'Available volunteer roles and requirements for camping events (JSON format)';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_events_trek_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_events_trek_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_events_trek_id_seq" OWNED BY "public"."trek_events"."trek_id";



CREATE TABLE IF NOT EXISTS "public"."trek_expense_categories" (
    "id" integer NOT NULL,
    "name" character varying(50) NOT NULL,
    "description" "text",
    "icon" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_expense_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_expense_categories" IS 'Lookup table for different types of trek expenses.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_expense_categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_expense_categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_expense_categories_id_seq" OWNED BY "public"."trek_expense_categories"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_expenses" (
    "id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "category_id" integer,
    "expense_type" character varying(50),
    "amount" numeric(10,2) NOT NULL,
    "description" "text",
    "expense_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "receipt_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_expenses" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_expenses" IS 'Stores all expenses (admin fixed + participant ad-hoc) related to a trek.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_expenses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_expenses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_expenses_id_seq" OWNED BY "public"."trek_expenses"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_id_requirements" (
    "requirement_id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "id_type_id" integer NOT NULL,
    "is_mandatory" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_id_requirements" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."trek_id_requirements_requirement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_id_requirements_requirement_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_id_requirements_requirement_id_seq" OWNED BY "public"."trek_id_requirements"."requirement_id";



CREATE TABLE IF NOT EXISTS "public"."trek_packing_items" (
    "item_id" integer NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."trek_packing_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."trek_packing_items_item_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_packing_items_item_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_packing_items_item_id_seq" OWNED BY "public"."trek_packing_items"."item_id";



CREATE TABLE IF NOT EXISTS "public"."trek_packing_list_assignments" (
    "id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "master_item_id" integer NOT NULL,
    "mandatory" boolean DEFAULT false,
    "item_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_packing_list_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_packing_list_assignments" IS 'Assigns items from master_packing_items to specific treks with details.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_packing_list_assignments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_packing_list_assignments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_packing_list_assignments_id_seq" OWNED BY "public"."trek_packing_list_assignments"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_participant_ratings" (
    "id" bigint NOT NULL,
    "trek_id" integer NOT NULL,
    "rated_user_id" "uuid" NOT NULL,
    "rated_by_user_id" "uuid" NOT NULL,
    "teamwork_rating" integer,
    "punctuality_rating" integer,
    "contribution_rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trek_participant_ratings_contribution_rating_check" CHECK ((("contribution_rating" >= 1) AND ("contribution_rating" <= 5))),
    CONSTRAINT "trek_participant_ratings_punctuality_rating_check" CHECK ((("punctuality_rating" >= 1) AND ("punctuality_rating" <= 5))),
    CONSTRAINT "trek_participant_ratings_teamwork_rating_check" CHECK ((("teamwork_rating" >= 1) AND ("teamwork_rating" <= 5)))
);


ALTER TABLE "public"."trek_participant_ratings" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_participant_ratings" IS 'Stores ratings given by participants to each other.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_participant_ratings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_participant_ratings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_participant_ratings_id_seq" OWNED BY "public"."trek_participant_ratings"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_pickup_locations" (
    "id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "address" "text" NOT NULL,
    "latitude" numeric(10,6),
    "longitude" numeric(10,6),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "time" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_pickup_locations" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_pickup_locations" IS 'Defines pickup points for a trek.';



COMMENT ON COLUMN "public"."trek_pickup_locations"."latitude" IS 'Latitude coordinate for pickup location';



COMMENT ON COLUMN "public"."trek_pickup_locations"."longitude" IS 'Longitude coordinate for pickup location';



COMMENT ON COLUMN "public"."trek_pickup_locations"."time" IS 'Pickup time for this location';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_pickup_locations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_pickup_locations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_pickup_locations_id_seq" OWNED BY "public"."trek_pickup_locations"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_ratings" (
    "id" bigint NOT NULL,
    "trek_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "difficulty_rating" integer,
    "enjoyment_rating" integer,
    "scenic_rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trek_ratings_difficulty_rating_check" CHECK ((("difficulty_rating" >= 1) AND ("difficulty_rating" <= 5))),
    CONSTRAINT "trek_ratings_enjoyment_rating_check" CHECK ((("enjoyment_rating" >= 1) AND ("enjoyment_rating" <= 5))),
    CONSTRAINT "trek_ratings_scenic_rating_check" CHECK ((("scenic_rating" >= 1) AND ("scenic_rating" <= 5)))
);


ALTER TABLE "public"."trek_ratings" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_ratings" IS 'Stores user ratings for the overall trek.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_ratings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_ratings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_ratings_id_seq" OWNED BY "public"."trek_ratings"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_registrations" (
    "registration_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trek_id" integer NOT NULL,
    "booking_datetime" timestamp with time zone DEFAULT "now"(),
    "cancellation_datetime" timestamp with time zone,
    "penalty_applied" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "pickup_location_id" integer,
    "is_driver" boolean DEFAULT false,
    "payment_status" "text" DEFAULT 'Pending'::"text",
    "indemnity_agreed" boolean DEFAULT false,
    "id_verification_status" character varying(20) DEFAULT 'pending'::character varying,
    "id_verification_notes" "text",
    "indemnity_agreed_at" timestamp with time zone,
    "payment_proof_url" "text",
    "registrant_name" character varying(255),
    "registrant_phone" character varying(20)
);


ALTER TABLE "public"."trek_registrations" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_registrations" IS 'Tracks user registrations for treks.';



COMMENT ON COLUMN "public"."trek_registrations"."indemnity_agreed_at" IS 'Timestamp when the user agreed to the indemnity for this specific trek.';



COMMENT ON COLUMN "public"."trek_registrations"."payment_proof_url" IS 'URL of the uploaded payment proof image in Supabase Storage.';



COMMENT ON COLUMN "public"."trek_registrations"."registrant_name" IS 'Name of the person making the payment (may differ from user account name)';



COMMENT ON COLUMN "public"."trek_registrations"."registrant_phone" IS 'Phone number of the person making the payment (may differ from user account phone)';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_registrations_registration_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_registrations_registration_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_registrations_registration_id_seq" OWNED BY "public"."trek_registrations"."registration_id";



CREATE TABLE IF NOT EXISTS "public"."user_actions" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_actions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_actions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_actions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_actions_id_seq" OWNED BY "public"."user_actions"."id";



CREATE TABLE IF NOT EXISTS "public"."user_trek_images" (
    "id" bigint NOT NULL,
    "trek_id" integer NOT NULL,
    "uploaded_by" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "caption" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "rejection_reason" "text",
    CONSTRAINT "user_trek_images_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."user_trek_images" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_trek_images" IS 'User-contributed images for treks with admin moderation workflow';



COMMENT ON COLUMN "public"."user_trek_images"."caption" IS 'Optional user description of the image';



COMMENT ON COLUMN "public"."user_trek_images"."status" IS 'pending: awaiting review, approved: shown in gallery, rejected: not shown';



COMMENT ON COLUMN "public"."user_trek_images"."rejection_reason" IS 'Reason for rejection (for user feedback)';



CREATE SEQUENCE IF NOT EXISTS "public"."user_trek_images_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_trek_images_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_trek_images_id_seq" OWNED BY "public"."user_trek_images"."id";



CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" integer NOT NULL,
    "vote_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "votes_vote_type_check" CHECK (("vote_type" = ANY (ARRAY['up'::"text", 'down'::"text"])))
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."votes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."votes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."votes_id_seq" OWNED BY "public"."votes"."id";



ALTER TABLE ONLY "public"."comments" ALTER COLUMN "comment_id" SET DEFAULT "nextval"('"public"."comments_comment_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."community_posts" ALTER COLUMN "post_id" SET DEFAULT "nextval"('"public"."community_posts_post_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."expense_shares" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."expense_shares_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."forum_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."forum_categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."forum_posts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."forum_posts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."forum_tags" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."forum_tags_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."forum_threads" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."forum_threads_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."id_types" ALTER COLUMN "id_type_id" SET DEFAULT "nextval"('"public"."id_types_id_type_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."image_tag_assignments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."image_tag_assignments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."image_tags" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."image_tags_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."master_packing_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."master_packing_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."registration_id_proofs" ALTER COLUMN "proof_id" SET DEFAULT "nextval"('"public"."registration_id_proofs_proof_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."scheduled_notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."scheduled_notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."subscriptions_billing" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."subscriptions_billing_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tent_inventory" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tent_inventory_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tent_rentals" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tent_rentals_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tent_requests" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tent_requests_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tent_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tent_types_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_comments" ALTER COLUMN "comment_id" SET DEFAULT "nextval"('"public"."trek_comments_comment_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_costs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_costs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_driver_assignments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_driver_assignments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_drivers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_drivers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_event_images" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_event_images_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_event_videos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_event_videos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_events" ALTER COLUMN "trek_id" SET DEFAULT "nextval"('"public"."trek_events_trek_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_expense_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_expense_categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_expenses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_expenses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_id_requirements" ALTER COLUMN "requirement_id" SET DEFAULT "nextval"('"public"."trek_id_requirements_requirement_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_packing_items" ALTER COLUMN "item_id" SET DEFAULT "nextval"('"public"."trek_packing_items_item_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_packing_list_assignments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_packing_list_assignments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_participant_ratings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_participant_ratings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_pickup_locations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_pickup_locations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_ratings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_ratings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_registrations" ALTER COLUMN "registration_id" SET DEFAULT "nextval"('"public"."trek_registrations_registration_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_actions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_actions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_trek_images" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_trek_images_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."votes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."votes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."avatar_catalog"
    ADD CONSTRAINT "avatar_catalog_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("comment_id");



ALTER TABLE ONLY "public"."community_posts"
    ADD CONSTRAINT "community_posts_pkey" PRIMARY KEY ("post_id");



ALTER TABLE ONLY "public"."expense_shares"
    ADD CONSTRAINT "expense_shares_expense_id_user_id_key" UNIQUE ("expense_id", "user_id");



ALTER TABLE ONLY "public"."expense_shares"
    ADD CONSTRAINT "expense_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_categories"
    ADD CONSTRAINT "forum_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."forum_categories"
    ADD CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_posts"
    ADD CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_tags"
    ADD CONSTRAINT "forum_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."forum_tags"
    ADD CONSTRAINT "forum_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_tags"
    ADD CONSTRAINT "forum_tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."forum_thread_tags"
    ADD CONSTRAINT "forum_thread_tags_pkey" PRIMARY KEY ("thread_id", "tag_id");



ALTER TABLE ONLY "public"."forum_threads"
    ADD CONSTRAINT "forum_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."id_types"
    ADD CONSTRAINT "id_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."id_types"
    ADD CONSTRAINT "id_types_pkey" PRIMARY KEY ("id_type_id");



ALTER TABLE ONLY "public"."image_tag_assignments"
    ADD CONSTRAINT "image_tag_assignments_image_id_image_type_tag_id_key" UNIQUE ("image_id", "image_type", "tag_id");



ALTER TABLE ONLY "public"."image_tag_assignments"
    ADD CONSTRAINT "image_tag_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."image_tags"
    ADD CONSTRAINT "image_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."image_tags"
    ADD CONSTRAINT "image_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."master_packing_items"
    ADD CONSTRAINT "master_packing_items_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."master_packing_items"
    ADD CONSTRAINT "master_packing_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_packing_items"
    ADD CONSTRAINT "packing_items_pkey" PRIMARY KEY ("item_id");



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_pkey" PRIMARY KEY ("proof_id");



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_registration_id_id_type_id_key" UNIQUE ("registration_id", "id_type_id");



ALTER TABLE ONLY "public"."scheduled_notifications"
    ADD CONSTRAINT "scheduled_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."subscriptions_billing"
    ADD CONSTRAINT "subscriptions_billing_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tent_inventory"
    ADD CONSTRAINT "tent_inventory_event_id_tent_type_id_key" UNIQUE ("event_id", "tent_type_id");



ALTER TABLE ONLY "public"."tent_inventory"
    ADD CONSTRAINT "tent_inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tent_rentals"
    ADD CONSTRAINT "tent_rentals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tent_requests"
    ADD CONSTRAINT "tent_requests_event_id_user_id_tent_type_id_key" UNIQUE ("event_id", "user_id", "tent_type_id");



ALTER TABLE ONLY "public"."tent_requests"
    ADD CONSTRAINT "tent_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tent_types"
    ADD CONSTRAINT "tent_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tent_types"
    ADD CONSTRAINT "tent_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_comments"
    ADD CONSTRAINT "trek_comments_pkey" PRIMARY KEY ("comment_id");



ALTER TABLE ONLY "public"."trek_costs"
    ADD CONSTRAINT "trek_costs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_driver_assignments"
    ADD CONSTRAINT "trek_driver_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_driver_assignments"
    ADD CONSTRAINT "trek_driver_assignments_trek_id_driver_id_participant_id_key" UNIQUE ("trek_id", "driver_id", "participant_id");



ALTER TABLE ONLY "public"."trek_drivers"
    ADD CONSTRAINT "trek_drivers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_drivers"
    ADD CONSTRAINT "trek_drivers_trek_id_user_id_key" UNIQUE ("trek_id", "user_id");



ALTER TABLE ONLY "public"."trek_event_images"
    ADD CONSTRAINT "trek_event_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_event_videos"
    ADD CONSTRAINT "trek_event_videos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_events"
    ADD CONSTRAINT "trek_events_pkey" PRIMARY KEY ("trek_id");



ALTER TABLE ONLY "public"."trek_expense_categories"
    ADD CONSTRAINT "trek_expense_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."trek_expense_categories"
    ADD CONSTRAINT "trek_expense_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_expenses"
    ADD CONSTRAINT "trek_expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_id_requirements"
    ADD CONSTRAINT "trek_id_requirements_pkey" PRIMARY KEY ("requirement_id");



ALTER TABLE ONLY "public"."trek_id_requirements"
    ADD CONSTRAINT "trek_id_requirements_trek_id_id_type_id_key" UNIQUE ("trek_id", "id_type_id");



ALTER TABLE ONLY "public"."trek_packing_list_assignments"
    ADD CONSTRAINT "trek_packing_list_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_packing_list_assignments"
    ADD CONSTRAINT "trek_packing_list_assignments_trek_id_master_item_id_key" UNIQUE ("trek_id", "master_item_id");



ALTER TABLE ONLY "public"."trek_participant_ratings"
    ADD CONSTRAINT "trek_participant_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_participant_ratings"
    ADD CONSTRAINT "trek_participant_ratings_trek_id_rated_user_id_rated_by_use_key" UNIQUE ("trek_id", "rated_user_id", "rated_by_user_id");



ALTER TABLE ONLY "public"."trek_pickup_locations"
    ADD CONSTRAINT "trek_pickup_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_ratings"
    ADD CONSTRAINT "trek_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_ratings"
    ADD CONSTRAINT "trek_ratings_trek_id_user_id_key" UNIQUE ("trek_id", "user_id");



ALTER TABLE ONLY "public"."trek_registrations"
    ADD CONSTRAINT "trek_registrations_pkey" PRIMARY KEY ("registration_id");



ALTER TABLE ONLY "public"."user_actions"
    ADD CONSTRAINT "user_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_trek_images"
    ADD CONSTRAINT "user_trek_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_entity_type_entity_id_key" UNIQUE ("user_id", "entity_type", "entity_id");



CREATE INDEX "idx_avatar_catalog_category" ON "public"."avatar_catalog" USING "btree" ("category");



CREATE INDEX "idx_avatar_catalog_category_active" ON "public"."avatar_catalog" USING "btree" ("category", "active");



CREATE INDEX "idx_avatar_catalog_sort_order" ON "public"."avatar_catalog" USING "btree" ("sort_order");



CREATE INDEX "idx_forum_posts_author_id" ON "public"."forum_posts" USING "btree" ("author_id");



CREATE INDEX "idx_forum_posts_created_at" ON "public"."forum_posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_forum_posts_thread_id" ON "public"."forum_posts" USING "btree" ("thread_id");



CREATE INDEX "idx_forum_tags_slug" ON "public"."forum_tags" USING "btree" ("slug");



CREATE INDEX "idx_forum_tags_sort_order" ON "public"."forum_tags" USING "btree" ("sort_order");



CREATE INDEX "idx_forum_thread_tags_tag_id" ON "public"."forum_thread_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_forum_thread_tags_thread_id" ON "public"."forum_thread_tags" USING "btree" ("thread_id");



CREATE INDEX "idx_forum_threads_author_id" ON "public"."forum_threads" USING "btree" ("author_id");



CREATE INDEX "idx_forum_threads_category_id" ON "public"."forum_threads" USING "btree" ("category_id");



CREATE INDEX "idx_forum_threads_pinned_created" ON "public"."forum_threads" USING "btree" ("pinned", "created_at" DESC);



CREATE INDEX "idx_forum_threads_updated_at" ON "public"."forum_threads" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_image_tag_assignments_image" ON "public"."image_tag_assignments" USING "btree" ("image_id", "image_type");



CREATE INDEX "idx_image_tag_assignments_tag" ON "public"."image_tag_assignments" USING "btree" ("tag_id");



CREATE INDEX "idx_image_tags_name" ON "public"."image_tags" USING "btree" ("name");



CREATE INDEX "idx_notifications_user_status" ON "public"."notifications" USING "btree" ("user_id", "status");



CREATE INDEX "idx_registration_id_proofs_registration_id" ON "public"."registration_id_proofs" USING "btree" ("registration_id");



CREATE INDEX "idx_registration_id_proofs_verification_status" ON "public"."registration_id_proofs" USING "btree" ("verification_status");



CREATE INDEX "idx_tent_inventory_event_id" ON "public"."tent_inventory" USING "btree" ("event_id");



CREATE INDEX "idx_tent_rentals_trek_id" ON "public"."tent_rentals" USING "btree" ("trek_id");



CREATE INDEX "idx_tent_requests_event_user" ON "public"."tent_requests" USING "btree" ("event_id", "user_id");



CREATE INDEX "idx_tent_requests_status" ON "public"."tent_requests" USING "btree" ("status");



CREATE INDEX "idx_trek_costs_cost_type" ON "public"."trek_costs" USING "btree" ("cost_type");



CREATE INDEX "idx_trek_costs_trek_id" ON "public"."trek_costs" USING "btree" ("trek_id");



CREATE INDEX "idx_trek_event_images_position" ON "public"."trek_event_images" USING "btree" ("trek_id", "position");



CREATE INDEX "idx_trek_event_images_trek_id" ON "public"."trek_event_images" USING "btree" ("trek_id");



CREATE INDEX "idx_trek_events_event_type" ON "public"."trek_events" USING "btree" ("event_type");



CREATE INDEX "idx_trek_events_government_id_required" ON "public"."trek_events" USING "btree" ("government_id_required");



CREATE INDEX "idx_trek_events_status" ON "public"."trek_events" USING "btree" ("status");



CREATE INDEX "idx_trek_id_requirements_id_type" ON "public"."trek_id_requirements" USING "btree" ("id_type_id");



CREATE INDEX "idx_trek_id_requirements_trek_id" ON "public"."trek_id_requirements" USING "btree" ("trek_id");



CREATE INDEX "idx_trek_packing_list_assignments_item_id" ON "public"."trek_packing_list_assignments" USING "btree" ("master_item_id");



CREATE INDEX "idx_trek_packing_list_assignments_trek_id" ON "public"."trek_packing_list_assignments" USING "btree" ("trek_id");



CREATE INDEX "idx_trek_registrations_id_verification_status" ON "public"."trek_registrations" USING "btree" ("id_verification_status");



CREATE INDEX "idx_trek_registrations_trek_id" ON "public"."trek_registrations" USING "btree" ("trek_id");



CREATE INDEX "idx_trek_registrations_user_id" ON "public"."trek_registrations" USING "btree" ("user_id");



CREATE INDEX "idx_user_actions_user_type_created" ON "public"."user_actions" USING "btree" ("user_id", "action_type", "created_at" DESC);



CREATE INDEX "idx_user_trek_images_created_at" ON "public"."user_trek_images" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_trek_images_status" ON "public"."user_trek_images" USING "btree" ("status");



CREATE INDEX "idx_user_trek_images_trek_id" ON "public"."user_trek_images" USING "btree" ("trek_id");



CREATE INDEX "idx_user_trek_images_uploaded_by" ON "public"."user_trek_images" USING "btree" ("uploaded_by");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_user_id" ON "public"."users" USING "btree" ("user_id");



CREATE INDEX "idx_users_user_type" ON "public"."users" USING "btree" ("user_type");



CREATE UNIQUE INDEX "ux_trek_event_videos_unique_trek" ON "public"."trek_event_videos" USING "btree" ("trek_id");



CREATE OR REPLACE TRIGGER "sync_body_to_comment_text" BEFORE INSERT OR UPDATE OF "body" ON "public"."trek_comments" FOR EACH ROW WHEN ((("new"."body" IS NOT NULL) AND (("new"."comment_text" IS NULL) OR ("new"."comment_text" IS DISTINCT FROM "new"."body")))) EXECUTE FUNCTION "public"."sync_body_to_comment_text"();



CREATE OR REPLACE TRIGGER "sync_comment_text_to_body" BEFORE INSERT OR UPDATE OF "comment_text" ON "public"."trek_comments" FOR EACH ROW WHEN ((("new"."comment_text" IS NOT NULL) AND (("new"."body" IS NULL) OR ("new"."body" IS DISTINCT FROM "new"."comment_text")))) EXECUTE FUNCTION "public"."sync_comment_text_to_body"();



CREATE OR REPLACE TRIGGER "trg_enforce_max_five_images" BEFORE INSERT ON "public"."trek_event_images" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_max_five_images"();



CREATE OR REPLACE TRIGGER "trg_enforce_max_one_video" BEFORE INSERT ON "public"."trek_event_videos" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_max_one_video"();



CREATE OR REPLACE TRIGGER "trg_site_settings_updated_at" BEFORE UPDATE ON "public"."site_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_users_sync_avatar" BEFORE INSERT OR UPDATE OF "avatar_key" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."sync_avatar_url_from_key"();



CREATE OR REPLACE TRIGGER "update_tent_inventory_updated_at" BEFORE UPDATE ON "public"."tent_inventory" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tent_requests_updated_at" BEFORE UPDATE ON "public"."tent_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tent_types_updated_at" BEFORE UPDATE ON "public"."tent_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_trek_costs_updated_at" BEFORE UPDATE ON "public"."trek_costs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id");



ALTER TABLE ONLY "public"."community_posts"
    ADD CONSTRAINT "community_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expense_shares"
    ADD CONSTRAINT "expense_shares_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."trek_expenses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expense_shares"
    ADD CONSTRAINT "expense_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_categories"
    ADD CONSTRAINT "forum_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."forum_posts"
    ADD CONSTRAINT "forum_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_posts"
    ADD CONSTRAINT "forum_posts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_posts"
    ADD CONSTRAINT "forum_posts_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_thread_tags"
    ADD CONSTRAINT "forum_thread_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."forum_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_thread_tags"
    ADD CONSTRAINT "forum_thread_tags_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_threads"
    ADD CONSTRAINT "forum_threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_threads"
    ADD CONSTRAINT "forum_threads_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."image_tag_assignments"
    ADD CONSTRAINT "image_tag_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."image_tag_assignments"
    ADD CONSTRAINT "image_tag_assignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."image_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."image_tags"
    ADD CONSTRAINT "image_tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_id_type_id_fkey" FOREIGN KEY ("id_type_id") REFERENCES "public"."id_types"("id_type_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "public"."trek_registrations"("registration_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."scheduled_notifications"
    ADD CONSTRAINT "scheduled_notifications_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."scheduled_notifications"
    ADD CONSTRAINT "scheduled_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions_billing"
    ADD CONSTRAINT "subscriptions_billing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id");



ALTER TABLE ONLY "public"."tent_inventory"
    ADD CONSTRAINT "tent_inventory_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tent_inventory"
    ADD CONSTRAINT "tent_inventory_tent_type_id_fkey" FOREIGN KEY ("tent_type_id") REFERENCES "public"."tent_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tent_rentals"
    ADD CONSTRAINT "tent_rentals_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tent_requests"
    ADD CONSTRAINT "tent_requests_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tent_requests"
    ADD CONSTRAINT "tent_requests_tent_type_id_fkey" FOREIGN KEY ("tent_type_id") REFERENCES "public"."tent_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tent_requests"
    ADD CONSTRAINT "tent_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_comments"
    ADD CONSTRAINT "trek_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."trek_comments"("comment_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_comments"
    ADD CONSTRAINT "trek_comments_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_comments"
    ADD CONSTRAINT "trek_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_costs"
    ADD CONSTRAINT "trek_costs_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_driver_assignments"
    ADD CONSTRAINT "trek_driver_assignments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_driver_assignments"
    ADD CONSTRAINT "trek_driver_assignments_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_driver_assignments"
    ADD CONSTRAINT "trek_driver_assignments_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_drivers"
    ADD CONSTRAINT "trek_drivers_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_drivers"
    ADD CONSTRAINT "trek_drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_event_images"
    ADD CONSTRAINT "trek_event_images_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_event_videos"
    ADD CONSTRAINT "trek_event_videos_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_events"
    ADD CONSTRAINT "trek_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trek_events"
    ADD CONSTRAINT "trek_events_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("user_id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trek_expenses"
    ADD CONSTRAINT "trek_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."trek_expense_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trek_expenses"
    ADD CONSTRAINT "trek_expenses_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_expenses"
    ADD CONSTRAINT "trek_expenses_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_id_requirements"
    ADD CONSTRAINT "trek_id_requirements_id_type_id_fkey" FOREIGN KEY ("id_type_id") REFERENCES "public"."id_types"("id_type_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_id_requirements"
    ADD CONSTRAINT "trek_id_requirements_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_packing_list_assignments"
    ADD CONSTRAINT "trek_packing_list_assignments_master_item_id_fkey" FOREIGN KEY ("master_item_id") REFERENCES "public"."master_packing_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_packing_list_assignments"
    ADD CONSTRAINT "trek_packing_list_assignments_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_participant_ratings"
    ADD CONSTRAINT "trek_participant_ratings_rated_by_user_id_fkey" FOREIGN KEY ("rated_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_participant_ratings"
    ADD CONSTRAINT "trek_participant_ratings_rated_user_id_fkey" FOREIGN KEY ("rated_user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_participant_ratings"
    ADD CONSTRAINT "trek_participant_ratings_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_pickup_locations"
    ADD CONSTRAINT "trek_pickup_locations_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_ratings"
    ADD CONSTRAINT "trek_ratings_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_ratings"
    ADD CONSTRAINT "trek_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_registrations"
    ADD CONSTRAINT "trek_registrations_pickup_location_id_fkey" FOREIGN KEY ("pickup_location_id") REFERENCES "public"."trek_pickup_locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trek_registrations"
    ADD CONSTRAINT "trek_registrations_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_registrations"
    ADD CONSTRAINT "trek_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_actions"
    ADD CONSTRAINT "user_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_trek_images"
    ADD CONSTRAINT "user_trek_images_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_trek_images"
    ADD CONSTRAINT "user_trek_images_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_trek_images"
    ADD CONSTRAINT "user_trek_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_avatar_key_fk" FOREIGN KEY ("avatar_key") REFERENCES "public"."avatar_catalog"("key");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



CREATE POLICY "Admin full access to trek costs" ON "public"."trek_costs" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can delete any image" ON "public"."user_trek_images" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can manage all tent requests" ON "public"."tent_requests" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can manage image tags" ON "public"."image_tags" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can manage tent inventory" ON "public"."tent_inventory" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can manage tent types" ON "public"."tent_types" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can manage trek images" ON "public"."trek_event_images" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can manage trek videos" ON "public"."trek_event_videos" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can moderate image status" ON "public"."user_trek_images" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can verify ID proofs" ON "public"."registration_id_proofs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Admins can view all images for moderation" ON "public"."user_trek_images" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Allow admin full access to master packing items" ON "public"."master_packing_items" USING (true);



CREATE POLICY "Allow admin full access to trek packing assignments" ON "public"."trek_packing_list_assignments" USING (true);



CREATE POLICY "Allow admins to manage all treks" ON "public"."trek_events" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Allow admins to update verification status" ON "public"."users" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."user_id" = "auth"."uid"()) AND ("u"."user_type" = 'admin'::"public"."user_type_enum"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."user_id" = "auth"."uid"()) AND ("u"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "Allow all users to view treks" ON "public"."trek_events" FOR SELECT USING (true);



CREATE POLICY "Allow authenticated users to create forum categories" ON "public"."forum_categories" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to create posts" ON "public"."forum_posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Allow authenticated users to create threads" ON "public"."forum_threads" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Allow authenticated users to create treks" ON "public"."trek_events" FOR INSERT TO "authenticated" WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to view all treks" ON "public"."trek_events" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to vote" ON "public"."votes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow backend to insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow backend to manage scheduled notifications" ON "public"."scheduled_notifications" USING (true);



CREATE POLICY "Allow cost deletion for creators and admins" ON "public"."trek_costs" FOR DELETE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))) OR (EXISTS ( SELECT 1
   FROM "public"."trek_events"
  WHERE (("trek_events"."trek_id" = "trek_costs"."trek_id") AND ("trek_events"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Allow cost insertion for authenticated users" ON "public"."trek_costs" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))) OR (EXISTS ( SELECT 1
   FROM "public"."trek_events"
  WHERE (("trek_events"."trek_id" = "trek_costs"."trek_id") AND ("trek_events"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Allow delete for authenticated users" ON "public"."trek_packing_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow expense creator to delete shares (before paid?)" ON "public"."expense_shares" FOR DELETE USING (true);



CREATE POLICY "Allow expense creator to insert shares" ON "public"."expense_shares" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow individual user read access" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow individual user update access" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow insert for authenticated users" ON "public"."trek_packing_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert participant ratings" ON "public"."trek_participant_ratings" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert trek ratings" ON "public"."trek_ratings" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow partners to manage their treks" ON "public"."trek_events" TO "authenticated" USING (("partner_id" = "auth"."uid"()));



CREATE POLICY "Allow post authors to update posts" ON "public"."forum_posts" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Allow public read access" ON "public"."community_posts" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to forum categories" ON "public"."forum_categories" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to forum posts" ON "public"."forum_posts" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to forum threads" ON "public"."forum_threads" FOR SELECT USING (true);



CREATE POLICY "Allow public view of past treks" ON "public"."trek_events" FOR SELECT USING (("start_datetime" < "now"()));



CREATE POLICY "Allow read access to ID types" ON "public"."id_types" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all for trek comments" ON "public"."trek_comments" FOR SELECT USING (true);



CREATE POLICY "Allow read access to expense categories" ON "public"."trek_expense_categories" FOR SELECT USING (true);



CREATE POLICY "Allow read access to master packing items" ON "public"."master_packing_items" FOR SELECT USING (true);



CREATE POLICY "Allow read access to participant ratings" ON "public"."trek_participant_ratings" FOR SELECT USING (true);



CREATE POLICY "Allow read access to scheduled notifications" ON "public"."scheduled_notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow read access to transport info" ON "public"."trek_driver_assignments" FOR SELECT USING (true);



CREATE POLICY "Allow read access to transport info" ON "public"."trek_drivers" FOR SELECT USING (true);



CREATE POLICY "Allow read access to transport info" ON "public"."trek_pickup_locations" FOR SELECT USING (true);



CREATE POLICY "Allow read access to trek ID requirements" ON "public"."trek_id_requirements" FOR SELECT USING (true);



CREATE POLICY "Allow read access to trek events" ON "public"."trek_events" FOR SELECT USING (true);



CREATE POLICY "Allow read access to trek packing assignments" ON "public"."trek_packing_list_assignments" FOR SELECT USING (true);



CREATE POLICY "Allow read access to trek ratings" ON "public"."trek_ratings" FOR SELECT USING (true);



CREATE POLICY "Allow read access to trek registrations" ON "public"."trek_registrations" FOR SELECT USING (true);



CREATE POLICY "Allow read access to users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Allow select for authenticated users" ON "public"."trek_packing_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow thread authors to update threads" ON "public"."forum_threads" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Allow update for authenticated users" ON "public"."trek_packing_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow update participant ratings" ON "public"."trek_participant_ratings" FOR UPDATE USING (true);



CREATE POLICY "Allow update trek ratings" ON "public"."trek_ratings" FOR UPDATE USING (true);



CREATE POLICY "Allow user signup" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow users to delete own expenses" ON "public"."trek_expenses" FOR DELETE USING (true);



CREATE POLICY "Allow users to delete their own comments" ON "public"."trek_comments" FOR DELETE USING (true);



CREATE POLICY "Allow users to delete their own votes" ON "public"."votes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert comments" ON "public"."trek_comments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow users to insert expenses for their treks" ON "public"."trek_expenses" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow users to select their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update own expenses" ON "public"."trek_expenses" FOR UPDATE USING (true);



CREATE POLICY "Allow users to update status of their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update status/payment for their shares" ON "public"."expense_shares" FOR UPDATE USING (true);



CREATE POLICY "Allow users to update their own comments" ON "public"."trek_comments" FOR UPDATE USING (true);



CREATE POLICY "Allow users to update their own votes" ON "public"."votes" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update verification docs" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK ((("auth"."uid"() = "user_id") AND (("verification_status" = ( SELECT "users_1"."verification_status"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."user_id" = "auth"."uid"()))) OR (("verification_status" = 'PENDING_REVIEW'::"public"."user_verification_status") AND (( SELECT "users_1"."verification_status"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."user_id" = "auth"."uid"())) = 'NOT_SUBMITTED'::"public"."user_verification_status")))));



CREATE POLICY "Allow users to view expenses for their treks" ON "public"."trek_expenses" FOR SELECT USING (true);



CREATE POLICY "Allow users to view shares they are part of" ON "public"."expense_shares" FOR SELECT USING (true);



CREATE POLICY "Allow users to view votes" ON "public"."votes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view tent inventory" ON "public"."tent_inventory" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Anyone can view tent types" ON "public"."tent_types" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can view trek costs" ON "public"."trek_costs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Everyone can view approved user images" ON "public"."user_trek_images" FOR SELECT USING (("status" = 'approved'::"text"));



CREATE POLICY "Everyone can view image tags" ON "public"."image_tags" FOR SELECT USING (true);



CREATE POLICY "Everyone can view tag assignments" ON "public"."image_tag_assignments" FOR SELECT USING (true);



CREATE POLICY "Everyone can view trek event images" ON "public"."trek_event_images" FOR SELECT USING (true);



CREATE POLICY "Everyone can view trek videos" ON "public"."trek_event_videos" FOR SELECT USING (true);



CREATE POLICY "Public read access for tent rentals" ON "public"."tent_rentals" FOR SELECT USING (true);



CREATE POLICY "Trek creators can manage trek costs" ON "public"."trek_costs" TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))) OR (EXISTS ( SELECT 1
   FROM "public"."trek_events"
  WHERE (("trek_events"."trek_id" = "trek_costs"."trek_id") AND ("trek_events"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Users can assign tags to own images" ON "public"."image_tag_assignments" FOR INSERT TO "authenticated" WITH CHECK ((((("image_type")::"text" = 'user_image'::"text") AND ("assigned_by" = "auth"."uid"())) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum"))))));



CREATE POLICY "Users can contribute images" ON "public"."user_trek_images" FOR INSERT TO "authenticated" WITH CHECK (("uploaded_by" = "auth"."uid"()));



CREATE POLICY "Users can create their own tent requests" ON "public"."tent_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own pending images" ON "public"."user_trek_images" FOR DELETE TO "authenticated" USING ((("uploaded_by" = "auth"."uid"()) AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can delete own tag assignments" ON "public"."image_tag_assignments" FOR DELETE TO "authenticated" USING ((((("image_type")::"text" = 'user_image'::"text") AND ("assigned_by" = "auth"."uid"())) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum"))))));



CREATE POLICY "Users can manage own pending images" ON "public"."user_trek_images" TO "authenticated" USING ((("uploaded_by" = "auth"."uid"()) AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can manage their own posts" ON "public"."community_posts" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read profiles" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Users can update own pending images" ON "public"."user_trek_images" FOR UPDATE TO "authenticated" USING ((("uploaded_by" = "auth"."uid"()) AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can update own tag assignments" ON "public"."image_tag_assignments" FOR UPDATE TO "authenticated" USING ((((("image_type")::"text" = 'user_image'::"text") AND ("assigned_by" = "auth"."uid"())) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum"))))));



CREATE POLICY "Users can update their own pending tent requests" ON "public"."tent_requests" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND (("status")::"text" = 'pending'::"text")));



CREATE POLICY "Users can update their profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can upload own ID proofs" ON "public"."registration_id_proofs" FOR INSERT WITH CHECK ((("auth"."uid"())::"text" = ("uploaded_by")::"text"));



CREATE POLICY "Users can view own ID proofs" ON "public"."registration_id_proofs" FOR SELECT USING (((("auth"."uid"())::"text" = ("uploaded_by")::"text") OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum"))))));



CREATE POLICY "Users can view their own tent requests" ON "public"."tent_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view trek images" ON "public"."trek_event_images" FOR SELECT USING (true);



CREATE POLICY "authenticated_read_all" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."avatar_catalog" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "avatar_catalog_admin_all" ON "public"."avatar_catalog" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "avatar_catalog_read_active" ON "public"."avatar_catalog" FOR SELECT USING (("active" = true));



ALTER TABLE "public"."community_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_shares" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forum_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_categories_admin_all" ON "public"."forum_categories" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "forum_categories_read_auth" ON "public"."forum_categories" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."forum_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_posts_admin_all" ON "public"."forum_posts" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "forum_posts_delete_own" ON "public"."forum_posts" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "author_id") AND ("deleted_at" IS NULL))) WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "forum_posts_insert_auth" ON "public"."forum_posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "forum_posts_read_auth" ON "public"."forum_posts" FOR SELECT TO "authenticated" USING (("deleted_at" IS NULL));



CREATE POLICY "forum_posts_update_own" ON "public"."forum_posts" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "author_id") AND ("deleted_at" IS NULL))) WITH CHECK ((("auth"."uid"() = "author_id") AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."forum_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_tags_admin_all" ON "public"."forum_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "forum_tags_read_all" ON "public"."forum_tags" FOR SELECT USING (true);



ALTER TABLE "public"."forum_thread_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_thread_tags_admin_all" ON "public"."forum_thread_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "forum_thread_tags_delete_own" ON "public"."forum_thread_tags" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."forum_threads" "ft"
  WHERE (("ft"."id" = "forum_thread_tags"."thread_id") AND ("ft"."author_id" = "auth"."uid"())))));



CREATE POLICY "forum_thread_tags_insert_auth" ON "public"."forum_thread_tags" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "forum_thread_tags_read_all" ON "public"."forum_thread_tags" FOR SELECT USING (true);



ALTER TABLE "public"."forum_threads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_threads_admin_update" ON "public"."forum_threads" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"public"."user_type_enum")))));



CREATE POLICY "forum_threads_insert_auth" ON "public"."forum_threads" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "forum_threads_read_auth" ON "public"."forum_threads" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "forum_threads_update_own" ON "public"."forum_threads" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "author_id")) WITH CHECK (("auth"."uid"() = "author_id"));



ALTER TABLE "public"."id_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."image_tag_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."image_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."master_packing_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_read_registrations" ON "public"."trek_registrations" FOR SELECT USING (true);



ALTER TABLE "public"."registration_id_proofs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scheduled_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "site_settings_read" ON "public"."site_settings" FOR SELECT USING (true);



CREATE POLICY "site_settings_write_admins" ON "public"."site_settings" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."user_id" = "auth"."uid"()) AND ("u"."user_type" = 'admin'::"public"."user_type_enum"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."user_id" = "auth"."uid"()) AND ("u"."user_type" = 'admin'::"public"."user_type_enum")))));



ALTER TABLE "public"."tent_inventory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tent_rentals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tent_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tent_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_costs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_driver_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_drivers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_event_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_event_videos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_expense_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_id_requirements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_packing_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_packing_list_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_participant_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_pickup_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_registrations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_insert_own" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_own_profile_update" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_own_registrations_insert" ON "public"."trek_registrations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_own_registrations_read" ON "public"."trek_registrations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "user_own_registrations_update" ON "public"."trek_registrations" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_select_own" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_trek_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_update_own" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."add_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."add_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_post"("p_post_id" bigint, "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_post"("p_post_id" bigint, "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_post"("p_post_id" bigint, "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_thread"("p_thread_id" bigint, "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_thread"("p_thread_id" bigint, "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_thread"("p_thread_id" bigint, "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."assign_image_tags"("p_image_id" bigint, "p_image_type" "text", "p_tag_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."assign_image_tags"("p_image_id" bigint, "p_image_type" "text", "p_tag_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_image_tags"("p_image_id" bigint, "p_image_type" "text", "p_tag_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_action_type" "text", "p_limit_per_hour" integer, "p_window_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_action_type" "text", "p_limit_per_hour" integer, "p_window_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_action_type" "text", "p_limit_per_hour" integer, "p_window_minutes" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_rate_limit_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_rate_limit_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_rate_limit_data"() TO "service_role";



GRANT ALL ON TABLE "public"."forum_categories" TO "anon";
GRANT ALL ON TABLE "public"."forum_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_categories" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_forum_category"("p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_forum_category"("p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_forum_category"("p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) TO "service_role";



GRANT ALL ON TABLE "public"."forum_posts" TO "anon";
GRANT ALL ON TABLE "public"."forum_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_posts" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_forum_post"("p_thread_id" bigint, "p_content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_forum_post"("p_thread_id" bigint, "p_content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_forum_post"("p_thread_id" bigint, "p_content" "text") TO "service_role";



GRANT ALL ON TABLE "public"."forum_threads" TO "anon";
GRANT ALL ON TABLE "public"."forum_threads" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_threads" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_forum_thread"("p_category_id" bigint, "p_title" "text", "p_content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_forum_thread"("p_category_id" bigint, "p_title" "text", "p_content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_forum_thread"("p_category_id" bigint, "p_title" "text", "p_content" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_forum_thread_with_tags"("p_category_id" bigint, "p_title" "text", "p_content" "text", "p_tag_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_forum_thread_with_tags"("p_category_id" bigint, "p_title" "text", "p_content" "text", "p_tag_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_forum_thread_with_tags"("p_category_id" bigint, "p_title" "text", "p_content" "text", "p_tag_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_link" "text", "p_type" "text", "p_trek_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_link" "text", "p_type" "text", "p_trek_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_link" "text", "p_type" "text", "p_trek_id" integer) TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_type" "public"."notification_type_enum", "p_link" "text", "p_trek_id" integer, "p_related_entity_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_type" "public"."notification_type_enum", "p_link" "text", "p_trek_id" integer, "p_related_entity_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_type" "public"."notification_type_enum", "p_link" "text", "p_trek_id" integer, "p_related_entity_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_forum_category"("p_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_forum_category"("p_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_forum_category"("p_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_max_five_images"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_max_five_images"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_max_five_images"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_max_one_video"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_max_one_video"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_max_one_video"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_image_tags"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_image_tags"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_image_tags"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_avatar_catalog"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_avatar_catalog"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_avatar_catalog"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_forum_tags"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_forum_tags"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_forum_tags"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_image_tags"("p_image_id" bigint, "p_image_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_image_tags"("p_image_id" bigint, "p_image_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_image_tags"("p_image_id" bigint, "p_image_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_notifications"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_notifications"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_notifications"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_notifications"("page_size" integer, "page_num" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_notifications"("page_size" integer, "page_num" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_notifications"("page_size" integer, "page_num" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_tent_reserved_count"("trek_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_tent_reserved_count"("trek_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_tent_reserved_count"("trek_id_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_threads_by_tag"("p_tag_slug" character varying, "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_threads_by_tag"("p_tag_slug" character varying, "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_threads_by_tag"("p_tag_slug" character varying, "p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trek_media"("p_trek_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_trek_media"("p_trek_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trek_media"("p_trek_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trek_participant_count"("trek_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_trek_participant_count"("trek_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trek_participant_count"("trek_id_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trek_required_id_types"("trek_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_trek_required_id_types"("trek_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trek_required_id_types"("trek_id_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_contribution_stats"("p_trek_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_contribution_stats"("p_trek_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_contribution_stats"("p_trek_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_notifications"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_notifications"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_notifications"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_all_my_notifications_as_read"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_all_my_notifications_as_read"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_my_notifications_as_read"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_all_notifications_as_read"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_as_read"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_as_read"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_all_notifications_as_read"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_as_read"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_as_read"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("notification_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("notification_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("notification_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" bigint, "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" bigint, "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" bigint, "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."promote_user_image_to_official"("p_user_image_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."promote_user_image_to_official"("p_user_image_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."promote_user_image_to_official"("p_user_image_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."record_user_action"("p_user_id" "uuid", "p_action_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."record_user_action"("p_user_id" "uuid", "p_action_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_user_action"("p_user_id" "uuid", "p_action_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."remove_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_images_by_tags"("p_tag_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."search_images_by_tags"("p_tag_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_images_by_tags"("p_tag_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_avatar"("p_avatar_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_avatar"("p_avatar_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_avatar"("p_avatar_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_avatar_url_from_key"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_avatar_url_from_key"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_avatar_url_from_key"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_body_to_comment_text"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_body_to_comment_text"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_body_to_comment_text"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_comment_text_to_body"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_comment_text_to_body"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_comment_text_to_body"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_thread_lock"("p_thread_id" bigint, "p_lock" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_thread_lock"("p_thread_id" bigint, "p_lock" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_thread_lock"("p_thread_id" bigint, "p_lock" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_thread_pin"("p_thread_id" bigint, "p_pin" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_thread_pin"("p_thread_id" bigint, "p_pin" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_thread_pin"("p_thread_id" bigint, "p_pin" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_forum_category"("p_id" bigint, "p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_forum_category"("p_id" bigint, "p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_forum_category"("p_id" bigint, "p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tent_reserved_count"("p_event_id" integer, "p_tent_type_id" integer, "p_quantity_change" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_tent_reserved_count"("p_event_id" integer, "p_tent_type_id" integer, "p_quantity_change" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tent_reserved_count"("p_event_id" integer, "p_tent_type_id" integer, "p_quantity_change" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_approved_id_proofs"("user_id_param" "uuid", "trek_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_approved_id_proofs"("user_id_param" "uuid", "trek_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_approved_id_proofs"("user_id_param" "uuid", "trek_id_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_cost_type"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_cost_type"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_cost_type"() TO "service_role";


















GRANT ALL ON TABLE "public"."avatar_catalog" TO "anon";
GRANT ALL ON TABLE "public"."avatar_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."avatar_catalog" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comments_comment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_comment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_comment_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."community_posts" TO "anon";
GRANT ALL ON TABLE "public"."community_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."community_posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."community_posts_post_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."community_posts_post_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."community_posts_post_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."expense_shares" TO "anon";
GRANT ALL ON TABLE "public"."expense_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_shares" TO "service_role";



GRANT ALL ON SEQUENCE "public"."expense_shares_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expense_shares_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expense_shares_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."forum_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."forum_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."forum_categories_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."forum_posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."forum_posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."forum_posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."forum_tags" TO "anon";
GRANT ALL ON TABLE "public"."forum_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."forum_tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."forum_tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."forum_tags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."forum_thread_tags" TO "anon";
GRANT ALL ON TABLE "public"."forum_thread_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_thread_tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."forum_threads_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."forum_threads_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."forum_threads_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."id_types" TO "anon";
GRANT ALL ON TABLE "public"."id_types" TO "authenticated";
GRANT ALL ON TABLE "public"."id_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."id_types_id_type_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."id_types_id_type_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."id_types_id_type_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."image_tag_assignments" TO "anon";
GRANT ALL ON TABLE "public"."image_tag_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."image_tag_assignments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."image_tag_assignments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."image_tag_assignments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."image_tag_assignments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."image_tags" TO "anon";
GRANT ALL ON TABLE "public"."image_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."image_tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."image_tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."image_tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."image_tags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."master_packing_items" TO "anon";
GRANT ALL ON TABLE "public"."master_packing_items" TO "authenticated";
GRANT ALL ON TABLE "public"."master_packing_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."master_packing_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."master_packing_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."master_packing_items_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."registration_id_proofs" TO "anon";
GRANT ALL ON TABLE "public"."registration_id_proofs" TO "authenticated";
GRANT ALL ON TABLE "public"."registration_id_proofs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."registration_id_proofs_proof_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."registration_id_proofs_proof_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."registration_id_proofs_proof_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."scheduled_notifications" TO "anon";
GRANT ALL ON TABLE "public"."scheduled_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduled_notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."scheduled_notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."scheduled_notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."scheduled_notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions_billing" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions_billing" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions_billing" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subscriptions_billing_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subscriptions_billing_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subscriptions_billing_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tent_inventory" TO "anon";
GRANT ALL ON TABLE "public"."tent_inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."tent_inventory" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tent_inventory_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tent_inventory_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tent_inventory_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tent_rentals" TO "anon";
GRANT ALL ON TABLE "public"."tent_rentals" TO "authenticated";
GRANT ALL ON TABLE "public"."tent_rentals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tent_rentals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tent_rentals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tent_rentals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tent_requests" TO "anon";
GRANT ALL ON TABLE "public"."tent_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."tent_requests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tent_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tent_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tent_requests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tent_types" TO "anon";
GRANT ALL ON TABLE "public"."tent_types" TO "authenticated";
GRANT ALL ON TABLE "public"."tent_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tent_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tent_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tent_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_comments" TO "anon";
GRANT ALL ON TABLE "public"."trek_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_comments_comment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_comments_comment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_comments_comment_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_costs" TO "anon";
GRANT ALL ON TABLE "public"."trek_costs" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_costs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_costs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_costs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_costs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_driver_assignments" TO "anon";
GRANT ALL ON TABLE "public"."trek_driver_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_driver_assignments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_driver_assignments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_driver_assignments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_driver_assignments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_drivers" TO "anon";
GRANT ALL ON TABLE "public"."trek_drivers" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_drivers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_drivers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_drivers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_drivers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_event_images" TO "anon";
GRANT ALL ON TABLE "public"."trek_event_images" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_event_images" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_event_images_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_event_images_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_event_images_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_event_videos" TO "anon";
GRANT ALL ON TABLE "public"."trek_event_videos" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_event_videos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_event_videos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_event_videos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_event_videos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_events" TO "anon";
GRANT ALL ON TABLE "public"."trek_events" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_events_trek_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_events_trek_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_events_trek_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_expense_categories" TO "anon";
GRANT ALL ON TABLE "public"."trek_expense_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_expense_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_expense_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_expense_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_expense_categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_expenses" TO "anon";
GRANT ALL ON TABLE "public"."trek_expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_expenses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_expenses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_expenses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_expenses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_id_requirements" TO "anon";
GRANT ALL ON TABLE "public"."trek_id_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_id_requirements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_id_requirements_requirement_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_id_requirements_requirement_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_id_requirements_requirement_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_packing_items" TO "anon";
GRANT ALL ON TABLE "public"."trek_packing_items" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_packing_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_packing_items_item_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_packing_items_item_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_packing_items_item_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_packing_list_assignments" TO "anon";
GRANT ALL ON TABLE "public"."trek_packing_list_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_packing_list_assignments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_packing_list_assignments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_packing_list_assignments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_packing_list_assignments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_participant_ratings" TO "anon";
GRANT ALL ON TABLE "public"."trek_participant_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_participant_ratings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_participant_ratings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_participant_ratings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_participant_ratings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_pickup_locations" TO "anon";
GRANT ALL ON TABLE "public"."trek_pickup_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_pickup_locations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_pickup_locations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_pickup_locations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_pickup_locations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_ratings" TO "anon";
GRANT ALL ON TABLE "public"."trek_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_ratings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_ratings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_ratings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_ratings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_registrations" TO "anon";
GRANT ALL ON TABLE "public"."trek_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_registrations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_registrations_registration_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_registrations_registration_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_registrations_registration_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_actions" TO "anon";
GRANT ALL ON TABLE "public"."user_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_actions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_actions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_actions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_actions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_trek_images" TO "anon";
GRANT ALL ON TABLE "public"."user_trek_images" TO "authenticated";
GRANT ALL ON TABLE "public"."user_trek_images" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_trek_images_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_trek_images_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_trek_images_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
