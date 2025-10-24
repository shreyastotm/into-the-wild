import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Golden (main actions)
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-golden hover:scale-[1.02] active:scale-[0.98] focus:ring-primary touch-ripple",

        // Secondary - Teal (secondary actions)
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-secondary touch-ripple",

        // Accent - Coral gradient (CTAs, register)
        accent:
          "bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold shadow-lg hover:shadow-coral hover:scale-[1.02] active:scale-[0.98] focus:ring-coral relative overflow-hidden touch-ripple",

        // Golden - Golden hour gradient (featured CTAs)
        golden:
          "bg-gradient-to-r from-golden-400 via-golden-500 to-golden-600 text-white font-bold shadow-lg hover:shadow-golden hover:scale-[1.02] active:scale-[0.98] focus:ring-golden relative overflow-hidden touch-ripple",

        // Teal - Teal gradient (nature actions)
        teal: "bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-primary hover:scale-[1.02] active:scale-[0.98] focus:ring-teal-500 relative overflow-hidden touch-ripple",

        // Outline - Border with transparent bg
        outline:
          "border-2 border-primary text-primary bg-white dark:bg-transparent hover:bg-primary-light dark:hover:bg-primary/10 hover:border-primary-hover hover:scale-[1.02] active:scale-[0.98] focus:ring-primary",

        // Ghost - No background
        ghost:
          "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200",

        // Destructive - Red for dangerous actions
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-destructive touch-ripple",

        // Link - Text only
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",

        // Nature - Enhanced with mountain effects
        nature:
          "bg-gradient-to-r from-golden-500 via-golden-600 to-coral-500 text-white font-bold shadow-lg hover:shadow-golden hover:scale-[1.02] active:scale-[0.98] focus:ring-golden relative overflow-hidden touch-ripple btn-nature",

        // Mountain - Responsive to background
        mountain:
          "bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-primary hover:scale-[1.02] active:scale-[0.98] focus:ring-teal-500 relative overflow-hidden touch-ripple btn-mountain-responsive",

        // Parallax - 3D hover effects
        parallax:
          "bg-gradient-to-r from-coral-500 to-golden-500 text-white font-bold shadow-lg hover:shadow-coral hover:scale-[1.02] active:scale-[0.98] focus:ring-coral relative overflow-hidden touch-ripple btn-parallax-hover",

        // Background-aware - Responds to landscape
        landscape:
          "bg-gradient-to-br from-white/90 via-golden-100/90 to-teal-100/90 text-gray-900 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-primary backdrop-blur-xl relative overflow-hidden touch-ripple btn-background-aware",
      },
      size: {
        xs: "h-8 px-3 py-1.5 text-xs rounded-md",
        sm: "h-9 px-4 py-2 text-sm rounded-lg",
        default: "h-10 px-6 py-3 text-base rounded-lg",
        lg: "h-11 px-8 py-4 text-lg rounded-xl",
        xl: "h-12 px-10 py-5 text-xl rounded-xl",
        icon: "h-10 w-10 rounded-full hover:scale-110 active:scale-95",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
