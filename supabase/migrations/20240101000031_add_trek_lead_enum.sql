-- Add 'trek_lead' to the role_type enum if it doesn't exist
DO $$
BEGIN
  ALTER TYPE public.role_type ADD VALUE IF NOT EXISTS 'trek_lead';
EXCEPTION
  WHEN duplicate_object THEN -- Or appropriate error code if different
    RAISE NOTICE 'Value "trek_lead" already exists in enum role_type.';
END $$; 