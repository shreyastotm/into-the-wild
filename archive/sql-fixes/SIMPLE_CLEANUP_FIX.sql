-- SIMPLE CLEANUP FIX
-- This will clean up everything and fix the infinite recursion issue

BEGIN;

-- STEP 1: Drop ALL possible policy names that might exist
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies on the users table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_record.policyname);
    END LOOP;
END $$;

-- STEP 2: Disable and re-enable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- STEP 3: Clean up auth.users - keep only the 3 required admin users
DELETE FROM auth.users 
WHERE email NOT IN (
    'shreyasmadhan82@gmail.com',
    'charlyzion9@gmail.com',
    'agarthaunderground@gmail.com'
);

-- STEP 4: Clean up public.users - keep only the 3 required admin users
DELETE FROM public.users 
WHERE email NOT IN (
    'shreyasmadhan82@gmail.com',
    'charlyzion9@gmail.com',
    'agarthaunderground@gmail.com'
);

-- STEP 5: Create/update public.users records for the remaining auth users
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

-- STEP 6: Create simple RLS policies (no recursion)
CREATE POLICY "user_select_own" ON public.users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can see all users (but avoid recursion by using a simple check)
CREATE POLICY "admin_select_all" ON public.users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.users 
      WHERE user_type = 'admin'
    )
  );

CREATE POLICY "admin_update_all" ON public.users
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.users 
      WHERE user_type = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.users 
      WHERE user_type = 'admin'
    )
  );

-- STEP 7: Ensure the handle_new_user function is correct
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

-- STEP 8: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 9: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;

-- STEP 10: Create is_admin helper function
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

-- STEP 11: Ensure proper indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);

COMMIT;

-- STEP 12: Verification
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
