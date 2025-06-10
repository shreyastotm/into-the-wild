DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status_enum') THEN
        CREATE TYPE public.notification_status_enum AS ENUM (
            'unread',
            'read'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
        CREATE TYPE public.notification_type_enum AS ENUM (
            'registration_confirmed',
            'payment_verified',
            'trek_cancelled',
            'trek_status_changed',
            'general_info'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link TEXT,
    status notification_status_enum NOT NULL DEFAULT 'unread',
    type notification_type_enum NOT NULL DEFAULT 'general_info',
    trek_id INTEGER REFERENCES public.trek_events(trek_id) ON DELETE SET NULL,
    related_entity_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: Add an index on user_id and status for faster querying of unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON public.notifications (user_id, status);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow users to select their own notifications" ON public.notifications;
CREATE POLICY "Allow users to select their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update status of their own notifications" ON public.notifications;
CREATE POLICY "Allow users to update status of their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow backend to insert notifications" ON public.notifications;
CREATE POLICY "Allow backend to insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true); 