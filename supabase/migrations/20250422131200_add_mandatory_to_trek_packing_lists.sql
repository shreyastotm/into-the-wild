-- Migration: Add mandatory column to trek_packing_lists
ALTER TABLE trek_packing_lists ADD COLUMN IF NOT EXISTS mandatory boolean NOT NULL DEFAULT false;
