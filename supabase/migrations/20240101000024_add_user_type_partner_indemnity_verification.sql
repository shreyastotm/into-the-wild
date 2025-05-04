-- Migration: Add user_type, partner_id, indemnity, and verification to users table

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS user_type text,
  ADD COLUMN IF NOT EXISTS partner_id text,
  ADD COLUMN IF NOT EXISTS indemnity_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS indemnity_accepted_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_docs jsonb;

-- Optionally, add comments for clarity
COMMENT ON COLUMN public.users.user_type IS 'admin, micro_community, or trekker';
COMMENT ON COLUMN public.users.partner_id IS 'Set for micro-community users, null otherwise';
COMMENT ON COLUMN public.users.indemnity_accepted IS 'True if user has accepted indemnity form';
COMMENT ON COLUMN public.users.indemnity_accepted_at IS 'Timestamp when indemnity was accepted';
COMMENT ON COLUMN public.users.verification_status IS 'pending, verified, or rejected';
COMMENT ON COLUMN public.users.verification_docs IS 'JSON array of uploaded verification documents';
