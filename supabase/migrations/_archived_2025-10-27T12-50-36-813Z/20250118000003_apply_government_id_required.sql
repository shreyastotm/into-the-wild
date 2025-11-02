-- Apply the government_id_required column to trek_events table
-- This fixes the schema sync issue

-- Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'trek_events'
        AND column_name = 'government_id_required'
    ) THEN
        ALTER TABLE public.trek_events ADD COLUMN government_id_required BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN public.trek_events.government_id_required IS 'Whether this trek requires government ID verification for participants (for ticket booking, permits, etc.)';
    END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_trek_events_government_id_required ON public.trek_events(government_id_required);

-- Ensure registration ID verification fields exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'trek_registrations'
        AND column_name = 'id_verification_status'
    ) THEN
        ALTER TABLE public.trek_registrations
        ADD COLUMN id_verification_status VARCHAR(20) DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'trek_registrations'
        AND column_name = 'id_verification_notes'
    ) THEN
        ALTER TABLE public.trek_registrations
        ADD COLUMN id_verification_notes TEXT;
    END IF;
END $$;

-- Create index for ID verification status
CREATE INDEX IF NOT EXISTS idx_trek_registrations_id_verification_status ON public.trek_registrations(id_verification_status);
