-- ====================================================================
-- ADD PROFILE MILESTONES TABLE
-- ====================================================================
-- This migration adds the profile_milestones table that is expected
-- by the useProfileCompletion hook.
-- ====================================================================

BEGIN;

-- Create profile_milestones table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profile_milestones (
  milestone_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Milestone details
  milestone_type VARCHAR(100) NOT NULL, -- first_trek, friend_added, profile_complete
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),

  -- Achievement data
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER DEFAULT 0,
  badge_earned VARCHAR(100),

  -- Context
  related_entity_type VARCHAR(50), -- trek, friend, profile
  related_entity_id INTEGER,

  -- Celebration data
  celebration_shown BOOLEAN DEFAULT false,
  toast_shown BOOLEAN DEFAULT false,
  confetti_triggered BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_milestones_user_id ON public.profile_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_milestones_milestone_type ON public.profile_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_profile_milestones_achieved_at ON public.profile_milestones(achieved_at);

-- Enable RLS
ALTER TABLE public.profile_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can manage their own milestones" ON public.profile_milestones;
CREATE POLICY "Users can manage their own milestones" ON public.profile_milestones
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all milestones" ON public.profile_milestones;
CREATE POLICY "Admins can view all milestones" ON public.profile_milestones
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.profile_milestones TO authenticated;

COMMIT;

