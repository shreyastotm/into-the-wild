-- Create RPC function to get trek participant count
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO anon;
