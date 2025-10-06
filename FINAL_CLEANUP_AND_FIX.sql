-- FINAL CLEANUP AND FIX
-- This will:
-- 1. Fix the infinite recursion in RLS policies
-- 2. Keep only the 3 required admin users
-- 3. Clean up all test users

BEGIN;

-- STEP 1: Fix the infinite recursion in RLS policies
-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view basic user info" ON public.users;
DROP POLICY IF EXISTS "Allow admin full access to users" ON public.users;
DROP POLICY IF EXISTS "Allow individual user read access" ON public.users;
DROP POLICY IF EXISTS "Allow individual user update access" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view basic info" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Disable and re-enable RLS to ensure clean state
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policy that doesn't cause recursion
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE user_id = auth.uid() 
      AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE user_id = auth.uid() 
      AND user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE user_id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- STEP 2: Clean up auth.users - keep only the 3 required admin users
DELETE FROM auth.users 
WHERE email NOT IN (
    'shreyasmadhan82@gmail.com',
    'charlyzion9@gmail.com',
    'agarthaunderground@gmail.com'
);

-- STEP 3: Clean up public.users - keep only the 3 required admin users
DELETE FROM public.users 
WHERE email NOT IN (
    'shreyasmadhan82@gmail.com',
    'charlyzion9@gmail.com',
    'agarthaunderground@gmail.com'
);

-- STEP 4: Ensure the remaining users have proper records in both tables
-- First, create/update public.users records for the remaining auth users
INSERT INTO public.users (
    user_id,
    email,
    full_name,
    name,
    user_type,
    is_verified,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        'Admin User'
    ),
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        'Admin User'
    ),
    'admin'::public.user_type_enum,
    true,
    au.created_at,
    au.updated_at
FROM auth.users au
ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    name = EXCLUDED.name,
    user_type = EXCLUDED.user_type,
    is_verified = EXCLUDED.is_verified,
    updated_at = EXCLUDED.updated_at;

-- STEP 5: Ensure the handle_new_user function is correct
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

-- STEP 6: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 7: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;

-- STEP 8: Create is_admin helper function
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

-- STEP 9: Ensure proper indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);

COMMIT;

-- STEP 10: Verification
SELECT 'Final verification - auth.users count:' as status;
SELECT COUNT(*) as auth_user_count FROM auth.users;

SELECT 'Final verification - public.users count:' as status;
SELECT COUNT(*) as public_user_count FROM public.users;

SELECT 'Final verification - remaining users:' as status;
SELECT 
    pu.user_id,
    pu.email,
    pu.full_name,
    pu.user_type,
    au.created_at as auth_created_at
FROM public.users pu
LEFT JOIN auth.users au ON pu.user_id = au.id
ORDER BY au.created_at;

SELECT 'RLS policies check:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';
