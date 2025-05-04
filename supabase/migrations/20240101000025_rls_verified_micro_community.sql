-- RLS Policy: Only allow verified, indemnity-accepted micro-community users to create or update their own trek_events
-- Assumptions:
--   - public.users.user_id is a UUID and foreign key to auth.users.id
--   - trek_events.partner_id is an integer (matches partners.partner_id), and users.partner_id is text (community code or similar)
--   - auth.uid() returns the UUID of the logged-in user

-- 1. Enable RLS if not already enabled
ALTER TABLE public.trek_events ENABLE ROW LEVEL SECURITY;

-- 2. Allow only verified, indemnity-accepted micro-community users to insert/update trek_events for their partner
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

-- 3. (Optional) Allow admins or internal users to manage all events
-- Add your admin/internal user RLS policies here as needed

-- 4. Allow select for all authenticated users
CREATE POLICY "Allow select for authenticated users on trek_events" ON public.trek_events
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- RLS for verified micro_community users on trek_events created by partners
DROP POLICY IF EXISTS "Allow read access to partner trek events for verified micro_community users" ON public.trek_events;
CREATE POLICY "Allow read access to partner trek events for verified micro_community users" ON public.trek_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.user_id = auth.uid()
        AND u.user_type = 'micro_community'
        AND u.verification_status = 'verified'
        AND u.partner_id IS NOT NULL
        AND trek_events.partner_id IS NOT NULL -- Ensure event partner_id is not null for comparison
        AND u.partner_id::uuid = trek_events.partner_id -- Cast user's partner_id text to UUID for comparison
    )
  );

-- RLS for allowing verified micro_community users to INSERT into trek_registrations for partner events
DROP POLICY IF EXISTS "Allow micro_community user insert into trek_registrations for partner events" ON public.trek_registrations;
CREATE POLICY "Allow micro_community user insert into trek_registrations for partner events" ON public.trek_registrations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.trek_events te ON te.trek_id = trek_registrations.trek_id
      WHERE u.user_id = auth.uid()
        AND u.user_type = 'micro_community'
        AND u.verification_status = 'verified'
        AND u.partner_id IS NOT NULL
        AND te.partner_id IS NOT NULL -- Ensure event partner_id is not null
        AND u.partner_id::uuid = te.partner_id -- Cast user's partner_id text to UUID
        AND te.status = 'open'
    )
  );

-- RLS for allowing verified micro_community users to UPDATE their OWN trek_registrations for partner events (e.g., cancel)
DROP POLICY IF EXISTS "Allow micro_community user update own trek_registrations for partner events" ON public.trek_registrations;
CREATE POLICY "Allow micro_community user update own trek_registrations for partner events" ON public.trek_registrations
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
        AND u.partner_id IS NOT NULL
        AND te.partner_id IS NOT NULL -- Ensure event partner_id is not null
        AND u.partner_id::uuid = te.partner_id -- Cast user's partner_id text to UUID
    )
  );
