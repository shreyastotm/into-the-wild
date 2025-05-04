-- Drop all policies depending on roles_assignments, then drop the table

-- 1. Drop policies from trek_fixed_expenses
/* -- Commented out as trek_fixed_expenses may not exist
DROP POLICY IF EXISTS "Only administrators can insert trek fixed expenses" ON trek_fixed_expenses;
DROP POLICY IF EXISTS "Only administrators can update trek fixed expenses" ON trek_fixed_expenses;
DROP POLICY IF EXISTS "Only administrators can delete trek fixed expenses" ON trek_fixed_expenses;
*/

-- 2. Drop policies from trek_admin_approved_expenses
/* -- Commented out as trek_admin_approved_expenses may not exist
DROP POLICY IF EXISTS "Only administrators can update admin approved expenses" ON trek_admin_approved_expenses;
DROP POLICY IF EXISTS "Only administrators can delete admin approved expenses" ON trek_admin_approved_expenses;
*/

-- 3. Drop policies from user_expense_penalties (commented out as table no longer exists)
-- DROP POLICY IF EXISTS "Only administrators can create penalties" ON user_expense_penalties;
-- DROP POLICY IF EXISTS "Only administrators can update penalties" ON user_expense_penalties;
-- DROP POLICY IF EXISTS "Only administrators can delete penalties" ON user_expense_penalties;

-- 4. Drop the roles_assignments table and all dependencies
DROP TABLE IF EXISTS public.roles_assignments CASCADE;

-- Defensive: Only drop policies on trek_packing_lists if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_packing_lists') THEN
        DROP POLICY IF EXISTS "Allow insert for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
        DROP POLICY IF EXISTS "Allow select for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
    END IF;
END $$;

-- 2. Drop policies from trek_groups
/* -- Commented out as trek_groups may not exist
DROP POLICY IF EXISTS "Authenticated users can view trek groups" ON trek_groups;
DROP POLICY IF EXISTS "Group members can view their own groups" ON trek_groups;
*/
