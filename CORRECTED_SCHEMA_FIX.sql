-- CORRECTED SCHEMA FIX for trek event creation errors
-- Run this in your Supabase SQL editor

-- ==============================================
-- ISSUE 1: Fix trek_events table - add missing columns
-- ==============================================

-- Add 'image' column as alias to 'image_url' for backward compatibility
ALTER TABLE public.trek_events 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Copy data from image_url to image if image_url exists
UPDATE public.trek_events 
SET image = image_url 
WHERE image_url IS NOT NULL AND image IS NULL;

-- The 'name' column already exists, so we don't need to add it
-- The 'base_price' column already exists, so we don't need to add it
-- The 'created_by' column already exists, so we don't need to add it
-- The 'is_finalized' column already exists, so we don't need to add it
-- The 'status' column already exists, so we don't need to add it
-- The 'end_datetime' column already exists, so we don't need to add it
-- The 'event_type' column already exists, so we don't need to add it

-- ==============================================
-- ISSUE 2: Create trek_costs table with correct constraints
-- ==============================================

-- Drop existing trek_costs table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS public.trek_costs CASCADE;

-- Create trek_costs table with the correct constraint
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

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Check trek_events table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'trek_events'
ORDER BY ordinal_position;

-- Check trek_costs table structure
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
