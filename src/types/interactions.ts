// ====================================================================
// PHASE 5: INTERACTION SYSTEM TYPES
// ====================================================================
// Sophisticated behavioral design and UX types for 135-140 IQ level experience
// ====================================================================

// ====================================================================
// NUDGE SYSTEM TYPES (Behavioral Psychology)
// ====================================================================

export type NudgeType =
  | "contextual"
  | "milestone"
  | "social_proof"
  | "urgency"
  | "recurring";
export type NudgeTrigger =
  | "onboarding"
  | "engagement"
  | "retention"
  | "conversion"
  | "social";
export type NudgePriority = "low" | "medium" | "high" | "critical";

export interface NudgeCondition {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "exists";
  value: any;
  logical?: "AND" | "OR";
}

export interface NudgeFrequencyRule {
  type: "once" | "daily" | "weekly" | "monthly";
  max_per_period?: number;
  cooldown_hours?: number;
}

export interface NudgeAction {
  type: "navigate" | "modal" | "external" | "function";
  path?: string;
  modal?: string;
  url?: string;
  function?: string;
  params?: Record<string, any>;
}

export interface Nudge {
  nudge_id: string;
  user_id: string;
  nudge_type: NudgeType;
  trigger_type: NudgeTrigger;
  priority: NudgePriority;

  // Content
  title: string;
  message: string;
  icon?: string; // Lucide icon name
  cta_label?: string;
  cta_action?: NudgeAction;

  // Behavioral targeting
  condition_rules: NudgeCondition[];
  frequency_rules: NudgeFrequencyRule;

  // Display settings
  display_position: "toast" | "modal" | "banner" | "inline";
  animation: "fade" | "slide" | "bounce" | "scale";
  delay_seconds: number;

  // Status and tracking
  is_active: boolean;
  is_dismissed: boolean;
  dismissed_at?: string;
  shown_count: number;
  clicked_count: number;
  dismissed_count: number;
  last_shown_at?: string;
  last_clicked_at?: string;

  created_at: string;
  updated_at: string;
}

export interface NudgeAnalytics {
  analytics_id: string;
  nudge_id: string;
  user_id: string;
  event_type: "shown" | "clicked" | "dismissed" | "expired";
  event_timestamp: string;

  // Context data
  user_agent?: string;
  viewport_size?: string;
  current_page?: string;
  session_duration?: number;

  // Device context
  device_type?: string;
  is_mobile?: boolean;
  screen_resolution?: string;

  // Behavioral context
  profile_completion?: number;
  days_since_last_activity?: number;
  total_treks_completed?: number;
  friends_count?: number;

  created_at: string;
}

// ====================================================================
// PROFILE COMPLETION FUNNEL TYPES (Gamified Onboarding)
// ====================================================================

export type ProfileStage =
  | "avatar"
  | "bio"
  | "interests"
  | "verification"
  | "social";
export type ProfileCompletionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export interface ProfileStageConfig {
  stage: ProfileStage;
  title: string;
  subtitle: string;
  icon: string; // Lucide icon name
  reward: string;
  estimated_time: string;
  psychology_trigger:
    | "social_proof"
    | "self_expression"
    | "personalization"
    | "authority_trust"
    | "belonging";
  required_fields: string[];
  optional_fields: string[];
  completion_threshold: number; // 0-1
}

export interface ProfileCompletion {
  completion_id: string;
  user_id: string;
  stage: ProfileStage;
  status: ProfileCompletionStatus;
  completion_percentage: number;

  // Behavioral data
  started_at?: string;
  completed_at?: string;
  time_to_complete?: number; // seconds

  // Psychology triggers
  trigger_used?: string;
  nudge_id?: string;

  // Rewards and unlocks
  rewards_unlocked: string[];
  features_unlocked: string[];

  // User feedback
  helpful_rating?: number;
  improvement_suggestions?: string;

  created_at: string;
  updated_at: string;
}

export interface ProfileMilestone {
  milestone_id: string;
  user_id: string;
  milestone_type: string;
  title: string;
  description?: string;
  icon?: string;

  // Achievement data
  achieved_at: string;
  points_earned: number;
  badge_earned?: string;

  // Context
  related_entity_type?: string;
  related_entity_id?: number;

  // Celebration data
  celebration_shown: boolean;
  toast_shown: boolean;
  confetti_triggered: boolean;

  created_at: string;
}

// ====================================================================
// ENHANCED NOTIFICATION/TOAST SYSTEM TYPES
// ====================================================================

export type ToastVariant =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "milestone"
  | "celebration"
  | "nudge"
  | "social";

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "destructive";
}

export interface EnhancedNotification {
  notification_id: string;
  user_id: string;
  variant: ToastVariant;
  title: string;
  message: string;
  icon?: string;

  // Actions and navigation
  primary_action?: ToastAction;
  secondary_action?: ToastAction;

  // Display configuration
  display_position:
    | "top-right"
    | "bottom-right"
    | "bottom-center"
    | "top-center";
  duration: number; // milliseconds, -1 for persistent
  animation: "fade" | "slide" | "bounce" | "scale";

  // Context and targeting
  context_data: Record<string, any>;
  trigger_event?: string;
  related_entity_type?: string;
  related_entity_id?: number;

  // User interaction
  status: "pending" | "shown" | "clicked" | "dismissed";
  shown_at?: string;
  clicked_at?: string;
  dismissed_at?: string;
  expires_at?: string;

  // Analytics
  impression_count: number;
  click_count: number;
  dismiss_count: number;
  conversion_rate?: number;

  // Scheduling
  scheduled_for?: string;
  priority: number; // 1-10 scale

  created_at: string;
  updated_at: string;
}

export interface ToastSession {
  session_id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  device_type?: string;
  is_mobile?: boolean;

  // User state
  profile_completion?: number;
  current_page?: string;
  time_since_signup?: number;

  // Toast activity
  toasts_shown: number;
  toasts_clicked: number;
  toasts_dismissed: number;

  // Effectiveness metrics
  engagement_rate?: number;
  optimal_timing?: Record<string, any>;

  created_at: string;
}

// ====================================================================
// SOCIAL FEATURES TYPES (Friends, Posts, Tagging)
// ====================================================================

export type ConnectionStatus = "pending" | "accepted" | "declined" | "blocked";
export type ConnectionType = "friend" | "following" | "blocked";
export type PostVisibility = "public" | "friends" | "private";

export interface UserConnection {
  connection_id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  connection_type: ConnectionType;

  // Timestamps
  requested_at: string;
  responded_at?: string;
  connected_at?: string;

  // Context
  connection_source?: string;
  mutual_friends_count: number;
  mutual_treks_count: number;

  created_at: string;
  updated_at: string;
}

export interface UserPost {
  post_id: string;
  user_id: string;

  // Content
  content: string;
  media_urls: string[];
  post_type: "text" | "image" | "video" | "trek_share";

  // Trek association
  trek_id?: number;
  registration_id?: number;

  // Engagement metrics
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;

  // Visibility and privacy
  visibility: PostVisibility;
  is_pinned: boolean;
  is_featured: boolean;

  // Location context
  location_name?: string;
  coordinates?: [number, number];

  // Metadata
  tags: Array<{
    user_id: string;
    x: number;
    y: number;
  }>;
  mentions: string[];

  created_at: string;
  updated_at: string;
}

export interface PostReaction {
  reaction_id: string;
  post_id: string;
  user_id: string;
  reaction_type: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
  emoji?: string;
  reacted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ImageTag {
  tag_id: string;
  image_id: string;
  tagged_by: string;
  tagged_user_id: string;

  // Tag position on image
  x_position: number; // 0.00 to 100.00 (percentage)
  y_position: number;

  // Tag context
  tag_type: "person" | "location" | "object";
  confidence_score?: number;

  // Status
  is_approved: boolean;
  is_visible: boolean;
  approved_by?: string;
  approved_at?: string;

  // Notifications
  notification_sent: boolean;
  notification_sent_at?: string;

  created_at: string;
  updated_at: string;
}

// ====================================================================
// USER INTERACTION ANALYTICS TYPES
// ====================================================================

export type InteractionEventType =
  | "page_view"
  | "button_click"
  | "form_submit"
  | "scroll"
  | "hover"
  | "focus"
  | "error"
  | "nudge_shown"
  | "nudge_clicked"
  | "toast_shown"
  | "toast_clicked";

export interface UserInteraction {
  interaction_id: string;
  user_id: string;
  event_type: InteractionEventType;
  event_name: string;
  event_data: Record<string, any>;

  // Context
  session_id?: string;
  current_page?: string;
  previous_page?: string;
  time_spent?: number; // seconds on page

  // Device and environment
  device_type?: string;
  browser?: string;
  viewport_size?: string;
  is_mobile?: boolean;

  // User state
  profile_completion?: number;
  days_since_signup?: number;
  total_treks?: number;
  friends_count?: number;

  // Engagement metrics
  scroll_depth?: number; // 0.00 to 1.00
  clicks_count: number;
  form_interactions: number;

  // Performance
  load_time?: number;
  error_occurred: boolean;
  error_message?: string;

  created_at: string;
}

export interface TransitionState {
  state_id: string;
  user_id: string;
  from_page?: string;
  to_page?: string;
  transition_type: "navigation" | "modal" | "toast" | "nudge";

  // Animation and UX
  animation_used?: string;
  duration?: number;
  easing_function?: string;

  // User experience
  was_smooth: boolean;
  user_rating?: number;
  feedback?: string;

  // Performance metrics
  render_time?: number;
  memory_usage?: number;
  frame_rate?: number;

  // Context
  device_type?: string;
  connection_speed?: string;
  viewport_size?: string;

  created_at: string;
}

export interface UserPreferenceProfile {
  profile_id: string;
  user_id: string;

  // Communication preferences
  nudge_frequency: "low" | "medium" | "high";
  toast_frequency: "low" | "medium" | "high";
  notification_channels: string[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;

  // Behavioral preferences (learned)
  preferred_interaction_style?: "visual" | "textual" | "minimal";
  animation_sensitivity?: "none" | "subtle" | "full";
  loading_preference?: "skeleton" | "spinner" | "progress";

  // Content preferences
  preferred_trek_types: string[];
  difficulty_preference?: string;
  group_size_preference?: string;
  budget_range?: {
    min: number;
    max: number;
  };

  // Social preferences
  social_engagement_level?: "low" | "medium" | "high";
  friend_interaction_frequency?: string;
  community_participation?: string;

  // Analytics and optimization
  total_interactions: number;
  successful_conversions: number;
  last_updated: string;

  created_at: string;
  updated_at: string;
}

// ====================================================================
// COMPONENT PROP TYPES
// ====================================================================

export interface NudgeSystemProps {
  userId: string;
  currentPage: string;
  profileCompletion: number;
  className?: string;
}

export interface ProfileCompletionFunnelProps {
  userId: string;
  currentStage?: ProfileStage;
  onStageComplete?: (stage: ProfileStage) => void;
  className?: string;
}

export interface EnhancedToastProps {
  notification: EnhancedNotification;
  onDismiss: (notificationId: string) => void;
  onAction?: (action: ToastAction) => void;
  position?: "top-right" | "bottom-right" | "bottom-center" | "top-center";
  className?: string;
}

export interface SocialConnectionProps {
  connection: UserConnection;
  currentUserId: string;
  onAccept: (connectionId: string) => void;
  onDecline: (connectionId: string) => void;
  onBlock: (connectionId: string) => void;
  className?: string;
}

export interface UserPostProps {
  post: UserPost;
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onReport: (postId: string) => void;
  className?: string;
}

export interface ImageTaggingProps {
  imageId: string;
  imageUrl: string;
  currentUserId: string;
  onTagAdd: (
    tag: Omit<ImageTag, "tag_id" | "created_at" | "updated_at">,
  ) => void;
  onTagRemove: (tagId: string) => void;
  className?: string;
}

// ====================================================================
// HOOK RETURN TYPES
// ====================================================================

export interface UseNudgeSystemReturn {
  activeNudge: Nudge | null;
  nudgeQueue: Nudge[];
  dismissNudge: (nudgeId: string) => void;
  trackNudgeShown: (nudgeId: string) => void;
  trackNudgeClicked: (nudgeId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export interface UseProfileCompletionReturn {
  completion: ProfileCompletion[];
  currentStage: ProfileStage | null;
  overallPercentage: number;
  isComplete: boolean;
  updateStage: (stage: ProfileStage, status: ProfileCompletionStatus) => void;
  completeStage: (stage: ProfileStage, timeSpent?: number) => void;
  createMilestone: (type: string, title: string, points?: number) => void;
  isLoading: boolean;
  error: string | null;
}

export interface UseEnhancedNotificationsReturn {
  notifications: EnhancedNotification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<
      EnhancedNotification,
      "notification_id" | "created_at" | "updated_at"
    >,
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAsDismissed: (notificationId: string) => void;
  clearAll: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface UseSocialFeaturesReturn {
  connections: UserConnection[];
  posts: UserPost[];
  pendingRequests: UserConnection[];
  sendFriendRequest: (userId: string) => void;
  acceptFriendRequest: (connectionId: string) => void;
  declineFriendRequest: (connectionId: string) => void;
  createPost: (
    post: Omit<UserPost, "post_id" | "created_at" | "updated_at">,
  ) => void;
  likePost: (postId: string) => void;
  commentOnPost: (postId: string, comment: string) => void;
  tagInImage: (imageId: string, userId: string, x: number, y: number) => void;
  isLoading: boolean;
  error: string | null;
}

export interface UseInteractionAnalyticsReturn {
  trackEvent: (
    eventType: InteractionEventType,
    eventName: string,
    eventData?: Record<string, any>,
  ) => void;
  trackPageView: (page: string, timeSpent?: number) => void;
  trackButtonClick: (buttonName: string, context?: Record<string, any>) => void;
  trackFormSubmit: (
    formName: string,
    success: boolean,
    data?: Record<string, any>,
  ) => void;
  trackScroll: (depth: number, page: string) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  getUserProfile: () => UserPreferenceProfile | null;
  updatePreferences: (preferences: Partial<UserPreferenceProfile>) => void;
  isTracking: boolean;
}

// ====================================================================
// UTILITY TYPES
// ====================================================================

export type NudgePosition = "toast" | "modal" | "banner" | "inline";
export type AnimationType =
  | "fade"
  | "slide"
  | "bounce"
  | "scale"
  | "pulse"
  | "shimmer";
export type InteractionContext =
  | "profile"
  | "trek"
  | "social"
  | "admin"
  | "gallery"
  | "forum";

export interface BehavioralTrigger {
  type: "time_based" | "action_based" | "state_based" | "social_based";
  condition: string;
  action: string;
  delay?: number;
  priority: number;
}

export interface UXOptimization {
  component: string;
  optimization: "animation" | "loading" | "interaction" | "layout";
  improvement: string;
  impact_score: number;
  implementation_cost: "low" | "medium" | "high";
}

// ====================================================================
// CONSTANTS AND CONFIGURATION
// ====================================================================

export const NUDGE_POSITIONS: NudgePosition[] = [
  "toast",
  "modal",
  "banner",
  "inline",
];
export const ANIMATION_TYPES: AnimationType[] = [
  "fade",
  "slide",
  "bounce",
  "scale",
  "pulse",
  "shimmer",
];
export const INTERACTION_CONTEXTS: InteractionContext[] = [
  "profile",
  "trek",
  "social",
  "admin",
  "gallery",
  "forum",
];

export const PROFILE_STAGES: ProfileStageConfig[] = [
  {
    stage: "avatar",
    title: "Make it personal",
    subtitle: "Add your photo so friends recognize you",
    icon: "Camera",
    reward: "Unlock profile visibility",
    estimated_time: "2 min",
    psychology_trigger: "social_proof",
    required_fields: ["avatar_url"],
    optional_fields: ["display_name"],
    completion_threshold: 0.2,
  },
  {
    stage: "bio",
    title: "Tell your story",
    subtitle: "Write a short bio about your adventure style",
    icon: "BookOpen",
    reward: 'Unlock "Your Profile" page',
    estimated_time: "3 min",
    psychology_trigger: "self_expression",
    required_fields: ["bio"],
    optional_fields: ["trekking_experience", "location"],
    completion_threshold: 0.4,
  },
  {
    stage: "interests",
    title: "What excites you?",
    subtitle: "Select your adventure interests & difficulty level",
    icon: "Zap",
    reward: "Get personalized trek recommendations",
    estimated_time: "2 min",
    psychology_trigger: "personalization",
    required_fields: ["interests"],
    optional_fields: ["difficulty_preference", "group_size_preference"],
    completion_threshold: 0.6,
  },
  {
    stage: "verification",
    title: "Build trust",
    subtitle: "Verify with a government ID for better opportunities",
    icon: "Shield",
    reward: "Access premium treks & features",
    estimated_time: "5 min",
    psychology_trigger: "authority_trust",
    required_fields: ["is_verified"],
    optional_fields: ["verification_docs"],
    completion_threshold: 0.8,
  },
  {
    stage: "social",
    title: "Connect with friends",
    subtitle: "Find friends and start tagging on adventures",
    icon: "Users",
    reward: "Unlock social features (tagging, posts)",
    estimated_time: "3 min",
    psychology_trigger: "belonging",
    required_fields: [],
    optional_fields: ["friends_count"],
    completion_threshold: 1.0,
  },
];

export const TOAST_VARIANTS: Record<
  ToastVariant,
  {
    color: string;
    icon: string;
    sound?: string;
    haptic?: "light" | "medium" | "heavy";
    duration: number;
  }
> = {
  success: {
    color: "green",
    icon: "CheckCircle",
    haptic: "light",
    duration: 3000,
  },
  error: {
    color: "red",
    icon: "AlertCircle",
    haptic: "medium",
    duration: 5000,
  },
  info: {
    color: "blue",
    icon: "Info",
    duration: 4000,
  },
  warning: {
    color: "yellow",
    icon: "AlertTriangle",
    duration: 4000,
  },
  milestone: {
    color: "golden",
    icon: "Trophy",
    sound: "celebration.mp3",
    haptic: "heavy",
    duration: 4000,
  },
  celebration: {
    color: "purple",
    icon: "Sparkles",
    sound: "celebration_full.mp3",
    haptic: "heavy",
    duration: 5000,
  },
  nudge: {
    color: "teal",
    icon: "Lightbulb",
    duration: 6000,
  },
  social: {
    color: "teal",
    icon: "Users",
    duration: 4000,
  },
};
