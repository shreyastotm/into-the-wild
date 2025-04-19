-- Migration: Ensure trek_packing_lists schema is correct
-- Drops and recreates the trek_packing_lists table with correct columns and types

-- 1. Drop the old table if it exists (backup data if needed)
DROP TABLE IF EXISTS public.trek_packing_lists;

-- 2. Create the correct join table
CREATE TABLE public.trek_packing_lists (
    trek_id integer NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    template_id uuid NOT NULL REFERENCES public.packing_list_templates(template_id) ON DELETE CASCADE,
    PRIMARY KEY (trek_id, template_id)
);
