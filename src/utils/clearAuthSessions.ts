/**
 * Utility to clear all authentication sessions from browser storage
 * This helps resolve issues with persistent auto-login
 */

export const clearAllAuthSessions = (): void => {
  if (typeof window === "undefined") {
    console.warn("clearAllAuthSessions: Not running in browser environment");
    return;
  }

  try {
    // Clear Supabase auth tokens
    localStorage.removeItem("itw-auth-token");
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.removeItem("supabase.auth.token");

    // Clear any other auth-related keys
    const authKeys = Object.keys(localStorage).filter(
      (key) =>
        key.includes("supabase") ||
        key.includes("auth") ||
        key.includes("itw-auth"),
    );

    authKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log("✅ Cleared all authentication sessions");
    console.log("Auth keys removed:", authKeys);
  } catch (error) {
    console.error("❌ Error clearing auth sessions:", error);
  }
};

/**
 * Check if there are any persistent authentication sessions
 */
export const hasPersistentAuthSession = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    // Check for common auth token keys
    const authKeys = [
      "itw-auth-token",
      "supabase.auth.token",
      "sb-access-token",
      "sb-refresh-token",
    ];

    return authKeys.some((key) => {
      try {
        return localStorage.getItem(key) !== null;
      } catch {
        return false;
      }
    });
  } catch (error) {
    console.error("Error checking auth sessions:", error);
    return false;
  }
};
