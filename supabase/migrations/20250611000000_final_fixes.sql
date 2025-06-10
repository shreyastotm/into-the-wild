-- MIGRATION: 20250611000000_final_fixes.sql
-- This migration provides the definitive fixes for user handling and related table structures.

-- 1. Create dependent ENUM types first.
--    This fixes the dependency issue that caused the reset to fail.
CREATE TYPE public.post_type_enum AS ENUM ('discussion', 'gear_review', 'trip_report');
CREATE TYPE public.visibility_enum AS ENUM ('public', 'private', 'friends_only');

-- 2. Create the 'community_posts' table.
--    This was deleted and is now restored here.
CREATE TABLE IF NOT EXISTS public.community_posts (
    post_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    post_type public.post_type_enum NOT NULL DEFAULT 'discussion',
    visibility public.visibility_enum NOT NULL DEFAULT 'public',
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Correct the 'community_posts' table policies.
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can manage their own posts" ON public.community_posts
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Create the definitive 'handle_new_user' function.
--    This version is robust and protects the 'admin' user_type from being overwritten.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_type public.user_type_enum;
BEGIN
  -- Check if a user with this email already exists and get their user_type
  SELECT user_type INTO existing_user_type FROM public.users WHERE email = NEW.email;

  -- If the user exists and is an 'admin', do nothing.
  IF FOUND AND existing_user_type = 'admin' THEN
    RETURN NEW;
  END IF;

  -- For all other users (or new users), perform the upsert.
  INSERT INTO public.users (user_id, email, name, avatar_url, is_verified)
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
      NEW.raw_user_meta_data->>'avatar_url',
      (NEW.raw_app_meta_data->'claims'->>'avatar_url'),
      (NEW.raw_app_meta_data->'claims'->>'picture')
    ),
    true
  )
  ON CONFLICT (email) DO UPDATE 
  SET
    user_id = NEW.id,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW(),
    is_verified = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure the trigger is correctly configured.
--    This drops the old trigger and creates a new one to use the corrected function.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- End of migration. 