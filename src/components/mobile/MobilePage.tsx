import { cn } from "@/lib/utils";

interface MobilePageProps {
  children: React.ReactNode;
  className?: string;
  /** Remove default padding (for full-width content like images) */
  noPadding?: boolean;
  /** Add safe area padding for notches */
  useSafeArea?: boolean;
}

/**
 * Mobile Page Container
 * Provides consistent mobile-optimized page structure
 */
export const MobilePage: React.FC<MobilePageProps> = ({
  children,
  className,
  noPadding = false,
  useSafeArea = true,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen w-full",
        !noPadding && "mobile-container",
        useSafeArea && "mobile-safe-top mobile-safe-bottom",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface MobileSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Mobile Section
 * Consistent section spacing and optional header
 */
export const MobileSection: React.FC<MobileSectionProps> = ({
  children,
  className,
  title,
  subtitle,
}) => {
  return (
    <section className={cn("mobile-section", className)}>
      {(title || subtitle) && (
        <div className="mb-4 sm:mb-6">
          {title && <h2 className="mobile-heading-2">{title}</h2>}
          {subtitle && <p className="mobile-body-small mt-2">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
};

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  /** Use compact padding */
  compact?: boolean;
  /** Make card clickable */
  onClick?: () => void;
  /** Add hover effect */
  hoverable?: boolean;
}

/**
 * Mobile Card
 * Standardized card component with mobile-optimized styling
 */
export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className,
  compact = false,
  onClick,
  hoverable = false,
}) => {
  const isInteractive = !!onClick || hoverable;

  return (
    <div
      className={cn(
        compact ? "mobile-card-compact" : "mobile-card",
        isInteractive &&
          "cursor-pointer active:scale-[0.98] transition-transform",
        hoverable && "hover:shadow-xl hover:-translate-y-0.5",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

interface MobileListProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile List
 * Standardized list with proper spacing
 */
export const MobileList: React.FC<MobileListProps> = ({
  children,
  className,
}) => {
  return <div className={cn("mobile-list", className)}>{children}</div>;
};

interface MobileListItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Mobile List Item
 * Individual list item with mobile-optimized touch target
 */
export const MobileListItem: React.FC<MobileListItemProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "mobile-list-item",
        onClick && "cursor-pointer active:scale-[0.98]",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  /** Number of columns on mobile (default: 1) */
  cols?: 1 | 2;
}

/**
 * Mobile Grid
 * Responsive grid layout optimized for mobile
 */
export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  className,
  cols = 1,
}) => {
  return (
    <div className={cn("mobile-grid", cols === 2 && "grid-cols-2", className)}>
      {children}
    </div>
  );
};
