// ====================================================================
// NUDGE SYSTEM COMPONENT (Behavioral Psychology-Driven Prompts)
// ====================================================================
// Enterprise-grade nudge rendering with sophisticated animations,
// contextual positioning, and psychology-based interaction patterns
// ====================================================================

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Camera,
  ChevronRight,
  Lightbulb,
  Mountain,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHaptic } from "@/hooks/use-haptic";
import { useNudgeSystem } from "@/hooks/useNudgeSystem";
import { cn } from "@/lib/utils";
import { NudgeSystemProps } from "@/types/interactions";

// ====================================================================
// ICON MAPPING
// ====================================================================

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Camera,
  Users,
  AlertCircle,
  Trophy,
  Lightbulb,
  Sparkles,
  Mountain,
  ChevronRight,
};

// ====================================================================
// NUDGE ANIMATION VARIANTS
// ====================================================================

const NUDGE_ANIMATIONS = {
  toast: {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  },

  modal: {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 },
    },
  },

  banner: {
    initial: { opacity: 0, height: 0 },
    animate: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.1 },
      },
    },
  },

  inline: {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
  },
};

// ====================================================================
// NUDGE THEME VARIANTS
// ====================================================================

const NUDGE_THEMES = {
  contextual: {
    background:
      "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    accent: "bg-blue-500",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
  },

  milestone: {
    background:
      "bg-gradient-to-r from-golden-50 to-amber-50 dark:from-golden-950/20 dark:to-amber-950/20",
    border: "border-golden-200 dark:border-golden-800",
    icon: "text-golden-600 dark:text-golden-400",
    accent: "bg-golden-500",
    button:
      "bg-gradient-to-r from-golden-500 to-amber-500 hover:from-golden-600 hover:to-amber-600 text-white",
  },

  social_proof: {
    background:
      "bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20",
    border: "border-teal-200 dark:border-teal-800",
    icon: "text-teal-600 dark:text-teal-400",
    accent: "bg-teal-500",
    button: "bg-teal-600 hover:bg-teal-700 text-white",
  },

  urgency: {
    background:
      "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    accent: "bg-red-500",
    button: "bg-red-600 hover:bg-red-700 text-white",
  },

  recurring: {
    background:
      "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    border: "border-purple-200 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400",
    accent: "bg-purple-500",
    button: "bg-purple-600 hover:bg-purple-700 text-white",
  },
};

// ====================================================================
// INDIVIDUAL NUDGE COMPONENT
// ====================================================================

interface NudgeCardProps {
  nudge: any;
  position: string;
  onDismiss: (nudgeId: string) => void;
  onClick: (nudge: any) => void;
  className?: string;
}

function NudgeCard({
  nudge,
  position,
  onDismiss,
  onClick,
  className,
}: NudgeCardProps) {
  const haptic = useHaptic();
  const theme = NUDGE_THEMES[nudge.nudge_type] || NUDGE_THEMES.contextual;
  const IconComponent = ICON_MAP[nudge.icon || "Lightbulb"];

  const handleClick = () => {
    haptic.light();
    onClick(nudge);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.light();
    onDismiss(nudge.nudge_id);
  };

  const cardContent = (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1 active:translate-y-0",
        "border-2 backdrop-blur-sm",
        theme.background,
        theme.border,
        className,
      )}
      onClick={handleClick}
    >
      {/* Accent bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", theme.accent)} />

      <CardContent className="p-4">
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
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  {nudge.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {nudge.message}
                </p>

                {/* Priority badge */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0.5",
                      nudge.priority === "critical" &&
                        "border-red-300 text-red-700 bg-red-50",
                      nudge.priority === "high" &&
                        "border-orange-300 text-orange-700 bg-orange-50",
                      nudge.priority === "medium" &&
                        "border-blue-300 text-blue-700 bg-blue-50",
                      nudge.priority === "low" &&
                        "border-gray-300 text-gray-700 bg-gray-50",
                    )}
                  >
                    {nudge.priority} priority
                  </Badge>

                  {nudge.cta_label && (
                    <Badge variant="secondary" className="text-xs">
                      Action needed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {nudge.cta_label && (
                  <Button
                    size="sm"
                    className={cn(
                      "text-xs px-3 py-1 h-auto font-medium transition-all",
                      theme.button,
                      "hover:scale-105 active:scale-95",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    {nudge.cta_label}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted/50"
                  onClick={handleDismiss}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicator for recurring nudges */}
        {nudge.frequency_rules.type !== "once" && nudge.shown_count > 0 && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Shown {nudge.shown_count} times</span>
              <span>
                {nudge.clicked_count > 0 && (
                  <span className="text-green-600">
                    {Math.round(
                      (nudge.clicked_count / nudge.shown_count) * 100,
                    )}
                    % engagement
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer" />
      </div>
    </Card>
  );

  // Render based on position
  switch (position) {
    case "toast":
      return (
        <motion.div
          variants={NUDGE_ANIMATIONS.toast}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed bottom-4 right-4 z-50 w-80 max-w-sm"
        >
          {cardContent}
        </motion.div>
      );

    case "modal":
      return (
        <motion.div
          variants={NUDGE_ANIMATIONS.modal}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-md">{cardContent}</div>
        </motion.div>
      );

    case "banner":
      return (
        <motion.div
          variants={NUDGE_ANIMATIONS.banner}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          <div className="px-4 py-2">{cardContent}</div>
        </motion.div>
      );

    case "inline":
      return (
        <motion.div
          variants={NUDGE_ANIMATIONS.inline}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {cardContent}
        </motion.div>
      );

    default:
      return cardContent;
  }
}

// ====================================================================
// MAIN NUDGE SYSTEM COMPONENT
// ====================================================================

export function NudgeSystem({
  userId,
  currentPage,
  profileCompletion,
  className,
}: NudgeSystemProps) {
  const { activeNudge, dismissNudge, trackNudgeClicked, isLoading, error } =
    useNudgeSystem(currentPage);

  // Handle nudge click with haptic feedback
  const handleNudgeClick = (nudge: any) => {
    trackNudgeClicked(nudge);
  };

  // Handle nudge dismissal
  const handleNudgeDismiss = (nudgeId: string) => {
    dismissNudge(nudgeId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-20 bg-muted rounded-lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("text-sm text-destructive", className)}>
        Unable to load suggestions
      </div>
    );
  }

  return (
    <div className={cn("nudge-system", className)}>
      <AnimatePresence mode="wait">
        {activeNudge && (
          <NudgeCard
            key={activeNudge.nudge_id}
            nudge={activeNudge}
            position={activeNudge.display_position}
            onDismiss={handleNudgeDismiss}
            onClick={handleNudgeClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ====================================================================
// NUDGE QUEUE COMPONENT (For admin/debugging)
// ====================================================================

interface NudgeQueueProps {
  nudges: any[];
  onDismiss: (nudgeId: string) => void;
  onClick: (nudge: any) => void;
  className?: string;
}

export function NudgeQueue({
  nudges,
  onDismiss,
  onClick,
  className,
}: NudgeQueueProps) {
  if (nudges.length === 0) {
    return (
      <div
        className={cn(
          "text-sm text-muted-foreground text-center py-4",
          className,
        )}
      >
        No active suggestions
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {nudges.map((nudge) => (
        <NudgeCard
          key={nudge.nudge_id}
          nudge={nudge}
          position="inline"
          onDismiss={onDismiss}
          onClick={onClick}
          className="w-full"
        />
      ))}
    </div>
  );
}

// ====================================================================
// NUDGE PERFORMANCE DASHBOARD (Admin component)
// ====================================================================

interface NudgePerformanceProps {
  analytics: any[];
  className?: string;
}

export function NudgePerformanceDashboard({
  analytics,
  className,
}: NudgePerformanceProps) {
  const metrics = React.useMemo(() => {
    const totalShown = analytics.filter((a) => a.event_type === "shown").length;
    const totalClicked = analytics.filter(
      (a) => a.event_type === "clicked",
    ).length;
    const totalDismissed = analytics.filter(
      (a) => a.event_type === "dismissed",
    ).length;

    const ctr = totalShown > 0 ? (totalClicked / totalShown) * 100 : 0;

    return {
      totalShown,
      totalClicked,
      totalDismissed,
      clickThroughRate: Math.round(ctr * 100) / 100,
    };
  }, [analytics]);

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-golden-500" />
          <h3 className="font-semibold">Nudge Performance</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.totalShown}
            </div>
            <div className="text-xs text-muted-foreground">Impressions</div>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {metrics.clickThroughRate}%
            </div>
            <div className="text-xs text-muted-foreground">CTR</div>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.totalClicked}
            </div>
            <div className="text-xs text-muted-foreground">Clicks</div>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {metrics.totalDismissed}
            </div>
            <div className="text-xs text-muted-foreground">Dismissals</div>
          </div>
        </div>

        {analytics.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>
    </Card>
  );
}

// ====================================================================
// NUDGE PREVIEW COMPONENT (For testing/AB testing)
// ====================================================================

interface NudgePreviewProps {
  nudge: any;
  variant?: "toast" | "modal" | "banner" | "inline";
  className?: string;
}

export function NudgePreview({
  nudge,
  variant = "toast",
  className,
}: NudgePreviewProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    console.log("Nudge clicked:", nudge);
  };

  if (!isVisible) return null;

  return (
    <div className={cn("relative", className)}>
      <NudgeCard
        nudge={{ ...nudge, display_position: variant }}
        position={variant}
        onDismiss={handleDismiss}
        onClick={handleClick}
      />
    </div>
  );
}

// ====================================================================
// CUSTOM CSS ANIMATIONS
// ====================================================================

const nudgeStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }

  .nudge-system {
    position: relative;
    z-index: 40;
  }

  /* Enhanced glass morphism for nudges */
  .nudge-glass {
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .dark .nudge-glass {
    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = nudgeStyles;
  document.head.appendChild(styleSheet);
}
