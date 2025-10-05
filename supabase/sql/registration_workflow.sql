-- Registration workflow RPCs and policies

-- Ensure columns exist
ALTER TABLE public.trek_registrations
  ADD COLUMN IF NOT EXISTS verified_by UUID,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

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

-- RLS policies (idempotent)
ALTER TABLE public.trek_registrations ENABLE ROW LEVEL SECURITY;

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


