-- Fix authentication issues with proper conflict handling
-- This addresses existing policy conflicts

BEGIN;

-- 1. Fix users table RLS policies to allow proper authentication flow
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.users;
DROP POLICY IF EXISTS "Allow individual user read access" ON public.users;
DROP POLICY IF EXISTS "Allow individual user update access" ON public.users;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view basic user info" ON public.users;
DROP POLICY IF EXISTS "Allow admin full access to users" ON public.users;
DROP POLICY IF EXISTS "Allow new users to be created" ON public.users;
DROP POLICY IF EXISTS "Users can read profiles" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;
DROP POLICY IF EXISTS "Admin full access to users" ON public.users;

-- Create simple, working policies
CREATE POLICY "Users can read profiles" ON public.users
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow user signup" ON public.users
    FOR INSERT 
    WITH CHECK (true);

-- 2. Ensure handle_new_user function works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, full_name, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'trekker',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE 
  SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail authentication even if user table update fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT; 