-- Migration: Add support for Camping Events alongside Trek Events
-- This extends the existing trek_events table to support both event types

BEGIN;

-- Add event_type column with default 'trek' for backward compatibility
ALTER TABLE public.trek_events 
ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'trek' 
CHECK (event_type IN ('trek', 'camping'));

-- Add camping-specific fields using JSONB for flexibility
ALTER TABLE public.trek_events 
ADD COLUMN IF NOT EXISTS itinerary JSONB;

ALTER TABLE public.trek_events 
ADD COLUMN IF NOT EXISTS activity_schedule JSONB;

ALTER TABLE public.trek_events 
ADD COLUMN IF NOT EXISTS volunteer_roles JSONB;

-- Add comments to explain the new columns
COMMENT ON COLUMN public.trek_events.event_type IS 'Type of event: trek (traditional hiking/trekking) or camping (multi-activity camping event)';
COMMENT ON COLUMN public.trek_events.itinerary IS 'Detailed day-by-day itinerary for camping events (JSON format)';
COMMENT ON COLUMN public.trek_events.activity_schedule IS 'Scheduled activities with timing and requirements (JSON format)';
COMMENT ON COLUMN public.trek_events.volunteer_roles IS 'Available volunteer roles and requirements for camping events (JSON format)';

-- Create index for event_type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_trek_events_event_type ON public.trek_events(event_type);

-- Update the table comment to reflect support for both event types
COMMENT ON TABLE public.trek_events IS 'Defines the details of both trek and camping events.';

COMMIT;
