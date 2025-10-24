-- Safe RLS fix - only for tables you own
-- Run this in Supabase SQL Editor

-- Only enable RLS on tables that exist and you own
DO $$
BEGIN
    -- Enable RLS on community_posts if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_posts') THEN
        ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
        
        -- Create basic RLS policies for community_posts
        DROP POLICY IF EXISTS "Allow read access to community_posts" ON public.community_posts;
        CREATE POLICY "Allow read access to community_posts" 
        ON public.community_posts FOR SELECT 
        TO authenticated 
        USING (true);

        DROP POLICY IF EXISTS "Allow insert to community_posts" ON public.community_posts;
        CREATE POLICY "Allow insert to community_posts" 
        ON public.community_posts FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        DROP POLICY IF EXISTS "Allow update to own community_posts" ON public.community_posts;
        CREATE POLICY "Allow update to own community_posts" 
        ON public.community_posts FOR UPDATE 
        TO authenticated 
        USING (true);
        
        RAISE NOTICE 'RLS enabled on community_posts';
    END IF;

    -- Enable RLS on subscriptions_billing if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions_billing') THEN
        ALTER TABLE public.subscriptions_billing ENABLE ROW LEVEL SECURITY;
        
        -- Create basic RLS policies for subscriptions_billing
        DROP POLICY IF EXISTS "Allow read own subscriptions_billing" ON public.subscriptions_billing;
        CREATE POLICY "Allow read own subscriptions_billing" 
        ON public.subscriptions_billing FOR SELECT 
        TO authenticated 
        USING (auth.uid()::text = user_id);
        
        RAISE NOTICE 'RLS enabled on subscriptions_billing';
    END IF;

    -- Enable RLS on votes if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'votes') THEN
        ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
        
        -- Create basic RLS policies for votes
        DROP POLICY IF EXISTS "Allow read access to votes" ON public.votes;
        CREATE POLICY "Allow read access to votes" 
        ON public.votes FOR SELECT 
        TO authenticated 
        USING (true);

        DROP POLICY IF EXISTS "Allow insert to votes" ON public.votes;
        CREATE POLICY "Allow insert to votes" 
        ON public.votes FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        DROP POLICY IF EXISTS "Allow update to own votes" ON public.votes;
        CREATE POLICY "Allow update to own votes" 
        ON public.votes FOR UPDATE 
        TO authenticated 
        USING (true);
        
        RAISE NOTICE 'RLS enabled on votes';
    END IF;

    -- Skip spatial_ref_sys as it's a system table
    RAISE NOTICE 'Skipped spatial_ref_sys (system table)';
END $$;

SELECT 'Safe RLS fix completed!' as status;
