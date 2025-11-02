-- Fix infinite recursion in users table RLS policies
-- This migration removes all recursive admin checks from the users table

-- Disable RLS temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies that might cause recursion
DROP POLICY IF EXISTS "user_own_profile_read" ON public.users;
DROP POLICY IF EXISTS "user_own_profile_update" ON public.users;
DROP POLICY IF EXISTS "user_own_profile_insert" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_read_basic_info" ON public.users;
DROP POLICY IF EXISTS "admin_full_access" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view basic info" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "users_read_simple" ON public.users;
DROP POLICY IF EXISTS "users_update_simple" ON public.users;
DROP POLICY IF EXISTS "users_delete_simple" ON public.users;
DROP POLICY IF EXISTS "user_select_own" ON public.users;
DROP POLICY IF EXISTS "user_update_own" ON public.users;
DROP POLICY IF EXISTS "user_insert_own" ON public.users;
DROP POLICY IF EXISTS "authenticated_read_all" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create SIMPLE, NON-RECURSIVE policies
-- 1. Users can read their own profile
CREATE POLICY "user_select_own" ON public.users
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Users can update their own profile
CREATE POLICY "user_update_own" ON public.users
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Users can insert their own profile (signup)
CREATE POLICY "user_insert_own" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 4. Authenticated users can read ALL user profiles
-- This is necessary for trek participants, community features, etc.
CREATE POLICY "authenticated_read_all" ON public.users
    FOR SELECT 
    TO authenticated
    USING (true);

-- Note: Admin operations are handled at the application level
-- to avoid circular dependencies in RLS policies
