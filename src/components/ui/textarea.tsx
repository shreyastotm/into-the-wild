
import * as React from "react"

import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Extends base textarea attributes - no additional props needed
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Mobile-first textarea styling per design system
          "flex min-h-24 w-full rounded-lg",
          "border-2 border-gray-300 bg-white px-4 py-3 text-sm",
          "placeholder:text-gray-400",
          "transition-all duration-200",
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
          "hover:border-gray-400",
          "ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
