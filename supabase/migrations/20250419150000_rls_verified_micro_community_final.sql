-- Final fix: Drop and recreate policies for trek_events (no DO block, no system catalog queries)
DROP POLICY IF EXISTS "Verified micro-community can insert trek_events" ON public.trek_events;
DROP POLICY IF EXISTS "Verified micro-community can update their trek_events" ON public.trek_events;
DROP POLICY IF EXISTS "Allow select for authenticated users on trek_events" ON public.trek_events;

CREATE POLICY "Verified micro-community can insert trek_events" ON public.trek_events
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      auth.uid() IS NOT NULL
      AND event_creator_type = 'external'
      AND (
        SELECT COUNT(1) FROM public.users u
        WHERE u.user_id = auth.uid()
          AND u.user_type = 'micro_community'
          AND u.verification_status = 'verified'
          AND u.indemnity_accepted = true
          AND CAST(u.partner_id AS INTEGER) = trek_events.partner_id
      ) = 1
    )
  );

CREATE POLICY "Verified micro-community can update their trek_events" ON public.trek_events
  FOR UPDATE TO authenticated
  USING (
    event_creator_type = 'external'
    AND (
      SELECT COUNT(1) FROM public.users u
      WHERE u.user_id = auth.uid()
        AND u.user_type = 'micro_community'
        AND u.verification_status = 'verified'
        AND u.indemnity_accepted = true
        AND CAST(u.partner_id AS INTEGER) = trek_events.partner_id
    ) = 1
  );

CREATE POLICY "Allow select for authenticated users on trek_events" ON public.trek_events
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);
