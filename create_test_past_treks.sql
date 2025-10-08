-- Create test data for past treks to test the dashboard
-- This will help verify that the past treks functionality works

-- First, let's create a past trek event
INSERT INTO public.trek_events (
  name,
  description,
  category,
  start_datetime,
  base_price,
  max_participants,
  location,
  status
) VALUES (
  'Test Past Trek - Himalayan Adventure',
  'A completed trek to test the past treks functionality',
  'Mountain Trek',
  '2024-01-15T06:00:00+00:00', -- Past date
  2500,
  15,
  'Himalayas, India',
  'Completed'
) RETURNING trek_id;

-- Create a registration for this past trek (you'll need to replace the user_id with an actual user)
-- This is just an example - you'll need to use a real user_id from your users table
INSERT INTO public.trek_registrations (
  trek_id,
  user_id,
  payment_status
) VALUES (
  (SELECT trek_id FROM public.trek_events WHERE name = 'Test Past Trek - Himalayan Adventure'),
  '61fcbebf-dd72-4efa-974d-f9e4ecb79b0c', -- Replace with actual user_id
  'Approved'
);

-- Also create another past trek with different status
INSERT INTO public.trek_events (
  name,
  description,
  category,
  start_datetime,
  base_price,
  max_participants,
  location,
  status
) VALUES (
  'Test Past Trek - Forest Walk',
  'An archived trek to test the past treks functionality',
  'Forest Trek',
  '2024-01-20T08:00:00+00:00', -- Past date
  1200,
  20,
  'Western Ghats, India',
  'Archived'
) RETURNING trek_id;

-- Create a registration for this archived trek
INSERT INTO public.trek_registrations (
  trek_id,
  user_id,
  payment_status
) VALUES (
  (SELECT trek_id FROM public.trek_events WHERE name = 'Test Past Trek - Forest Walk'),
  '61fcbebf-dd72-4efa-974d-f9e4ecb79b0c', -- Replace with actual user_id
  'Approved'
);

-- Verify the test data
SELECT 
  te.trek_id,
  te.name,
  te.start_datetime,
  te.status,
  tr.user_id,
  tr.payment_status
FROM public.trek_events te
JOIN public.trek_registrations tr ON te.trek_id = tr.trek_id
WHERE te.name LIKE 'Test Past Trek%'
ORDER BY te.start_datetime;
