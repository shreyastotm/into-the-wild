-- Migration to handle fixed costs data migration
-- Since trek_fixed_expenses table was dropped, check if trek_costs has data

-- This migration ensures the trek_costs table is properly set up
-- and handles any data migration issues

-- First, check if the trek_costs table exists with correct structure
-- If not, skip this migration as it will be handled when the table is created
DO $$
BEGIN
    -- Check if trek_costs table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_costs') THEN
        RAISE NOTICE 'trek_costs table does not exist yet. Skipping this migration - it will be handled when the table is created.';
        RETURN;
    END IF;

    -- Verify the table has the correct columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trek_costs' AND column_name = 'cost_type') THEN
        RAISE NOTICE 'trek_costs table missing cost_type column. Skipping this migration.';
        RETURN;
    END IF;

    RAISE NOTICE 'trek_costs table exists with correct structure';

-- Update any existing records that might have null cost_type (safety check)
UPDATE public.trek_costs
SET cost_type = 'OTHER'
WHERE cost_type IS NULL OR cost_type = '';
END $$;

-- Wrap remaining operations in a conditional block
DO $$
BEGIN
    -- Only proceed if trek_costs table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_costs') THEN
-- Ensure all cost records have valid cost_type values
UPDATE public.trek_costs
SET cost_type = CASE
    WHEN cost_type = 'Tickets' THEN 'TICKETS'
    WHEN cost_type = 'Stay' THEN 'ACCOMMODATION'
    WHEN cost_type = 'Bird Watching Guide' THEN 'GUIDE'
    WHEN cost_type IN ('Forest Fees', 'Camping Equipment', 'Bonfire', 'Cooking Stove Rental', 'Other') THEN 'OTHER'
    ELSE cost_type
END
WHERE cost_type NOT IN ('ACCOMMODATION', 'TICKETS', 'LOCAL_VEHICLE', 'GUIDE', 'OTHER');

-- Add any missing indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_trek_costs_trek_id ON public.trek_costs(trek_id);
CREATE INDEX IF NOT EXISTS idx_trek_costs_cost_type ON public.trek_costs(cost_type);

-- Ensure RLS policies are in place
ALTER TABLE public.trek_costs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Wrap policy and grant operations in conditional block
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_costs') THEN
-- Drop any conflicting policies and recreate them
DROP POLICY IF EXISTS "Admin users can manage all trek costs" ON public.trek_costs;
DROP POLICY IF EXISTS "Trek creators can manage their trek costs" ON public.trek_costs;
DROP POLICY IF EXISTS "Registered users can view trek costs" ON public.trek_costs;
DROP POLICY IF EXISTS "Users can view costs for open treks" ON public.trek_costs;
DROP POLICY IF EXISTS "Admin full access to trek costs" ON public.trek_costs;
DROP POLICY IF EXISTS "Trek creators can manage trek costs" ON public.trek_costs;
DROP POLICY IF EXISTS "Authenticated users can view trek costs" ON public.trek_costs;
DROP POLICY IF EXISTS "Allow cost insertion for authenticated users" ON public.trek_costs;
DROP POLICY IF EXISTS "Allow cost deletion for creators and admins" ON public.trek_costs;

-- Create proper RLS policies
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
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trek_events
            WHERE trek_events.trek_id = trek_costs.trek_id
            AND trek_events.created_by = auth.uid()
        )
    );

CREATE POLICY "Allow cost deletion for creators and admins" ON public.trek_costs
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = auth.uid()
            AND user_type = 'admin'
        ) OR EXISTS (
            SELECT 1 FROM public.trek_events
            WHERE trek_events.trek_id = trek_costs.trek_id
            AND trek_events.created_by = auth.uid()
        )
    );

-- Grant proper permissions
GRANT ALL ON TABLE public.trek_costs TO anon;
GRANT ALL ON TABLE public.trek_costs TO authenticated;
GRANT ALL ON TABLE public.trek_costs TO service_role;
    END IF;
END $$;

-- Log completion
DO $$
BEGIN
RAISE NOTICE 'Fixed costs system setup completed successfully';
END $$;
