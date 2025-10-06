-- FINAL RECURSION FIX
-- This completely eliminates the infinite recursion by using a different approach

BEGIN;

-- STEP 1: Drop the problematic admin policies
DROP POLICY IF EXISTS "admin_select_all" ON public.users;
DROP POLICY IF EXISTS "admin_update_all" ON public.users;

-- STEP 2: Create a simple function to check if user is admin (without recursion)
CREATE OR REPLACE FUNCTION public.is_admin_simple(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_type_val TEXT;
BEGIN
    -- Get user type directly from the users table
    SELECT user_type::TEXT INTO user_type_val
    FROM public.users
    WHERE user_id = user_id_param;
    
    -- Return true if user_type is 'admin'
    RETURN COALESCE(user_type_val = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Create new admin policies that use the function
CREATE POLICY "admin_select_all" ON public.users
  FOR SELECT USING (public.is_admin_simple(auth.uid()));

CREATE POLICY "admin_update_all" ON public.users
  FOR UPDATE USING (public.is_admin_simple(auth.uid()))
  WITH CHECK (public.is_admin_simple(auth.uid()));

-- STEP 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin_simple(UUID) TO anon, authenticated;

COMMIT;

-- Verification
SELECT 'Policies after fix:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';
