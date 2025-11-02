import { useEffect, useMemo } from "react";

/**
 * Custom hook to manage page-specific body/html styles
 * Automatically cleans up when component unmounts
 * Optimized to prevent unnecessary re-renders by memoizing config
 */
export const usePageStyle = (config: {
  overflow?: "hidden" | "auto" | "scroll";
  height?: string;
  minHeight?: string;
}) => {
  // Memoize the config object to prevent unnecessary re-renders
  const memoizedConfig = useMemo(
    () => config,
    [config.overflow, config.height, config.minHeight],
  );

  // ✅ FIXED: Add memoizedConfig dependency to prevent stale closure issues
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlHeight = document.documentElement.style.height;
    const originalBodyHeight = document.body.style.height;
    const originalBodyMinHeight = document.body.style.minHeight;

    // Apply styles
    if (memoizedConfig.overflow) {
      document.documentElement.style.overflow = memoizedConfig.overflow;
      document.body.style.overflow = memoizedConfig.overflow;
    }
    if (memoizedConfig.height) {
      document.documentElement.style.height = memoizedConfig.height;
      document.body.style.height = memoizedConfig.height;
    }
    if (memoizedConfig.minHeight) {
      document.body.style.minHeight = memoizedConfig.minHeight;
    }

    // Cleanup function - restore original styles
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.height = originalHtmlHeight;
      document.body.style.height = originalBodyHeight;
      document.body.style.minHeight = originalBodyMinHeight;
    };
  }, [memoizedConfig]);
};
