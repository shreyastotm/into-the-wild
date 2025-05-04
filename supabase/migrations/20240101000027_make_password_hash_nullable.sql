-- Migration: Make password_hash nullable in public.users

-- Commented out: public.users does not have a password_hash column
/* 
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;
*/

-- Optionally, add a comment for clarity
/* -- Also commented out as column does not exist
COMMENT ON COLUMN public.users.password_hash IS 'No longer required, password hashes are managed by Supabase Auth';
*/
