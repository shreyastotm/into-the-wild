-- Fix users table schema - Add missing is_verified column
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Add missing is_verified column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Update existing users to have is_verified = true (since they're already in the system)
UPDATE public.users 
SET is_verified = true 
WHERE is_verified IS NULL OR is_verified = false;

-- 3. Fix the handle_new_user function to work with the correct schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, full_name, avatar_url, is_verified, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    true, -- Set is_verified to true for new users
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE 
  SET
    user_id = NEW.id,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    updated_at = NOW(),
    is_verified = true
  WHERE
    public.users.user_type IS DISTINCT FROM 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant necessary permissions
GRANT ALL ON TABLE public.users TO postgres;
GRANT ALL ON TABLE public.users TO service_role;

-- 6. Verify the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_verified' 
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'is_verified column still does not exist after adding it';
    ELSE
        RAISE NOTICE 'is_verified column successfully added to users table';
    END IF;
END $$;

COMMIT;

-- Final verification
SELECT 
    'Users table schema fixed successfully' AS status,
    NOW() AS completed_at;
