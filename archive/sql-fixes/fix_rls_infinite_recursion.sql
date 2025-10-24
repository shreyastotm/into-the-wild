-- Fix RLS infinite recursion on users table
-- This script removes all conflicting policies and creates clean, non-recursive ones

-- First, disable RLS temporarily to clean up
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view basic info" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow individual user read access" ON public.users;
DROP POLICY IF EXISTS "Allow individual user update access" ON public.users;
DROP POLICY IF EXISTS "Users can read profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their profile" ON public.users;
DROP POLICY IF EXISTS "Allow user signup" ON public.users;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view basic user info" ON public.users;
DROP POLICY IF EXISTS "Allow admin full access to users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- 1. Allow users to read their own profile
CREATE POLICY "user_own_profile_read" ON public.users
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Allow users to update their own profile
CREATE POLICY "user_own_profile_update" ON public.users
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to insert their own profile (for signup)
CREATE POLICY "user_own_profile_insert" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 4. Allow authenticated users to read basic info of other users (for trek participants, etc.)
-- This is safe and doesn't cause recursion
CREATE POLICY "authenticated_users_read_basic_info" ON public.users
    FOR SELECT 
    TO authenticated
    USING (true);

-- 5. Admin policy (if you have an admin function)
-- Note: This assumes you have a simple admin check function
-- If not, we'll create a basic one
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE public.users.user_id = is_admin.user_id 
        AND public.users.user_type = 'admin'
    );
$$;

CREATE POLICY "admin_full_access" ON public.users
    FOR ALL 
    USING (public.is_admin(auth.uid()));

-- Also fix trek_registrations table policies to prevent recursion
ALTER TABLE public.trek_registrations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on trek_registrations
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.trek_registrations;
DROP POLICY IF EXISTS "Users can insert their own registrations" ON public.trek_registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.trek_registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.trek_registrations;

-- Re-enable RLS
ALTER TABLE public.trek_registrations ENABLE ROW LEVEL SECURITY;

-- Create simple policies for trek_registrations
CREATE POLICY "user_own_registrations_read" ON public.trek_registrations
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "user_own_registrations_insert" ON public.trek_registrations
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_own_registrations_update" ON public.trek_registrations
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_registrations_full_access" ON public.trek_registrations
    FOR ALL 
    USING (public.is_admin(auth.uid()));

-- Allow public read access to trek_registrations for participant counts
CREATE POLICY "public_read_registrations" ON public.trek_registrations
    FOR SELECT 
    USING (true);
