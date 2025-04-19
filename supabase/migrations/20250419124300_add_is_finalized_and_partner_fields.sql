-- Migration: Add is_finalized and partner_id fields to trek_events for workflow control

ALTER TABLE public.trek_events
  ADD COLUMN IF NOT EXISTS is_finalized boolean DEFAULT false;

-- partner_id already exists, but ensure it is nullable and used for external micro-community linkage
ALTER TABLE public.trek_events
  ALTER COLUMN partner_id DROP NOT NULL;

-- Add index for fast filtering
CREATE INDEX IF NOT EXISTS idx_trek_events_is_finalized ON public.trek_events(is_finalized);
CREATE INDEX IF NOT EXISTS idx_trek_events_partner_id ON public.trek_events(partner_id);

-- Optionally, add a comment for clarity
COMMENT ON COLUMN public.trek_events.is_finalized IS 'True if trek event is fully detailed and registration requires payment/terms';
COMMENT ON COLUMN public.trek_events.partner_id IS 'Null for internal events; set for micro-community (external) events';
