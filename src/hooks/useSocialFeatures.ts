// ====================================================================
// SOCIAL FEATURES HOOK (Friends, Posts, Tagging System)
// ====================================================================
// Enterprise-grade social interaction system with friend connections,
// post management, image tagging, and community engagement features
// ====================================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ConnectionStatus,
  ImageTag,
  PostReaction,
  PostVisibility,
  UserConnection,
  UserPost,
  UseSocialFeaturesReturn,
} from "@/types/interactions";

// ====================================================================
// SOCIAL INTERACTION ENGINE
// ====================================================================

class SocialEngine {
  private static instance: SocialEngine;
  private userProfile: any = null;
  private connections: UserConnection[] = [];
  private pendingRequests: UserConnection[] = [];

  static getInstance(): SocialEngine {
    if (!SocialEngine.instance) {
      SocialEngine.instance = new SocialEngine();
    }
    return SocialEngine.instance;
  }

  updateUserProfile(profile: any) {
    this.userProfile = profile;
  }

  updateConnections(connections: UserConnection[]) {
    this.connections = connections;
    this.pendingRequests = connections.filter((c) => c.status === "pending");
  }

  canTagUser(userId: string): boolean {
    // Check if user is connected or if it's a public context
    const connection = this.connections.find(
      (c) =>
        (c.requester_id === this.userProfile?.user_id &&
          c.addressee_id === userId) ||
        (c.requester_id === userId &&
          c.addressee_id === this.userProfile?.user_id),
    );

    return connection?.status === "accepted" || false;
  }

  canViewPost(post: UserPost): boolean {
    const currentUserId = this.userProfile?.user_id;
    if (!currentUserId) return false;

    // Own posts
    if (post.user_id === currentUserId) return true;

    switch (post.visibility) {
      case "public":
        return true;

      case "friends":
        return this.connections.some(
          (c) =>
            c.status === "accepted" &&
            ((c.requester_id === currentUserId &&
              c.addressee_id === post.user_id) ||
              (c.requester_id === post.user_id &&
                c.addressee_id === currentUserId)),
        );

      case "private":
        return post.user_id === currentUserId;

      default:
        return false;
    }
  }

  getMutualConnections(userId: string): number {
    // This would require additional queries to calculate mutual connections
    return 0;
  }

  getMutualTreks(userId: string): number {
    // This would require additional queries to calculate mutual trek participation
    return 0;
  }
}

// ====================================================================
// MAIN SOCIAL FEATURES HOOK
// ====================================================================

export function useSocialFeatures(): UseSocialFeaturesReturn {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const engine = SocialEngine.getInstance();

  // Update engine with current profile
  useEffect(() => {
    if (userProfile) {
      engine.updateUserProfile(userProfile);
    }
  }, [userProfile]);

  // Track if tables exist
  const [connectionsTableExists, setConnectionsTableExists] = useState<
    boolean | null
  >(null);
  const [postsTableExists, setPostsTableExists] = useState<boolean | null>(
    null,
  );

  // Fetch user connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["user-connections", user?.id],
    queryFn: async (): Promise<UserConnection[]> => {
      if (!user?.id) return [];

      try {
        const { data, error } = await supabase
          .from("user_connections")
          .select("*")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .order("created_at", { descending: true });

        // Handle missing table gracefully
        if (error) {
          const errorMsg = error.message?.toLowerCase() || "";
          const errorCode = error.code || "";
          const isTableMissing =
            errorCode === "PGRST116" ||
            errorCode === "42P01" ||
            errorCode === "PGRST106" ||
            errorMsg.includes("relation") ||
            errorMsg.includes("does not exist") ||
            errorMsg.includes("could not find") ||
            errorMsg.includes("not found") ||
            error.code?.includes("404") ||
            (error as any).status === 404 ||
            (error as any).statusCode === 404 ||
            errorMsg.includes("connection closed") ||
            errorMsg.includes("connection refused");

          if (isTableMissing) {
            setConnectionsTableExists(false);
            if (!localStorage.getItem("user_connections_table_warned")) {
              console.warn(
                "user_connections table not found. Returning empty array. Apply migration to remote database to enable social features.",
              );
              localStorage.setItem("user_connections_table_warned", "true");
            }
            return [];
          }
          throw error;
        }

        if (connectionsTableExists === false) {
          setConnectionsTableExists(true);
        }

        return data || [];
      } catch (err: any) {
        const errorMsg = err?.message?.toLowerCase() || "";
        const isConnectionError =
          err?.status === 404 ||
          err?.statusCode === 404 ||
          errorMsg.includes("not found") ||
          errorMsg.includes("404") ||
          errorMsg.includes("connection closed") ||
          errorMsg.includes("connection refused") ||
          err?.code === "ECONNREFUSED" ||
          err?.code === "ECONNRESET";

        if (isConnectionError) {
          setConnectionsTableExists(false);
          return [];
        }
        throw err;
      }
    },
    enabled: !!user?.id && connectionsTableExists !== false,
    retry: false,
    refetchOnWindowFocus: connectionsTableExists !== false,
  });

  // Update engine connections
  useEffect(() => {
    if (connections) {
      engine.updateConnections(connections);
    }
  }, [connections]);

  // Fetch user posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: async (): Promise<UserPost[]> => {
      if (!user?.id) return [];
      if (postsTableExists === false) return []; // Skip if table doesn't exist

      try {
        // Get posts from friends and self
        const friendIds = connections
          .filter((c) => c.status === "accepted")
          .map((c) =>
            c.requester_id === user.id ? c.addressee_id : c.requester_id,
          );

        const userIds = [user.id, ...friendIds];

        const { data, error } = await supabase
          .from("user_posts")
          .select("*")
          .in("user_id", userIds)
          .in("visibility", ["public", "friends"])
          .order("created_at", { descending: true })
          .limit(50);

        if (error) {
          const errorMsg = error.message?.toLowerCase() || "";
          const errorCode = error.code || "";
          const isTableMissing =
            errorCode === "PGRST116" ||
            errorCode === "42P01" ||
            errorCode === "PGRST106" ||
            errorMsg.includes("relation") ||
            errorMsg.includes("does not exist") ||
            errorMsg.includes("could not find") ||
            errorMsg.includes("not found") ||
            error.code?.includes("404") ||
            (error as any).status === 404 ||
            (error as any).statusCode === 404 ||
            errorMsg.includes("connection closed") ||
            errorMsg.includes("connection refused");

          if (isTableMissing) {
            setPostsTableExists(false);
            if (!localStorage.getItem("user_posts_table_warned")) {
              console.warn(
                "user_posts table not found. Returning empty array. Apply migration to remote database to enable social posts.",
              );
              localStorage.setItem("user_posts_table_warned", "true");
            }
            return [];
          }
          throw error;
        }

        if (postsTableExists === false) {
          setPostsTableExists(true);
        }

        return data || [];
      } catch (err: any) {
        const errorMsg = err?.message?.toLowerCase() || "";
        const isConnectionError =
          err?.status === 404 ||
          err?.statusCode === 404 ||
          errorMsg.includes("not found") ||
          errorMsg.includes("404") ||
          errorMsg.includes("connection closed") ||
          errorMsg.includes("connection refused") ||
          err?.code === "ECONNREFUSED" ||
          err?.code === "ECONNRESET";

        if (isConnectionError) {
          setPostsTableExists(false);
          return [];
        }
        throw err;
      }
    },
    enabled: !!user?.id && postsTableExists !== false,
    retry: false,
    refetchOnWindowFocus: postsTableExists !== false,
  });

  // Fetch pending requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pending-requests", user?.id],
    queryFn: async (): Promise<UserConnection[]> => {
      if (!user?.id) return [];
      if (connectionsTableExists === false) return []; // Skip if table doesn't exist

      try {
        const { data, error } = await supabase
          .from("user_connections")
          .select("*")
          .eq("addressee_id", user.id)
          .eq("status", "pending")
          .order("created_at", { descending: true });

        if (error) {
          const errorMsg = error.message?.toLowerCase() || "";
          const errorCode = error.code || "";
          const isTableMissing =
            errorCode === "PGRST116" ||
            errorCode === "42P01" ||
            errorCode === "PGRST106" ||
            errorMsg.includes("relation") ||
            errorMsg.includes("does not exist") ||
            errorMsg.includes("could not find") ||
            errorMsg.includes("not found") ||
            error.code?.includes("404") ||
            (error as any).status === 404 ||
            (error as any).statusCode === 404 ||
            errorMsg.includes("connection closed") ||
            errorMsg.includes("connection refused");

          if (isTableMissing) {
            setConnectionsTableExists(false);
            return [];
          }
          throw error;
        }

        return data || [];
      } catch (err: any) {
        const errorMsg = err?.message?.toLowerCase() || "";
        if (
          err?.status === 404 ||
          err?.statusCode === 404 ||
          errorMsg.includes("not found") ||
          errorMsg.includes("404") ||
          errorMsg.includes("connection closed") ||
          errorMsg.includes("connection refused")
        ) {
          setConnectionsTableExists(false);
          return [];
        }
        throw err;
      }
    },
    enabled: !!user?.id && connectionsTableExists !== false,
    retry: false,
    refetchOnWindowFocus: connectionsTableExists !== false,
  });

  // Send friend request
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Check if request already exists
      const { data: existing } = await supabase
        .from("user_connections")
        .select("*")
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`,
        )
        .single();

      if (existing) {
        throw new Error("Connection already exists");
      }

      const { error } = await supabase.from("user_connections").insert({
        requester_id: user.id,
        addressee_id: targetUserId,
        status: "pending",
        connection_type: "friend",
        mutual_friends_count: engine.getMutualConnections(targetUserId),
        mutual_treks_count: engine.getMutualTreks(targetUserId),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-connections", user?.id],
      });
      toast({
        title: "Friend Request Sent! 👥",
        description: "They'll be notified of your request",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to send request",
        description: error.message || "Please try again",
        variant: "error",
      });
    },
  });

  // Accept friend request
  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("user_connections")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
          connected_at: new Date().toISOString(),
        })
        .eq("connection_id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-connections", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["pending-requests", user?.id],
      });
      toast({
        title: "Friend Added! 🎉",
        description: "You can now tag them on adventures",
        variant: "celebration",
      });
    },
  });

  // Decline friend request
  const declineFriendRequestMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("user_connections")
        .update({
          status: "declined",
          responded_at: new Date().toISOString(),
        })
        .eq("connection_id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-requests", user?.id],
      });
      toast({
        title: "Request declined",
        description: "Friend request has been declined",
        variant: "info",
      });
    },
  });

  // Create post
  const createPostMutation = useMutation({
    mutationFn: async (
      post: Omit<UserPost, "post_id" | "created_at" | "updated_at">,
    ) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase.from("user_posts").insert({
        ...post,
        user_id: user.id,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
        view_count: 0,
        is_pinned: false,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-posts", user?.id] });
      toast({
        title: "Post Created! 📝",
        description: "Your adventure story is now live",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Please try again",
        variant: "error",
      });
    },
  });

  // Like post
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Check if already liked
      const { data: existing } = await supabase
        .from("post_reactions")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from("post_reactions")
          .delete()
          .eq("reaction_id", existing.reaction_id);

        if (error) throw error;

        // Decrease like count
        await supabase
          .from("user_posts")
          .update({ like_count: supabase.raw("like_count - 1") })
          .eq("post_id", postId);

        return { action: "unliked" };
      } else {
        // Like
        const { error } = await supabase.from("post_reactions").insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: "like",
          emoji: "👍",
          reacted_at: new Date().toISOString(),
        });

        if (error) throw error;

        // Increase like count
        await supabase
          .from("user_posts")
          .update({ like_count: supabase.raw("like_count + 1") })
          .eq("post_id", postId);

        return { action: "liked" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["user-posts", user?.id] });

      if (result.action === "liked") {
        toast({
          title: "Post Liked! ❤️",
          description: "Thanks for the love!",
          variant: "success",
          duration: 2000,
        });
      }
    },
  });

  // Comment on post
  const commentOnPostMutation = useMutation({
    mutationFn: async ({
      postId,
      comment,
    }: {
      postId: string;
      comment: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      // For now, we'll add to comment_count
      // In a full implementation, you'd have a separate comments table
      const { error } = await supabase
        .from("user_posts")
        .update({ comment_count: supabase.raw("comment_count + 1") })
        .eq("post_id", postId);

      if (error) throw error;

      // Track the comment interaction
      await supabase.from("user_interactions").insert({
        user_id: user.id,
        event_type: "social_interaction",
        event_name: "post_commented",
        event_data: { post_id: postId, comment_length: comment.length },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-posts", user?.id] });
      toast({
        title: "Comment Added! 💬",
        description: "Thanks for joining the conversation",
        variant: "success",
        duration: 2000,
      });
    },
  });

  // Tag user in image
  const tagInImageMutation = useMutation({
    mutationFn: async (
      tag: Omit<ImageTag, "tag_id" | "created_at" | "updated_at">,
    ) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Check if user can tag (they must be connected)
      if (!engine.canTagUser(tag.tagged_user_id)) {
        throw new Error("You can only tag friends");
      }

      const { error } = await supabase.from("image_tags").insert({
        ...tag,
        tagged_by: user.id,
        is_approved: true, // Auto-approve for friends
        is_visible: true,
        notification_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: (_, tag) => {
      queryClient.invalidateQueries({ queryKey: ["image-tags", tag.image_id] });

      // Send notification to tagged user
      toast({
        title: "Friend Tagged! 🏷️",
        description: "They'll be notified of the tag",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Tagging Failed",
        description: error.message || "Please try again",
        variant: "error",
      });
    },
  });

  // Share post
  const sharePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Increase share count
      const { error } = await supabase
        .from("user_posts")
        .update({ share_count: supabase.raw("share_count + 1") })
        .eq("post_id", postId);

      if (error) throw error;

      // Track share
      await supabase.from("user_interactions").insert({
        user_id: user.id,
        event_type: "social_interaction",
        event_name: "post_shared",
        event_data: { post_id: postId },
      });
    },
    onSuccess: () => {
      toast({
        title: "Post Shared! 📤",
        description: "Your friends will see this in their feed",
        variant: "success",
        duration: 2000,
      });
    },
  });

  // Report post
  const reportPostMutation = useMutation({
    mutationFn: async ({
      postId,
      reason,
    }: {
      postId: string;
      reason: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      // In a full implementation, this would go to a moderation queue
      await supabase.from("user_interactions").insert({
        user_id: user.id,
        event_type: "moderation",
        event_name: "post_reported",
        event_data: { post_id: postId, reason },
      });
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe",
        variant: "success",
      });
    },
  });

  return {
    connections,
    posts,
    pendingRequests,
    sendFriendRequest: sendFriendRequestMutation.mutate,
    acceptFriendRequest: acceptFriendRequestMutation.mutate,
    declineFriendRequest: declineFriendRequestMutation.mutate,
    createPost: createPostMutation.mutate,
    likePost: likePostMutation.mutate,
    commentOnPost: commentOnPostMutation.mutate,
    tagInImage: tagInImageMutation.mutate,
    isLoading: connectionsLoading || postsLoading,
    error: null,
  };
}

// ====================================================================
// FRIEND SUGGESTION ENGINE
// ====================================================================

export function useFriendSuggestions(userId: string, limit: number = 10) {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["friend-suggestions", userId, limit],
    queryFn: async () => {
      if (!userId) return [];

      // Get users who share treks but aren't connected
      const { data: mutualTrekUsers } = await supabase
        .from("trek_registrations")
        .select(
          `
          user_id,
          trek_id,
          trek_events!inner(name, location)
        `,
        )
        .neq("user_id", userId);

      // Get current connections
      const { data: connections } = await supabase
        .from("user_connections")
        .select("requester_id, addressee_id")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq("status", "accepted");

      const connectedUserIds = new Set([
        userId,
        ...(connections || []).flatMap((c) => [c.requester_id, c.addressee_id]),
      ]);

      // Calculate mutual treks and suggest
      const userMutualCounts = mutualTrekUsers.reduce(
        (acc, registration) => {
          if (!connectedUserIds.has(registration.user_id)) {
            if (!acc[registration.user_id]) {
              acc[registration.user_id] = {
                mutualTreks: 0,
                sharedLocations: new Set(),
                user: null,
              };
            }
            acc[registration.user_id].mutualTreks++;
            acc[registration.user_id].sharedLocations.add(
              registration.trek_events.location,
            );
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      // Get user details for top suggestions
      const topUserIds = Object.entries(userMutualCounts)
        .sort(([, a], [, b]) => b.mutualTreks - a.mutualTreks)
        .slice(0, limit)
        .map(([userId]) => userId);

      if (topUserIds.length === 0) return [];

      const { data: users } = await supabase
        .from("users")
        .select(
          "user_id, full_name, avatar_url, bio, trekking_experience, location",
        )
        .in("user_id", topUserIds);

      return (users || []).map((user) => ({
        ...user,
        mutualTreks: userMutualCounts[user.user_id].mutualTreks,
        sharedLocations: Array.from(
          userMutualCounts[user.user_id].sharedLocations,
        ),
      }));
    },
    enabled: !!userId,
  });

  return { suggestions: suggestions || [], isLoading };
}

// ====================================================================
// IMAGE TAGGING SYSTEM
// ====================================================================

export function useImageTagging(imageId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch existing tags for image
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["image-tags", imageId],
    queryFn: async (): Promise<ImageTag[]> => {
      if (!imageId) return [];

      const { data, error } = await supabase
        .from("image_tags")
        .select("*")
        .eq("image_id", imageId)
        .eq("is_visible", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!imageId,
  });

  // Add tag mutation
  const addTagMutation = useMutation({
    mutationFn: async (tagData: {
      tagged_user_id: string;
      x_position: number;
      y_position: number;
      tag_type?: string;
    }) => {
      if (!user?.id || !imageId) throw new Error("Missing required data");

      const { error } = await supabase.from("image_tags").insert({
        image_id: imageId,
        tagged_by: user.id,
        tagged_user_id: tagData.tagged_user_id,
        x_position: tagData.x_position,
        y_position: tagData.y_position,
        tag_type: tagData.tag_type || "person",
        is_approved: true,
        is_visible: true,
        notification_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["image-tags", imageId] });
    },
  });

  // Remove tag mutation
  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("image_tags")
        .update({
          is_visible: false,
          updated_at: new Date().toISOString(),
        })
        .eq("tag_id", tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["image-tags", imageId] });
    },
  });

  // Send notification to tagged user
  const sendTagNotificationMutation = useMutation({
    mutationFn: async (tag: ImageTag) => {
      // Check if notification already sent
      if (tag.notification_sent) return;

      const { data: taggedUser } = await supabase
        .from("users")
        .select("full_name")
        .eq("user_id", tag.tagged_user_id)
        .single();

      if (!taggedUser) return;

      // Create notification for tagged user
      const { error } = await supabase.from("enhanced_notifications").insert({
        user_id: tag.tagged_user_id,
        variant: "social",
        title: "You were tagged in a photo! 📸",
        message: `Check out this adventure photo`,
        icon: "Camera",
        primary_action: {
          label: "View Photo",
          onClick: () => console.log("View tagged photo"),
        },
        context_data: {
          tagger_name: user?.userProfile?.full_name || "Someone",
          image_id: imageId,
        },
        priority: 6,
        status: "pending",
      });

      if (error) throw error;

      // Mark notification as sent
      await supabase
        .from("image_tags")
        .update({
          notification_sent: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq("tag_id", tag.tag_id);
    },
  });

  return {
    tags,
    isLoading,
    addTag: addTagMutation.mutate,
    removeTag: removeTagMutation.mutate,
    sendTagNotification: sendTagNotificationMutation.mutate,
    isAddingTag: addTagMutation.isPending,
    isRemovingTag: removeTagMutation.isPending,
  };
}

// ====================================================================
// SOCIAL ANALYTICS HOOK
// ====================================================================

export function useSocialAnalytics(userId: string) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["social-analytics", userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get social interactions
      const { data: interactions } = await supabase
        .from("user_interactions")
        .select("*")
        .eq("user_id", userId)
        .in("event_type", [
          "social_interaction",
          "post_created",
          "friend_added",
        ])
        .order("created_at", { descending: true })
        .limit(100);

      // Get posts and their engagement
      const { data: posts, error: postsError } = await supabase
        .from("user_posts")
        .select("*")
        .eq("user_id", userId);

      if (
        postsError &&
        (postsError.code === "PGRST116" ||
          postsError.code === "42P01" ||
          postsError.message?.toLowerCase().includes("does not exist") ||
          (postsError as any).status === 404)
      ) {
        console.warn("user_posts table not found in analytics query");
      }

      // Get connections
      const { data: connections, error: connectionsError } = await supabase
        .from("user_connections")
        .select("*")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq("status", "accepted");

      if (
        connectionsError &&
        (connectionsError.code === "PGRST116" ||
          connectionsError.code === "42P01" ||
          connectionsError.message?.toLowerCase().includes("does not exist") ||
          (connectionsError as any).status === 404)
      ) {
        console.warn("user_connections table not found in analytics query");
      }

      // Calculate metrics
      const totalPosts = posts?.length || 0;
      const totalLikes =
        posts?.reduce((sum, post) => sum + post.like_count, 0) || 0;
      const totalComments =
        posts?.reduce((sum, post) => sum + post.comment_count, 0) || 0;
      const totalShares =
        posts?.reduce((sum, post) => sum + post.share_count, 0) || 0;
      const totalConnections = connections?.length || 0;

      const engagementRate =
        totalPosts > 0
          ? (totalLikes + totalComments + totalShares) / totalPosts
          : 0;

      // Activity over time
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split("T")[0];
      });

      const dailyActivity = last30Days.map((date) => {
        const dayInteractions =
          interactions?.filter((i) => i.created_at.startsWith(date)) || [];

        return {
          date,
          posts: dayInteractions.filter((i) => i.event_name === "post_created")
            .length,
          likes: dayInteractions.filter((i) => i.event_name === "post_liked")
            .length,
          comments: dayInteractions.filter(
            (i) => i.event_name === "post_commented",
          ).length,
          friends: dayInteractions.filter(
            (i) => i.event_name === "friend_added",
          ).length,
        };
      });

      return {
        totalPosts,
        totalLikes,
        totalComments,
        totalShares,
        totalConnections,
        engagementRate: Math.round(engagementRate * 100) / 100,
        dailyActivity,
        socialScore: Math.round(
          totalConnections * 10 + totalPosts * 5 + engagementRate * 20,
        ),
        rank: "Active Explorer", // Could be calculated based on percentiles
      };
    },
    enabled: !!userId,
  });

  return {
    analytics,
    isLoading,
  };
}

// ====================================================================
// TRENDING CONTENT HOOK
// ====================================================================

export function useTrendingContent(limit: number = 20) {
  const { data: trendingPosts, isLoading } = useQuery({
    queryKey: ["trending-posts", limit],
    queryFn: async (): Promise<UserPost[]> => {
      // Get posts from last 7 days with high engagement
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("user_posts")
        .select("*")
        .gte("created_at", weekAgo.toISOString())
        .in("visibility", ["public", "friends"])
        .order("like_count", { ascending: false })
        .order("comment_count", { ascending: false })
        .order("share_count", { ascending: false })
        .limit(limit);

      if (error) {
        const errorMsg = error.message?.toLowerCase() || "";
        const errorCode = error.code || "";
        const isTableMissing =
          errorCode === "PGRST116" ||
          errorCode === "42P01" ||
          errorCode === "PGRST106" ||
          errorMsg.includes("relation") ||
          errorMsg.includes("does not exist") ||
          errorMsg.includes("could not find") ||
          errorMsg.includes("not found") ||
          error.code?.includes("404") ||
          (error as any).status === 404 ||
          (error as any).statusCode === 404 ||
          errorMsg.includes("connection closed") ||
          errorMsg.includes("connection refused");

        if (isTableMissing) {
          if (!localStorage.getItem("user_posts_trending_warned")) {
            console.warn(
              "user_posts table not found in trending query. Returning empty array.",
            );
            localStorage.setItem("user_posts_trending_warned", "true");
          }
          return [];
        }
        throw error;
      }
      return data || [];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  return {
    trendingPosts: trendingPosts || [],
    isLoading,
  };
}

// ====================================================================
// SOCIAL SEARCH HOOK
// ====================================================================

export function useSocialSearch(query: string, limit: number = 10) {
  const { data: results, isLoading } = useQuery({
    queryKey: ["social-search", query, limit],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from("users")
        .select(
          "user_id, full_name, avatar_url, bio, location, trekking_experience",
        )
        .or(
          `full_name.ilike.%${query}%,bio.ilike.%${query}%,location.ilike.%${query}%`,
        )
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
  });

  return {
    results: results || [],
    isLoading,
  };
}

// ====================================================================
// ACTIVITY FEED HOOK
// ====================================================================

export function useActivityFeed(userId: string, limit: number = 50) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activity-feed", userId, limit],
    queryFn: async () => {
      if (!userId) return [];

      // Get recent activities from friends
      const { data: connections } = await supabase
        .from("user_connections")
        .select("requester_id, addressee_id")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq("status", "accepted");

      if (!connections || connections.length === 0) return [];

      const friendIds = connections.flatMap((c) =>
        c.requester_id === userId ? [c.addressee_id] : [c.requester_id],
      );

      // Get recent posts from friends
      const { data: friendPosts, error: postsError } = await supabase
        .from("user_posts")
        .select("*")
        .in("user_id", friendIds)
        .in("visibility", ["public", "friends"])
        .order("created_at", { descending: true })
        .limit(limit / 2);

      // Handle missing table gracefully
      if (
        postsError &&
        (postsError.code === "PGRST116" ||
          postsError.code === "42P01" ||
          postsError.message?.toLowerCase().includes("does not exist") ||
          (postsError as any).status === 404)
      ) {
        console.warn("user_posts table not found in activity feed query");
      }

      // Get recent trek registrations from friends
      const { data: friendRegistrations } = await supabase
        .from("trek_registrations")
        .select(
          `
          *,
          trek_events(name, location, start_datetime)
        `,
        )
        .in("user_id", friendIds)
        .gte(
          "registration_date",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("registration_date", { descending: true })
        .limit(limit / 2);

      // Combine and sort activities
      const activities = [
        ...(friendPosts || []).map((post) => ({
          id: `post_${post.post_id}`,
          type: "post",
          data: post,
          timestamp: post.created_at,
        })),
        ...(friendRegistrations || []).map((registration) => ({
          id: `registration_${registration.registration_id}`,
          type: "registration",
          data: registration,
          timestamp: registration.registration_date,
        })),
      ].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      return activities.slice(0, limit);
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every minute
  });

  return {
    activities: activities || [],
    isLoading,
  };
}
