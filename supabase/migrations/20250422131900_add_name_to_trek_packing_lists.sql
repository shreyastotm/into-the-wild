-- Migration: Add name column to trek_packing_lists
ALTER TABLE trek_packing_lists ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
