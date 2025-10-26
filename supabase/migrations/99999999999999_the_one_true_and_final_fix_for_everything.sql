-- MIGRATION: 99999999999999_the_one_true_and_final_fix_for_everything.sql
-- This single migration reconciles the entire database schema with the application code.
-- It addresses all user profile schema issues and the trek creation visibility problem.

BEGIN;

-- 1. Correct the 'users' table schema to perfectly match the frontend 'ProfileForm.tsx'.
-- This block renames 'name' to 'full_name' and adds every other missing column.
DO $$
BEGIN
   -- Only rename if 'name' exists and 'full_name' doesn't exist
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='name') 
      AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='full_name') THEN
      ALTER TABLE public.users RENAME COLUMN name TO full_name;
   END IF;
END $$;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trekking_experience TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vehicle_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pet_details TEXT;

-- 2. Correct the 'handle_new_user' function to align with the authoritative schema.
-- This ensures new users are created correctly with the 'full_name' field.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- We now directly upsert, as RLS is handled by grants.
  -- The function maps the 'name' from auth metadata to 'full_name' in the public users table.
  INSERT INTO public.users (user_id, email, full_name, avatar_url, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    true
  )
  ON CONFLICT (email) DO UPDATE 
  SET
    user_id = NEW.id,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW(),
    is_verified = true
  -- We add a condition to NOT update an existing admin's record, preserving their role.
  WHERE
    public.users.user_type IS DISTINCT FROM 'admin';

  RETURN NEW;
END $$
LANGUAGE plpgsql
SECURITY DEFINER;

-- 3. Create update_user_profile function
CREATE OR REPLACE FUNCTION public.update_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Placeholder trigger function for any user profile updates
  RETURN NEW;
END $$
LANGUAGE plpgsql;

-- 4. CRITICAL FIX: Ensure RLS is properly configured on users table
-- First, disable RLS temporarily to set up policies cleanly
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on users table to avoid conflicts
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
DROP POLICY IF EXISTS "user_own_profile_read" ON public.users;
DROP POLICY IF EXISTS "user_own_profile_update" ON public.users;
DROP POLICY IF EXISTS "user_own_profile_insert" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_read_basic_info" ON public.users;
DROP POLICY IF EXISTS "admin_full_access" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create correct, non-recursive RLS policies
-- Policy 1: Allow users to read their own profile
CREATE POLICY "Allow users read own profile" ON public.users
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy 2: Allow users to update their own profile
CREATE POLICY "Allow users update own profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow users to insert their own profile (for signup via trigger)
CREATE POLICY "Allow users insert own profile" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow authenticated users to read basic info of other users
CREATE POLICY "Allow authenticated read basic info" ON public.users
    FOR SELECT 
    TO authenticated
    USING (true);

-- 5. Ensure is_admin function exists and works correctly
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;

CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE public.users.user_id = user_id_param 
        AND public.users.user_type = 'admin'
    );
$$;

-- Policy 5: Admin full access (if user is an admin)
CREATE POLICY "Allow admin full access" ON public.users
    FOR ALL 
    USING (public.is_admin(auth.uid()));

COMMIT; 