// ====================================================================
// NUDGE SYSTEM HOOK (Behavioral Psychology-Driven Prompts)
// ====================================================================
// Enterprise-grade nudge system with sophisticated behavioral targeting,
// psychology-based triggers, and A/B testing capabilities for optimal UX
// ====================================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AnimationType,
  BehavioralTrigger,
  Nudge,
  NudgeAnalytics,
  NudgePosition,
  UseNudgeSystemReturn,
} from "@/types/interactions";

// ====================================================================
// NUDGE EVALUATION ENGINE
// ====================================================================

class NudgeEngine {
  private static instance: NudgeEngine;
  private userProfile: any = null;
  private currentPage: string = "";
  private sessionStart: Date = new Date();
  private dismissedNudges: Set<string> = new Set();

  static getInstance(): NudgeEngine {
    if (!NudgeEngine.instance) {
      NudgeEngine.instance = new NudgeEngine();
    }
    return NudgeEngine.instance;
  }

  updateContext(userProfile: any, currentPage: string) {
    this.userProfile = userProfile;
    this.currentPage = currentPage;
  }

  evaluateConditions(nudge: Nudge): boolean {
    try {
      const context = {
        user: this.userProfile,
        currentPage: this.currentPage,
        sessionDuration: Date.now() - this.sessionStart.getTime(),
        dismissedNudges: this.dismissedNudges,
        timestamp: new Date().toISOString(),
      };

      // Evaluate complex condition rules
      return this.evaluateConditionRules(nudge.condition_rules, context);
    } catch (error) {
      console.error("Error evaluating nudge conditions:", error);
      return false;
    }
  }

  private evaluateConditionRules(rules: any[], context: any): boolean {
    if (!rules || rules.length === 0) return true;

    return rules.every((rule) => this.evaluateRule(rule, context));
  }

  private evaluateRule(rule: any, context: any): boolean {
    const { field, operator, value, logical = "AND" } = rule;
    let fieldValue: any;
    let result: boolean;

    // Extract field value from context
    switch (field) {
      case "profile_completion":
        fieldValue = this.calculateProfileCompletion();
        break;
      case "days_since_signup":
        fieldValue = this.getDaysSinceSignup();
        break;
      case "current_page":
        fieldValue = context.currentPage;
        break;
      case "session_duration":
        fieldValue = context.sessionDuration;
        break;
      default:
        fieldValue = this.getNestedValue(context, field);
    }

    // Evaluate based on operator
    switch (operator) {
      case "equals":
        result = fieldValue === value;
        break;
      case "not_equals":
        result = fieldValue !== value;
        break;
      case "greater_than":
        result = Number(fieldValue) > Number(value);
        break;
      case "less_than":
        result = Number(fieldValue) < Number(value);
        break;
      case "contains":
        result = String(fieldValue).includes(String(value));
        break;
      case "exists":
        result = fieldValue !== null && fieldValue !== undefined;
        break;
      default:
        result = false;
    }

    return logical === "OR" ? !result : result;
  }

  private calculateProfileCompletion(): number {
    if (!this.userProfile) return 0;

    let completed = 0;
    const total = 5; // avatar, bio, interests, verification, social

    if (this.userProfile.avatar_url) completed++;
    if (this.userProfile.bio && this.userProfile.bio.length > 10) completed++;
    if (this.userProfile.interests && this.userProfile.interests.length > 0)
      completed++;
    if (this.userProfile.is_verified) completed++;
    if (this.userProfile.friends_count > 0) completed++;

    return completed / total;
  }

  private getDaysSinceSignup(): number {
    if (!this.userProfile?.created_at) return 0;
    const signupDate = new Date(this.userProfile.created_at);
    const now = new Date();
    return Math.floor(
      (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  addDismissedNudge(nudgeId: string) {
    this.dismissedNudges.add(nudgeId);
  }

  shouldShowNudge(nudge: Nudge): boolean {
    // Check if already dismissed
    if (this.dismissedNudges.has(nudge.nudge_id)) return false;

    // Check frequency rules
    if (!this.checkFrequencyRules(nudge)) return false;

    // Evaluate behavioral conditions
    return this.evaluateConditions(nudge);
  }

  private checkFrequencyRules(nudge: Nudge): boolean {
    const { frequency_rules } = nudge;

    switch (frequency_rules.type) {
      case "once":
        return nudge.shown_count === 0;

      case "daily":
        if (!nudge.last_shown_at) return true;
        const lastShown = new Date(nudge.last_shown_at);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return lastShown < oneDayAgo;

      case "weekly":
        if (!nudge.last_shown_at) return true;
        const lastShownWeekly = new Date(nudge.last_shown_at);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastShownWeekly < oneWeekAgo;

      default:
        return true;
    }
  }
}

// ====================================================================
// NUDGE SYSTEM HOOK
// ====================================================================

export function useNudgeSystem(currentPage: string): UseNudgeSystemReturn {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const nudgeEngine = NudgeEngine.getInstance();

  // Update nudge engine context
  useEffect(() => {
    if (userProfile && currentPage) {
      nudgeEngine.updateContext(userProfile, currentPage);
    }
  }, [userProfile, currentPage]);

  // Fetch active nudges
  const {
    data: nudges = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nudges", user?.id],
    queryFn: async (): Promise<Nudge[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("nudges")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { descending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Check for new nudges every 30 seconds
  });

  // Track nudge analytics
  const trackNudgeMutation = useMutation({
    mutationFn: async (
      analytics: Omit<NudgeAnalytics, "analytics_id" | "created_at">,
    ) => {
      const { error } = await supabase
        .from("nudge_analytics")
        .insert(analytics);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate nudges to refresh counts
      queryClient.invalidateQueries({ queryKey: ["nudges", user?.id] });
    },
  });

  // Update nudge status
  const updateNudgeMutation = useMutation({
    mutationFn: async ({
      nudgeId,
      updates,
    }: {
      nudgeId: string;
      updates: Partial<Nudge>;
    }) => {
      const { error } = await supabase
        .from("nudges")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("nudge_id", nudgeId);

      if (error) throw error;
    },
  });

  // Find the best nudge to show
  const activeNudge =
    nudges.find((nudge) => nudgeEngine.shouldShowNudge(nudge)) || null;

  // Show nudge with delay
  useEffect(() => {
    if (activeNudge && activeNudge.delay_seconds > 0) {
      const timer = setTimeout(() => {
        // Track nudge shown
        trackNudgeMutation.mutate({
          nudge_id: activeNudge.nudge_id,
          user_id: user!.id,
          event_type: "shown",
          event_timestamp: new Date().toISOString(),
          current_page: currentPage,
          profile_completion: nudgeEngine["calculateProfileCompletion"](),
          days_since_last_activity: nudgeEngine["getDaysSinceSignup"](),
          device_type: navigator.userAgent.includes("Mobile")
            ? "mobile"
            : "desktop",
          is_mobile: navigator.userAgent.includes("Mobile"),
          viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        });

        // Update nudge shown count
        updateNudgeMutation.mutate({
          nudgeId: activeNudge.nudge_id,
          updates: {
            shown_count: activeNudge.shown_count + 1,
            last_shown_at: new Date().toISOString(),
          },
        });
      }, activeNudge.delay_seconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [activeNudge, currentPage, user?.id]);

  // Handle nudge dismissal
  const dismissNudge = useCallback(
    async (nudgeId: string) => {
      if (!user?.id) return;

      nudgeEngine.addDismissedNudge(nudgeId);

      // Track dismissal
      trackNudgeMutation.mutate({
        nudge_id: nudgeId,
        user_id: user.id,
        event_type: "dismissed",
        event_timestamp: new Date().toISOString(),
        current_page: currentPage,
        profile_completion: nudgeEngine["calculateProfileCompletion"](),
        device_type: navigator.userAgent.includes("Mobile")
          ? "mobile"
          : "desktop",
        is_mobile: navigator.userAgent.includes("Mobile"),
      });

      // Update nudge in database
      updateNudgeMutation.mutate({
        nudgeId,
        updates: {
          is_dismissed: true,
          dismissed_at: new Date().toISOString(),
          dismissed_count:
            (nudges.find((n) => n.nudge_id === nudgeId)?.dismissed_count || 0) +
            1,
        },
      });

      // Show subtle feedback
      toast({
        title: "Got it!",
        description: "We'll remember your preference.",
        variant: "default",
        duration: 2000,
      });
    },
    [
      user?.id,
      currentPage,
      nudges,
      trackNudgeMutation,
      updateNudgeMutation,
      toast,
    ],
  );

  // Handle nudge click
  const handleNudgeClick = useCallback(
    async (nudge: Nudge) => {
      if (!user?.id) return;

      // Track click
      trackNudgeMutation.mutate({
        nudge_id: nudge.nudge_id,
        user_id: user.id,
        event_type: "clicked",
        event_timestamp: new Date().toISOString(),
        current_page: currentPage,
        profile_completion: nudgeEngine["calculateProfileCompletion"](),
        device_type: navigator.userAgent.includes("Mobile")
          ? "mobile"
          : "desktop",
        is_mobile: navigator.userAgent.includes("Mobile"),
      });

      // Update nudge click count
      updateNudgeMutation.mutate({
        nudgeId: nudge.nudge_id,
        updates: {
          clicked_count: nudge.clicked_count + 1,
          last_clicked_at: new Date().toISOString(),
        },
      });

      // Execute nudge action
      if (nudge.cta_action) {
        await executeNudgeAction(nudge.cta_action);
      }
    },
    [user?.id, currentPage, trackNudgeMutation, updateNudgeMutation],
  );

  // Execute nudge action
  const executeNudgeAction = useCallback(async (action: any) => {
    switch (action.type) {
      case "navigate":
        if (action.path) {
          window.location.href = action.path;
        }
        break;

      case "modal":
        // Show modal component
        break;

      case "function":
        // Execute custom function
        if (action.function && typeof window[action.function] === "function") {
          window[action.function](action.params);
        }
        break;

      default:
        console.warn("Unknown nudge action type:", action.type);
    }
  }, []);

  return {
    activeNudge,
    nudgeQueue: nudges.filter((nudge) => nudgeEngine.shouldShowNudge(nudge)),
    dismissNudge,
    trackNudgeShown: (nudgeId: string) => {
      // This is handled automatically in the useEffect
    },
    trackNudgeClicked: handleNudgeClick,
    isLoading,
    error: error?.message || null,
  };
}

// ====================================================================
// NUDGE TEMPLATES (Psychology-Based)
// ====================================================================

export const NUDGE_TEMPLATES: Omit<
  Nudge,
  "nudge_id" | "user_id" | "created_at" | "updated_at"
>[] = [
  {
    nudge_type: "contextual",
    trigger_type: "onboarding",
    priority: "high",
    title: "Complete your adventure profile",
    message:
      "Users with complete profiles get 3x more trek invitations from friends",
    icon: "Users",
    cta_label: "Complete Now",
    cta_action: {
      type: "navigate",
      path: "/profile",
    },
    condition_rules: [
      {
        field: "profile_completion",
        operator: "less_than",
        value: 0.7,
        logical: "AND",
      },
      {
        field: "days_since_signup",
        operator: "less_than",
        value: 1,
        logical: "AND",
      },
    ],
    frequency_rules: {
      type: "once",
      max_per_period: 1,
    },
    display_position: "toast",
    animation: "slide",
    delay_seconds: 5,
    is_active: true,
    is_dismissed: false,
    shown_count: 0,
    clicked_count: 0,
    dismissed_count: 0,
  },

  {
    nudge_type: "contextual",
    trigger_type: "engagement",
    priority: "medium",
    title: "Add your adventure photo",
    message: "Let your friends recognize you on the trail 🏔️",
    icon: "Camera",
    cta_label: "Upload Photo",
    cta_action: {
      type: "navigate",
      path: "/profile/photo",
    },
    condition_rules: [
      {
        field: "user.avatar_url",
        operator: "equals",
        value: null,
        logical: "AND",
      },
      {
        field: "days_since_signup",
        operator: "less_than",
        value: 7,
        logical: "AND",
      },
    ],
    frequency_rules: {
      type: "daily",
      max_per_period: 1,
      cooldown_hours: 24,
    },
    display_position: "toast",
    animation: "fade",
    delay_seconds: 8,
    is_active: true,
    is_dismissed: false,
    shown_count: 0,
    clicked_count: 0,
    dismissed_count: 0,
  },

  {
    nudge_type: "urgency",
    trigger_type: "conversion",
    priority: "high",
    title: "Don't miss out on your first adventure",
    message: "5 new treks starting this weekend. Limited spots!",
    icon: "AlertCircle",
    cta_label: "Explore Treks",
    cta_action: {
      type: "navigate",
      path: "/glass-events",
    },
    condition_rules: [
      {
        field: "user.registrations.length",
        operator: "equals",
        value: 0,
        logical: "AND",
      },
      {
        field: "days_since_signup",
        operator: "less_than",
        value: 14,
        logical: "AND",
      },
    ],
    frequency_rules: {
      type: "weekly",
      max_per_period: 1,
      cooldown_hours: 168,
    },
    display_position: "modal",
    animation: "bounce",
    delay_seconds: 3,
    is_active: true,
    is_dismissed: false,
    shown_count: 0,
    clicked_count: 0,
    dismissed_count: 0,
  },

  {
    nudge_type: "social_proof",
    trigger_type: "engagement",
    priority: "medium",
    title: "Find your adventure crew",
    message: "Tag friends on treks. Experiences are better together",
    icon: "Users",
    cta_label: "Invite Friends",
    cta_action: {
      type: "navigate",
      path: "/friends/invite",
    },
    condition_rules: [
      {
        field: "user.friends_count",
        operator: "equals",
        value: 0,
        logical: "AND",
      },
      {
        field: "days_since_signup",
        operator: "less_than",
        value: 3,
        logical: "AND",
      },
    ],
    frequency_rules: {
      type: "once",
      max_per_period: 1,
    },
    display_position: "toast",
    animation: "slide",
    delay_seconds: 10,
    is_active: true,
    is_dismissed: false,
    shown_count: 0,
    clicked_count: 0,
    dismissed_count: 0,
  },

  {
    nudge_type: "milestone",
    trigger_type: "engagement",
    priority: "high",
    title: "Profile 80% complete! 🎉",
    message: "Just one more step to unlock premium features",
    icon: "Trophy",
    cta_label: "Finish Now",
    cta_action: {
      type: "navigate",
      path: "/profile/completion",
    },
    condition_rules: [
      {
        field: "profile_completion",
        operator: "greater_than",
        value: 0.75,
        logical: "AND",
      },
      {
        field: "profile_completion",
        operator: "less_than",
        value: 1.0,
        logical: "AND",
      },
    ],
    frequency_rules: {
      type: "daily",
      max_per_period: 1,
      cooldown_hours: 24,
    },
    display_position: "toast",
    animation: "bounce",
    delay_seconds: 2,
    is_active: true,
    is_dismissed: false,
    shown_count: 0,
    clicked_count: 0,
    dismissed_count: 0,
  },
];

// ====================================================================
// NUDGE CREATION UTILITIES
// ====================================================================

export function createPersonalizedNudge(
  userId: string,
  template: (typeof NUDGE_TEMPLATES)[0],
  personalization: Record<string, any> = {},
): Omit<Nudge, "nudge_id" | "created_at" | "updated_at"> {
  return {
    user_id: userId,
    ...template,
    title: personalizeText(template.title, personalization),
    message: personalizeText(template.message, personalization),
    condition_rules: personalizeConditions(
      template.condition_rules,
      personalization,
    ),
    is_active: true,
    is_dismissed: false,
    shown_count: 0,
    clicked_count: 0,
    dismissed_count: 0,
  };
}

function personalizeText(
  text: string,
  personalization: Record<string, any>,
): string {
  let personalized = text;

  Object.entries(personalization).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    personalized = personalized.replace(
      new RegExp(placeholder, "g"),
      String(value),
    );
  });

  return personalized;
}

function personalizeConditions(
  conditions: any[],
  personalization: Record<string, any>,
): any[] {
  return conditions.map((condition) => ({
    ...condition,
    value: personalizeText(String(condition.value), personalization),
  }));
}

// ====================================================================
// BEHAVIORAL TRACKING HOOK
// ====================================================================

export function useBehavioralTracking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const trackEvent = useCallback(
    async (
      eventType: string,
      eventName: string,
      eventData: Record<string, any> = {},
    ) => {
      if (!user?.id) return;

      try {
        await supabase.from("user_interactions").insert({
          user_id: user.id,
          event_type: eventType,
          event_name: eventName,
          event_data: eventData,
          session_id: sessionStorage.getItem("session_id") || "unknown",
          current_page: window.location.pathname,
          device_type: navigator.userAgent.includes("Mobile")
            ? "mobile"
            : "desktop",
          is_mobile: navigator.userAgent.includes("Mobile"),
          viewport_size: `${window.innerWidth}x${window.innerHeight}`,
          profile_completion: 0, // Will be calculated by trigger
          days_since_signup: 0, // Will be calculated by trigger
          clicks_count: eventData.clicks || 0,
          form_interactions: eventData.forms || 0,
          error_occurred: eventData.error || false,
          error_message: eventData.error_message,
        });

        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: ["user-analytics", user.id],
        });
      } catch (error) {
        console.error("Error tracking user interaction:", error);
      }
    },
    [user?.id, queryClient],
  );

  return { trackEvent };
}

// ====================================================================
// PERFORMANCE MONITORING
// ====================================================================

export function usePerformanceTracking() {
  const { user } = useAuth();

  const trackTransition = useCallback(
    async (
      fromPage: string,
      toPage: string,
      transitionType: string,
      performanceData: {
        renderTime?: number;
        memoryUsage?: number;
        frameRate?: number;
      } = {},
    ) => {
      if (!user?.id) return;

      try {
        await supabase.from("transition_states").insert({
          user_id: user.id,
          from_page: fromPage,
          to_page: toPage,
          transition_type: transitionType,
          animation_used: "page-transition",
          duration: performanceData.renderTime,
          was_smooth: performanceData.frameRate
            ? performanceData.frameRate >= 50
            : true,
          render_time: performanceData.renderTime,
          memory_usage: performanceData.memoryUsage,
          frame_rate: performanceData.frameRate,
          device_type: navigator.userAgent.includes("Mobile")
            ? "mobile"
            : "desktop",
          connection_speed: navigator.connection?.effectiveType || "unknown",
          viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        });
      } catch (error) {
        console.error("Error tracking transition:", error);
      }
    },
    [user?.id],
  );

  return { trackTransition };
}

// ====================================================================
// A/B TESTING FRAMEWORK
// ====================================================================

export interface NudgeExperiment {
  experiment_id: string;
  nudge_id: string;
  variant: "control" | "variant_a" | "variant_b";
  traffic_allocation: number; // 0-1
  is_active: boolean;
  start_date: string;
  end_date: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    dismissals: number;
  };
}

export function useNudgeExperiments() {
  const [experiments, setExperiments] = useState<NudgeExperiment[]>([]);

  const getExperimentVariant = useCallback(
    (nudgeId: string): string | null => {
      const experiment = experiments.find(
        (exp) => exp.nudge_id === nudgeId && exp.is_active,
      );
      if (!experiment) return null;

      // Simple random allocation based on user ID
      const userHash = btoa(nudgeId).charCodeAt(0) % 100;
      const randomValue = userHash / 100;

      if (randomValue < experiment.traffic_allocation) {
        return experiment.variant;
      }

      return null;
    },
    [experiments],
  );

  const trackExperimentMetric = useCallback(
    async (
      experimentId: string,
      metric: "impressions" | "clicks" | "conversions" | "dismissals",
    ) => {
      // Implementation for tracking A/B test metrics
      console.log(`Tracking ${metric} for experiment ${experimentId}`);
    },
    [],
  );

  return {
    experiments,
    getExperimentVariant,
    trackExperimentMetric,
  };
}

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

export function calculateOptimalNudgeTiming(
  userId: string,
  historicalData: any[],
): { bestTime: string; confidence: number } {
  // Analyze when user is most responsive to nudges
  const hourlyEngagement = new Array(24).fill(0);

  historicalData.forEach((interaction) => {
    if (interaction.event_type === "nudge_clicked") {
      const hour = new Date(interaction.event_timestamp).getHours();
      hourlyEngagement[hour]++;
    }
  });

  const bestHour = hourlyEngagement.indexOf(Math.max(...hourlyEngagement));
  const maxEngagements = hourlyEngagement[bestHour];
  const totalEngagements = hourlyEngagement.reduce(
    (sum, count) => sum + count,
    0,
  );
  const confidence =
    totalEngagements > 0 ? maxEngagements / totalEngagements : 0;

  return {
    bestTime: `${bestHour.toString().padStart(2, "0")}:00`,
    confidence: Math.round(confidence * 100),
  };
}

export function generateNudgeInsights(nudgeAnalytics: NudgeAnalytics[]): {
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  averageDismissals: number;
  optimalTiming: string;
  devicePreference: string;
  topPerformingVariant?: string;
} {
  const totalImpressions = nudgeAnalytics.filter(
    (a) => a.event_type === "shown",
  ).length;
  const totalClicks = nudgeAnalytics.filter(
    (a) => a.event_type === "clicked",
  ).length;
  const totalDismissals = nudgeAnalytics.filter(
    (a) => a.event_type === "dismissed",
  ).length;

  const clickThroughRate =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Analyze timing preferences
  const hourlyClicks = new Array(24).fill(0);
  nudgeAnalytics
    .filter((a) => a.event_type === "clicked")
    .forEach((click) => {
      const hour = new Date(click.event_timestamp).getHours();
      hourlyClicks[hour]++;
    });

  const optimalHour = hourlyClicks.indexOf(Math.max(...hourlyClicks));
  const optimalTiming = `${optimalHour.toString().padStart(2, "0")}:00`;

  // Analyze device preferences
  const mobileClicks = nudgeAnalytics.filter(
    (a) => a.event_type === "clicked" && a.is_mobile,
  ).length;
  const desktopClicks = totalClicks - mobileClicks;
  const devicePreference = mobileClicks > desktopClicks ? "mobile" : "desktop";

  return {
    totalImpressions,
    totalClicks,
    clickThroughRate: Math.round(clickThroughRate * 100) / 100,
    averageDismissals:
      Math.round((totalDismissals / totalImpressions) * 100) / 100,
    optimalTiming,
    devicePreference,
  };
}
