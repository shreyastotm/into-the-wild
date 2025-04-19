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

-- 3. (Optional) Allow admins or internal users to manage all events
-- Add your admin/internal user RLS policies here as needed

-- 4. Allow select for all authenticated users
CREATE POLICY "Allow select for authenticated users on trek_events" ON public.trek_events
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);
