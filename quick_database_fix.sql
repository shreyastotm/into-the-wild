-- Quick database fix for authentication issues
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Check current subscription_type enum values
SELECT unnest(enum_range(NULL::public.subscription_type)) as valid_subscription_types;

-- 2. Check if subscription_type column exists and its constraints
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public' 
AND column_name = 'subscription_type';

-- 3. Make subscription_type nullable if it isn't already
ALTER TABLE public.users 
ALTER COLUMN subscription_type DROP NOT NULL;

-- 4. Set default values for existing users
UPDATE public.users 
SET subscription_type = 'community' 
WHERE subscription_type IS NULL;

-- 5. Update the handle_new_user function with proper enum casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    user_id, 
    email, 
    full_name, 
    avatar_url, 
    subscription_type,
    subscription_status,
    is_verified,
    created_at, 
    updated_at
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
  WHERE
    public.users.user_type IS DISTINCT FROM 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
