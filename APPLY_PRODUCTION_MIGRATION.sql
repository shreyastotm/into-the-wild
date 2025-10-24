-- ============================================================================
-- PRODUCTION MIGRATION: Apply get_trek_participant_count RPC Function
-- ============================================================================
-- This SQL script should be run in your Supabase Dashboard SQL Editor
-- Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ============================================================================

-- Step 1: Drop existing function if it exists (safe to run multiple times)
DROP FUNCTION IF EXISTS get_trek_participant_count(INTEGER);

-- Step 2: Create the RPC function to get trek participant count
CREATE OR REPLACE FUNCTION get_trek_participant_count(trek_id_param INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    participant_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO participant_count
    FROM trek_registrations
    WHERE trek_id = trek_id_param
    AND payment_status IN ('paid', 'pending', 'proof_uploaded');

    RETURN COALESCE(participant_count, 0);
END;
$$;

-- Step 3: Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO anon;

-- Step 4: Verify the function was created successfully
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    prosrc as source_code
FROM pg_proc 
WHERE proname = 'get_trek_participant_count';

-- Expected output: Should show one row with function details

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Test the function with a sample trek_id (replace 1 with an actual trek_id)
-- SELECT get_trek_participant_count(1);
-- ============================================================================

