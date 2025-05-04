-- Fix the comments table - creating it correctly
CREATE TABLE IF NOT EXISTS public.trek_comments (
    comment_id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL, -- Renamed from comment_text used in frontend previously? Ensure consistency.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE public.trek_comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Anyone can view trek comments"
ON public.trek_comments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create comments on treks they are registered for or admin"
ON public.trek_comments
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = public.trek_comments.trek_id
        AND trek_registrations.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND user_type = 'admin'
    )
);

CREATE POLICY "Users can update their own comments"
ON public.trek_comments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments or admins can delete any"
ON public.trek_comments
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
); 