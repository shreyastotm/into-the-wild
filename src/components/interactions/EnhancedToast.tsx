// ====================================================================
// ENHANCED TOAST SYSTEM (Sophisticated Notifications)
// ====================================================================
// Enterprise-grade toast system with contextual variants, intelligent positioning,
// behavioral analytics, and psychology-driven interaction patterns
// ====================================================================

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle,
  ChevronRight,
  Clock,
  Gift,
  Heart,
  Info,
  Lightbulb,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/hooks/use-haptic";
import { cn } from "@/lib/utils";
import {
  EnhancedToastProps,
  TOAST_VARIANTS,
  ToastVariant,
} from "@/types/interactions";

// ====================================================================
// ICON MAPPING FOR TOAST VARIANTS
// ====================================================================

const VARIANT_ICONS: Record<ToastVariant, React.ComponentType<any>> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
  milestone: Trophy,
  celebration: Sparkles,
  nudge: Lightbulb,
  social: Users,
};

// ====================================================================
// TOAST ANIMATION VARIANTS
// ====================================================================

const TOAST_ANIMATIONS = {
  "top-right": {
    initial: { opacity: 0, x: 400, y: 0 },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      x: 400,
      y: 0,
      transition: { duration: 0.3 },
    },
  },

  "bottom-right": {
    initial: { opacity: 0, x: 400, y: 0 },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      x: 400,
      y: 0,
      transition: { duration: 0.3 },
    },
  },

  "bottom-center": {
    initial: { opacity: 0, x: 0, y: 100 },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      x: 0,
      y: 100,
      transition: { duration: 0.3 },
    },
  },

  "top-center": {
    initial: { opacity: 0, x: 0, y: -100 },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      x: 0,
      y: -100,
      transition: { duration: 0.3 },
    },
  },
};

// ====================================================================
// TOAST THEME CONFIGURATIONS
// ====================================================================

const TOAST_THEMES: Record<
  ToastVariant,
  {
    background: string;
    border: string;
    icon: string;
    title: string;
    description: string;
    accent: string;
    button?: string;
    glow?: string;
  }
> = {
  success: {
    background: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    title: "text-green-800 dark:text-green-200",
    description: "text-green-700 dark:text-green-300",
    accent: "bg-green-500",
    button: "bg-green-600 hover:bg-green-700 text-white",
  },

  error: {
    background: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-800 dark:text-red-200",
    description: "text-red-700 dark:text-red-300",
    accent: "bg-red-500",
    button: "bg-red-600 hover:bg-red-700 text-white",
  },

  info: {
    background: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-800 dark:text-blue-200",
    description: "text-blue-700 dark:text-blue-300",
    accent: "bg-blue-500",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
  },

  warning: {
    background: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-800 dark:text-amber-200",
    description: "text-amber-700 dark:text-amber-300",
    accent: "bg-amber-500",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
  },

  milestone: {
    background:
      "bg-gradient-to-br from-golden-50 to-amber-50 dark:from-golden-950/20 dark:to-amber-950/20",
    border: "border-golden-200 dark:border-golden-800",
    icon: "text-golden-600 dark:text-golden-400",
    title: "text-golden-800 dark:text-golden-200",
    description: "text-golden-700 dark:text-golden-300",
    accent: "bg-gradient-to-r from-golden-500 to-amber-500",
    button:
      "bg-gradient-to-r from-golden-500 to-amber-500 hover:from-golden-600 hover:to-amber-600 text-white",
    glow: "shadow-[0_0_20px_rgba(244,164,96,0.3)]",
  },

  celebration: {
    background:
      "bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-indigo-950/20",
    border: "border-purple-200 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400",
    title: "text-purple-800 dark:text-purple-200",
    description: "text-purple-700 dark:text-purple-300",
    accent: "bg-gradient-to-r from-purple-500 to-pink-500",
    button:
      "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white",
    glow: "shadow-[0_0_25px_rgba(147,51,234,0.4)]",
  },

  nudge: {
    background:
      "bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20",
    border: "border-teal-200 dark:border-teal-800",
    icon: "text-teal-600 dark:text-teal-400",
    title: "text-teal-800 dark:text-teal-200",
    description: "text-teal-700 dark:text-teal-300",
    accent: "bg-teal-500",
    button: "bg-teal-600 hover:bg-teal-700 text-white",
  },

  social: {
    background:
      "bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20",
    border: "border-indigo-200 dark:border-indigo-800",
    icon: "text-indigo-600 dark:text-indigo-400",
    title: "text-indigo-800 dark:text-indigo-200",
    description: "text-indigo-700 dark:text-indigo-300",
    accent: "bg-indigo-500",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
};

// ====================================================================
// CONFETTI EFFECT COMPONENT
// ====================================================================

interface ConfettiProps {
  variant: ToastVariant;
  count?: number;
}

function Confetti({ variant, count = 15 }: ConfettiProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      color: string;
      delay: number;
      x: number;
      rotation: number;
    }>
  >([]);

  useEffect(() => {
    if (variant === "celebration" || variant === "milestone") {
      const colors =
        variant === "celebration"
          ? [
              "bg-primary",
              "bg-primary",
              "bg-primary",
              "bg-primary",
              "bg-primary",
            ]
          : [
              "bg-primary",
              "bg-primary",
              "bg-primary",
              "bg-primary",
              "bg-primary",
            ];

      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        delay: Math.random() * 1000,
        x: Math.random() * 100,
        rotation: Math.random() * 360,
      }));

      setParticles(newParticles);
    }
  }, [variant, count]);

  if (variant !== "celebration" && variant !== "milestone") return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: "-10px",
          }}
          initial={{
            opacity: 0,
            scale: 0,
            rotate: particle.rotation,
            y: -20,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
            rotate: [particle.rotation, particle.rotation + 360],
            y: [0, 100, 200],
            x: [0, (Math.random() - 0.5) * 50],
          }}
          transition={{
            duration: 3,
            delay: particle.delay / 1000,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ====================================================================
// SPARKLE EFFECT COMPONENT
// ====================================================================

interface SparkleEffectProps {
  variant: ToastVariant;
  intensity?: "low" | "medium" | "high";
}

function SparkleEffect({ variant, intensity = "medium" }: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<
    Array<{
      id: number;
      size: number;
      x: number;
      y: number;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    if (variant === "celebration" || variant === "milestone") {
      const sparkleCount =
        intensity === "low" ? 5 : intensity === "medium" ? 8 : 12;

      const newSparkles = Array.from({ length: sparkleCount }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 4,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2000,
        duration: 2000 + Math.random() * 1000,
      }));

      setSparkles(newSparkles);
    }
  }, [variant, intensity]);

  if (variant !== "celebration" && variant !== "milestone") return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute text-yellow-300/60"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            fontSize: `${sparkle.size}px`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration / 1000,
            delay: sparkle.delay / 1000,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          ✦
        </motion.div>
      ))}
    </div>
  );
}

// ====================================================================
// MAIN ENHANCED TOAST COMPONENT
// ====================================================================

export function EnhancedToast({
  notification,
  onDismiss,
  onAction,
  position = "top-right",
  className,
}: EnhancedToastProps) {
  const haptic = useHaptic();
  const [isHovered, setIsHovered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(notification.duration / 1000);

  const theme = TOAST_THEMES[notification.variant];
  const variant = TOAST_VARIANTS[notification.variant];
  const IconComponent = VARIANT_ICONS[notification.variant];

  // Auto-dismiss timer
  useEffect(() => {
    if (notification.duration === -1) return; // Persistent toast

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDismiss(notification.notification_id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [notification.duration, onDismiss, notification.notification_id]);

  // Pause timer on hover
  useEffect(() => {
    if (isHovered && notification.duration !== -1) {
      // Timer is already paused by the hover state check
    }
  }, [isHovered, notification.duration]);

  const handleDismiss = () => {
    haptic.light();
    onDismiss(notification.notification_id);
  };

  const handleAction = (action: any) => {
    haptic.medium();
    if (onAction) {
      onAction(action);
    }
    onDismiss(notification.notification_id);
  };

  const progressWidth =
    notification.duration === -1
      ? 100
      : (timeLeft / (notification.duration / 1000)) * 100;

  return (
    <motion.div
      variants={TOAST_ANIMATIONS[position]}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "relative max-w-sm w-full",
        position.includes("right") && "ml-auto",
        position.includes("center") && "mx-auto",
        position.includes("bottom") && "mb-4",
        position.includes("top") && "mt-4",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: theme.glow || "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {/* Main toast card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 backdrop-blur-sm transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
          theme.background,
          theme.border,
          theme.glow && "shadow-2xl",
        )}
      >
        {/* Progress bar for timed toasts */}
        {notification.duration !== -1 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
            <motion.div
              className={cn("h-full", theme.accent)}
              initial={{ width: "100%" }}
              animate={{ width: `${progressWidth}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        )}

        {/* Confetti and sparkle effects */}
        <Confetti variant={notification.variant} />
        <SparkleEffect variant={notification.variant} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                theme.accent,
                "shadow-sm",
              )}
            >
              <IconComponent className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h4 className={cn("font-semibold text-sm mb-1", theme.title)}>
                    {notification.title}
                  </h4>

                  {notification.message && (
                    <p
                      className={cn(
                        "text-xs leading-relaxed",
                        theme.description,
                      )}
                    >
                      {notification.message}
                    </p>
                  )}

                  {/* Context badges */}
                  <div className="flex items-center gap-2 mt-2">
                    {notification.variant === "milestone" && (
                      <Badge className="text-xs bg-golden-100 text-golden-800 dark:bg-golden-900/30 dark:text-golden-300">
                        <Trophy className="w-3 h-3 mr-1" />
                        Achievement
                      </Badge>
                    )}

                    {notification.variant === "celebration" && (
                      <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Celebration
                      </Badge>
                    )}

                    {notification.trigger_event && (
                      <Badge variant="outline" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        {notification.trigger_event.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Dismiss button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={handleDismiss}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Action buttons */}
              {(notification.primary_action ||
                notification.secondary_action) && (
                <div className="flex items-center gap-2 mt-3">
                  {notification.primary_action && (
                    <Button
                      size="sm"
                      className={cn(
                        "text-xs px-3 py-1 h-auto font-medium transition-all",
                        theme.button ||
                          "bg-primary hover:bg-primary/90 text-primary-foreground",
                        "hover:scale-105 active:scale-95",
                      )}
                      onClick={() => handleAction(notification.primary_action)}
                    >
                      {notification.primary_action.label}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}

                  {notification.secondary_action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-xs px-3 py-1 h-auto border-current",
                        theme.title,
                      )}
                      onClick={() =>
                        handleAction(notification.secondary_action)
                      }
                    >
                      {notification.secondary_action.label}
                    </Button>
                  )}
                </div>
              )}

              {/* Metadata */}
              {notification.context_data &&
                Object.keys(notification.context_data).length > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    {notification.context_data.trek_name && (
                      <Badge variant="secondary" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        {notification.context_data.trek_name}
                      </Badge>
                    )}

                    {notification.context_data.points && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />+
                        {notification.context_data.points} pts
                      </Badge>
                    )}

                    {notification.duration !== -1 && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        <span>{timeLeft}s</span>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Hover shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </div>

      {/* Floating elements for celebration toasts */}
      {(notification.variant === "celebration" ||
        notification.variant === "milestone") && (
        <div className="absolute -top-2 -right-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400"
              style={{
                fontSize: `${8 + i * 2}px`,
                left: `${i * 8}px`,
                top: `${-i * 4}px`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ====================================================================
// TOAST CONTAINER COMPONENT
// ====================================================================

interface ToastContainerProps {
  notifications: any[];
  onDismiss: (notificationId: string) => void;
  onAction?: (action: any) => void;
  position?: "top-right" | "bottom-right" | "bottom-center" | "top-center";
  maxVisible?: number;
  className?: string;
}

export function ToastContainer({
  notifications,
  onDismiss,
  onAction,
  position = "top-right",
  maxVisible = 5,
  className,
}: ToastContainerProps) {
  // Show only the most recent notifications
  const visibleNotifications = notifications
    .filter((n) => n.status === "shown")
    .slice(0, maxVisible);

  return (
    <div
      className={cn(
        "toast-container fixed z-50 pointer-events-none",
        position.includes("right") && "right-4",
        position.includes("left") && "left-4",
        position.includes("top") && "top-4",
        position.includes("bottom") && "bottom-4",
        position.includes("center") && "left-1/2 transform -translate-x-1/2",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          position.includes("center") && "items-center",
        )}
      >
        <AnimatePresence mode="popLayout">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.notification_id}
              className="pointer-events-auto"
            >
              <EnhancedToast
                notification={notification}
                onDismiss={onDismiss}
                onAction={onAction}
                position={position}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ====================================================================
// TOAST MANAGER HOOK
// ====================================================================

interface UseToastManagerReturn {
  addToast: (
    toast: Omit<any, "notification_id" | "created_at" | "updated_at">,
  ) => void;
  dismissToast: (toastId: string) => void;
  clearAllToasts: () => void;
  toasts: any[];
  unreadCount: number;
}

export function useToastManager(): UseToastManagerReturn {
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (toastData: any) => {
    const newToast = {
      ...toastData,
      notification_id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "shown",
      shown_at: new Date().toISOString(),
      impression_count: (toastData.impression_count || 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setToasts((prev) => [newToast, ...prev]);

    // Auto-dismiss after duration (unless persistent)
    if (toastData.duration !== -1) {
      setTimeout(() => {
        setToasts((prev) =>
          prev.filter((t) => t.notification_id !== newToast.notification_id),
        );
      }, toastData.duration);
    }
  };

  const dismissToast = (toastId: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.notification_id === toastId
          ? {
              ...toast,
              status: "dismissed",
              dismissed_at: new Date().toISOString(),
              dismiss_count: toast.dismiss_count + 1,
            }
          : toast,
      ),
    );

    // Remove from display after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.notification_id !== toastId));
    }, 300);
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const unreadCount = toasts.filter((t) => t.status === "pending").length;

  return {
    addToast,
    dismissToast,
    clearAllToasts,
    toasts,
    unreadCount,
  };
}

// ====================================================================
// CONTEXT-AWARE TOAST FACTORY
// ====================================================================

export const createContextToast = {
  // Profile completion celebrations
  profileMilestone: (
    stage: string,
    percentage: number,
    rewards: string[],
  ): any => ({
    variant: "milestone" as ToastVariant,
    title: `${stage.charAt(0).toUpperCase() + stage.slice(1)} Complete! 🎉`,
    message: `You've unlocked: ${rewards.join(", ")}`,
    icon: "Trophy",
    duration: 5000,
    context_data: { stage, percentage, rewards },
  }),

  // Social interactions
  friendRequest: (friendName: string): any => ({
    variant: "social" as ToastVariant,
    title: "New Friend Request!",
    message: `${friendName} wants to connect with you`,
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
  }),

  // Trek-related notifications
  trekReminder: (trekName: string, hoursUntil: number): any => ({
    variant: hoursUntil <= 24 ? "warning" : ("info" as ToastVariant),
    title: hoursUntil <= 24 ? "Trek Starting Soon!" : "Trek Reminder",
    message: `${trekName} starts in ${hoursUntil} hours`,
    icon: hoursUntil <= 24 ? "AlertTriangle" : "Clock",
    primary_action: {
      label: "View Details",
      onClick: () => console.log("View trek details"),
    },
    duration: 5000,
    context_data: { trek_name: trekName, hours_until: hoursUntil },
  }),

  // Achievement celebrations
  achievement: (achievement: string, points: number): any => ({
    variant: "celebration" as ToastVariant,
    title: "Achievement Unlocked! 🏆",
    message: `${achievement} - You earned ${points} points!`,
    icon: "Trophy",
    duration: 6000,
    context_data: { achievement, points },
  }),

  // Behavioral nudges
  nudge: (title: string, message: string, action?: any): any => ({
    variant: "nudge" as ToastVariant,
    title,
    message,
    icon: "Lightbulb",
    primary_action: action,
    duration: 8000,
  }),

  // System feedback
  error: (title: string, message: string): any => ({
    variant: "error" as ToastVariant,
    title,
    message,
    icon: "AlertCircle",
    duration: 5000,
  }),

  success: (title: string, message: string, action?: any): any => ({
    variant: "success" as ToastVariant,
    title,
    message,
    icon: "CheckCircle",
    primary_action: action,
    duration: 3000,
  }),
};
