-- ====================================================================
-- ADD PROFILE COMPLETION TABLE (FOR REMOTE DATABASE)
-- ====================================================================
-- Apply this SQL directly in Supabase SQL Editor if migration push fails
-- ====================================================================

BEGIN;

-- Create profile_completion table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profile_completion (
  completion_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL, -- 'avatar', 'bio', 'interests', 'verification', 'social'

  -- Progress tracking
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'skipped'
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,

  -- Behavioral data
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_to_complete INTEGER, -- seconds

  -- Psychology triggers
  trigger_used VARCHAR(100), -- social_proof, urgency, personalization
  nudge_id UUID REFERENCES public.nudges(nudge_id),

  -- Rewards and unlocks
  rewards_unlocked JSONB DEFAULT '[]',
  features_unlocked JSONB DEFAULT '[]',

  -- User feedback
  helpful_rating INTEGER CHECK (helpful_rating >= 1 AND helpful_rating <= 5),
  improvement_suggestions TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, stage)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_completion_user_id ON public.profile_completion(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_completion_stage ON public.profile_completion(stage);
CREATE INDEX IF NOT EXISTS idx_profile_completion_status ON public.profile_completion(status);

-- Enable RLS
ALTER TABLE public.profile_completion ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage their own profile completion" ON public.profile_completion;
CREATE POLICY "Users can manage their own profile completion" ON public.profile_completion
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profile completion" ON public.profile_completion;
CREATE POLICY "Admins can view all profile completion" ON public.profile_completion
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.profile_completion TO authenticated;

COMMIT;

