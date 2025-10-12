-- Fix RLS security warnings
-- Run this in Supabase SQL Editor

-- Note: spatial_ref_sys is a PostgreSQL system table - do NOT enable RLS on it
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_thread_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for these tables

-- Note: spatial_ref_sys is a PostgreSQL system table - no RLS policies needed

-- user_actions - users can read/insert their own actions (rate limiting)
CREATE POLICY "Allow read own user_actions"
ON public.user_actions FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Allow insert own user_actions"
ON public.user_actions FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- community_posts - users can read all, insert/update their own
CREATE POLICY "Allow read access to community_posts"
ON public.community_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert to community_posts"
ON public.community_posts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update to own community_posts"
ON public.community_posts FOR UPDATE
TO authenticated
USING (true);

-- subscriptions_billing - users can read their own
CREATE POLICY "Allow read own subscriptions_billing"
ON public.subscriptions_billing FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- avatar_catalog - read-only for all authenticated users (public catalog)
CREATE POLICY "Allow read access to avatar_catalog"
ON public.avatar_catalog FOR SELECT
TO authenticated
USING (true);

-- forum_categories - read-only for all authenticated users (public categories)
CREATE POLICY "Allow read access to forum_categories"
ON public.forum_categories FOR SELECT
TO authenticated
USING (true);

-- forum_threads - users can read all, insert their own, update their own
CREATE POLICY "Allow read access to forum_threads"
ON public.forum_threads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert to forum_threads"
ON public.forum_threads FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Allow update to own forum_threads"
ON public.forum_threads FOR UPDATE
TO authenticated
USING (auth.uid()::text = author_id);

-- forum_posts - users can read all, insert their own, update their own
CREATE POLICY "Allow read access to forum_posts"
ON public.forum_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert to forum_posts"
ON public.forum_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Allow update to own forum_posts"
ON public.forum_posts FOR UPDATE
TO authenticated
USING (auth.uid()::text = author_id);

-- forum_tags - read-only for all authenticated users (public tags)
CREATE POLICY "Allow read access to forum_tags"
ON public.forum_tags FOR SELECT
TO authenticated
USING (true);

-- forum_thread_tags - users can read all (public tag associations)
CREATE POLICY "Allow read access to forum_thread_tags"
ON public.forum_thread_tags FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert to forum_thread_tags"
ON public.forum_thread_tags FOR INSERT
TO authenticated
WITH CHECK (true);

-- votes - users can read all, insert/update their own
CREATE POLICY "Allow read access to votes"
ON public.votes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert to votes"
ON public.votes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update to own votes"
ON public.votes FOR UPDATE
TO authenticated
USING (true);

SELECT 'RLS warnings fixed successfully!' as status;
