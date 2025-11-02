-- ====================================================================
-- ADD USER POSTS AND POST REACTIONS TABLES
-- ====================================================================
-- This migration adds user_posts and post_reactions tables for social features
-- ====================================================================

BEGIN;

-- Ensure user_connections table exists first (required dependency for RLS policy)
-- This will be a no-op if the table already exists from previous migrations
CREATE TABLE IF NOT EXISTS public.user_connections (
  connection_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  connection_type VARCHAR(50) DEFAULT 'friend',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,
  connection_source VARCHAR(100),
  mutual_friends_count INTEGER DEFAULT 0,
  mutual_treks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_user_connections_requester_id ON public.user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_addressee_id ON public.user_connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);

-- Enable RLS for user_connections
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_connections (only if they don't exist)
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

GRANT SELECT, INSERT, UPDATE ON public.user_connections TO authenticated;

-- ====================================================================

-- Create user_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_posts (
  post_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]', -- Array of image/video URLs
  post_type VARCHAR(50) DEFAULT 'text', -- text, image, video, trek_share

  -- Trek association (for trek-related posts)
  trek_id INTEGER REFERENCES public.trek_events(trek_id) ON DELETE SET NULL,
  registration_id INTEGER REFERENCES public.trek_registrations(registration_id) ON DELETE SET NULL,

  -- Engagement metrics
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Visibility and privacy
  visibility VARCHAR(50) DEFAULT 'friends', -- public, friends, private
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Location context
  location_name VARCHAR(255),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  -- Metadata
  tags JSONB DEFAULT '[]', -- Array of user tags { user_id, x, y }
  mentions JSONB DEFAULT '[]', -- Array of @mentions

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_reactions (
  reaction_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.user_posts(post_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Reaction details
  reaction_type VARCHAR(50) NOT NULL, -- like, love, laugh, wow, sad, angry
  emoji VARCHAR(10),

  -- Context
  reacted_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(post_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_posts_user_id ON public.user_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_trek_id ON public.user_posts(trek_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_visibility ON public.user_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_user_posts_created_at ON public.user_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);

-- Enable RLS
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_posts
DROP POLICY IF EXISTS "Users can view own posts and friends public posts" ON public.user_posts;
CREATE POLICY "Users can view own posts and friends public posts" ON public.user_posts
  FOR SELECT USING (
    auth.uid() = user_id OR 
    visibility = 'public' OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.user_connections
      WHERE (requester_id = auth.uid() AND addressee_id = user_posts.user_id)
         OR (addressee_id = auth.uid() AND requester_id = user_posts.user_id)
      AND status = 'accepted'
    )) OR
    public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can create own posts" ON public.user_posts;
CREATE POLICY "Users can create own posts" ON public.user_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.user_posts;
CREATE POLICY "Users can update own posts" ON public.user_posts
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can delete own posts" ON public.user_posts;
CREATE POLICY "Users can delete own posts" ON public.user_posts
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Create RLS policies for post_reactions
DROP POLICY IF EXISTS "Users can view all reactions" ON public.post_reactions;
CREATE POLICY "Users can view all reactions" ON public.post_reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own reactions" ON public.post_reactions;
CREATE POLICY "Users can create own reactions" ON public.post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reactions" ON public.post_reactions;
CREATE POLICY "Users can delete own reactions" ON public.post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_posts TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.post_reactions TO authenticated;

COMMIT;

