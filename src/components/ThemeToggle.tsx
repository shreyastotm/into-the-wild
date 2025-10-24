import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useHaptic } from "@/hooks/use-haptic";
import { cn } from "@/lib/utils";

/**
 * Beautiful animated theme toggle component
 * Features golden hour gradient background and smooth transitions
 */
export const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const haptic = useHaptic();

  const handleToggle = () => {
    haptic.light();
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative w-16 h-8 rounded-full p-1 transition-all duration-300 shadow-md hover:shadow-lg",
        "bg-gradient-to-r from-golden-400 via-coral-400 to-teal-400",
        "hover:scale-105 active:scale-95",
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Toggle Knob */}
      <div
        className={cn(
          "w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out",
          isDark ? "translate-x-8" : "translate-x-0",
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-teal-600" />
        ) : (
          <Sun className="h-4 w-4 text-golden-600" />
        )}
      </div>

      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun
          className={cn(
            "h-3 w-3 transition-opacity duration-300",
            !isDark ? "opacity-0" : "opacity-70 text-white",
          )}
        />
        <Moon
          className={cn(
            "h-3 w-3 transition-opacity duration-300",
            isDark ? "opacity-0" : "opacity-70 text-white",
          )}
        />
      </div>
    </button>
  );
};

/**
 * Compact icon-only version for mobile navigation
 */
export const ThemeToggleCompact = () => {
  const { isDark, toggleTheme } = useTheme();
  const haptic = useHaptic();

  const handleToggle = () => {
    haptic.light();
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "p-2 rounded-full transition-all duration-300",
        "bg-gradient-to-br from-golden-100 to-teal-100 dark:from-golden-900/30 dark:to-teal-900/30",
        "hover:scale-110 active:scale-95",
        "shadow-md hover:shadow-lg",
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-golden-600 dark:text-golden-400" />
      ) : (
        <Moon className="h-5 w-5 text-teal-600" />
      )}
    </button>
  );
};
