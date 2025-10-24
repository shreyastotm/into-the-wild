-- Creates a helper function to check if a user is an admin
-- Drop existing function first to avoid parameter name conflicts
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;

CREATE OR REPLACE FUNCTION public.is_admin (user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Essential for this to work in RLS policies
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE user_id = user_id_param
    AND user_type = 'admin'
  );
END;
$$; 