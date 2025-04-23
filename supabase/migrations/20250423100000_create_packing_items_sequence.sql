-- Migration: Ensure packing_items_item_id_seq exists before using it in trek_packing_items
CREATE SEQUENCE IF NOT EXISTS public.packing_items_item_id_seq;

-- Set ownership to the correct table/column if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trek_packing_items') THEN
    ALTER SEQUENCE public.packing_items_item_id_seq OWNED BY public.trek_packing_items.item_id;
  END IF;
END $$;
