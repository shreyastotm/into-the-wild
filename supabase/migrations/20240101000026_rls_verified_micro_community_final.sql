-- Final fix: Drop and recreate policies for trek_events (no DO block, no system catalog queries)
DROP POLICY IF EXISTS "Verified micro-community can insert trek_events" ON public.trek_events;
DROP POLICY IF EXISTS "Verified micro-community can update their trek_events" ON public.trek_events;
DROP POLICY IF EXISTS "Allow select for authenticated users on trek_events" ON public.trek_events;

CREATE POLICY "Verified micro-community can insert trek_events" ON public.trek_events
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      auth.uid() IS NOT NULL
      AND trek_events.partner_id IS NOT NULL
      AND (
        SELECT COUNT(1) FROM public.users u
        WHERE u.user_id = auth.uid()
          AND u.user_type = 'micro_community'
          AND u.verification_status = 'verified'
          AND u.partner_id::uuid = trek_events.partner_id
      ) = 1
    )
  );

CREATE POLICY "Verified micro-community can update their trek_events" ON public.trek_events
  FOR UPDATE TO authenticated
  USING (
    (
      auth.uid() IS NOT NULL
      AND trek_events.partner_id IS NOT NULL
      AND (
        SELECT COUNT(1) FROM public.users u
        WHERE u.user_id = auth.uid()
          AND u.user_type = 'micro_community'
          AND u.verification_status = 'verified'
          AND u.partner_id::uuid = trek_events.partner_id
      ) = 1
    )
  )
  WITH CHECK (
     (
      auth.uid() IS NOT NULL
      AND trek_events.partner_id IS NOT NULL
      AND (
        SELECT COUNT(1) FROM public.users u
        WHERE u.user_id = auth.uid()
          AND u.user_type = 'micro_community'
          AND u.verification_status = 'verified'
          AND u.partner_id::uuid = trek_events.partner_id
      ) = 1
    )
  );

CREATE POLICY "Allow select for authenticated users on trek_events" ON public.trek_events
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- -- RLS for verified micro_community users on trek_events created by internal admins --
DROP POLICY IF EXISTS "Allow read access to admin trek events for verified micro_community users" ON public.trek_events;
CREATE POLICY "Allow read access to admin trek events for verified micro_community users" ON public.trek_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.user_id = auth.uid()
        AND u.user_type = 'micro_community'
        AND u.verification_status = 'verified'
    ) AND trek_events.partner_id IS NULL -- Check event is created by admin
  );

-- -- RLS for allowing verified micro_community users to INSERT into trek_registrations for admin events --
DROP POLICY IF EXISTS "Allow micro_community user insert into trek_registrations for admin events" ON public.trek_registrations;
CREATE POLICY "Allow micro_community user insert into trek_registrations for admin events" ON public.trek_registrations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.trek_events te ON te.trek_id = trek_registrations.trek_id
      WHERE u.user_id = auth.uid()
        AND u.user_type = 'micro_community'
        AND u.verification_status = 'verified'
        AND te.partner_id IS NULL -- Check event is created by admin
        AND te.status = 'open' -- Ensure event is open for registration
    )
  );

-- -- RLS for allowing verified micro_community users to UPDATE their OWN trek_registrations for admin events (e.g., cancel) --
DROP POLICY IF EXISTS "Allow micro_community user update own trek_registrations for admin events" ON public.trek_registrations;
CREATE POLICY "Allow micro_community user update own trek_registrations for admin events" ON public.trek_registrations
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.trek_events te ON te.trek_id = trek_registrations.trek_id
      WHERE u.user_id = auth.uid()
        AND u.user_type = 'micro_community'
        AND u.verification_status = 'verified'
        AND te.partner_id IS NULL -- Check event is created by admin
    )
  );
