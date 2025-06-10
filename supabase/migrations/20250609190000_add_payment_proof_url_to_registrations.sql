ALTER TABLE public.trek_registrations ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

COMMENT ON COLUMN public.trek_registrations.payment_proof_url IS 'URL of the uploaded payment proof image in Supabase Storage.'; 