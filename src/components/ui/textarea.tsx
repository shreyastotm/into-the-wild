import * as React from "react";

import { cn } from "@/lib/utils";

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
          "flex min-h-[80px] w-full rounded-lg",
          // Light mode
          "border-2 border-input bg-background px-4 py-3 text-base text-foreground",
          // Dark mode
          "dark:border-border dark:bg-card dark:text-foreground",
          "placeholder:text-muted-foreground",
          "transition-all duration-200",
          // Focus states
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
          "dark:focus:ring-primary/30",
          // Hover states
          "hover:border-primary/50",
          "dark:hover:border-primary/60",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "resize-vertical",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
