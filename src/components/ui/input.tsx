import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Mobile-first input styling per design system
          "flex h-11 w-full rounded-lg",
          "border-2 border-gray-300 bg-white px-4 py-3 text-base",
          "placeholder:text-gray-400",
          "transition-all duration-200",
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
          "hover:border-gray-400",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
