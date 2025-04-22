-- Migration: Allow insert/select for authenticated users on trek_packing_lists
ALTER TABLE public.trek_packing_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
DROP POLICY IF EXISTS "Allow select for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
CREATE POLICY "Allow insert for authenticated users on trek_packing_lists" ON public.trek_packing_lists
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow select for authenticated users on trek_packing_lists" ON public.trek_packing_lists
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);
