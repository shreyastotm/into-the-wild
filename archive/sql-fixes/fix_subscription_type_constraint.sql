-- Fix subscription_type NOT NULL constraint error
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Make subscription_type nullable or provide default value
ALTER TABLE public.users 
ALTER COLUMN subscription_type DROP NOT NULL;

-- 2. Set default value for existing users
UPDATE public.users 
SET subscription_type = 'self_service' 
WHERE subscription_type IS NULL;

-- 3. Update the handle_new_user function to provide subscription_type
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
    'self_service',
    'active',
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
