-- Migration: Add avatar_url column to users table for profile pictures
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Optionally add a comment for clarity
COMMENT ON COLUMN public.users.avatar_url IS 'URL to the user''s profile picture or avatar.';
