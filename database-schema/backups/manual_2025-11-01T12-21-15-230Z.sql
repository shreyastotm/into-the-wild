

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


CREATE SCHEMA IF NOT EXISTS "app_auth";


ALTER SCHEMA "app_auth" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."avatar_category_enum" AS ENUM (
    'animal',
    'bird',
    'insect'
);


ALTER TYPE "public"."avatar_category_enum" OWNER TO "postgres";


CREATE TYPE "public"."event_creator_type" AS ENUM (
    'internal',
    'external'
);


ALTER TYPE "public"."event_creator_type" OWNER TO "postgres";


CREATE TYPE "public"."id_verification_status" AS ENUM (
    'Pending',
    'Verified',
    'Rejected'
);


ALTER TYPE "public"."id_verification_status" OWNER TO "postgres";


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


CREATE TYPE "public"."nudge_priority_enum" AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE "public"."nudge_priority_enum" OWNER TO "postgres";


CREATE TYPE "public"."nudge_trigger_enum" AS ENUM (
    'onboarding',
    'engagement',
    'retention',
    'conversion',
    'social'
);


ALTER TYPE "public"."nudge_trigger_enum" OWNER TO "postgres";


CREATE TYPE "public"."nudge_type_enum" AS ENUM (
    'contextual',
    'milestone',
    'social_proof',
    'urgency',
    'recurring'
);


ALTER TYPE "public"."nudge_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'Pending',
    'Paid',
    'Cancelled'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."post_type" AS ENUM (
    'message_board',
    'looking_for_trek'
);


ALTER TYPE "public"."post_type" OWNER TO "postgres";


CREATE TYPE "public"."renewal_status" AS ENUM (
    'active',
    'expired'
);


ALTER TYPE "public"."renewal_status" OWNER TO "postgres";


CREATE TYPE "public"."role_type" AS ENUM (
    'trek_lead',
    'medic',
    'carry_list'
);


ALTER TYPE "public"."role_type" OWNER TO "postgres";


CREATE TYPE "public"."subscription_renewal_status" AS ENUM (
    'active',
    'inactive',
    'cancelled'
);


ALTER TYPE "public"."subscription_renewal_status" OWNER TO "postgres";


CREATE TYPE "public"."subscription_type" AS ENUM (
    'community',
    'individual'
);


ALTER TYPE "public"."subscription_type" OWNER TO "postgres";


CREATE TYPE "public"."target_type" AS ENUM (
    'trek',
    'user'
);


ALTER TYPE "public"."target_type" OWNER TO "postgres";


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


CREATE TYPE "public"."visibility" AS ENUM (
    'public',
    'private'
);


ALTER TYPE "public"."visibility" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app_auth"."partner_id"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT
    coalesce(
      nullif(
        current_setting('request.jwt.claims', true)::json->>'partner_id',
        ''
      ),
      null
    );
$$;


ALTER FUNCTION "app_auth"."partner_id"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."approve_registration"("registration_id_param" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.trek_registrations
  SET payment_status = 'Approved', verified_by = auth.uid(), verified_at = now(), rejection_reason = NULL
  WHERE registration_id = registration_id_param;
END;
$$;


ALTER FUNCTION "public"."approve_registration"("registration_id_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_trek"("p_trek_id" integer, "p_delete_original" boolean DEFAULT false) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.trek_archive (trek_id, name, description, location, difficulty, start_datetime, route_data, image_url)
    SELECT t.trek_id, t.name, t.description, t.location, t.difficulty, t.start_datetime, t.route_data, COALESCE(t.image_url, t.image)
    FROM public.trek_events t
    WHERE t.trek_id = p_trek_id;

    IF p_delete_original THEN
        DELETE FROM public.trek_events WHERE trek_id = p_trek_id;
    END IF;
END;
$$;


ALTER FUNCTION "public"."archive_trek"("p_trek_id" integer, "p_delete_original" boolean) OWNER TO "postgres";


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
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
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
    "id" bigint NOT NULL,
    "thread_id" bigint NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
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
    "id" bigint NOT NULL,
    "category_id" bigint NOT NULL,
    "author_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "locked" boolean DEFAULT false,
    "pinned" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
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


CREATE OR REPLACE FUNCTION "public"."get_trek_participant_count"("trek_id_param" integer) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    participant_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO participant_count
    FROM trek_registrations
    WHERE trek_id = trek_id_param
    AND payment_status IN ('paid', 'pending', 'proof_uploaded');

    RETURN COALESCE(participant_count, 0);
END;
$$;


ALTER FUNCTION "public"."get_trek_participant_count"("trek_id_param" integer) OWNER TO "postgres";


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
DECLARE
  user_type_value public.user_type_enum;
  existing_user_id UUID;
BEGIN
  -- Default to 'trekker' for new users
  user_type_value := COALESCE(
    (NEW.raw_user_meta_data->>'user_type')::public.user_type_enum,
    'trekker'
  );

  -- Check if user already exists by email
  SELECT user_id INTO existing_user_id 
  FROM public.users 
  WHERE email = NEW.email;

  -- If user exists, update their auth user_id and return
  IF FOUND THEN
    UPDATE public.users 
    SET 
      user_id = NEW.id,
      updated_at = NOW(),
      is_verified = true
    WHERE email = NEW.email;
    RETURN NEW;
  END IF;

  -- Create new user
  INSERT INTO public.users (
    user_id,
    email,
    full_name,
    name,
    avatar_url,
    user_type,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      (NEW.raw_app_meta_data->'claims'->>'full_name'),
      (NEW.raw_app_meta_data->'claims'->>'name')
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      (NEW.raw_app_meta_data->'claims'->>'full_name'),
      (NEW.raw_app_meta_data->'claims'->>'name')
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      (NEW.raw_app_meta_data->'claims'->>'avatar_url'),
      (NEW.raw_app_meta_data->'claims'->>'picture')
    ),
    user_type_value,
    true,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id_param" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = user_id_param AND user_type = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_check"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_id UUID;
    user_type_val TEXT;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- If no user ID, return false
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get user type directly
    SELECT user_type::TEXT INTO user_type_val
    FROM public.users
    WHERE user_id = current_user_id;
    
    -- Return true if admin
    RETURN COALESCE(user_type_val = 'admin', false);
END;
$$;


ALTER FUNCTION "public"."is_admin_check"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."populate_trek_id_requirements"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only process if government_id_required is true
  IF NEW.government_id_required = true THEN
    -- Insert default ID requirements if they don't exist
    INSERT INTO trek_id_requirements (trek_id, id_type_id, is_mandatory)
    SELECT 
      NEW.trek_id,
      it.id_type_id,
      true
    FROM id_types it
    WHERE it.name IN ('aadhaar', 'passport', 'driving_license', 'pan_card', 'ration_card')
      AND it.is_active = true
    ON CONFLICT (trek_id, id_type_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."populate_trek_id_requirements"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."reject_registration"("registration_id_param" integer, "reason_param" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.trek_registrations
  SET payment_status = 'Rejected', verified_by = auth.uid(), verified_at = now(), rejection_reason = reason_param
  WHERE registration_id = registration_id_param;
END;
$$;


ALTER FUNCTION "public"."reject_registration"("registration_id_param" integer, "reason_param" "text") OWNER TO "postgres";


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
    "full_name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "phone_number" character varying(50),
    "address" "text",
    "date_of_birth" "date",
    "id_verification_status" "public"."id_verification_status" DEFAULT 'Pending'::"public"."id_verification_status",
    "health_data" "jsonb",
    "trekking_experience" character varying(100),
    "badges" "jsonb",
    "interests" "jsonb",
    "pet_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    "image_url" "text",
    "user_type" "text",
    "partner_id" "text",
    "indemnity_accepted" boolean DEFAULT false,
    "indemnity_accepted_at" timestamp with time zone,
    "verification_status" "text" DEFAULT 'pending'::"text",
    "verification_docs" "jsonb",
    "avatar_url" "text",
    "legacy_int_id" integer,
    "points" integer DEFAULT 0,
    "car_seating_capacity" integer,
    "name" character varying(255),
    "has_car" boolean DEFAULT false,
    "vehicle_number" "text",
    "latitude" double precision,
    "longitude" double precision,
    "subscription_type" "public"."subscription_type",
    "is_verified" boolean DEFAULT true,
    "transport_volunteer_opt_in" boolean DEFAULT false,
    "bio" "text",
    "location" character varying(255),
    "avatar_key" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Stores public user profile information.';



COMMENT ON COLUMN "public"."users"."user_type" IS 'admin, micro_community, or trekker';



COMMENT ON COLUMN "public"."users"."partner_id" IS 'Set for micro-community users, null otherwise';



COMMENT ON COLUMN "public"."users"."indemnity_accepted" IS 'True if user has accepted indemnity form';



COMMENT ON COLUMN "public"."users"."indemnity_accepted_at" IS 'Timestamp when indemnity was accepted';



COMMENT ON COLUMN "public"."users"."verification_status" IS 'User verification status: VERIFIED (auto/quick/full), PENDING_REVIEW, REJECTED';



COMMENT ON COLUMN "public"."users"."verification_docs" IS 'JSON array of uploaded verification documents';



COMMENT ON COLUMN "public"."users"."avatar_url" IS 'URL to the user''s profile picture or avatar.';



COMMENT ON COLUMN "public"."users"."car_seating_capacity" IS 'How many passengers can the user''s car accommodate (excluding driver).';



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


CREATE OR REPLACE FUNCTION "public"."sync_image_columns"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- When image_url is updated, also update image
    IF NEW.image_url IS DISTINCT FROM OLD.image_url THEN
        NEW.image = NEW.image_url;
    END IF;
    
    -- When image is updated, also update image_url
    IF NEW.image IS DISTINCT FROM OLD.image THEN
        NEW.image_url = NEW.image;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_image_columns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_verification_status_to_legacy"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.id_verification_status :=
    CASE NEW.verification_status
      WHEN 'VERIFIED' THEN 'Verified'::public.id_verification_status
      WHEN 'PENDING_REVIEW' THEN 'Pending'::public.id_verification_status
      WHEN 'REJECTED' THEN 'Rejected'::public.id_verification_status
      ELSE 'Pending'::public.id_verification_status
    END;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_verification_status_to_legacy"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";


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
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_profile"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."validate_expense_shares"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    expense_total DECIMAL(10, 2);
    shares_total DECIMAL(10, 2);
BEGIN
    -- Get the expense amount
    SELECT amount INTO expense_total
    FROM public.trek_ad_hoc_expenses
    WHERE id = NEW.expense_id;
    
    -- Get the total of all shares for this expense
    SELECT COALESCE(SUM(amount), 0) INTO shares_total
    FROM public.trek_ad_hoc_expense_shares
    WHERE expense_id = NEW.expense_id;
    
    -- Add the new share amount
    shares_total := shares_total + NEW.amount;
    
    -- Validate that shares don't exceed the expense total
    IF shares_total > expense_total THEN
        RAISE EXCEPTION 'Total shares (%) cannot exceed expense amount (%)', shares_total, expense_total;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_expense_shares"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."avatar_catalog" (
    "key" "text" NOT NULL,
    "name" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "category" "text" DEFAULT 'animal'::"text" NOT NULL,
    CONSTRAINT "avatar_catalog_category_check" CHECK (("category" = ANY (ARRAY['animal'::"text", 'bird'::"text", 'insect'::"text"])))
);


ALTER TABLE "public"."avatar_catalog" OWNER TO "postgres";


COMMENT ON TABLE "public"."avatar_catalog" IS 'Curated avatar presets for users (animals, birds, insects only)';



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "comment_id" integer NOT NULL,
    "post_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "body" "text" NOT NULL,
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
    "user_id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "body" "text" NOT NULL,
    "post_type" "public"."post_type" NOT NULL,
    "visibility" "public"."visibility" DEFAULT 'public'::"public"."visibility" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
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
    CONSTRAINT "valid_expense_share_status" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('paid'::character varying)::"text", ('rejected'::character varying)::"text"])))
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
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."forum_categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."forum_categories_id_seq" OWNED BY "public"."forum_categories"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."forum_posts_id_seq"
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



CREATE TABLE IF NOT EXISTS "public"."nudge_analytics" (
    "analytics_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nudge_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_type" character varying(50) NOT NULL,
    "event_timestamp" timestamp with time zone DEFAULT "now"(),
    "current_page" character varying(255),
    "device_type" character varying(50),
    "is_mobile" boolean,
    "profile_completion" numeric(3,2),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."nudge_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nudges" (
    "nudge_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "nudge_type" "public"."nudge_type_enum" DEFAULT 'contextual'::"public"."nudge_type_enum" NOT NULL,
    "trigger_type" "public"."nudge_trigger_enum" DEFAULT 'engagement'::"public"."nudge_trigger_enum" NOT NULL,
    "priority" "public"."nudge_priority_enum" DEFAULT 'medium'::"public"."nudge_priority_enum",
    "title" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "icon" character varying(100),
    "cta_label" character varying(100),
    "cta_action" character varying(500),
    "condition_rules" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "frequency_rules" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "display_position" character varying(50) DEFAULT 'toast'::character varying,
    "animation" character varying(50) DEFAULT 'fade'::character varying,
    "delay_seconds" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "is_dismissed" boolean DEFAULT false,
    "dismissed_at" timestamp with time zone,
    "shown_count" integer DEFAULT 0,
    "clicked_count" integer DEFAULT 0,
    "dismissed_count" integer DEFAULT 0,
    "last_shown_at" timestamp with time zone,
    "last_clicked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."nudges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_reactions" (
    "reaction_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reaction_type" character varying(50) NOT NULL,
    "emoji" character varying(10),
    "reacted_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_completion" (
    "completion_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stage" character varying(50) NOT NULL,
    "status" character varying(50) DEFAULT 'not_started'::character varying,
    "completion_percentage" numeric(5,2) DEFAULT 0.00,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "time_to_complete" integer,
    "trigger_used" character varying(100),
    "nudge_id" "uuid",
    "rewards_unlocked" "jsonb" DEFAULT '[]'::"jsonb",
    "features_unlocked" "jsonb" DEFAULT '[]'::"jsonb",
    "helpful_rating" integer,
    "improvement_suggestions" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profile_completion_helpful_rating_check" CHECK ((("helpful_rating" >= 1) AND ("helpful_rating" <= 5)))
);


ALTER TABLE "public"."profile_completion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_milestones" (
    "milestone_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "milestone_type" character varying(100) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "icon" character varying(100),
    "achieved_at" timestamp with time zone DEFAULT "now"(),
    "points_earned" integer DEFAULT 0,
    "badge_earned" character varying(100),
    "related_entity_type" character varying(50),
    "related_entity_id" integer,
    "celebration_shown" boolean DEFAULT false,
    "toast_shown" boolean DEFAULT false,
    "confetti_triggered" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profile_milestones" OWNER TO "postgres";


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



CREATE TABLE IF NOT EXISTS "public"."trek_registrations" (
    "registration_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trek_id" integer NOT NULL,
    "booking_datetime" timestamp with time zone DEFAULT "now"(),
    "payment_status" "text" DEFAULT 'Pending'::"text",
    "cancellation_datetime" timestamp with time zone,
    "penalty_applied" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "pickup_location_id" integer,
    "is_driver" boolean DEFAULT false,
    "indemnity_agreed_at" timestamp with time zone,
    "payment_proof_url" "text",
    "payment_verified_at" timestamp with time zone,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "rejection_reason" "text",
    "offered_seats" integer,
    "pickup_area" "text",
    "preferred_pickup_time" "text",
    "registrant_name" character varying(255),
    "registrant_phone" character varying(20),
    "id_verification_status" character varying(20) DEFAULT 'pending'::character varying,
    "id_verification_notes" "text"
);


ALTER TABLE "public"."trek_registrations" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_registrations" IS 'Tracks user registrations for treks.';



COMMENT ON COLUMN "public"."trek_registrations"."indemnity_agreed_at" IS 'Timestamp when the user agreed to the indemnity for this specific trek.';



COMMENT ON COLUMN "public"."trek_registrations"."registrant_name" IS 'Name of the person making the payment (may differ from user account name)';



COMMENT ON COLUMN "public"."trek_registrations"."registrant_phone" IS 'Phone number of the person making the payment (may differ from user account phone)';



CREATE SEQUENCE IF NOT EXISTS "public"."registrations_registration_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."registrations_registration_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."registrations_registration_id_seq" OWNED BY "public"."trek_registrations"."registration_id";



CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions_billing" (
    "subscription_id" integer NOT NULL,
    "user_id" integer,
    "subscription_type" character varying(50) NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "billing_period" character varying(50) NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "renewal_status" "public"."renewal_status" DEFAULT 'active'::"public"."renewal_status",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions_billing" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."subscriptions_billing_subscription_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."subscriptions_billing_subscription_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."subscriptions_billing_subscription_id_seq" OWNED BY "public"."subscriptions_billing"."subscription_id";



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



CREATE TABLE IF NOT EXISTS "public"."trek_archive" (
    "archive_id" bigint NOT NULL,
    "trek_id" integer,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "location" "text",
    "difficulty" character varying(50),
    "start_datetime" timestamp with time zone NOT NULL,
    "route_data" "jsonb",
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "archived_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trek_archive" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_archive" IS 'Copy of completed/archived treks from trek_events for long-term gallery.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_archive_archive_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_archive_archive_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_archive_archive_id_seq" OWNED BY "public"."trek_archive"."archive_id";



CREATE TABLE IF NOT EXISTS "public"."trek_comments" (
    "comment_id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "comment_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "parent_id" integer,
    "body" "text"
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
    CONSTRAINT "trek_costs_cost_type_check" CHECK (("cost_type" = ANY (ARRAY['ACCOMMODATION'::"text", 'TICKETS'::"text", 'LOCAL_VEHICLE'::"text", 'GUIDE'::"text", 'OTHER'::"text"])))
);


ALTER TABLE "public"."trek_costs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."trek_costs"."cost_type" IS 'Type of fixed cost: ACCOMMODATION, TICKETS, LOCAL_VEHICLE, GUIDE, OTHER';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_costs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_costs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_costs_id_seq" OWNED BY "public"."trek_costs"."id";



CREATE TABLE IF NOT EXISTS "public"."trek_driver_assignments" (
    "assignment_id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "driver_id" integer NOT NULL,
    "participant_id" "uuid" NOT NULL,
    "pickup_location_id" integer NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_assignment_status" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('confirmed'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."trek_driver_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_driver_assignments" IS 'Assigns participants to specific drivers for a trek.';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_driver_assignments_assignment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_driver_assignments_assignment_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_driver_assignments_assignment_id_seq" OWNED BY "public"."trek_driver_assignments"."assignment_id";



CREATE TABLE IF NOT EXISTS "public"."trek_drivers" (
    "driver_id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vehicle_info" "text" DEFAULT '{}'::"jsonb",
    "seating_capacity" integer DEFAULT 4 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "vehicle_type" character varying(50),
    "vehicle_name" character varying(100),
    "registration_number" character varying(50),
    "seats_available" integer DEFAULT 0
);


ALTER TABLE "public"."trek_drivers" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_drivers" IS 'Lists users acting as drivers for a specific trek.';



COMMENT ON COLUMN "public"."trek_drivers"."vehicle_info" IS 'JSON object containing vehicle details (for backward compatibility)';



COMMENT ON COLUMN "public"."trek_drivers"."vehicle_type" IS 'Type of vehicle (e.g., Car 5-seater, SUV/MUV, Mini-van, MiniBus)';



COMMENT ON COLUMN "public"."trek_drivers"."vehicle_name" IS 'Vehicle model/name';



COMMENT ON COLUMN "public"."trek_drivers"."registration_number" IS 'Vehicle registration/license plate number';



COMMENT ON COLUMN "public"."trek_drivers"."seats_available" IS 'Number of passenger seats available (excluding driver)';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_drivers_driver_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_drivers_driver_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_drivers_driver_id_seq" OWNED BY "public"."trek_drivers"."driver_id";



CREATE TABLE IF NOT EXISTS "public"."trek_event_images" (
    "id" bigint NOT NULL,
    "trek_id" integer NOT NULL,
    "image_url" "text" NOT NULL,
    "position" smallint DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trek_event_images_position_check" CHECK ((("position" >= 1) AND ("position" <= 5)))
);


ALTER TABLE "public"."trek_event_images" OWNER TO "postgres";


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
    "start_datetime" timestamp with time zone NOT NULL,
    "duration" interval,
    "base_price" numeric(10,2) NOT NULL,
    "cancellation_policy" "text",
    "penalty_details" numeric(10,2),
    "max_participants" integer NOT NULL,
    "location" "text",
    "route_data" "jsonb",
    "vendor_contacts" "jsonb",
    "pickup_time_window" "text",
    "partner_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "booking_amount" numeric(10,2),
    "collect_full_fee" boolean DEFAULT false,
    "image_url" "text",
    "gpx_file_url" "text",
    "is_finalized" boolean DEFAULT false,
    "end_datetime" timestamp with time zone,
    "difficulty" character varying(50),
    "status" character varying(50),
    "created_by" "uuid",
    "destination_latitude" double precision,
    "destination_longitude" double precision,
    "transport_mode" "public"."transport_mode",
    "event_creator_type" "public"."event_creator_type" DEFAULT 'internal'::"public"."event_creator_type",
    "event_type" character varying(20) DEFAULT 'trek'::character varying,
    "itinerary" "jsonb",
    "activity_schedule" "jsonb",
    "volunteer_roles" "jsonb",
    "image" "text",
    "transport_plan" "jsonb",
    "government_id_required" boolean DEFAULT false,
    "distance" numeric(8,2),
    "jam_yard_details" "jsonb",
    CONSTRAINT "trek_events_event_type_check" CHECK ((("event_type")::"text" = ANY ((ARRAY['trek'::character varying, 'camping'::character varying, 'jam_yard'::character varying])::"text"[])))
);


ALTER TABLE "public"."trek_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_events" IS 'Defines the details of trek, camping, and jam_yard events.';



COMMENT ON COLUMN "public"."trek_events"."partner_id" IS 'Null for internal events; set for micro-community (external) events';



COMMENT ON COLUMN "public"."trek_events"."is_finalized" IS 'True if trek event is fully detailed and registration requires payment/terms';



COMMENT ON COLUMN "public"."trek_events"."event_type" IS 'Type of event: trek (traditional hiking/trekking) or camping (multi-activity camping event)';



COMMENT ON COLUMN "public"."trek_events"."itinerary" IS 'Detailed day-by-day itinerary for camping events (JSON format)';



COMMENT ON COLUMN "public"."trek_events"."activity_schedule" IS 'Scheduled activities with timing and requirements (JSON format)';



COMMENT ON COLUMN "public"."trek_events"."volunteer_roles" IS 'Available volunteer roles and requirements for camping events (JSON format)';



COMMENT ON COLUMN "public"."trek_events"."government_id_required" IS 'Whether this trek requires government ID verification for participants (for ticket booking, permits, etc.)';



COMMENT ON COLUMN "public"."trek_events"."distance" IS 'Distance in kilometers calculated from GPX file or manually entered';



COMMENT ON COLUMN "public"."trek_events"."jam_yard_details" IS 'Jam Yard event specific details: activity_focus, instructor_name, instructor_bio, instructor_image, venue_type, venue_details, target_audience, session_duration, equipment_provided, skill_level, weather_dependency, can_complement_camping, can_complement_trek';



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
    "trek_id" integer,
    "description" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "type" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "creator_id" "uuid",
    "category_id" integer,
    "expense_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "receipt_url" "text"
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
    "name" character varying(255) NOT NULL,
    "category" character varying(100),
    "description" "text",
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
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
    "teamwork_rating" integer NOT NULL,
    "punctuality_rating" integer NOT NULL,
    "contribution_rating" integer NOT NULL,
    "comments" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trek_participant_ratings_check" CHECK (("rated_user_id" <> "rated_by_user_id")),
    CONSTRAINT "trek_participant_ratings_contribution_rating_check" CHECK ((("contribution_rating" >= 1) AND ("contribution_rating" <= 5))),
    CONSTRAINT "trek_participant_ratings_punctuality_rating_check" CHECK ((("punctuality_rating" >= 1) AND ("punctuality_rating" <= 5))),
    CONSTRAINT "trek_participant_ratings_teamwork_rating_check" CHECK ((("teamwork_rating" >= 1) AND ("teamwork_rating" <= 5)))
);


ALTER TABLE "public"."trek_participant_ratings" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_participant_ratings" IS 'Stores ratings given by participants to each other.';



ALTER TABLE "public"."trek_participant_ratings" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."trek_participant_ratings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."trek_pickup_locations" (
    "location_id" integer NOT NULL,
    "trek_id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "address" "text" NOT NULL,
    "coordinates" character varying(255),
    "time" character varying(50) DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "latitude" numeric(10,6),
    "longitude" numeric(10,6)
);


ALTER TABLE "public"."trek_pickup_locations" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_pickup_locations" IS 'Defines pickup points for a trek.';



COMMENT ON COLUMN "public"."trek_pickup_locations"."time" IS 'Pickup time for this location';



COMMENT ON COLUMN "public"."trek_pickup_locations"."latitude" IS 'Latitude coordinate for pickup location';



COMMENT ON COLUMN "public"."trek_pickup_locations"."longitude" IS 'Longitude coordinate for pickup location';



CREATE SEQUENCE IF NOT EXISTS "public"."trek_pickup_locations_location_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_pickup_locations_location_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_pickup_locations_location_id_seq" OWNED BY "public"."trek_pickup_locations"."location_id";



CREATE TABLE IF NOT EXISTS "public"."trek_ratings" (
    "id" bigint NOT NULL,
    "trek_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "difficulty_rating" integer NOT NULL,
    "enjoyment_rating" integer NOT NULL,
    "scenic_rating" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trek_ratings_difficulty_rating_check" CHECK ((("difficulty_rating" >= 1) AND ("difficulty_rating" <= 5))),
    CONSTRAINT "trek_ratings_enjoyment_rating_check" CHECK ((("enjoyment_rating" >= 1) AND ("enjoyment_rating" <= 5))),
    CONSTRAINT "trek_ratings_scenic_rating_check" CHECK ((("scenic_rating" >= 1) AND ("scenic_rating" <= 5)))
);


ALTER TABLE "public"."trek_ratings" OWNER TO "postgres";


COMMENT ON TABLE "public"."trek_ratings" IS 'Stores user ratings for the overall trek.';



ALTER TABLE "public"."trek_ratings" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."trek_ratings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."trek_transport_assignments" (
    "id" bigint NOT NULL,
    "trek_id" integer NOT NULL,
    "driver_user_id" "uuid" NOT NULL,
    "passenger_user_id" "uuid" NOT NULL,
    "seats_reserved" integer DEFAULT 1 NOT NULL,
    "pickup_point" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trek_transport_assignments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."trek_transport_assignments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trek_transport_assignments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trek_transport_assignments_id_seq" OWNED BY "public"."trek_transport_assignments"."id";



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



CREATE TABLE IF NOT EXISTS "public"."user_connections" (
    "connection_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "addressee_id" "uuid" NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "connection_type" character varying(50) DEFAULT 'friend'::character varying,
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "responded_at" timestamp with time zone,
    "connected_at" timestamp with time zone,
    "connection_source" character varying(100),
    "mutual_friends_count" integer DEFAULT 0,
    "mutual_treks_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_connections_check" CHECK (("requester_id" <> "addressee_id"))
);


ALTER TABLE "public"."user_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_posts" (
    "post_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "media_urls" "jsonb" DEFAULT '[]'::"jsonb",
    "post_type" character varying(50) DEFAULT 'text'::character varying,
    "trek_id" integer,
    "registration_id" integer,
    "like_count" integer DEFAULT 0,
    "comment_count" integer DEFAULT 0,
    "share_count" integer DEFAULT 0,
    "view_count" integer DEFAULT 0,
    "visibility" character varying(50) DEFAULT 'friends'::character varying,
    "is_pinned" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "location_name" character varying(255),
    "latitude" double precision,
    "longitude" double precision,
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "mentions" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_posts" OWNER TO "postgres";


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
    "vote_id" integer NOT NULL,
    "voter_id" integer NOT NULL,
    "target_type" "public"."target_type" NOT NULL,
    "target_id" integer NOT NULL,
    "vote_value" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."votes_vote_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."votes_vote_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."votes_vote_id_seq" OWNED BY "public"."votes"."vote_id";



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



ALTER TABLE ONLY "public"."subscriptions_billing" ALTER COLUMN "subscription_id" SET DEFAULT "nextval"('"public"."subscriptions_billing_subscription_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tent_inventory" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tent_inventory_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tent_rentals" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tent_rentals_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tent_requests" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tent_requests_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tent_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tent_types_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_archive" ALTER COLUMN "archive_id" SET DEFAULT "nextval"('"public"."trek_archive_archive_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_comments" ALTER COLUMN "comment_id" SET DEFAULT "nextval"('"public"."trek_comments_comment_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_costs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_costs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_driver_assignments" ALTER COLUMN "assignment_id" SET DEFAULT "nextval"('"public"."trek_driver_assignments_assignment_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_drivers" ALTER COLUMN "driver_id" SET DEFAULT "nextval"('"public"."trek_drivers_driver_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_event_images" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_event_images_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_event_videos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_event_videos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_events" ALTER COLUMN "trek_id" SET DEFAULT "nextval"('"public"."trek_events_trek_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_expense_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_expense_categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_expenses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_expenses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_id_requirements" ALTER COLUMN "requirement_id" SET DEFAULT "nextval"('"public"."trek_id_requirements_requirement_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_packing_items" ALTER COLUMN "item_id" SET DEFAULT "nextval"('"public"."trek_packing_items_item_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_packing_list_assignments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_packing_list_assignments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_pickup_locations" ALTER COLUMN "location_id" SET DEFAULT "nextval"('"public"."trek_pickup_locations_location_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_registrations" ALTER COLUMN "registration_id" SET DEFAULT "nextval"('"public"."registrations_registration_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."trek_transport_assignments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trek_transport_assignments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_actions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_actions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_trek_images" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_trek_images_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."votes" ALTER COLUMN "vote_id" SET DEFAULT "nextval"('"public"."votes_vote_id_seq"'::"regclass");



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
    ADD CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_categories"
    ADD CONSTRAINT "forum_categories_slug_key" UNIQUE ("slug");



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



ALTER TABLE ONLY "public"."nudge_analytics"
    ADD CONSTRAINT "nudge_analytics_pkey" PRIMARY KEY ("analytics_id");



ALTER TABLE ONLY "public"."nudges"
    ADD CONSTRAINT "nudges_pkey" PRIMARY KEY ("nudge_id");



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("reaction_id");



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."profile_completion"
    ADD CONSTRAINT "profile_completion_pkey" PRIMARY KEY ("completion_id");



ALTER TABLE ONLY "public"."profile_completion"
    ADD CONSTRAINT "profile_completion_user_id_stage_key" UNIQUE ("user_id", "stage");



ALTER TABLE ONLY "public"."profile_milestones"
    ADD CONSTRAINT "profile_milestones_pkey" PRIMARY KEY ("milestone_id");



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_pkey" PRIMARY KEY ("proof_id");



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_registration_id_id_type_id_key" UNIQUE ("registration_id", "id_type_id");



ALTER TABLE ONLY "public"."trek_registrations"
    ADD CONSTRAINT "registrations_pkey" PRIMARY KEY ("registration_id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."subscriptions_billing"
    ADD CONSTRAINT "subscriptions_billing_pkey" PRIMARY KEY ("subscription_id");



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



ALTER TABLE ONLY "public"."trek_archive"
    ADD CONSTRAINT "trek_archive_pkey" PRIMARY KEY ("archive_id");



ALTER TABLE ONLY "public"."trek_comments"
    ADD CONSTRAINT "trek_comments_pkey" PRIMARY KEY ("comment_id");



ALTER TABLE ONLY "public"."trek_costs"
    ADD CONSTRAINT "trek_costs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_driver_assignments"
    ADD CONSTRAINT "trek_driver_assignments_pkey" PRIMARY KEY ("assignment_id");



ALTER TABLE ONLY "public"."trek_drivers"
    ADD CONSTRAINT "trek_drivers_pkey" PRIMARY KEY ("driver_id");



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



ALTER TABLE ONLY "public"."trek_packing_items"
    ADD CONSTRAINT "trek_packing_items_pkey" PRIMARY KEY ("item_id");



ALTER TABLE ONLY "public"."trek_packing_list_assignments"
    ADD CONSTRAINT "trek_packing_list_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_packing_list_assignments"
    ADD CONSTRAINT "trek_packing_list_assignments_trek_id_master_item_id_key" UNIQUE ("trek_id", "master_item_id");



ALTER TABLE ONLY "public"."trek_participant_ratings"
    ADD CONSTRAINT "trek_participant_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_participant_ratings"
    ADD CONSTRAINT "trek_participant_ratings_trek_id_rated_user_id_rated_by_use_key" UNIQUE ("trek_id", "rated_user_id", "rated_by_user_id");



ALTER TABLE ONLY "public"."trek_pickup_locations"
    ADD CONSTRAINT "trek_pickup_locations_pkey" PRIMARY KEY ("location_id");



ALTER TABLE ONLY "public"."trek_ratings"
    ADD CONSTRAINT "trek_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trek_ratings"
    ADD CONSTRAINT "trek_ratings_trek_id_user_id_key" UNIQUE ("trek_id", "user_id");



ALTER TABLE ONLY "public"."trek_transport_assignments"
    ADD CONSTRAINT "trek_transport_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_actions"
    ADD CONSTRAINT "user_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_pkey" PRIMARY KEY ("connection_id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_requester_id_addressee_id_key" UNIQUE ("requester_id", "addressee_id");



ALTER TABLE ONLY "public"."user_posts"
    ADD CONSTRAINT "user_posts_pkey" PRIMARY KEY ("post_id");



ALTER TABLE ONLY "public"."user_trek_images"
    ADD CONSTRAINT "user_trek_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("vote_id");



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



CREATE INDEX "idx_nudge_analytics_nudge_id" ON "public"."nudge_analytics" USING "btree" ("nudge_id");



CREATE INDEX "idx_nudges_is_active" ON "public"."nudges" USING "btree" ("is_active");



CREATE INDEX "idx_nudges_user_id" ON "public"."nudges" USING "btree" ("user_id");



CREATE INDEX "idx_post_reactions_post_id" ON "public"."post_reactions" USING "btree" ("post_id");



CREATE INDEX "idx_post_reactions_user_id" ON "public"."post_reactions" USING "btree" ("user_id");



CREATE INDEX "idx_profile_completion_stage" ON "public"."profile_completion" USING "btree" ("stage");



CREATE INDEX "idx_profile_completion_status" ON "public"."profile_completion" USING "btree" ("status");



CREATE INDEX "idx_profile_completion_user_id" ON "public"."profile_completion" USING "btree" ("user_id");



CREATE INDEX "idx_profile_milestones_achieved_at" ON "public"."profile_milestones" USING "btree" ("achieved_at");



CREATE INDEX "idx_profile_milestones_milestone_type" ON "public"."profile_milestones" USING "btree" ("milestone_type");



CREATE INDEX "idx_profile_milestones_user_id" ON "public"."profile_milestones" USING "btree" ("user_id");



CREATE INDEX "idx_registration_id_proofs_registration_id" ON "public"."registration_id_proofs" USING "btree" ("registration_id");



CREATE INDEX "idx_registration_id_proofs_verification_status" ON "public"."registration_id_proofs" USING "btree" ("verification_status");



CREATE INDEX "idx_registrations_trek_id" ON "public"."trek_registrations" USING "btree" ("trek_id");



CREATE INDEX "idx_registrations_user_id" ON "public"."trek_registrations" USING "btree" ("user_id");



CREATE INDEX "idx_tent_inventory_event_id" ON "public"."tent_inventory" USING "btree" ("event_id");



CREATE INDEX "idx_tent_rentals_trek_id" ON "public"."tent_rentals" USING "btree" ("trek_id");



CREATE INDEX "idx_tent_requests_event_user" ON "public"."tent_requests" USING "btree" ("event_id", "user_id");



CREATE INDEX "idx_tent_requests_status" ON "public"."tent_requests" USING "btree" ("status");



CREATE INDEX "idx_trek_costs_cost_type" ON "public"."trek_costs" USING "btree" ("cost_type");



CREATE INDEX "idx_trek_costs_trek_id" ON "public"."trek_costs" USING "btree" ("trek_id");



CREATE INDEX "idx_trek_events_event_type" ON "public"."trek_events" USING "btree" ("event_type");



CREATE INDEX "idx_trek_events_government_id_required" ON "public"."trek_events" USING "btree" ("government_id_required");



CREATE INDEX "idx_trek_events_is_finalized" ON "public"."trek_events" USING "btree" ("is_finalized");



CREATE INDEX "idx_trek_events_partner_id" ON "public"."trek_events" USING "btree" ("partner_id");



CREATE INDEX "idx_trek_events_status" ON "public"."trek_events" USING "btree" ("status");



CREATE INDEX "idx_trek_id_requirements_id_type" ON "public"."trek_id_requirements" USING "btree" ("id_type_id");



CREATE INDEX "idx_trek_id_requirements_trek_id" ON "public"."trek_id_requirements" USING "btree" ("trek_id");



CREATE INDEX "idx_trek_packing_list_assignments_item_id" ON "public"."trek_packing_list_assignments" USING "btree" ("master_item_id");



CREATE INDEX "idx_trek_packing_list_assignments_trek_id" ON "public"."trek_packing_list_assignments" USING "btree" ("trek_id");



CREATE INDEX "idx_trek_registrations_id_verification_status" ON "public"."trek_registrations" USING "btree" ("id_verification_status");



CREATE INDEX "idx_trek_registrations_trek_id" ON "public"."trek_registrations" USING "btree" ("trek_id");



CREATE INDEX "idx_trek_registrations_user_id" ON "public"."trek_registrations" USING "btree" ("user_id");



CREATE INDEX "idx_trek_regs_status_trek" ON "public"."trek_registrations" USING "btree" ("payment_status", "trek_id");



CREATE INDEX "idx_tta_driver" ON "public"."trek_transport_assignments" USING "btree" ("driver_user_id");



CREATE INDEX "idx_tta_passenger" ON "public"."trek_transport_assignments" USING "btree" ("passenger_user_id");



CREATE INDEX "idx_tta_trek" ON "public"."trek_transport_assignments" USING "btree" ("trek_id");



CREATE INDEX "idx_user_actions_user_type_created" ON "public"."user_actions" USING "btree" ("user_id", "action_type", "created_at" DESC);



CREATE INDEX "idx_user_connections_addressee_id" ON "public"."user_connections" USING "btree" ("addressee_id");



CREATE INDEX "idx_user_connections_created_at" ON "public"."user_connections" USING "btree" ("created_at");



CREATE INDEX "idx_user_connections_requester_id" ON "public"."user_connections" USING "btree" ("requester_id");



CREATE INDEX "idx_user_connections_status" ON "public"."user_connections" USING "btree" ("status");



CREATE INDEX "idx_user_posts_created_at" ON "public"."user_posts" USING "btree" ("created_at");



CREATE INDEX "idx_user_posts_trek_id" ON "public"."user_posts" USING "btree" ("trek_id");



CREATE INDEX "idx_user_posts_user_id" ON "public"."user_posts" USING "btree" ("user_id");



CREATE INDEX "idx_user_posts_visibility" ON "public"."user_posts" USING "btree" ("visibility");



CREATE INDEX "idx_user_trek_images_created_at" ON "public"."user_trek_images" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_trek_images_status" ON "public"."user_trek_images" USING "btree" ("status");



CREATE INDEX "idx_user_trek_images_trek_id" ON "public"."user_trek_images" USING "btree" ("trek_id");



CREATE INDEX "idx_user_trek_images_uploaded_by" ON "public"."user_trek_images" USING "btree" ("uploaded_by");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_user_id" ON "public"."users" USING "btree" ("user_id");



CREATE INDEX "idx_users_user_type" ON "public"."users" USING "btree" ("user_type");



CREATE UNIQUE INDEX "ux_trek_event_images_unique_slot" ON "public"."trek_event_images" USING "btree" ("trek_id", "position");



CREATE UNIQUE INDEX "ux_trek_event_videos_unique_trek" ON "public"."trek_event_videos" USING "btree" ("trek_id");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_profile"();



CREATE OR REPLACE TRIGGER "set_updated_at_on_trek_participant_ratings" BEFORE UPDATE ON "public"."trek_participant_ratings" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_on_trek_ratings" BEFORE UPDATE ON "public"."trek_ratings" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "sync_body_to_comment_text" BEFORE INSERT OR UPDATE OF "body" ON "public"."trek_comments" FOR EACH ROW WHEN ((("new"."body" IS NOT NULL) AND (("new"."comment_text" IS NULL) OR ("new"."comment_text" IS DISTINCT FROM "new"."body")))) EXECUTE FUNCTION "public"."sync_body_to_comment_text"();



CREATE OR REPLACE TRIGGER "sync_comment_text_to_body" BEFORE INSERT OR UPDATE OF "comment_text" ON "public"."trek_comments" FOR EACH ROW WHEN ((("new"."comment_text" IS NOT NULL) AND (("new"."body" IS NULL) OR ("new"."body" IS DISTINCT FROM "new"."comment_text")))) EXECUTE FUNCTION "public"."sync_comment_text_to_body"();



CREATE OR REPLACE TRIGGER "sync_image_trigger" BEFORE UPDATE ON "public"."trek_events" FOR EACH ROW EXECUTE FUNCTION "public"."sync_image_columns"();



CREATE OR REPLACE TRIGGER "trg_enforce_max_five_images" BEFORE INSERT ON "public"."trek_event_images" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_max_five_images"();



CREATE OR REPLACE TRIGGER "trg_enforce_max_one_video" BEFORE INSERT ON "public"."trek_event_videos" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_max_one_video"();



CREATE OR REPLACE TRIGGER "trg_site_settings_updated_at" BEFORE UPDATE ON "public"."site_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_users_sync_avatar" BEFORE INSERT OR UPDATE OF "avatar_key" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."sync_avatar_url_from_key"();



CREATE OR REPLACE TRIGGER "trg_users_sync_status_to_legacy" BEFORE INSERT OR UPDATE OF "verification_status" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."sync_verification_status_to_legacy"();



CREATE OR REPLACE TRIGGER "trigger_populate_trek_id_requirements" AFTER INSERT OR UPDATE ON "public"."trek_events" FOR EACH ROW EXECUTE FUNCTION "public"."populate_trek_id_requirements"();



CREATE OR REPLACE TRIGGER "update_tent_inventory_updated_at" BEFORE UPDATE ON "public"."tent_inventory" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tent_requests_updated_at" BEFORE UPDATE ON "public"."tent_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tent_types_updated_at" BEFORE UPDATE ON "public"."tent_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_trek_costs_updated_at" BEFORE UPDATE ON "public"."trek_costs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "validate_cost_type_trigger" BEFORE INSERT OR UPDATE ON "public"."trek_costs" FOR EACH ROW EXECUTE FUNCTION "public"."validate_cost_type"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expense_shares"
    ADD CONSTRAINT "expense_shares_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."trek_expenses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expense_shares"
    ADD CONSTRAINT "expense_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_registrations"
    ADD CONSTRAINT "fk_trek_id" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_posts"
    ADD CONSTRAINT "forum_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."nudge_analytics"
    ADD CONSTRAINT "nudge_analytics_nudge_id_fkey" FOREIGN KEY ("nudge_id") REFERENCES "public"."nudges"("nudge_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nudge_analytics"
    ADD CONSTRAINT "nudge_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nudges"
    ADD CONSTRAINT "nudges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."user_posts"("post_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_completion"
    ADD CONSTRAINT "profile_completion_nudge_id_fkey" FOREIGN KEY ("nudge_id") REFERENCES "public"."nudges"("nudge_id");



ALTER TABLE ONLY "public"."profile_completion"
    ADD CONSTRAINT "profile_completion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_milestones"
    ADD CONSTRAINT "profile_milestones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_id_type_id_fkey" FOREIGN KEY ("id_type_id") REFERENCES "public"."id_types"("id_type_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "public"."trek_registrations"("registration_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registration_id_proofs"
    ADD CONSTRAINT "registration_id_proofs_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id");



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
    ADD CONSTRAINT "trek_driver_assignments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."trek_drivers"("driver_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_driver_assignments"
    ADD CONSTRAINT "trek_driver_assignments_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_driver_assignments"
    ADD CONSTRAINT "trek_driver_assignments_pickup_location_id_fkey" FOREIGN KEY ("pickup_location_id") REFERENCES "public"."trek_pickup_locations"("location_id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "trek_events_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("user_id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trek_expenses"
    ADD CONSTRAINT "trek_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."trek_expense_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trek_expenses"
    ADD CONSTRAINT "trek_expenses_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "trek_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_transport_assignments"
    ADD CONSTRAINT "trek_transport_assignments_driver_user_id_fkey" FOREIGN KEY ("driver_user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_transport_assignments"
    ADD CONSTRAINT "trek_transport_assignments_passenger_user_id_fkey" FOREIGN KEY ("passenger_user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trek_transport_assignments"
    ADD CONSTRAINT "trek_transport_assignments_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_actions"
    ADD CONSTRAINT "user_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_posts"
    ADD CONSTRAINT "user_posts_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "public"."trek_registrations"("registration_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_posts"
    ADD CONSTRAINT "user_posts_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_posts"
    ADD CONSTRAINT "user_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_trek_images"
    ADD CONSTRAINT "user_trek_images_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_trek_images"
    ADD CONSTRAINT "user_trek_images_trek_id_fkey" FOREIGN KEY ("trek_id") REFERENCES "public"."trek_events"("trek_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_trek_images"
    ADD CONSTRAINT "user_trek_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_avatar_key_fk" FOREIGN KEY ("avatar_key") REFERENCES "public"."avatar_catalog"("key");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin can force delete any registration" ON "public"."trek_registrations" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admin can manage transport assignments" ON "public"."trek_transport_assignments" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can moderate registrations" ON "public"."trek_registrations" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can view all drivers" ON "public"."trek_drivers" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."trek_registrations"
  WHERE (("trek_registrations"."trek_id" = "trek_drivers"."trek_id") AND ("trek_registrations"."user_id" = "auth"."uid"()) AND ("trek_registrations"."payment_status" <> 'Cancelled'::"text"))))));



CREATE POLICY "Admin can view all registrations" ON "public"."trek_registrations" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin full access to trek costs" ON "public"."trek_costs" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admin users can manage packing items" ON "public"."trek_packing_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can delete any image" ON "public"."user_trek_images" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can delete drivers" ON "public"."trek_drivers" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can delete trek ID requirements" ON "public"."trek_id_requirements" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can insert drivers" ON "public"."trek_drivers" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can insert trek ID requirements" ON "public"."trek_id_requirements" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all tent requests" ON "public"."tent_requests" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can manage driver assignments" ON "public"."trek_driver_assignments" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can manage image tags" ON "public"."image_tags" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can manage pickup locations" ON "public"."trek_pickup_locations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can manage tent inventory" ON "public"."tent_inventory" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can manage tent rentals" ON "public"."tent_rentals" TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage tent types" ON "public"."tent_types" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can manage trek videos" ON "public"."trek_event_videos" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can moderate image status" ON "public"."user_trek_images" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can update drivers" ON "public"."trek_drivers" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can update trek ID requirements" ON "public"."trek_id_requirements" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can verify ID proofs" ON "public"."registration_id_proofs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can view all images for moderation" ON "public"."user_trek_images" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Admins can view all milestones" ON "public"."profile_milestones" FOR SELECT USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can view all profile completion" ON "public"."profile_completion" FOR SELECT USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "All users can view packing items" ON "public"."trek_packing_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow admin full access to comments" ON "public"."trek_comments" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow admin full access to expense categories" ON "public"."trek_expense_categories" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow admin full access to expense shares" ON "public"."expense_shares" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow admin full access to expenses" ON "public"."trek_expenses" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow admin full access to master packing items" ON "public"."master_packing_items" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow admin full access to registrations" ON "public"."trek_registrations" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow admin full access to trek events" ON "public"."trek_events" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow admin full access to trek packing assignments" ON "public"."trek_packing_list_assignments" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow admins to manage all treks" ON "public"."trek_events" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow all deletes" ON "public"."trek_events" FOR DELETE USING (true);



CREATE POLICY "Allow all users to view treks" ON "public"."trek_events" FOR SELECT USING (true);



CREATE POLICY "Allow authenticated read access to transport info" ON "public"."trek_driver_assignments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated read access to transport info" ON "public"."trek_drivers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated read access to transport info" ON "public"."trek_pickup_locations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to create treks" ON "public"."trek_events" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to view all treks" ON "public"."trek_events" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow backend to insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow cost insertion for authenticated users" ON "public"."trek_costs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow delete for authenticated users on trek_expenses" ON "public"."trek_expenses" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow expense creator to delete shares (before paid?)" ON "public"."expense_shares" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."trek_expenses" "e"
  WHERE (("e"."id" = "expense_shares"."expense_id") AND ("e"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Allow expense creator to insert shares" ON "public"."expense_shares" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trek_expenses" "e"
  WHERE (("e"."id" = "expense_shares"."expense_id") AND ("e"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Allow insert for authenticated users" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow insert for authenticated users on trek_expenses" ON "public"."trek_expenses" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow insert to community_posts" ON "public"."community_posts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert to votes" ON "public"."votes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow micro-community partners to manage their events" ON "public"."trek_events" USING (("partner_id" = "auth"."uid"()));



CREATE POLICY "Allow partners to manage their treks" ON "public"."trek_events" TO "authenticated" USING (("partner_id" = "auth"."uid"()));



CREATE POLICY "Allow public view of past treks" ON "public"."trek_events" FOR SELECT USING (("start_datetime" < "now"()));



CREATE POLICY "Allow read access to ID types" ON "public"."id_types" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all for trek comments" ON "public"."trek_comments" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all for trek events" ON "public"."trek_events" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."trek_registrations" FOR SELECT USING (true);



CREATE POLICY "Allow read access to community_posts" ON "public"."community_posts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to expense categories" ON "public"."trek_expense_categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to master packing items for authenticated use" ON "public"."master_packing_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to trek ID requirements" ON "public"."trek_id_requirements" FOR SELECT USING (true);



CREATE POLICY "Allow read access to trek packing assignments for authenticated" ON "public"."trek_packing_list_assignments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to votes" ON "public"."votes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read subscriptions_billing" ON "public"."subscriptions_billing" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow select for all authenticated users" ON "public"."trek_events" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow select for authenticated users on trek_events" ON "public"."trek_events" FOR SELECT TO "authenticated" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow select for authenticated users on trek_expenses" ON "public"."trek_expenses" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow update for authenticated" ON "public"."trek_events" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow update for authenticated users on trek_expenses" ON "public"."trek_expenses" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow update to own community_posts" ON "public"."community_posts" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow update to own votes" ON "public"."votes" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow users to delete own expenses" ON "public"."trek_expenses" FOR DELETE USING (("creator_id" = "auth"."uid"()));



CREATE POLICY "Allow users to delete their own comments" ON "public"."trek_comments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert comments" ON "public"."trek_comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert expenses for their treks" ON "public"."trek_expenses" FOR INSERT WITH CHECK ((("creator_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."trek_registrations" "r"
  WHERE (("r"."trek_id" = "trek_expenses"."trek_id") AND ("r"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Allow users to insert own registration" ON "public"."trek_registrations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to select their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update own expenses" ON "public"."trek_expenses" FOR UPDATE USING (("creator_id" = "auth"."uid"()));



CREATE POLICY "Allow users to update own registration (e.g., cancel)" ON "public"."trek_registrations" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update status of their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update status/payment for their shares" ON "public"."expense_shares" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow users to update their own comments" ON "public"."trek_comments" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to view expenses for their treks" ON "public"."trek_expenses" FOR SELECT USING ((("creator_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."trek_registrations" "r"
  WHERE (("r"."trek_id" = "trek_expenses"."trek_id") AND ("r"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."user_id" = "auth"."uid"()) AND ("u"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Allow users to view own registration" ON "public"."trek_registrations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to view shares they are part of" ON "public"."expense_shares" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."trek_expenses" "e"
  WHERE (("e"."id" = "expense_shares"."expense_id") AND ("e"."creator_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."user_id" = "auth"."uid"()) AND ("u"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Anyone can view packing items" ON "public"."trek_packing_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view pickup locations for treks they're registered f" ON "public"."trek_pickup_locations" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."trek_registrations"
  WHERE (("trek_registrations"."trek_id" = "trek_pickup_locations"."trek_id") AND ("trek_registrations"."user_id" = "auth"."uid"()) AND ("trek_registrations"."payment_status" <> 'Cancelled'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Anyone can view tent inventory" ON "public"."tent_inventory" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Anyone can view tent types" ON "public"."tent_types" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Anyone can view trek comments" ON "public"."trek_comments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view trek costs" ON "public"."trek_costs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Drivers can remove own passengers" ON "public"."trek_transport_assignments" FOR DELETE TO "authenticated" USING (("driver_user_id" = "auth"."uid"()));



CREATE POLICY "Everyone can view approved user images" ON "public"."user_trek_images" FOR SELECT USING (("status" = 'approved'::"text"));



CREATE POLICY "Everyone can view image tags" ON "public"."image_tags" FOR SELECT USING (true);



CREATE POLICY "Everyone can view tag assignments" ON "public"."image_tag_assignments" FOR SELECT USING (true);



CREATE POLICY "Everyone can view trek event images" ON "public"."trek_event_images" FOR SELECT USING (true);



CREATE POLICY "Everyone can view trek videos" ON "public"."trek_event_videos" FOR SELECT USING (true);



CREATE POLICY "Expense categories are viewable by all authenticated users" ON "public"."trek_expense_categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Expense categories can be managed by admins" ON "public"."trek_expense_categories" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Public read access for tent rentals" ON "public"."tent_rentals" FOR SELECT USING (true);



CREATE POLICY "System can create nudges for users" ON "public"."nudges" FOR INSERT WITH CHECK (true);



CREATE POLICY "Trek creators can manage trek costs" ON "public"."trek_costs" TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."trek_events"
  WHERE (("trek_events"."trek_id" = "trek_costs"."trek_id") AND ("trek_events"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Trek participant ratings are viewable by all authenticated user" ON "public"."trek_participant_ratings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Trek ratings are viewable by all authenticated users" ON "public"."trek_ratings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can add comments to treks they're registered for" ON "public"."trek_comments" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."trek_registrations"
  WHERE (("trek_registrations"."trek_id" = "trek_comments"."trek_id") AND ("trek_registrations"."user_id" = "auth"."uid"()) AND ("trek_registrations"."payment_status" <> 'Cancelled'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can assign tags to own images" ON "public"."image_tag_assignments" FOR INSERT TO "authenticated" WITH CHECK ((((("image_type")::"text" = 'user_image'::"text") AND ("assigned_by" = "auth"."uid"())) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can contribute images" ON "public"."user_trek_images" FOR INSERT TO "authenticated" WITH CHECK (("uploaded_by" = "auth"."uid"()));



CREATE POLICY "Users can create comments on treks" ON "public"."trek_comments" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."trek_registrations"
  WHERE (("trek_registrations"."trek_id" = "trek_comments"."trek_id") AND ("trek_registrations"."user_id" = "auth"."uid"()) AND ("trek_registrations"."payment_status" <> 'Cancelled'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can create connection requests" ON "public"."user_connections" FOR INSERT WITH CHECK (("auth"."uid"() = "requester_id"));



CREATE POLICY "Users can create expenses for treks they're registered for" ON "public"."trek_expenses" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trek_registrations"
  WHERE (("trek_registrations"."trek_id" = "trek_expenses"."trek_id") AND ("trek_registrations"."user_id" = "auth"."uid"()) AND ("trek_registrations"."payment_status" <> 'Cancelled'::"text")))));



CREATE POLICY "Users can create own posts" ON "public"."user_posts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own reactions" ON "public"."post_reactions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create registration" ON "public"."trek_registrations" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own participant ratings" ON "public"."trek_participant_ratings" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "rated_by_user_id") AND ("auth"."uid"() <> "rated_user_id") AND (EXISTS ( SELECT 1
   FROM ("public"."trek_registrations" "r1"
     JOIN "public"."trek_registrations" "r2" ON (("r1"."trek_id" = "r2"."trek_id")))
  WHERE (("r1"."trek_id" = "trek_participant_ratings"."trek_id") AND ("r1"."user_id" = "auth"."uid"()) AND ("r2"."user_id" = "trek_participant_ratings"."rated_user_id") AND ("r1"."payment_status" <> 'Cancelled'::"text") AND ("r2"."payment_status" <> 'Cancelled'::"text"))))));



CREATE POLICY "Users can create their own tent requests" ON "public"."tent_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own trek ratings" ON "public"."trek_ratings" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."trek_registrations"
  WHERE (("trek_registrations"."trek_id" = "trek_ratings"."trek_id") AND ("trek_registrations"."user_id" = "auth"."uid"()) AND ("trek_registrations"."payment_status" <> 'Cancelled'::"text"))))));



CREATE POLICY "Users can delete own pending images" ON "public"."user_trek_images" FOR DELETE TO "authenticated" USING ((("uploaded_by" = "auth"."uid"()) AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can delete own posts" ON "public"."user_posts" FOR DELETE USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Users can delete own reactions" ON "public"."post_reactions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own tag assignments" ON "public"."image_tag_assignments" FOR DELETE TO "authenticated" USING ((((("image_type")::"text" = 'user_image'::"text") AND ("assigned_by" = "auth"."uid"())) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can delete their own comments" ON "public"."trek_comments" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can manage own pending images" ON "public"."user_trek_images" TO "authenticated" USING ((("uploaded_by" = "auth"."uid"()) AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can manage their own milestones" ON "public"."profile_milestones" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own nudge analytics" ON "public"."nudge_analytics" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own profile completion" ON "public"."profile_completion" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own connections" ON "public"."user_connections" FOR UPDATE USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "addressee_id") OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Users can update own pending images" ON "public"."user_trek_images" FOR UPDATE TO "authenticated" USING ((("uploaded_by" = "auth"."uid"()) AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can update own posts" ON "public"."user_posts" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Users can update own tag assignments" ON "public"."image_tag_assignments" FOR UPDATE TO "authenticated" USING ((((("image_type")::"text" = 'user_image'::"text") AND ("assigned_by" = "auth"."uid"())) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can update their own comments" ON "public"."trek_comments" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can update their own nudges" ON "public"."nudges" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own participant ratings" ON "public"."trek_participant_ratings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "rated_by_user_id")) WITH CHECK (("auth"."uid"() = "rated_by_user_id"));



CREATE POLICY "Users can update their own pending tent requests" ON "public"."tent_requests" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND (("status")::"text" = 'pending'::"text")));



CREATE POLICY "Users can update their own trek ratings" ON "public"."trek_ratings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can upload own ID proofs" ON "public"."registration_id_proofs" FOR INSERT WITH CHECK ((("auth"."uid"())::"text" = ("uploaded_by")::"text"));



CREATE POLICY "Users can upload proof" ON "public"."trek_registrations" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK ((("user_id" = "auth"."uid"()) AND (("payment_status" IS NULL) OR ("payment_status" = ANY (ARRAY['Requested'::"text", 'ProofUploaded'::"text", 'Pending'::"text"])))));



CREATE POLICY "Users can view all reactions" ON "public"."post_reactions" FOR SELECT USING (true);



CREATE POLICY "Users can view comments for treks they're registered for" ON "public"."trek_comments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trek_registrations"
  WHERE (("trek_registrations"."trek_id" = "trek_comments"."trek_id") AND ("trek_registrations"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("trek_registrations"."payment_status" <> 'Cancelled'::"text")))));



CREATE POLICY "Users can view expenses for treks they're registered for" ON "public"."trek_expenses" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."trek_registrations"
  WHERE (("trek_registrations"."trek_id" = "trek_expenses"."trek_id") AND ("trek_registrations"."user_id" = "auth"."uid"()) AND ("trek_registrations"."payment_status" <> 'Cancelled'::"text")))) OR ("creator_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can view own ID proofs" ON "public"."registration_id_proofs" FOR SELECT USING (((("auth"."uid"())::"text" = ("uploaded_by")::"text") OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can view own connections" ON "public"."user_connections" FOR SELECT USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "addressee_id") OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Users can view own posts and friends public posts" ON "public"."user_posts" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (("visibility")::"text" = 'public'::"text") OR ((("visibility")::"text" = 'friends'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."user_connections"
  WHERE ((("user_connections"."requester_id" = "auth"."uid"()) AND ("user_connections"."addressee_id" = "user_posts"."user_id")) OR (("user_connections"."addressee_id" = "auth"."uid"()) AND ("user_connections"."requester_id" = "user_posts"."user_id") AND (("user_connections"."status")::"text" = 'accepted'::"text")))))) OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Users can view own registrations" ON "public"."trek_registrations" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own transport assignments" ON "public"."trek_transport_assignments" FOR SELECT TO "authenticated" USING ((("driver_user_id" = "auth"."uid"()) OR ("passenger_user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Users can view their own assignments" ON "public"."trek_driver_assignments" FOR SELECT TO "authenticated" USING ((("participant_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."trek_drivers"
  WHERE (("trek_drivers"."driver_id" = "trek_driver_assignments"."driver_id") AND ("trek_drivers"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text"))))));



CREATE POLICY "Users can view their own nudges" ON "public"."nudges" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own tent requests" ON "public"."tent_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "admin_registrations_full_access" ON "public"."trek_registrations" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "authenticated_read_all" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_read_users" ON "public"."users" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."avatar_catalog" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "avatar_catalog_admin_all" ON "public"."avatar_catalog" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "avatar_catalog_read_active" ON "public"."avatar_catalog" FOR SELECT USING (("active" = true));



ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_shares" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forum_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_categories_admin_all" ON "public"."forum_categories" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "forum_categories_read_auth" ON "public"."forum_categories" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."forum_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_posts_admin_all" ON "public"."forum_posts" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "forum_posts_delete_own" ON "public"."forum_posts" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "author_id") AND ("deleted_at" IS NULL))) WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "forum_posts_insert_auth" ON "public"."forum_posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "forum_posts_read_auth" ON "public"."forum_posts" FOR SELECT TO "authenticated" USING (("deleted_at" IS NULL));



CREATE POLICY "forum_posts_update_own" ON "public"."forum_posts" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "author_id") AND ("deleted_at" IS NULL))) WITH CHECK ((("auth"."uid"() = "author_id") AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."forum_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_tags_admin_all" ON "public"."forum_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "forum_tags_read_all" ON "public"."forum_tags" FOR SELECT USING (true);



ALTER TABLE "public"."forum_thread_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_thread_tags_admin_all" ON "public"."forum_thread_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "forum_thread_tags_delete_own" ON "public"."forum_thread_tags" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."forum_threads" "ft"
  WHERE (("ft"."id" = "forum_thread_tags"."thread_id") AND ("ft"."author_id" = "auth"."uid"())))));



CREATE POLICY "forum_thread_tags_insert_auth" ON "public"."forum_thread_tags" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "forum_thread_tags_read_all" ON "public"."forum_thread_tags" FOR SELECT USING (true);



ALTER TABLE "public"."forum_threads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "forum_threads_admin_update" ON "public"."forum_threads" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."user_id" = "auth"."uid"()) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "forum_threads_insert_auth" ON "public"."forum_threads" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "forum_threads_read_auth" ON "public"."forum_threads" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "forum_threads_update_own" ON "public"."forum_threads" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "author_id")) WITH CHECK (("auth"."uid"() = "author_id"));



ALTER TABLE "public"."id_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."image_tag_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."image_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."master_packing_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nudge_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nudges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_completion" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_milestones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_read_registrations" ON "public"."trek_registrations" FOR SELECT USING (true);



ALTER TABLE "public"."registration_id_proofs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "site_settings_read_all" ON "public"."site_settings" FOR SELECT USING (true);



CREATE POLICY "site_settings_write_auth" ON "public"."site_settings" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."subscriptions_billing" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tent_inventory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tent_rentals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tent_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tent_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_archive" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trek_archive_read_all" ON "public"."trek_archive" FOR SELECT USING (true);



CREATE POLICY "trek_archive_write_auth" ON "public"."trek_archive" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."trek_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_costs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trek_costs_read_all" ON "public"."trek_costs" FOR SELECT USING (true);



CREATE POLICY "trek_costs_write_auth" ON "public"."trek_costs" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."trek_driver_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_drivers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_event_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trek_event_images_read_all" ON "public"."trek_event_images" FOR SELECT USING (true);



CREATE POLICY "trek_event_images_write_auth" ON "public"."trek_event_images" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."trek_event_videos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trek_events_delete_auth" ON "public"."trek_events" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "trek_events_insert_auth" ON "public"."trek_events" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "trek_events_read_all" ON "public"."trek_events" FOR SELECT USING (true);



CREATE POLICY "trek_events_update_auth" ON "public"."trek_events" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."trek_expense_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_id_requirements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_packing_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_packing_list_assignments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trek_packing_list_assignments_read_all" ON "public"."trek_packing_list_assignments" FOR SELECT USING (true);



CREATE POLICY "trek_packing_list_assignments_write_auth" ON "public"."trek_packing_list_assignments" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."trek_participant_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_pickup_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trek_registrations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trek_registrations_delete_own" ON "public"."trek_registrations" FOR DELETE USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "trek_registrations_insert_own" ON "public"."trek_registrations" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "trek_registrations_read_own" ON "public"."trek_registrations" FOR SELECT USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "trek_registrations_update_own" ON "public"."trek_registrations" FOR UPDATE USING ((("auth"."uid"())::"text" = ("user_id")::"text")) WITH CHECK ((("auth"."uid"())::"text" = ("user_id")::"text"));



ALTER TABLE "public"."trek_transport_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_connections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_insert_own" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_own_profile" ON "public"."users" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_own_profile_update" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_own_registrations_insert" ON "public"."trek_registrations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_own_registrations_read" ON "public"."trek_registrations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "user_own_registrations_update" ON "public"."trek_registrations" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_select_own" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_trek_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_update_own" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_simple" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"())::"text" = ("user_id")::"text"));



ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."box2d_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."box2d_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."box2d_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box2d_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."box2d_out"("public"."box2d") TO "postgres";
GRANT ALL ON FUNCTION "public"."box2d_out"("public"."box2d") TO "anon";
GRANT ALL ON FUNCTION "public"."box2d_out"("public"."box2d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box2d_out"("public"."box2d") TO "service_role";



GRANT ALL ON FUNCTION "public"."box2df_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."box2df_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."box2df_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box2df_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."box2df_out"("public"."box2df") TO "postgres";
GRANT ALL ON FUNCTION "public"."box2df_out"("public"."box2df") TO "anon";
GRANT ALL ON FUNCTION "public"."box2df_out"("public"."box2df") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box2df_out"("public"."box2df") TO "service_role";



GRANT ALL ON FUNCTION "public"."box3d_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."box3d_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."box3d_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box3d_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."box3d_out"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."box3d_out"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."box3d_out"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box3d_out"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_analyze"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_analyze"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_analyze"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_analyze"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geography_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_out"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_out"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_out"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_out"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geography_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_send"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_send"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_send"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_send"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."geography_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_typmod_out"(integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_typmod_out"(integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geography_typmod_out"(integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_typmod_out"(integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_analyze"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_analyze"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_analyze"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_analyze"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_out"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_out"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_out"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_out"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_recv"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_recv"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_recv"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_recv"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_send"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_send"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_send"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_send"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_typmod_out"(integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_typmod_out"(integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_typmod_out"(integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_typmod_out"(integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."gidx_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gidx_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gidx_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gidx_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gidx_out"("public"."gidx") TO "postgres";
GRANT ALL ON FUNCTION "public"."gidx_out"("public"."gidx") TO "anon";
GRANT ALL ON FUNCTION "public"."gidx_out"("public"."gidx") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gidx_out"("public"."gidx") TO "service_role";



GRANT ALL ON FUNCTION "public"."spheroid_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."spheroid_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."spheroid_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."spheroid_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."spheroid_out"("public"."spheroid") TO "postgres";
GRANT ALL ON FUNCTION "public"."spheroid_out"("public"."spheroid") TO "anon";
GRANT ALL ON FUNCTION "public"."spheroid_out"("public"."spheroid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."spheroid_out"("public"."spheroid") TO "service_role";



GRANT ALL ON FUNCTION "public"."box3d"("public"."box2d") TO "postgres";
GRANT ALL ON FUNCTION "public"."box3d"("public"."box2d") TO "anon";
GRANT ALL ON FUNCTION "public"."box3d"("public"."box2d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box3d"("public"."box2d") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry"("public"."box2d") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry"("public"."box2d") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry"("public"."box2d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry"("public"."box2d") TO "service_role";



GRANT ALL ON FUNCTION "public"."box"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."box"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."box"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."box2d"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."box2d"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."box2d"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box2d"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."geography"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."bytea"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."bytea"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."bytea"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bytea"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography"("public"."geography", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."geography"("public"."geography", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."geography"("public"."geography", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography"("public"."geography", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."box"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."box"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."box"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."box2d"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."box2d"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."box2d"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box2d"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."box3d"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."box3d"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."box3d"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box3d"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."bytea"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."bytea"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."bytea"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bytea"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geography"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry"("public"."geometry", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry"("public"."geometry", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."geometry"("public"."geometry", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry"("public"."geometry", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."json"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."json"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."json"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."json"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."jsonb"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."jsonb"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."jsonb"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."jsonb"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."path"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."path"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."path"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."path"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."point"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."point"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."point"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."point"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."polygon"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."polygon"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."polygon"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."polygon"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."text"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."text"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."text"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."text"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry"("path") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry"("path") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry"("path") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry"("path") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry"("point") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry"("point") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry"("point") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry"("point") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry"("polygon") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry"("polygon") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry"("polygon") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry"("polygon") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry"("text") TO "service_role";



GRANT ALL ON FUNCTION "app_auth"."partner_id"() TO "dashboard_user";











































































































































































GRANT ALL ON FUNCTION "public"."_postgis_deprecate"("oldname" "text", "newname" "text", "version" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_postgis_deprecate"("oldname" "text", "newname" "text", "version" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_postgis_deprecate"("oldname" "text", "newname" "text", "version" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_postgis_deprecate"("oldname" "text", "newname" "text", "version" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_postgis_index_extent"("tbl" "regclass", "col" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_postgis_index_extent"("tbl" "regclass", "col" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_postgis_index_extent"("tbl" "regclass", "col" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_postgis_index_extent"("tbl" "regclass", "col" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_postgis_join_selectivity"("regclass", "text", "regclass", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_postgis_join_selectivity"("regclass", "text", "regclass", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_postgis_join_selectivity"("regclass", "text", "regclass", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_postgis_join_selectivity"("regclass", "text", "regclass", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_postgis_pgsql_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."_postgis_pgsql_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."_postgis_pgsql_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_postgis_pgsql_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."_postgis_scripts_pgsql_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."_postgis_scripts_pgsql_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."_postgis_scripts_pgsql_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_postgis_scripts_pgsql_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."_postgis_selectivity"("tbl" "regclass", "att_name" "text", "geom" "public"."geometry", "mode" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_postgis_selectivity"("tbl" "regclass", "att_name" "text", "geom" "public"."geometry", "mode" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_postgis_selectivity"("tbl" "regclass", "att_name" "text", "geom" "public"."geometry", "mode" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_postgis_selectivity"("tbl" "regclass", "att_name" "text", "geom" "public"."geometry", "mode" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_postgis_stats"("tbl" "regclass", "att_name" "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_postgis_stats"("tbl" "regclass", "att_name" "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_postgis_stats"("tbl" "regclass", "att_name" "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_postgis_stats"("tbl" "regclass", "att_name" "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_3ddfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_3ddfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_3ddfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_3ddfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_3ddwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_3ddwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_3ddwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_3ddwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_3dintersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_3dintersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_3dintersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_3dintersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_asgml"(integer, "public"."geometry", integer, integer, "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_asgml"(integer, "public"."geometry", integer, integer, "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_asgml"(integer, "public"."geometry", integer, integer, "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_asgml"(integer, "public"."geometry", integer, integer, "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_asx3d"(integer, "public"."geometry", integer, integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_asx3d"(integer, "public"."geometry", integer, integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_asx3d"(integer, "public"."geometry", integer, integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_asx3d"(integer, "public"."geometry", integer, integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_bestsrid"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_bestsrid"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_bestsrid"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_bestsrid"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_bestsrid"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_bestsrid"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_bestsrid"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_bestsrid"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_containsproperly"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_containsproperly"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_containsproperly"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_containsproperly"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_coveredby"("geog1" "public"."geography", "geog2" "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_coveredby"("geog1" "public"."geography", "geog2" "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_coveredby"("geog1" "public"."geography", "geog2" "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_coveredby"("geog1" "public"."geography", "geog2" "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_coveredby"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_coveredby"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_coveredby"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_coveredby"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_covers"("geog1" "public"."geography", "geog2" "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_covers"("geog1" "public"."geography", "geog2" "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_covers"("geog1" "public"."geography", "geog2" "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_covers"("geog1" "public"."geography", "geog2" "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_covers"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_covers"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_covers"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_covers"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_crosses"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_crosses"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_crosses"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_crosses"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_dfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_dfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_dfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_dfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_distancetree"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_distancetree"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_distancetree"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_distancetree"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_distancetree"("public"."geography", "public"."geography", double precision, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_distancetree"("public"."geography", "public"."geography", double precision, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_distancetree"("public"."geography", "public"."geography", double precision, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_distancetree"("public"."geography", "public"."geography", double precision, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography", double precision, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography", double precision, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography", double precision, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_distanceuncached"("public"."geography", "public"."geography", double precision, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_dwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_dwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_dwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_dwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_dwithin"("geog1" "public"."geography", "geog2" "public"."geography", "tolerance" double precision, "use_spheroid" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_dwithin"("geog1" "public"."geography", "geog2" "public"."geography", "tolerance" double precision, "use_spheroid" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_dwithin"("geog1" "public"."geography", "geog2" "public"."geography", "tolerance" double precision, "use_spheroid" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_dwithin"("geog1" "public"."geography", "geog2" "public"."geography", "tolerance" double precision, "use_spheroid" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_dwithinuncached"("public"."geography", "public"."geography", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_dwithinuncached"("public"."geography", "public"."geography", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_dwithinuncached"("public"."geography", "public"."geography", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_dwithinuncached"("public"."geography", "public"."geography", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_dwithinuncached"("public"."geography", "public"."geography", double precision, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_dwithinuncached"("public"."geography", "public"."geography", double precision, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_dwithinuncached"("public"."geography", "public"."geography", double precision, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_dwithinuncached"("public"."geography", "public"."geography", double precision, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_expand"("public"."geography", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_expand"("public"."geography", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_expand"("public"."geography", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_expand"("public"."geography", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_geomfromgml"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_geomfromgml"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_geomfromgml"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_geomfromgml"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_intersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_intersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_intersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_intersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_linecrossingdirection"("line1" "public"."geometry", "line2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_linecrossingdirection"("line1" "public"."geometry", "line2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_linecrossingdirection"("line1" "public"."geometry", "line2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_linecrossingdirection"("line1" "public"."geometry", "line2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_longestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_longestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_longestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_longestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_maxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_maxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_maxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_maxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_orderingequals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_orderingequals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_orderingequals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_orderingequals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_pointoutside"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_pointoutside"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_pointoutside"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_pointoutside"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_sortablehash"("geom" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_sortablehash"("geom" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_sortablehash"("geom" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_sortablehash"("geom" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_touches"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_touches"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_touches"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_touches"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_voronoi"("g1" "public"."geometry", "clip" "public"."geometry", "tolerance" double precision, "return_polygons" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_voronoi"("g1" "public"."geometry", "clip" "public"."geometry", "tolerance" double precision, "return_polygons" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_st_voronoi"("g1" "public"."geometry", "clip" "public"."geometry", "tolerance" double precision, "return_polygons" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_voronoi"("g1" "public"."geometry", "clip" "public"."geometry", "tolerance" double precision, "return_polygons" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_st_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."_st_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."_st_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_st_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."add_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_thread_tags"("p_thread_id" bigint, "p_tag_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."addauth"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."addauth"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."addauth"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."addauth"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("table_name" character varying, "column_name" character varying, "new_srid" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("table_name" character varying, "column_name" character varying, "new_srid" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("table_name" character varying, "column_name" character varying, "new_srid" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("table_name" character varying, "column_name" character varying, "new_srid" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid_in" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid_in" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid_in" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."addgeometrycolumn"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid_in" integer, "new_type" character varying, "new_dim" integer, "use_typmod" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_post"("p_post_id" bigint, "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_post"("p_post_id" bigint, "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_post"("p_post_id" bigint, "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_thread"("p_thread_id" bigint, "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_thread"("p_thread_id" bigint, "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_thread"("p_thread_id" bigint, "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_registration"("registration_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."approve_registration"("registration_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_registration"("registration_id_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_trek"("p_trek_id" integer, "p_delete_original" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."archive_trek"("p_trek_id" integer, "p_delete_original" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_trek"("p_trek_id" integer, "p_delete_original" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."assign_image_tags"("p_image_id" bigint, "p_image_type" "text", "p_tag_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."assign_image_tags"("p_image_id" bigint, "p_image_type" "text", "p_tag_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_image_tags"("p_image_id" bigint, "p_image_type" "text", "p_tag_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."box3dtobox"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."box3dtobox"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."box3dtobox"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."box3dtobox"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_action_type" "text", "p_limit_per_hour" integer, "p_window_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_action_type" "text", "p_limit_per_hour" integer, "p_window_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_user_id" "uuid", "p_action_type" "text", "p_limit_per_hour" integer, "p_window_minutes" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."checkauth"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."checkauth"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."checkauth"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."checkauth"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."checkauth"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."checkauth"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."checkauth"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."checkauth"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."checkauthtrigger"() TO "postgres";
GRANT ALL ON FUNCTION "public"."checkauthtrigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."checkauthtrigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."checkauthtrigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_rate_limit_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_rate_limit_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_rate_limit_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."contains_2d"("public"."box2df", "public"."box2df") TO "postgres";
GRANT ALL ON FUNCTION "public"."contains_2d"("public"."box2df", "public"."box2df") TO "anon";
GRANT ALL ON FUNCTION "public"."contains_2d"("public"."box2df", "public"."box2df") TO "authenticated";
GRANT ALL ON FUNCTION "public"."contains_2d"("public"."box2df", "public"."box2df") TO "service_role";



GRANT ALL ON FUNCTION "public"."contains_2d"("public"."box2df", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."contains_2d"("public"."box2df", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."contains_2d"("public"."box2df", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."contains_2d"("public"."box2df", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."contains_2d"("public"."geometry", "public"."box2df") TO "postgres";
GRANT ALL ON FUNCTION "public"."contains_2d"("public"."geometry", "public"."box2df") TO "anon";
GRANT ALL ON FUNCTION "public"."contains_2d"("public"."geometry", "public"."box2df") TO "authenticated";
GRANT ALL ON FUNCTION "public"."contains_2d"("public"."geometry", "public"."box2df") TO "service_role";



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



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_type" "public"."notification_type_enum", "p_link" "text", "p_trek_id" integer, "p_related_entity_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_type" "public"."notification_type_enum", "p_link" "text", "p_trek_id" integer, "p_related_entity_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_message" "text", "p_type" "public"."notification_type_enum", "p_link" "text", "p_trek_id" integer, "p_related_entity_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_forum_category"("p_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_forum_category"("p_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_forum_category"("p_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."disablelongtransactions"() TO "postgres";
GRANT ALL ON FUNCTION "public"."disablelongtransactions"() TO "anon";
GRANT ALL ON FUNCTION "public"."disablelongtransactions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."disablelongtransactions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("table_name" character varying, "column_name" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("table_name" character varying, "column_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("table_name" character varying, "column_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("table_name" character varying, "column_name" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("schema_name" character varying, "table_name" character varying, "column_name" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("schema_name" character varying, "table_name" character varying, "column_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("schema_name" character varying, "table_name" character varying, "column_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("schema_name" character varying, "table_name" character varying, "column_name" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."dropgeometrycolumn"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."dropgeometrytable"("table_name" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."dropgeometrytable"("table_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."dropgeometrytable"("table_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."dropgeometrytable"("table_name" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."dropgeometrytable"("schema_name" character varying, "table_name" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."dropgeometrytable"("schema_name" character varying, "table_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."dropgeometrytable"("schema_name" character varying, "table_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."dropgeometrytable"("schema_name" character varying, "table_name" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."dropgeometrytable"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."dropgeometrytable"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."dropgeometrytable"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."dropgeometrytable"("catalog_name" character varying, "schema_name" character varying, "table_name" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."enablelongtransactions"() TO "postgres";
GRANT ALL ON FUNCTION "public"."enablelongtransactions"() TO "anon";
GRANT ALL ON FUNCTION "public"."enablelongtransactions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enablelongtransactions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_max_five_images"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_max_five_images"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_max_five_images"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_max_one_video"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_max_one_video"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_max_one_video"() TO "service_role";



GRANT ALL ON FUNCTION "public"."equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_srid"(character varying, character varying, character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."find_srid"(character varying, character varying, character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."find_srid"(character varying, character varying, character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_srid"(character varying, character varying, character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."geog_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geog_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geog_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geog_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_cmp"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_cmp"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_cmp"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_cmp"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_distance_knn"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_distance_knn"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_distance_knn"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_distance_knn"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_eq"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_eq"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_eq"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_eq"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_ge"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_ge"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_ge"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_ge"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_gist_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_gist_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_gist_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_gist_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_gist_consistent"("internal", "public"."geography", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_gist_consistent"("internal", "public"."geography", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geography_gist_consistent"("internal", "public"."geography", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_gist_consistent"("internal", "public"."geography", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_gist_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_gist_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_gist_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_gist_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_gist_distance"("internal", "public"."geography", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_gist_distance"("internal", "public"."geography", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geography_gist_distance"("internal", "public"."geography", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_gist_distance"("internal", "public"."geography", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_gist_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_gist_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_gist_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_gist_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_gist_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_gist_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_gist_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_gist_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_gist_same"("public"."box2d", "public"."box2d", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_gist_same"("public"."box2d", "public"."box2d", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_gist_same"("public"."box2d", "public"."box2d", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_gist_same"("public"."box2d", "public"."box2d", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_gist_union"("bytea", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_gist_union"("bytea", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_gist_union"("bytea", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_gist_union"("bytea", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_gt"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_gt"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_gt"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_gt"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_le"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_le"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_le"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_le"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_lt"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_lt"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_lt"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_lt"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_overlaps"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_overlaps"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_overlaps"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_overlaps"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_spgist_choose_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_spgist_choose_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_spgist_choose_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_spgist_choose_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_spgist_compress_nd"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_spgist_compress_nd"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_spgist_compress_nd"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_spgist_compress_nd"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_spgist_config_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_spgist_config_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_spgist_config_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_spgist_config_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_spgist_inner_consistent_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_spgist_inner_consistent_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_spgist_inner_consistent_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_spgist_inner_consistent_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_spgist_leaf_consistent_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_spgist_leaf_consistent_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_spgist_leaf_consistent_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_spgist_leaf_consistent_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geography_spgist_picksplit_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geography_spgist_picksplit_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geography_spgist_picksplit_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geography_spgist_picksplit_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geom2d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geom2d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geom2d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geom2d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geom3d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geom3d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geom3d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geom3d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geom4d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geom4d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geom4d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geom4d_brin_inclusion_add_value"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_above"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_above"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_above"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_above"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_below"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_below"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_below"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_below"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_cmp"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_cmp"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_cmp"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_cmp"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_contained_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_contained_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_contained_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_contained_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_contains_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_contains_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_contains_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_contains_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_contains_nd"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_contains_nd"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_contains_nd"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_contains_nd"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_distance_box"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_distance_box"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_distance_box"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_distance_box"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_distance_centroid"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_distance_centroid"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_distance_centroid"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_distance_centroid"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_distance_centroid_nd"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_distance_centroid_nd"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_distance_centroid_nd"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_distance_centroid_nd"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_distance_cpa"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_distance_cpa"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_distance_cpa"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_distance_cpa"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_eq"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_eq"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_eq"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_eq"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_ge"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_ge"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_ge"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_ge"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_compress_2d"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_compress_2d"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_compress_2d"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_compress_2d"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_compress_nd"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_compress_nd"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_compress_nd"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_compress_nd"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_consistent_2d"("internal", "public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_consistent_2d"("internal", "public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_consistent_2d"("internal", "public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_consistent_2d"("internal", "public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_consistent_nd"("internal", "public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_consistent_nd"("internal", "public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_consistent_nd"("internal", "public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_consistent_nd"("internal", "public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_decompress_2d"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_decompress_2d"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_decompress_2d"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_decompress_2d"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_decompress_nd"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_decompress_nd"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_decompress_nd"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_decompress_nd"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_distance_2d"("internal", "public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_distance_2d"("internal", "public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_distance_2d"("internal", "public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_distance_2d"("internal", "public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_distance_nd"("internal", "public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_distance_nd"("internal", "public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_distance_nd"("internal", "public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_distance_nd"("internal", "public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_penalty_2d"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_penalty_2d"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_penalty_2d"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_penalty_2d"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_penalty_nd"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_penalty_nd"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_penalty_nd"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_penalty_nd"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_picksplit_2d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_picksplit_2d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_picksplit_2d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_picksplit_2d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_picksplit_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_picksplit_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_picksplit_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_picksplit_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_same_2d"("geom1" "public"."geometry", "geom2" "public"."geometry", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_same_2d"("geom1" "public"."geometry", "geom2" "public"."geometry", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_same_2d"("geom1" "public"."geometry", "geom2" "public"."geometry", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_same_2d"("geom1" "public"."geometry", "geom2" "public"."geometry", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_same_nd"("public"."geometry", "public"."geometry", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_same_nd"("public"."geometry", "public"."geometry", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_same_nd"("public"."geometry", "public"."geometry", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_same_nd"("public"."geometry", "public"."geometry", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_sortsupport_2d"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_sortsupport_2d"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_sortsupport_2d"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_sortsupport_2d"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_union_2d"("bytea", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_union_2d"("bytea", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_union_2d"("bytea", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_union_2d"("bytea", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gist_union_nd"("bytea", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gist_union_nd"("bytea", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gist_union_nd"("bytea", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gist_union_nd"("bytea", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_gt"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_gt"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_gt"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_gt"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_hash"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_hash"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_hash"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_hash"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_le"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_le"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_le"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_le"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_left"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_left"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_left"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_left"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_lt"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_lt"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_lt"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_lt"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_overabove"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_overabove"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_overabove"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_overabove"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_overbelow"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_overbelow"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_overbelow"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_overbelow"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_overlaps_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_overlaps_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_overlaps_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_overlaps_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_overlaps_nd"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_overlaps_nd"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_overlaps_nd"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_overlaps_nd"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_overleft"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_overleft"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_overleft"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_overleft"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_overright"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_overright"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_overright"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_overright"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_right"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_right"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_right"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_right"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_same"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_same"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_same"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_same"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_same_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_same_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_same_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_same_3d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_same_nd"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_same_nd"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_same_nd"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_same_nd"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_sortsupport"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_sortsupport"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_sortsupport"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_sortsupport"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_2d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_2d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_2d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_2d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_3d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_3d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_3d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_3d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_choose_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_2d"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_2d"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_2d"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_2d"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_3d"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_3d"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_3d"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_3d"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_nd"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_nd"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_nd"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_compress_nd"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_config_2d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_config_2d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_config_2d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_config_2d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_config_3d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_config_3d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_config_3d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_config_3d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_config_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_config_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_config_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_config_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_2d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_2d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_2d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_2d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_3d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_3d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_3d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_3d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_inner_consistent_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_2d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_2d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_2d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_2d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_3d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_3d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_3d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_3d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_leaf_consistent_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_2d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_2d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_2d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_2d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_3d"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_3d"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_3d"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_3d"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_nd"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_nd"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_nd"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_spgist_picksplit_nd"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometry_within_nd"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometry_within_nd"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometry_within_nd"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometry_within_nd"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometrytype"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometrytype"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."geometrytype"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometrytype"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."geometrytype"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."geometrytype"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."geometrytype"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geometrytype"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."geomfromewkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."geomfromewkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."geomfromewkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geomfromewkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."geomfromewkt"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."geomfromewkt"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."geomfromewkt"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."geomfromewkt"("text") TO "service_role";



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



GRANT ALL ON FUNCTION "public"."get_my_notifications"("page_size" integer, "page_num" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_notifications"("page_size" integer, "page_num" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_notifications"("page_size" integer, "page_num" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_proj4_from_srid"(integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."get_proj4_from_srid"(integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_proj4_from_srid"(integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_proj4_from_srid"(integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_tent_reserved_count"("trek_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_tent_reserved_count"("trek_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_tent_reserved_count"("trek_id_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_threads_by_tag"("p_tag_slug" character varying, "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_threads_by_tag"("p_tag_slug" character varying, "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_threads_by_tag"("p_tag_slug" character varying, "p_limit" integer, "p_offset" integer) TO "service_role";



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



GRANT ALL ON FUNCTION "public"."gettransactionid"() TO "postgres";
GRANT ALL ON FUNCTION "public"."gettransactionid"() TO "anon";
GRANT ALL ON FUNCTION "public"."gettransactionid"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gettransactionid"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gserialized_gist_joinsel_2d"("internal", "oid", "internal", smallint) TO "postgres";
GRANT ALL ON FUNCTION "public"."gserialized_gist_joinsel_2d"("internal", "oid", "internal", smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."gserialized_gist_joinsel_2d"("internal", "oid", "internal", smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."gserialized_gist_joinsel_2d"("internal", "oid", "internal", smallint) TO "service_role";



GRANT ALL ON FUNCTION "public"."gserialized_gist_joinsel_nd"("internal", "oid", "internal", smallint) TO "postgres";
GRANT ALL ON FUNCTION "public"."gserialized_gist_joinsel_nd"("internal", "oid", "internal", smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."gserialized_gist_joinsel_nd"("internal", "oid", "internal", smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."gserialized_gist_joinsel_nd"("internal", "oid", "internal", smallint) TO "service_role";



GRANT ALL ON FUNCTION "public"."gserialized_gist_sel_2d"("internal", "oid", "internal", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."gserialized_gist_sel_2d"("internal", "oid", "internal", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."gserialized_gist_sel_2d"("internal", "oid", "internal", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."gserialized_gist_sel_2d"("internal", "oid", "internal", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."gserialized_gist_sel_nd"("internal", "oid", "internal", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."gserialized_gist_sel_nd"("internal", "oid", "internal", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."gserialized_gist_sel_nd"("internal", "oid", "internal", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."gserialized_gist_sel_nd"("internal", "oid", "internal", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."box2df", "public"."box2df") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."box2df", "public"."box2df") TO "anon";
GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."box2df", "public"."box2df") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."box2df", "public"."box2df") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."box2df", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."box2df", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."box2df", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."box2df", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."geometry", "public"."box2df") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."geometry", "public"."box2df") TO "anon";
GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."geometry", "public"."box2df") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_contained_2d"("public"."geometry", "public"."box2df") TO "service_role";



GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", timestamp without time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", "text", timestamp without time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", "text", timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", "text", timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."lockrow"("text", "text", "text", "text", timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."longtransactionsenabled"() TO "postgres";
GRANT ALL ON FUNCTION "public"."longtransactionsenabled"() TO "anon";
GRANT ALL ON FUNCTION "public"."longtransactionsenabled"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."longtransactionsenabled"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_all_my_notifications_as_read"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_all_my_notifications_as_read"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_my_notifications_as_read"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_all_notifications_as_read"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_as_read"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_as_read"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" bigint, "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" bigint, "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("p_notification_id" bigint, "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."box2df", "public"."box2df") TO "postgres";
GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."box2df", "public"."box2df") TO "anon";
GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."box2df", "public"."box2df") TO "authenticated";
GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."box2df", "public"."box2df") TO "service_role";



GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."box2df", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."box2df", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."box2df", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."box2df", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."geometry", "public"."box2df") TO "postgres";
GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."geometry", "public"."box2df") TO "anon";
GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."geometry", "public"."box2df") TO "authenticated";
GRANT ALL ON FUNCTION "public"."overlaps_2d"("public"."geometry", "public"."box2df") TO "service_role";



GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."geography", "public"."gidx") TO "postgres";
GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."geography", "public"."gidx") TO "anon";
GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."geography", "public"."gidx") TO "authenticated";
GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."geography", "public"."gidx") TO "service_role";



GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."gidx", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."gidx", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."gidx", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."gidx", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."gidx", "public"."gidx") TO "postgres";
GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."gidx", "public"."gidx") TO "anon";
GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."gidx", "public"."gidx") TO "authenticated";
GRANT ALL ON FUNCTION "public"."overlaps_geog"("public"."gidx", "public"."gidx") TO "service_role";



GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."geometry", "public"."gidx") TO "postgres";
GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."geometry", "public"."gidx") TO "anon";
GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."geometry", "public"."gidx") TO "authenticated";
GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."geometry", "public"."gidx") TO "service_role";



GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."gidx", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."gidx", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."gidx", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."gidx", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."gidx", "public"."gidx") TO "postgres";
GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."gidx", "public"."gidx") TO "anon";
GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."gidx", "public"."gidx") TO "authenticated";
GRANT ALL ON FUNCTION "public"."overlaps_nd"("public"."gidx", "public"."gidx") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_finalfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_finalfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_finalfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_finalfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement", boolean, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement", boolean, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement", boolean, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asflatgeobuf_transfn"("internal", "anyelement", boolean, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_finalfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_finalfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_finalfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_finalfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_transfn"("internal", "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_transfn"("internal", "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_transfn"("internal", "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_transfn"("internal", "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_transfn"("internal", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_transfn"("internal", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_transfn"("internal", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asgeobuf_transfn"("internal", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asmvt_combinefn"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_combinefn"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_combinefn"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_combinefn"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asmvt_deserialfn"("bytea", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_deserialfn"("bytea", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_deserialfn"("bytea", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_deserialfn"("bytea", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asmvt_finalfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_finalfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_finalfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_finalfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asmvt_serialfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_serialfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_serialfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_serialfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer, "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer, "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer, "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_asmvt_transfn"("internal", "anyelement", "text", integer, "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry", double precision, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry", double precision, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry", double precision, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_accum_transfn"("internal", "public"."geometry", double precision, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_clusterintersecting_finalfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_clusterintersecting_finalfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_clusterintersecting_finalfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_clusterintersecting_finalfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_clusterwithin_finalfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_clusterwithin_finalfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_clusterwithin_finalfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_clusterwithin_finalfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_collect_finalfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_collect_finalfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_collect_finalfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_collect_finalfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_makeline_finalfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_makeline_finalfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_makeline_finalfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_makeline_finalfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_polygonize_finalfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_polygonize_finalfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_polygonize_finalfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_polygonize_finalfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_combinefn"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_combinefn"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_combinefn"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_combinefn"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_deserialfn"("bytea", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_deserialfn"("bytea", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_deserialfn"("bytea", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_deserialfn"("bytea", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_finalfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_finalfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_finalfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_finalfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_serialfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_serialfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_serialfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_serialfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_transfn"("internal", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_transfn"("internal", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_transfn"("internal", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_transfn"("internal", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_transfn"("internal", "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_transfn"("internal", "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_transfn"("internal", "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgis_geometry_union_parallel_transfn"("internal", "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_geometry_columns"("use_typmod" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."populate_geometry_columns"("use_typmod" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."populate_geometry_columns"("use_typmod" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_geometry_columns"("use_typmod" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_geometry_columns"("tbl_oid" "oid", "use_typmod" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."populate_geometry_columns"("tbl_oid" "oid", "use_typmod" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."populate_geometry_columns"("tbl_oid" "oid", "use_typmod" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_geometry_columns"("tbl_oid" "oid", "use_typmod" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."populate_trek_id_requirements"() TO "anon";
GRANT ALL ON FUNCTION "public"."populate_trek_id_requirements"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_trek_id_requirements"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_addbbox"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_addbbox"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_addbbox"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_addbbox"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_cache_bbox"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_cache_bbox"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_cache_bbox"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_cache_bbox"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_constraint_dims"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_constraint_dims"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_constraint_dims"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_constraint_dims"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_constraint_srid"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_constraint_srid"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_constraint_srid"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_constraint_srid"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_constraint_type"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_constraint_type"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_constraint_type"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_constraint_type"("geomschema" "text", "geomtable" "text", "geomcolumn" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_dropbbox"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_dropbbox"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_dropbbox"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_dropbbox"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_extensions_upgrade"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_extensions_upgrade"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_extensions_upgrade"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_extensions_upgrade"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_full_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_full_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_full_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_full_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_geos_noop"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_geos_noop"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_geos_noop"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_geos_noop"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_geos_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_geos_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_geos_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_geos_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_getbbox"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_getbbox"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_getbbox"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_getbbox"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_hasbbox"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_hasbbox"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_hasbbox"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_hasbbox"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_index_supportfn"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_index_supportfn"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_index_supportfn"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_index_supportfn"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_lib_build_date"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_lib_build_date"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_lib_build_date"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_lib_build_date"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_lib_revision"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_lib_revision"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_lib_revision"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_lib_revision"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_lib_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_lib_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_lib_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_lib_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_libjson_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_libjson_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_libjson_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_libjson_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_liblwgeom_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_liblwgeom_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_liblwgeom_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_liblwgeom_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_libprotobuf_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_libprotobuf_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_libprotobuf_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_libprotobuf_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_libxml_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_libxml_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_libxml_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_libxml_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_noop"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_noop"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_noop"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_noop"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_proj_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_proj_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_proj_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_proj_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_scripts_build_date"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_scripts_build_date"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_scripts_build_date"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_scripts_build_date"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_scripts_installed"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_scripts_installed"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_scripts_installed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_scripts_installed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_scripts_released"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_scripts_released"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_scripts_released"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_scripts_released"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_svn_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_svn_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_svn_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_svn_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_transform_geometry"("geom" "public"."geometry", "text", "text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_transform_geometry"("geom" "public"."geometry", "text", "text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_transform_geometry"("geom" "public"."geometry", "text", "text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_transform_geometry"("geom" "public"."geometry", "text", "text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_type_name"("geomname" character varying, "coord_dimension" integer, "use_new_name" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_type_name"("geomname" character varying, "coord_dimension" integer, "use_new_name" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_type_name"("geomname" character varying, "coord_dimension" integer, "use_new_name" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_type_name"("geomname" character varying, "coord_dimension" integer, "use_new_name" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_typmod_dims"(integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_typmod_dims"(integer) TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_typmod_dims"(integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_typmod_dims"(integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_typmod_srid"(integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_typmod_srid"(integer) TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_typmod_srid"(integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_typmod_srid"(integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_typmod_type"(integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_typmod_type"(integer) TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_typmod_type"(integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_typmod_type"(integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."postgis_wagyu_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."postgis_wagyu_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."postgis_wagyu_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."postgis_wagyu_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."promote_user_image_to_official"("p_user_image_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."promote_user_image_to_official"("p_user_image_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."promote_user_image_to_official"("p_user_image_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."record_user_action"("p_user_id" "uuid", "p_action_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."record_user_action"("p_user_id" "uuid", "p_action_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_user_action"("p_user_id" "uuid", "p_action_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reject_registration"("registration_id_param" integer, "reason_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reject_registration"("registration_id_param" integer, "reason_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reject_registration"("registration_id_param" integer, "reason_param" "text") TO "service_role";



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



GRANT ALL ON FUNCTION "public"."st_3dclosestpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dclosestpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dclosestpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dclosestpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3ddfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3ddfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_3ddfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3ddfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3ddistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3ddistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3ddistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3ddistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3ddwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3ddwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_3ddwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3ddwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3dintersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dintersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dintersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dintersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3dlength"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dlength"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dlength"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dlength"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3dlineinterpolatepoint"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dlineinterpolatepoint"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dlineinterpolatepoint"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dlineinterpolatepoint"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3dlongestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dlongestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dlongestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dlongestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3dmakebox"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dmakebox"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dmakebox"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dmakebox"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3dmaxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dmaxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dmaxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dmaxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3dperimeter"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dperimeter"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dperimeter"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dperimeter"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_3dshortestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dshortestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dshortestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dshortestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_addmeasure"("public"."geometry", double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_addmeasure"("public"."geometry", double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_addmeasure"("public"."geometry", double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_addmeasure"("public"."geometry", double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_addpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_addpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_addpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_addpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_addpoint"("geom1" "public"."geometry", "geom2" "public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_addpoint"("geom1" "public"."geometry", "geom2" "public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_addpoint"("geom1" "public"."geometry", "geom2" "public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_addpoint"("geom1" "public"."geometry", "geom2" "public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_affine"("public"."geometry", double precision, double precision, double precision, double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_affine"("public"."geometry", double precision, double precision, double precision, double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_affine"("public"."geometry", double precision, double precision, double precision, double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_affine"("public"."geometry", double precision, double precision, double precision, double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_affine"("public"."geometry", double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_affine"("public"."geometry", double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_affine"("public"."geometry", double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_affine"("public"."geometry", double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_angle"("line1" "public"."geometry", "line2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_angle"("line1" "public"."geometry", "line2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_angle"("line1" "public"."geometry", "line2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_angle"("line1" "public"."geometry", "line2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_angle"("pt1" "public"."geometry", "pt2" "public"."geometry", "pt3" "public"."geometry", "pt4" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_angle"("pt1" "public"."geometry", "pt2" "public"."geometry", "pt3" "public"."geometry", "pt4" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_angle"("pt1" "public"."geometry", "pt2" "public"."geometry", "pt3" "public"."geometry", "pt4" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_angle"("pt1" "public"."geometry", "pt2" "public"."geometry", "pt3" "public"."geometry", "pt4" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_area"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_area"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_area"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_area"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_area"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_area"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_area"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_area"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_area"("geog" "public"."geography", "use_spheroid" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_area"("geog" "public"."geography", "use_spheroid" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_area"("geog" "public"."geography", "use_spheroid" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_area"("geog" "public"."geography", "use_spheroid" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_area2d"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_area2d"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_area2d"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_area2d"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geography", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geography", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geography", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geography", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geometry", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geometry", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geometry", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asbinary"("public"."geometry", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asencodedpolyline"("geom" "public"."geometry", "nprecision" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asencodedpolyline"("geom" "public"."geometry", "nprecision" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asencodedpolyline"("geom" "public"."geometry", "nprecision" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asencodedpolyline"("geom" "public"."geometry", "nprecision" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asewkb"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asewkb"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asewkb"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asewkb"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asewkb"("public"."geometry", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asewkb"("public"."geometry", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asewkb"("public"."geometry", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asewkb"("public"."geometry", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asewkt"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asewkt"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asewkt"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asewkt"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geography", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geography", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geography", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geography", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asewkt"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgeojson"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgeojson"("geog" "public"."geography", "maxdecimaldigits" integer, "options" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("geog" "public"."geography", "maxdecimaldigits" integer, "options" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("geog" "public"."geography", "maxdecimaldigits" integer, "options" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("geog" "public"."geography", "maxdecimaldigits" integer, "options" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgeojson"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgeojson"("r" "record", "geom_column" "text", "maxdecimaldigits" integer, "pretty_bool" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("r" "record", "geom_column" "text", "maxdecimaldigits" integer, "pretty_bool" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("r" "record", "geom_column" "text", "maxdecimaldigits" integer, "pretty_bool" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgeojson"("r" "record", "geom_column" "text", "maxdecimaldigits" integer, "pretty_bool" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgml"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgml"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgml"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgml"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgml"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgml"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgml"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgml"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgml"("geog" "public"."geography", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgml"("geog" "public"."geography", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgml"("geog" "public"."geography", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgml"("geog" "public"."geography", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgml"("version" integer, "geog" "public"."geography", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgml"("version" integer, "geog" "public"."geography", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgml"("version" integer, "geog" "public"."geography", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgml"("version" integer, "geog" "public"."geography", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgml"("version" integer, "geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgml"("version" integer, "geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgml"("version" integer, "geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgml"("version" integer, "geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer, "nprefix" "text", "id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_ashexewkb"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_ashexewkb"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_ashexewkb"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_ashexewkb"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_ashexewkb"("public"."geometry", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_ashexewkb"("public"."geometry", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_ashexewkb"("public"."geometry", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_ashexewkb"("public"."geometry", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_askml"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_askml"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_askml"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_askml"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_askml"("geog" "public"."geography", "maxdecimaldigits" integer, "nprefix" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_askml"("geog" "public"."geography", "maxdecimaldigits" integer, "nprefix" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_askml"("geog" "public"."geography", "maxdecimaldigits" integer, "nprefix" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_askml"("geog" "public"."geography", "maxdecimaldigits" integer, "nprefix" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_askml"("geom" "public"."geometry", "maxdecimaldigits" integer, "nprefix" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_askml"("geom" "public"."geometry", "maxdecimaldigits" integer, "nprefix" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_askml"("geom" "public"."geometry", "maxdecimaldigits" integer, "nprefix" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_askml"("geom" "public"."geometry", "maxdecimaldigits" integer, "nprefix" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_aslatlontext"("geom" "public"."geometry", "tmpl" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_aslatlontext"("geom" "public"."geometry", "tmpl" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_aslatlontext"("geom" "public"."geometry", "tmpl" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_aslatlontext"("geom" "public"."geometry", "tmpl" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asmarc21"("geom" "public"."geometry", "format" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asmarc21"("geom" "public"."geometry", "format" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asmarc21"("geom" "public"."geometry", "format" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asmarc21"("geom" "public"."geometry", "format" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asmvtgeom"("geom" "public"."geometry", "bounds" "public"."box2d", "extent" integer, "buffer" integer, "clip_geom" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asmvtgeom"("geom" "public"."geometry", "bounds" "public"."box2d", "extent" integer, "buffer" integer, "clip_geom" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asmvtgeom"("geom" "public"."geometry", "bounds" "public"."box2d", "extent" integer, "buffer" integer, "clip_geom" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asmvtgeom"("geom" "public"."geometry", "bounds" "public"."box2d", "extent" integer, "buffer" integer, "clip_geom" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_assvg"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_assvg"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_assvg"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_assvg"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_assvg"("geog" "public"."geography", "rel" integer, "maxdecimaldigits" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_assvg"("geog" "public"."geography", "rel" integer, "maxdecimaldigits" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_assvg"("geog" "public"."geography", "rel" integer, "maxdecimaldigits" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_assvg"("geog" "public"."geography", "rel" integer, "maxdecimaldigits" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_assvg"("geom" "public"."geometry", "rel" integer, "maxdecimaldigits" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_assvg"("geom" "public"."geometry", "rel" integer, "maxdecimaldigits" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_assvg"("geom" "public"."geometry", "rel" integer, "maxdecimaldigits" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_assvg"("geom" "public"."geometry", "rel" integer, "maxdecimaldigits" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_astext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_astext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_astext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_astext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_astext"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_astext"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_astext"("public"."geography", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geography", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geography", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geography", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_astext"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_astext"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_astwkb"("geom" "public"."geometry", "prec" integer, "prec_z" integer, "prec_m" integer, "with_sizes" boolean, "with_boxes" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_astwkb"("geom" "public"."geometry", "prec" integer, "prec_z" integer, "prec_m" integer, "with_sizes" boolean, "with_boxes" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_astwkb"("geom" "public"."geometry", "prec" integer, "prec_z" integer, "prec_m" integer, "with_sizes" boolean, "with_boxes" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_astwkb"("geom" "public"."geometry", "prec" integer, "prec_z" integer, "prec_m" integer, "with_sizes" boolean, "with_boxes" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_astwkb"("geom" "public"."geometry"[], "ids" bigint[], "prec" integer, "prec_z" integer, "prec_m" integer, "with_sizes" boolean, "with_boxes" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_astwkb"("geom" "public"."geometry"[], "ids" bigint[], "prec" integer, "prec_z" integer, "prec_m" integer, "with_sizes" boolean, "with_boxes" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_astwkb"("geom" "public"."geometry"[], "ids" bigint[], "prec" integer, "prec_z" integer, "prec_m" integer, "with_sizes" boolean, "with_boxes" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_astwkb"("geom" "public"."geometry"[], "ids" bigint[], "prec" integer, "prec_z" integer, "prec_m" integer, "with_sizes" boolean, "with_boxes" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asx3d"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asx3d"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asx3d"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asx3d"("geom" "public"."geometry", "maxdecimaldigits" integer, "options" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_azimuth"("geog1" "public"."geography", "geog2" "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_azimuth"("geog1" "public"."geography", "geog2" "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_azimuth"("geog1" "public"."geography", "geog2" "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_azimuth"("geog1" "public"."geography", "geog2" "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_azimuth"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_azimuth"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_azimuth"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_azimuth"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_bdmpolyfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_bdmpolyfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_bdmpolyfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_bdmpolyfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_bdpolyfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_bdpolyfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_bdpolyfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_bdpolyfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_boundary"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_boundary"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_boundary"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_boundary"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_boundingdiagonal"("geom" "public"."geometry", "fits" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_boundingdiagonal"("geom" "public"."geometry", "fits" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_boundingdiagonal"("geom" "public"."geometry", "fits" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_boundingdiagonal"("geom" "public"."geometry", "fits" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_box2dfromgeohash"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_box2dfromgeohash"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_box2dfromgeohash"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_box2dfromgeohash"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_buffer"("text", double precision, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_buffer"("public"."geography", double precision, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_buffer"("geom" "public"."geometry", "radius" double precision, "quadsegs" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_buffer"("geom" "public"."geometry", "radius" double precision, "quadsegs" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_buffer"("geom" "public"."geometry", "radius" double precision, "quadsegs" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_buffer"("geom" "public"."geometry", "radius" double precision, "quadsegs" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_buffer"("geom" "public"."geometry", "radius" double precision, "options" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_buffer"("geom" "public"."geometry", "radius" double precision, "options" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_buffer"("geom" "public"."geometry", "radius" double precision, "options" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_buffer"("geom" "public"."geometry", "radius" double precision, "options" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_buildarea"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_buildarea"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_buildarea"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_buildarea"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_centroid"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_centroid"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_centroid"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_centroid"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_centroid"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_centroid"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_centroid"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_centroid"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_centroid"("public"."geography", "use_spheroid" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_centroid"("public"."geography", "use_spheroid" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_centroid"("public"."geography", "use_spheroid" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_centroid"("public"."geography", "use_spheroid" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_chaikinsmoothing"("public"."geometry", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_chaikinsmoothing"("public"."geometry", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_chaikinsmoothing"("public"."geometry", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_chaikinsmoothing"("public"."geometry", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_cleangeometry"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_cleangeometry"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_cleangeometry"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_cleangeometry"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_clipbybox2d"("geom" "public"."geometry", "box" "public"."box2d") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_clipbybox2d"("geom" "public"."geometry", "box" "public"."box2d") TO "anon";
GRANT ALL ON FUNCTION "public"."st_clipbybox2d"("geom" "public"."geometry", "box" "public"."box2d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_clipbybox2d"("geom" "public"."geometry", "box" "public"."box2d") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_closestpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_closestpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_closestpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_closestpoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_closestpointofapproach"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_closestpointofapproach"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_closestpointofapproach"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_closestpointofapproach"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_clusterdbscan"("public"."geometry", "eps" double precision, "minpoints" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_clusterdbscan"("public"."geometry", "eps" double precision, "minpoints" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_clusterdbscan"("public"."geometry", "eps" double precision, "minpoints" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_clusterdbscan"("public"."geometry", "eps" double precision, "minpoints" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_clusterintersecting"("public"."geometry"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_clusterintersecting"("public"."geometry"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."st_clusterintersecting"("public"."geometry"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_clusterintersecting"("public"."geometry"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_clusterkmeans"("geom" "public"."geometry", "k" integer, "max_radius" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_clusterkmeans"("geom" "public"."geometry", "k" integer, "max_radius" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_clusterkmeans"("geom" "public"."geometry", "k" integer, "max_radius" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_clusterkmeans"("geom" "public"."geometry", "k" integer, "max_radius" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_clusterwithin"("public"."geometry"[], double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_clusterwithin"("public"."geometry"[], double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_clusterwithin"("public"."geometry"[], double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_clusterwithin"("public"."geometry"[], double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_collect"("public"."geometry"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_collect"("public"."geometry"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."st_collect"("public"."geometry"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_collect"("public"."geometry"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_collect"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_collect"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_collect"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_collect"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_collectionextract"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_collectionextract"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_collectionextract"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_collectionextract"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_collectionextract"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_collectionextract"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_collectionextract"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_collectionextract"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_collectionhomogenize"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_collectionhomogenize"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_collectionhomogenize"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_collectionhomogenize"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box2d", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box2d", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box2d", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box2d", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box3d", "public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box3d", "public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box3d", "public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box3d", "public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box3d", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box3d", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box3d", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_combinebbox"("public"."box3d", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_concavehull"("param_geom" "public"."geometry", "param_pctconvex" double precision, "param_allow_holes" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_concavehull"("param_geom" "public"."geometry", "param_pctconvex" double precision, "param_allow_holes" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_concavehull"("param_geom" "public"."geometry", "param_pctconvex" double precision, "param_allow_holes" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_concavehull"("param_geom" "public"."geometry", "param_pctconvex" double precision, "param_allow_holes" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_contains"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_containsproperly"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_containsproperly"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_containsproperly"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_containsproperly"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_convexhull"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_convexhull"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_convexhull"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_convexhull"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_coorddim"("geometry" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_coorddim"("geometry" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_coorddim"("geometry" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_coorddim"("geometry" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_coveredby"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_coveredby"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_coveredby"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_coveredby"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_coveredby"("geog1" "public"."geography", "geog2" "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_coveredby"("geog1" "public"."geography", "geog2" "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_coveredby"("geog1" "public"."geography", "geog2" "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_coveredby"("geog1" "public"."geography", "geog2" "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_coveredby"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_coveredby"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_coveredby"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_coveredby"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_covers"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_covers"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_covers"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_covers"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_covers"("geog1" "public"."geography", "geog2" "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_covers"("geog1" "public"."geography", "geog2" "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_covers"("geog1" "public"."geography", "geog2" "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_covers"("geog1" "public"."geography", "geog2" "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_covers"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_covers"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_covers"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_covers"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_cpawithin"("public"."geometry", "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_cpawithin"("public"."geometry", "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_cpawithin"("public"."geometry", "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_cpawithin"("public"."geometry", "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_crosses"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_crosses"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_crosses"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_crosses"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_curvetoline"("geom" "public"."geometry", "tol" double precision, "toltype" integer, "flags" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_curvetoline"("geom" "public"."geometry", "tol" double precision, "toltype" integer, "flags" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_curvetoline"("geom" "public"."geometry", "tol" double precision, "toltype" integer, "flags" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_curvetoline"("geom" "public"."geometry", "tol" double precision, "toltype" integer, "flags" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_delaunaytriangles"("g1" "public"."geometry", "tolerance" double precision, "flags" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_delaunaytriangles"("g1" "public"."geometry", "tolerance" double precision, "flags" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_delaunaytriangles"("g1" "public"."geometry", "tolerance" double precision, "flags" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_delaunaytriangles"("g1" "public"."geometry", "tolerance" double precision, "flags" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_dfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_dfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_dfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_dfullywithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_difference"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_difference"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_difference"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_difference"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_dimension"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_dimension"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_dimension"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_dimension"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_disjoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_disjoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_disjoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_disjoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_distance"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_distance"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_distance"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_distance"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_distance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_distance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_distance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_distance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_distance"("geog1" "public"."geography", "geog2" "public"."geography", "use_spheroid" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_distance"("geog1" "public"."geography", "geog2" "public"."geography", "use_spheroid" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_distance"("geog1" "public"."geography", "geog2" "public"."geography", "use_spheroid" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_distance"("geog1" "public"."geography", "geog2" "public"."geography", "use_spheroid" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_distancecpa"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_distancecpa"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_distancecpa"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_distancecpa"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_distancesphere"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_distancesphere"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_distancesphere"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_distancesphere"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_distancesphere"("geom1" "public"."geometry", "geom2" "public"."geometry", "radius" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_distancesphere"("geom1" "public"."geometry", "geom2" "public"."geometry", "radius" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_distancesphere"("geom1" "public"."geometry", "geom2" "public"."geometry", "radius" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_distancesphere"("geom1" "public"."geometry", "geom2" "public"."geometry", "radius" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_distancespheroid"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_distancespheroid"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_distancespheroid"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_distancespheroid"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_distancespheroid"("geom1" "public"."geometry", "geom2" "public"."geometry", "public"."spheroid") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_distancespheroid"("geom1" "public"."geometry", "geom2" "public"."geometry", "public"."spheroid") TO "anon";
GRANT ALL ON FUNCTION "public"."st_distancespheroid"("geom1" "public"."geometry", "geom2" "public"."geometry", "public"."spheroid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_distancespheroid"("geom1" "public"."geometry", "geom2" "public"."geometry", "public"."spheroid") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_dump"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_dump"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_dump"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_dump"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_dumppoints"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_dumppoints"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_dumppoints"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_dumppoints"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_dumprings"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_dumprings"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_dumprings"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_dumprings"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_dumpsegments"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_dumpsegments"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_dumpsegments"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_dumpsegments"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_dwithin"("text", "text", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_dwithin"("text", "text", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_dwithin"("text", "text", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_dwithin"("text", "text", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_dwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_dwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_dwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_dwithin"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_dwithin"("geog1" "public"."geography", "geog2" "public"."geography", "tolerance" double precision, "use_spheroid" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_dwithin"("geog1" "public"."geography", "geog2" "public"."geography", "tolerance" double precision, "use_spheroid" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_dwithin"("geog1" "public"."geography", "geog2" "public"."geography", "tolerance" double precision, "use_spheroid" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_dwithin"("geog1" "public"."geography", "geog2" "public"."geography", "tolerance" double precision, "use_spheroid" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_endpoint"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_endpoint"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_endpoint"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_endpoint"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_envelope"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_envelope"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_envelope"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_envelope"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_equals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text", "text", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text", "text", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text", "text", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_estimatedextent"("text", "text", "text", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_expand"("public"."box2d", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_expand"("public"."box2d", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_expand"("public"."box2d", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_expand"("public"."box2d", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_expand"("public"."box3d", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_expand"("public"."box3d", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_expand"("public"."box3d", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_expand"("public"."box3d", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_expand"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_expand"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_expand"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_expand"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_expand"("box" "public"."box2d", "dx" double precision, "dy" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_expand"("box" "public"."box2d", "dx" double precision, "dy" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_expand"("box" "public"."box2d", "dx" double precision, "dy" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_expand"("box" "public"."box2d", "dx" double precision, "dy" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_expand"("box" "public"."box3d", "dx" double precision, "dy" double precision, "dz" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_expand"("box" "public"."box3d", "dx" double precision, "dy" double precision, "dz" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_expand"("box" "public"."box3d", "dx" double precision, "dy" double precision, "dz" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_expand"("box" "public"."box3d", "dx" double precision, "dy" double precision, "dz" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_expand"("geom" "public"."geometry", "dx" double precision, "dy" double precision, "dz" double precision, "dm" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_expand"("geom" "public"."geometry", "dx" double precision, "dy" double precision, "dz" double precision, "dm" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_expand"("geom" "public"."geometry", "dx" double precision, "dy" double precision, "dz" double precision, "dm" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_expand"("geom" "public"."geometry", "dx" double precision, "dy" double precision, "dz" double precision, "dm" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_exteriorring"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_exteriorring"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_exteriorring"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_exteriorring"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_filterbym"("public"."geometry", double precision, double precision, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_filterbym"("public"."geometry", double precision, double precision, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_filterbym"("public"."geometry", double precision, double precision, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_filterbym"("public"."geometry", double precision, double precision, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_findextent"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_findextent"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_findextent"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_findextent"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_findextent"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_findextent"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_findextent"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_findextent"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_flipcoordinates"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_flipcoordinates"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_flipcoordinates"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_flipcoordinates"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_force2d"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_force2d"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_force2d"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_force2d"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_force3d"("geom" "public"."geometry", "zvalue" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_force3d"("geom" "public"."geometry", "zvalue" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_force3d"("geom" "public"."geometry", "zvalue" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_force3d"("geom" "public"."geometry", "zvalue" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_force3dm"("geom" "public"."geometry", "mvalue" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_force3dm"("geom" "public"."geometry", "mvalue" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_force3dm"("geom" "public"."geometry", "mvalue" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_force3dm"("geom" "public"."geometry", "mvalue" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_force3dz"("geom" "public"."geometry", "zvalue" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_force3dz"("geom" "public"."geometry", "zvalue" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_force3dz"("geom" "public"."geometry", "zvalue" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_force3dz"("geom" "public"."geometry", "zvalue" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_force4d"("geom" "public"."geometry", "zvalue" double precision, "mvalue" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_force4d"("geom" "public"."geometry", "zvalue" double precision, "mvalue" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_force4d"("geom" "public"."geometry", "zvalue" double precision, "mvalue" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_force4d"("geom" "public"."geometry", "zvalue" double precision, "mvalue" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_forcecollection"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_forcecollection"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_forcecollection"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_forcecollection"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_forcecurve"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_forcecurve"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_forcecurve"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_forcecurve"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_forcepolygonccw"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_forcepolygonccw"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_forcepolygonccw"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_forcepolygonccw"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_forcepolygoncw"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_forcepolygoncw"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_forcepolygoncw"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_forcepolygoncw"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_forcerhr"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_forcerhr"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_forcerhr"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_forcerhr"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_forcesfs"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_forcesfs"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_forcesfs"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_forcesfs"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_forcesfs"("public"."geometry", "version" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_forcesfs"("public"."geometry", "version" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_forcesfs"("public"."geometry", "version" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_forcesfs"("public"."geometry", "version" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_frechetdistance"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_frechetdistance"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_frechetdistance"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_frechetdistance"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_fromflatgeobuf"("anyelement", "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_fromflatgeobuf"("anyelement", "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_fromflatgeobuf"("anyelement", "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_fromflatgeobuf"("anyelement", "bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_fromflatgeobuftotable"("text", "text", "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_fromflatgeobuftotable"("text", "text", "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_fromflatgeobuftotable"("text", "text", "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_fromflatgeobuftotable"("text", "text", "bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_generatepoints"("area" "public"."geometry", "npoints" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_generatepoints"("area" "public"."geometry", "npoints" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_generatepoints"("area" "public"."geometry", "npoints" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_generatepoints"("area" "public"."geometry", "npoints" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_generatepoints"("area" "public"."geometry", "npoints" integer, "seed" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_generatepoints"("area" "public"."geometry", "npoints" integer, "seed" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_generatepoints"("area" "public"."geometry", "npoints" integer, "seed" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_generatepoints"("area" "public"."geometry", "npoints" integer, "seed" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geogfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geogfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geogfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geogfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geogfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geogfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geogfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geogfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geographyfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geographyfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geographyfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geographyfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geohash"("geog" "public"."geography", "maxchars" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geohash"("geog" "public"."geography", "maxchars" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geohash"("geog" "public"."geography", "maxchars" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geohash"("geog" "public"."geography", "maxchars" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geohash"("geom" "public"."geometry", "maxchars" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geohash"("geom" "public"."geometry", "maxchars" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geohash"("geom" "public"."geometry", "maxchars" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geohash"("geom" "public"."geometry", "maxchars" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomcollfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomcollfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomcollfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomcollfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomcollfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomcollfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomcollfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomcollfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomcollfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomcollfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomcollfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomcollfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomcollfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomcollfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomcollfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomcollfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geometricmedian"("g" "public"."geometry", "tolerance" double precision, "max_iter" integer, "fail_if_not_converged" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geometricmedian"("g" "public"."geometry", "tolerance" double precision, "max_iter" integer, "fail_if_not_converged" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geometricmedian"("g" "public"."geometry", "tolerance" double precision, "max_iter" integer, "fail_if_not_converged" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geometricmedian"("g" "public"."geometry", "tolerance" double precision, "max_iter" integer, "fail_if_not_converged" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geometryfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geometryfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geometryfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geometryfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geometryfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geometryfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geometryfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geometryfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geometryn"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geometryn"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geometryn"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geometryn"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geometrytype"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geometrytype"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geometrytype"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geometrytype"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromewkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromewkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromewkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromewkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromewkt"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromewkt"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromewkt"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromewkt"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromgeohash"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromgeohash"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromgeohash"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromgeohash"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("json") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("json") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("json") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromgeojson"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromgml"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromgml"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromgml"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromgml"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromgml"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromgml"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromgml"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromgml"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromkml"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromkml"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromkml"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromkml"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfrommarc21"("marc21xml" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfrommarc21"("marc21xml" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfrommarc21"("marc21xml" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfrommarc21"("marc21xml" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromtwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromtwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromtwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromtwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_geomfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_geomfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_geomfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_geomfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_gmltosql"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_gmltosql"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_gmltosql"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_gmltosql"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_gmltosql"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_gmltosql"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_gmltosql"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_gmltosql"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_hasarc"("geometry" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_hasarc"("geometry" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_hasarc"("geometry" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_hasarc"("geometry" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_hausdorffdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_hausdorffdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_hausdorffdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_hausdorffdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_hausdorffdistance"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_hausdorffdistance"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_hausdorffdistance"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_hausdorffdistance"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_hexagon"("size" double precision, "cell_i" integer, "cell_j" integer, "origin" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_hexagon"("size" double precision, "cell_i" integer, "cell_j" integer, "origin" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_hexagon"("size" double precision, "cell_i" integer, "cell_j" integer, "origin" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_hexagon"("size" double precision, "cell_i" integer, "cell_j" integer, "origin" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_hexagongrid"("size" double precision, "bounds" "public"."geometry", OUT "geom" "public"."geometry", OUT "i" integer, OUT "j" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_hexagongrid"("size" double precision, "bounds" "public"."geometry", OUT "geom" "public"."geometry", OUT "i" integer, OUT "j" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_hexagongrid"("size" double precision, "bounds" "public"."geometry", OUT "geom" "public"."geometry", OUT "i" integer, OUT "j" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_hexagongrid"("size" double precision, "bounds" "public"."geometry", OUT "geom" "public"."geometry", OUT "i" integer, OUT "j" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_interiorringn"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_interiorringn"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_interiorringn"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_interiorringn"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_interpolatepoint"("line" "public"."geometry", "point" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_interpolatepoint"("line" "public"."geometry", "point" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_interpolatepoint"("line" "public"."geometry", "point" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_interpolatepoint"("line" "public"."geometry", "point" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_intersection"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_intersection"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_intersection"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_intersection"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_intersection"("public"."geography", "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_intersection"("public"."geography", "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_intersection"("public"."geography", "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_intersection"("public"."geography", "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_intersection"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_intersection"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_intersection"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_intersection"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_intersects"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_intersects"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_intersects"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_intersects"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_intersects"("geog1" "public"."geography", "geog2" "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_intersects"("geog1" "public"."geography", "geog2" "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_intersects"("geog1" "public"."geography", "geog2" "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_intersects"("geog1" "public"."geography", "geog2" "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_intersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_intersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_intersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_intersects"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_isclosed"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_isclosed"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_isclosed"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_isclosed"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_iscollection"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_iscollection"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_iscollection"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_iscollection"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_isempty"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_isempty"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_isempty"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_isempty"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_ispolygonccw"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_ispolygonccw"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_ispolygonccw"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_ispolygonccw"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_ispolygoncw"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_ispolygoncw"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_ispolygoncw"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_ispolygoncw"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_isring"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_isring"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_isring"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_isring"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_issimple"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_issimple"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_issimple"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_issimple"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_isvalid"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_isvalid"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_isvalid"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_isvalid"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_isvalid"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_isvalid"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_isvalid"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_isvalid"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_isvaliddetail"("geom" "public"."geometry", "flags" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_isvaliddetail"("geom" "public"."geometry", "flags" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_isvaliddetail"("geom" "public"."geometry", "flags" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_isvaliddetail"("geom" "public"."geometry", "flags" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_isvalidreason"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_isvalidreason"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_isvalidreason"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_isvalidreason"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_isvalidreason"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_isvalidreason"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_isvalidreason"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_isvalidreason"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_isvalidtrajectory"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_isvalidtrajectory"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_isvalidtrajectory"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_isvalidtrajectory"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_length"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_length"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_length"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_length"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_length"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_length"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_length"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_length"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_length"("geog" "public"."geography", "use_spheroid" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_length"("geog" "public"."geography", "use_spheroid" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_length"("geog" "public"."geography", "use_spheroid" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_length"("geog" "public"."geography", "use_spheroid" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_length2d"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_length2d"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_length2d"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_length2d"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_length2dspheroid"("public"."geometry", "public"."spheroid") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_length2dspheroid"("public"."geometry", "public"."spheroid") TO "anon";
GRANT ALL ON FUNCTION "public"."st_length2dspheroid"("public"."geometry", "public"."spheroid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_length2dspheroid"("public"."geometry", "public"."spheroid") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_lengthspheroid"("public"."geometry", "public"."spheroid") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_lengthspheroid"("public"."geometry", "public"."spheroid") TO "anon";
GRANT ALL ON FUNCTION "public"."st_lengthspheroid"("public"."geometry", "public"."spheroid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_lengthspheroid"("public"."geometry", "public"."spheroid") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_letters"("letters" "text", "font" "json") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_letters"("letters" "text", "font" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."st_letters"("letters" "text", "font" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_letters"("letters" "text", "font" "json") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linecrossingdirection"("line1" "public"."geometry", "line2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linecrossingdirection"("line1" "public"."geometry", "line2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_linecrossingdirection"("line1" "public"."geometry", "line2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linecrossingdirection"("line1" "public"."geometry", "line2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linefromencodedpolyline"("txtin" "text", "nprecision" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linefromencodedpolyline"("txtin" "text", "nprecision" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_linefromencodedpolyline"("txtin" "text", "nprecision" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linefromencodedpolyline"("txtin" "text", "nprecision" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linefrommultipoint"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linefrommultipoint"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_linefrommultipoint"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linefrommultipoint"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linefromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linefromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_linefromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linefromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linefromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linefromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_linefromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linefromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linefromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linefromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_linefromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linefromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linefromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linefromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_linefromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linefromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_lineinterpolatepoint"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_lineinterpolatepoint"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_lineinterpolatepoint"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_lineinterpolatepoint"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_lineinterpolatepoints"("public"."geometry", double precision, "repeat" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_lineinterpolatepoints"("public"."geometry", double precision, "repeat" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_lineinterpolatepoints"("public"."geometry", double precision, "repeat" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_lineinterpolatepoints"("public"."geometry", double precision, "repeat" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linelocatepoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linelocatepoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_linelocatepoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linelocatepoint"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linemerge"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linemerge"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_linemerge"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linemerge"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linemerge"("public"."geometry", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linemerge"("public"."geometry", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_linemerge"("public"."geometry", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linemerge"("public"."geometry", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linestringfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linestringfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_linestringfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linestringfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linestringfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linestringfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_linestringfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linestringfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linesubstring"("public"."geometry", double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linesubstring"("public"."geometry", double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_linesubstring"("public"."geometry", double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linesubstring"("public"."geometry", double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_linetocurve"("geometry" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_linetocurve"("geometry" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_linetocurve"("geometry" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_linetocurve"("geometry" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_locatealong"("geometry" "public"."geometry", "measure" double precision, "leftrightoffset" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_locatealong"("geometry" "public"."geometry", "measure" double precision, "leftrightoffset" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_locatealong"("geometry" "public"."geometry", "measure" double precision, "leftrightoffset" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_locatealong"("geometry" "public"."geometry", "measure" double precision, "leftrightoffset" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_locatebetween"("geometry" "public"."geometry", "frommeasure" double precision, "tomeasure" double precision, "leftrightoffset" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_locatebetween"("geometry" "public"."geometry", "frommeasure" double precision, "tomeasure" double precision, "leftrightoffset" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_locatebetween"("geometry" "public"."geometry", "frommeasure" double precision, "tomeasure" double precision, "leftrightoffset" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_locatebetween"("geometry" "public"."geometry", "frommeasure" double precision, "tomeasure" double precision, "leftrightoffset" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_locatebetweenelevations"("geometry" "public"."geometry", "fromelevation" double precision, "toelevation" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_locatebetweenelevations"("geometry" "public"."geometry", "fromelevation" double precision, "toelevation" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_locatebetweenelevations"("geometry" "public"."geometry", "fromelevation" double precision, "toelevation" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_locatebetweenelevations"("geometry" "public"."geometry", "fromelevation" double precision, "toelevation" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_longestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_longestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_longestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_longestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_m"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_m"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_m"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_m"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makebox2d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makebox2d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_makebox2d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makebox2d"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makeenvelope"(double precision, double precision, double precision, double precision, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makeenvelope"(double precision, double precision, double precision, double precision, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_makeenvelope"(double precision, double precision, double precision, double precision, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makeenvelope"(double precision, double precision, double precision, double precision, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makeline"("public"."geometry"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makeline"("public"."geometry"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."st_makeline"("public"."geometry"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makeline"("public"."geometry"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makeline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makeline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_makeline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makeline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makepoint"(double precision, double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makepointm"(double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makepointm"(double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_makepointm"(double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makepointm"(double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makepolygon"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makepolygon"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_makepolygon"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makepolygon"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makepolygon"("public"."geometry", "public"."geometry"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makepolygon"("public"."geometry", "public"."geometry"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."st_makepolygon"("public"."geometry", "public"."geometry"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makepolygon"("public"."geometry", "public"."geometry"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makevalid"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makevalid"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_makevalid"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makevalid"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makevalid"("geom" "public"."geometry", "params" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makevalid"("geom" "public"."geometry", "params" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_makevalid"("geom" "public"."geometry", "params" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makevalid"("geom" "public"."geometry", "params" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_maxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_maxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_maxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_maxdistance"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_maximuminscribedcircle"("public"."geometry", OUT "center" "public"."geometry", OUT "nearest" "public"."geometry", OUT "radius" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_maximuminscribedcircle"("public"."geometry", OUT "center" "public"."geometry", OUT "nearest" "public"."geometry", OUT "radius" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_maximuminscribedcircle"("public"."geometry", OUT "center" "public"."geometry", OUT "nearest" "public"."geometry", OUT "radius" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_maximuminscribedcircle"("public"."geometry", OUT "center" "public"."geometry", OUT "nearest" "public"."geometry", OUT "radius" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_memsize"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_memsize"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_memsize"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_memsize"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_minimumboundingcircle"("inputgeom" "public"."geometry", "segs_per_quarter" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_minimumboundingcircle"("inputgeom" "public"."geometry", "segs_per_quarter" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_minimumboundingcircle"("inputgeom" "public"."geometry", "segs_per_quarter" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_minimumboundingcircle"("inputgeom" "public"."geometry", "segs_per_quarter" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_minimumboundingradius"("public"."geometry", OUT "center" "public"."geometry", OUT "radius" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_minimumboundingradius"("public"."geometry", OUT "center" "public"."geometry", OUT "radius" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_minimumboundingradius"("public"."geometry", OUT "center" "public"."geometry", OUT "radius" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_minimumboundingradius"("public"."geometry", OUT "center" "public"."geometry", OUT "radius" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_minimumclearance"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_minimumclearance"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_minimumclearance"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_minimumclearance"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_minimumclearanceline"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_minimumclearanceline"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_minimumclearanceline"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_minimumclearanceline"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mlinefromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mlinefromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_mlinefromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mlinefromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mlinefromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mlinefromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_mlinefromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mlinefromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mlinefromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mlinefromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_mlinefromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mlinefromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mlinefromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mlinefromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_mlinefromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mlinefromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mpointfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mpointfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_mpointfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mpointfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mpointfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mpointfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_mpointfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mpointfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mpointfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mpointfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_mpointfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mpointfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mpointfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mpointfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_mpointfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mpointfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mpolyfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mpolyfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_mpolyfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mpolyfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mpolyfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mpolyfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_mpolyfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mpolyfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mpolyfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mpolyfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_mpolyfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mpolyfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_mpolyfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_mpolyfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_mpolyfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_mpolyfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multi"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multi"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_multi"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multi"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multilinefromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multilinefromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_multilinefromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multilinefromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multilinestringfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multilinestringfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_multilinestringfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multilinestringfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multilinestringfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multilinestringfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_multilinestringfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multilinestringfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multipointfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multipointfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_multipointfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multipointfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multipointfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multipointfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_multipointfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multipointfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multipointfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multipointfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_multipointfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multipointfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multipolyfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multipolyfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_multipolyfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multipolyfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multipolyfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multipolyfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_multipolyfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multipolyfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multipolygonfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multipolygonfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_multipolygonfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multipolygonfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_multipolygonfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_multipolygonfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_multipolygonfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_multipolygonfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_ndims"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_ndims"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_ndims"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_ndims"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_node"("g" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_node"("g" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_node"("g" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_node"("g" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_normalize"("geom" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_normalize"("geom" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_normalize"("geom" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_normalize"("geom" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_npoints"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_npoints"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_npoints"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_npoints"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_nrings"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_nrings"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_nrings"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_nrings"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_numgeometries"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_numgeometries"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_numgeometries"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_numgeometries"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_numinteriorring"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_numinteriorring"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_numinteriorring"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_numinteriorring"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_numinteriorrings"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_numinteriorrings"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_numinteriorrings"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_numinteriorrings"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_numpatches"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_numpatches"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_numpatches"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_numpatches"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_numpoints"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_numpoints"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_numpoints"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_numpoints"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_offsetcurve"("line" "public"."geometry", "distance" double precision, "params" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_offsetcurve"("line" "public"."geometry", "distance" double precision, "params" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_offsetcurve"("line" "public"."geometry", "distance" double precision, "params" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_offsetcurve"("line" "public"."geometry", "distance" double precision, "params" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_orderingequals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_orderingequals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_orderingequals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_orderingequals"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_orientedenvelope"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_orientedenvelope"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_orientedenvelope"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_orientedenvelope"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_overlaps"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_patchn"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_patchn"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_patchn"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_patchn"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_perimeter"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_perimeter"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_perimeter"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_perimeter"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_perimeter"("geog" "public"."geography", "use_spheroid" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_perimeter"("geog" "public"."geography", "use_spheroid" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_perimeter"("geog" "public"."geography", "use_spheroid" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_perimeter"("geog" "public"."geography", "use_spheroid" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_perimeter2d"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_perimeter2d"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_perimeter2d"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_perimeter2d"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_point"(double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_point"(double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_point"(double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_point"(double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_point"(double precision, double precision, "srid" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_point"(double precision, double precision, "srid" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_point"(double precision, double precision, "srid" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_point"(double precision, double precision, "srid" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointfromgeohash"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointfromgeohash"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointfromgeohash"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointfromgeohash"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointinsidecircle"("public"."geometry", double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointinsidecircle"("public"."geometry", double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointinsidecircle"("public"."geometry", double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointinsidecircle"("public"."geometry", double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointm"("xcoordinate" double precision, "ycoordinate" double precision, "mcoordinate" double precision, "srid" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointm"("xcoordinate" double precision, "ycoordinate" double precision, "mcoordinate" double precision, "srid" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointm"("xcoordinate" double precision, "ycoordinate" double precision, "mcoordinate" double precision, "srid" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointm"("xcoordinate" double precision, "ycoordinate" double precision, "mcoordinate" double precision, "srid" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointn"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointn"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointn"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointn"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointonsurface"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointonsurface"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointonsurface"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointonsurface"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_points"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_points"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_points"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_points"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointz"("xcoordinate" double precision, "ycoordinate" double precision, "zcoordinate" double precision, "srid" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointz"("xcoordinate" double precision, "ycoordinate" double precision, "zcoordinate" double precision, "srid" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointz"("xcoordinate" double precision, "ycoordinate" double precision, "zcoordinate" double precision, "srid" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointz"("xcoordinate" double precision, "ycoordinate" double precision, "zcoordinate" double precision, "srid" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_pointzm"("xcoordinate" double precision, "ycoordinate" double precision, "zcoordinate" double precision, "mcoordinate" double precision, "srid" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_pointzm"("xcoordinate" double precision, "ycoordinate" double precision, "zcoordinate" double precision, "mcoordinate" double precision, "srid" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_pointzm"("xcoordinate" double precision, "ycoordinate" double precision, "zcoordinate" double precision, "mcoordinate" double precision, "srid" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_pointzm"("xcoordinate" double precision, "ycoordinate" double precision, "zcoordinate" double precision, "mcoordinate" double precision, "srid" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polyfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polyfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_polyfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polyfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polyfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polyfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_polyfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polyfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polyfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polyfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_polyfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polyfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polyfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polyfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_polyfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polyfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polygon"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polygon"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_polygon"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polygon"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polygonfromtext"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polygonfromtext"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_polygonfromtext"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polygonfromtext"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polygonfromtext"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polygonfromtext"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_polygonfromtext"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polygonfromtext"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polygonfromwkb"("bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polygonfromwkb"("bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_polygonfromwkb"("bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polygonfromwkb"("bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polygonfromwkb"("bytea", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polygonfromwkb"("bytea", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_polygonfromwkb"("bytea", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polygonfromwkb"("bytea", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polygonize"("public"."geometry"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polygonize"("public"."geometry"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."st_polygonize"("public"."geometry"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polygonize"("public"."geometry"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_project"("geog" "public"."geography", "distance" double precision, "azimuth" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_project"("geog" "public"."geography", "distance" double precision, "azimuth" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_project"("geog" "public"."geography", "distance" double precision, "azimuth" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_project"("geog" "public"."geography", "distance" double precision, "azimuth" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_quantizecoordinates"("g" "public"."geometry", "prec_x" integer, "prec_y" integer, "prec_z" integer, "prec_m" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_quantizecoordinates"("g" "public"."geometry", "prec_x" integer, "prec_y" integer, "prec_z" integer, "prec_m" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_quantizecoordinates"("g" "public"."geometry", "prec_x" integer, "prec_y" integer, "prec_z" integer, "prec_m" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_quantizecoordinates"("g" "public"."geometry", "prec_x" integer, "prec_y" integer, "prec_z" integer, "prec_m" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_reduceprecision"("geom" "public"."geometry", "gridsize" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_reduceprecision"("geom" "public"."geometry", "gridsize" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_reduceprecision"("geom" "public"."geometry", "gridsize" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_reduceprecision"("geom" "public"."geometry", "gridsize" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_relate"("geom1" "public"."geometry", "geom2" "public"."geometry", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_relatematch"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_relatematch"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_relatematch"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_relatematch"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_removepoint"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_removepoint"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_removepoint"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_removepoint"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_removerepeatedpoints"("geom" "public"."geometry", "tolerance" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_removerepeatedpoints"("geom" "public"."geometry", "tolerance" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_removerepeatedpoints"("geom" "public"."geometry", "tolerance" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_removerepeatedpoints"("geom" "public"."geometry", "tolerance" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_reverse"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_reverse"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_reverse"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_reverse"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision, "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision, "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision, "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision, "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_rotate"("public"."geometry", double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_rotatex"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_rotatex"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_rotatex"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_rotatex"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_rotatey"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_rotatey"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_rotatey"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_rotatey"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_rotatez"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_rotatez"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_rotatez"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_rotatez"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", "public"."geometry", "origin" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", "public"."geometry", "origin" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", "public"."geometry", "origin" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", "public"."geometry", "origin" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_scale"("public"."geometry", double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_scroll"("public"."geometry", "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_scroll"("public"."geometry", "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_scroll"("public"."geometry", "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_scroll"("public"."geometry", "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_segmentize"("geog" "public"."geography", "max_segment_length" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_segmentize"("geog" "public"."geography", "max_segment_length" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_segmentize"("geog" "public"."geography", "max_segment_length" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_segmentize"("geog" "public"."geography", "max_segment_length" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_segmentize"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_segmentize"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_segmentize"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_segmentize"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_seteffectivearea"("public"."geometry", double precision, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_seteffectivearea"("public"."geometry", double precision, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_seteffectivearea"("public"."geometry", double precision, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_seteffectivearea"("public"."geometry", double precision, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_setpoint"("public"."geometry", integer, "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_setpoint"("public"."geometry", integer, "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_setpoint"("public"."geometry", integer, "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_setpoint"("public"."geometry", integer, "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_setsrid"("geog" "public"."geography", "srid" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_setsrid"("geog" "public"."geography", "srid" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_setsrid"("geog" "public"."geography", "srid" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_setsrid"("geog" "public"."geography", "srid" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_setsrid"("geom" "public"."geometry", "srid" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_setsrid"("geom" "public"."geometry", "srid" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_setsrid"("geom" "public"."geometry", "srid" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_setsrid"("geom" "public"."geometry", "srid" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_sharedpaths"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_sharedpaths"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_sharedpaths"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_sharedpaths"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_shiftlongitude"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_shiftlongitude"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_shiftlongitude"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_shiftlongitude"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_shortestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_shortestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_shortestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_shortestline"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_simplify"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_simplify"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_simplify"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_simplify"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_simplify"("public"."geometry", double precision, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_simplify"("public"."geometry", double precision, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_simplify"("public"."geometry", double precision, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_simplify"("public"."geometry", double precision, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_simplifypolygonhull"("geom" "public"."geometry", "vertex_fraction" double precision, "is_outer" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_simplifypolygonhull"("geom" "public"."geometry", "vertex_fraction" double precision, "is_outer" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_simplifypolygonhull"("geom" "public"."geometry", "vertex_fraction" double precision, "is_outer" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_simplifypolygonhull"("geom" "public"."geometry", "vertex_fraction" double precision, "is_outer" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_simplifypreservetopology"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_simplifypreservetopology"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_simplifypreservetopology"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_simplifypreservetopology"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_simplifyvw"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_simplifyvw"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_simplifyvw"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_simplifyvw"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_snap"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_snap"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_snap"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_snap"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision, double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision, double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision, double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("public"."geometry", double precision, double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_snaptogrid"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision, double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision, double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision, double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_snaptogrid"("geom1" "public"."geometry", "geom2" "public"."geometry", double precision, double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_split"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_split"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_split"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_split"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_square"("size" double precision, "cell_i" integer, "cell_j" integer, "origin" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_square"("size" double precision, "cell_i" integer, "cell_j" integer, "origin" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_square"("size" double precision, "cell_i" integer, "cell_j" integer, "origin" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_square"("size" double precision, "cell_i" integer, "cell_j" integer, "origin" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_squaregrid"("size" double precision, "bounds" "public"."geometry", OUT "geom" "public"."geometry", OUT "i" integer, OUT "j" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_squaregrid"("size" double precision, "bounds" "public"."geometry", OUT "geom" "public"."geometry", OUT "i" integer, OUT "j" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_squaregrid"("size" double precision, "bounds" "public"."geometry", OUT "geom" "public"."geometry", OUT "i" integer, OUT "j" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_squaregrid"("size" double precision, "bounds" "public"."geometry", OUT "geom" "public"."geometry", OUT "i" integer, OUT "j" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_srid"("geog" "public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_srid"("geog" "public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_srid"("geog" "public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_srid"("geog" "public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_srid"("geom" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_srid"("geom" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_srid"("geom" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_srid"("geom" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_startpoint"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_startpoint"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_startpoint"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_startpoint"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_subdivide"("geom" "public"."geometry", "maxvertices" integer, "gridsize" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_subdivide"("geom" "public"."geometry", "maxvertices" integer, "gridsize" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_subdivide"("geom" "public"."geometry", "maxvertices" integer, "gridsize" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_subdivide"("geom" "public"."geometry", "maxvertices" integer, "gridsize" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_summary"("public"."geography") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_summary"("public"."geography") TO "anon";
GRANT ALL ON FUNCTION "public"."st_summary"("public"."geography") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_summary"("public"."geography") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_summary"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_summary"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_summary"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_summary"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_swapordinates"("geom" "public"."geometry", "ords" "cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_swapordinates"("geom" "public"."geometry", "ords" "cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."st_swapordinates"("geom" "public"."geometry", "ords" "cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_swapordinates"("geom" "public"."geometry", "ords" "cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_symdifference"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_symdifference"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_symdifference"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_symdifference"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_symmetricdifference"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_symmetricdifference"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_symmetricdifference"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_symmetricdifference"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_tileenvelope"("zoom" integer, "x" integer, "y" integer, "bounds" "public"."geometry", "margin" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_tileenvelope"("zoom" integer, "x" integer, "y" integer, "bounds" "public"."geometry", "margin" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_tileenvelope"("zoom" integer, "x" integer, "y" integer, "bounds" "public"."geometry", "margin" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_tileenvelope"("zoom" integer, "x" integer, "y" integer, "bounds" "public"."geometry", "margin" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_touches"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_touches"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_touches"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_touches"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_transform"("public"."geometry", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_transform"("public"."geometry", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_transform"("public"."geometry", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_transform"("public"."geometry", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "to_proj" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "to_proj" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "to_proj" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "to_proj" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "from_proj" "text", "to_srid" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "from_proj" "text", "to_srid" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "from_proj" "text", "to_srid" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "from_proj" "text", "to_srid" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "from_proj" "text", "to_proj" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "from_proj" "text", "to_proj" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "from_proj" "text", "to_proj" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_transform"("geom" "public"."geometry", "from_proj" "text", "to_proj" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_translate"("public"."geometry", double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_translate"("public"."geometry", double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_translate"("public"."geometry", double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_translate"("public"."geometry", double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_translate"("public"."geometry", double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_translate"("public"."geometry", double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_translate"("public"."geometry", double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_translate"("public"."geometry", double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_transscale"("public"."geometry", double precision, double precision, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_transscale"("public"."geometry", double precision, double precision, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_transscale"("public"."geometry", double precision, double precision, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_transscale"("public"."geometry", double precision, double precision, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_triangulatepolygon"("g1" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_triangulatepolygon"("g1" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_triangulatepolygon"("g1" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_triangulatepolygon"("g1" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_unaryunion"("public"."geometry", "gridsize" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_unaryunion"("public"."geometry", "gridsize" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_unaryunion"("public"."geometry", "gridsize" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_unaryunion"("public"."geometry", "gridsize" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_union"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_union"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_union"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_union"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_union"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_union"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_union"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_union"("geom1" "public"."geometry", "geom2" "public"."geometry", "gridsize" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_voronoilines"("g1" "public"."geometry", "tolerance" double precision, "extend_to" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_voronoilines"("g1" "public"."geometry", "tolerance" double precision, "extend_to" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_voronoilines"("g1" "public"."geometry", "tolerance" double precision, "extend_to" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_voronoilines"("g1" "public"."geometry", "tolerance" double precision, "extend_to" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_voronoipolygons"("g1" "public"."geometry", "tolerance" double precision, "extend_to" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_voronoipolygons"("g1" "public"."geometry", "tolerance" double precision, "extend_to" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_voronoipolygons"("g1" "public"."geometry", "tolerance" double precision, "extend_to" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_voronoipolygons"("g1" "public"."geometry", "tolerance" double precision, "extend_to" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_within"("geom1" "public"."geometry", "geom2" "public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_wkbtosql"("wkb" "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_wkbtosql"("wkb" "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."st_wkbtosql"("wkb" "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_wkbtosql"("wkb" "bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_wkttosql"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_wkttosql"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_wkttosql"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_wkttosql"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_wrapx"("geom" "public"."geometry", "wrap" double precision, "move" double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_wrapx"("geom" "public"."geometry", "wrap" double precision, "move" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_wrapx"("geom" "public"."geometry", "wrap" double precision, "move" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_wrapx"("geom" "public"."geometry", "wrap" double precision, "move" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_x"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_x"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_x"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_x"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_xmax"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_xmax"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."st_xmax"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_xmax"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_xmin"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_xmin"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."st_xmin"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_xmin"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_y"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_y"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_y"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_y"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_ymax"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_ymax"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."st_ymax"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_ymax"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_ymin"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_ymin"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."st_ymin"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_ymin"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_z"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_z"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_z"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_z"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_zmax"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_zmax"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."st_zmax"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_zmax"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_zmflag"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_zmflag"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_zmflag"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_zmflag"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_zmin"("public"."box3d") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_zmin"("public"."box3d") TO "anon";
GRANT ALL ON FUNCTION "public"."st_zmin"("public"."box3d") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_zmin"("public"."box3d") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_avatar_url_from_key"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_avatar_url_from_key"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_avatar_url_from_key"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_body_to_comment_text"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_body_to_comment_text"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_body_to_comment_text"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_comment_text_to_body"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_comment_text_to_body"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_comment_text_to_body"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_image_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_image_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_image_columns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_verification_status_to_legacy"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_verification_status_to_legacy"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_verification_status_to_legacy"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_thread_lock"("p_thread_id" bigint, "p_lock" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_thread_lock"("p_thread_id" bigint, "p_lock" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_thread_lock"("p_thread_id" bigint, "p_lock" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_thread_pin"("p_thread_id" bigint, "p_pin" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_thread_pin"("p_thread_id" bigint, "p_pin" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_thread_pin"("p_thread_id" bigint, "p_pin" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."unlockrows"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unlockrows"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."unlockrows"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unlockrows"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_forum_category"("p_id" bigint, "p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_forum_category"("p_id" bigint, "p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_forum_category"("p_id" bigint, "p_name" "text", "p_slug" "text", "p_description" "text", "p_sort_order" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tent_reserved_count"("p_event_id" integer, "p_tent_type_id" integer, "p_quantity_change" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_tent_reserved_count"("p_event_id" integer, "p_tent_type_id" integer, "p_quantity_change" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tent_reserved_count"("p_event_id" integer, "p_tent_type_id" integer, "p_quantity_change" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."updategeometrysrid"(character varying, character varying, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."updategeometrysrid"(character varying, character varying, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."updategeometrysrid"(character varying, character varying, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."updategeometrysrid"(character varying, character varying, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."updategeometrysrid"(character varying, character varying, character varying, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."updategeometrysrid"(character varying, character varying, character varying, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."updategeometrysrid"(character varying, character varying, character varying, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."updategeometrysrid"(character varying, character varying, character varying, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."updategeometrysrid"("catalogn_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid_in" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."updategeometrysrid"("catalogn_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid_in" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."updategeometrysrid"("catalogn_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid_in" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."updategeometrysrid"("catalogn_name" character varying, "schema_name" character varying, "table_name" character varying, "column_name" character varying, "new_srid_in" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_approved_id_proofs"("user_id_param" "uuid", "trek_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_approved_id_proofs"("user_id_param" "uuid", "trek_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_approved_id_proofs"("user_id_param" "uuid", "trek_id_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_cost_type"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_cost_type"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_cost_type"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_expense_shares"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_expense_shares"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_expense_shares"() TO "service_role";












GRANT ALL ON FUNCTION "public"."st_3dextent"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_3dextent"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_3dextent"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_3dextent"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement", boolean, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement", boolean, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement", boolean, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asflatgeobuf"("anyelement", boolean, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgeobuf"("anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgeobuf"("anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgeobuf"("anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgeobuf"("anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asgeobuf"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asgeobuf"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asgeobuf"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asgeobuf"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer, "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer, "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer, "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_asmvt"("anyelement", "text", integer, "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_clusterintersecting"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_clusterintersecting"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_clusterintersecting"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_clusterintersecting"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_clusterwithin"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_clusterwithin"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_clusterwithin"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_clusterwithin"("public"."geometry", double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."st_collect"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_collect"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_collect"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_collect"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_extent"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_extent"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_extent"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_extent"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_makeline"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_makeline"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_makeline"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_makeline"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_memcollect"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_memcollect"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_memcollect"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_memcollect"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_memunion"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_memunion"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_memunion"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_memunion"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_polygonize"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_polygonize"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_polygonize"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_polygonize"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry") TO "postgres";
GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry") TO "anon";
GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry") TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry") TO "service_role";



GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry", double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry", double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry", double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."st_union"("public"."geometry", double precision) TO "service_role";









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



GRANT ALL ON TABLE "public"."nudge_analytics" TO "anon";
GRANT ALL ON TABLE "public"."nudge_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."nudge_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."nudges" TO "anon";
GRANT ALL ON TABLE "public"."nudges" TO "authenticated";
GRANT ALL ON TABLE "public"."nudges" TO "service_role";



GRANT ALL ON TABLE "public"."post_reactions" TO "anon";
GRANT ALL ON TABLE "public"."post_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."post_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."profile_completion" TO "anon";
GRANT ALL ON TABLE "public"."profile_completion" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_completion" TO "service_role";



GRANT ALL ON TABLE "public"."profile_milestones" TO "anon";
GRANT ALL ON TABLE "public"."profile_milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_milestones" TO "service_role";



GRANT ALL ON TABLE "public"."registration_id_proofs" TO "anon";
GRANT ALL ON TABLE "public"."registration_id_proofs" TO "authenticated";
GRANT ALL ON TABLE "public"."registration_id_proofs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."registration_id_proofs_proof_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."registration_id_proofs_proof_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."registration_id_proofs_proof_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_registrations" TO "anon";
GRANT ALL ON TABLE "public"."trek_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_registrations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."registrations_registration_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."registrations_registration_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."registrations_registration_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions_billing" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions_billing" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions_billing" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subscriptions_billing_subscription_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subscriptions_billing_subscription_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subscriptions_billing_subscription_id_seq" TO "service_role";



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



GRANT ALL ON TABLE "public"."trek_archive" TO "anon";
GRANT ALL ON TABLE "public"."trek_archive" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_archive" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_archive_archive_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_archive_archive_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_archive_archive_id_seq" TO "service_role";



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



GRANT ALL ON SEQUENCE "public"."trek_driver_assignments_assignment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_driver_assignments_assignment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_driver_assignments_assignment_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_drivers" TO "anon";
GRANT ALL ON TABLE "public"."trek_drivers" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_drivers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_drivers_driver_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_drivers_driver_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_drivers_driver_id_seq" TO "service_role";



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



GRANT ALL ON SEQUENCE "public"."trek_pickup_locations_location_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_pickup_locations_location_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_pickup_locations_location_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_ratings" TO "anon";
GRANT ALL ON TABLE "public"."trek_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_ratings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_ratings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_ratings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_ratings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trek_transport_assignments" TO "anon";
GRANT ALL ON TABLE "public"."trek_transport_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."trek_transport_assignments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trek_transport_assignments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trek_transport_assignments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trek_transport_assignments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_actions" TO "anon";
GRANT ALL ON TABLE "public"."user_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_actions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_actions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_actions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_actions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_connections" TO "anon";
GRANT ALL ON TABLE "public"."user_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."user_connections" TO "service_role";



GRANT ALL ON TABLE "public"."user_posts" TO "anon";
GRANT ALL ON TABLE "public"."user_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."user_posts" TO "service_role";



GRANT ALL ON TABLE "public"."user_trek_images" TO "anon";
GRANT ALL ON TABLE "public"."user_trek_images" TO "authenticated";
GRANT ALL ON TABLE "public"."user_trek_images" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_trek_images_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_trek_images_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_trek_images_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."votes_vote_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."votes_vote_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."votes_vote_id_seq" TO "service_role";









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
