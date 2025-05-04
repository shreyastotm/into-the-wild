-- Migration: Ensure ON DELETE CASCADE for trek_packing_lists.trek_id foreign key

-- Defensive: Only alter trek_packing_lists if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_packing_lists') THEN
        -- 1. Drop existing constraint if it exists
        ALTER TABLE public.trek_packing_lists DROP CONSTRAINT IF EXISTS trek_packing_lists_trek_id_fkey;
        -- 2. Add the correct foreign key with ON DELETE CASCADE
        ALTER TABLE public.trek_packing_lists
          ADD CONSTRAINT trek_packing_lists_trek_id_fkey
          FOREIGN KEY (trek_id)
          REFERENCES public.trek_events (trek_id)
          ON DELETE CASCADE;
    END IF;
END $$;
