-- supabase/migrations/20250505155504_rpc_get_trek_participant_count.sql
-- Drop existing function first to avoid parameter name conflicts
DROP FUNCTION IF EXISTS public.get_trek_participant_count(INTEGER);

CREATE OR REPLACE FUNCTION public.get_trek_participant_count(trek_id_param INTEGER)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(user_id)::INTEGER
  FROM public.trek_registrations
  WHERE trek_id = trek_id_param
  AND payment_status IS DISTINCT FROM 'Cancelled';
$$;

GRANT EXECUTE ON FUNCTION public.get_trek_participant_count(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trek_participant_count(INT) TO service_role; -- Or anon if counts are truly public

COMMENT ON FUNCTION public.get_trek_participant_count(INT) IS 'Safely retrieves the active participant count for a given trek_id, respecting RLS for the function executor but querying data broadly.'; 