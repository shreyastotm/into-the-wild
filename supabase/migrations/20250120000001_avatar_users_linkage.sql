-- Avatar Users Linkage
-- Migration: 20250120000001_avatar_users_linkage.sql

BEGIN;

-- ==============================
--       USERS TABLE CHANGES
-- ==============================

-- Add avatar_key column to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_key TEXT;

-- Drop existing constraint if it exists (for re-runs)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_avatar_key_fk;

-- Add the foreign key constraint
ALTER TABLE public.users
  ADD CONSTRAINT users_avatar_key_fk
    FOREIGN KEY (avatar_key) REFERENCES public.avatar_catalog(key);

-- Keep existing avatar_url for compatibility, auto-sync via trigger
CREATE OR REPLACE FUNCTION public.sync_avatar_url_from_key()
RETURNS TRIGGER AS $$
DECLARE
  new_avatar_url TEXT;
BEGIN
  IF NEW.avatar_key IS NULL THEN
    NEW.avatar_url := NULL;
  ELSE
    -- Only update if avatar_catalog table exists and has the avatar
    BEGIN
      SELECT ac.image_url INTO new_avatar_url
      FROM public.avatar_catalog ac
      WHERE ac.key = NEW.avatar_key AND ac.active = TRUE AND ac.category IN ('animal', 'bird', 'insect');

      -- Only update if we found a matching avatar
      IF FOUND THEN
        NEW.avatar_url := new_avatar_url;
      END IF;
    EXCEPTION
      WHEN undefined_table THEN
        -- avatar_catalog doesn't exist yet, keep existing value
        NULL;
      WHEN OTHERS THEN
        -- Other error, keep existing value for safety
        NULL;
    END;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_users_sync_avatar ON public.users;

-- Create trigger to sync avatar_url when avatar_key changes
CREATE TRIGGER trg_users_sync_avatar
BEFORE INSERT OR UPDATE OF avatar_key ON public.users
FOR EACH ROW EXECUTE FUNCTION public.sync_avatar_url_from_key();

COMMIT;
