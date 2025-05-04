-- Add location and car details columns to the users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision,
ADD COLUMN IF NOT EXISTS has_car boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS car_seating_capacity integer,
ADD COLUMN IF NOT EXISTS vehicle_number text;

-- Add destination coordinates to the trek_events table
ALTER TABLE public.trek_events
ADD COLUMN IF NOT EXISTS destination_latitude double precision,
ADD COLUMN IF NOT EXISTS destination_longitude double precision;

-- Add comments for the new columns for clarity (optional but good practice)
COMMENT ON COLUMN public.users.latitude IS 'User''s home latitude for pickup calculation.';
COMMENT ON COLUMN public.users.longitude IS 'User''s home longitude for pickup calculation.';
COMMENT ON COLUMN public.users.has_car IS 'Does the user have a car available for carpooling?';
COMMENT ON COLUMN public.users.car_seating_capacity IS 'How many passengers can the user''s car accommodate (excluding driver).';
COMMENT ON COLUMN public.users.vehicle_number IS 'License plate or other identifier for the user''s vehicle.';

COMMENT ON COLUMN public.trek_events.destination_latitude IS 'Latitude of the trek''s destination/endpoint.';
COMMENT ON COLUMN public.trek_events.destination_longitude IS 'Longitude of the trek''s destination/endpoint.'; 