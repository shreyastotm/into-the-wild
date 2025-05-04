-- Migration to fix column names in trek_events table

-- First check if 'name' column exists
DO $$
BEGIN
    -- If name column doesn't exist but trek_name does, add name column and copy data
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trek_events' 
        AND column_name = 'name'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trek_events' 
        AND column_name = 'trek_name'
    ) THEN
        ALTER TABLE public.trek_events ADD COLUMN name VARCHAR(255);
        UPDATE public.trek_events SET name = trek_name;
        ALTER TABLE public.trek_events ALTER COLUMN name SET NOT NULL;
    END IF;
    
    -- Handle base_price and cost columns similarly
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trek_events' 
        AND column_name = 'base_price'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trek_events' 
        AND column_name = 'cost'
    ) THEN
        ALTER TABLE public.trek_events ADD COLUMN base_price DECIMAL(10, 2);
        UPDATE public.trek_events SET base_price = cost;
    END IF;
    
    -- Handle difficulty column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trek_events' 
        AND column_name = 'difficulty'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trek_events' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.trek_events ADD COLUMN difficulty VARCHAR(50);
        UPDATE public.trek_events SET difficulty = category;
    END IF;
END
$$; 