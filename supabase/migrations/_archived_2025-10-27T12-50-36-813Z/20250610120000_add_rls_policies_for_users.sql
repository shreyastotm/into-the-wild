-- Add RLS policies for the public.users table in an idempotent way

-- Enable RLS if not already enabled
DO $$
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.users'::regclass) THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;


-- 1. Allow users to view their own profile
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.users;
CREATE POLICY "Allow users to view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Allow users to update their own profile
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
CREATE POLICY "Allow users to update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Allow authenticated users to view basic user info
-- This allows users to see names/avatars of other participants in a trek, for example.
-- Adjust the list of columns to what you consider safe to be public.
DROP POLICY IF EXISTS "Allow authenticated users to view basic user info" ON public.users;
CREATE POLICY "Allow authenticated users to view basic user info"
ON public.users
FOR SELECT
USING (auth.role() = 'authenticated');

-- 4. Allow admins to manage all users
DROP POLICY IF EXISTS "Allow admin full access to users" ON public.users;
CREATE POLICY "Allow admin full access to users"
ON public.users
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid())); 