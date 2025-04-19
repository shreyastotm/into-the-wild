-- Drop all policies depending on roles_assignments, then drop the table

-- 1. Drop policies from trek_fixed_expenses
DROP POLICY IF EXISTS "Only administrators can insert trek fixed expenses" ON trek_fixed_expenses;
DROP POLICY IF EXISTS "Only administrators can update trek fixed expenses" ON trek_fixed_expenses;
DROP POLICY IF EXISTS "Only administrators can delete trek fixed expenses" ON trek_fixed_expenses;

-- 2. Drop policies from trek_admin_approved_expenses
DROP POLICY IF EXISTS "Only administrators can update admin approved expenses" ON trek_admin_approved_expenses;
DROP POLICY IF EXISTS "Only administrators can delete admin approved expenses" ON trek_admin_approved_expenses;

-- 3. Drop policies from user_expense_penalties (commented out as table no longer exists)
-- DROP POLICY IF EXISTS "Only administrators can create penalties" ON user_expense_penalties;
-- DROP POLICY IF EXISTS "Only administrators can update penalties" ON user_expense_penalties;
-- DROP POLICY IF EXISTS "Only administrators can delete penalties" ON user_expense_penalties;

-- 4. Drop the roles_assignments table and all dependencies
DROP TABLE IF EXISTS public.roles_assignments CASCADE;
