import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Mobile-first input styling with dark mode support
          "flex h-11 w-full rounded-lg",
          // Light mode
          "border-2 border-input bg-background px-4 py-3 text-base text-foreground",
          // Dark mode - higher contrast
          "dark:border-border dark:bg-card dark:text-foreground",
          "placeholder:text-muted-foreground",
          "transition-all duration-200",
          // Focus states
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
          "dark:focus:ring-primary/30",
          // Hover states
          "hover:border-primary/50",
          "dark:hover:border-primary/60",
          // Additional states
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Error state support (can be added via className)
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
