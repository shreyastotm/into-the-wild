-- ULTIMATE RECURSION FIX
-- This completely eliminates recursion by using a much simpler approach

BEGIN;

-- STEP 1: Drop ALL policies
DROP POLICY IF EXISTS "user_select_own" ON public.users;
DROP POLICY IF EXISTS "user_update_own" ON public.users;
DROP POLICY IF EXISTS "user_insert_own" ON public.users;
DROP POLICY IF EXISTS "admin_select_all" ON public.users;
DROP POLICY IF EXISTS "admin_update_all" ON public.users;

-- STEP 2: Create very simple policies that don't cause recursion
-- Allow users to see their own profile
CREATE POLICY "user_own_profile" ON public.users
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to see basic user info (for treks, etc.)
-- This is safe and won't cause recursion
CREATE POLICY "authenticated_read_users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

-- STEP 3: Create a simple admin check function that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    user_type_val TEXT;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- If no user ID, return false
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get user type directly
    SELECT user_type::TEXT INTO user_type_val
    FROM public.users
    WHERE user_id = current_user_id;
    
    -- Return true if admin
    RETURN COALESCE(user_type_val = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin_check() TO anon, authenticated;

COMMIT;

-- Verification
SELECT 'Policies after fix:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- Test the admin function
SELECT 'Admin function test:' as status;
SELECT public.is_admin_check() as is_admin_result;
