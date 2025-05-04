-- Migration: Create trek_registrations table

-- Ensure payment_status enum exists (if not already created)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('Pending', 'Paid', 'Cancelled', 'Refunded'); -- Add Refunded if needed
    END IF;
END$$;

-- Create the trek_registrations table (Matching live schema BEFORE ...0003 migration)
CREATE TABLE public.trek_registrations (
    registration_id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL 
        REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    -- Assuming user_id references auth.users(id) as fixed in later migrations
    -- If it should reference public.users initially, change the REFERENCES clause
    user_id UUID NOT NULL 
        REFERENCES auth.users(id) ON DELETE CASCADE, 
    booking_datetime TIMESTAMPTZ DEFAULT NOW(),
    -- payment_status is NOT included here as it's missing in the provided base schema
    cancellation_datetime TIMESTAMPTZ NULL,
    penalty_applied NUMERIC(10, 2) NULL,
    -- Add other relevant columns if known, e.g., notes, payment_details_id, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
    -- updated_at is NOT included here as it's missing in the provided base schema
);

-- Add comments for clarity
COMMENT ON TABLE public.trek_registrations IS 'Records user registrations for specific trek events.';
-- COMMENT ON COLUMN public.trek_registrations.payment_status IS 'Tracks the payment status for the registration.'; -- Removed comment

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trek_registrations_trek_id ON public.trek_registrations(trek_id);
CREATE INDEX IF NOT EXISTS idx_trek_registrations_user_id ON public.trek_registrations(user_id);

-- Enable Row Level Security
ALTER TABLE public.trek_registrations ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Adjust as needed - Note: Some may rely on payment_status if added later)

-- Admins can manage all registrations
CREATE POLICY "Admin users can manage all registrations"
ON public.trek_registrations
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.user_type = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.user_type = 'admin'
    )
);

-- Users can view their own registrations
CREATE POLICY "Users can view their own registrations"
ON public.trek_registrations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own registrations
CREATE POLICY "Users can insert their own registrations"
ON public.trek_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Example policy that requires payment_status (commented out as column is missing)
-- CREATE POLICY "Users can update their own pending registrations"
-- ON public.trek_registrations
-- FOR UPDATE
-- USING (auth.uid() = user_id AND payment_status = 'Pending'); 