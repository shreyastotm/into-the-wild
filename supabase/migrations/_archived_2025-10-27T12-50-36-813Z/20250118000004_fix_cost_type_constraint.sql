-- Fix cost_type constraint and ensure data integrity for trek_costs table
-- This addresses the null value constraint violation issue

-- First, let's check if there are any existing records with null cost_type
-- and fix them by setting a default value

-- Only run if trek_costs table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_costs') THEN
-- Update any existing records that might have null cost_type
UPDATE public.trek_costs
SET cost_type = 'OTHER'
WHERE cost_type IS NULL;
  END IF;
END $$;

-- Ensure the cost_type column constraint is properly enforced
-- The table already has the correct constraint, but let's verify

-- Only run if trek_costs table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_costs') THEN
-- Add a comment to clarify the constraint
    EXECUTE 'COMMENT ON COLUMN public.trek_costs.cost_type IS ''Type of fixed cost: ACCOMMODATION, TICKETS, LOCAL_VEHICLE, GUIDE, OTHER''';
  END IF;
END $$;

-- Create a function to validate cost_type values
CREATE OR REPLACE FUNCTION public.validate_cost_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure cost_type is never null and is a valid value
  IF NEW.cost_type IS NULL THEN
    NEW.cost_type := 'OTHER';
  END IF;

  -- Validate that cost_type is one of the allowed values
  IF NEW.cost_type NOT IN ('ACCOMMODATION', 'TICKETS', 'LOCAL_VEHICLE', 'GUIDE', 'OTHER') THEN
    RAISE EXCEPTION 'Invalid cost_type: %. Must be one of: ACCOMMODATION, TICKETS, LOCAL_VEHICLE, GUIDE, OTHER', NEW.cost_type;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_costs') THEN
-- Create trigger to automatically validate cost_type on insert/update
DROP TRIGGER IF EXISTS validate_cost_type_trigger ON public.trek_costs;
CREATE TRIGGER validate_cost_type_trigger
  BEFORE INSERT OR UPDATE ON public.trek_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_cost_type();
  END IF;
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.validate_cost_type() TO authenticated, anon;
