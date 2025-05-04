-- Packing List Templates Redesign Migration

-- 1. Create packing_list_templates table
-- (Moved to 20250418130555_remote_schema.sql)

-- 2. Create packing_list_items table
-- (Moved to 20250418130555_remote_schema.sql)

-- 3. Create trek_packing_lists table
-- (Moved to 20250418130555_remote_schema.sql)

-- Remove old trek_packing_lists table if exists (optional, only after migration)
-- drop table if exists public.trek_packing_lists_old;
