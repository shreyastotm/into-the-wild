-- CORRECTED AUTH FIX - Only uses columns that actually exist
-- Run this in Supabase SQL Editor

BEGIN;

-- Step 1: Make subscription_type nullable (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'subscription_type'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN subscription_type DROP NOT NULL;
        RAISE NOTICE 'Made subscription_type nullable';
    ELSE
        RAISE NOTICE 'subscription_type column does not exist, skipping';
    END IF;
END $$;

-- Step 2: Set defaults for existing NULL values (only for columns that exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'subscription_type'
    ) THEN
        UPDATE public.users 
        SET subscription_type = 'community' 
        WHERE subscription_type IS NULL;
        RAISE NOTICE 'Set default subscription_type for existing users';
    END IF;
END $$;

-- Step 3: Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create a simple, working handle_new_user function
-- This version only uses columns that definitely exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- First, do a basic insert with only the essential columns
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
  
  -- Now update optional columns in separate UPDATEs
  -- This way if any column doesn't exist, only that part fails gracefully
  
  -- Update full_name if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'full_name'
  ) THEN
    UPDATE public.users 
    SET
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        full_name
      ),
      updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;
  
  -- Update avatar_url if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'avatar_url'
  ) THEN
    UPDATE public.users 
    SET
      avatar_url = COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        avatar_url
      ),
      updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;
  
  -- Update subscription_type if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'subscription_type'
  ) THEN
    UPDATE public.users 
    SET
      subscription_type = 'community'::public.subscription_type,
      updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;
  
  -- Update is_verified if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'is_verified'
  ) THEN
    UPDATE public.users 
    SET
      is_verified = true,
      updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;

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
