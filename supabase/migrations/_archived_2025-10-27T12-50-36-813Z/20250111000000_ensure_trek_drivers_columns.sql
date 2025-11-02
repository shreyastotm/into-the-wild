-- Ensure trek_drivers table has all required columns
-- This migration ensures schema cache is updated

BEGIN;

-- Add columns if they don't exist (idempotent)
ALTER TABLE public.trek_drivers 
  ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS vehicle_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS seats_available INTEGER DEFAULT 0;

-- Ensure trek_pickup_locations has coordinate columns
ALTER TABLE public.trek_pickup_locations
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 6),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 6);

-- Add comments for clarity
COMMENT ON COLUMN public.trek_drivers.vehicle_type IS 'Type of vehicle (e.g., Car 5-seater, SUV/MUV, Mini-van, MiniBus)';
COMMENT ON COLUMN public.trek_drivers.vehicle_name IS 'Vehicle model/name';
COMMENT ON COLUMN public.trek_drivers.registration_number IS 'Vehicle registration/license plate number';
COMMENT ON COLUMN public.trek_drivers.seats_available IS 'Number of passenger seats available (excluding driver)';

COMMENT ON COLUMN public.trek_pickup_locations.latitude IS 'Latitude coordinate for pickup location';
COMMENT ON COLUMN public.trek_pickup_locations.longitude IS 'Longitude coordinate for pickup location';

COMMIT;

