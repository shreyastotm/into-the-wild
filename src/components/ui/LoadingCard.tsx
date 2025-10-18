import { cn } from '@/lib/utils';

/**
 * Golden Hour themed skeleton loading card
 * Beautiful animated placeholder for trek cards
 */
export const LoadingCard = ({ className }: { className?: string }) => (
  <div className={cn("overflow-hidden border-0 shadow-lg rounded-xl", className)}>
    {/* Image skeleton */}
    <div className="relative aspect-[16/9] overflow-hidden">
      <div className="w-full h-full bg-gradient-to-r from-golden-100 via-golden-200 to-golden-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 skeleton-golden" />
      
      {/* Badges skeleton */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
        <div className="h-7 w-20 rounded-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm" />
        <div className="h-7 w-24 rounded-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm" />
      </div>
      
      {/* Bottom info skeleton */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm" />
          <div className="h-4 w-1/2 rounded bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm" />
        </div>
      </div>
    </div>
    
    {/* Meta info skeleton */}
    <div className="p-4 bg-card dark:bg-card">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 py-2">
            <div className="h-4 w-4 rounded-full bg-muted skeleton-golden" />
            <div className="h-4 w-12 rounded bg-muted skeleton-golden" />
            <div className="h-3 w-16 rounded bg-muted/50 skeleton-golden" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Compact loading skeleton for list items
 */
export const LoadingListItem = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-4 p-4 rounded-lg bg-card", className)}>
    <div className="h-16 w-16 rounded-lg bg-muted skeleton-golden flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-3/4 rounded bg-muted skeleton-golden" />
      <div className="h-3 w-1/2 rounded bg-muted/50 skeleton-golden" />
    </div>
  </div>
);

/**
 * Text loading skeleton
 */
export const LoadingText = ({ 
  lines = 3, 
  className 
}: { 
  lines?: number; 
  className?: string;
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        className={cn(
          "h-4 rounded bg-muted skeleton-golden",
          i === lines - 1 ? "w-3/4" : "w-full"
        )}
      />
    ))}
  </div>
);

/**
 * Loading screen with golden hour branding
 */
export const LoadingScreen = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-golden-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50">
    <div className="flex flex-col items-center space-y-6 animate-pulse-subtle">
      {/* Logo */}
      <img
        src="/itw_logo.png"
        alt="Into the Wild"
        className="h-24 w-auto drop-shadow-2xl"
      />
      
      {/* Loading indicator */}
      <div className="flex items-center space-x-2">
        <div className="h-3 w-3 rounded-full bg-golden-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="h-3 w-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="h-3 w-3 rounded-full bg-coral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      
      {/* Loading text */}
      <p className="text-muted-foreground text-sm">Loading your adventure...</p>
    </div>
  </div>
);

/**
 * Inline spinner with golden hour colors
 */
export const LoadingSpinner = ({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-golden-500 border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
