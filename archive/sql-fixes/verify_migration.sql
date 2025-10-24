-- Verify that the registrant details migration was applied correctly
-- Run this in Supabase SQL Editor to check

-- 1. Check if columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'trek_registrations' 
AND column_name IN ('registrant_name', 'registrant_phone')
ORDER BY column_name;

-- 2. Check sample data
SELECT 
  registration_id,
  user_id,
  registrant_name,
  registrant_phone,
  payment_status
FROM trek_registrations 
LIMIT 5;

-- 3. Check if any registrations have the new fields populated
SELECT 
  COUNT(*) as total_registrations,
  COUNT(registrant_name) as with_registrant_name,
  COUNT(registrant_phone) as with_registrant_phone
FROM trek_registrations;

-- 4. If columns don't exist, run the migration:
-- (Uncomment the lines below if needed)
/*
ALTER TABLE public.trek_registrations 
  ADD COLUMN IF NOT EXISTS registrant_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS registrant_phone VARCHAR(20);

UPDATE public.trek_registrations tr
SET 
  registrant_name = u.full_name,
  registrant_phone = u.phone_number
FROM public.users u
WHERE tr.user_id = u.user_id 
  AND tr.registrant_name IS NULL;
*/
