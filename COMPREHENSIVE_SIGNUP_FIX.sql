-- COMPREHENSIVE SIGNUP FIX
-- This migration fixes all signup-related issues:
-- 1. Standardizes the users table schema
-- 2. Creates a single, correct handle_new_user function
-- 3. Ensures proper RLS policies
-- 4. Handles existing users properly

BEGIN;

-- 1. First, let's standardize the users table schema
-- Ensure we have the correct columns and remove any duplicates

-- Add missing columns if they don't exist
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS user_type public.user_type_enum DEFAULT 'trekker',
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location VARCHAR(255),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS indemnity_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS has_car BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS car_seating_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS trekking_experience TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS interests TEXT,
  ADD COLUMN IF NOT EXISTS pet_details TEXT,
  ADD COLUMN IF NOT EXISTS verification_status public.user_verification_status DEFAULT 'NOT_SUBMITTED',
  ADD COLUMN IF NOT EXISTS verification_docs JSONB,
  ADD COLUMN IF NOT EXISTS transport_volunteer_opt_in BOOLEAN DEFAULT false;

-- 2. Sync name and full_name columns (use full_name as primary)
UPDATE public.users 
SET full_name = COALESCE(full_name, name)
WHERE full_name IS NULL AND name IS NOT NULL;

-- 3. Create the definitive handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type_value public.user_type_enum;
  existing_user_id UUID;
BEGIN
  -- Default to 'trekker' for new users
  user_type_value := COALESCE(
    (NEW.raw_user_meta_data->>'user_type')::public.user_type_enum,
    'trekker'
  );

  -- Check if user already exists by email
  SELECT user_id INTO existing_user_id 
  FROM public.users 
  WHERE email = NEW.email;

  -- If user exists, update their auth user_id and return
  IF FOUND THEN
    UPDATE public.users 
    SET 
      user_id = NEW.id,
      updated_at = NOW(),
      is_verified = true
    WHERE email = NEW.email;
    RETURN NEW;
  END IF;

  -- Create new user
  INSERT INTO public.users (
    user_id,
    email,
    full_name,
    name,
    avatar_url,
    user_type,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      (NEW.raw_app_meta_data->'claims'->>'full_name'),
      (NEW.raw_app_meta_data->'claims'->>'name')
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      (NEW.raw_app_meta_data->'claims'->>'full_name'),
      (NEW.raw_app_meta_data->'claims'->>'name')
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      (NEW.raw_app_meta_data->'claims'->>'avatar_url'),
      (NEW.raw_app_meta_data->'claims'->>'picture')
    ),
    user_type_value,
    true,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Fix RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view basic user info" ON public.users;
DROP POLICY IF EXISTS "Allow admin full access to users" ON public.users;
DROP POLICY IF EXISTS "Allow individual user read access" ON public.users;
DROP POLICY IF EXISTS "Allow individual user update access" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.users;

-- Create correct policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view basic info" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;

-- 7. Create is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = user_id_param AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated;

-- 8. Ensure proper indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);

COMMIT;

-- Verification queries
SELECT 'Users table schema check:' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Current users count:' as status;
SELECT COUNT(*) as user_count FROM public.users;

SELECT 'Auth users count:' as status;
SELECT COUNT(*) as auth_user_count FROM auth.users;
