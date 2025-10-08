-- Add registrant details to trek_registrations table
-- This allows capturing the actual payer's details which may differ from the logged-in user
-- For example: one person paying for multiple registrants or payment from different phone number

BEGIN;

-- Add registrant name and phone columns
ALTER TABLE public.trek_registrations 
  ADD COLUMN IF NOT EXISTS registrant_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS registrant_phone VARCHAR(20);

-- Add comments for clarity
COMMENT ON COLUMN public.trek_registrations.registrant_name IS 'Name of the person making the payment (may differ from user account name)';
COMMENT ON COLUMN public.trek_registrations.registrant_phone IS 'Phone number of the person making the payment (may differ from user account phone)';

-- For existing registrations, populate from users table
UPDATE public.trek_registrations tr
SET 
  registrant_name = u.full_name,
  registrant_phone = u.phone_number
FROM public.users u
WHERE tr.user_id = u.user_id 
  AND tr.registrant_name IS NULL;

COMMIT;
