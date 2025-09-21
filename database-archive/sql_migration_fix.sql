-- Fix columns needed by the application

-- 1. Fix users table - missing columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_car BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS car_seating_capacity INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vehicle_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Copy full_name to name if both exist
UPDATE public.users SET name = full_name WHERE full_name IS NOT NULL AND name IS NULL;

-- 2. Fix trek_events table - column name mismatches
ALTER TABLE public.trek_events ADD COLUMN IF NOT EXISTS trek_name VARCHAR(255);
ALTER TABLE public.trek_events ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2);
ALTER TABLE public.trek_events ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50);

-- Diagnostic: Print information about existing columns
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE 'Columns in trek_events table:';
    FOR col_record IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'trek_events'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: %', col_record.column_name, col_record.data_type;
    END LOOP;
END
$$;

-- Copy data between columns with different naming conventions only if they exist
DO $$
BEGIN
    -- Check if both columns exist before trying to copy data
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trek_events' AND column_name = 'name'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trek_events' AND column_name = 'trek_name'
    ) THEN
        EXECUTE 'UPDATE public.trek_events SET trek_name = name WHERE name IS NOT NULL AND trek_name IS NULL';
    END IF;

    -- Check if both columns exist before trying to copy data
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trek_events' AND column_name = 'base_price'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trek_events' AND column_name = 'cost'
    ) THEN
        EXECUTE 'UPDATE public.trek_events SET cost = base_price WHERE base_price IS NOT NULL AND cost IS NULL';
    END IF;
    
    -- Copy category to difficulty if both exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trek_events' AND column_name = 'category'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trek_events' AND column_name = 'difficulty'
    ) THEN
        EXECUTE 'UPDATE public.trek_events SET difficulty = category WHERE category IS NOT NULL AND difficulty IS NULL';
    END IF;
END
$$;

-- 3. Fix trek_comments table - missing body column
ALTER TABLE public.trek_comments ADD COLUMN IF NOT EXISTS body TEXT;

-- Add comment to explain the purpose of this migration
COMMENT ON TABLE public.users IS 'User profiles with compatibility columns (name, has_car, etc.) added';

-- Optional: Status report (won't fail if table doesn't exist)
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully';
    
    -- Output counts of key tables
    RAISE NOTICE 'Users: % rows', (SELECT COUNT(*) FROM public.users);
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trek_events') THEN
        RAISE NOTICE 'Trek events: % rows', (SELECT COUNT(*) FROM public.trek_events);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trek_comments') THEN
        RAISE NOTICE 'Trek comments: % rows', (SELECT COUNT(*) FROM public.trek_comments);
    END IF;
END
$$; 