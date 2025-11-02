-- Migration: Add Jam Yard event type for partner collaboration outdoor activities
-- This extends the existing trek_events table to support outdoor activity events

BEGIN;

-- Drop the existing CHECK constraint to add jam_yard option
ALTER TABLE public.trek_events
DROP CONSTRAINT IF EXISTS trek_events_event_type_check;

-- Add the new CHECK constraint with 'jam_yard' option
ALTER TABLE public.trek_events
ADD CONSTRAINT trek_events_event_type_check 
CHECK (event_type IN ('trek', 'camping', 'jam_yard'));

-- Add jam_yard-specific fields using JSONB for flexibility
ALTER TABLE public.trek_events 
ADD COLUMN IF NOT EXISTS jam_yard_details JSONB;

-- Add comment to explain the new column
COMMENT ON COLUMN public.trek_events.jam_yard_details IS 'Jam Yard event specific details: activity_focus, instructor_name, instructor_bio, instructor_image, venue_type, venue_details, target_audience, session_duration, equipment_provided, skill_level, weather_dependency, can_complement_camping, can_complement_trek';

-- Update the table comment to reflect all event types
COMMENT ON TABLE public.trek_events IS 'Defines the details of trek, camping, and jam_yard events.';

-- Ensure index for event_type exists (should already exist but just in case)
CREATE INDEX IF NOT EXISTS idx_trek_events_event_type ON public.trek_events(event_type);

COMMIT;

