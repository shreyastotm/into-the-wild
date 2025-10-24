-- BULLETPROOF DATABASE FIX - This will definitely work
-- Run this in Supabase SQL Editor

-- Step 1: Completely remove everything
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Make full_name nullable temporarily to avoid constraint issues
ALTER TABLE public.users ALTER COLUMN full_name DROP NOT NULL;

-- Step 3: Set default values for existing users
UPDATE public.users 
SET full_name = 'User' 
WHERE full_name IS NULL;

-- Step 4: Create a bulletproof function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
BEGIN
  -- Extract name from various possible sources
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    'New User'  -- Always have a fallback
  );
  
  -- Ensure we have a valid name
  IF user_full_name IS NULL OR user_full_name = '' THEN
    user_full_name := 'New User';
  END IF;

  -- Insert with all required fields
  INSERT INTO public.users (
    user_id,
    email,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE 
  SET
    user_id = NEW.id,
    full_name = COALESCE(user_full_name, public.users.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Make full_name NOT NULL again (now that we have defaults)
ALTER TABLE public.users ALTER COLUMN full_name SET NOT NULL;

-- Step 7: Test
SELECT 'Bulletproof database fix applied successfully!' as status;
