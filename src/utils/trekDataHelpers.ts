import { supabase } from "@/integrations/supabase/client";

/**
 * Participant data structure for trek cards
 */
export interface TrekParticipant {
  id: string | number;
  name: string;
  avatar: string | null;
}

/**
 * Engagement metrics for treks
 */
export interface TrekEngagement {
  likes: number;
  views: number;
}

/**
 * Fetches registered participants for a trek event
 * Returns up to 4 participants with their avatars and names
 */
export async function fetchTrekParticipants(
  trekId: number,
): Promise<TrekParticipant[]> {
  try {
    const { data, error } = await supabase
      .from("trek_registrations")
      .select(
        `
        user_id,
        users!inner(
          user_id,
          name,
          avatar_url
        )
      `,
      )
      .eq("trek_id", trekId)
      .eq("payment_status", "Paid")
      .order("booking_datetime", { ascending: true })
      .limit(4);

    if (error) {
      console.error("Error fetching trek participants:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the data to match expected format
    return data.map((reg: any, index: number) => ({
      id: reg.user_id || `participant-${index}`,
      name: reg.users?.name || "Adventure Enthusiast",
      avatar: reg.users?.avatar_url || null,
    }));
  } catch (error) {
    console.error("Error in fetchTrekParticipants:", error);
    return [];
  }
}

/**
 * Fetches engagement metrics (likes and views) for a trek event
 * Uses user_posts and post_reactions as temporary solution until proper trek engagement tracking is implemented
 */
export async function fetchTrekEngagement(
  trekId: number,
): Promise<TrekEngagement> {
  try {
    // First, check if there are any posts related to this trek
    const { data: posts, error: postsError } = await supabase
      .from("user_posts")
      .select("post_id, view_count")
      .eq("trek_id", trekId);

    if (postsError) {
      console.warn(
        "Error fetching user posts for trek engagement:",
        postsError,
      );
      return { likes: 0, views: 0 };
    }

    if (!posts || posts.length === 0) {
      return { likes: 0, views: 0 };
    }

    // Get post IDs
    const postIds = posts.map((p) => p.post_id);

    // Fetch like count from post_reactions
    const { count: likeCount, error: likesError } = await supabase
      .from("post_reactions")
      .select("*", { count: "exact", head: true })
      .in("post_id", postIds)
      .eq("reaction_type", "like");

    if (likesError) {
      console.warn("Error fetching like count:", likesError);
    }

    // Sum up view counts from posts
    const viewCount =
      posts.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;

    return {
      likes: likeCount || 0,
      views: viewCount,
    };
  } catch (error) {
    console.error("Error in fetchTrekEngagement:", error);
    return { likes: 0, views: 0 };
  }
}

/**
 * Extracts or calculates distance for a trek
 * Checks distance_km field first, then tries route_data, falls back to "TBD"
 */
export function getTrekDistance(trek: any): string {
  // Check if distance exists and is valid (column name is 'distance', not 'distance_km')
  if (trek.distance != null && trek.distance > 0) {
    // If distance is already in km format
    const distanceValue = Number(trek.distance);
    return distanceValue > 1000
      ? `${(distanceValue / 1000).toFixed(1)} km`
      : `${distanceValue} km`;
  }

  // Also check distance_km for backwards compatibility (in case it exists)
  if (trek.distance_km != null && trek.distance_km > 0) {
    return `${trek.distance_km} km`;
  }

  // Try to extract from route_data JSONB
  if (trek.route_data && typeof trek.route_data === "object") {
    const routeData = trek.route_data;

    // Check for distance in various possible formats
    if (routeData.distance) {
      // If distance is in meters, convert to km
      const distance =
        typeof routeData.distance === "number"
          ? routeData.distance > 1000
            ? `${(routeData.distance / 1000).toFixed(1)} km`
            : `${routeData.distance} m`
          : routeData.distance;
      return String(distance);
    }

    if (routeData.distanceKm) {
      return `${routeData.distanceKm} km`;
    }

    if (routeData.route?.distanceKm) {
      return `${routeData.route.distanceKm} km`;
    }

    // Try to calculate from route legs if available
    if (routeData.legs && Array.isArray(routeData.legs)) {
      const totalDistance = routeData.legs.reduce(
        (sum: number, leg: any) => sum + (leg.distance || 0),
        0,
      );
      if (totalDistance > 0) {
        // Assume distance is in meters if > 1000, otherwise use as-is
        return totalDistance > 1000
          ? `${(totalDistance / 1000).toFixed(1)} km`
          : `${totalDistance} m`;
      }
    }
  }

  // Fallback to "TBD" if no distance data available
  return "TBD";
}

/**
 * Checks if a user is registered for a trek event
 * Returns true if registration exists and payment_status is not 'Cancelled'
 */
export async function checkUserRegistration(
  userId: string | undefined,
  trekId: number,
): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from("trek_registrations")
      .select("registration_id, payment_status")
      .eq("trek_id", trekId)
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      // No registration found or other error
      if (error.code === "PGRST116") {
        // No rows returned
        return false;
      }
      console.error("Error checking user registration:", error);
      return false;
    }

    // Check if registration exists and is not cancelled
    return !!data && data.payment_status !== "Cancelled";
  } catch (error) {
    console.error("Error in checkUserRegistration:", error);
    return false;
  }
}
