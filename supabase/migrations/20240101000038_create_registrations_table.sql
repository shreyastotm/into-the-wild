-- Migration: Recreate registrations table for trek registration workflow
CREATE TABLE IF NOT EXISTS public.registrations (
    registration_id serial PRIMARY KEY,
    user_id uuid NOT NULL,
    trek_id integer NOT NULL,
    booking_datetime timestamptz DEFAULT now(),
    payment_status text DEFAULT 'Pending',
    cancellation_datetime timestamptz,
    penalty_applied numeric(10,2),
    created_at timestamptz DEFAULT now()
);

-- Indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_trek_id ON public.registrations(trek_id);

-- Grant permissions for trekker registration
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT SELECT ON public.registrations TO anon;

-- Enable RLS and allow users to register for treks
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can register for treks" ON public.registrations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their registrations" ON public.registrations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to manage all registrations
CREATE POLICY "Admins can manage all registrations" ON public.registrations
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.user_id = auth.uid() AND users.user_type = 'admin'));
