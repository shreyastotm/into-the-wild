-- Registration workflow RPCs and policies

-- Ensure columns exist
ALTER TABLE public.trek_registrations
  ADD COLUMN IF NOT EXISTS verified_by UUID,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Transport: user opt-in and registration driver fields
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS transport_volunteer_opt_in BOOLEAN DEFAULT false;

ALTER TABLE public.trek_registrations
  ADD COLUMN IF NOT EXISTS is_driver BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS offered_seats INTEGER,
  ADD COLUMN IF NOT EXISTS pickup_area TEXT,
  ADD COLUMN IF NOT EXISTS preferred_pickup_time TEXT;

-- Transport: event-level plan (JSONB for flexibility)
ALTER TABLE public.trek_events
  ADD COLUMN IF NOT EXISTS transport_plan JSONB;

-- is_admin helper (idempotent)
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = user_id_param AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Approve RPC
CREATE OR REPLACE FUNCTION public.approve_registration(registration_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.trek_registrations
  SET payment_status = 'Approved', verified_by = auth.uid(), verified_at = now(), rejection_reason = NULL
  WHERE registration_id = registration_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.approve_registration(INTEGER) TO authenticated;

-- Reject RPC
CREATE OR REPLACE FUNCTION public.reject_registration(registration_id_param INTEGER, reason_param TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.trek_registrations
  SET payment_status = 'Rejected', verified_by = auth.uid(), verified_at = now(), rejection_reason = reason_param
  WHERE registration_id = registration_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.reject_registration(INTEGER, TEXT) TO authenticated;

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_trek_regs_status_trek ON public.trek_registrations(payment_status, trek_id);

-- Transport assignments table
CREATE TABLE IF NOT EXISTS public.trek_transport_assignments (
  id BIGSERIAL PRIMARY KEY,
  trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
  driver_user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  passenger_user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  seats_reserved INTEGER NOT NULL DEFAULT 1,
  pickup_point TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_tta_trek ON public.trek_transport_assignments(trek_id);
CREATE INDEX IF NOT EXISTS idx_tta_driver ON public.trek_transport_assignments(driver_user_id);
CREATE INDEX IF NOT EXISTS idx_tta_passenger ON public.trek_transport_assignments(passenger_user_id);

-- RLS policies (idempotent)
ALTER TABLE public.trek_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_transport_assignments ENABLE ROW LEVEL SECURITY;

-- Allow user to see own registrations
DROP POLICY IF EXISTS "Users can view own registrations" ON public.trek_registrations;
CREATE POLICY "Users can view own registrations" ON public.trek_registrations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin can view all
DROP POLICY IF EXISTS "Admin can view all registrations" ON public.trek_registrations;
CREATE POLICY "Admin can view all registrations" ON public.trek_registrations
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Users can create their own registration
DROP POLICY IF EXISTS "Users can create registration" ON public.trek_registrations;
CREATE POLICY "Users can create registration" ON public.trek_registrations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update own proof fields
DROP POLICY IF EXISTS "Users can upload proof" ON public.trek_registrations;
CREATE POLICY "Users can upload proof" ON public.trek_registrations
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (payment_status IS NULL OR payment_status IN ('Requested','ProofUploaded','Pending'))
  );

-- Admin can update moderation fields
DROP POLICY IF EXISTS "Admin can moderate registrations" ON public.trek_registrations;
CREATE POLICY "Admin can moderate registrations" ON public.trek_registrations
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Transport assignments RLS
DROP POLICY IF EXISTS "Users can view own transport assignments" ON public.trek_transport_assignments;
CREATE POLICY "Users can view own transport assignments" ON public.trek_transport_assignments
  FOR SELECT TO authenticated
  USING (
    driver_user_id = auth.uid() OR passenger_user_id = auth.uid() OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin can manage transport assignments" ON public.trek_transport_assignments;
CREATE POLICY "Admin can manage transport assignments" ON public.trek_transport_assignments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Drivers can remove own passengers" ON public.trek_transport_assignments;
CREATE POLICY "Drivers can remove own passengers" ON public.trek_transport_assignments
  FOR DELETE TO authenticated
  USING (driver_user_id = auth.uid());

