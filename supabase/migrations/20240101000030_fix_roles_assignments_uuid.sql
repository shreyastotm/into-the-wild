-- Migration: Fix roles_assignments.user_id type to UUID
DROP TABLE IF EXISTS public.roles_assignments CASCADE;
CREATE TABLE public.roles_assignments (
    role_id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid NOT NULL,
    trek_id integer,
    role_type role_type NOT NULL,
    assignment_details jsonb,
    community_vote_score numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX idx_roles_assignments_user_id_role_type ON public.roles_assignments (user_id, role_type);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles_assignments TO authenticated;
GRANT SELECT ON public.roles_assignments TO anon;
