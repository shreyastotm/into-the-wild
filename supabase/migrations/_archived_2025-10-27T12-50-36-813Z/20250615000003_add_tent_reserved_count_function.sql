-- Migration: Add RPC function to update tent reserved count
-- This function safely updates the reserved count for tent inventory

BEGIN;

-- Drop existing function with different signature
DROP FUNCTION IF EXISTS public.update_tent_reserved_count(INTEGER);

-- Create function to update tent reserved count
CREATE OR REPLACE FUNCTION public.update_tent_reserved_count(
  p_event_id INTEGER,
  p_tent_type_id INTEGER,
  p_quantity_change INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the reserved count
  UPDATE public.tent_inventory 
  SET reserved_count = GREATEST(0, reserved_count + p_quantity_change),
      updated_at = CURRENT_TIMESTAMP
  WHERE event_id = p_event_id 
    AND tent_type_id = p_tent_type_id;
  
  -- Check if the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tent inventory not found for event % and tent type %', p_event_id, p_tent_type_id;
  END IF;
  
  -- Verify that reserved count doesn't exceed total available
  IF EXISTS (
    SELECT 1 FROM public.tent_inventory 
    WHERE event_id = p_event_id 
      AND tent_type_id = p_tent_type_id 
      AND reserved_count > total_available
  ) THEN
    RAISE EXCEPTION 'Reserved count cannot exceed total available tents';
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_tent_reserved_count(INTEGER, INTEGER, INTEGER) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.update_tent_reserved_count IS 'Updates the reserved count for tent inventory with validation';

COMMIT;
