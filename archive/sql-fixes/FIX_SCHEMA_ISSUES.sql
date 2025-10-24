-- Fix for database schema issues identified in the error messages
-- Run this in your Supabase SQL editor

-- ==============================================
-- ISSUE 1: Missing 'image' column in trek_events
-- ==============================================
-- The error shows "Could not find the 'image' column of 'trek_events'"
-- The schema has 'image_url' but code is looking for 'image'

-- Option A: Add 'image' column as alias to 'image_url'
ALTER TABLE public.trek_events 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Copy data from image_url to image if image_url exists
UPDATE public.trek_events 
SET image = image_url 
WHERE image_url IS NOT NULL AND image IS NULL;

-- Option B: Create a view or function to handle the mapping
-- This is better for long-term maintenance

-- ==============================================
-- ISSUE 2: trek_costs table missing or constraint issues
-- ==============================================

-- Check if trek_costs table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_costs') THEN
        -- Create trek_costs table
        CREATE TABLE public.trek_costs (
            id BIGSERIAL PRIMARY KEY,
            trek_id BIGINT NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
            cost_type TEXT NOT NULL CHECK (cost_type IN ('ACCOMMODATION', 'TICKETS', 'LOCAL_VEHICLE', 'GUIDE', 'OTHER')),
            description TEXT,
            amount NUMERIC(10,2) NOT NULL DEFAULT 0,
            url TEXT,
            file_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Create indexes
        CREATE INDEX idx_trek_costs_trek_id ON public.trek_costs(trek_id);
        CREATE INDEX idx_trek_costs_cost_type ON public.trek_costs(cost_type);

        -- Add trigger for updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = timezone('utc'::text, now());
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_trek_costs_updated_at 
            BEFORE UPDATE ON public.trek_costs 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();

        -- Enable RLS
        ALTER TABLE public.trek_costs ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        CREATE POLICY "Admin full access to trek costs" ON public.trek_costs
            FOR ALL 
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE user_id = auth.uid() 
                    AND user_type = 'admin'
                )
            );

        CREATE POLICY "Trek creators can manage trek costs" ON public.trek_costs
            FOR ALL 
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE user_id = auth.uid() 
                    AND user_type = 'admin'
                )
                OR
                EXISTS (
                    SELECT 1 FROM public.trek_events 
                    WHERE trek_events.trek_id = trek_costs.trek_id 
                    AND trek_events.created_by = auth.uid()
                )
            );

        CREATE POLICY "Authenticated users can view trek costs" ON public.trek_costs
            FOR SELECT 
            TO authenticated
            USING (true);

        CREATE POLICY "Allow cost insertion for authenticated users" ON public.trek_costs
            FOR INSERT 
            TO authenticated
            WITH CHECK (true);

        RAISE NOTICE 'Created trek_costs table with all constraints and policies';
    ELSE
        RAISE NOTICE 'trek_costs table already exists';
    END IF;
END $$;

-- ==============================================
-- ISSUE 3: Fix cost_type constraint violations
-- ==============================================
-- The constraint only allows: 'ACCOMMODATION', 'TICKETS', 'LOCAL_VEHICLE', 'GUIDE', 'OTHER'
-- If you're getting constraint violations, check what values are being inserted

-- Check current cost_type values in trek_costs (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_costs') THEN
        RAISE NOTICE 'Current cost_type values in trek_costs:';
        FOR rec IN SELECT DISTINCT cost_type FROM public.trek_costs LOOP
            RAISE NOTICE 'Found cost_type: %', rec.cost_type;
        END LOOP;
    END IF;
END $$;

-- ==============================================
-- ISSUE 4: Ensure trek_events has all required columns
-- ==============================================

-- Add missing columns to trek_events if they don't exist
DO $$
BEGIN
    -- Add name column if it doesn't exist (some schemas use trek_name)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='trek_name') THEN
            ALTER TABLE public.trek_events ADD COLUMN name VARCHAR(255);
            UPDATE public.trek_events SET name = trek_name WHERE name IS NULL;
            ALTER TABLE public.trek_events ALTER COLUMN name SET NOT NULL;
            RAISE NOTICE 'Added name column and copied data from trek_name';
        ELSE
            ALTER TABLE public.trek_events ADD COLUMN name VARCHAR(255) NOT NULL;
            RAISE NOTICE 'Added name column';
        END IF;
    END IF;

    -- Add base_price column if it doesn't exist (some schemas use cost)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='base_price') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='cost') THEN
            ALTER TABLE public.trek_events ADD COLUMN base_price DECIMAL(10,2);
            UPDATE public.trek_events SET base_price = cost WHERE base_price IS NULL;
            RAISE NOTICE 'Added base_price column and copied data from cost';
        ELSE
            ALTER TABLE public.trek_events ADD COLUMN base_price DECIMAL(10,2);
            RAISE NOTICE 'Added base_price column';
        END IF;
    END IF;

    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='created_by') THEN
        ALTER TABLE public.trek_events ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added created_by column';
    END IF;

    -- Add is_finalized column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='is_finalized') THEN
        ALTER TABLE public.trek_events ADD COLUMN is_finalized BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_finalized column';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='status') THEN
        ALTER TABLE public.trek_events ADD COLUMN status VARCHAR(50);
        RAISE NOTICE 'Added status column';
    END IF;

    -- Add end_datetime column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='end_datetime') THEN
        ALTER TABLE public.trek_events ADD COLUMN end_datetime TIMESTAMPTZ;
        RAISE NOTICE 'Added end_datetime column';
    END IF;

    -- Add event_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='event_type') THEN
        ALTER TABLE public.trek_events ADD COLUMN event_type VARCHAR(50) DEFAULT 'trek';
        RAISE NOTICE 'Added event_type column';
    END IF;
END $$;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify trek_events table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'trek_events'
ORDER BY ordinal_position;

-- Verify trek_costs table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'trek_costs'
ORDER BY ordinal_position;

-- Check trek_costs constraints
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name = 'trek_costs'
    AND tc.constraint_type = 'CHECK';
