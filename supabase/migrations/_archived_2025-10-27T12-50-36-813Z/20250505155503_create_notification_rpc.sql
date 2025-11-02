-- Function to get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
    p_user_id UUID,
    p_limit INT DEFAULT 10,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    user_id UUID,
    message TEXT,
    link TEXT,
    status notification_status_enum,
    type notification_type_enum,
    trek_id INT,
    related_entity_id BIGINT,
    created_at TIMESTAMPTZ,
    trek_name TEXT -- Added for convenience
)
LANGUAGE plpgsql
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

-- Function to mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(
    p_notification_id BIGINT,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.notifications
    SET status = 'read'
    WHERE id = p_notification_id AND user_id = p_user_id;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.notifications
    SET status = 'read'
    WHERE user_id = p_user_id AND status = 'unread';
END;
$$;

-- Function to create a notification
-- SECURITY DEFINER allows this function to operate with the permissions of the user who defined it (usually a superuser or admin role)
-- This is useful if you want to, for example, call this from a trigger that runs as a different user.
-- For direct calls from client, RLS policies on 'notifications' table will still apply for select/update, 
-- but insert policy needs to allow this.
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_message TEXT,
    p_type notification_type_enum,
    p_link TEXT DEFAULT NULL,
    p_trek_id INT DEFAULT NULL,
    p_related_entity_id BIGINT DEFAULT NULL
)
RETURNS public.notifications
LANGUAGE plpgsql
SECURITY DEFINER
-- Set search_path to ensure the function uses the public schema, avoiding issues if the calling user has a different search_path
SET search_path = public 
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

-- Grant execute permission to authenticated users for these functions
-- For create_notification, the RLS policy on the table handles actual insert permission.
GRANT EXECUTE ON FUNCTION get_user_notifications(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_as_read(BIGINT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, notification_type_enum, TEXT, INT, BIGINT) TO authenticated;

-- Example of how to call create_notification (intended for server-side or admin usage, or triggers)
-- SELECT create_notification(
--     'user-uuid-goes-here', 
--     'Your registration for Himalayan Adventure is confirmed!', 
--     'registration_confirmed', 
--     '/trek-events/123',
--     123,
--     456 -- e.g. registration_id
-- ); 

-- Function to mark a single notification as read for the current user
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Function to mark all unread notifications as read for the current user
CREATE OR REPLACE FUNCTION public.mark_all_my_notifications_as_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Function to get notifications for the current user with pagination
CREATE OR REPLACE FUNCTION public.get_my_notifications(
  page_size integer DEFAULT 20,
  page_num integer DEFAULT 1
)
RETURNS SETOF public.notifications -- Or TABLE(...) if you want to be more specific about returned columns
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.notifications
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT page_size
  OFFSET (page_num - 1) * page_size;
$$;

GRANT EXECUTE ON FUNCTION public.mark_notification_as_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_my_notifications_as_read() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_notifications(integer, integer) TO authenticated;

COMMENT ON FUNCTION public.mark_notification_as_read(uuid) IS 'Marks a specific notification as read for the currently authenticated user.';
COMMENT ON FUNCTION public.mark_all_my_notifications_as_read() IS 'Marks all unread notifications as read for the currently authenticated user.';
COMMENT ON FUNCTION public.get_my_notifications(integer, integer) IS 'Retrieves paginated notifications for the currently authenticated user.'; 