// ====================================================================
// PROFILE COMPLETION FUNNEL COMPONENT (Gamified Onboarding)
// ====================================================================
// Enterprise-grade profile completion system with behavioral psychology,
// milestone celebrations, progress tracking, and reward-based motivation
// ====================================================================

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Crown,
  Gift,
  Heart,
  MapPin,
  Mountain,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import React, { forwardRef, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useHaptic } from "@/hooks/use-haptic";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { cn } from "@/lib/utils";
import {
  PROFILE_STAGES,
  ProfileCompletionFunnelProps,
  ProfileStage,
  ProfileStageConfig,
} from "@/types/interactions";

// ====================================================================
// STAGE ICON MAPPING
// ====================================================================

const STAGE_ICONS: Record<ProfileStage, React.ComponentType<any>> = {
  avatar: Camera,
  bio: BookOpen,
  interests: Zap,
  verification: Shield,
  social: Users,
};

// ====================================================================
// ANIMATION CONFIGURATIONS
// ====================================================================

const STAGE_ANIMATIONS = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
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
    y: -20,
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

const CELEBRATION_ANIMATIONS = {
  confetti: {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 1, 1, 0],
      scale: [0, 1.2, 1, 0],
      rotate: [0, 180, 360, 540],
      transition: {
        duration: 3,
        times: [0, 0.2, 0.8, 1],
        ease: "easeInOut",
      },
    },
  },

  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  glow: {
    animate: {
      boxShadow: [
        "0 0 20px rgba(244, 164, 96, 0.3)",
        "0 0 40px rgba(244, 164, 96, 0.6)",
        "0 0 20px rgba(244, 164, 96, 0.3)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

// ====================================================================
// STAGE CARD COMPONENT
// ====================================================================

interface StageCardProps {
  stage: ProfileStageConfig;
  completion: any;
  isCurrent: boolean;
  isCompleted: boolean;
  onClick: () => void;
  className?: string;
}

const StageCard = forwardRef<HTMLDivElement, StageCardProps>(
  ({ stage, completion, isCurrent, isCompleted, onClick, className }, ref) => {
    const haptic = useHaptic();
    const IconComponent = STAGE_ICONS[stage.stage];

    const handleClick = () => {
      haptic.medium();
      onClick();
    };

    return (
      <motion.div
        ref={ref}
        variants={STAGE_ANIMATIONS}
        initial="initial"
        animate="animate"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn("relative group cursor-pointer", className)}
        onClick={handleClick}
      >
        <Card
          className={cn(
            "relative overflow-hidden transition-all duration-300 border-2",
            "bg-white/8 dark:bg-gray-900/8",
            "backdrop-blur-xl backdrop-saturate-150",
            isCompleted &&
              "border-green-400/30 dark:border-green-400/20 shadow-lg shadow-green-500/10",
            isCurrent &&
              !isCompleted &&
              "border-amber-400/40 dark:border-amber-400/30 ring-2 ring-amber-400/40 ring-offset-2 shadow-lg shadow-amber-500/20",
            !isCurrent &&
              !isCompleted &&
              "border-amber-400/20 dark:border-amber-400/15",
          )}
        >
          {/* Status indicator */}
          <div
            className={cn(
              "absolute top-0 left-0 w-full h-1 transition-all duration-300",
              isCompleted && "bg-gradient-to-r from-green-500 to-emerald-500",
              isCurrent &&
                !isCompleted &&
                "bg-gradient-to-r from-golden-500 to-amber-500",
              !isCurrent && !isCompleted && "bg-muted-foreground/20",
            )}
          />

          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Icon with status */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted && "bg-green-500 shadow-lg",
                    isCurrent &&
                      !isCompleted &&
                      "bg-gradient-to-br from-golden-500 to-amber-500 shadow-lg",
                    !isCurrent && !isCompleted && "bg-muted-foreground/10",
                  )}
                >
                  <IconComponent
                    className={cn(
                      "w-6 h-6",
                      isCompleted && "text-white",
                      isCurrent && !isCompleted && "text-white",
                      !isCurrent && !isCompleted && "text-muted-foreground",
                    )}
                  />
                </div>

                {/* Completion checkmark */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                      delay: 0.2,
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}

                {/* Current stage indicator */}
                {isCurrent && !isCompleted && (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-golden-500 rounded-full border-2 border-white dark:border-gray-900"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base transition-colors text-white/95">
                      {stage.title}
                    </h3>
                    <p className="text-sm text-white/70 mt-1">
                      {stage.subtitle}
                    </p>
                  </div>

                  {/* Action indicator */}
                  <div className="flex items-center gap-1">
                    {isCompleted ? (
                      <Trophy className="w-4 h-4 text-green-400" />
                    ) : isCurrent ? (
                      <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <Clock className="w-4 h-4 text-white/60" />
                    )}
                  </div>
                </div>

                {/* Progress bar for current stage */}
                {isCurrent && !isCompleted && (
                  <div className="mt-3">
                    <Progress
                      value={completion?.completion_percentage || 0}
                      className="h-2 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-amber-500"
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-white/60">
                      <span>
                        {Math.round(completion?.completion_percentage || 0)}%
                        complete
                      </span>
                      <span>~{stage.estimated_time}</span>
                    </div>
                  </div>
                )}

                {/* Rewards preview */}
                <div className="flex items-center gap-2 mt-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      "bg-white/5 backdrop-blur-sm border-amber-400/30 text-white/80",
                      isCompleted && "border-green-400/30 bg-green-500/10",
                      isCurrent &&
                        !isCompleted &&
                        "border-amber-400/40 bg-amber-500/10",
                    )}
                  >
                    <Gift className="w-3 h-3 mr-1" />
                    {stage.reward}
                  </Badge>

                  {isCompleted && completion?.time_to_complete && (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.round(completion.time_to_complete / 60)}min
                    </Badge>
                  )}
                </div>

                {/* Psychology trigger indicator */}
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <Target className="w-3 h-3" />
                    <span className="capitalize">
                      {stage.psychology_trigger.replace("_", " ")} motivation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </CardContent>
        </Card>
      </motion.div>
    );
  },
);

StageCard.displayName = "StageCard";

// ====================================================================
// MILESTONE CELEBRATION COMPONENT
// ====================================================================

interface MilestoneCelebrationProps {
  milestone: any;
  onComplete: () => void;
  className?: string;
}

function MilestoneCelebration({
  milestone,
  onComplete,
  className,
}: MilestoneCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti after a short delay
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        },
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-golden-400 via-amber-400 to-coral-400",
        "border-2 border-white/20 shadow-2xl",
        className,
      )}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-golden-500/20 via-transparent to-coral-500/20 animate-pulse" />

      {/* Confetti effects */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: [
                    "bg-primary",
                    "bg-primary",
                    "bg-primary",
                    "bg-primary",
                    "bg-primary",
                  ][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{
                  opacity: 0,
                  scale: 0,
                  rotate: 0,
                  y: -20,
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0],
                  rotate: [0, 180, 360],
                  y: [0, -100, -200],
                  transition: {
                    duration: 3,
                    delay: i * 0.1,
                    ease: "easeOut",
                  },
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative p-6 text-center text-white">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/20 backdrop-blur-sm"
        >
          <Trophy className="w-8 h-8 text-white" />
        </motion.div>

        <motion.h3
          className="text-2xl font-bold mb-2"
          animate={{
            background: [
              "linear-gradient(45deg, bg-primary, bg-primary)",
              "linear-gradient(45deg, bg-primary, bg-primary)",
              "linear-gradient(45deg, bg-primary, bg-primary)",
              "linear-gradient(45deg, bg-primary, bg-primary)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {milestone.title}
        </motion.h3>

        <p className="text-white/90 mb-4">
          {milestone.description ||
            "Congratulations on reaching this milestone!"}
        </p>

        {milestone.points_earned > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-300" />
            <span className="font-semibold text-lg">
              +{milestone.points_earned} points
            </span>
          </div>
        )}

        <Button
          onClick={onComplete}
          className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
        >
          Continue Adventure
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// ====================================================================
// PROGRESS RING COMPONENT
// ====================================================================

interface CircularProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function CircularProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  className,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
      </svg>

      {/* Progress circle */}
      <svg
        width={size}
        height={size}
        className="absolute top-0 left-0 transform -rotate-90"
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* Gradient definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="bg-primary" />
            <stop offset="50%" stopColor="bg-primary" />
            <stop offset="100%" stopColor="bg-primary" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-golden-600 dark:text-golden-400"
            animate={{
              scale: [1, 1.1, 1],
              color: ["#F4A460", "#E97451", "#4CAF50"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {Math.round(percentage)}%
          </motion.div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// MAIN PROFILE COMPLETION FUNNEL COMPONENT
// ====================================================================

export function ProfileCompletionFunnel({
  userId,
  currentStage,
  onStageComplete,
  className,
}: ProfileCompletionFunnelProps) {
  const { userProfile } = useAuth();
  const haptic = useHaptic();
  const {
    completion,
    currentStage: hookCurrentStage,
    overallPercentage,
    isComplete,
    updateStage,
    completeStage,
    createMilestone,
    isLoading,
    error,
  } = useProfileCompletion(userId);

  const [celebratingMilestone, setCelebratingMilestone] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Determine current stage
  const activeStage = currentStage || hookCurrentStage;
  const stagesWithCompletion = PROFILE_STAGES.map((stage) => ({
    ...stage,
    completion: completion.find((c) => c.stage === stage.stage),
  }));

  // Handle stage click
  const handleStageClick = (stage: ProfileStage) => {
    haptic.medium();
    if (onStageComplete) {
      onStageComplete(stage);
    }
  };

  // Handle stage completion
  const handleStageComplete = (stage: ProfileStage, timeSpent?: number) => {
    completeStage(stage, timeSpent);

    // Create milestone
    const stageConfig = PROFILE_STAGES.find((s) => s.stage === stage);
    if (stageConfig) {
      createMilestone(
        `${stage}_completed`,
        `${stageConfig.title} Complete!`,
        100,
      );
    }
  };

  // Show milestone celebration
  useEffect(() => {
    const latestMilestone = completion
      .filter((c) => c.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.completed_at || "").getTime() -
          new Date(a.completed_at || "").getTime(),
      )[0];

    if (latestMilestone?.completed_at) {
      const completedRecently =
        Date.now() - new Date(latestMilestone.completed_at).getTime() < 5000;
      if (completedRecently) {
        setCelebratingMilestone(latestMilestone);
        setShowCelebration(true);

        // Auto-hide celebration after 5 seconds
        setTimeout(() => {
          setShowCelebration(false);
          setCelebratingMilestone(null);
        }, 5000);
      }
    }
  }, [completion]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-destructive">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive/50" />
          <h3 className="font-semibold mb-2">
            Unable to load profile progress
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("profile-completion-funnel space-y-6", className)}>
      {/* Header with progress */}
      <div className="text-center space-y-4">
        <motion.div
          animate={isComplete ? CELEBRATION_ANIMATIONS.glow.animate : {}}
          className="inline-flex items-center gap-3"
        >
          <CircularProgressRing percentage={overallPercentage} />
          <div className="text-left">
            <h2
              className={cn(
                "text-2xl font-bold",
                isComplete && "text-golden-600 dark:text-golden-400",
              )}
            >
              {isComplete
                ? "🎉 Adventure Profile Complete!"
                : "Complete Your Profile"}
            </h2>
            <p className="text-muted-foreground">
              {isComplete
                ? "Ready for epic adventures with friends!"
                : `${5 - stagesWithCompletion.filter((s) => s.completion?.status === "completed").length} steps remaining`}
            </p>
          </div>
        </motion.div>

        {/* Completion stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-500" />
            <span>
              {
                stagesWithCompletion.filter(
                  (s) => s.completion?.status === "completed",
                ).length
              }
              /5 complete
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              ~
              {Math.round(
                (5 -
                  stagesWithCompletion.filter(
                    (s) => s.completion?.status === "completed",
                  ).length) *
                  2.5,
              )}{" "}
              min remaining
            </span>
          </div>
        </div>
      </div>

      {/* Milestone celebration overlay */}
      <AnimatePresence>
        {showCelebration && celebratingMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          >
            <MilestoneCelebration
              milestone={celebratingMilestone}
              onComplete={() => setShowCelebration(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {stagesWithCompletion.map((stage, index) => {
            const isCompleted = stage.completion?.status === "completed";
            const isCurrent =
              !isCompleted &&
              (currentStage === stage.stage ||
                !stagesWithCompletion
                  .slice(0, index)
                  .some((s) => s.completion?.status !== "completed"));

            return (
              <StageCard
                key={stage.stage}
                stage={stage}
                completion={stage.completion}
                isCurrent={isCurrent}
                isCompleted={isCompleted}
                onClick={() => handleStageClick(stage.stage)}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Completion celebration */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.5,
              },
            }}
            className="text-center space-y-4 p-6 bg-gradient-to-br from-golden-50 to-coral-50 dark:from-golden-950/20 dark:to-coral-950/20 rounded-2xl border-2 border-golden-200 dark:border-golden-800"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-golden-500 to-coral-500 rounded-full"
            >
              <Crown className="w-8 h-8 text-white" />
            </motion.div>

            <div>
              <h3 className="text-xl font-bold text-golden-800 dark:text-golden-200 mb-2">
                Welcome to the wild! 🏔️
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your adventure profile is complete. Get ready for epic
                experiences with friends!
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <Users className="w-3 h-3 mr-1" />
                Friend tagging unlocked
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <Camera className="w-3 h-3 mr-1" />
                Gallery features unlocked
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <Trophy className="w-3 h-3 mr-1" />
                Premium treks access
              </Badge>
            </div>

            <Button
              className="bg-gradient-to-r from-golden-500 to-coral-500 hover:from-golden-600 hover:to-coral-600 text-white"
              onClick={() => (window.location.href = "/glass-events")}
            >
              Explore Treks
              <Mountain className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Psychology insights (for completed stages) */}
      {stagesWithCompletion.some(
        (s) => s.completion?.status === "completed",
      ) && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-golden-500" />
            <h4 className="font-medium text-sm">Completion Insights</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-medium">Most effective trigger:</div>
              <div className="text-muted-foreground capitalize">
                {stagesWithCompletion
                  .filter(
                    (s) =>
                      s.completion?.status === "completed" &&
                      s.completion?.trigger_used,
                  )
                  .sort(
                    (a, b) =>
                      (b.completion?.helpful_rating || 0) -
                      (a.completion?.helpful_rating || 0),
                  )[0]
                  ?.psychology_trigger?.replace("_", " ") || "N/A"}
              </div>
            </div>
            <div>
              <div className="font-medium">Average completion time:</div>
              <div className="text-muted-foreground">
                {Math.round(
                  stagesWithCompletion
                    .filter(
                      (s) =>
                        s.completion?.status === "completed" &&
                        s.completion?.time_to_complete,
                    )
                    .reduce(
                      (sum, s) => sum + (s.completion?.time_to_complete || 0),
                      0,
                    ) /
                    stagesWithCompletion.filter(
                      (s) =>
                        s.completion?.status === "completed" &&
                        s.completion?.time_to_complete,
                    ).length /
                    60,
                ) || 0}{" "}
                min
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ====================================================================
// PROFILE COMPLETION WIDGET (Compact version)
// ====================================================================

interface ProfileCompletionWidgetProps {
  userId: string;
  variant?: "compact" | "detailed";
  showStages?: boolean;
  className?: string;
}

export function ProfileCompletionWidget({
  userId,
  variant = "compact",
  showStages = false,
  className,
}: ProfileCompletionWidgetProps) {
  const { completion, overallPercentage, isComplete } =
    useProfileCompletion(userId);

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 bg-muted/50 rounded-lg",
          className,
        )}
      >
        <CircularProgressRing
          percentage={overallPercentage}
          size={40}
          strokeWidth={4}
        />
        <div className="flex-1">
          <div className="text-sm font-medium">
            {isComplete
              ? "Profile Complete!"
              : `${Math.round(overallPercentage)}% Complete`}
          </div>
          <div className="text-xs text-muted-foreground">
            {isComplete
              ? "Ready for adventures"
              : "Complete to unlock features"}
          </div>
        </div>
        {!isComplete && (
          <Button variant="outline" size="sm" className="text-xs">
            Complete
          </Button>
        )}
      </div>
    );
  }

  return <ProfileCompletionFunnel userId={userId} className={className} />;
}

// ====================================================================
// PROFILE COMPLETION ANALYTICS (Admin component)
// ====================================================================

interface ProfileCompletionAnalyticsProps {
  className?: string;
}

export function ProfileCompletionAnalytics({
  className,
}: ProfileCompletionAnalyticsProps) {
  // This would fetch analytics data from the database
  const mockData = {
    totalUsers: 156,
    completionRates: {
      avatar: 85,
      bio: 72,
      interests: 58,
      verification: 34,
      social: 23,
    },
    averageTimeToComplete: 12, // days
    dropOffStages: ["verification", "social"],
    mostEffectiveTriggers: ["social_proof", "urgency", "personalization"],
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-golden-500" />
          <h3 className="font-semibold">Profile Completion Analytics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {mockData.totalUsers}
            </div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </div>

          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(mockData.completionRates.social)}%
            </div>
            <div className="text-xs text-muted-foreground">Full Completion</div>
          </div>

          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {mockData.averageTimeToComplete}
            </div>
            <div className="text-xs text-muted-foreground">Avg Days</div>
          </div>

          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {mockData.dropOffStages.length}
            </div>
            <div className="text-xs text-muted-foreground">Drop-off Points</div>
          </div>
        </div>

        {/* Stage completion rates */}
        <div>
          <h4 className="font-medium mb-3">Stage Completion Rates</h4>
          <div className="space-y-2">
            {Object.entries(mockData.completionRates).map(([stage, rate]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="text-sm capitalize">{stage}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-golden-500 to-coral-500 transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                    {rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Psychology triggers */}
        <div>
          <h4 className="font-medium mb-3">Most Effective Triggers</h4>
          <div className="flex flex-wrap gap-2">
            {mockData.mostEffectiveTriggers.map((trigger) => (
              <Badge key={trigger} variant="outline" className="capitalize">
                {trigger.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
