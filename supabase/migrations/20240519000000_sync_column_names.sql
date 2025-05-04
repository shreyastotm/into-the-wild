-- Migration to fix mismatched column names between code and database schema

DO $$
BEGIN
    -- Fix users table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'name'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.users ADD COLUMN name VARCHAR(255);
        UPDATE public.users SET name = full_name;
    END IF;

    -- Add has_car, car_seating_capacity, and related columns to users table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'has_car'
    ) THEN
        ALTER TABLE public.users ADD COLUMN has_car BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'car_seating_capacity'
    ) THEN
        ALTER TABLE public.users ADD COLUMN car_seating_capacity INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'vehicle_number'
    ) THEN
        ALTER TABLE public.users ADD COLUMN vehicle_number TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE public.users ADD COLUMN latitude DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE public.users ADD COLUMN longitude DOUBLE PRECISION;
    END IF;

    -- Fix trek_events table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trek_events' AND column_name = 'trek_name'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trek_events' AND column_name = 'name'
    ) THEN
        ALTER TABLE public.trek_events ADD COLUMN trek_name VARCHAR(255);
        UPDATE public.trek_events SET trek_name = name;
    END IF;

    -- Handle cost vs base_price
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trek_events' AND column_name = 'cost'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trek_events' AND column_name = 'base_price'
    ) THEN
        ALTER TABLE public.trek_events ADD COLUMN cost DECIMAL(10, 2);
        UPDATE public.trek_events SET cost = base_price;
    END IF;

    -- Add body column to trek_comments if it doesn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'trek_comments'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trek_comments' AND column_name = 'body'
    ) THEN
        ALTER TABLE public.trek_comments ADD COLUMN body TEXT;
    END IF;
END
$$; 