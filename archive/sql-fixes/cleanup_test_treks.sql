-- Clean up test treks and their registrations
-- This will remove the test data we created

-- First, delete the registrations for test treks
DELETE FROM public.trek_registrations 
WHERE trek_id IN (
  SELECT trek_id FROM public.trek_events 
  WHERE name LIKE 'Test Past Trek%'
);

-- Then delete the test treks themselves
DELETE FROM public.trek_events 
WHERE name LIKE 'Test Past Trek%';

-- Verify cleanup
SELECT 
  COUNT(*) as remaining_test_treks
FROM public.trek_events 
WHERE name LIKE 'Test Past Trek%';

-- Show remaining treks
SELECT 
  trek_id,
  name,
  status,
  start_datetime
FROM public.trek_events 
ORDER BY start_datetime DESC
LIMIT 10;
