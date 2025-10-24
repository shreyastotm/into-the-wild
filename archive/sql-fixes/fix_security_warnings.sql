-- Fix Security Advisor Warnings
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Enable RLS on tables that need it (if they exist)
-- These are system tables that may not need RLS, but let's be safe

-- Enable RLS on spatial_ref_sys if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spatial_ref_sys' AND table_schema = 'public') THEN
        ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
        -- Create a policy that allows read access to all (this is a reference table)
        DROP POLICY IF EXISTS "Allow read access to spatial_ref_sys" ON public.spatial_ref_sys;
        CREATE POLICY "Allow read access to spatial_ref_sys" ON public.spatial_ref_sys FOR SELECT USING (true);
    END IF;
END $$;

-- Enable RLS on community_posts if it exists (though it should have been dropped)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_posts' AND table_schema = 'public') THEN
        ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow read access to community_posts" ON public.community_posts;
        CREATE POLICY "Allow read access to community_posts" ON public.community_posts FOR SELECT USING (true);
    END IF;
END $$;

-- Enable RLS on subscriptions_billing if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions_billing' AND table_schema = 'public') THEN
        ALTER TABLE public.subscriptions_billing ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow read access to subscriptions_billing" ON public.subscriptions_billing;
        CREATE POLICY "Allow read access to subscriptions_billing" ON public.subscriptions_billing FOR SELECT USING (true);
    END IF;
END $$;

-- Enable RLS on votes if it exists (though it should have been dropped)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'votes' AND table_schema = 'public') THEN
        ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow read access to votes" ON public.votes;
        CREATE POLICY "Allow read access to votes" ON public.votes FOR SELECT USING (true);
    END IF;
END $$;

-- 2. Fix Function Search Path issues by setting search_path explicitly
-- This is a minor security warning about mutable search paths

-- Update functions to have explicit search_path
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname, oid 
        FROM pg_proc 
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname IN ('is_admin', 'get_tent_reserved_count', 'get_trek_participant_count', 'create_notification', 'mark_notification_as_read', 'get_user_notifications')
    LOOP
        EXECUTE format('ALTER FUNCTION public.%I SET search_path = public', func_record.proname);
    END LOOP;
END $$;

COMMIT;

-- Final status
SELECT 
    'Security warnings addressed' AS status,
    NOW() AS completed_at;
