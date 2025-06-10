-- Creates a helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin (p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Essential for this to work in RLS policies
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE user_id = p_user_id
    AND user_type = 'admin'
  );
END;
$$; 