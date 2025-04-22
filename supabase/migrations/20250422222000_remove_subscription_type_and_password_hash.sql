-- Migration: Remove subscription_type and password_hash from users table; set password_hash to 'handled_by_auth_system' for clarity
ALTER TABLE public.users DROP COLUMN IF EXISTS subscription_type;
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- Drop the enum type if not used elsewhere
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_type') THEN
    DROP TYPE public.subscription_type;
  END IF;
END $$;
