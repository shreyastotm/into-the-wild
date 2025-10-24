/**
 * Admin utility functions for application-level admin checks
 * Since we can't use admin checks in RLS policies (causes infinite recursion),
 * we handle admin permissions at the application level
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the current user is an admin
 * This is safe to use at the application level
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Query the users table directly
    const { data, error } = await supabase
        .from("users")
        .select("user_type")
        .eq("user_id", user.id)
        .single() as any;

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data?.user_type === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Check if a specific user is an admin
 * @param userId - The user ID to check
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
        .from("users")
        .select("user_type")
        .eq("user_id", userId)
        .single() as any;

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data?.user_type === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Require admin access - throws error if not admin
 * Use this in components that require admin access
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error("Admin access required");
  }
}
