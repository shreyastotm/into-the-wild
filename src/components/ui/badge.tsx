import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200",
  {
    variants: {
      variant: {
        featured:
          "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg animate-pulse-subtle",
        // Difficulty levels
        easy: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
        moderate:
          "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
        hard: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        expert:
          "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
        // Trek categories
        beginner:
          "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
        intermediate:
          "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
        advanced:
          "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        family:
          "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
        weekend:
          "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
        overnight:
          "bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700",
        daytrek:
          "bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700",
        // User roles
        admin:
          "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
        verified:
          "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
        community:
          "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
        // Status types
        open: "bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700",
        full: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        cancelled:
          "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        new: "bg-blue-500 text-white dark:bg-blue-600 dark:text-white",
        // Time status
        today: "bg-green-500 text-white dark:bg-green-600 dark:text-white",
        tomorrow: "bg-blue-500 text-white dark:bg-blue-600 dark:text-white",
        upcoming: "bg-amber-500 text-white dark:bg-amber-600 dark:text-white",
        // Availability
        available:
          "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
        limited:
          "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
        booked:
          "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        default:
          "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
        secondary:
          "bg-secondary/10 text-secondary border border-secondary/20 dark:bg-secondary/20 dark:text-secondary-foreground dark:border-secondary/30",
        destructive: "bg-destructive text-destructive-foreground",
        outline:
          "border border-border text-foreground dark:border-border dark:text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "open",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
