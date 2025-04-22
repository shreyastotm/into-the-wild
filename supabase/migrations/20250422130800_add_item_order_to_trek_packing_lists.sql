-- Migration: Add item_order column to trek_packing_lists
ALTER TABLE trek_packing_lists ADD COLUMN IF NOT EXISTS item_order integer NOT NULL DEFAULT 0;
