import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200",
  {
    variants: {
      variant: {
        featured: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg animate-pulse-subtle",
        easy: "bg-green-100 text-green-800 border border-green-200",
        moderate: "bg-amber-100 text-amber-800 border border-amber-200",
        hard: "bg-red-100 text-red-800 border border-red-200",
        open: "bg-primary-light text-primary border border-primary",
        full: "bg-gray-200 text-gray-700",
        new: "bg-info text-white",
        success: "bg-success text-white",
        warning: "bg-secondary text-secondary-foreground",
        error: "bg-destructive text-destructive-foreground",
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
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }