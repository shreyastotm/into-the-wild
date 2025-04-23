-- Migration: Allow insert/select for authenticated users on trek_packing_lists
-- The table might not exist if dropped in earlier migrations, so ensure safe drop
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_packing_lists') THEN
        ALTER TABLE public.trek_packing_lists ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow insert for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
        DROP POLICY IF EXISTS "Allow select for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
    END IF;
END $$;

-- Only create policies if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_packing_lists') THEN
        CREATE POLICY "Allow insert for authenticated users on trek_packing_lists" ON public.trek_packing_lists
          FOR INSERT TO authenticated
          WITH CHECK (auth.uid() IS NOT NULL);
        CREATE POLICY "Allow select for authenticated users on trek_packing_lists" ON public.trek_packing_lists
          FOR SELECT TO authenticated
          USING (auth.uid() IS NOT NULL);
    END IF;
END $$;
