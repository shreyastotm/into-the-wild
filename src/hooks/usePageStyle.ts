import { useEffect } from "react";

/**
 * Custom hook to manage page-specific body/html styles
 * Automatically cleans up when component unmounts
 */
export const usePageStyle = (config: {
  overflow?: "hidden" | "auto" | "scroll";
  height?: string;
  minHeight?: string;
}) => {
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlHeight = document.documentElement.style.height;
    const originalBodyHeight = document.body.style.height;
    const originalBodyMinHeight = document.body.style.minHeight;

    // Apply styles
    if (config.overflow) {
      document.documentElement.style.overflow = config.overflow;
      document.body.style.overflow = config.overflow;
    }
    if (config.height) {
      document.documentElement.style.height = config.height;
      document.body.style.height = config.height;
    }
    if (config.minHeight) {
      document.body.style.minHeight = config.minHeight;
    }

    // Cleanup function - restore original styles
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.height = originalHtmlHeight;
      document.body.style.height = originalBodyHeight;
      document.body.style.minHeight = originalBodyMinHeight;
    };
  }, [config.overflow, config.height, config.minHeight]);
};
