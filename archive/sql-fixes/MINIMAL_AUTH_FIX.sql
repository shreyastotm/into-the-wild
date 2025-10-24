-- MINIMAL AUTH FIX - Ultra simple version
-- Run this in Supabase SQL Editor

BEGIN;

-- Step 1: Drop the old trigger and function completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create the simplest possible handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Just insert the basic user info, nothing fancy
  INSERT INTO public.users (
    user_id,
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE 
  SET
    user_id = NEW.id,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- Test the function
SELECT 'Minimal auth fix applied successfully!' as status;
