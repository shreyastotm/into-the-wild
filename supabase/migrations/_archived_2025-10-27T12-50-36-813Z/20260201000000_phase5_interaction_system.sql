-- ====================================================================
-- PHASE 5: INTERACTION SYSTEM MIGRATION
-- ====================================================================
-- This migration adds sophisticated communication features:
-- 1. Nudge system (behavioral psychology-driven prompts)
-- 2. Profile completion funnel (gamified onboarding)
-- 3. Enhanced toast/notification hierarchy
-- 4. Social features foundation (friends, posts, tagging)
-- 5. User interaction analytics
-- 6. Transition state management
--
-- This migration is designed to work with the existing squashed schema
-- ====================================================================

BEGIN;

-- ====================================================================
-- PHASE 5A: NUDGE SYSTEM (Behavioral Psychology)
-- ====================================================================

-- Check if types already exist before creating them
DO $$
BEGIN
    -- Create nudge system types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nudge_type_enum') THEN
        CREATE TYPE public.nudge_type_enum AS ENUM (
          'contextual', 'milestone', 'social_proof', 'urgency', 'recurring'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nudge_trigger_enum') THEN
        CREATE TYPE public.nudge_trigger_enum AS ENUM (
          'onboarding', 'engagement', 'retention', 'conversion', 'social'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nudge_priority_enum') THEN
        CREATE TYPE public.nudge_priority_enum AS ENUM (
          'low', 'medium', 'high', 'critical'
        );
    END IF;

    -- Create profile completion types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_stage_enum') THEN
        CREATE TYPE public.profile_stage_enum AS ENUM (
          'avatar', 'bio', 'interests', 'verification', 'social'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_completion_status_enum') THEN
        CREATE TYPE public.profile_completion_status_enum AS ENUM (
          'not_started', 'in_progress', 'completed', 'skipped'
        );
    END IF;

    -- Create toast variant types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'toast_variant_enum') THEN
        CREATE TYPE public.toast_variant_enum AS ENUM (
          'success', 'error', 'info', 'warning', 'milestone', 'celebration', 'nudge', 'social'
        );
    END IF;
END $$;

-- Nudges table (contextual prompts with behavioral psychology)
CREATE TABLE IF NOT EXISTS public.nudges (
  nudge_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  nudge_type public.nudge_type_enum NOT NULL,
  trigger_type public.nudge_trigger_enum NOT NULL,
  priority public.nudge_priority_enum DEFAULT 'medium',

  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(100), -- Lucide icon name
  cta_label VARCHAR(100),
  cta_action VARCHAR(500), -- JSON: { type: 'navigate', path: '/profile' }

  -- Behavioral targeting
  condition_rules JSONB NOT NULL, -- Complex conditions for when to show
  frequency_rules JSONB NOT NULL, -- How often to show (once, daily, weekly)

  -- Display settings
  display_position VARCHAR(50) DEFAULT 'toast', -- toast, modal, banner, inline
  animation VARCHAR(50) DEFAULT 'fade',
  delay_seconds INTEGER DEFAULT 0,

  -- Status and tracking
  is_active BOOLEAN DEFAULT true,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  shown_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  dismissed_count INTEGER DEFAULT 0,
  last_shown_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nudge analytics for optimization
CREATE TABLE IF NOT EXISTS public.nudge_analytics (
  analytics_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nudge_id UUID NOT NULL REFERENCES public.nudges(nudge_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Event tracking
  event_type VARCHAR(50) NOT NULL, -- shown, clicked, dismissed, expired
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Context data
  user_agent TEXT,
  viewport_size VARCHAR(20),
  current_page VARCHAR(255),
  session_duration INTEGER, -- seconds
  time_since_signup INTEGER, -- days

  -- Device context
  device_type VARCHAR(50),
  is_mobile BOOLEAN,
  screen_resolution VARCHAR(20),

  -- Behavioral context
  profile_completion DECIMAL(3,2), -- 0.00 to 1.00
  days_since_last_activity INTEGER,
  total_treks_completed INTEGER,
  friends_count INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PHASE 5B: PROFILE COMPLETION FUNNEL
-- ====================================================================

-- Profile completion stages enum
CREATE TYPE public.profile_stage_enum AS ENUM (
  'avatar',           -- 20%: Make it personal
  'bio',             -- 40%: Tell your story
  'interests',       -- 60%: What excites you?
  'verification',    -- 80%: Build trust
  'social'           -- 100%: Connect with friends
);

-- Profile completion status
CREATE TYPE public.profile_completion_status_enum AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'skipped'
);

-- Profile completion tracking
CREATE TABLE IF NOT EXISTS public.profile_completion (
  completion_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  stage public.profile_stage_enum NOT NULL,

  -- Progress tracking
  status public.profile_completion_status_enum DEFAULT 'not_started',
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

-- Profile completion milestones
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

-- ====================================================================
-- PHASE 5C: ENHANCED NOTIFICATION SYSTEM
-- ====================================================================

-- Toast/Notification variants for different contexts
CREATE TYPE public.toast_variant_enum AS ENUM (
  'success',      -- Green, checkmark, positive actions
  'error',        -- Red, alert, failures
  'info',         -- Blue, info circle, neutral info
  'warning',      -- Yellow, alert triangle, cautions
  'milestone',    -- Golden gradient, trophy, achievements
  'celebration',  -- Purple/pink gradient, sparkles, big wins
  'nudge',        -- Subtle, contextual prompts
  'social'        -- Teal, users icon, friend activities
);

-- Enhanced notifications with sophisticated messaging
CREATE TABLE IF NOT EXISTS public.enhanced_notifications (
  notification_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Content
  variant public.toast_variant_enum NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(100),

  -- Actions and navigation
  primary_action JSONB, -- { label: string, action: string, path: string }
  secondary_action JSONB,

  -- Display configuration
  display_position VARCHAR(50) DEFAULT 'top-right',
  duration INTEGER DEFAULT 5000, -- milliseconds, -1 for persistent
  animation VARCHAR(50) DEFAULT 'fade',

  -- Context and targeting
  context_data JSONB DEFAULT '{}',
  trigger_event VARCHAR(100),
  related_entity_type VARCHAR(50),
  related_entity_id INTEGER,

  -- User interaction
  status VARCHAR(50) DEFAULT 'pending', -- pending, shown, clicked, dismissed
  shown_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Analytics
  impression_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  dismiss_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4),

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  priority INTEGER DEFAULT 5, -- 1-10 scale

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Toast session tracking (for optimizing timing)
CREATE TABLE IF NOT EXISTS public.toast_sessions (
  session_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Session context
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  device_type VARCHAR(50),
  is_mobile BOOLEAN,

  -- User state
  profile_completion DECIMAL(3,2),
  current_page VARCHAR(255),
  time_since_signup INTEGER,

  -- Toast activity
  toasts_shown INTEGER DEFAULT 0,
  toasts_clicked INTEGER DEFAULT 0,
  toasts_dismissed INTEGER DEFAULT 0,

  -- Effectiveness metrics
  engagement_rate DECIMAL(5,4),
  optimal_timing JSONB, -- Learned optimal times to show toasts

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PHASE 5D: SOCIAL FEATURES FOUNDATION
-- ====================================================================

-- User connections (friends system)
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

-- User posts (social media foundation)
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
  coordinates POINT,

  -- Metadata
  tags JSONB DEFAULT '[]', -- Array of user tags { user_id, x, y }
  mentions JSONB DEFAULT '[]', -- Array of @mentions

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post reactions (likes, loves, etc.)
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

-- Image tagging (friend tagging on photos)
CREATE TABLE IF NOT EXISTS public.image_tags (
  tag_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID NOT NULL REFERENCES public.user_trek_images(image_id) ON DELETE CASCADE,
  tagged_by UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  tagged_user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Tag position on image
  x_position DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00 (percentage)
  y_position DECIMAL(5,2) NOT NULL,

  -- Tag context
  tag_type VARCHAR(50) DEFAULT 'person', -- person, location, object
  confidence_score DECIMAL(3,2), -- AI confidence if auto-tagged

  -- Status
  is_approved BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES public.users(user_id),
  approved_at TIMESTAMPTZ,

  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(image_id, tagged_user_id)
);

-- ====================================================================
-- PHASE 5E: USER INTERACTION ANALYTICS
-- ====================================================================

-- User interaction events (for behavioral analysis)
CREATE TABLE IF NOT EXISTS public.user_interactions (
  interaction_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  event_data JSONB DEFAULT '{}',

  -- Context
  session_id VARCHAR(255),
  current_page VARCHAR(255),
  previous_page VARCHAR(255),
  time_spent INTEGER, -- seconds on page

  -- Device and environment
  device_type VARCHAR(50),
  browser VARCHAR(100),
  viewport_size VARCHAR(20),
  is_mobile BOOLEAN,

  -- User state
  profile_completion DECIMAL(3,2),
  days_since_signup INTEGER,
  total_treks INTEGER,
  friends_count INTEGER,

  -- Engagement metrics
  scroll_depth DECIMAL(5,2), -- 0.00 to 1.00
  clicks_count INTEGER DEFAULT 0,
  form_interactions INTEGER DEFAULT 0,

  -- Performance
  load_time INTEGER, -- milliseconds
  error_occurred BOOLEAN DEFAULT false,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transition state tracking
CREATE TABLE IF NOT EXISTS public.transition_states (
  state_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Transition context
  from_page VARCHAR(255),
  to_page VARCHAR(255),
  transition_type VARCHAR(100), -- navigation, modal, toast, nudge

  -- Animation and UX
  animation_used VARCHAR(100),
  duration INTEGER, -- milliseconds
  easing_function VARCHAR(50),

  -- User experience
  was_smooth BOOLEAN DEFAULT true,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  feedback TEXT,

  -- Performance metrics
  render_time INTEGER,
  memory_usage INTEGER,
  frame_rate DECIMAL(4,1),

  -- Context
  device_type VARCHAR(50),
  connection_speed VARCHAR(50),
  viewport_size VARCHAR(20),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preference profiles (for personalization)
CREATE TABLE IF NOT EXISTS public.user_preference_profiles (
  profile_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Communication preferences
  nudge_frequency VARCHAR(50) DEFAULT 'medium', -- low, medium, high
  toast_frequency VARCHAR(50) DEFAULT 'medium',
  notification_channels JSONB DEFAULT '["in_app", "push"]',
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  -- Behavioral preferences (learned)
  preferred_interaction_style VARCHAR(50), -- visual, textual, minimal
  animation_sensitivity VARCHAR(50), -- none, subtle, full
  loading_preference VARCHAR(50), -- skeleton, spinner, progress

  -- Content preferences
  preferred_trek_types JSONB DEFAULT '[]',
  difficulty_preference VARCHAR(50),
  group_size_preference VARCHAR(50),
  budget_range JSONB, -- { min: number, max: number }

  -- Social preferences
  social_engagement_level VARCHAR(50), -- low, medium, high
  friend_interaction_frequency VARCHAR(50),
  community_participation VARCHAR(50),

  -- Analytics and optimization
  total_interactions INTEGER DEFAULT 0,
  successful_conversions INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PHASE 5F: INDEXES FOR PERFORMANCE
-- ====================================================================

-- Nudge system indexes
CREATE INDEX IF NOT EXISTS idx_nudges_user_id ON public.nudges(user_id);
CREATE INDEX IF NOT EXISTS idx_nudges_trigger_type ON public.nudges(trigger_type);
CREATE INDEX IF NOT EXISTS idx_nudges_priority ON public.nudges(priority);
CREATE INDEX IF NOT EXISTS idx_nudges_is_active ON public.nudges(is_active);
CREATE INDEX IF NOT EXISTS idx_nudges_last_shown ON public.nudges(last_shown_at);
CREATE INDEX IF NOT EXISTS idx_nudges_display_position ON public.nudges(display_position);

-- Profile completion indexes
CREATE INDEX IF NOT EXISTS idx_profile_completion_user_id ON public.profile_completion(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_completion_stage ON public.profile_completion(stage);
CREATE INDEX IF NOT EXISTS idx_profile_completion_status ON public.profile_completion(status);
CREATE INDEX IF NOT EXISTS idx_profile_completion_percentage ON public.profile_completion(completion_percentage);

-- Enhanced notifications indexes
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_user_id ON public.enhanced_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_status ON public.enhanced_notifications(status);
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_scheduled ON public.enhanced_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_priority ON public.enhanced_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_enhanced_notifications_display_position ON public.enhanced_notifications(display_position);

-- Social features indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON public.user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_addressee ON public.user_connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_posts_user_id ON public.user_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_trek_id ON public.user_posts(trek_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_created_at ON public.user_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_user_posts_visibility ON public.user_posts(visibility);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_event_type ON public.user_interactions(event_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON public.user_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transition_states_user_id ON public.transition_states(user_id);
CREATE INDEX IF NOT EXISTS idx_toast_sessions_user_id ON public.toast_sessions(user_id);

-- ====================================================================
-- PHASE 5G: FUNCTIONS FOR INTERACTION SYSTEM
-- ====================================================================

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_uuid UUID)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_stages INTEGER := 5;
  completed_stages INTEGER := 0;
  completion_percentage DECIMAL(5,2) := 0.00;
BEGIN
  -- Check avatar completion (20%)
  IF EXISTS (SELECT 1 FROM public.users WHERE user_id = user_uuid AND avatar_url IS NOT NULL) THEN
    completed_stages := completed_stages + 1;
  END IF;

  -- Check bio completion (20%)
  IF EXISTS (SELECT 1 FROM public.users WHERE user_id = user_uuid AND bio IS NOT NULL AND length(bio) > 10) THEN
    completed_stages := completed_stages + 1;
  END IF;

  -- Check interests completion (20%)
  IF EXISTS (SELECT 1 FROM public.users WHERE user_id = user_uuid AND interests IS NOT NULL AND length(interests) > 5) THEN
    completed_stages := completed_stages + 1;
  END IF;

  -- Check verification completion (20%)
  IF EXISTS (SELECT 1 FROM public.users WHERE user_id = user_uuid AND is_verified = true) THEN
    completed_stages := completed_stages + 1;
  END IF;

  -- Check social connections (20%)
  IF EXISTS (
    SELECT 1 FROM public.user_connections
    WHERE (requester_id = user_uuid OR addressee_id = user_uuid)
    AND status = 'accepted'
    LIMIT 1
  ) THEN
    completed_stages := completed_stages + 1;
  END IF;

  -- Calculate percentage
  completion_percentage := (completed_stages::DECIMAL / total_stages::DECIMAL) * 100;

  RETURN completion_percentage;
END;
$$;

-- Function to create profile milestone
CREATE OR REPLACE FUNCTION public.create_profile_milestone(
  user_uuid UUID,
  milestone_type_param VARCHAR(100),
  title_param VARCHAR(255),
  points_param INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  milestone_uuid UUID;
BEGIN
  INSERT INTO public.profile_milestones (
    user_id,
    milestone_type,
    title,
    points_earned,
    related_entity_type,
    related_entity_id
  ) VALUES (
    user_uuid,
    milestone_type_param,
    title_param,
    points_param,
    'profile',
    (SELECT user_id FROM public.users WHERE user_id = user_uuid)
  ) RETURNING milestone_id INTO milestone_uuid;

  RETURN milestone_uuid;
END;
$$;

-- Function to track user interaction
CREATE OR REPLACE FUNCTION public.track_user_interaction(
  user_uuid UUID,
  event_type_param VARCHAR(100),
  event_name_param VARCHAR(255),
  event_data_param JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  interaction_uuid UUID;
BEGIN
  INSERT INTO public.user_interactions (
    user_id,
    event_type,
    event_name,
    event_data,
    session_id,
    current_page,
    device_type,
    is_mobile,
    profile_completion,
    days_since_signup
  ) VALUES (
    user_uuid,
    event_type_param,
    event_name_param,
    event_data_param,
    COALESCE(event_data_param->>'session_id', gen_random_uuid()::text),
    COALESCE(event_data_param->>'current_page', 'unknown'),
    CASE
      WHEN event_data_param->>'user_agent' LIKE '%Mobile%' THEN 'mobile'
      WHEN event_data_param->>'user_agent' LIKE '%Tablet%' THEN 'tablet'
      ELSE 'desktop'
    END,
    (event_data_param->>'user_agent' LIKE '%Mobile%' OR event_data_param->>'user_agent' LIKE '%Android%' OR event_data_param->>'user_agent' LIKE '%iPhone%'),
    public.calculate_profile_completion(user_uuid),
    EXTRACT(DAYS FROM (NOW() - (SELECT created_at FROM public.users WHERE user_id = user_uuid)))
  ) RETURNING interaction_id INTO interaction_uuid;

  RETURN interaction_uuid;
END;
$$;

-- Function to get active nudges for user
CREATE OR REPLACE FUNCTION public.get_active_nudges(user_uuid UUID)
RETURNS TABLE (
  nudge_id UUID,
  nudge_type public.nudge_type_enum,
  trigger_type public.nudge_trigger_enum,
  priority public.nudge_priority_enum,
  title VARCHAR(255),
  message TEXT,
  icon VARCHAR(100),
  cta_label VARCHAR(100),
  cta_action VARCHAR(500),
  display_position VARCHAR(50),
  animation VARCHAR(50),
  delay_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.nudge_id,
    n.nudge_type,
    n.trigger_type,
    n.priority,
    n.title,
    n.message,
    n.icon,
    n.cta_label,
    n.cta_action,
    n.display_position,
    n.animation,
    n.delay_seconds
  FROM public.nudges n
  WHERE n.user_id = user_uuid
    AND n.is_active = true
    AND n.is_dismissed = false
    AND (n.last_shown_at IS NULL OR n.last_shown_at < NOW() - INTERVAL '1 day')
  ORDER BY
    CASE n.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    n.created_at DESC
  LIMIT 5;
END;
$$;

-- ====================================================================
-- PHASE 5H: ENABLE ROW LEVEL SECURITY
-- ====================================================================

-- Enable RLS on all new tables
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudge_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toast_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transition_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preference_profiles ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- PHASE 5I: ROW LEVEL SECURITY POLICIES
-- ====================================================================

-- Nudges policies
CREATE POLICY "Users can view their own nudges" ON public.nudges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own nudges" ON public.nudges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create nudges for users" ON public.nudges
  FOR INSERT WITH CHECK (true);

-- Profile completion policies
CREATE POLICY "Users can manage their own profile completion" ON public.profile_completion
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profile completion" ON public.profile_completion
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Enhanced notifications policies
CREATE POLICY "Users can view their own notifications" ON public.enhanced_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.enhanced_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users" ON public.enhanced_notifications
  FOR INSERT WITH CHECK (true);

-- Social features policies
CREATE POLICY "Users can view their connections" ON public.user_connections
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can manage their connection requests" ON public.user_connections
  FOR ALL USING (auth.uid() = requester_id);

CREATE POLICY "Users can view posts from friends and public" ON public.user_posts
  FOR SELECT USING (
    auth.uid() = user_id OR
    visibility = 'public' OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.user_connections
      WHERE (requester_id = auth.uid() AND addressee_id = user_posts.user_id AND status = 'accepted') OR
            (requester_id = user_posts.user_id AND addressee_id = auth.uid() AND status = 'accepted')
    ))
  );

CREATE POLICY "Users can manage their own posts" ON public.user_posts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can react to visible posts" ON public.post_reactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_posts
      WHERE post_id = post_reactions.post_id AND (
        user_id = auth.uid() OR
        visibility = 'public' OR
        (visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.user_connections
          WHERE (requester_id = auth.uid() AND addressee_id = user_posts.user_id AND status = 'accepted') OR
                (requester_id = user_posts.user_id AND addressee_id = auth.uid() AND status = 'accepted')
        ))
      )
    )
  );

-- Image tagging policies
CREATE POLICY "Users can view tags on accessible images" ON public.image_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_trek_images uti
      JOIN public.trek_registrations tr ON tr.registration_id = uti.registration_id
      WHERE uti.image_id = image_tags.image_id AND (
        tr.user_id = auth.uid() OR
        public.is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Users can manage their own tags" ON public.image_tags
  FOR ALL USING (tagged_by = auth.uid());

-- Analytics policies (system only)
CREATE POLICY "System can manage interaction analytics" ON public.user_interactions
  FOR ALL USING (true);

CREATE POLICY "System can manage transition analytics" ON public.transition_states
  FOR ALL USING (true);

-- Preference profiles
CREATE POLICY "Users can manage their own preferences" ON public.user_preference_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- PHASE 5J: GRANT PERMISSIONS
-- ====================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.nudges TO authenticated;
GRANT SELECT, INSERT ON public.nudge_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profile_completion TO authenticated;
GRANT SELECT, INSERT ON public.profile_milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.enhanced_notifications TO authenticated;
GRANT SELECT, INSERT ON public.toast_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.image_tags TO authenticated;
GRANT SELECT, INSERT ON public.user_interactions TO authenticated;
GRANT SELECT, INSERT ON public.transition_states TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_preference_profiles TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.calculate_profile_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_milestone(UUID, VARCHAR(100), VARCHAR(255), INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_user_interaction(UUID, VARCHAR(100), VARCHAR(255), JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_nudges(UUID) TO authenticated;

-- ====================================================================
-- PHASE 5K: TRIGGERS AND AUTOMATIONS
-- ====================================================================

-- Update nudge shown timestamp
CREATE OR REPLACE FUNCTION public.update_nudge_shown()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.nudges
  SET
    shown_count = shown_count + 1,
    last_shown_at = NOW()
  WHERE nudge_id = NEW.nudge_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER nudge_analytics_shown_trigger
  AFTER INSERT ON public.nudge_analytics
  FOR EACH ROW
  WHEN (NEW.event_type = 'shown')
  EXECUTE FUNCTION public.update_nudge_shown();

-- Update profile completion when user data changes
CREATE OR REPLACE FUNCTION public.update_profile_completion_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completion_percentage DECIMAL(5,2);
BEGIN
  -- Calculate new completion percentage
  SELECT public.calculate_profile_completion(NEW.user_id) INTO completion_percentage;

  -- Update or insert profile completion record
  INSERT INTO public.profile_completion (
    user_id,
    stage,
    status,
    completion_percentage,
    updated_at
  ) VALUES (
    NEW.user_id,
    'avatar'::public.profile_stage_enum,
    CASE WHEN completion_percentage >= 20 THEN 'completed' ELSE 'in_progress' END,
    completion_percentage,
    NOW()
  )
  ON CONFLICT (user_id, stage) DO UPDATE SET
    status = CASE WHEN completion_percentage >= 20 THEN 'completed' ELSE 'in_progress' END,
    completion_percentage = completion_percentage,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profile_completion_trigger
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completion_on_change();

-- Auto-create notification when nudge is clicked
CREATE OR REPLACE FUNCTION public.create_nudge_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.event_type = 'clicked' THEN
    INSERT INTO public.enhanced_notifications (
      user_id,
      variant,
      title,
      message,
      trigger_event,
      context_data
    ) VALUES (
      NEW.user_id,
      'success'::public.toast_variant_enum,
      'Great choice! 🎉',
      'Keep exploring to unlock more features.',
      'nudge_clicked',
      jsonb_build_object('nudge_id', NEW.nudge_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER nudge_clicked_notification_trigger
  AFTER INSERT ON public.nudge_analytics
  FOR EACH ROW
  WHEN (NEW.event_type = 'clicked')
  EXECUTE FUNCTION public.create_nudge_notification();

-- ====================================================================
-- PHASE 5L: INITIAL DATA SEEDING
-- ====================================================================

-- Insert default nudges for new users
INSERT INTO public.nudges (
  user_id,
  nudge_type,
  trigger_type,
  priority,
  title,
  message,
  icon,
  cta_label,
  cta_action,
  condition_rules,
  frequency_rules,
  position,
  animation,
  delay_seconds
) VALUES
-- This will be populated by a trigger for new users, but we can add templates here
-- The actual nudge creation will happen in the application code based on user behavior

-- Seed profile stages (for reference)
INSERT INTO public.profile_completion (
  user_id,
  stage,
  status,
  completion_percentage,
  started_at
)
SELECT
  user_id,
  'avatar'::public.profile_stage_enum,
  CASE
    WHEN avatar_url IS NOT NULL THEN 'completed'::public.profile_completion_status_enum
    ELSE 'not_started'::public.profile_completion_status_enum
  END,
  public.calculate_profile_completion(user_id),
  NOW()
FROM public.users
ON CONFLICT (user_id, stage) DO NOTHING;

COMMIT;

-- ====================================================================
-- MIGRATION COMPLETE
-- ====================================================================
--
-- This migration adds comprehensive interaction capabilities:
-- ✅ Nudge system with behavioral psychology
-- ✅ Profile completion funnel with gamification
-- ✅ Enhanced notification/toast system
-- ✅ Social features foundation (friends, posts, tagging)
-- ✅ User interaction analytics
-- ✅ Transition state management
-- ✅ Performance indexes and optimizations
-- ✅ Row Level Security policies
-- ✅ Database functions and triggers
--
-- Next steps:
-- 1. Run this migration: supabase db push
-- 2. Update application code to use new tables
-- 3. Create frontend components for interaction system
-- 4. Test and optimize performance
-- ====================================================================
