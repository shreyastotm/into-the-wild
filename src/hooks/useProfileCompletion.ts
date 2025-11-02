// ====================================================================
// PROFILE COMPLETION HOOK (Gamified Onboarding System)
// ====================================================================
// Enterprise-grade profile completion tracking with behavioral psychology,
// milestone celebrations, progress analytics, and reward-based motivation
// ====================================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  PROFILE_STAGES,
  ProfileCompletion,
  ProfileCompletionStatus,
  ProfileMilestone,
  ProfileStage,
  UseProfileCompletionReturn,
} from "@/types/interactions";

// ====================================================================
// PROFILE COMPLETION CALCULATION ENGINE
// ====================================================================

class ProfileCompletionEngine {
  private static instance: ProfileCompletionEngine;
  private userProfile: any = null;
  private completionCache: Map<string, number> = new Map();

  static getInstance(): ProfileCompletionEngine {
    if (!ProfileCompletionEngine.instance) {
      ProfileCompletionEngine.instance = new ProfileCompletionEngine();
    }
    return ProfileCompletionEngine.instance;
  }

  updateUserProfile(profile: any) {
    this.userProfile = profile;
    this.completionCache.clear(); // Clear cache when profile updates
  }

  calculateStageCompletion(stage: ProfileStage): number {
    if (!this.userProfile) return 0;

    const stageConfig = PROFILE_STAGES.find((s) => s.stage === stage);
    if (!stageConfig) return 0;

    const cacheKey = `stage_${stage}`;
    if (this.completionCache.has(cacheKey)) {
      return this.completionCache.get(cacheKey)!;
    }

    let completedFields = 0;
    const totalFields =
      stageConfig.required_fields.length + stageConfig.optional_fields.length;

    // Check required fields
    for (const field of stageConfig.required_fields) {
      if (this.getFieldValue(field)) {
        completedFields++;
      }
    }

    // Check optional fields (weighted less)
    for (const field of stageConfig.optional_fields) {
      if (this.getFieldValue(field)) {
        completedFields += 0.5; // Optional fields count as half
      }
    }

    const percentage =
      totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    this.completionCache.set(cacheKey, percentage);

    return percentage;
  }

  private getFieldValue(fieldPath: string): any {
    return fieldPath
      .split(".")
      .reduce((obj, key) => obj?.[key], this.userProfile);
  }

  calculateOverallCompletion(): number {
    if (!this.userProfile) return 0;

    const totalStages = PROFILE_STAGES.length;
    let totalPercentage = 0;

    for (const stageConfig of PROFILE_STAGES) {
      totalPercentage += this.calculateStageCompletion(stageConfig.stage);
    }

    return Math.round((totalPercentage / totalStages) * 100) / 100;
  }

  getCurrentStage(): ProfileStage | null {
    if (!this.userProfile) return null;

    // Find the first incomplete stage
    for (const stageConfig of PROFILE_STAGES) {
      const completion = this.calculateStageCompletion(stageConfig.stage);
      if (completion < 100) {
        return stageConfig.stage;
      }
    }

    return null; // All stages complete
  }

  getNextMilestone(): {
    stage: ProfileStage;
    type: string;
    title: string;
    points: number;
  } | null {
    const currentStage = this.getCurrentStage();
    if (!currentStage) return null;

    const stageConfig = PROFILE_STAGES.find((s) => s.stage === currentStage);
    if (!stageConfig) return null;

    // Determine milestone type based on stage
    const milestoneTypes = {
      avatar: {
        type: "profile_started",
        title: "Profile Started!",
        points: 25,
      },
      bio: { type: "story_shared", title: "Story Shared!", points: 50 },
      interests: {
        type: "preferences_set",
        title: "Preferences Set!",
        points: 75,
      },
      verification: { type: "trust_built", title: "Trust Built!", points: 100 },
      social: {
        type: "community_joined",
        title: "Community Joined!",
        points: 150,
      },
    };

    return {
      stage: currentStage,
      ...milestoneTypes[currentStage],
    };
  }

  isStageComplete(stage: ProfileStage): boolean {
    return this.calculateStageCompletion(stage) >= 100;
  }

  getOptimalTrigger(stage: ProfileStage): string {
    // Psychology-based trigger selection
    const triggers = {
      avatar: "social_proof", // Others can see you
      bio: "self_expression", // Tell your story
      interests: "personalization", // Get better recommendations
      verification: "authority_trust", // Build credibility
      social: "belonging", // Join the community
    };

    return triggers[stage] || "personalization";
  }
}

// ====================================================================
// MAIN PROFILE COMPLETION HOOK
// ====================================================================

export function useProfileCompletion(
  userId: string,
): UseProfileCompletionReturn {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const engine = ProfileCompletionEngine.getInstance();

  // Update engine with current profile
  useEffect(() => {
    if (userProfile) {
      engine.updateUserProfile(userProfile);
    }
  }, [userProfile]);

  // Track if table exists to disable refetching when missing
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  // Fetch profile completion data
  const {
    data: completion = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile-completion", userId],
    queryFn: async (): Promise<ProfileCompletion[]> => {
      if (!userId) return [];

      try {
        const { data, error } = await supabase
          .from("profile_completion")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        // Handle missing table gracefully (404) - return empty array
        // Check for various error indicators that the table doesn't exist
        if (error) {
          const errorMsg = error.message?.toLowerCase() || "";
          const errorCode = error.code || "";

          // Check for missing table errors (404 from REST API or database errors)
          const isTableMissing =
            errorCode === "PGRST116" ||
            errorCode === "42P01" ||
            errorCode === "PGRST106" ||
            errorMsg.includes("relation") ||
            errorMsg.includes("does not exist") ||
            errorMsg.includes("could not find") ||
            errorMsg.includes("not found") ||
            error.code?.includes("404") ||
            (error as any).status === 404 ||
            (error as any).statusCode === 404 ||
            errorMsg.includes("connection closed") ||
            errorMsg.includes("connection refused");

          if (isTableMissing) {
            // Mark table as missing to disable refetching
            setTableExists(false);

            // Only log once to avoid console spam
            if (!localStorage.getItem("profile_completion_table_warned")) {
              console.warn(
                "profile_completion table not found. Returning empty array. Apply migration to remote database to enable profile completion tracking.",
              );
              localStorage.setItem("profile_completion_table_warned", "true");
            }
            return [];
          }

          // For other errors, throw
          throw error;
        }

        // Table exists, mark it
        if (tableExists === false) {
          setTableExists(true);
        }

        return data || [];
      } catch (err: any) {
        // Catch any unexpected errors and check if it's a 404 or connection error
        const errorMsg = err?.message?.toLowerCase() || "";
        const isConnectionError =
          err?.status === 404 ||
          err?.statusCode === 404 ||
          errorMsg.includes("not found") ||
          errorMsg.includes("404") ||
          errorMsg.includes("connection closed") ||
          errorMsg.includes("connection refused") ||
          err?.code === "ECONNREFUSED" ||
          err?.code === "ECONNRESET";

        if (isConnectionError) {
          setTableExists(false);
          return [];
        }
        // Re-throw other errors
        throw err;
      }
    },
    enabled: !!userId && tableExists !== false, // Disable if we know table doesn't exist
    refetchInterval: (query) => {
      // Only refetch if table exists (not false)
      // Disable refetching if table is missing to avoid connection errors
      if (tableExists === false) return false;
      // Only refetch if we have data (user is completing profile)
      return query.state.data && query.state.data.length > 0 ? 30000 : false; // 30 seconds instead of 10
    },
    retry: false, // Don't retry on errors
    refetchOnWindowFocus: tableExists !== false, // Don't refetch on focus if table missing
  });

  // Track if milestones table exists
  const [milestonesTableExists, setMilestonesTableExists] = useState<
    boolean | null
  >(null);

  // Fetch milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ["profile-milestones", userId],
    queryFn: async (): Promise<ProfileMilestone[]> => {
      if (!userId) return [];

      try {
        const { data, error } = await supabase
          .from("profile_milestones")
          .select("*")
          .eq("user_id", userId)
          .order("achieved_at", { descending: true });

        // Handle missing table gracefully (404) - return empty array
        // Check for various error indicators that the table doesn't exist
        if (error) {
          const errorMsg = error.message?.toLowerCase() || "";
          const errorCode = error.code || "";

          // Check for missing table errors (404 from REST API or database errors)
          const isTableMissing =
            errorCode === "PGRST116" ||
            errorCode === "42P01" ||
            errorCode === "PGRST106" ||
            errorMsg.includes("relation") ||
            errorMsg.includes("does not exist") ||
            errorMsg.includes("could not find") ||
            errorMsg.includes("not found") ||
            error.code?.includes("404") ||
            (error as any).status === 404 ||
            (error as any).statusCode === 404 ||
            errorMsg.includes("connection closed") ||
            errorMsg.includes("connection refused");

          if (isTableMissing) {
            setMilestonesTableExists(false);
            return [];
          }

          // For other errors, throw
          throw error;
        }

        // Table exists
        if (milestonesTableExists === false) {
          setMilestonesTableExists(true);
        }

        return data || [];
      } catch (err: any) {
        // Catch connection errors
        const errorMsg = err?.message?.toLowerCase() || "";
        const isConnectionError =
          err?.status === 404 ||
          err?.statusCode === 404 ||
          errorMsg.includes("not found") ||
          errorMsg.includes("404") ||
          errorMsg.includes("connection closed") ||
          errorMsg.includes("connection refused") ||
          err?.code === "ECONNREFUSED" ||
          err?.code === "ECONNRESET";

        if (isConnectionError) {
          setMilestonesTableExists(false);
          return [];
        }
        throw err;
      }
    },
    enabled: !!userId && milestonesTableExists !== false,
    retry: false,
    refetchOnWindowFocus: milestonesTableExists !== false,
  });

  // Update stage completion
  const updateStageMutation = useMutation({
    mutationFn: async ({
      stage,
      status,
      percentage,
    }: {
      stage: ProfileStage;
      status: ProfileCompletionStatus;
      percentage: number;
    }) => {
      const { error } = await supabase.from("profile_completion").upsert(
        {
          user_id: userId,
          stage,
          status,
          completion_percentage: percentage,
          trigger_used: engine.getOptimalTrigger(stage),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,stage",
        },
      );

      if (error) throw error;
    },
    onSuccess: (_, { stage, status }) => {
      queryClient.invalidateQueries({
        queryKey: ["profile-completion", userId],
      });

      if (status === "completed") {
        toast({
          title: `${stage.charAt(0).toUpperCase() + stage.slice(1)} Complete!`,
          description: `Great progress on your profile!`,
          variant: "milestone",
        });
      }
    },
  });

  // Complete stage with milestone creation
  const completeStageMutation = useMutation({
    mutationFn: async ({
      stage,
      timeSpent,
    }: {
      stage: ProfileStage;
      timeSpent?: number;
    }) => {
      // Update completion record
      const { error: completionError } = await supabase
        .from("profile_completion")
        .upsert(
          {
            user_id: userId,
            stage,
            status: "completed",
            completion_percentage: 100,
            completed_at: new Date().toISOString(),
            time_to_complete: timeSpent,
            trigger_used: engine.getOptimalTrigger(stage),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,stage",
          },
        );

      if (completionError) throw completionError;

      // Create milestone
      const milestoneData = engine.getNextMilestone();
      if (milestoneData && milestoneData.stage === stage) {
        const { error: milestoneError } = await supabase
          .from("profile_milestones")
          .insert({
            user_id: userId,
            milestone_type: milestoneData.type,
            title: milestoneData.title,
            points_earned: milestoneData.points,
            related_entity_type: "profile",
            related_entity_id: userProfile?.user_id,
            celebration_shown: false,
            toast_shown: false,
            confetti_triggered: false,
          });

        if (milestoneError) throw milestoneError;
      }
    },
    onSuccess: (_, { stage }) => {
      queryClient.invalidateQueries({
        queryKey: ["profile-completion", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile-milestones", userId],
      });

      // Show celebration toast
      const stageConfig = PROFILE_STAGES.find((s) => s.stage === stage);
      if (stageConfig) {
        toast({
          title: `${stageConfig.title} Complete! 🎉`,
          description: `You've unlocked: ${stageConfig.reward}`,
          variant: "celebration",
          duration: 5000,
        });
      }
    },
  });

  // Create milestone
  const createMilestoneMutation = useMutation({
    mutationFn: async (milestone: {
      type: string;
      title: string;
      points?: number;
    }) => {
      const { error } = await supabase.from("profile_milestones").insert({
        user_id: userId,
        milestone_type: milestone.type,
        title: milestone.title,
        points_earned: milestone.points || 0,
        related_entity_type: "profile",
        related_entity_id: userProfile?.user_id,
        celebration_shown: true,
        toast_shown: true,
        confetti_triggered: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile-milestones", userId],
      });
    },
  });

  // Calculate current values
  const currentStage = engine.getCurrentStage();
  const overallPercentage = engine.calculateOverallCompletion();
  const isComplete = overallPercentage >= 100;

  // Update stage completion
  const updateStage = useCallback(
    (stage: ProfileStage, status: ProfileCompletionStatus) => {
      const percentage = engine.calculateStageCompletion(stage);
      updateStageMutation.mutate({ stage, status, percentage });
    },
    [updateStageMutation],
  );

  // Complete stage with celebration
  const completeStage = useCallback(
    (stage: ProfileStage, timeSpent?: number) => {
      completeStageMutation.mutate({ stage, timeSpent });
    },
    [completeStageMutation],
  );

  // Create milestone
  const createMilestone = useCallback(
    (type: string, title: string, points?: number) => {
      createMilestoneMutation.mutate({ type, title, points });
    },
    [createMilestoneMutation],
  );

  return {
    completion,
    currentStage,
    overallPercentage,
    isComplete,
    updateStage,
    completeStage,
    createMilestone,
    isLoading,
    error: error?.message || null,
  };
}

// ====================================================================
// PROFILE COMPLETION ANALYTICS HOOK
// ====================================================================

export function useProfileCompletionAnalytics(userId: string) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["profile-analytics", userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get completion data
      const { data: completion } = await supabase
        .from("profile_completion")
        .select("*")
        .eq("user_id", userId);

      // Get milestones
      const { data: milestones } = await supabase
        .from("profile_milestones")
        .select("*")
        .eq("user_id", userId);

      // Calculate insights
      const completedStages =
        completion?.filter((c) => c.status === "completed") || [];
      const totalTime = completedStages.reduce(
        (sum, stage) => sum + (stage.time_to_complete || 0),
        0,
      );

      const stageInsights = PROFILE_STAGES.map((stageConfig) => {
        const stageData = completion?.find(
          (c) => c.stage === stageConfig.stage,
        );
        return {
          stage: stageConfig.stage,
          completed: stageData?.status === "completed",
          percentage: stageData?.completion_percentage || 0,
          timeSpent: stageData?.time_to_complete,
          helpfulRating: stageData?.helpful_rating,
          trigger: stageData?.trigger_used,
        };
      });

      const triggerEffectiveness = stageInsights
        .filter((s) => s.completed && s.trigger)
        .reduce(
          (acc, stage) => {
            acc[stage.trigger!] = (acc[stage.trigger!] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

      return {
        totalStagesCompleted: completedStages.length,
        overallPercentage:
          (completedStages.length / PROFILE_STAGES.length) * 100,
        totalTimeSpent: totalTime,
        averageTimePerStage:
          completedStages.length > 0 ? totalTime / completedStages.length : 0,
        stageInsights,
        mostEffectiveTrigger: Object.entries(triggerEffectiveness).sort(
          ([, a], [, b]) => b - a,
        )[0]?.[0],
        dropOffPoints: stageInsights
          .filter((s) => !s.completed)
          .map((s) => s.stage),
        milestones: milestones || [],
      };
    },
    enabled: !!userId,
  });

  return {
    analytics,
    isLoading,
  };
}

// ====================================================================
// BEHAVIORAL PROFILE COMPLETION HOOK
// ====================================================================

export function useBehavioralProfileCompletion(userId: string) {
  const { userProfile } = useAuth();
  const { completion, updateStage, completeStage } =
    useProfileCompletion(userId);
  const [behavioralState, setBehavioralState] = useState({
    isActivelyCompleting: false,
    currentSession: null as any,
    stageAttempts: {} as Record<ProfileStage, number>,
    timeSpent: {} as Record<ProfileStage, number>,
    abandonmentRisk: "low" as "low" | "medium" | "high",
  });

  // Track user behavior during profile completion
  useEffect(() => {
    if (!userProfile) return;

    let sessionStart = Date.now();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab - track abandonment risk
        const timeSpent = Date.now() - sessionStart;
        setBehavioralState((prev) => ({
          ...prev,
          abandonmentRisk:
            timeSpent < 30000 ? "high" : timeSpent < 120000 ? "medium" : "low",
        }));
      } else {
        sessionStart = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      // Track page abandonment
      const timeSpent = Date.now() - sessionStart;
      if (timeSpent > 10000) {
        // Only track if spent meaningful time
        trackCompletionAbandonment(userId, timeSpent);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userProfile, userId]);

  // Auto-detect stage completion based on profile changes
  useEffect(() => {
    if (!userProfile) return;

    const engine = ProfileCompletionEngine.getInstance();

    PROFILE_STAGES.forEach((stageConfig) => {
      const isComplete = engine.isStageComplete(stageConfig.stage);
      const currentCompletion = completion.find(
        (c) => c.stage === stageConfig.stage,
      );

      if (isComplete && currentCompletion?.status !== "completed") {
        // Stage just completed - celebrate and track
        const timeSpent = behavioralState.timeSpent[stageConfig.stage] || 0;

        completeStage(stageConfig.stage, timeSpent);

        // Track successful completion
        trackCompletionSuccess(userId, stageConfig.stage, timeSpent);
      }
    });
  }, [userProfile, completion, completeStage, userId]);

  const trackCompletionAbandonment = async (
    userId: string,
    timeSpent: number,
  ) => {
    try {
      await supabase.from("user_interactions").insert({
        user_id: userId,
        event_type: "profile_abandonment",
        event_name: "profile_completion_abandoned",
        event_data: {
          time_spent: timeSpent,
          abandonment_risk: behavioralState.abandonmentRisk,
          current_stage: behavioralState.currentSession?.stage,
        },
      });
    } catch (error) {
      console.error("Error tracking abandonment:", error);
    }
  };

  const trackCompletionSuccess = async (
    userId: string,
    stage: ProfileStage,
    timeSpent: number,
  ) => {
    try {
      await supabase.from("user_interactions").insert({
        user_id: userId,
        event_type: "profile_completion",
        event_name: "stage_completed",
        event_data: {
          stage,
          time_spent: timeSpent,
          trigger_used: behavioralState.currentSession?.trigger,
        },
      });
    } catch (error) {
      console.error("Error tracking completion:", error);
    }
  };

  return {
    behavioralState,
    updateBehavioralState: setBehavioralState,
    trackCompletionAbandonment,
    trackCompletionSuccess,
  };
}

// ====================================================================
// PROFILE COMPLETION NUDGE INTEGRATION
// ====================================================================

export function useProfileCompletionNudges(userId: string) {
  const { completion, currentStage } = useProfileCompletion(userId);
  const [nudges, setNudges] = useState<any[]>([]);

  // Generate contextual nudges based on completion state
  useEffect(() => {
    if (!currentStage) return;

    const stageConfig = PROFILE_STAGES.find((s) => s.stage === currentStage);
    if (!stageConfig) return;

    const currentCompletion = completion.find((c) => c.stage === currentStage);
    if (!currentCompletion || currentCompletion.status === "completed") return;

    // Generate stage-specific nudge
    const nudge = {
      nudge_id: `profile_${currentStage}_${Date.now()}`,
      user_id: userId,
      nudge_type: "contextual",
      trigger_type: "onboarding",
      priority:
        currentCompletion.completion_percentage < 50 ? "high" : "medium",
      title: `Complete ${stageConfig.title}`,
      message: stageConfig.subtitle,
      icon: stageConfig.icon,
      cta_label: "Continue",
      cta_action: {
        type: "navigate",
        path: `/profile?stage=${currentStage}`,
      },
      condition_rules: [
        {
          field: "profile_completion",
          operator: "less_than",
          value: 100,
          logical: "AND",
        },
      ],
      frequency_rules: {
        type: "daily",
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
    };

    setNudges([nudge]);
  }, [currentStage, completion, userId]);

  return { nudges };
}

// ====================================================================
// COMPLETION STREAK TRACKING
// ====================================================================

export function useCompletionStreak(userId: string) {
  const { data: streak, isLoading } = useQuery({
    queryKey: ["completion-streak", userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get recent completions
      const { data: recentCompletions } = await supabase
        .from("profile_completion")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(7);

      if (!recentCompletions || recentCompletions.length === 0) {
        return { current: 0, longest: 0, lastCompleted: null };
      }

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < recentCompletions.length; i++) {
        const completionDate = new Date(recentCompletions[i].completed_at!);
        completionDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysDiff === i) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;

      const sortedCompletions = recentCompletions.sort(
        (a, b) =>
          new Date(a.completed_at!).getTime() -
          new Date(b.completed_at!).getTime(),
      );

      for (const completion of sortedCompletions) {
        const completionDate = new Date(completion.completed_at!);
        completionDate.setHours(0, 0, 0, 0);

        if (lastDate) {
          const daysDiff = Math.floor(
            (completionDate.getTime() - lastDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          if (daysDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }

        lastDate = completionDate;
      }

      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      return {
        current: currentStreak,
        longest: longestStreak,
        lastCompleted: recentCompletions[0].completed_at,
      };
    },
    enabled: !!userId,
  });

  return { streak, isLoading };
}

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

export function calculateProfileScore(userProfile: any): {
  score: number;
  grade: string;
  insights: string[];
} {
  const engine = ProfileCompletionEngine.getInstance();
  engine.updateUserProfile(userProfile);

  const completion = engine.calculateOverallCompletion();
  let score = 0;
  const insights: string[] = [];

  // Base score from completion
  score += completion * 0.6;

  // Bonus points for verification
  if (userProfile?.is_verified) {
    score += 20;
    insights.push("Verified account (+20 points)");
  }

  // Bonus points for social connections
  if (userProfile?.friends_count > 0) {
    score += Math.min(userProfile.friends_count * 2, 20);
    insights.push(
      `Connected with ${userProfile.friends_count} friends (+${Math.min(userProfile.friends_count * 2, 20)} points)`,
    );
  }

  // Bonus points for trek participation
  if (userProfile?.total_treks > 0) {
    score += Math.min(userProfile.total_treks * 5, 25);
    insights.push(
      `Completed ${userProfile.total_treks} treks (+${Math.min(userProfile.total_treks * 5, 25)} points)`,
    );
  }

  // Bonus points for activity
  if (userProfile?.last_active) {
    const daysSinceActive = Math.floor(
      (Date.now() - new Date(userProfile.last_active).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysSinceActive <= 1) {
      score += 10;
      insights.push("Active today (+10 points)");
    } else if (daysSinceActive <= 7) {
      score += 5;
      insights.push("Active this week (+5 points)");
    }
  }

  // Determine grade
  let grade: string;
  if (score >= 90) grade = "A+";
  else if (score >= 80) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 60) grade = "C";
  else if (score >= 50) grade = "D";
  else grade = "F";

  return {
    score: Math.round(score),
    grade,
    insights,
  };
}

export function getProfileCompletionTips(userProfile: any): {
  quick_wins: string[];
  medium_term: string[];
  long_term: string[];
  psychology_tips: string[];
} {
  const engine = ProfileCompletionEngine.getInstance();
  engine.updateUserProfile(userProfile);

  const currentStage = engine.getCurrentStage();
  const quick_wins: string[] = [];
  const medium_term: string[] = [];
  const long_term: string[] = [];
  const psychology_tips: string[] = [];

  if (!userProfile?.avatar_url) {
    quick_wins.push("Upload a profile photo (2 minutes)");
    psychology_tips.push("People with photos get 3x more friend requests");
  }

  if (!userProfile?.bio || userProfile.bio.length < 20) {
    quick_wins.push("Write a short bio about your adventure style (3 minutes)");
    psychology_tips.push(
      "A good bio helps others understand your trekking interests",
    );
  }

  if (!userProfile?.interests || userProfile.interests.length === 0) {
    medium_term.push("Set your adventure preferences (2 minutes)");
    psychology_tips.push(
      "Personalized preferences lead to better trek recommendations",
    );
  }

  if (!userProfile?.is_verified) {
    medium_term.push("Verify your account with government ID (5 minutes)");
    psychology_tips.push(
      "Verification builds trust and unlocks premium features",
    );
  }

  if (!userProfile?.friends_count || userProfile.friends_count === 0) {
    long_term.push("Connect with trekking friends (3 minutes)");
    psychology_tips.push(
      "Trekking with friends makes experiences more memorable",
    );
  }

  return {
    quick_wins,
    medium_term,
    long_term,
    psychology_tips,
  };
}
