-- Migration: Fix type casting in trek_events RLS policies for UUID user_id
DROP POLICY IF EXISTS "trek_lead can insert all trek_events" ON public.trek_events;
DROP POLICY IF EXISTS "trek_lead can update all trek_events" ON public.trek_events;
DROP POLICY IF EXISTS "trek_lead can delete all trek_events" ON public.trek_events;
DROP POLICY IF EXISTS "trek_lead can select all trek_events" ON public.trek_events;
DROP POLICY IF EXISTS "Only trek_lead can insert internal events" ON public.trek_events;
DROP POLICY IF EXISTS "Only trek_lead can update internal events" ON public.trek_events;
DROP POLICY IF EXISTS "Only trek_lead can delete internal events" ON public.trek_events;

CREATE POLICY "trek_lead can insert all trek_events" ON public.trek_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.roles_assignments r
      WHERE r.user_id = auth.uid()
        AND r.role_type = 'trek_lead'
    )
  );

CREATE POLICY "trek_lead can update all trek_events" ON public.trek_events
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.roles_assignments r
      WHERE r.user_id = auth.uid()
        AND r.role_type = 'trek_lead'
    )
  );

CREATE POLICY "trek_lead can delete all trek_events" ON public.trek_events
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.roles_assignments r
      WHERE r.user_id = auth.uid()
        AND r.role_type = 'trek_lead'
    )
  );

CREATE POLICY "trek_lead can select all trek_events" ON public.trek_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.roles_assignments r
      WHERE r.user_id = auth.uid()
        AND r.role_type = 'trek_lead'
    )
  );

CREATE POLICY "Only trek_lead can insert internal events" ON public.trek_events
  FOR INSERT TO authenticated
  WITH CHECK (
    event_creator_type = 'internal'
    AND EXISTS (
      SELECT 1 FROM public.roles_assignments r
      WHERE r.user_id = auth.uid()
        AND r.role_type = 'trek_lead'
    )
  );

CREATE POLICY "Only trek_lead can update internal events" ON public.trek_events
  FOR UPDATE TO authenticated
  USING (
    event_creator_type = 'internal'
    AND EXISTS (
      SELECT 1 FROM public.roles_assignments r
      WHERE r.user_id = auth.uid()
        AND r.role_type = 'trek_lead'
    )
  );

CREATE POLICY "Only trek_lead can delete internal events" ON public.trek_events
  FOR DELETE TO authenticated
  USING (
    event_creator_type = 'internal'
    AND EXISTS (
      SELECT 1 FROM public.roles_assignments r
      WHERE r.user_id = auth.uid()
        AND r.role_type = 'trek_lead'
    )
  );
