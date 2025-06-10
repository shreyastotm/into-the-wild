ALTER TABLE public.trek_registrations
ADD COLUMN IF NOT EXISTS indemnity_agreed_at TIMESTAMPTZ;
 
COMMENT ON COLUMN public.trek_registrations.indemnity_agreed_at IS 'Timestamp when the user agreed to the indemnity for this specific trek.'; 