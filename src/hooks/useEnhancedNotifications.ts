// ====================================================================
// ENHANCED NOTIFICATIONS HOOK (Sophisticated Toast System)
// ====================================================================
// Enterprise-grade notification management with contextual awareness,
// intelligent scheduling, behavioral analytics, and psychology-driven UX
// ====================================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  EnhancedNotification,
  ToastAction,
  ToastVariant,
  UseEnhancedNotificationsReturn,
} from "@/types/interactions";

// ====================================================================
// NOTIFICATION ENGINE
// ====================================================================

class NotificationEngine {
  private static instance: NotificationEngine;
  private userPreferences: any = null;
  private notificationQueue: EnhancedNotification[] = [];
  private activeNotifications: Set<string> = new Set();
  private sessionStart: Date = new Date();

  static getInstance(): NotificationEngine {
    if (!NotificationEngine.instance) {
      NotificationEngine.instance = new NotificationEngine();
    }
    return NotificationEngine.instance;
  }

  updatePreferences(preferences: any) {
    this.userPreferences = preferences;
  }

  shouldShowNotification(notification: EnhancedNotification): boolean {
    // Check if already shown recently
    if (this.activeNotifications.has(notification.notification_id)) {
      return false;
    }

    // Check user preferences
    if (this.userPreferences) {
      const variantAllowed = this.checkVariantPermission(notification.variant);
      const timingAllowed = this.checkTimingPermission(notification);

      if (!variantAllowed || !timingAllowed) {
        return false;
      }
    }

    // Check quiet hours
    if (this.isInQuietHours()) {
      return false;
    }

    // Check notification limits (max 3 visible at once)
    if (this.activeNotifications.size >= 3) {
      return false;
    }

    return true;
  }

  private checkVariantPermission(variant: ToastVariant): boolean {
    if (!this.userPreferences?.notification_channels) return true;

    switch (variant) {
      case "milestone":
      case "celebration":
        return this.userPreferences.notification_channels.includes(
          "celebration",
        );
      case "social":
        return this.userPreferences.notification_channels.includes("social");
      default:
        return this.userPreferences.notification_channels.includes("general");
    }
  }

  private checkTimingPermission(notification: EnhancedNotification): boolean {
    if (
      !this.userPreferences?.quiet_hours_start ||
      !this.userPreferences?.quiet_hours_end
    ) {
      return true;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const quietStart = this.parseTime(this.userPreferences.quiet_hours_start);
    const quietEnd = this.parseTime(this.userPreferences.quiet_hours_end);

    if (quietStart <= quietEnd) {
      return currentTime < quietStart || currentTime > quietEnd;
    } else {
      return currentTime < quietStart && currentTime > quietEnd;
    }
  }

  private isInQuietHours(): boolean {
    if (
      !this.userPreferences?.quiet_hours_start ||
      !this.userPreferences?.quiet_hours_end
    ) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const quietStart = this.parseTime(this.userPreferences.quiet_hours_start);
    const quietEnd = this.parseTime(this.userPreferences.quiet_hours_end);

    if (quietStart <= quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd;
    } else {
      return currentTime >= quietStart || currentTime <= quietEnd;
    }
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }

  addToQueue(notification: EnhancedNotification) {
    this.notificationQueue.push(notification);
    this.processQueue();
  }

  private async processQueue() {
    // Sort by priority and schedule
    const sortedQueue = this.notificationQueue
      .filter((n) => this.shouldShowNotification(n))
      .sort((a, b) => {
        // Priority first
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // Then by scheduled time
        if (a.scheduled_for && b.scheduled_for) {
          return (
            new Date(a.scheduled_for).getTime() -
            new Date(b.scheduled_for).getTime()
          );
        }
        return 0;
      });

    // Show top notifications
    for (const notification of sortedQueue.slice(0, 3)) {
      this.activeNotifications.add(notification.notification_id);
      this.notificationQueue = this.notificationQueue.filter(
        (n) => n.notification_id !== notification.notification_id,
      );

      // Auto-dismiss after duration
      if (notification.duration !== -1) {
        setTimeout(() => {
          this.activeNotifications.delete(notification.notification_id);
        }, notification.duration);
      }
    }
  }

  dismissNotification(notificationId: string) {
    this.activeNotifications.delete(notificationId);
    this.processQueue();
  }

  clearAll() {
    this.activeNotifications.clear();
    this.notificationQueue = [];
  }
}

// ====================================================================
// MAIN ENHANCED NOTIFICATIONS HOOK
// ====================================================================

export function useEnhancedNotifications(): UseEnhancedNotificationsReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const engine = NotificationEngine.getInstance();

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["enhanced-notifications", user?.id],
    queryFn: async (): Promise<EnhancedNotification[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("enhanced_notifications")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["pending", "shown"])
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Check for new notifications every 5 seconds
  });

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_preference_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // Ignore "not found" error
      return data;
    },
    enabled: !!user?.id,
  });

  // Update engine preferences
  useEffect(() => {
    if (preferences) {
      engine.updatePreferences(preferences);
    }
  }, [preferences]);

  // Add notification
  const addNotificationMutation = useMutation({
    mutationFn: async (
      notification: Omit<
        EnhancedNotification,
        "notification_id" | "created_at" | "updated_at"
      >,
    ) => {
      const { error } = await supabase.from("enhanced_notifications").insert({
        ...notification,
        user_id: user!.id,
        status: "pending",
        impression_count: 0,
        click_count: 0,
        dismiss_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enhanced-notifications", user?.id],
      });
    },
  });

  // Mark as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("enhanced_notifications")
        .update({
          status: "read",
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("notification_id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enhanced-notifications", user?.id],
      });
    },
  });

  // Mark as dismissed
  const markAsDismissedMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("enhanced_notifications")
        .update({
          status: "dismissed",
          dismissed_at: new Date().toISOString(),
          dismiss_count: supabase.raw("dismiss_count + 1"),
          updated_at: new Date().toISOString(),
        })
        .eq("notification_id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enhanced-notifications", user?.id],
      });
      engine.dismissNotification(notificationId);
    },
  });

  // Process pending notifications
  useEffect(() => {
    const pendingNotifications = notifications.filter(
      (n) => n.status === "pending",
    );

    pendingNotifications.forEach((notification) => {
      // Check if it's time to show
      if (notification.scheduled_for) {
        const scheduledTime = new Date(notification.scheduled_for);
        if (scheduledTime <= new Date()) {
          // Show notification
          engine.addToQueue({
            ...notification,
            status: "shown",
            shown_at: new Date().toISOString(),
            impression_count: notification.impression_count + 1,
          });

          // Update in database
          markAsReadMutation.mutate(notification.notification_id);
        }
      } else {
        // Show immediately
        engine.addToQueue({
          ...notification,
          status: "shown",
          shown_at: new Date().toISOString(),
          impression_count: notification.impression_count + 1,
        });

        markAsReadMutation.mutate(notification.notification_id);
      }
    });
  }, [notifications, markAsReadMutation]);

  // Add notification
  const addNotification = useCallback(
    (
      notification: Omit<
        EnhancedNotification,
        "notification_id" | "created_at" | "updated_at"
      >,
    ) => {
      addNotificationMutation.mutate(notification);
    },
    [addNotificationMutation],
  );

  // Mark as read
  const markAsRead = useCallback(
    (notificationId: string) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation],
  );

  // Mark as dismissed
  const markAsDismissed = useCallback(
    (notificationId: string) => {
      markAsDismissedMutation.mutate(notificationId);
    },
    [markAsDismissedMutation],
  );

  // Clear all notifications
  const clearAll = useCallback(() => {
    engine.clearAll();
    // Mark all as dismissed in database
    notifications.forEach((notification) => {
      if (notification.status === "shown") {
        markAsDismissedMutation.mutate(notification.notification_id);
      }
    });
  }, [notifications, markAsDismissedMutation]);

  const unreadCount = notifications.filter(
    (n) => n.status === "pending",
  ).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAsDismissed,
    clearAll,
    isLoading,
    error: error?.message || null,
  };
}

// ====================================================================
// CONTEXT-AWARE NOTIFICATION FACTORY
// ====================================================================

export const createContextNotification = {
  // Profile completion celebrations
  profileMilestone: (
    stage: string,
    percentage: number,
    rewards: string[],
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "milestone",
    title: `${stage.charAt(0).toUpperCase() + stage.slice(1)} Complete! 🎉`,
    message: `You've unlocked: ${rewards.join(", ")}`,
    icon: "Trophy",
    duration: 5000,
    display_position: "bottom-center",
    context_data: { stage, percentage, rewards },
    priority: 8,
    status: "pending",
  }),

  // Social interactions
  friendRequest: (
    friendName: string,
    mutualTreks: number = 0,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "social",
    title: "New Friend Request!",
    message: `${friendName} wants to connect${mutualTreks > 0 ? ` (${mutualTreks} mutual treks)` : ""}`,
    icon: "Users",
    primary_action: {
      label: "Accept",
      onClick: () => console.log("Accept friend request"),
    },
    secondary_action: {
      label: "View Profile",
      onClick: () => console.log("View profile"),
    },
    duration: 6000,
    display_position: "top-right",
    context_data: { friend_name: friendName, mutual_treks: mutualTreks },
    priority: 7,
    status: "pending",
  }),

  // Trek-related notifications
  trekReminder: (
    trekName: string,
    hoursUntil: number,
    urgency: "low" | "medium" | "high" = "medium",
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: urgency === "high" ? "warning" : "info",
    title: urgency === "high" ? "Trek Starting Soon!" : "Trek Reminder",
    message: `${trekName} starts in ${hoursUntil} hours`,
    icon: urgency === "high" ? "AlertTriangle" : "Clock",
    primary_action: {
      label: "View Details",
      onClick: () => console.log("View trek details"),
    },
    duration: urgency === "high" ? 8000 : 5000,
    display_position: urgency === "high" ? "top-center" : "bottom-right",
    context_data: { trek_name: trekName, hours_until: hoursUntil, urgency },
    priority: urgency === "high" ? 9 : 6,
    status: "pending",
  }),

  // Achievement celebrations
  achievement: (
    achievement: string,
    points: number,
    badge?: string,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "celebration",
    title: "Achievement Unlocked! 🏆",
    message: `${achievement}${badge ? ` - ${badge}` : ""}`,
    icon: "Trophy",
    duration: 6000,
    display_position: "bottom-center",
    context_data: { achievement, points, badge },
    priority: 10,
    status: "pending",
  }),

  // Behavioral nudges
  nudge: (
    title: string,
    message: string,
    action?: ToastAction,
    priority: number = 5,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "nudge",
    title,
    message,
    icon: "Lightbulb",
    primary_action: action,
    duration: 8000,
    display_position: "bottom-right",
    context_data: {},
    priority,
    status: "pending",
  }),

  // System feedback
  error: (
    title: string,
    message: string,
    action?: ToastAction,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "error",
    title,
    message,
    icon: "AlertCircle",
    primary_action: action,
    duration: 5000,
    display_position: "top-center",
    context_data: {},
    priority: 10,
    status: "pending",
  }),

  success: (
    title: string,
    message: string,
    action?: ToastAction,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "success",
    title,
    message,
    icon: "CheckCircle",
    primary_action: action,
    duration: 3000,
    display_position: "bottom-center",
    context_data: {},
    priority: 5,
    status: "pending",
  }),

  // Payment and verification
  paymentVerified: (
    trekName: string,
    amount: number,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "success",
    title: "Payment Verified! ✅",
    message: `Your payment of ₹${amount.toLocaleString("en-IN")} for ${trekName} has been confirmed`,
    icon: "CheckCircle",
    primary_action: {
      label: "View Trek",
      onClick: () => console.log("View trek details"),
    },
    duration: 4000,
    display_position: "top-center",
    context_data: { trek_name: trekName, amount },
    priority: 8,
    status: "pending",
  }),

  // Weather alerts
  weatherAlert: (
    trekName: string,
    alertType: "warning" | "danger",
    message: string,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: alertType === "danger" ? "error" : "warning",
    title: `${alertType === "danger" ? "⚠️" : "🌤️"} Weather Alert`,
    message: `${trekName}: ${message}`,
    icon: alertType === "danger" ? "AlertTriangle" : "Cloud",
    primary_action: {
      label: "View Details",
      onClick: () => console.log("View weather details"),
    },
    duration: alertType === "danger" ? 10000 : 6000,
    display_position: "top-center",
    context_data: {
      trek_name: trekName,
      alert_type: alertType,
      weather_message: message,
    },
    priority: alertType === "danger" ? 10 : 7,
    status: "pending",
  }),

  // Community engagement
  friendTagged: (
    friendName: string,
    trekName: string,
    imageUrl?: string,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "social",
    title: "You were tagged! 📸",
    message: `${friendName} tagged you in a photo from ${trekName}`,
    icon: "Camera",
    primary_action: {
      label: "View Photo",
      onClick: () => console.log("View tagged photo"),
    },
    secondary_action: {
      label: "View Trek",
      onClick: () => console.log("View trek"),
    },
    duration: 5000,
    display_position: "bottom-center",
    context_data: {
      friend_name: friendName,
      trek_name: trekName,
      image_url: imageUrl,
    },
    priority: 6,
    status: "pending",
  }),

  // Registration confirmations
  registrationConfirmed: (
    trekName: string,
    registrationId: string,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "success",
    title: "Registration Confirmed! 🎯",
    message: `You're all set for ${trekName}. Check your email for details.`,
    icon: "CheckCircle",
    primary_action: {
      label: "View Details",
      onClick: () => console.log("View registration details"),
    },
    duration: 4000,
    display_position: "top-center",
    context_data: { trek_name: trekName, registration_id: registrationId },
    priority: 7,
    status: "pending",
  }),

  // Post-trek feedback
  feedbackRequest: (
    trekName: string,
    daysSince: number,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "info",
    title: "How was your trek?",
    message: `Share your experience from ${trekName} (${daysSince} days ago)`,
    icon: "Star",
    primary_action: {
      label: "Rate Trek",
      onClick: () => console.log("Open rating modal"),
    },
    secondary_action: {
      label: "Maybe Later",
      onClick: () => console.log("Dismiss feedback request"),
    },
    duration: 7000,
    display_position: "bottom-center",
    context_data: { trek_name: trekName, days_since: daysSince },
    priority: 4,
    status: "pending",
  }),

  // WhatsApp integration
  whatsappInvite: (
    trekName: string,
    groupUrl: string,
  ): Omit<
    EnhancedNotification,
    "notification_id" | "created_at" | "updated_at"
  > => ({
    variant: "social",
    title: "Join your trek WhatsApp group! 💬",
    message: `Connect with fellow trekkers for ${trekName}`,
    icon: "MessageCircle",
    primary_action: {
      label: "Join Group",
      onClick: () => window.open(groupUrl, "_blank"),
    },
    duration: 6000,
    display_position: "top-center",
    context_data: { trek_name: trekName, group_url: groupUrl },
    priority: 8,
    status: "pending",
  }),
};

// ====================================================================
// NOTIFICATION ANALYTICS HOOK
// ====================================================================

export function useNotificationAnalytics(userId: string) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["notification-analytics", userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get all notifications for the user
      const { data: notifications } = await supabase
        .from("enhanced_notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { descending: true });

      if (!notifications) return null;

      // Calculate metrics
      const totalSent = notifications.length;
      const totalShown = notifications.filter((n) => n.shown_at).length;
      const totalClicked = notifications.filter((n) => n.clicked_at).length;
      const totalDismissed = notifications.filter((n) => n.dismissed_at).length;

      const showRate = totalSent > 0 ? (totalShown / totalSent) * 100 : 0;
      const clickThroughRate =
        totalShown > 0 ? (totalClicked / totalShown) * 100 : 0;
      const dismissalRate =
        totalShown > 0 ? (totalDismissed / totalShown) * 100 : 0;

      // Variant performance
      const variantStats = notifications.reduce(
        (acc, notification) => {
          if (!acc[notification.variant]) {
            acc[notification.variant] = {
              sent: 0,
              shown: 0,
              clicked: 0,
              dismissed: 0,
            };
          }

          acc[notification.variant].sent++;
          if (notification.shown_at) acc[notification.variant].shown++;
          if (notification.clicked_at) acc[notification.variant].clicked++;
          if (notification.dismissed_at) acc[notification.variant].dismissed++;

          return acc;
        },
        {} as Record<string, any>,
      );

      // Timing analysis
      const hourlyPerformance = notifications
        .filter((n) => n.shown_at && n.clicked_at)
        .reduce(
          (acc, notification) => {
            const hour = new Date(notification.shown_at!).getHours();
            if (!acc[hour]) acc[hour] = { shown: 0, clicked: 0 };
            acc[hour].shown++;
            acc[hour].clicked++;
            return acc;
          },
          {} as Record<number, any>,
        );

      const bestHour = Object.entries(hourlyPerformance).sort(
        ([, a], [, b]) => b.clicked / b.shown - a.clicked / a.shown,
      )[0]?.[0];

      return {
        totalSent,
        totalShown,
        totalClicked,
        totalDismissed,
        showRate: Math.round(showRate * 100) / 100,
        clickThroughRate: Math.round(clickThroughRate * 100) / 100,
        dismissalRate: Math.round(dismissalRate * 100) / 100,
        variantStats,
        bestHour: bestHour ? `${bestHour}:00` : null,
        averageResponseTime:
          notifications
            .filter((n) => n.shown_at && n.clicked_at)
            .reduce((sum, n) => {
              return (
                sum +
                (new Date(n.clicked_at!).getTime() -
                  new Date(n.shown_at!).getTime())
              );
            }, 0) /
            notifications.filter((n) => n.shown_at && n.clicked_at).length /
            1000 || 0,
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
// SMART NOTIFICATION SCHEDULING
// ====================================================================

export function useSmartNotificationScheduling(userId: string) {
  const { analytics } = useNotificationAnalytics(userId);
  const [optimalSchedule, setOptimalSchedule] = useState<{
    bestHours: number[];
    bestDays: string[];
    frequency: "low" | "medium" | "high";
  }>({
    bestHours: [9, 10, 11, 14, 15, 16],
    bestDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    frequency: "medium",
  });

  // Analyze user behavior and optimize scheduling
  useEffect(() => {
    if (analytics?.bestHour) {
      const bestHour = parseInt(analytics.bestHour.split(":")[0]);

      // Create optimal schedule based on analytics
      const optimalHours = [];
      for (let i = -1; i <= 1; i++) {
        const hour = bestHour + i;
        if (hour >= 8 && hour <= 20) {
          // Between 8 AM and 8 PM
          optimalHours.push(hour);
        }
      }

      setOptimalSchedule((prev) => ({
        ...prev,
        bestHours: optimalHours,
        frequency:
          analytics.clickThroughRate > 30
            ? "high"
            : analytics.clickThroughRate > 15
              ? "medium"
              : "low",
      }));
    }
  }, [analytics]);

  const scheduleNotification = useCallback(
    async (
      notification: Omit<
        EnhancedNotification,
        "notification_id" | "created_at" | "updated_at"
      >,
      delayMinutes: number = 0,
    ) => {
      const scheduledTime = new Date();
      scheduledTime.setMinutes(scheduledTime.getMinutes() + delayMinutes);

      const notificationWithSchedule = {
        ...notification,
        scheduled_for: scheduledTime.toISOString(),
        status: "pending" as const,
      };

      // Insert into database
      const { error } = await supabase
        .from("enhanced_notifications")
        .insert(notificationWithSchedule);

      if (error) throw error;

      return notificationWithSchedule;
    },
    [],
  );

  return {
    optimalSchedule,
    scheduleNotification,
    analytics,
  };
}

// ====================================================================
// NOTIFICATION BATCH OPERATIONS
// ====================================================================

export function useNotificationBatchOperations(userId: string) {
  const queryClient = useQueryClient();

  // Bulk mark as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("enhanced_notifications")
        .update({
          status: "read",
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("status", "pending");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enhanced-notifications", userId],
      });
    },
  });

  // Bulk dismiss
  const dismissAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("enhanced_notifications")
        .update({
          status: "dismissed",
          dismissed_at: new Date().toISOString(),
          dismiss_count: supabase.raw("dismiss_count + 1"),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .in("status", ["pending", "shown"]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enhanced-notifications", userId],
      });
    },
  });

  // Clear old notifications
  const clearOldNotificationsMutation = useMutation({
    mutationFn: async (daysOld: number = 30) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from("enhanced_notifications")
        .delete()
        .eq("user_id", userId)
        .eq("status", "read")
        .lt("updated_at", cutoffDate.toISOString());

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enhanced-notifications", userId],
      });
    },
  });

  return {
    markAllAsRead: markAllAsReadMutation.mutate,
    dismissAll: dismissAllMutation.mutate,
    clearOldNotifications: clearOldNotificationsMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDismissingAll: dismissAllMutation.isPending,
    isClearingOld: clearOldNotificationsMutation.isPending,
  };
}

// ====================================================================
// NOTIFICATION SOUND & HAPTIC FEEDBACK
// ====================================================================

export function useNotificationFeedback() {
  const playSound = useCallback((variant: ToastVariant) => {
    // Only play sound if user hasn't disabled it and page is visible
    if (document.hidden) return;
    if (!("Notification" in window)) return;

    // Check if user has granted notification permission
    if (Notification.permission !== "granted") return;

    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Simple notification sound based on variant
      const createSound = (
        frequency: number,
        duration: number,
        type: OscillatorType = "sine",
      ) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime,
        );
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.1,
          audioContext.currentTime + 0.01,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + duration,
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      switch (variant) {
        case "success":
          createSound(800, 0.2, "sine");
          break;
        case "error":
          createSound(400, 0.3, "sawtooth");
          break;
        case "milestone":
        case "celebration":
          // Celebration chord
          createSound(523, 0.5, "sine"); // C5
          setTimeout(() => createSound(659, 0.5, "sine"), 100); // E5
          setTimeout(() => createSound(784, 0.5, "sine"), 200); // G5
          break;
        case "warning":
          createSound(600, 0.2, "square");
          createSound(500, 0.2, "square");
          break;
        default:
          createSound(600, 0.15, "sine");
      }
    } catch (error) {
      console.warn("Audio playback not available:", error);
    }
  }, []);

  const triggerHapticFeedback = useCallback((variant: ToastVariant) => {
    if ("vibrate" in navigator) {
      switch (variant) {
        case "success":
          navigator.vibrate(50);
          break;
        case "error":
          navigator.vibrate([100, 50, 100]);
          break;
        case "milestone":
        case "celebration":
          navigator.vibrate([100, 50, 100, 50, 200]);
          break;
        case "warning":
          navigator.vibrate([200, 100, 200]);
          break;
        default:
          navigator.vibrate(30);
      }
    }
  }, []);

  return {
    playSound,
    triggerHapticFeedback,
  };
}
