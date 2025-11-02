-- ====================================================================
-- ADD USER CONNECTIONS TABLE
-- ====================================================================
-- This migration adds the user_connections table for social features
-- ====================================================================

BEGIN;

-- Create user_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_connections (
  connection_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Connection status
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, blocked
  connection_type VARCHAR(50) DEFAULT 'friend', -- friend, following, blocked

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,

  -- Context
  connection_source VARCHAR(100), -- search, mutual_friends, trek, gallery
  mutual_friends_count INTEGER DEFAULT 0,
  mutual_treks_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_connections_requester_id ON public.user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_addressee_id ON public.user_connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_connections_created_at ON public.user_connections(created_at);

-- Enable RLS
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own connections" ON public.user_connections;
CREATE POLICY "Users can view own connections" ON public.user_connections
  FOR SELECT USING (
    auth.uid() = requester_id OR 
    auth.uid() = addressee_id OR 
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can create connection requests" ON public.user_connections;
CREATE POLICY "Users can create connection requests" ON public.user_connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update own connections" ON public.user_connections;
CREATE POLICY "Users can update own connections" ON public.user_connections
  FOR UPDATE USING (
    auth.uid() = requester_id OR 
    auth.uid() = addressee_id OR 
    public.is_admin(auth.uid())
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_connections TO authenticated;

COMMIT;


