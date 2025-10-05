import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Teal (main actions)
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-primary",
        
        // Secondary - Amber (secondary actions)
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-secondary",
        
        // Accent - Terracotta gradient (CTAs, register)
        accent: "bg-gradient-to-r from-accent to-orange-500 text-white font-bold shadow-lg hover:shadow-accent hover:scale-105 active:scale-[0.97] focus:ring-accent relative overflow-hidden",
        
        // Outline - Border with transparent bg
        outline: "border-2 border-primary text-primary bg-white hover:bg-primary-light hover:border-primary-hover hover:text-primary-hover hover:scale-[1.02] active:scale-[0.98] focus:ring-primary",
        
        // Ghost - No background
        ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 transition-all duration-200",
        
        // Destructive - Red for dangerous actions
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:ring-destructive",
        
        // Link - Text only
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover",
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
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
