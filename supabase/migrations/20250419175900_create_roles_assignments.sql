-- Migration: Recreate roles_assignments table for admin/role RLS
CREATE TABLE IF NOT EXISTS public.roles_assignments (
    role_id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id integer NOT NULL,
    trek_id integer,
    role_type role_type NOT NULL,
    assignment_details jsonb,
    community_vote_score numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_roles_assignments_user_id_role_type ON public.roles_assignments (user_id, role_type);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles_assignments TO authenticated;
GRANT SELECT ON public.roles_assignments TO anon;

-- Defensive: Only drop policies on trek_packing_lists if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_packing_lists') THEN
        DROP POLICY IF EXISTS "Allow insert for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
        DROP POLICY IF EXISTS "Allow select for authenticated users on trek_packing_lists" ON public.trek_packing_lists;
    END IF;
END $$;
