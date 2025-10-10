-- Fix schema drift issues where database has columns not reflected in migrations
-- This ensures trek_drivers and trek_pickup_locations tables match application expectations

BEGIN;

-- Fix trek_drivers table - ensure all expected columns exist
-- The database apparently has a 'vehicle_info' column that's NOT NULL
-- First, add it if missing, then modify constraint if needed
DO $$
BEGIN
    -- Add the column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trek_drivers' AND column_name='vehicle_info') THEN
        ALTER TABLE public.trek_drivers ADD COLUMN vehicle_info JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- If the column exists but has NOT NULL constraint, modify it to allow NULL with default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='trek_drivers'
        AND column_name='vehicle_info'
        AND is_nullable='NO'
    ) THEN
        ALTER TABLE public.trek_drivers ALTER COLUMN vehicle_info DROP NOT NULL;
        ALTER TABLE public.trek_drivers ALTER COLUMN vehicle_info SET DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Ensure all other expected columns exist
ALTER TABLE public.trek_drivers
  ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS vehicle_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS seats_available INTEGER DEFAULT 0;

-- Fix trek_pickup_locations table - ensure all expected columns exist
-- The database apparently has a 'time' column that's NOT NULL
-- First, add it if missing, then modify constraint if needed
DO $$
BEGIN
    -- Add the column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trek_pickup_locations' AND column_name='time') THEN
        ALTER TABLE public.trek_pickup_locations ADD COLUMN time TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- If the column exists but has NOT NULL constraint, modify it to allow NULL with default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='trek_pickup_locations'
        AND column_name='time'
        AND is_nullable='NO'
    ) THEN
        ALTER TABLE public.trek_pickup_locations ALTER COLUMN time DROP NOT NULL;
        ALTER TABLE public.trek_pickup_locations ALTER COLUMN time SET DEFAULT NOW();
    END IF;
END $$;

-- Ensure all other expected columns exist
ALTER TABLE public.trek_pickup_locations
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 6),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 6);

-- Add comments for clarity
COMMENT ON COLUMN public.trek_drivers.vehicle_info IS 'JSON object containing vehicle details (for backward compatibility)';
COMMENT ON COLUMN public.trek_drivers.vehicle_type IS 'Type of vehicle (e.g., Car 5-seater, SUV/MUV, Mini-van, MiniBus)';
COMMENT ON COLUMN public.trek_drivers.vehicle_name IS 'Vehicle model/name';
COMMENT ON COLUMN public.trek_drivers.registration_number IS 'Vehicle registration/license plate number';
COMMENT ON COLUMN public.trek_drivers.seats_available IS 'Number of passenger seats available (excluding driver)';

COMMENT ON COLUMN public.trek_pickup_locations.time IS 'Pickup time for this location';
COMMENT ON COLUMN public.trek_pickup_locations.latitude IS 'Latitude coordinate for pickup location';
COMMENT ON COLUMN public.trek_pickup_locations.longitude IS 'Longitude coordinate for pickup location';

-- Update existing records to have default values for new columns
-- Note: vehicle_info may exist as TEXT type, so handle carefully
UPDATE public.trek_drivers
SET
  vehicle_type = COALESCE(vehicle_type, ''),
  vehicle_name = COALESCE(vehicle_name, ''),
  registration_number = COALESCE(registration_number, ''),
  seats_available = COALESCE(seats_available, 0)
WHERE vehicle_type IS NULL OR vehicle_name IS NULL OR registration_number IS NULL OR seats_available IS NULL;

-- For vehicle_info, only update if it's JSONB type (to avoid type mismatch errors)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='trek_drivers'
    AND column_name='vehicle_info'
    AND data_type='jsonb'
  ) THEN
    UPDATE public.trek_drivers
    SET vehicle_info = COALESCE(vehicle_info, '{}'::jsonb)
    WHERE vehicle_info IS NULL;
  END IF;
END $$;

UPDATE public.trek_pickup_locations
SET
  time = COALESCE(time, NOW()),
  latitude = COALESCE(latitude, 0),
  longitude = COALESCE(longitude, 0)
WHERE time IS NULL OR latitude IS NULL;

COMMIT;
