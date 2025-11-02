import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  fullScreen = false,
  className,
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "h-screen w-full" : "h-full w-full min-h-[200px]",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "animate-spin rounded-full border-t-transparent border-primary",
            sizeClasses[size],
          )}
        />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
