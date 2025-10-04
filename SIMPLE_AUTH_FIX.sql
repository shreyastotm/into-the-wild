-- SIMPLE AND DIRECT AUTH FIX
-- This fixes the handle_new_user function to match your actual table structure
-- Run this in Supabase SQL Editor

BEGIN;

-- Step 1: Make subscription columns nullable to avoid constraint errors
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'subscription_type'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN subscription_type DROP NOT NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN subscription_status DROP NOT NULL;
    END IF;
END $$;

-- Step 2: Set defaults for existing NULL values
UPDATE public.users 
SET subscription_type = 'community' 
WHERE subscription_type IS NULL 
AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'subscription_type'
);

UPDATE public.users 
SET subscription_status = 'active' 
WHERE subscription_status IS NULL
AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'subscription_status'
);

-- Step 3: Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create a simple, working handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple upsert with only the columns that MUST exist
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
  
  -- Now update the optional columns in a separate UPDATE
  -- This way if any column doesn't exist, only that part fails
  UPDATE public.users 
  SET
    full_name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      full_name
    ),
    avatar_url = COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      avatar_url
    ),
    updated_at = NOW()
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- Verification
SELECT 'Auth trigger fixed successfully!' as status;
