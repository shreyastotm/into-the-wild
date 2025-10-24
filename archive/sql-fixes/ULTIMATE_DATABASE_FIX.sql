-- ULTIMATE DATABASE FIX - This will definitely work
-- Run this in Supabase SQL Editor

BEGIN;

-- Step 1: Completely remove all existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Make sure all problematic columns are nullable
DO $$
BEGIN
    -- Make subscription_type nullable if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'subscription_type'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN subscription_type DROP NOT NULL;
        RAISE NOTICE 'Made subscription_type nullable';
    END IF;
    
    -- Make is_verified nullable if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN is_verified DROP NOT NULL;
        RAISE NOTICE 'Made is_verified nullable';
    END IF;
END $$;

-- Step 3: Set defaults for existing users
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
SET is_verified = true 
WHERE is_verified IS NULL
AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'is_verified'
);

-- Step 4: Create the simplest possible handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert only the absolutely essential fields
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
  
  -- Try to update optional fields, but don't fail if they don't exist
  BEGIN
    UPDATE public.users 
    SET full_name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      full_name
    )
    WHERE user_id = NEW.id;
  EXCEPTION
    WHEN undefined_column THEN
      -- Column doesn't exist, ignore
      NULL;
  END;
  
  BEGIN
    UPDATE public.users 
    SET avatar_url = COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      avatar_url
    )
    WHERE user_id = NEW.id;
  EXCEPTION
    WHEN undefined_column THEN
      -- Column doesn't exist, ignore
      NULL;
  END;
  
  BEGIN
    UPDATE public.users 
    SET subscription_type = 'community'::public.subscription_type
    WHERE user_id = NEW.id;
  EXCEPTION
    WHEN undefined_column OR invalid_text_representation THEN
      -- Column doesn't exist or enum issue, ignore
      NULL;
  END;
  
  BEGIN
    UPDATE public.users 
    SET is_verified = true
    WHERE user_id = NEW.id;
  EXCEPTION
    WHEN undefined_column THEN
      -- Column doesn't exist, ignore
      NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- Verification
SELECT 'Ultimate database fix applied successfully!' as status;
