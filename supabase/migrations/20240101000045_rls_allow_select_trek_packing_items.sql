-- Enable RLS on trek_packing_items if not already enabled
ALTER TABLE public.trek_packing_items ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, for idempotency
DROP POLICY IF EXISTS "Allow select for authenticated users on trek_packing_items" ON public.trek_packing_items;

-- Allow any authenticated user to read the master packing item list
CREATE POLICY "Allow select for authenticated users on trek_packing_items" ON public.trek_packing_items
  FOR SELECT TO authenticated
  USING (true); -- Allow reading all rows 