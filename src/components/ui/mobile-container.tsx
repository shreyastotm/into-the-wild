import { cn } from "@/lib/utils";
interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

/**
 * Mobile-optimized container component with safe area support
 *
 * @example
 * ```tsx
 * <MobileContainer>
 *   <h1>Page Content</h1>
 * </MobileContainer>
 * ```
 */
export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  noPadding = false,
  maxWidth = "2xl",
}) => {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto",
        maxWidthClasses[maxWidth],
        !noPadding && "px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
};

/**
 * Mobile section with safe area support and consistent spacing
 *
 * @example
 * ```tsx
 * <MobileSection>
 *   <h2>Section Title</h2>
 *   <p>Section content...</p>
 * </MobileSection>
 * ```
 */
interface MobileSectionProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  spacing?: "sm" | "md" | "lg" | "xl";
}

export const MobileSection: React.FC<MobileSectionProps> = ({
  children,
  className,
  gradient = false,
  spacing = "md",
}) => {
  const spacingClasses = {
    sm: "py-4 md:py-6",
    md: "py-8 md:py-12",
    lg: "py-12 md:py-16 lg:py-20",
    xl: "py-16 md:py-20 lg:py-24",
  };

  return (
    <section
      className={cn(
        spacingClasses[spacing],
        gradient &&
          "bg-gradient-to-b from-transparent via-golden-50/30 dark:via-golden-900/10 to-transparent",
        className,
      )}
    >
      {children}
    </section>
  );
};

/**
 * Safe area wrapper for fixed positioned elements
 *
 * @example
 * ```tsx
 * <SafeAreaWrapper position="bottom">
 *   <BottomNavigation />
 * </SafeAreaWrapper>
 * ```
 */
interface SafeAreaWrapperProps {
  children: React.ReactNode;
  position: "top" | "bottom" | "left" | "right" | "all";
  className?: string;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  position,
  className,
}) => {
  const paddingClasses = {
    top: "pt-safe-top",
    bottom: "pb-safe-bottom",
    left: "pl-safe-left",
    right: "pr-safe-right",
    all: "pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right",
  };

  return (
    <div className={cn(paddingClasses[position], className)}>{children}</div>
  );
};
