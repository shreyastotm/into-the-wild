import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  WithStringId,
  convertDbRecordToStringIds,
} from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";
import { getUniqueParticipantCount } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  avatar: string | null;
  joinedAt: string;
  isEventCreator: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
  isEventCreator: boolean;
}

// Define interfaces for database records to fix type issues
interface TrekComment {
  comment_id: number;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at?: string;
  trek_id: number;
}

interface UserProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

export const useTrekCommunity = (trekId: string | undefined) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const numericTrekId = trekId ? parseInt(trekId, 10) : undefined;

  const fetchCommunityData = useCallback(async () => {
    if (!numericTrekId) return;
    setLoading(true);
    setCommentsLoading(true);
    setError(null);

    try {
      // Fetch Participants (Two-Step)
      // Step 1: Fetch registrations
      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("trek_registrations")
          .select("user_id, booking_datetime")
          .eq("trek_id", numericTrekId)
          .order("booking_datetime", { ascending: true });

      if (registrationsError) {
        console.error("Error fetching registrations:", registrationsError);
        throw new Error(
          `Failed to fetch registrations: ${registrationsError.message}`,
        );
      }

      let fetchedParticipants: Participant[] = [];
      if (registrationsData && registrationsData.length > 0) {
        // Step 2: Fetch user details
        const userIds = (
          registrationsData as Array<{
            user_id: string;
            booking_datetime: string;
          }>
        )
          .map((reg) => reg.user_id)
          .filter(Boolean);
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("user_id, name, avatar_url")
            .in("user_id", userIds);

          if (usersError) {
            console.error(
              "Error fetching participant user details:",
              usersError,
            );
            // Continue without user details if this fails?
          }

          // Step 3: Combine registration and user data, mapping to Participant interface
          const typedRegistrations = registrationsData as Array<{
            user_id: string;
            booking_datetime: string;
          }>;
          const typedUsers = usersData as Array<{
            user_id: string;
            name: string | null;
            avatar_url: string | null;
          }> | null;

          fetchedParticipants = typedRegistrations.map((reg) => {
            const userDetail = typedUsers?.find(
              (u) => u.user_id === reg.user_id,
            );
            return {
              id: reg.user_id,
              name: userDetail?.name || "Loading...",
              avatar: userDetail?.avatar_url || null,
              joinedAt: reg.booking_datetime || new Date().toISOString(),
              isEventCreator: false,
            };
          });
        }
      }
      setParticipants(fetchedParticipants);
      setParticipantCount(fetchedParticipants.length);

      // Fetch Comments (Two-Step)
      // Step 1: Fetch comments - select only comment_text
      const { data: rawCommentsData, error: commentsError } = await supabase
        .from("trek_comments")
        .select("comment_id, user_id, comment_text, created_at") // Only select comment_text
        .eq("trek_id", numericTrekId)
        .order("created_at", { ascending: true });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        throw new Error(`Failed to fetch comments: ${commentsError.message}`);
      }

      // SafeCast with unknown intermediate type to satisfy TypeScript
      const commentsData = rawCommentsData as unknown as TrekComment[];

      let fetchedComments: Comment[] = [];
      if (commentsData && commentsData.length > 0) {
        // Step 2: Fetch user details for comment authors
        const commentUserIds = [
          ...new Set(commentsData.map((c) => c.user_id).filter(Boolean)),
        ];
        let commentUsersData: UserProfile[] = [];
        if (commentUserIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("user_id, name, avatar_url")
            .in("user_id", commentUserIds);
          if (usersError) {
            console.error("Error fetching comment user details:", usersError);
          } else {
            commentUsersData = (usersData as unknown as UserProfile[]) || [];
          }
        }

        // Step 3: Combine comment and user data, mapping to Comment interface
        fetchedComments = commentsData.map((comment) => {
          const author = commentUsersData.find(
            (u) => u.user_id === comment.user_id,
          );
          // Use only comment_text field
          const commentContent = comment.comment_text || "";

          return {
            id: comment.comment_id.toString(),
            userId: comment.user_id,
            userName: author?.name || "Unknown User",
            userAvatar: author?.avatar_url || null,
            content: commentContent,
            createdAt: comment.created_at,
            isEventCreator: false,
          };
        });
      }
      setComments(fetchedComments);
      setCommentsLoading(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load community data";
      console.error("Error fetching community data:", err);
      setError(errorMessage);
      setParticipants([]);
      setParticipantCount(0);
      setComments([]);
      setCommentsLoading(false);
    } finally {
      setLoading(false);
    }
  }, [numericTrekId]);

  // Add Comment Function
  const addComment = useCallback(
    async (commentText: string): Promise<boolean> => {
      if (!numericTrekId || !commentText.trim() || !user) {
        toast({
          title: "Cannot add comment",
          description: "Missing information or not logged in.",
          variant: "destructive",
        });
        return false;
      }

      setSubmitting(true);
      let success = false;
      try {
        // Insert only comment_text
        // @ts-expect-error - Supabase insert type inference issue with trek_comments table
        const { data: rawCommentData, error } = await supabase
          .from("trek_comments")
          .insert({
            trek_id: numericTrekId,
            user_id: user.id,
            comment_text: commentText.trim(),
          })
          .select("comment_id, user_id, comment_text, created_at")
          .single();

        if (error) throw error;

        // Type assertion with unknown intermediate type for safety
        const newCommentData = rawCommentData as unknown as TrekComment;

        if (newCommentData) {
          // Use the updated Participant interface which uses 'id'
          const author = participants.find(
            (p) => p.id === newCommentData.user_id,
          ) ?? {
            id: newCommentData.user_id,
            name: "You",
            avatar: user?.user_metadata?.avatar_url || null,
            joinedAt: "",
          };

          // Get content only from comment_text
          const commentContent = newCommentData.comment_text || "";

          // Map to the Comment interface
          const formattedComment: Comment = {
            id: newCommentData.comment_id.toString(),
            userId: newCommentData.user_id,
            userName: author.name,
            userAvatar: author.avatar,
            content: commentContent,
            createdAt: newCommentData.created_at,
            isEventCreator: false,
          };
          setComments((prev) =>
            [...prev, formattedComment].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          );
          success = true;
        } else {
          console.error("Insert succeeded but no comment data returned.");
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to add comment";
        console.error("Error adding comment:", error);
        toast({
          title: "Error",
          description: `Failed to add comment: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
      return success;
    },
    [numericTrekId, user, participants],
  );

  useEffect(() => {
    if (trekId) {
      fetchCommunityData();
    }
  }, [trekId, fetchCommunityData]);

  return {
    participants,
    participantCount,
    comments,
    loading,
    commentsLoading,
    submitting,
    addComment,
    error,
  };
};
