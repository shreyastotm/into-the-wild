-- Fix RLS policy for trek_packing_list_assignments to allow all authenticated users to read
-- This allows users to see packing lists even if they're not registered for the trek yet

DROP POLICY IF EXISTS "Allow read access to trek packing assignments for authenticated users" ON public.trek_packing_list_assignments;
CREATE POLICY "Allow read access to trek packing assignments for authenticated users" ON public.trek_packing_list_assignments FOR SELECT TO authenticated USING (true);

-- Also ensure master_packing_items is readable by all authenticated users
DROP POLICY IF EXISTS "Allow read access to master packing items for authenticated users" ON public.master_packing_items;
CREATE POLICY "Allow read access to master packing items for authenticated users" ON public.master_packing_items FOR SELECT TO authenticated USING (true);
