-- Fix foreign key relationship for trek_registrations table
-- This ensures proper relationship between trek_registrations and public.users table

BEGIN;

-- Drop existing foreign key constraint if it exists
ALTER TABLE public.trek_registrations
DROP CONSTRAINT IF EXISTS trek_registrations_user_id_fkey;

-- Add correct foreign key constraint referencing public.users(user_id)
ALTER TABLE public.trek_registrations
ADD CONSTRAINT trek_registrations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- Also fix other tables that have the same issue for consistency
ALTER TABLE public.trek_comments
DROP CONSTRAINT IF EXISTS trek_comments_user_id_fkey;

ALTER TABLE public.trek_comments
ADD CONSTRAINT trek_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.trek_drivers
DROP CONSTRAINT IF EXISTS trek_drivers_user_id_fkey;

ALTER TABLE public.trek_drivers
ADD CONSTRAINT trek_drivers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.expense_shares
DROP CONSTRAINT IF EXISTS expense_shares_user_id_fkey;

ALTER TABLE public.expense_shares
ADD CONSTRAINT expense_shares_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.trek_ratings
DROP CONSTRAINT IF EXISTS trek_ratings_user_id_fkey;

ALTER TABLE public.trek_ratings
ADD CONSTRAINT trek_ratings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.trek_participant_ratings
DROP CONSTRAINT IF EXISTS trek_participant_ratings_rated_user_id_fkey;

ALTER TABLE public.trek_participant_ratings
ADD CONSTRAINT trek_participant_ratings_rated_user_id_fkey
FOREIGN KEY (rated_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE public.trek_participant_ratings
DROP CONSTRAINT IF EXISTS trek_participant_ratings_rated_by_user_id_fkey;

ALTER TABLE public.trek_participant_ratings
ADD CONSTRAINT trek_participant_ratings_rated_by_user_id_fkey
FOREIGN KEY (rated_by_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

COMMIT;
