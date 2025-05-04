-- Add pet details column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS pet_details text;

COMMENT ON COLUMN public.users.pet_details IS 'Details about the user''s pet(s) for reference.';

-- Add indemnity and pet details columns to trek_registrations table
ALTER TABLE public.trek_registrations
ADD COLUMN IF NOT EXISTS indemnity_accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS bringing_pet boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pet_details_for_trek text;

COMMENT ON COLUMN public.trek_registrations.indemnity_accepted_at IS 'Timestamp when the user accepted indemnity for this specific trek registration.';
COMMENT ON COLUMN public.trek_registrations.bringing_pet IS 'Did the user indicate they are bringing a pet for this trek?';
COMMENT ON COLUMN public.trek_registrations.pet_details_for_trek IS 'Specific details about the pet being brought for this trek (may differ from profile).';

-- Rename old global indemnity columns instead of dropping (to break dependency)
-- We will drop these _legacy columns in a later migration
ALTER TABLE public.users
RENAME COLUMN indemnity_accepted TO _legacy_indemnity_accepted;

ALTER TABLE public.users
RENAME COLUMN indemnity_accepted_at TO _legacy_indemnity_accepted_at; 