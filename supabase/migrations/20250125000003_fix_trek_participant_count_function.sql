-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_trek_participant_count(INTEGER);

-- Create the RPC function with proper security
CREATE OR REPLACE FUNCTION get_trek_participant_count(trek_id_param INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION get_trek_participant_count(INTEGER) IS 'Returns the count of participants for a given trek ID';
