-- Migration: No longer needed, handled by consolidated migration in 20250418130555_remote_schema.sql
-- (All logic for trek_packing_lists creation is now in the main schema migration)

-- Defensive: Only drop and create trek_packing_lists if packing_list_templates and trek_events exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'packing_list_templates')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_events') THEN
        -- 1. Drop the old table if it exists (backup data if needed)
        DROP TABLE IF EXISTS public.trek_packing_lists;
        -- 2. Create the correct join table
        CREATE TABLE public.trek_packing_lists (
            trek_id integer NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
            template_id uuid NOT NULL REFERENCES public.packing_list_templates(template_id) ON DELETE CASCADE,
            PRIMARY KEY (trek_id, template_id)
        );
    END IF;
END $$;
