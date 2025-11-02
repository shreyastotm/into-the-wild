-- Migration: Fix public gallery access by ensuring past treks are publicly viewable
-- Context: Public gallery should work without authentication for past treks

-- 1) Drop existing conflicting policies for trek_events
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.trek_events;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.trek_events;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.trek_events;

-- 2) Create proper policies for public gallery access
-- Allow everyone to view past treks (for public gallery)
CREATE POLICY "Allow public view of past treks" ON public.trek_events
FOR SELECT
USING (start_datetime < NOW());

-- Allow authenticated users to view all treks (including upcoming)
CREATE POLICY "Allow authenticated users to view all treks" ON public.trek_events
FOR SELECT TO authenticated
USING (true);

-- Drop existing policy if it exists (this fixes the error)
DROP POLICY IF EXISTS "Allow authenticated users to create treks" ON public.trek_events;

-- Allow authenticated users to create treks
CREATE POLICY "Allow authenticated users to create treks" ON public.trek_events
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow admins to manage all treks
CREATE POLICY "Allow admins to manage all treks" ON public.trek_events
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- Allow partners to manage their own treks
CREATE POLICY "Allow partners to manage their treks" ON public.trek_events
FOR ALL TO authenticated
USING (partner_id = auth.uid());

-- 3) Ensure trek_event_images are publicly viewable
DROP POLICY IF EXISTS "Users can view trek event images" ON public.trek_event_images;
CREATE POLICY "Everyone can view trek event images" ON public.trek_event_images
FOR SELECT USING (true);

-- 4) Ensure trek_event_videos are publicly viewable
DROP POLICY IF EXISTS "Users can view trek videos" ON public.trek_event_videos;
CREATE POLICY "Everyone can view trek videos" ON public.trek_event_videos
FOR SELECT USING (true);

-- 5) Ensure user_trek_images approved images are publicly viewable
DROP POLICY IF EXISTS "Users can view approved images and own contributions" ON public.user_trek_images;
CREATE POLICY "Everyone can view approved user images" ON public.user_trek_images
FOR SELECT USING (status = 'approved');

-- Keep existing policies for user contributions
CREATE POLICY "Users can manage own pending images" ON public.user_trek_images
FOR ALL TO authenticated
USING (uploaded_by = auth.uid() AND status = 'pending');

-- 6) Enable RLS on all tables
ALTER TABLE public.trek_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_event_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_event_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trek_images ENABLE ROW LEVEL SECURITY;

-- 7) Verification query - check that policies are correct
SELECT
    n.nspname as schemaname,
    c.relname as tablename,
    p.policyname,
    p.permissive,
    p.roles,
    p.cmd,
    p.qual
FROM pg_policies p
JOIN pg_class c ON p.tablename = c.relname
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname IN ('trek_events', 'trek_event_images', 'trek_event_videos', 'user_trek_images')
ORDER BY c.relname, p.policyname;
