-- Add government ID requirement field to trek_events table
-- This allows event creators to specify if government ID verification is required for participants

ALTER TABLE trek_events ADD COLUMN government_id_required BOOLEAN DEFAULT FALSE;

-- Add comment for clarity
COMMENT ON COLUMN trek_events.government_id_required IS 'Whether this trek requires government ID verification for participants (for ticket booking, permits, etc.)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_trek_events_government_id_required ON trek_events(government_id_required);

-- Update existing treks to have this field (backward compatibility)
-- This ensures existing treks don't break due to the new column
