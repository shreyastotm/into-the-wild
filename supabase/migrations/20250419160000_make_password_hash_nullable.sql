-- Migration: Make password_hash nullable in public.users
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;

-- Optionally, add a comment for clarity
COMMENT ON COLUMN public.users.password_hash IS 'No longer required, password hashes are managed by Supabase Auth';
