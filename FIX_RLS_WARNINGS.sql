-- Fix RLS security warnings
-- Run this in Supabase SQL Editor

-- Enable RLS on tables that need it
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for these tables
-- spatial_ref_sys - read-only for all authenticated users
CREATE POLICY "Allow read access to spatial_ref_sys" 
ON public.spatial_ref_sys FOR SELECT 
TO authenticated 
USING (true);

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
