-- FINAL COMPREHENSIVE AUTH FIX
-- This script will fix all authentication issues once and for all
-- Run this in Supabase SQL Editor

BEGIN;

-- Step 1: Check current users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Make all potentially problematic columns nullable
ALTER TABLE public.users 
ALTER COLUMN subscription_type DROP NOT NULL;

ALTER TABLE public.users 
ALTER COLUMN subscription_status DROP NOT NULL;

-- Step 3: Set sensible defaults for existing users
UPDATE public.users 
SET subscription_type = 'community' 
WHERE subscription_type IS NULL;

UPDATE public.users 
SET subscription_status = 'active' 
WHERE subscription_status IS NULL;

UPDATE public.users 
SET is_verified = true 
WHERE is_verified IS NULL;

-- Step 4: Drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 5: Create the DEFINITIVE handle_new_user function
-- This version checks what columns actually exist and only uses those
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_type public.user_type_enum;
  has_full_name_col boolean;
  has_name_col boolean;
  has_subscription_type_col boolean;
  has_subscription_status_col boolean;
  has_is_verified_col boolean;
BEGIN
  -- Check what columns exist in the users table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'full_name'
  ) INTO has_full_name_col;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'name'
  ) INTO has_name_col;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'subscription_type'
  ) INTO has_subscription_type_col;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'subscription_status'
  ) INTO has_subscription_status_col;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'is_verified'
  ) INTO has_is_verified_col;

  -- Check if user exists and is admin (protect admins)
  SELECT user_type INTO existing_user_type 
  FROM public.users 
  WHERE email = NEW.email;
  
  IF FOUND AND existing_user_type = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Build dynamic INSERT based on what columns exist
  IF has_full_name_col THEN
    -- Use full_name column
    IF has_subscription_type_col AND has_subscription_status_col AND has_is_verified_col THEN
      INSERT INTO public.users (
        user_id, email, full_name, avatar_url,
        subscription_type, subscription_status, is_verified,
        created_at, updated_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        'community'::public.subscription_type,
        'active'::public.subscription_renewal_status,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE 
      SET
        user_id = NEW.id,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        updated_at = NOW()
      WHERE public.users.user_type IS DISTINCT FROM 'admin';
    ELSE
      -- Minimal insert without optional columns
      INSERT INTO public.users (
        user_id, email, full_name, avatar_url, created_at, updated_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE 
      SET
        user_id = NEW.id,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        updated_at = NOW()
      WHERE public.users.user_type IS DISTINCT FROM 'admin';
    END IF;
  ELSIF has_name_col THEN
    -- Use name column
    INSERT INTO public.users (
      user_id, email, name, avatar_url, created_at, updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      NEW.raw_user_meta_data->>'avatar_url',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE 
    SET
      user_id = NEW.id,
      name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      avatar_url = NEW.raw_user_meta_data->>'avatar_url',
      updated_at = NOW()
    WHERE public.users.user_type IS DISTINCT FROM 'admin';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- Step 7: Verify the setup
SELECT 'Trigger and function created successfully' as status;
